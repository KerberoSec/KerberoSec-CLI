---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, web, attacker-mindset]
source: TryHackMe: Become a Hacker
platform: tryhackme
room: Become a Hacker
slug: become-a-hacker
path: TryHackMe/00-foundations/learning-meta/become-a-hacker.md
topic: 00-foundations
domain: [foundations, web]
skills: [recon, web-enum, reporting]
artifacts: [concept-notes, pattern-card]
sanitized: true
---

# Become a Hacker

## Summary

**Offensive security** is about deliberately breaking into systems to uncover weaknesses *before* real attackers do.

Key ideas:

* Think like an attacker, act with defender responsibility.
* Find vulnerabilities → confirm impact → recommend fixes.
* Offensive / Red‑team: exploit.
* Defensive / Blue‑team: detect, investigate, respond.

Example scenario:

* Mike is launching an online shop.
* He wants us to assess the web app before going public.
* Main worries:

  * Hidden admin or debug pages left by developers.
  * Weak / default credentials.

Our job in this room: simulate what a basic web attacker would do.

---

## Key Concepts

### 1. Reconnaissance: Finding Hidden Pages

We start by **enumerating content**: discovering URLs that the normal navigation does not show.

#### 1.1 Manual guessing in the browser

We control the browser address bar and try common paths:

```text
http://www.onlineshop.thm/sitemap
http://www.onlineshop.thm/mail
http://www.onlineshop.thm/login
http://www.onlineshop.thm/register
http://www.onlineshop.thm/admin
```

Process:

1. Start from `http://www.onlineshop.thm/`.
2. Append each guess and observe HTTP response:

   * Does the page load?
   * Do we get a login form or an error?
3. Once one of these paths returns a valid page (e.g., a **login form**), we have found a hidden entry point.

This technique is called **directory / resource brute‑forcing** by hand. It’s slow but useful with a very short wordlist.

---

#### 1.2 Automated discovery with Gobuster

When the wordlist is large, we automate.

We use **Gobuster** in directory enumeration mode:

```bash
user@thm ~> gobuster dir \
  --url http://www.onlineshop.thm/ \
  -w /usr/share/wordlists/dirbuster/directory-list.txt
```

Explanation:

* `gobuster`: tool to brute‑force URLs.
* `dir`: use directory/file enumeration mode.
* `--url`: target base URL.
* `-w`: path to a **wordlist**; each line is appended to the base URL.

Gobuster workflow:

1. Reads a word from the wordlist (e.g., `admin`).
2. Requests `/admin`, `/admin/`, sometimes common extensions.

3. Checks HTTP status codes and content length.
4. Prints out entries that look valid (e.g., `200 OK`, `301/302` redirects).

Result: Gobuster quickly reveals the same hidden login page, but now in an automated, scalable way.

Security lesson:

* Leaving sensitive pages **unlinked** but still reachable is **security through obscurity** and is not sufficient.
* Proper hardening must assume attackers will brute‑force paths.

---

### 2. Exploitation: Breaking Weak Authentication

We discovered a hidden **login page**. Next goal: get valid credentials.

#### 2.1 Manual password guessing

Common pattern:

* Try obvious usernames: `admin`, `administrator`, `root`, etc.
* Combine with very weak passwords:

```text
admin : abc123
admin : 123456
admin : qwerty
admin : password
admin : 654321
```

One of these pairs logs us in and reveals a **secret admin page**.

Risk:

* Using default / common passwords gives attackers instant access.
* This is exactly how many real compromises happen.

---

#### 2.2 Automated password brute‑force with Hydra

Manual tries do not scale. For large password lists, we use **Hydra**.

Command used in the room:

```bash
user@thm ~> hydra -l admin -P passlist.txt \
  www.onlineshop.thm http-post-form \
  "/login:username=^USER^&password=^PASS^:F=incorrect" -V
```

Breakdown:

* `hydra`: network login cracker.
* `-l admin`: fixed username `admin`.
* `-P passlist.txt`: password list file to iterate over.
* `www.onlineshop.thm`: target host.
* `http-post-form`: tells Hydra this is a web form using HTTP POST.
* `"/login:username=^USER^&password=^PASS^:F=incorrect"`:

  * `/login`: path to the login form.
  * `username=^USER^&password=^PASS^`: how Hydra injects each user/pass.
  * `F=incorrect`: if response contains the string `incorrect`, login failed; anything else is treated as success.

* `-V`: verbose; prints each attempt.

Hydra runs through the wordlist, sends POST requests, and stops when it finds a working password.

Security lesson:

* Web apps must enforce:

  * Strong, unique passwords.
  * Rate‑limiting and lockout after several failures.

  * Multi‑factor authentication where possible.

---

### 3. Reporting: From Hack to Hardening

What we achieved:

1. Enumerated hidden content (manual + Gobuster).

2. Identified a sensitive `/login` page not meant for public users.

3. Broke into the admin area using weak credentials (manual + Hydra).

When acting as a *professional* offensive security tester, next steps would be:

* **Document findings**

  * Hidden admin endpoint discoverable via wordlists.

  * Admin account protected by extremely weak password.

* **Assess impact**

  * Full control of user data and admin functions.

  * Potential for data theft, account takeover, or service disruption.

* **Recommend fixes**

  * Restrict access to admin pages (IP allow‑lists, VPN, SSO, etc.).

  * Enforce strong password policy and disable default accounts.

  * Implement account lockout / CAPTCHA / rate‑limiting.

  * Monitor logs for brute‑force attempts.

---

### 4. Mini Diagram: High‑Level Flow

```text
[ Browser / Gobuster ]  -- enumerate URLs -->  [/admin, /login, ...]

                                  |
                                  v
                           [ Login form ]
                         /               \
                [Manual guessing]     [Hydra]
                         \               /
                          v             v
                         [Valid admin credentials]
                                  |
                                  v
                          [Admin portal]
                     (sensitive operations)
```

---

### 5. Offensive vs Defensive View

From the **offensive** side:

* Goal: get in.
* Tools: Gobuster, Hydra, browser, wordlists.

* Mindset: assume pages and passwords are guessable.

From the **defensive** side:

* Goal: prevent or detect these exact techniques.

* Tools: WAF, log analysis, SIEM, monitoring, strong auth.

* Mindset: attackers will automate everything that can be automated.

---

### 6. Terminology Glossary (EN: ZH)

* Offensive security: 进攻性安全
* Defensive security: 防御性安全
* Hidden page / admin page: 隐藏页面 / 管理员页面
* Directory / resource enumeration: 目录（资源）枚举
* Brute‑force (password / directory): 暴力破解（密码 / 目录）
* Wordlist: 字典（密码/路径列表）
* Gobuster: Gobuster 目录枚举工具
* Hydra: Hydra 登陆爆破工具
* HTTP POST form: HTTP POST 表单
* Credentials (username & password): 凭据（用户名和密码）
* Default credentials: 默认凭据
* Rate‑limiting: 速率限制
* Account lockout: 账户锁定
* Multi‑factor authentication (MFA): 多因素认证
* Web application: Web 应用
* Vulnerability: 漏洞
* Exploit: 利用（漏洞的攻击方式）
* Hardening / mitigation: 加固 / 缓解措施
* Admin portal / back‑office: 管理后台
