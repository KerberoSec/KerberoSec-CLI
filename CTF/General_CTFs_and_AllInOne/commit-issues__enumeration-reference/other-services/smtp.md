# 📧 SMTP Enumeration
## 📋 Contents

- [What is SMTP: Plain English](#-what-is-smtp--plain-english)
- [What You're Looking For](#-what-youre-looking-for)
- [Banner Grabbing: Start Here](#-banner-grabbing--start-here)
- [User Enumeration: The Main Event](#-user-enumeration--the-main-event)
- [Testing for Open Relay](#-testing-for-open-relay)
- [nmap SMTP Scripts](#-nmap-smtp-scripts)
- [Reading SMTP Response Codes](#️-reading-smtp-response-codes)
- [Recommended SMTP Enumeration Workflow](#-recommended-smtp-enumeration-workflow)
- [CTF vs Professional Use](#️-ctf-vs-professional-use)

---

SMTP (Simple Mail Transfer Protocol) is the protocol that sends email. It runs on port 25 and is present on almost every server that handles email. Most people walk right past it during enumeration: which is exactly why it's worth stopping for. SMTP frequently exposes valid usernames, and valid usernames are the first step toward credential attacks.

---

## 🧠 What is SMTP: Plain English

SMTP is the postal service of the internet. When you send an email, your email client hands it to an SMTP server, which figures out where it's going and delivers it: passing it along from server to server until it reaches the destination mail server.

Think of it like dropping a letter at the post office. You hand it to the clerk (SMTP server), they look at the address, figure out which sorting facility handles that zip code, and route it accordingly. The recipient picks it up from their mailbox (POP3 or IMAP).

**Why it matters in enumeration:** SMTP servers often respond differently to valid versus invalid email addresses and usernames. That difference in response: even a fraction of a second of timing difference: can tell you whether a user account exists on the system. This is called **user enumeration** and it's one of the most underutilized techniques in CTF and real engagements.

**Ports:**
- `25`: SMTP (server to server, also open relay testing)
- `465`: SMTPS (SMTP over SSL)
- `587`: SMTP submission (client to server, authenticated)

---

## 🔍 What You're Looking For

**Valid usernames**: the primary goal of SMTP enumeration. A list of valid usernames can be used for:
- Password spraying against SSH, SMB, web login pages
- Phishing attacks in real engagements
- Brute force attacks

**Open relay**: an SMTP server that will forward email for anyone, to anyone. A critical misconfiguration in real engagements. Can be used to send spoofed emails appearing to come from the target organization.

**Software version**: the SMTP banner reveals the mail server software and version. Searchable for CVEs.

**Internal hostnames**: SMTP servers often reveal internal hostnames and domain structure in their responses.

---

## 📦 Installation

**Linux/macOS:** Most tools pre-installed on Kali
```bash
# Install smtp-user-enum if not present
sudo apt install smtp-user-enum

# Install swaks for SMTP testing
sudo apt install swaks
```

**Windows:**
- Download smtp-user-enum: https://github.com/cytopia/smtp-user-enum
- Download swaks: https://jetmore.org/john/code/swaks/

---

## 🔎 Banner Grabbing: Start Here
```bash
# Manual banner grab with netcat
nc <target> 25

# With nmap
nmap -sV -p 25 <target>

# nmap SMTP scripts
nmap --script smtp-commands,smtp-enum-users,smtp-open-relay -p 25 <target>
```

The banner looks like:
```
220 mail.example.com ESMTP Postfix (Ubuntu)
```

This tells you:
- The hostname: `mail.example.com`
- The software: Postfix
- The OS hint: Ubuntu

---

## 👤 User Enumeration: The Main Event

SMTP has three commands that can be used for user enumeration:

| Command | What it does |
|---|---|
| `VRFY` | Asks the server to verify if a username exists |
| `EXPN` | Asks the server to expand a mailing list: reveals members |
| `RCPT TO` | Attempts to send mail to an address: response reveals if user exists |

**Manual enumeration with netcat:**
```bash
# Connect to SMTP
nc <target> 25

# Wait for banner, then try VRFY
VRFY root
VRFY admin
VRFY john

# Valid user response:
252 2.0.0 root

# Invalid user response:
550 5.1.1 root... User unknown
```

**Automated enumeration with smtp-user-enum:**
```bash
# VRFY method
smtp-user-enum -M VRFY -U /usr/share/seclists/Usernames/Names/names.txt -t <target>

# RCPT method: works when VRFY is disabled
smtp-user-enum -M RCPT -U /usr/share/seclists/Usernames/Names/names.txt -t <target> -D example.com

# EXPN method
smtp-user-enum -M EXPN -U /usr/share/seclists/Usernames/Names/names.txt -t <target>

# Save output
smtp-user-enum -M VRFY -U /usr/share/seclists/Usernames/Names/names.txt -t <target> -o smtp-users.txt
```

> 💡 **If VRFY is disabled try RCPT**: many administrators disable VRFY but forget about RCPT. Try all three methods if one doesn't work.

---

## 📬 Testing for Open Relay

An open relay SMTP server will forward email for anyone: meaning you can send email that appears to come from any address. This is a critical misconfiguration.

```bash
# Test with nmap: cleanest method
nmap --script smtp-open-relay -p 25 <target>

# Manual test with netcat
nc <target> 25
EHLO test.com
MAIL FROM: <test@test.com>
RCPT TO: <external@gmail.com>
DATA
Subject: Test
This is a test.
.
QUIT
```

If the server responds with `250` to `RCPT TO` for an external address: it's an open relay. It will forward email on behalf of anyone with no restrictions. This means spoofed emails can be sent appearing to originate from any address at the target organization. In a real engagement this demonstrates phishing risk: spoofed executive or IT emails are trivial to craft. In CTF it's rarely the path to foothold but always worth documenting. The nmap `smtp-open-relay` script above automates this check and is cleaner than doing it manually.

---

## 🔎 nmap SMTP Scripts
```bash
# Get all supported SMTP commands
nmap --script smtp-commands -p 25 <target>

# User enumeration via nmap
nmap --script smtp-enum-users -p 25 <target>

# Check for open relay
nmap --script smtp-open-relay -p 25 <target>

# Run all SMTP scripts
nmap --script "smtp-*" -p 25 <target>

# Check NTLM info leakage: reveals internal domain info on Windows mail servers
nmap --script smtp-ntlm-info -p 25 <target>
```

---

## 🖥️ Reading SMTP Response Codes

When you interact with an SMTP server manually, the response codes tell you what happened:

| Code | Meaning |
|---|---|
| `220` | Server ready: you'll see this on connection |
| `250` | Requested action completed: command succeeded |
| `252` | Cannot verify user but will attempt delivery: user likely exists |
| `354` | Start mail input: server is ready to receive message body |
| `421` | Service not available |
| `450` | Mailbox unavailable |
| `500` | Syntax error: command not recognized |
| `550` | Mailbox unavailable: user does not exist |
| `551` | User not local |
| `553` | Mailbox name not allowed |

The ones you care most about during user enumeration are `250`/`252` (user exists) versus `550` (user doesn't exist).

---

## 🔄 Recommended SMTP Enumeration Workflow
```bash
# Step 1: banner grab and version detection
nmap -sV -p 25 <target>
nc <target> 25

# Step 2: get all supported commands
nmap --script smtp-commands -p 25 <target>

# Step 3: user enumeration: try all three methods
smtp-user-enum -M VRFY -U /usr/share/seclists/Usernames/Names/names.txt -t <target>
smtp-user-enum -M RCPT -U /usr/share/seclists/Usernames/Names/names.txt -t <target> -D example.com
smtp-user-enum -M EXPN -U /usr/share/seclists/Usernames/Names/names.txt -t <target>

# Step 4: check for open relay
nmap --script smtp-open-relay -p 25 <target>

# Step 5: check for NTLM info leak on Windows targets
nmap --script smtp-ntlm-info -p 25 <target>
```

---

## ⚔️ CTF vs Professional Use

| Situation | CTF | Professional Engagement |
|---|---|---|
| User enumeration | Run all three methods | Run all three: document valid users found |
| Open relay | Note it: usually not the path | Critical finding: document fully |
| Version enumeration | Always | Always: CVE research |
| Sending test emails | Fine in CTF | Only if explicitly in scope |
| Brute force with found users | Yes: feed into other services | Check scope and lockout policy |

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*