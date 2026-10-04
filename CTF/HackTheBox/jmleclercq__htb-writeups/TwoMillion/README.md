# Hack The Box: TwoMillion Writeup

<p align="center">
  <img src="https://img.shields.io/badge/HTB-TwoMillion-red?style=for-the-badge&logo=hackthebox&logoColor=white">
  <img src="https://img.shields.io/badge/Difficulty-Easy-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/OS-Linux-blue?style=for-the-badge&logo=linux&logoColor=white">
  <img src="https://img.shields.io/badge/Status-In%20Progress-orange?style=for-the-badge">
</p>

---

# 📚 Table of Contents

- [Overview](#-overview)
- [Reconnaissance](#-reconnaissance)
  - [Nmap Scan](#nmap-scan)
  - [Virtual Host Discovery](#virtual-host-discovery)
- [Web Enumeration](#-web-enumeration)
  - [Invite Page Discovery](#invite-page-discovery)
  - [JavaScript Analysis](#javascript-analysis)
- [Next Steps](#-next-steps)

---

# 🎯 Overview

| Machine | OS | Difficulty |
|----------|----|------------|
| TwoMillion | Linux | Easy |

## Description

This machine focuses heavily on:
- web enumeration,
- JavaScript analysis,
- API abuse,
- privilege escalation on Linux.

The initial foothold starts with discovering how the invitation system works on the website.

---

# 🔎 Reconnaissance

## Nmap Scan

Initial scan:

```bash
sudo nmap -sC -sV 10.129.41.161
```

### Result

```text
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1
80/tcp open  http    nginx
```

### Observations

- SSH is exposed but no credentials are available yet.
- The web service redirects to a custom hostname:
  - `http://2million.htb`

---

## Virtual Host Discovery

Added the hostname locally:

```bash
echo "10.129.41.161 2million.htb" | sudo tee -a /etc/hosts
```

The website became accessible at:

```text
http://2million.htb
```

---

# 🌐 Web Enumeration

## Invite Page Discovery

Browsing the website revealed an invitation portal:

```text
http://2million.htb/invite
```

The page loaded an interesting JavaScript file:

```text
/js/inviteapi.min.js
```

Downloaded locally for analysis:

```bash
curl http://2million.htb/js/inviteapi.min.js -o inviteapi.min.js
```

---

## JavaScript Analysis

Displaying the content revealed obfuscated JavaScript:

```bash
cat inviteapi.min.js
```

Relevant decoded functions:

```javascript
function makeInviteCode() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: '/api/v1/invite/how/to/generate',
        success: function(response) {
            console.log(response)
        },
        error: function(response) {
            console.log(response)
        }
    })
}

function verifyInviteCode(code) {
    var formData = {"code": code};

    $.ajax({
        type: "POST",
        dataType: "json",
        data: formData,
        url: '/api/v1/invite/verify',
        success: function(response) {
            console.log(response)
        },
        error: function(response) {
            console.log(response)
        }
    })
}
```

### Interesting API Endpoints

```text
/api/v1/invite/how/to/generate
/api/v1/invite/verify
```

### Important Finding

The JavaScript function providing the first hint was:

```text
makeInviteCode
```

This indicates that the invite system relies on backend API calls that can potentially be abused directly.

---

# 🚀 Next Steps

The next objective is to interact directly with the invitation API:

```bash
curl -s -X POST http://2million.htb/api/v1/invite/how/to/generate
```

This should reveal how invitation codes are generated and allow account creation.

---

# 🛠️ Tools Used

- Nmap
- Curl
- Browser DevTools
- Linux command line

---

# 📌 Notes

This writeup is currently a work in progress and will be updated as the exploitation continues.
