# Perfection

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.11.253 |
| **Status** | Retired |

## Overview
Perfection is an Easy Linux machine featuring a web application that calculates student scores. Per HTB's official machine description, the scoring feature is vulnerable to Server-Side Template Injection (SSTI) via a regex-filter bypass, which provides an initial foothold. The foothold user is a member of the `sudo` group, and a locally accessible database of password hashes: combined with a password-format hint found in the user's mail: allows a targeted mask attack to crack the user's password and escalate to root.

**Note:** the locally preserved artifacts for this machine were minimal: the `notes` file was empty and the `binaries`/`files` working directories were empty at archive time, leaving only the `nmap` scan as concrete local evidence. The summary and technique names below are drawn from HTB's official machine description rather than a locally captured command transcript, to avoid fabricating specifics that weren't recorded.

## Reconnaissance
```
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.6
80/tcp open  http    nginx
```
Only a web server and SSH were exposed; the web application observed was the "student score calculator" referenced in HTB's official description.

## Enumeration
No local transcripts of the web application's functionality, request/response captures, or filter-bypass payloads were preserved from the original engagement. Per HTB's official description, the score-calculation feature evaluates a user-supplied expression through a template engine, and a regex-based input filter intended to block SSTI payloads can be bypassed.

## Foothold
Per the official description, exploiting the SSTI vulnerability in the scoring feature yields code execution and an initial shell as the application's service user.

## Privilege Escalation
The foothold user was found to belong to the `sudo` group. Further enumeration (per the official description) uncovered a database containing password hashes, and a hint about the password's format/composition was found in that user's mail. A targeted **mask attack** (e.g. with `hashcat -a 3` and a mask matching the disclosed format) was used to recover the plaintext password, which was then used with `sudo` to obtain a root shell.

## Lessons Learned
- Regex-based filters are a weak defense against SSTI: template engines have many equivalent syntaxes that a naive blocklist will miss; use a safe/sandboxed rendering context instead.
- Leaking a password's format or composition rules (even without leaking the password itself) drastically reduces the keyspace for an offline mask attack.
- This entry is a reminder to preserve working notes/artifacts during an engagement: several steps here could only be summarized from HTB's official description rather than verified against local evidence.

## Tools & References
- `hashcat`: referenced technique (mask attack) for cracking the recovered password hash using the leaked format hint.
- Server-Side Template Injection (SSTI): general class of vulnerability exploited in the scoring web application per HTB's official description.
