---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, offensive-security, web]
source: TryHackMe: Offensive Security Intro
platform: tryhackme
room: Offensive Security Intro
slug: offensive-security-intro
path: TryHackMe/00-foundations/intro-cybersecurity/offensive-security-intro.md
topic: 00-foundations
domain: [foundations, web]
skills: [recon, web-enum, reporting]
artifacts: [concept-notes, lab-notes]
sanitized: true
---

# Offensive Security Intro

- **Type:** Guided web exploitation lab
- **Focus:** Offensive Security / Web Hacking Basics / Directory Brute Force
- **Lab context:** TryHackMe “FakeBank” training room (simulated target)

---

## Summary

Offensive security is about **thinking and acting like an attacker** in a controlled, legal setting.

Typical activities include:

- Breaking into computer systems and web applications.
- Exploiting software bugs and misconfigurations.
- Finding hidden functionality and logic flaws that lead to unauthorised access.

The goal is **not** chaos. The goal is:

> Understand how real attackers operate → fix the weaknesses → improve overall defence.

This mindset is used in:

- Penetration testing
- Red teaming
- Adversary emulation
- Security research / bug bounty

---

## Key Concepts

### 2. FakeBank Scenario: Your First Legal “Hack”

In this lab, the target is a **fake online banking application** called `FakeBank`.
You are given:

- A normal user account in the system.
- A fully isolated virtual machine where attacking the site is allowed.

Objective of the exercise:

- Start as a regular user.  
- Discover hidden functionality.  
- Abuse it to add money to your own account.

This is a classic “broken access control / hidden feature” scenario in web security.

---

### 3. Discovering Hidden Functionality with `dirb`

#### 3.1 Idea

Many web applications expose sensitive features on **“secret” URLs**:

- `/admin`, `/manage`, `/backup`, `/test`, etc.
- Developers assume “nobody will guess this path”, which is obviously wrong.

A common offensive technique is **directory brute forcing**:

- Take a wordlist of common names (e.g. `admin`, `login`, `bank-deposit`).
- For each word, send an HTTP request and check if the path exists.
- Tools: `dirb`, `dirbuster`, `ffuf`, `gobuster`, …

#### 3.2 Running `dirb` Against FakeBank

Basic usage in the lab:

```bash
dirb http://fakebank.thm
```

Key observations:

- `dirb` uses a wordlist such as `common.txt` to generate candidate paths.

- Lines starting with `+` in the output indicate paths that actually exist.

In this room, `dirb` discovers two interesting URLs, including:

- `http://fakebank.thm/images`: static resources

- `http://fakebank.thm/bank-deposit`: **hidden deposit page** (sensitive function)

The second one is the real target.

---

### 4. Abusing the Hidden Deposit Page

Once the hidden page `/bank-deposit` is found:

1. Open `http://fakebank.thm/bank-deposit` in the browser.

2. The page allows adding funds to any bank account number.

3. You know your own account ID from the previous task (e.g. `8881`).

4. Enter your account number and deposit amount (e.g. `2000`).

This is a textbook example of **missing access control**:

- The application exposes a powerful operation (add funds).

- It does not verify whether the user is authorised to perform it.

- There is no server-side check like “only staff accounts may access this page”.

After submitting the form, your account balance becomes positive and the site shows a success popup (plus a small “flag” for the room).

---

### 5. Key Takeaways from This Lab

**1. Security-by-obscurity fails.**

- Hiding a function behind a secret URL is not real security.

- Directory brute-force tools will eventually find it.

**2. Every sensitive action needs proper access control.**

- Operations that move money, change passwords, or modify data must be restricted and checked on the server side.

- The client (browser) must never be trusted to enforce rules.

**3. Wordlists encode common developer habits.**

- Many people name pages with predictable words: `admin`, `backup`, `test`, `deposit`, etc.

- Wordlists like `common.txt` are basically “crowdsourced intuition” of what humans tend to choose.

**4. Offensive labs are safe sandboxes.**

- You are allowed to break things inside the provided VM.

- The same techniques are illegal against real systems without explicit permission.

---

### 6. Checklist: Basic Web Discovery Attack Flow

Minimal mental model you can reuse for future labs:

- Identify target URL or domain.
- Run a directory brute-force scan (e.g. `dirb`, `ffuf`) with a reasonable wordlist.
- Review discovered paths:

  - Static content? (`/images`, `/css`) → usually low impact.
  - Dynamic or sensitive actions? (`/admin`, `/deposit`, `/backup`) → investigate further.

- Open promising paths in the browser and test:

  - What functionality do they expose?
  - Is authentication required?
  - Is authorisation enforced correctly?

- Check if you can perform actions you should not be allowed to do (e.g. add money, view other users’ data).
- Document the issue clearly: **impact, steps to reproduce, and suggested fix**.

---

### 7. Glossary (EN: ZH)

Offensive security: 进攻性安全

Defensive security: 防御性安全

Red team: 红队

Blue team: 蓝队

Penetration testing (pentest): 渗透测试

Directory brute force / content discovery: 目录暴力枚举 / 内容发现

Wordlist: 字典（候选字符串列表）

Access control: 访问控制

Broken access control: 访问控制缺失 / 破坏

Hidden/secret URL: 隐藏 URL / 秘密路径

Virtual machine (VM): 虚拟机

Flag: （CTF/实验室中的）标志字符串，用于确认完成任务
