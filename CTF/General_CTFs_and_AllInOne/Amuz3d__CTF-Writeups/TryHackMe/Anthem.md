# CTF: Anthem (THM)

## Metadata

- **Target IP:** 10.49.188.68
    
- **OS:** Windows Server 2019 / Windows 10
    
- **Difficulty:** Easy
    
- **Date:** 2026-02-23
    
- **Key Skills/Tools:** Nmap, Gobuster, OSINT (Credential Guessing), RDP, Windows File Permissions (`icacls`), Umbraco CMS.
    

---

## Reconnaissance

### Port Scanning

The scan revealed a typical Windows web server setup with RDP exposed for remote management.

Bash

```
nmap -Pn -A $target
```

**Key Ports:**

- **80/tcp:** Microsoft HTTPAPI httpd 2.0 (Umbraco CMS)
    
- **3389/tcp:** Microsoft Terminal Services (RDP)
    

### Web Enumeration

`robots.txt` contained a specific string that looked like a password candidate: `UmbracoIsTheBest!`. It also pointed to the `/umbraco/` login portal.

Directory brute-forcing with `gobuster` confirmed the presence of a blog and author pages:

Bash

```
gobuster dir -u http://$target -w /usr/share/wordlists/dirb/big.txt -x php,txt,bak,zip,aspx
```

- **Found:** `/authors/`, `/blog/`, `/umbraco/`
    

---

## Credential Cracking

### OSINT & Email Guessing

By analyzing the blog posts, I found a post regarding a "beloved admin" who redesigned the site. The post included a famous poem:

> "Solomon Grundy, Born on a Monday..."

Following the email format identified from another author (Jane Doe $\rightarrow$ `jd@anthem.com`), I deduced the admin's credentials:

- **User:** `sg@anthem.com`
    
- **Password:** `UmbracoIsTheBest!` (found in `robots.txt`)
    

---

## Foothold

### RDP Access

Using the guessed credentials, I established an RDP session to the target machine.

Bash

```
xfreerdp3 /u:sg@anthem.com /p:UmbracoIsTheBest! /v:$target
```

Upon logging in, I located the user flag on the desktop.

---

## Lateral Movement

_No lateral movement between users was required to reach the escalation phase._

---

## Privilege Escalation

### Hidden Backup Discovery

While enumerating the filesystem, I looked for hidden files and directories in the root of `C:\`.

PowerShell

```
Get-ChildItem -Path C:\ -Hidden
```

I discovered a hidden directory named `C:\backup`. Inside, there was a file named `restore.txt`.

### Permission Manipulation

Initially, I did not have permissions to read `restore.txt`. However, my current user had the rights to modify the file's Access Control List (ACL). I granted myself full control:

1. Right-click `restore.txt` $\rightarrow$ Properties $\rightarrow$ Security.
    
2. Grant `SG` (current user) Full Control.
    
3. Open the file to reveal the Administrator password: `ChangeMeBaby1MoreTime`.
    

### Root Access

I re-authenticated via RDP using the `Administrator` account and the newly discovered password to collect the final flag.

---

## Flags

|**Flag Type**|**Value**|
|---|---|
|**User**|THM{N00T_NO0T}|
|**Root**|THM{Y0U_4R3_1337}|

---

Modifying permissions on a file you're "not supposed" to see is a classic configuration weakness. It’s a reminder that even if a file is restricted, if the folder permissions allow you to change the ownership or ACLs, the restriction is effectively meaningless.
