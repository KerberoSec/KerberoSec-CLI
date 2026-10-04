# Sink

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Insane |
| **IP Address** | 10.10.10.225 |
| **Status** | Retired |

## Overview
Sink is an insane-difficulty Linux machine that chains an HTTP request-smuggling (desync) attack against a "DevOps"-style web application into a Gitea instance, then pivots through leaked credentials and AWS-style secrets/KMS services to obtain a full system compromise. The path involves web session hijacking through response splitting, credential/key leakage from Git repositories, and finally decrypting a protected file using a KMS-like service to retrieve the final flag.

## Reconnaissance
```
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.1
3000/tcp open  ppp?    Gitea (Git with a cup of tea), Go 1.14.12
5000/tcp open  http    Gunicorn 20.0.0 - "Sink Devops"
```
Gitea (port 3000) exposed usernames `david`, `marcus`, and `root` in its public activity/contributions. Gunicorn (port 5000) hosted a custom "Sink Devops" application with registration/login, a comment feature, and a broken search bar.

## Enumeration
- Gitea's Swagger API (`/api/swagger`) was reviewed for accessible endpoints. An authenticated RCE technique for Gitea hook execution was noted as a possible path once valid credentials were available (`exploit/multi/http/gitea_git_hooks_rce`), but a valid Gitea account was required first.
- The Gunicorn `5000` application allowed self-registration (`shorida:shorida@lul.htb:lol123`) and exposed an `admin@sink.htb` account. Gunicorn 20.0.0 is affected by an **HAProxy/Gunicorn HTTP request-smuggling** issue, allowing a crafted request with a malformed `Transfer-Encoding` header to "smuggle" a second, attacker-controlled request into the backend's request queue.
- The comment feature does not validate the session that submitted a comment strictly enough, making it possible to make the smuggled request appear to originate from the admin's session if their cookie/CSRF token can be captured.

## Foothold
A comment was submitted as the low-privileged test account while intercepting the request in a proxy. The request was modified to include a **desynced second request** by embedding a base64-encoded chunked-transfer body:
```
POST /comment HTTP/1.1
Host: 10.10.10.225:5000
Content-Type: application/x-www-form-urlencoded
Cookie: lang=zh-CN; i_like_gitea=...; _csrf=...; session=...
Transfer-Encoding: Cwo=chunked

5
msg=a
0

POST /comment HTTP/1.1
Host: localhost:5000
Cookie: ...
Content-Type: application/x-www-form-urlencoded

msg=
```
The literal string `Cwo=` in the header is the base64 encoding of a line terminator; decoding it in-place (Burp: select the text, `Ctrl+Shift+B`) restores the correct chunked framing so the backend parses two distinct requests from one TCP stream. When the crafted request was sent and the admin later reloaded the home page, their session's comment/cookie became visible, effectively hijacking the `admin@sink.htb` account. With admin access to the Devops app, further internal service credentials (SecretsManager-style secrets) were disclosed, which were reused against Gitea to obtain a foothold shell.

## Privilege Escalation
Enumerating Gitea repositories accessible with the leaked/pivoted credentials uncovered a private SSH key committed to a repository, providing SSH access as a higher-privileged local user. From there, an internal "SecretsManager" style service exposed further credentials, which were used to move laterally again. Final privilege escalation to system-level access involved a KMS-style decryption service: an encrypted file was decrypted using the discovered KMS key/credentials to recover the final secret needed for full compromise.

## Lessons Learned
- HTTP request smuggling (desync) attacks remain highly effective against mismatched front-end/back-end HTTP parsers (here, Gunicorn under a proxy) and can be used for session hijacking even without direct XSS/CSRF.
- Leaking usernames through public Git contribution graphs materially helps attackers build a target list for later credential-stuffing/phishing.
- Secrets committed to Git history (SSH keys, credentials) are a recurring theme across environments that "look" cloud-native (Gitea, SecretsManager, KMS) but are self-hosted and thus not protected by the same guardrails as their managed cloud counterparts.

## Tools & References
- Burp Suite (manual desync/request-smuggling construction, base64 chunk-encoding trick)
- Gitea Swagger API exploration; `exploit/multi/http/gitea_git_hooks_rce` (Metasploit) noted as a possible authenticated RCE path
- Reference reading: HAProxy/Gunicorn HTTP request smuggling advisories
