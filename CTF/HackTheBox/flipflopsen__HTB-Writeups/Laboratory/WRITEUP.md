# Laboratory

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.10.216 |
| **Status** | Retired |

## Overview
Laboratory is an easy-rated Linux machine centered on a self-hosted **GitLab** instance running inside Docker. GitLab Community Edition 12.8.1 is vulnerable to an authenticated arbitrary file read (CVE-2020-10977), which is chained with GitLab's Rails console access to read sensitive configuration and impersonate/reset the built-in admin account. From there, elevated GitLab permissions are used to grant a controlled account access to a private repository holding the user `dexter`'s SSH private key, yielding an SSH foothold. Root is obtained via a locally-installed setuid binary (`docker-security`) that can be abused through a `PATH` hijack of the `chmod` binary it invokes internally.

## Reconnaissance
`nmap -sC -sV` against `10.10.10.216` returned:

```
22/tcp  open  ssh      OpenSSH 8.2p1 Ubuntu 4ubuntu0.1 (Ubuntu Linux; protocol 2.0)
80/tcp  open  http     Apache httpd 2.4.41
|_http-title: Did not follow redirect to https://laboratory.htb/
443/tcp open  ssl/http Apache httpd 2.4.41 (Ubuntu)
|_http-title: The Laboratory
| ssl-cert: Subject: commonName=laboratory.htb
| Subject Alternative Name: DNS:git.laboratory.htb
```

The TLS certificate's Subject Alternative Name disclosed a second hostname, **`git.laboratory.htb`**, which (once added to `/etc/hosts`) resolved to a GitLab instance. A follow-up scan against that vhost showed the standard GitLab `robots.txt` disallow list and confirmed it redirects to `/users/sign_in`.

## Enumeration
The main site's page comments hinted at a possible username, `dexter`. Registration on GitLab was restricted to `@laboratory.htb` email addresses, but GitLab's registration flow did not actually verify mailbox ownership, so an account was created using an arbitrary `@laboratory.htb`-formatted address (`shori@laboratory.htb` / `lulz@laboratory.htb`). Enumerating the running instance identified **GitLab Community Edition 12.8.1**, a version affected by **CVE-2020-10977**: an authenticated arbitrary file read vulnerability in the file-preview/avatar functionality (public PoC: `https://github.com/thewhiteh4t/cve-2020-10977`).

## Foothold
Using the arbitrary file read (kept in this repo as `files/arbitfileread.py`) as an authenticated GitLab user, sensitive files readable by the `git` user but not world-readable were retrieved, including:

```
/var/opt/gitlab/gitlab-shell/config.yml
/var/opt/gitlab/gitlab-rails/etc/database.yml
/var/opt/gitlab/gitlab-rails/etc/gitlab.yml
```

The same file-read primitive (combined with GitLab's known `ExifTool`/file-read-to-RCE chain, e.g. via Metasploit's `gitlab_file_read_rce` module) was used to obtain execution inside the GitLab Docker container, confirming files such as `/etc/passwd` and service accounts (`gitlab-redis`, `gitlab-psql`, `gitlab-consul`, `mattermost`, `registry`).

With container access, GitLab's **Rails console** (`gitlab-rails console`) was reached, allowing direct manipulation of the application's database. Searching for the `dexter` user revealed their bcrypt password hash and account details, and the built-in `admin@example.com` account's password was reset directly through the console:

```ruby
u = User.where(id: 1).first
u.password = 'password'
u.save
```

Logging into GitLab as `admin@example.com:password` granted full administrative access. From here, a private repository (`securedocker/dexter`) was located containing `dexter`'s SSH private key (`.ssh/id_rsa`). After securing the key locally (`chmod 400`), SSH access was obtained:

```
ssh -i id_rsa dexter@10.10.10.216
```

This provided the initial shell and access to `user.txt`.

## Privilege Escalation
Local enumeration on the host identified an outdated Docker install and unattended-upgrades package, plus a notable setuid binary:

```
-rwsr-xr-x 1 root dexter 17K Aug 28 2020 /usr/local/bin/docker-security
```

Disassembly of `docker-security` showed it internally calls `chmod`/`setuid`/`setgid` logic (visible strings include `chmod 700 /usr/bin/docker` and `chmod 660 /var/run/docker.sock`) without specifying an absolute path for the `chmod` invocation it shells out to. This allowed a classic **`PATH` hijack**: a malicious `chmod` script was placed earlier in the `PATH` and the setuid binary was re-run so that it executed the attacker-controlled `chmod` (in this case simply launching `/bin/bash`) with root privileges:

```bash
cd /usr/local/bin
echo "/bin/bash" > /tmp/chmod
chmod 777 /tmp/chmod
export PATH=/tmp:$PATH
./docker-security
```

This produced a root shell and access to `/root/root.txt`.

## Lessons Learned
- SSL/TLS certificate Subject Alternative Names are a simple but effective way to enumerate hidden virtual hosts.
- Self-registration flows that don't verify mailbox ownership let attackers bypass "restricted domain" registration policies.
- Known CVEs in self-hosted GitLab instances (arbitrary file read, file-read-to-RCE chains) can cascade quickly into full administrative compromise once any authenticated access is available.
- Setuid binaries that shell out to other executables without fully-qualified paths are vulnerable to `PATH` hijacking: always use absolute paths (and a sanitized `PATH`) in privileged programs.

## Tools & References
- `nmap` (including SSL certificate inspection) for host/service and virtual-host discovery.
- `arbitfileread.py` (kept in `files/`): CVE-2020-10977 GitLab authenticated arbitrary file read PoC, originally by thewhiteh4t: `https://github.com/thewhiteh4t/cve-2020-10977`.
- Metasploit's `exploit/multi/http/gitlab_file_read_rce` module for file-read-to-RCE inside the GitLab container.
- GitLab Rails console (`gitlab-rails console`) for direct database/user manipulation.
- Manual binary analysis (`strings`/disassembly) and a `PATH`-hijack technique for the `docker-security` setuid privilege escalation.
- **Omitted from repository** (loot/large/binary: content described above):
  - `dexter_ssh`: the SSH private key for user `dexter`, recovered from the private `securedocker/dexter` GitLab repository; omitted for key hygiene, retrieval method documented above.
  - `os` and `files/docker-security`: compiled copies of the setuid `docker-security` ELF binary pulled from the target for offline analysis; its logic and the resulting PATH-hijack exploitation are summarized above.
  - `json` (~5.8 MB): a bulk JSON dump captured from the GitLab API during enumeration; omitted as a large, low-signal loot file with no content beyond what is already summarized in the Enumeration/Foothold sections.
  - `cert.pem`: the public TLS certificate for `laboratory.htb`/`git.laboratory.htb`, captured during recon; safe to omit as it contains no secret material and its relevant detail (the SAN entry) is documented above.
