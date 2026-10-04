# Bolt

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.10.11.114 |
| **Status** | Retired |

## Overview
Bolt is a medium Linux machine built around a custom "starter website" application that distributes a Docker image containing its own source and a deleted-but-recoverable SQLite database. Digging through the image's layered filesystem recovers leaked application credentials and a hidden invite code, which are used to register on a `demo` virtual host. That demo application is vulnerable to Server-Side Template Injection (SSTI), giving remote code execution. From there, Passbolt's configuration on the box reveals database credentials that allow lateral movement and, ultimately, root access.

## Reconnaissance
`nmap -sC -sV -A -oN nmap/initial passbolt.bolt.htb` against 10.10.11.114 showed:

```
22/tcp  open  ssh      OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp  open  http     nginx 1.18.0 (Ubuntu)          -> "Starter Website - About"
443/tcp open  ssl/http nginx 1.18.0 (Ubuntu)          -> Passbolt password manager
```

The TLS certificate on 443 named `passbolt.bolt.htb`, and adding `bolt.htb` / `passbolt.bolt.htb` to `/etc/hosts` exposed a self-hosted Passbolt instance behind an nginx front end.

## Enumeration
A gobuster virtual-host scan against `bolt.htb` uncovered additional hostnames not shown by default:

```
Found: mail.bolt.htb (Status: 200) [Size: 4943]
Found: demo.bolt.htb (Status: 302) [Size: 219]
```

The main `bolt.htb` site exposed a Docker image file (`image.tar`) for its own "starter website" application. Extracting and walking through the image's layered filesystem (a full Alpine-based layer set, including deleted-file remnants) revealed:
- A recoverable SQLite database file, from which application credentials could be extracted.
- A Flask/Jinja registration route in `templates/accounts/register.html`, showing the registration flow validated an `invite_code` form field:
  ```python
  username  = request.form['username']
  email     = request.form['email']
  code      = request.form['invite_code']
  if code != 'XNSS-HSJW-3NGU-8XTJ':
  ```
  giving the exact invite code required to register on `demo.bolt.htb`.
- A hashed admin credential for the main site, `admin:admin@bolt.htb:$1$sm1RceCh$rSd3PygnS/6jlFDfF2J5q.`, which cracked to the password `deadbolt` (allowing login to `bolt.htb` as `admin`).

## Foothold
Using the recovered invite code (`XNSS-HSJW-3NGU-8XTJ`), an account was registered on `demo.bolt.htb` (e.g. `rsff / lol123 / rsff@bolt.htb`). The demo application reflects user-supplied template input and is vulnerable to **Server-Side Template Injection (SSTI)** in its Flask/Jinja2 templating layer. Crafting an SSTI payload in a field processed by the demo app's templating engine (in the style of the classic `{{ self.__init__.__globals__.__builtins__ ... }}` Jinja2 RCE gadget chain) achieved arbitrary command execution, providing an initial shell on the box.

## Privilege Escalation
With a foothold shell, the locally-installed **Passbolt** application (seen on port 443) was inspected. Passbolt's PHP configuration files include database connection settings; reading these disclosed working MySQL credentials for the box. These credentials were reused to authenticate to the database and, ultimately (per the box's intended path), to move laterally to another local user and recover the information needed to escalate to root: consistent with HTB's official synopsis describing recovery of the root password via Passbolt's own secret storage/configuration once database access is obtained.

*Note: local notes captured the recon, credential-recovery and SSTI-relevant findings in detail, but did not retain a full command transcript of the final Passbolt-to-root pivot; that stage is summarized here from the official machine description rather than fabricated.*

## Lessons Learned
- Never ship a Docker image containing deleted-but-still-present database files or hardcoded invite codes/secrets: deleted files remain recoverable from earlier image layers.
- Always validate and escape user input before rendering it through a server-side template engine; SSTI is trivially RCE in Flask/Jinja2 apps.
- Password manager deployments (like Passbolt) still depend on the security of their underlying host and database credentials: protect application configuration files containing DB secrets.

## Tools & References
- `nmap`, `gobuster` (vhost mode) for recon and virtual host discovery.
- Manual Docker image layer analysis (`docker save`/`tar`/`skopeo` style extraction) to recover deleted SQLite data and leaked source templates.
- `hashcat`/`john` to crack the recovered `$1$` (MD5-crypt) admin hash.
- SSTI (Jinja2) exploitation technique for the `demo.bolt.htb` registration app.
- [Passbolt](https://www.passbolt.com/): open-source password manager, the target application whose local configuration led to lateral movement.
- `Files/image.tar` and the fully-extracted Docker image filesystem (~540MB across 16,000+ files, including named extraction folders `apk/`, `invite-code/`, `sqlite3db/`, `layer/`, `no74/`, `systemBusybox/`, `systemFiles/`): omitted from the repository as bulky binary/layer data; the specific credentials, invite code, and template snippet recovered from it are reproduced above.
- Empty `Code/` folder from the original archive: removed as it held no content.
