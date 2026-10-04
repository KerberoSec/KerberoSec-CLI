---
tags: [ctf, cheatsheet, tool]
created: 2026-05-01
---

# 🛠 Tools Cheatsheet: คำสั่งของเครื่องมือต่างๆ

หน้านี้รวมคำสั่งสำคัญของ tool ที่ใช้บ่อย

---

## 🌐 Burp Suite

### Setup
1. Browser proxy → `127.0.0.1:8080`
2. Install Burp CA cert in browser (visit `http://burp` ตอน proxy ทำงาน)

### Shortcuts
- `Ctrl + R`: Send to Repeater
- `Ctrl + I`: Send to Intruder
- `Ctrl + Space`: Send (in Repeater)
- `Ctrl + F`: Forward (in Proxy intercept)

### Useful extensions
- **Logger++**: log ทุก request
- **Autorize**: auto detect IDOR (test with another session)
- **Param Miner**: discover hidden parameters
- **Active Scan++**: extend scanner
- **JWT Editor**: edit/sign JWTs
- **Turbo Intruder**: race conditions, fast fuzz
- **HTTP Smuggler**: smuggling tests

---

## 🔍 nmap

```bash
# Top 1000 ports + service detection + default scripts
nmap -sV -sC --top-ports 1000 target

# All ports fast
nmap -p- -T4 --min-rate=1000 target

# UDP top 20
sudo nmap -sU --top-ports 20 target

# Aggressive (sV + sC + OS + traceroute)
nmap -A target

# Save output (3 formats: .nmap, .gnmap, .xml)
nmap -oA scan_name target

# Specific scripts
nmap --script vuln target
nmap --script "http-*" -p 80 target
nmap --script smb-vuln* -p 445 target

# No ping (host blocks ICMP)
nmap -Pn target

# Stealthy SYN scan
sudo nmap -sS target

# OS detect
sudo nmap -O target
```

---

## 🌐 ffuf: Web Fuzzer

```bash
# Directory bruteforce
ffuf -u http://target/FUZZ -w wordlist.txt -fc 404

# With extensions
ffuf -u http://target/FUZZ -w wordlist.txt -e .php,.html,.txt -fc 404

# Filter by size (ตัด baseline)
ffuf -u http://target/FUZZ -w wordlist.txt -fs 1234

# Subdomain (vhost)
ffuf -u http://target -H "Host: FUZZ.target" -w subs.txt -fs <baseline>

# Parameter discovery
ffuf -u http://target/page?FUZZ=test -w params.txt -fs 0

# POST fuzz
ffuf -u http://target/login -X POST -d "user=admin&pass=FUZZ" -w pass.txt -fc 401

# Multiple positions
ffuf -u http://target/W1 -w users.txt:W1 -w pass.txt:W2 -X POST -d "user=W1&pass=W2"

# Rate limit
ffuf -u http://target/FUZZ -w wordlist.txt -rate 100

# Output JSON
ffuf -u http://target/FUZZ -w wordlist.txt -o results.json -of json
```

---

## 🌐 gobuster

```bash
gobuster dir -u http://target -w wordlist.txt
gobuster dir -u http://target -w wordlist.txt -x php,html,txt
gobuster dns -d target.com -w subdomains.txt
gobuster vhost -u http://target -w subs.txt
gobuster fuzz -u http://target/?FUZZ=value -w params.txt
```

---

## 💉 sqlmap

```bash
# Basic
sqlmap -u "http://target/page?id=1" --batch

# POST data
sqlmap -u "http://target/login" --data="user=admin&pass=admin" --batch

# Cookie auth
sqlmap -u "http://target/page?id=1" --cookie="PHPSESSID=abc"

# จาก Burp request file
sqlmap -r request.txt --batch

# Specific param
sqlmap -u "http://target/page?id=1&name=test" -p id

# Get DB info
sqlmap ... --dbs                            # databases
sqlmap ... -D db --tables                   # tables
sqlmap ... -D db -T users --columns
sqlmap ... -D db -T users --dump            # dump table

# OS shell
sqlmap ... --os-shell

# Tamper scripts (WAF bypass)
sqlmap ... --tamper=space2comment,between

# DBMS specific
sqlmap ... --dbms=mysql

# Level/Risk (deeper test)
sqlmap ... --level=5 --risk=3
```

---

## 🔑 hashcat

```bash
# Common modes
hashcat -m 0     hash.txt rockyou.txt        # MD5
hashcat -m 100   hash.txt rockyou.txt        # SHA1
hashcat -m 1400  hash.txt rockyou.txt        # SHA256
hashcat -m 1700  hash.txt rockyou.txt        # SHA512
hashcat -m 1000  hash.txt rockyou.txt        # NTLM
hashcat -m 5600  hash.txt rockyou.txt        # NetNTLMv2
hashcat -m 3200  hash.txt rockyou.txt        # bcrypt
hashcat -m 22000 hash.txt rockyou.txt        # WPA-PBKDF2
hashcat -m 13100 hash.txt rockyou.txt        # Kerberoast
hashcat -m 18200 hash.txt rockyou.txt        # AS-REP roast
hashcat -m 16500 hash.txt rockyou.txt        # JWT

# Attack modes
-a 0    # Wordlist
-a 1    # Combinator
-a 3    # Mask (brute)
-a 6    # Hybrid wordlist + mask
-a 7    # Hybrid mask + wordlist

# Mask charsets
?l = a-z, ?u = A-Z, ?d = 0-9, ?s = !@#$%, ?a = all printable

# Examples
hashcat -m 0 -a 3 hash.txt ?l?l?l?l?l?d?d        # 5 lower + 2 digits
hashcat -m 0 -a 3 hash.txt password?d?d?d        # password XXX
hashcat -m 0 -a 0 hash.txt rockyou.txt -r best64.rule

# Show cracked
hashcat -m 0 hash.txt --show

# Status
hashcat -m 0 hash.txt rockyou.txt --status

# Speed test
hashcat -b -m 0
```

---

## 🔑 john

```bash
# Wordlist
john --wordlist=rockyou.txt hash.txt

# Format detect
john hash.txt
john --list=formats | grep -i sha

# Specific format
john --format=raw-md5 --wordlist=rockyou.txt hash.txt
john --format=NT --wordlist=rockyou.txt hash.txt

# Mask (brute with pattern)
john --mask='?l?l?l?l?d?d' hash.txt

# Show cracked
john --show hash.txt

# *2john tools
zip2john file.zip > hash.txt
rar2john file.rar > hash.txt
ssh2john id_rsa > hash.txt
keepass2john file.kdbx > hash.txt
office2john file.docx > hash.txt
pdf2john.pl file.pdf > hash.txt
7z2hashcat 7zfile.7z > hash.txt
```

---

## 🐧 enum4linux / enum4linux-ng

```bash
enum4linux -a target              # all
enum4linux-ng -A target           # newer

# Specific
enum4linux -U target              # users
enum4linux -S target              # shares
enum4linux -P target              # password policy
enum4linux -G target              # groups
```

---

## 🐧 SMB tools

```bash
# List shares
smbclient -L //target -N
smbclient -L //target -U guest

# Connect
smbclient //target/share -N
smbclient //target/share -U user

# Inside smbclient
> dir
> get file.txt
> put file.txt

# nmblookup
nmblookup -A target

# rpcclient
rpcclient -U "" -N target
> enumdomusers
> querydominfo

# CrackMapExec / NetExec
nxc smb target -u '' -p ''                    # null session
nxc smb target -u guest -p ''
nxc smb target -u user -p pass --shares       # list shares
nxc smb target -u user -p pass --users        # list users
nxc smb target -u user -p pass --pass-pol     # password policy
nxc smb target -u user -H <NTLM_hash>          # pass-the-hash

# smbmap
smbmap -H target -u guest
smbmap -H target -u user -p pass

# Mount
mkdir /mnt/smb
mount -t cifs //target/share /mnt/smb -o user=guest

# Impacket
psexec.py user:pass@target
smbexec.py user:pass@target
wmiexec.py user:pass@target
secretsdump.py user:pass@target
```

---

## 🐧 evil-winrm (Windows shell)

```bash
evil-winrm -i target -u user -p password
evil-winrm -i target -u user -H <NTLM_hash>

# Inside
> upload file.exe
> download remote_file
> Invoke-Binary <path>
> menu                  # show all options
```

---

## 🐍 pwntools (Python)

```python
from pwn import *

# Connection
io = remote('target', 1337)
io = process('./binary')                 # local
io = ssh(host='target', user='ctf', password='pass').process('./binary')

# I/O
io.send(b'data')
io.sendline(b'data')
io.recv(100)
io.recvline()
io.recvuntil(b'> ')
io.interactive()                          # become user

# Pack
p32(0xdeadbeef)                           # → b'\xef\xbe\xad\xde'
p64(0xdeadbeef)
u32(b'\xef\xbe\xad\xde')                  # → 0xdeadbeef
u64(b'...........')

# Context
context.arch = 'amd64'
context.log_level = 'debug'
context.binary = './binary'

# ELF
elf = ELF('./binary')
elf.symbols['main']
elf.got['puts']
elf.plt['puts']

# Cyclic pattern (find offset)
cyclic(100)                               # generate
cyclic_find(0x6161616c)                   # find offset

# ROP
rop = ROP(elf)
rop.call('puts', [elf.got['puts']])
rop.call('main')
print(rop.dump())
```

---

## 🔬 Ghidra

### Shortcuts
- `G`: Go to address
- `L`: Rename
- `T`: Set data type
- `;`: Add comment
- `Ctrl+L`: Retype variable
- `F`: Decompile current function
- `B`: Toggle bookmark

### Useful actions
- File → Auto Analyze
- Search → For Strings
- Window → Function Graph
- Window → Symbol Tree

---

## 🔬 gdb + pwndbg/gef

```bash
# After install pwndbg/gef
gdb ./binary
gdb -p <pid>

# Common commands
> b main                    # breakpoint at main
> b *0x401234               # break at address
> info b                    # list breakpoints
> r                         # run
> c                         # continue
> n                         # next (over)
> s                         # step (into)
> ni / si                   # next/step instruction

# Inspect
> info registers
> x/10wx $rsp               # examine stack
> x/s 0x401234              # string at addr
> x/i 0x401234              # instruction
> bt                        # backtrace

# pwndbg-specific
> checksec
> got                       # GOT entries
> plt                       # PLT entries
> rop                       # search ROP gadgets
> cyclic 100                # generate pattern
> cyclic -l 0x6161616c      # find offset

# Set
> set $rip = 0x401234
> set *(int*)0x601020 = 1

# Disassemble
> disas main
> disas /r main             # raw bytes
```

---

## 🔧 Volatility 3 (memory forensics)

```bash
# Install
pip install volatility3

# Basic
vol -f mem.raw windows.info
vol -f mem.raw windows.pslist
vol -f mem.raw windows.pstree
vol -f mem.raw windows.cmdline
vol -f mem.raw windows.netstat

# Strings
vol -f mem.raw windows.dumpfiles --pid 1234
vol -f mem.raw windows.handles --pid 1234

# Registry
vol -f mem.raw windows.registry.printkey --key "Software\Microsoft"
vol -f mem.raw windows.registry.hashdump          # dump password hashes

# Process info
vol -f mem.raw windows.malfind                    # injected code
vol -f mem.raw windows.dlllist --pid 1234

# Linux
vol -f mem.raw linux.bash                         # bash history
vol -f mem.raw linux.pslist
```

---

## 📷 Steganography Tools

```bash
# steghide
steghide info file.jpg
steghide extract -sf file.jpg                    # ใส่ password

# Brute
stegseek file.jpg rockyou.txt

# zsteg (PNG/BMP)
zsteg -a file.png

# Image
exiftool image.jpg
binwalk image.png
binwalk -e image.png                              # extract embedded

# Strings
strings file | grep -i flag

# Audio
sonic-visualiser file.wav                         # spectrogram

# Online
# aperisolve.com
# stegonline.georgeom.net
# futureboy.us/stegano (decode steghide w/ password)

# StegOnline ⭐
# https://stegonline.georgeom.net
```

---

## 🌐 curl tricks

```bash
# Save cookies, use cookies
curl -c cookies.txt http://target
curl -b cookies.txt http://target/private

# POST
curl -X POST -d "user=admin" http://target
curl -X POST -d '{"a":1}' -H "Content-Type: application/json" http://target

# Headers
curl -H "Authorization: Bearer token" http://target
curl -H "X-Forwarded-For: 127.0.0.1" http://target

# Follow redirect
curl -L http://target

# Verbose / show headers
curl -v http://target
curl -I http://target                             # HEAD only

# Upload file
curl -F "file=@local.txt" http://target/upload

# Custom user agent
curl -A "Mozilla/5.0..." http://target

# Resolve trick (force IP)
curl --resolve target.com:80:1.2.3.4 http://target.com
```

---

## 🐍 Python one-liners

```bash
# HTTP server
python3 -m http.server 8000

# SMB server (with impacket)
smbserver.py share .

# SimpleHTTPServer with directory
python3 -m http.server 8000 --directory /tmp

# Run CGI
python3 -m http.server --cgi 8000

# Pretty JSON
echo '{"a":1}' | python3 -m json.tool

# Base64
python3 -c "import base64; print(base64.b64encode(b'hello'))"
python3 -c "import base64; print(base64.b64decode(b'aGVsbG8='))"

# URL encode
python3 -c "import urllib.parse; print(urllib.parse.quote('hello world'))"
```

---

## 🧪 Misc useful

```bash
# Hex dump
xxd file
xxd file | head
xxd -r hex.txt > binary       # reverse

# String search
strings file | grep -i flag

# File type
file mystery.bin

# Carve embedded
binwalk -e file
foremost file
scalpel file

# Compare
diff -u file1 file2
vimdiff file1 file2
cmp file1 file2

# rev (reverse string)
echo "hello" | rev            # → olleh

# tr
echo "ABC" | tr 'A-Z' 'a-z'   # lowercase

# base64
echo "hello" | base64
echo "aGVsbG8K" | base64 -d

# url
echo "hello world" | jq -sRr @uri

# md5/sha
md5sum file
sha256sum file

# Generate password
openssl rand -hex 16
openssl rand -base64 32
```

---

## 🎙 Discord/IRC for CTF teams

- **CTFd**: platform that most CTFs use
- **CTFtime.org**: schedule + writeups
- **DEFCON Discord**: many teams hang out

---

## 🔗 Vault Links

- [Master Index](../00-START-HERE.md)
- [Quick-Reference](Quick-Reference.md)
- [../01-Fundamentals/Tools-Setup](../01-Fundamentals/Tools-Setup.md)

---

#ctf #cheatsheet #tool
