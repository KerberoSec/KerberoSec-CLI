# 🧠 OverTheWire Writeups

This file contains my walkthrough and notes for OverTheWire wargames.  
All levels are documented in a single file for better continuity and flow.

---

## 📌 About

OverTheWire wargames are designed to teach basic to advanced concepts in:

- Linux usage  
- Command-line skills  
- File handling  
- Privilege concepts  

Each level builds on the previous one.

---

## 🔐 Level 0

**URL:** http://natas0.natas.labs.overthewire.org/  

### 🧠 Approach:
- Viewed page source code.
- Found the password directly inside HTML comments.

### 🔑 Password:
```
0nzCigAq7t2iALyvU9xcHlYN4MlkIwlq
```

---

## 🔐 Level 1

**URL:** http://natas1.natas.labs.overthewire.org/  

### 🧠 Approach:
- Right-click was disabled.
- Used `Ctrl + Shift + I` (Developer Tools) to inspect source.
- Password found in source code.

### 🔑 Password:
```
TguMNxKo1DSa1tujBLuZJnDUlCcUAPlI
```

---

## 🔐 Level 2

**URL:** http://natas2.natas.labs.overthewire.org/  

### 🧠 Approach:
- Checked source code → found an image reference.
- Navigated to `/files/` directory.
- Located `users.txt` containing credentials.

### 🔑 Password:
```
3gqisGdR0pjm6tpkDKdIWO2hSvchLeYH
```

---

## 🔐 Level 3

**URL:** http://natas3.natas.labs.overthewire.org/  

### 🧠 Approach:
- Checked `robots.txt`.
- Found disallowed directory: `/s3cr3t/`.
- Navigated there and found `users.txt`.

### 🔑 Password:
```
QryZXc2e0zahULdHrtHxzyYkj59kUxLQ
```

---

## 🔐 Level 4

**URL:** http://natas4.natas.labs.overthewire.org/  

### 🧠 Approach:
- Used Burp Suite to intercept HTTP request.
- Modified the `Referer` header to match required level URL.
- Forwarded request to gain access.

### 🔑 Password:
```
0n35PkggAPm2zbEpOU802c0x0Msn1ToK
```

---

## 🔐 Level 5

**URL:** http://natas5.natas.labs.overthewire.org/  

### 🧠 Approach:
- Used `curl` to fetch cookies:
  ```bash
  curl http://natas5.natas.labs.overthewire.org/ -u natas5 -c cookies.txt
  ```
- Edited cookie:
  ```
  loggedin=0 → loggedin=1
  ```
- Sent modified cookie:
  ```bash
  curl http://natas5.natas.labs.overthewire.org/ -u natas5 -b cookies.txt
  ```

### 🔑 Password:
```
0RoJwHdSKWFTYR5WuiAewauSuNaBXned
```

---

## 🔐 Level 6

**URL:** http://natas6.natas.labs.overthewire.org/  

### 🧠 Approach:
- Viewed source code → found `include` file path.
- Opened the referenced file.
- Revealed secret used for authentication.

### 🔑 Password:
```
bmg8SvU1LizuWjx3y7xkNERkHxGre0GS
```

---

## 🔐 Level 7

**URL:** http://natas7.natas.labs.overthewire.org/  

### 🧠 Approach:
- Identified **Local File Inclusion (LFI)** vulnerability.
- Manipulated URL parameters to access system files.
- Retrieved password from:
  ```
  /etc/natas_webpass/natas8
  ```

### 🔑 Password:
```
xcoXLmzMkoIP9D7hlgPlh9XD7OgLAe5Q
```

---

## 🔐 Level 8

**URL:** http://natas8.natas.labs.overthewire.org/  

### 🧠 Approach:
- Found encoded secret in PHP source.
- Identified encoding steps:
  - Hex → Binary
  - Reverse string
  - Base64 decode
- Used PHP script:

```php
<?
$secret = "3d3d516343746d4d6d6c315669563362";
function decodeSecret($secret) {
    return base64_decode(strrev(hex2bin($secret)));
}
echo decodeSecret($secret);
?>
```

### 🔑 Password:
```
ZE1ck82lmdGIoErlhQgWND6j2Wzz6b6t
```

---

## 🔐 Level 9

**URL:** http://natas9.natas.labs.overthewire.org/  

### 🧠 Approach:
- Observed unsanitized input in PHP → **Command Injection** vulnerability.
- Injected command using `;`:
  ```
  ; cat /etc/natas_webpass/natas10
  ```
- Retrieved password from system file.

### 🔑 Password:
```
t7I5VHvpa14sJTUGV0cbEsbYfFP2dmOux
```

---

## 📌 Summary

| Level | Vulnerability/Concept |
|------|----------------------|
| 0-1  | Source Code Exposure |
| 2    | Directory Discovery  |
| 3    | robots.txt Leakage   |
| 4    | Header Manipulation  |
| 5    | Cookie Tampering     |
| 6    | File Inclusion       |
| 7    | LFI                  |
| 8    | Encoding/Decoding    |
| 9    | Command Injection    |

---

## 🚀 Notes
- Each level builds foundational web exploitation skills.
- Focus areas: HTTP, cookies, headers, file inclusion, and injection attacks.

---

**Author:** zer0arc4  
