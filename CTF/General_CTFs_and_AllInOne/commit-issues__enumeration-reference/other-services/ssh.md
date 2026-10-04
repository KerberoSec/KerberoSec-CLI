# 🔐 SSH Enumeration

SSH (Secure Shell) is the standard protocol for remote access to servers and network devices. It's encrypted, widely used, and appears on almost every Linux and Unix system you'll encounter. When nmap finds port 22 open, there's always something worth checking.

---

## 🧠 What is SSH: Plain English

SSH is a protocol that lets you remotely control another computer through a terminal: securely. When a system administrator needs to manage a server that's physically in a data center across the country, they SSH into it. When you get a foothold on an HTB box, you often use SSH to get a stable shell.

Unlike FTP or Telnet, SSH encrypts everything: your credentials, your commands, and the responses. This makes it much harder to intercept than older protocols.

**Ports:**
- `22`: standard SSH port
- `2222`, `2022`, `222`: alternative ports sometimes used to avoid automated scanners

---

## 🔍 What to Enumerate on SSH

SSH itself doesn't give away a lot, but what it does expose is valuable:

**Version information:**
The SSH banner tells you the exact version of the SSH software running. Different versions have different vulnerabilities. OpenSSH 7.2, for example, has a username enumeration vulnerability.

**Authentication methods:**
SSH supports multiple authentication methods: password, public key, keyboard-interactive. Knowing which are enabled tells you what attack paths are available.

**Host keys:**
SSH host keys are fingerprints that identify the server. They can sometimes reveal information about the server's identity or configuration.

---

## 📦 Installation

SSH client is pre-installed on virtually every platform:
- **Linux/macOS:** Built in: just type `ssh`
- **Windows 10/11:** Built in: available in PowerShell and Command Prompt
- **Windows (older):** Download PuTTY from https://www.putty.org

---

## ⚙️ Basic SSH Commands
```bash
# Connect to SSH server
ssh user@<target>

# Connect on a non-standard port
ssh user@<target> -p 2222

# Connect with a private key
ssh -i id_rsa user@<target>

# Connect with verbose output: useful for debugging
ssh -v user@<target>

# Get SSH banner only: without connecting
ssh -v user@<target> 2>&1 | head -20
```

---

## 🔎 Version Detection & Banner Grabbing
```bash
# nmap version detection
nmap -sV -p 22 <target>

# Manual banner grab with netcat
nc <target> 22

# Manual banner grab with ssh
ssh user@<target> 2>&1 | head -5
```

The banner will look something like:
```
SSH-2.0-OpenSSH_7.9p1 Ubuntu-10
```

This tells you:
- Protocol version: SSH-2.0
- Software: OpenSSH
- Version: 7.9p1
- OS hint: Ubuntu

Take that version number and search it on https://exploit-db.com and https://nvd.nist.gov

---

## 🔑 SSH Key Files: What to Look For

When you find files during enumeration, SSH key files are high value targets:

| File | What it is |
|---|---|
| `id_rsa` | Private RSA key: use to authenticate as a user |
| `id_ed25519` | Private Ed25519 key: same use |
| `id_ecdsa` | Private ECDSA key: same use |
| `authorized_keys` | List of public keys allowed to log in |
| `.ssh/` | Directory containing all SSH keys and config |
| `known_hosts` | List of servers this user has connected to: reveals internal hostnames |

If you find a private key:
```bash
# Set correct permissions: SSH refuses keys with wrong permissions
chmod 600 id_rsa

# Use the key to connect
ssh -i id_rsa user@<target>

# If the key has a passphrase: crack it with john
ssh2john id_rsa > id_rsa.hash
john id_rsa.hash --wordlist=/usr/share/wordlists/rockyou.txt
```

---

## 👤 Username Enumeration

Some older versions of OpenSSH are vulnerable to username enumeration: you can determine whether a username exists on the system based on the server's response timing or error messages.

**Vulnerable versions:** OpenSSH < 7.7
```bash
# Check SSH version first
nmap -sV -p 22 <target>

# If vulnerable version: use this tool
# Install: pip3 install ssh-username-enum
ssh-username-enum -w /usr/share/seclists/Usernames/Names/names.txt <target>
```

---

## 🔒 nmap SSH Scripts
```bash
# Get host key and algorithms
nmap --script ssh-hostkey -p 22 <target>

# Check supported authentication methods
nmap --script ssh-auth-methods --script-args="ssh.user=root" -p 22 <target>

# Run all SSH scripts
nmap --script "ssh-*" -p 22 <target>
```

---

## 🔓 Default & Weak Credentials

If password authentication is enabled, always try common credentials:
```bash
# Manual attempt
ssh root@<target>
ssh admin@<target>

# Common passwords to try manually
# root / root
# root / toor
# admin / admin
# admin / password
# pi / raspberry (Raspberry Pi default)
```

For automated credential testing: use hydra or medusa, but check for account lockout first:
```bash
# hydra SSH brute force
hydra -l root -P /usr/share/wordlists/rockyou.txt ssh://<target>

# With username list
hydra -L users.txt -P passwords.txt ssh://<target>
```

> ⚠️ **Always check for account lockout before brute forcing**: locking out accounts on a real engagement is a critical mistake. On HTB boxes there's usually no lockout, but verify first.

---

## ⚔️ CTF vs Professional Use

| Situation | CTF | Professional Engagement |
|---|---|---|
| Version enumeration | Always | Always: document version |
| Default credentials | Try manually | Try manually: document if found |
| Brute force | If no lockout | Only if explicitly in scope |
| Private key found | Use it immediately | Use it: critical finding |
| Username enumeration | Use if old version | Document: medium finding |

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*