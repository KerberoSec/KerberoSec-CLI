# Seal

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.10.10.250 |
| **Status** | Retired |

## Overview
Seal is a medium-difficulty Linux box built around an admin dashboard ("Seal Market") that is protected by mutual TLS-style authentication in front of a GitBucket (Bitbucket-like) Git server. A quirk in how Nginx normalizes request paths allows the authentication layer to be bypassed, exposing a Tomcat manager interface whose credentials are recovered from GitBucket commit history. Deploying a malicious WAR file through Tomcat manager provides a foothold, and lateral movement/root is achieved by abusing an Ansible playbook that runs periodically with elevated privileges.

## Reconnaissance
An nmap scan revealed three open ports:
```
22/tcp   open  ssh        OpenSSH 8.2p1 Ubuntu
443/tcp  open  ssl/http   nginx 1.18.0 (Ubuntu) - "Seal Market"
8080/tcp open  http-proxy (GitBucket / Jetty, JSESSIONID cookies)
```
The TLS certificate on port 443 confirmed the hostname `seal.htb`. Port 8080 fingerprinted as a Jetty-based service returning `JSESSIONID` cookies, later identified as GitBucket (a Bitbucket-style self-hosted Git service).

## Enumeration
- `seal.htb` (443) hosts "Seal Market" with a contact form containing a search bar that looked like a potential SQLi vector, and exposed staff usernames (`admin@seal.htb`, `luis@seal.htb`, `alex@seal.htb`).
- `seal.htb:8080` runs GitBucket. Registering an account and inspecting requests showed the only accepted upload-style servlet endpoints were things like `POST /file/:owner/:repository`, `POST /image`, `POST /tmp`, etc.: no direct arbitrary file upload was possible through the API alone.
- Reviewing a repository's commit history revealed a Tomcat `tomcat-users.xml`-style entry: a `tomcat` user with `manager-gui`/`admin-gui` roles and a password, which had been added and then removed in a later commit.
- `ffuf` against the site for Tomcat-related paths (`ffuf -k -u https://seal.htb/FUZZ -w tomcat.txt`) showed `manager`, `manager/jmxproxy`, and `host-manager` returning 401/403/302: the Tomcat Manager application was present but access-restricted, seemingly by an Nginx ACL in front of it.
- Bypassing the ACL: appending `/manager/jmxproxy/..;/html` to the request path exploited **CVE-2020-1935** (Apache Tomcat/Nginx path normalization mismatch), causing Nginx to allow the request through while Tomcat resolved it back to `/manager/html`, granting access to the Tomcat Manager with the leaked `tomcat` credentials.

## Foothold
With valid Tomcat Manager credentials and the ACL bypass, a WAR file (`shell.war`) containing a JSP/command webshell was generated with `msfvenom` and deployed through the manager interface using the same `..;/` normalization trick. The shell was triggered with:
```
curl -k "https://seal.htb/shell/"
```
while a listener caught the reverse connection:
```
nc -lvnp 1339
```
This produced a shell as the low-privileged `luis` user (`luis:x:1000:1000:,,,:/home/luis:/bin/bash`). A small helper (`test.py`, see `files/test.py`) automated uploading `rev.php` (see `files/rev.php`) to GitBucket's `/upload/tmp` endpoint during the earlier testing of the upload servlets.

## Privilege Escalation
Enumeration of the filesystem revealed credentials/config under `/opt/backups`, tied to a scheduled Ansible playbook (`run.yml`) that executed periodically inside the root user's context. The playbook could be abused to read/write arbitrary files as root while it ran (an arbitrary file read/write via the Ansible task), allowing extraction of a backup archive containing the root user's `id_rsa` private key. Once authenticated as root over SSH, `sudo -l` also confirmed root could run `ansible-playbook` without a password: a well-known **GTFOBins** privilege escalation vector, providing a redundant path to a root shell.

## Lessons Learned
- Reverse-proxy/backend path normalization mismatches (Nginx vs. Tomcat, CVE-2020-1935) can silently bypass access control lists placed in front of admin panels.
- Git commit history is a common place for credentials to leak, even after being "removed" in later commits.
- Scheduled automation (Ansible, cron, CI jobs) that runs with elevated privileges and touches attacker-writable directories is a frequent privilege escalation vector.

## Tools & References
- `ffuf`, `curl`, `msfvenom`, `nc`
- CVE-2020-1935 (Apache Tomcat / reverse-proxy path normalization ACL bypass)
- GTFOBins entry for `ansible-playbook` (sudo privilege escalation)
- `id_rsa` (root SSH private key recovered from an Ansible backup archive): omitted from repository for hygiene.
- `backup.tar.gz` (Ansible backup archive containing the leaked key): omitted; large loot archive, content described above.
- `shell.war` (msfvenom-generated Tomcat webshell payload): omitted; a compiled/packaged Java artifact, not source.
- `seal_market.wiki/` (a cloned GitBucket wiki repository, including its `.git` history): omitted; used only to review commit history for leaked Tomcat credentials, which are documented above.
- `files/dashboard/` (a locally saved copy of the admin dashboard static assets): omitted; not relevant to the exploitation path.
- `seal.htb.cert` (server TLS certificate): omitted; its subject (`CN=seal.htb`) is already captured in the nmap output.
