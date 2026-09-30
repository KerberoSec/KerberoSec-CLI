---
tags: [ctf, recon, enumeration]
created: 2026-05-01
---

# 🔬 Service Enumeration: เจาะ enumerate แต่ละ service ลึก

หลังจาก [nmap scan](Active-Recon.md) เจอ port เปิดแล้ว ขั้นต่อไปคือ enum แต่ละ service

---

## Port 21: FTP

```bash
# Connect
ftp target.htb 21
# Try anonymous
Username: anonymous
Password: anonymous (หรือเว้นว่าง)

# Check version
nc target.htb 21
# Response: 220 vsFTPd 2.3.4 ← ลอง search exploit version นี้

# Nmap scripts
nmap --script ftp-* -p 21 target.htb

# Common scripts
ftp-anon       # anonymous login
ftp-bounce
ftp-syst
ftp-vsftpd-backdoor  # CVE-2011-2523 (vsftpd 2.3.4)
```

**Common attacks:**
- Anonymous login → upload/download
- Brute force credentials
- vsftpd 2.3.4 backdoor (smiley face `:)` ใน username → shell port 6200)

---

## Port 22: SSH

```bash
# Banner
nc target.htb 22
# SSH-2.0-OpenSSH_7.4

# User enumeration (CVE-2018-15473 ใน OpenSSH < 7.7)
python ssh-username-enum.py -u root target.htb

# Brute force (ระวัง: ใน CTF บางครั้งห้าม)
hydra -L users.txt -P passwords.txt ssh://target.htb
```

**Common attacks:**
- Default creds (`root:root`, `admin:admin`)
- SSH key หลุด (เจอใน github, ใน file system อื่น)
- User enumeration → targeted brute force

---

## Port 23: Telnet (rarely seen)

```bash
telnet target.htb 23
# มักไม่มี encryption: capture credentials ผ่าน MITM ได้
```

---

## Port 25 / 587: SMTP

```bash
nc target.htb 25
# Commands ที่ใช้ enum:
HELO test
VRFY root         # verify user
EXPN admin        # expand mailing list
RCPT TO:<root@>   # อีกวิธี enum

# Tools
smtp-user-enum -M VRFY -U users.txt -t target.htb
nmap --script smtp-* -p 25 target.htb
```

---

## Port 53: DNS

```bash
# Zone transfer (rarely works)
dig @target.htb domain.com AXFR
dnsenum --enum domain.com -f wordlist.txt

# Subdomain bruteforce
dnsrecon -d target.htb -t brt -D wordlist.txt
```

---

## Port 80 / 443 / 8080: HTTP(S) ⭐

```bash
# Basic info
curl -I http://target.htb        # headers
whatweb http://target.htb        # tech stack
nikto -h http://target.htb       # vuln scan

# Directory bruteforce
ffuf -u http://target.htb/FUZZ -w wordlist.txt -fc 404
gobuster dir -u http://target.htb -w wordlist.txt

# Subdomain bruteforce (vhost)
ffuf -u http://target.htb -H "Host: FUZZ.target.htb" -w subs.txt -fs <baseline>

# Crawl
katana -u http://target.htb -d 5 -jc
```

**Web checklist:**
- [ ] `/robots.txt`
- [ ] `/sitemap.xml`
- [ ] `/.git/` (git-dumper)
- [ ] `/.env`
- [ ] `/admin`, `/login`
- [ ] View source: comments, hidden inputs
- [ ] DevTools → Network: ดู request หลัง action
- [ ] Burp → Site map (auto build จาก browse)
- [ ] ลอง path traversal `/../`
- [ ] เปลี่ยน HTTP method (POST → GET, etc.)

ดูต่อใน [Web Exploitation](../03-Web-Exploitation/SQL-Injection.md)

---

## Port 110 / 143 / 993 / 995: POP3 / IMAP

```bash
nc target.htb 110
USER admin
PASS password

# IMAP
nc target.htb 143
LOGIN admin password

# Tools
nmap --script pop3-* -p 110 target.htb
```

---

## Port 111: RPCbind (NFS)

```bash
rpcinfo -p target.htb
showmount -e target.htb     # ดู NFS share

# Mount NFS
mkdir /mnt/nfs
mount -t nfs target.htb:/share /mnt/nfs
```

NFS ที่ตั้งค่าผิด → อ่าน/เขียน file ได้โดยไม่ต้อง auth

---

## Port 139 / 445: SMB ⭐

SMB เป็น service "ทอง" สำหรับ Windows enumeration

```bash
# List shares (anonymous/null session)
smbclient -L //target.htb -N
smbclient -L //target.htb -U guest

# Connect to share
smbclient //target.htb/share -N

# enum4linux ⭐ ตัวมาตรฐาน
enum4linux -a target.htb
enum4linux-ng -A target.htb     # version ใหม่กว่า

# Nmap
nmap --script smb-enum-*  -p 445 target.htb
nmap --script smb-vuln-*  -p 445 target.htb

# CrackMapExec / NetExec
nxc smb target.htb -u '' -p ''                  # null
nxc smb target.htb -u guest -p ''
nxc smb target.htb -u user -p pass --shares
nxc smb target.htb -u user -p pass --users
```

**Common SMB attacks:**
- Null session (no auth) → list shares + users
- EternalBlue (MS17-010): Windows 7/Server 2008
- SMB Relay
- Pass-the-Hash

---

## Port 161: SNMP (UDP!)

```bash
# Community string default: public, private
snmpwalk -v2c -c public target.htb
snmpwalk -v2c -c public target.htb 1.3.6.1.4.1.77.1.2.25  # Windows users

# Brute force community
onesixtyone -c communities.txt target.htb

# Tools
snmp-check target.htb -c public
```

**ทำไมสำคัญ:** SNMP มักเปิดทิ้งไว้ + community string = `public` → leak ทุกอย่าง (users, processes, software)

---

## Port 389 / 636: LDAP

```bash
# Anonymous bind
ldapsearch -x -H ldap://target.htb -s base namingcontexts
ldapsearch -x -H ldap://target.htb -b "dc=example,dc=com"

# Nmap
nmap --script ldap-* -p 389 target.htb

# Active Directory enum
nxc ldap target.htb -u '' -p ''
```

---

## Port 1433: MSSQL

```bash
# Connect
mssqlclient.py user@target.htb -windows-auth
mssqlclient.py user:pass@target.htb

# Nmap
nmap --script ms-sql-* --script-args mssql.username=sa,mssql.password=password -p 1433 target.htb

# CrackMapExec
nxc mssql target.htb -u sa -p password
```

---

## Port 3306: MySQL

```bash
mysql -h target.htb -u root -p
mysql -h target.htb -u root --skip-password   # ลอง no password

nmap --script mysql-* -p 3306 target.htb
```

---

## Port 3389: RDP

```bash
xfreerdp /v:target.htb /u:user /p:password
rdesktop -u user -p password target.htb

# Brute force
hydra -L users.txt -P pass.txt rdp://target.htb

# Tools
nmap --script rdp-* -p 3389 target.htb

# BlueKeep CVE-2019-0708
nmap --script rdp-vuln-ms12-020,rdp-enum-encryption -p 3389 target.htb
```

---

## Port 5432: PostgreSQL

```bash
psql -h target.htb -U postgres
nmap --script pgsql-* -p 5432 target.htb
```

---

## Port 5985 / 5986: WinRM

```bash
# Test
nxc winrm target.htb -u user -p pass

# Connect (evil-winrm) ⭐
evil-winrm -i target.htb -u user -p password
evil-winrm -i target.htb -u user -H <NTLM_hash>  # pass-the-hash
```

WinRM = "SSH ของ Windows": ถ้ามี cred + เปิด WinRM = shell ทันที

---

## Port 6379: Redis

```bash
redis-cli -h target.htb
> info
> keys *
> get <key>
> config get dir
> config get dbfilename

# Default ไม่มี auth! → write SSH key เพื่อ takeover (classic)
```

**Redis attack:**
1. `config set dir /root/.ssh/`
2. `config set dbfilename "authorized_keys"`
3. `set ssh-key "<your-pubkey>"`
4. `save`
5. SSH เข้าได้

---

## Port 27017: MongoDB

```bash
mongo target.htb:27017
> show dbs
> use <db>
> show collections
> db.users.find()
```

Default ไม่มี auth → ทุกอย่าง leak

---

## Port 8080 / 8443 / 8000 / 9090: Alt HTTP

ปฏิบัติเหมือน HTTP แต่ระวัง:
- 8080 มัก = Tomcat / Jenkins / proxy
- 8443 = HTTPS alt
- 9090 = Cockpit (Linux admin)
- 5000 = Flask default
- 3000 = Node.js / Grafana

---

## ใน /etc/hosts ของคุณ

หลังจาก scan เจอ vhost/subdomain ให้เพิ่มใน `/etc/hosts`:
```
10.10.10.123  target.htb admin.target.htb api.target.htb
```

ไม่งั้น browser/tool resolve ไม่ได้

---

## 📋 Enum Checklist (รวบยอด)

ทุก port ที่เปิด ทำดังนี้:

1. **Banner grab**: `nc target port`
2. **Version check**: `nmap -sV`
3. **Default scripts**: `nmap -sC`
4. **Vuln scripts**: `nmap --script vuln`
5. **Service-specific tool**: ตามตารางด้านบน
6. **Manual interaction**: connect ดูพฤติกรรม
7. **Try anonymous/default creds**
8. **Search exploit สำหรับ version นั้น**: `searchsploit <service> <version>`

```bash
# searchsploit
searchsploit vsftpd 2.3.4
searchsploit OpenSSH 7.2
```

---

## 🔗 ต่อไป

- มีเว็บแล้ว → [Web Exploitation](../03-Web-Exploitation/SQL-Injection.md)
- ก่อนหน้า [Active-Recon](Active-Recon.md)
- ก่อนหน้านี้นี้ [Passive-Recon](Passive-Recon.md)

---

#ctf #recon #enumeration
