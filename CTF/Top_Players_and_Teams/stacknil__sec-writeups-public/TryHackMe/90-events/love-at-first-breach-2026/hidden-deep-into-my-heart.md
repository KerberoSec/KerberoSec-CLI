---
type: resource-note
status: done
created: 2026-02-15
updated: 2026-03-12
tags: [security-writeup, tryhackme, event, web-recon]
source: TryHackMe: Love at First Breach 2026: Hidden Deep Into my Heart
platform: tryhackme
room: Love at First Breach 2026: Hidden Deep Into my Heart
slug: hidden-deep-into-my-heart
path: TryHackMe/90-events/love-at-first-breach-2026/hidden-deep-into-my-heart.md
topic: 90-events
domain: [web]
skills: [web-recon, web-enum, weak-secrets]
artifacts: [lab-notes]
sanitized: true
---

# Love at First Breach 2026: Hidden Deep Into my Heart

## Summary

* Target is a simple HTTP web app ("Love Letters Anonymous") exposed on `http://TARGET_IP:5000`.
* `robots.txt` leaks both a hidden path (`/cupids_secret_vault/`) and a credential-like string in a comment.
* Visiting the disallowed path leads to an administrator login page; using the leaked string unlocks the vault.
* Flag recovered: `THM{l0v3_is_in_th3_r0b0ts_txt}`.

## Key Concepts

### 1) Context

Challenge prompt (from the event card): "Find what's hidden deep inside this website." The UI strongly hints that Cupid left something exposed.

### 2) Scope / Rules of Engagement (ROE)

* Scope: **only** the provided lab instance (`TARGET_IP:5000`).
* Goal: identify hidden content/endpoint and retrieve the flag.
* Assumption: No need for brute force; intended path is via passive recon / misconfiguration.

### 3) Recon

#### 3.1 Landing page

* Opening `http://TARGET_IP:5000/` shows a minimal splash page: **Love Letters Anonymous**.

#### 3.2 Check `robots.txt`

* Common first move for lightweight web challenges: inspect crawler directives.

Request:

```bash
curl -s http://TARGET_IP:5000/robots.txt
```

Observed content (sanitized):

* `Disallow: /cupids_secret_vault/*`
* Comment line containing a secret-like token: `cupid_arrow_2026` (the screenshot shows it with extra exclamation marks, likely stylistic).

Interpretation:

* `robots.txt` is **not access control**. It’s a hint file for crawlers, and frequently abused to stash “hidden” paths.
* Commented strings in `robots.txt` are a classic footgun: they often leak creds, API keys, or internal notes.

### 4) Exploitation / Analysis

#### 4.1 Navigate to the disallowed path

* Visit:

  * `http://TARGET_IP:5000/cupids_secret_vault/`
* Result: a page confirming you found the vault, implying there’s a next step.

#### 4.2 Find the admin entry point

* The screenshots show an admin login at:

  * `http://TARGET_IP:5000/cupids_secret_vault/administrator`

#### 4.3 Use leaked secret to unlock

* Username shown in the login form: `admin`.
* Password is not visible in the screenshot (masked), but the workflow indicates the leaked `robots.txt` comment is the intended password.

Payload (conceptually):

* `username = admin`
* `password = cupid_arrow_2026` *(inferred from `robots.txt` comment; the trailing `!!!` appears decorative)*

#### 4.4 Result

* After successful login, the vault dashboard reveals the flag:

`THM{l0v3_is_in_th3_r0b0ts_txt}`

## Mitigation / Recommendations

For real systems, this failure mode is avoidable:

* Treat `robots.txt` as **public**; never store secrets, internal paths, or operational notes in it.
* Do not rely on “hidden URLs” for security (security-by-obscurity). Protect admin routes with proper authentication + authorization.
* Implement least privilege and monitoring:

  * rate limiting on login
  * audit logs for admin access
  * alerting on `/admin`-like endpoints

## 7) Lessons Learned

* `robots.txt` is a recon primitive (Reconnaissance primitive / 侦察入口): always check it early.
* Comments in public files are still public.
* When a challenge says “hidden deep inside”, default to **content discovery**: `robots.txt`, `sitemap.xml`, obvious directories, and client-side sources.

## CN: EN Glossary

* robots.txt（爬虫规则文件）: A public file telling web crawlers what paths to avoid; **not** an ACL.
* Disallow（禁止抓取）: Directive in robots.txt indicating paths crawlers should not index.
* Security by obscurity（以隐藏代替安全）: Relying on secrecy of implementation/URLs instead of real controls.
* Directory discovery（目录发现）: Finding hidden endpoints via hints (robots, sitemap) or enumeration.

## Minimal flow diagram

```text
Browser → /robots.txt
         ↳ Disallow: /cupids_secret_vault/*
         ↳ comment: cupid_arrow_2026
Browser → /cupids_secret_vault/administrator
         ↳ login (admin / leaked secret)
         ↳ flag
```
