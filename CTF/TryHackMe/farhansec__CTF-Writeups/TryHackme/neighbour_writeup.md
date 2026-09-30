```
 ███╗   ██╗███████╗██╗ ██████╗ ██╗  ██╗██████╗  ██████╗ ██╗   ██╗██████╗
 ████╗  ██║██╔════╝██║██╔════╝ ██║  ██║██╔══██╗██╔═══██╗██║   ██║██╔══██╗
 ██╔██╗ ██║█████╗  ██║██║  ███╗███████║██████╔╝██║   ██║██║   ██║██████╔╝
 ██║╚██╗██║██╔══╝  ██║██║   ██║██╔══██║██╔══██╗██║   ██║██║   ██║██╔══██╗
 ██║ ╚████║███████╗██║╚██████╔╝██║  ██║██████╔╝╚██████╔╝╚██████╔╝██║  ██║
 ╚═╝  ╚═══╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
              TryHackMe: Neighbour
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-06 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐☆☆☆☆

> ⏱️ ~5 min read

---

## Table of Contents

- [Progress Checklist](#progress-checklist)
- [Tools Used](#️-tools-used)
- [TL;DR](#-tldr)
- [Introduction](#-introduction)
- [Recon](#-recon)
- [Foothold](#-foothold)
- [Shell / Access](#-shell--access)
- [Flag](#-flag)
- [Mitigations](#️-mitigations)
- [Key Takeaway](#-key-takeaway)
- [If I Did It Again](#-if-i-did-it-again)
- [Changelog](#-changelog)
- [SEO & Publishing](#-seo--publishing)

---

## Progress Checklist

- [x] Port scan & service enumeration
- [x] Web directory brute force
- [x] Read HTML source comment: found guest credentials
- [x] Logged in as `guest`
- [x] Identified IDOR in `profile.php?user=` parameter
- [x] Swapped `guest` for `admin` in URL
- [x] Retrieved flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration
- 🌐 Browser (View Source + URL bar): the only weapon needed

---

## ⚡ TL;DR

A PHP login page left guest credentials in an HTML comment. Logging in as `guest` revealed a profile page controlled by a `?user=` URL parameter with zero server-side authorisation check. Changing `guest` to `admin` in the URL handed over the admin profile, and the flag: immediately.

---

## 📖 Introduction

Meet **Neighbour**: a box whose entire security model rests on the assumption that users won't look at the URL bar after logging in. It's a PHP web app with a login form, a profile page, and all the authorisation rigor of an honour system at an unmanned farm stall. The login page even helpfully leaves guest credentials in an HTML comment with a winking `Ctrl+U` hint. The developer wanted you to find it. What they perhaps didn't intend was for `?user=admin` to work just as smoothly right afterwards.

### Prerequisites

Readers are assumed to know:

- Basic HTTP request/response flow
- What URL query parameters are and how to modify them
- The concept of server-side vs. client-side access control

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

*Full-range scan with RustScan, detailed service fingerprinting via Nmap:*

```bash
rustscan -a 10.49.169.236 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 22/tcp | SSH | OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 |
| 80/tcp | HTTP | Apache httpd 2.4.53 (Debian) |

One detail worth flagging from the Nmap output: the `PHPSESSID` cookie is missing the `HttpOnly` flag. A small note, but it confirms this is a PHP application and hints that session security wasn't a top priority here either.

### Web Directory Enumeration

*(~3 mins into the box)*

*Feroxbuster scanning with PHP, TXT, and HTML extensions:*

```bash
feroxbuster -u http://10.49.169.236/ \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
  -x php,txt,html
```

```
# output (relevant hits only)
200  http://10.49.169.236/index.php
200  http://10.49.169.236/login.php
302  http://10.49.169.236/profile.php  =>  login.php   # ^^^ redirects unauthenticated users
301  http://10.49.169.236/db           =>  /db/
200  http://10.49.169.236/db.php                       # ^^^ exists but returns empty body
302  http://10.49.169.236/logout.php   =>  login.php
```

`profile.php` bounces unauthenticated visitors straight to `login.php`, so there *is* some kind of session check at the door. The question is whether that check extends to *which* user's profile you can view once you're inside. Spoiler: it doesn't.

`db.php` returns a blank response, *which likely means it's a database connection include file rather than a standalone page*: not directly exploitable here but useful to know the database layer is PHP-based.

### HTML Source: Credentials in a Comment

The login page itself drops a hint in plain HTML: `Ctrl+U` is called out right in the UI. Taking the bait:

*Viewing the raw HTML source of the login page:*

```
view-source:http://10.49.169.236/
```

```html
<!-- use guest:guest credentials until registration is fixed. "admin" user account is off limits!!!!! -->
```

Guest credentials, giftwrapped in an HTML comment. The five exclamation marks on "off limits" are doing a lot of emotional heavy lifting for what is ultimately a URL parameter.

### Credentials Found

| Username | Password | Where Found |
| --- | --- | --- |
| `guest` | `guest` | HTML comment in `index.php` source |

---

## 🚪 Foothold

*(~5 mins into the box)*

### IDOR: Insecure Direct Object Reference

**What is IDOR?** An Insecure Direct Object Reference occurs when an application uses a user-supplied value: a filename, a username, a numeric ID: to directly look up and return a resource, without checking whether the requesting user is actually *authorised* to access that specific resource. It's one of the most common and most impactful web vulnerabilities: the server trusts the client to only ask for things it's allowed to see, which is precisely the one thing a client should never be trusted to do.

After logging in with `guest:guest`, the application lands here:

```
http://10.49.169.236/profile.php?user=guest
```

The page greets us with:

```
Hi, guest. Welcome to our site. Try not to peep your neighbor's profile.
```

That message is either a warning or an instruction depending on your disposition. The `?user=` parameter is server-side rendered: the PHP backend is looking up whatever username value is passed and returning that profile. The question is whether it checks that the logged-in session matches the requested username.

*Modifying the URL parameter directly in the browser address bar:*

```
http://10.49.169.236/profile.php?user=admin
```

The server doesn't check. It just looks up `admin` and returns:

```
Hi, admin. Welcome to your site. The flag is: flag{66be95c478473d91a5358f2440c7af1f}
```

No re-authentication. No access control check. One URL edit.

---

## 🐚 Shell / Access

No shell required. The flag was delivered directly in the HTTP response body after the IDOR parameter manipulation.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| Challenge Flag | `flag{66be95c478473d91a5358f2440c7af1f}` | `profile.php?user=admin` response |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| IDOR on `profile.php?user=` | High | Validate server-side that the authenticated session user matches the requested profile; never trust user-supplied object references for access control |
| Guest credentials hardcoded in HTML comment | Medium | Remove all credentials from client-deliverable files; use environment variables or a proper user registration flow |
| Missing `HttpOnly` flag on `PHPSESSID` | Low | Set `session.cookie_httponly = 1` in `php.ini` to prevent JavaScript access to the session cookie |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** A session cookie proves you're *logged in*: it doesn't automatically prove you're allowed to access every resource on the server. Always verify server-side that the authenticated user owns or has permission to access the specific object being requested, not just that they're authenticated at all.

---

## 🔁 If I Did It Again

Skip Feroxbuster: `Ctrl+U` on the login page gives the credentials, logging in reveals the `?user=` parameter, and the whole thing is over in under two minutes. The directory scan added noise but no signal here.

---

## 🔚 Changelog

*Last updated: 2026-06-06*

---

[↑ Back to top](#)
