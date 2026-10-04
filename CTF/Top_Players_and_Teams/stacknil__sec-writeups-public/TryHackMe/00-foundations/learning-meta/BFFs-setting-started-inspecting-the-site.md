---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, web, source-review]
source: "TryHackMe: BFFs: Getting Started: Inspecting the Site"
platform: tryhackme
room: "BFFs: Getting Started: Inspecting the Site"
slug: bffs-getting-started-inspecting-the-site
path: TryHackMe/00-foundations/learning-meta/BFFs-setting-started-inspecting-the-site.md
topic: 00-foundations
domain: [foundations, web]
skills: [recon, web-enum, auth-session]
artifacts: [concept-notes, pattern-card]
sanitized: true
---

# BFFs: Getting Started: Inspecting the Site

> Scenario: pre‑production social media app **BFFs**. Goal is to pivot from a normal user-facing page to the hidden admin portal using only the browser and very light OSINT‑style recon.

---

## Summary

**Target URL**
`http://TARGET_IP/`

Actions:

* Open the site in Firefox from the TryHackMe attack box.
* Take note of:

  * Page title and branding ("BFFs")
  * Any mention of “admin”, “beta”, “test”, or “coming soon”.
* Confirm that we’re looking at a typical social media / profile site with no obvious **Admin** link in the visible UI.

**Why this matters:**
Before touching tools like Burp, we treat the browser itself as a recon tool. Many CTF‑style misconfigurations are literally visible if you just look carefully.

---

## Key Concepts

### 2. Inspecting the HTML source: hunting for comments

#### 2.1 Opening the source

From the main page:

* Right‑click → **View Page Source** (or press `Ctrl+U`).
* Firefox opens a new tab containing the raw HTML.

#### 2.2 Searching for developer comments

In the source tab:

* Use `Ctrl+F` and search for `<!--` to jump between HTML comments.
* Manually skim anything that looks like a TODO, note, or commented‑out link.

Typical patterns:

* `<!-- TODO: remove /test-admin before production -->`
* `<!-- Debug login at /admin-portal -->`

Once we see something like `/test-admin`, we treat it as a **high‑value endpoint leak**.

#### 2.3 Following the leaked endpoint

* Navigate directly to the discovered path, e.g.

  * `http://TARGET_IP/test-admin`
* Confirm that this reveals an **Admin Page** with a login form.

**Takeaway:**
HTML comments are not access control. Any information in them should be treated as public. In real applications this often includes:

* Internal endpoints or feature toggles
* Temporary debug admin panels
* Hard‑coded usernames / emails

---

### 3. Hidden admin login: understanding the risk

At `/test-admin` we see:

* A heading like **Admin Page!**
* A note such as: *"Admin page to manage other users before we go live. Should be removed after moving into production"*.
* A simple form with fields:

  * **Username**
  * **Password**

Why this is dangerous:

* Admin interfaces are usually **high‑impact**:

  * View or edit all users and posts
  * Delete accounts
  * Change site‑wide settings
* Even a single weak control (e.g., default credentials) can compromise the whole application.

Before brute forcing, we try the **lowest‑hanging fruit**: default or guessable credentials.

---

### 4. Default credential guessing

#### 4.1 Why default creds are a thing

Many frameworks ship with preset admin accounts to simplify development. In a rushed deployment, devs may:

* Forget to rotate these credentials, or
* Keep a “temporary” test admin page online.

In CTFs and in real incidents, logging in with the defaults is often enough to fully compromise the app.

#### 4.2 Typical username:password pairs to try

Manually test combinations in the login form (a few examples):

* `admin:admin`
* `admin:password`
* `administrator:password123`
* `root:root`

In this room, one of the common default pairs works and grants access to the **admin portal**.

We always:

* Keep a small mental (or written) wordlist of likely defaults.
* Try only a **handful** of guesses to avoid noisy brute force.

---

### 5. Inside the admin portal: what can we see/do?

After successful login, the `/admin-portal` reveals:

* **Admin profile section**

  * Name, status, location fields (editable).
* **Feed / posts management**

  * Admin’s own post visible, with metadata such as timestamp and author.
* **User management section**

  * A list of signed‑up users (e.g., `peterpan`, `asmith`, `jane`).
  * Links like `[delete]` next to each user.

This gives the admin the ability to:

* View sensitive user data (usernames and potentially more PII if exposed elsewhere).
* Delete arbitrary user accounts.
* Potentially pivot to further functionality (e.g., role changes, password resets) if implemented.

From an attacker’s perspective, this is a **full privilege escalation** from anonymous visitor to site administrator.

---

### 6. Mini diagram: attacker workflow

```text
[Browser] --> [Public BFFs page]
      |              |
      |  View Source |
      v              v
   Find HTML comment leaking "/test-admin"
      |
      v
[Browser] --> GET /test-admin  (hidden admin login)
      |
      |  Try default creds
      v
[Browser] --> POST /test-admin (valid admin credentials)
      |
      v
      /admin-portal  (full admin control over users)
```

---

### 7. Defensive lessons

1. **Never rely on obscurity:**

   * Hidden URLs, test pages, and HTML comments are not access controls.

2. **Remove test/admin interfaces before production:**

   * Anything labelled “should be removed in production” usually becomes the first foothold.

3. **Rotate or disable default accounts:**

   * Change default passwords on deployment.
   * Prefer creating unique admin users per environment.

4. **Limit admin surface area:**

   * Protect admin portals with:

     * Strong, unique credentials
     * Multi‑factor authentication (MFA)
     * IP allow‑listing or VPN‑only access where possible

5. **Monitor for suspicious logins:**

   * Alert on logins from unknown IPs
   * Alert on repeated failed login attempts

---

### 8. EN: ZH terminology quick reference

| English Term                      | Meaning (EN)                                | 中文对应术语     |
| --------------------------------- | ------------------------------------------- | ---------- |
| page source                       | raw HTML / JS of a web page                 | 页面源代码      |
| HTML comment                      | `<!-- ... -->` note inside HTML             | HTML 注释    |
| hidden endpoint / hidden page     | URL not linked from UI but still accessible | 隐藏接口/隐藏页面  |
| admin portal / admin panel        | privileged web interface for administrators | 管理员后台界面    |
| default credentials               | factory‑set username and password           | 默认凭据       |
| credential guessing               | trying likely username:password pairs       | 凭据猜测       |
| test environment / pre‑production | staging system before public launch         | 测试环境/预发布环境 |
| security by obscurity             | relying on secrecy of design or URLs        | 以“隐蔽”为安全策略 |
| privilege escalation              | moving from low to high privileges          | 权限提升       |
| user management                   | create / delete / modify user accounts      | 用户管理       |
| access control                    | mechanisms that enforce who can access what | 访问控制       |
