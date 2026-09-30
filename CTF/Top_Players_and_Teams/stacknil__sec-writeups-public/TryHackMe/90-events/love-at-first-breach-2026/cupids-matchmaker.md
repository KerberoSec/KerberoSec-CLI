---
type: resource-note
status: done
created: 2026-02-15
updated: 2026-03-12
tags: [security-writeup, tryhackme, event, web-security]
source: TryHackMe: Love at First Breach 2026: Cupid's Matchmaker
platform: tryhackme
room: Love at First Breach 2026: Cupid's Matchmaker
slug: cupids-matchmaker
path: TryHackMe/90-events/love-at-first-breach-2026/cupids-matchmaker.md
topic: 90-events
domain: [web]
skills: [xss, http-basics, cookies, reverse-shell]
artifacts: [lab-notes, pattern-card]
sanitized: true
---

# Love at First Breach 2026: Cupid's Matchmaker

## Summary

* The target is a simple matchmaking web form. The core idea is to test user-controlled input for cross-site scripting (XSS).
* If the app renders submitted fields back into a page without proper handling, injected JavaScript can run in another user’s browser.
* The demonstrated goal is to exfiltrate a session cookie by forcing the browser to send it to an attacker-controlled listener, where the request contains the flag (captured from the inbound HTTP request).

## Key Concepts

* Representation vs encoding aside, here the “data” is form text; the risk is *how the server displays it back*.
* **XSS (Cross-Site Scripting / 跨站脚本)**: injecting JavaScript into a page so it executes in the victim’s browser context.
* **Session cookie (会话 Cookie)**: a browser-stored token used to maintain login/session state. If a cookie is readable by JavaScript and an XSS exists, it can be stolen.
* **Out-of-band capture (带外捕获)**: instead of printing the secret on-screen, the injected script sends it to an external host you control.

## Pattern Cards

### Pattern: “Input → Stored/Reflected → Script execution”

* Trigger: A page accepts user input and later displays it in HTML.
* Weakness: No output encoding/sanitization.
* Observable: Submitting HTML/JS-like content causes unexpected behavior (script execution).

### Pattern: “Browser → Attacker listener”

* Trigger: XSS runs in the victim browser.
* Mechanism: Script initiates an HTTP request to an attacker endpoint and places sensitive data into the URL/query.
* Evidence: Your listener receives an HTTP request containing the leaked value.

## Workflow

1. Open the provided target URL and locate the main form with multiple input fields.
2. Hypothesis: Because the site takes free-form text, test for XSS by injecting a script-like payload into the input fields.
3. Prepare an attacker listener (a simple TCP listener on a chosen port).
4. Submit the form containing the injection across relevant fields.
5. Wait for the callback request to arrive at the listener; inspect the raw HTTP request to locate the flag embedded in it.

Notes:

* The transcript explicitly uses the idea “send `document.cookie` to an attacker endpoint”. In this note, the exact payload is intentionally **sanitized** (safe-writing) and represented only conceptually.

## Command Cookbook

Only include the minimal commands referenced.

```bash
# Start a listener on your attacker box (AUTHORIZED LAB ONLY)
# LISTEN_PORT in the demo is 8000.
nc -lvp LISTEN_PORT
```

Conceptual payload shape (not copy-pastable):

* “A script block that triggers an HTTP request to `http://ATTACKER_HOST:LISTEN_PORT/` and includes the browser cookie value in the request.”

## Evidence

* Form fields were populated with a script-like payload in multiple places (e.g., name/description/partner preference).
* Listener output shows an inbound HTTP request (e.g., `GET /?cookie=...`) received by the attacker machine, confirming the exfiltration path.
* The transcript states the flag is present inside that captured request.

## Takeaways

* The fastest mental model: **“User input becomes HTML” → you should immediately consider XSS.**
* The practical verification loop: submit → trigger render/execution → observe outbound callback.
* Even a “cute” form can become a session-stealing mechanism when output handling is unsafe.

## 7) CN: EN Glossary

* Cross-Site Scripting (XSS)：跨站脚本
* Cookie：浏览器 Cookie / 会话凭证
* Listener：监听器（等待连接/请求的程序）
* Exfiltration：数据外传
* Payload：攻击载荷（这里指注入的脚本片段）

## 8) Appendix: Defensive notes (explicitly *not* from the room text)

* Prefer output encoding (context-aware escaping) over ad-hoc filtering.
* Use `HttpOnly` cookies to reduce JavaScript access (does not eliminate all XSS impact).
* Apply Content Security Policy (CSP) to constrain script execution.
