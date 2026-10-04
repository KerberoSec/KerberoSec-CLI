> **Platform:** TryHackMe
>
> **Room:** Lo-Fi
>
> **Category:** Web / LFI
>
> **Tools Used:** Nmap, Gobuster, FFUF, Web Browser

---

# Lo-Fi
**Date:** 2026-04-11

# Description

> **Room Briefing:**
> 
> Want to hear some lo-fi beats, to relax or study to? We've got you covered!
>
> Access this challenge by deploying both the vulnerable machine by pressing the green "Start Lab Machine" button located within this task, and the TryHackMe AttackBox by pressing the "Start AttackBox" button located at the top-right of the page.
> 

---

## 1. Scope and Objectives

The objective of this room was to access the vulnerable web server and find the flag located in the root filesystem.

The main goals were:

- Identify open ports and services.
- Enumerate the web server.
- Look for hidden files or directories.
- Identify possible vulnerabilities in the web application.
- Exploit the vulnerability found.
- Read the `flag.txt` file.

The testing was performed only against the machine provided by TryHackMe.

---

# 2. Methodology

For this room, I followed a simple penetration testing process:

1. **Reconnaissance:** Identify open ports and services.
2. **Enumeration:** Investigate the web server and application.
3. **Vulnerability Discovery:** Look for interesting files, parameters, and possible vulnerabilities.
4. **Exploitation:** Test and exploit the vulnerability found.
5. **Post-Exploitation:** Use the access obtained to find the flag.

The main tools I used were:

- Nmap
- Gobuster
- FFUF
- Web browser

---

## 2.1 Reconnaissance

I started with an Nmap scan to identify the open ports and services.

```bash
sudo nmap -sS -sV -p- TARGET-IP
```

The scan found:

```text
22/tcp  open  ssh
80/tcp  open  http  Apache
```

Port 22 was running SSH, but since the main objective of the room was related to the web application, I focused on port 80.

I opened the website in the browser:

```text
http://TARGET-IP
```

The website was a simple Lo-Fi music page with a YouTube video embedded.

---

## 2.2 Web Enumeration

I first checked the source code of the page to see if there was anything interesting.

I didn't find any obvious credentials, comments, flags, or other useful information.

One thing I noticed was that the website was using PHP pages.

I then tried directory enumeration with Gobuster:

```bash
gobuster dir -u http://TARGET-IP -w wordlist.txt
```

However, Gobuster didn't return anything useful.

At this point, I decided to try a different approach instead of only looking for directories.

---

## 2.3 Fuzzing with FFUF

I used FFUF to fuzz the web application:

```bash
ffuf -w lfi_wordlist.txt -u http://TARGET-IP -fs 0
```

The interesting result was related to:

```text
/etc/passwd
```

This immediately caught my attention because '/etc/passwd' is a Linux file containing information about users on the system.

I tested whether I could actually read it through the web application.

The response contained entries such as:

```text
root
daemon
bin
```

This indicated that the application was allowing me to read files from the server.

At this point, I suspected that the application was vulnerable to **Local File Inclusion (LFI)**.

---

## 2.4 Testing Path Traversal

After finding that '/etc/passwd' could be accessed, I started testing path traversal using:

```text
../
```

The idea behind '../' is to move one directory up in the filesystem.

For example:

```text
../
../../
../../../
```

Each additional '../' attempts to move another directory up.

Initially, adding more '../' did not give me the expected result.

I then tried increasing the number of '../' sequences until the application returned different information.

This eventually allowed me to access information from higher directories on the filesystem.

The important thing I noticed was that the response contained entries such as:

```text
root
daemon
bin
data
proxy
mail
```

This showed that I was able to move around the filesystem using the vulnerable parameter.

---

# 3. Findings and Analysis

## Finding 1: Local File Inclusion (LFI)

The main vulnerability found in the application was **Local File Inclusion (LFI)**.

LFI happens when an application allows a user to control which local file is loaded.

In this case, I was able to use the application to read:

```text
/etc/passwd
```

The vulnerability could then be combined with **path traversal** using:

'''text
../
'''

This allowed me to move through different directories on the target machine.

### Why this is a problem

An attacker could potentially use this vulnerability to read sensitive files from the server.

Depending on the configuration of the application, this could expose things such as:

- '/etc/passwd'
- Application configuration files
- Source code
- Logs
- Credentials
- API keys
- Other sensitive files

In this room, the vulnerability was enough to access the 'flag.txt' file.

---

## Finding the Flag

After increasing the path traversal depth, I was able to access the filesystem and identify the location of:

```text
flag.txt
```

The flag was located in the root filesystem, as described in the challenge.

I then used the same LFI vulnerability to read the file and retrieve the flag.

The attack can be summarized as:

```text
Nmap
  ↓
Port 80 found
  ↓
Web enumeration
  ↓
Gobuster
  ↓
No useful results
  ↓
FFUF
  ↓
/etc/passwd
  ↓
LFI identified
  ↓
Path traversal ../
  ↓
Filesystem access
  ↓
flag.txt
  ↓
Flag
```

---

# 4. Recommendations and Remediation

The main problem is that the application allows user input to be used as a file path.

A safer approach would be to not allow users to directly specify filesystem paths.

Some possible fixes would be:

### Validate user input

The application should validate the values received from the user and reject unexpected paths.

For example, sequences such as:

```text
../
```

should not be accepted when they are not required.

### Use an allowlist

Instead of allowing the user to provide any filename, the application could have a list of allowed pages.

For example:

```text
home
about
contact
```

The application could then internally decide which file should be loaded.

### Use proper file permissions

The web server should also have only the permissions it actually needs.

This can reduce the impact if a file inclusion vulnerability is discovered.

---

# 5. Appendices

## Appendix A: Commands Used

### Nmap

```bash
sudo nmap -sS -sV -p- TARGET-IP
```

Used to find open ports and identify services.

### Gobuster

```bash
gobuster dir -u http://TARGET-IP -w wordlist.txt
```

Used to look for hidden directories and files.

### FFUF

```bash
ffuf -w lfi_wordlist.txt -u http://TARGET-IP -fs 0
```

Used to fuzz the web application and identify interesting file/path behavior.

---

## Appendix B: Main Concepts

### Local File Inclusion

LFI allows an attacker to make a web application read files from the local server.

Example:

```text
/etc/passwd
```

### Path Traversal

Path traversal uses:

```text
../
```

to move to a parent directory.

For example:

```text
../../etc/passwd
```

The number of '../' depends on where the application is resolving the requested file.

---

## Conclusion

The main thing I learned from this room was that even when directory enumeration with Gobuster doesn't find anything useful, it is still important to investigate how the web application handles user input.

In this case, FFUF helped identify behavior related to '/etc/passwd'. After confirming that the file could be read, I tested path traversal with '../' and was eventually able to access 'flag.txt'.

The final attack path was:

```text
Reconnaissance → Enumeration → Fuzzing → LFI → Path Traversal → Flag
```
