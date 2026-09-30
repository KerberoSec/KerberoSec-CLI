# Forge

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.10.11.111 |
| **Status** | Retired |

## Overview
Forge is a medium-difficulty Linux machine centered on a **Server-Side Request Forgery (SSRF)** vulnerability in an image-gallery web application. The upload feature accepts a remote URL for the image source without validating the target or restricting it to genuine image content, allowing internal-only services (an FTP server and a hidden admin virtual host, both firewalled to localhost) to be reached indirectly through the vulnerable server. Abusing this SSRF against the internal FTP service using the `ftp://` URL scheme allows arbitrary file retrieval from the box, ultimately exposing a user's SSH private key and completing the foothold; further internal enumeration/privilege escalation completes the compromise.

## Reconnaissance
`nmap -sC -sV -A` against `forge.htb` (10.10.11.111) returned:

```
21/tcp filtered ftp
22/tcp open     ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp open     http    Apache httpd 2.4.41
|_http-title: Gallery
```

Port 80 immediately redirected to the virtual host `http://forge.htb`, and the site was a Django-based "Gallery" image-hosting application. FTP (21) was visible but **filtered** from direct external access, hinting at a firewall rule that only permits local/loopback connections: a strong signal that SSRF would be the intended path to reach it.

## Enumeration
Virtual-host brute forcing against `forge.htb` uncovered a hidden subdomain, `admin.forge.htb`, which (like FTP) was also blocked from direct external access.

The Gallery application's `/upload` endpoint accepts a `url` parameter to fetch a remote image (`?u=<url>`/`url=<url>&remote=1`), and critically performs **no validation** that the fetched resource is actually an image, nor any restriction on the destination host or URL scheme (`ftp`, `ftps`, `http`, `https` are all supported). This is a classic server-side request forgery primitive: the request is issued *from the server itself*, meaning it can reach `admin.forge.htb` and the internal FTP service that are otherwise unreachable from the outside.

Valid FTP credentials were discovered during testing:

```
user:heightofsecurity123!
```

## Foothold
Using the SSRF, the vulnerable upload endpoint was pointed at the internal admin vhost (bypassing the hostname firewall/allow-list by exploiting inconsistent case handling, e.g. `admIn.Forge.HTb`) to retrieve internal-only pages:

```
url=http://admIn.Forge.HTb/announcements&remote=1
```

The same SSRF primitive was then used with the `ftp://` scheme to pull arbitrary files from the loopback-only FTP server, embedding the previously-found FTP credentials directly in the URL:

```
POST /upload HTTP/1.1
Host: forge.htb
Content-Type: application/x-www-form-urlencoded

url=http://admIn.Forge.HTb/upload?u=ftp%3a//user%3aheightofsecurity123!%40127.0.1.1/user.txt&remote=1
```

By adjusting the requested FTP path, this technique was used to exfiltrate sensitive files from the target's filesystem (e.g. user home directory contents), which ultimately yielded an SSH **private key** for a local user. Using the recovered key to authenticate over SSH (`ssh -i id_rsa user@forge.htb`) provided the initial foothold shell and access to `user.txt`.

## Privilege Escalation
From the authenticated shell, further local enumeration (checking `sudo -l`, cron jobs, and internal Django/admin application logic reachable now that admin.forge.htb was accessible) was used to escalate privileges to root, continuing to leverage the same internal-only admin service and any elevated permissions it granted to the local user. (Full command-level detail for this stage was not preserved in the original notes beyond confirmation that root was obtained; the SSRF-to-FTP-file-read chain described above was the documented and reproducible core of the attack path.)

## Lessons Learned
- SSRF in a "fetch remote image" feature is extremely dangerous when the server can reach internal-only network segments/services: always validate and restrict destination hosts, ports, and URL schemes on server-side fetches.
- Virtual host allow-lists/firewalls that key off the `Host` header are easy to bypass with case-manipulation (`admIn.Forge.HTb`) if the comparison isn't case-insensitive.
- The `ftp://` URL scheme is often overlooked when hardening against SSRF, yet it enables full arbitrary file read against internal FTP services.
- Sensitive files such as SSH private keys should never be reachable via a generic file-serving/FTP path without additional access controls.

## Tools & References
- `nmap` and virtual-host brute forcing (e.g. `gobuster vhost` / `ffuf`) for service and subdomain discovery.
- `curl`/Burp Suite for crafting and testing the SSRF requests against the `/upload` endpoint.
- `id_rsa`: the user's SSH private key, retrieved via the FTP-based SSRF file-read chain described above; the key material itself is omitted from this repository for hygiene, but the retrieval technique is fully documented above.
