```
  ██████╗██╗   ██╗██████╗ ███████╗██████╗
 ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗
 ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝
 ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗
 ╚██████╗   ██║   ██████╔╝███████╗██║  ██║
  ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝
 ██╗  ██╗███████╗██████╗  ██████╗ ███████╗
 ██║  ██║██╔════╝██╔══██╗██╔═══██╗██╔════╝
 ███████║█████╗  ██████╔╝██║   ██║███████╗
 ██╔══██║██╔══╝  ██╔══██╗██║   ██║╚════██║
 ██║  ██║███████╗██║  ██║╚██████╔╝███████║
 ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
        TryHackMe: CyberHeroes
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-06 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐☆☆☆☆

> ⏱️ ~6 min read

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
- [x] Discovered `login.html`
- [x] Inspected client-side JavaScript source
- [x] Extracted hardcoded credentials (username + reversed password)
- [x] Reconstructed hidden flag file path from JS logic
- [x] Retrieved flag

---

## 🛠️ Tools Used

- 🔎 RustScan + Nmap: port scanning and service detection
- 🕷️ Feroxbuster: web directory enumeration
- 🌐 Browser DevTools (View Source): the actual weapon of choice

---

## ⚡ TL;DR

The entire challenge lives in a single JavaScript `authenticate()` function left fully exposed in the browser's page source. Credentials were hardcoded in plain text: one of them just reversed, and the flag's file path was constructed client-side and equally readable. No exploitation required. Just `Ctrl+U`.

---

## 📖 Introduction

Today's subject is **CyberHeroes**: a box that has the audacity to call itself a challenge while leaving its front door not just unlocked, but labelled "FRONT DOOR" in neon letters. It's a single-page portfolio site with a login form that genuinely believes security is a server-side problem. Spoiler: they didn't check with the server. If this box were a bank, the vault combination would be written on the outside of the vault in permanent marker. It's that kind of day.

### Prerequisites

Readers are assumed to know:

- Basic HTML/JavaScript reading ability
- How browser View Source (`Ctrl+U`) and DevTools work
- What client-side vs. server-side authentication means

---

## 🔍 Recon

*(~0 mins into the box)*

### Port Scan

Same opening move as always: RustScan for speed, Nmap for detail.

*Full port sweep, handing off to Nmap scripts for version and service detection:*

```bash
rustscan -a 10.49.154.83 -r 1-65535 --ulimit 5000 -- -Pn -sC -sV
```

| Port | Service | Version |
| --- | --- | --- |
| 22/tcp | SSH | OpenSSH 8.2p1 Ubuntu 4ubuntu0.4 |
| 80/tcp | HTTP | Apache httpd 2.4.48 (Ubuntu) |

Two ports, nothing exotic. Apache 2.4.48 is not ancient like the last box: this one isn't about outdated services. The HTTP title comes back as `CyberHeros : Index`. Typo in the page title is always a great sign of quality software engineering.

### Web Directory Enumeration

*(~3 mins into the box)*

*Feroxbuster with PHP, TXT, and HTML extensions across the medium wordlist:*

```bash
feroxbuster -u http://10.49.154.83/ \
  -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt \
  -x php,txt,html
```

```
# output (relevant hits only)
200  http://10.49.154.83/index.html
200  http://10.49.154.83/login.html     # ^^^ this is where the fun is
200  http://10.49.154.83/changelog.txt
```

*(truncated: the rest was asset files: images, vendor JS/CSS, nothing actionable)*

`login.html` is the obvious next stop. `changelog.txt` is worth a read: *it appeared to be a generic template changelog with no sensitive information*, so the login page it is.

---

## 🚪 Foothold

*(~5 mins into the box)*

### Client-Side Authentication: The Anti-Pattern

**What's the problem here?** Authentication is supposed to be validated on the *server*: a system the attacker cannot directly inspect or manipulate. When a developer moves that logic into *client-side JavaScript*, they've handed the attacker the padlock, the key, the combination, and a handwritten note explaining how the lock works. The browser must download and execute all JavaScript to render the page: which means the attacker can read every line of it before touching a single input field.

Navigating to `login.html` and hitting `Ctrl+U` (View Source) immediately reveals the `authenticate()` function:

*The full JavaScript function embedded in login.html, exactly as found in source:*

```javascript
function authenticate() {
  a = document.getElementById('uname')
  b = document.getElementById('pass')
  const RevereString = str => [...str].reverse().join('');
  if (a.value=="h3ck3rBoi" & b.value==RevereString("54321@terceSrepuS")) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("flag").innerHTML = this.responseText ;
        document.getElementById("todel").innerHTML = "";
        document.getElementById("rm").remove() ;
      }
    };
    xhttp.open("GET", "RandomLo0o0o0o0o0o0o0o0o0o0gpath12345_Flag_"+a.value+"_"+b.value+".txt", true);
    xhttp.send();
  }
  else {
    alert("Incorrect Password, try again.. you got this hacker !")
  }
}
```

Breaking this down:

- **Username** is hardcoded in the comparison: `h3ck3rBoi`
- **Password** is the string `54321@terceSrepuS` passed through `RevereString()`, which reverses it character by character: yielding `SuperSecret@12345`
- On success, the script constructs a GET request to a `.txt` file at an "obscure" path that's... right there in the source, assembled from the username and password values

The credentials, the reversal algorithm, and the flag's file path are all completely readable before submitting a single form field.

### Extracted Credentials

| Username | Password | Where Found |
| --- | --- | --- |
| `h3ck3rBoi` | `SuperSecret@12345` | `login.html` JavaScript source |

### Reconstructed Flag File Path

Substituting the known credential values into the path template from the JS:

```
RandomLo0o0o0o0o0o0o0o0o0o0gpath12345_Flag_h3ck3rBoi_SuperSecret@12345.txt
```

This file can be fetched directly without ever touching the login form:

*Direct retrieval of the flag file: no form submission required:*

```bash
curl "http://10.49.154.83/RandomLo0o0o0o0o0o0o0o0o0o0gpath12345_Flag_h3ck3rBoi_SuperSecret@12345.txt"
```

Or simply by entering the credentials into the login form, which triggers the XHR fetch and injects the response into the page.

---

## 🐚 Shell / Access

No shell required for this challenge. Access to the flag was achieved entirely via browser interaction with the login page after reading the client-side source.

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| Challenge Flag | `flag{edb0be532c540b1a150c3a7e85d2466e}` | Fetched via XHR after login, or direct URL access |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Hardcoded credentials in client-side JavaScript | Critical | Move all authentication logic server-side; never compare credentials in the browser |
| Plaintext (reversed) password obfuscation | Critical | String reversal is not encryption: use proper server-side password hashing (bcrypt, Argon2) |
| Predictable flag file path assembled client-side | High | Flag delivery should be gated by a server-side session check, not a client-constructed URL |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** Anything that runs in the browser is readable by the user: no amount of string reversal, obfuscation, or "obscure" path names changes that. Authentication logic belongs on the server, full stop.

---

## 🔁 If I Did It Again

Skip Feroxbuster entirely: `Ctrl+U` on the homepage link to `login.html` would have gotten here in thirty seconds.

---

## 🔚 Changelog

*Last updated: 2026-06-06*

---
