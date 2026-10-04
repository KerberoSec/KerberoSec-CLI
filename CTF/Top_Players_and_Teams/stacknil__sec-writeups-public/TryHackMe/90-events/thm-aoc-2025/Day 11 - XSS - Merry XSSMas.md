---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-12
tags: [security-writeup, tryhackme, aoc2025, xss]
source: TryHackMe: Advent of Cyber 2025 Day 11
platform: tryhackme
room: Advent of Cyber 2025 Day 11: XSS: Merry XSSMas
slug: aoc-2025-day-11-xss-merry-xssmas
path: TryHackMe/90-events/thm-aoc-2025/Day 11: XSS: Merry XSSMas.md
topic: 90-events
domain: [web]
skills: [xss, input-validation]
artifacts: [lab-notes]
sanitized: true
---

# Advent of Cyber 2025 Day 11: XSS: Merry XSSMas

## Summary

Cross-Site Scripting (XSS) is a **web application vulnerability** where **untrusted input** is interpreted by the browser as **executable JavaScript**, enabling attackers to run code in a victim’s browser context (same origin).

In this lab, the “message portal” demonstrates two core variants:

* **Reflected XSS**: payload is *immediately reflected* in the response.
* **Stored XSS**: payload is *persisted server-side* (e.g., DB) and executed for anyone who loads the affected page.

## Key Concepts

### Threat Model

**Attacker goal**: execute JavaScript in the victim’s browser.

Typical impacts (impact surface depends on app/session design):

* Session/token theft (if accessible to JS)
* Account actions as victim (CSRF-like effects with victim cookies)
* UI redress / phishing popups
* Content defacement
* Pivot into further browser-side exploitation

### Types (Conceptual)

#### Reflected XSS

Request contains payload → server reflects it in HTML → browser executes.

**ASCII flow**

```
User input (query string / form)
  -> Server response reflects input
    -> Browser parses HTML
      -> JS executes immediately
```

#### Stored XSS

Payload saved → later rendered from storage → browser executes for each visitor.

**ASCII flow**

```
User input (comment/message)
  -> Server stores payload (DB)
    -> Page loads content from DB
      -> Browser renders & executes payload
```

#### (Bonus) DOM-Based XSS

No server reflection required: client-side JS reads attacker-controlled data and writes to dangerous DOM sinks.

### Lab Workflow (Attack Perspective)

#### 1) Recon: find an input that reflects

* Use the **search bar**.
* Submit a benign marker like `test`.
* If the results page prints your input back, you have a candidate reflection point.

#### 2) Prove Reflected XSS

Test payload:

```html
<script>alert('Reflected Meow Meow')</script>
```

Expected: alert popup triggered **only** for that request.

**Room behavior**: after a successful reflected execution, the page reveals the *Reflected XSS flag* (copy it from the UI).

#### 3) Prove Stored XSS

Use the **send message** form (a persisted input path).

Test payload:

```html
<script>alert('Stored Meow Meow')</script>
```

Expected: after submission, **refresh / revisit** the page → alert triggers again without re-submitting.

**Room behavior**: after a successful stored execution, the page reveals the *Stored XSS flag* (copy it from the UI).

### Blue-Team View: What to Look for in Logs

#### High-signal indicators

* Literal strings: `<script>`, `</script>`, `onerror=`, `onload=`, `javascript:`
* Unusual encoding patterns: `%3Cscript%3E`, HTML entities (`&lt;script&gt;`), mixed/stacked encodings
* Suspicious keywords: `document.cookie`, `fetch(`, `XMLHttpRequest`, `atob(`, `eval(`

#### Triage logic (SOC-style)

Use a quick decision frame:

* **Severity**: does it execute? does it target authenticated users?
* **Time/Frequency**: burst activity? repeated payload tests?
* **Context/Stage**: recon → exploit attempt → persistence (stored) → follow-on actions
* **Impact**: which pages/users are affected? public vs authenticated admin pages?

### Defensive Engineering (Fixes That Actually Work)

#### Core principle: context-aware output encoding

Treat input as *data*, not *code*. Apply the correct encoding for the output context:

* HTML body context
* HTML attribute context
* JS context
* URL context

#### Avoid dangerous DOM sinks

* Prefer `textContent` over `innerHTML` for inserting user-controlled content.
* If you must render limited HTML, use a **well-maintained sanitizer** (allowlist-based).

#### Harden cookies/session

Set cookies to reduce XSS impact:

* `HttpOnly` (blocks JS access)
* `Secure` (HTTPS only)
* `SameSite` (limits cross-site sending)

#### Add defense-in-depth

* **CSP (Content Security Policy)** to restrict script sources and reduce exploitability.
* Rate limit / bot controls to reduce automated payload spraying.
* WAF rules as a *band-aid*, not a primary fix.

## Common Pitfalls

* Relying on blacklist filtering (`<script>` only) → bypassed via event handlers, SVG, encodings.
* “Sanitize on input” only → you still need correct output encoding per context.
* Storing raw HTML/JS and hoping UI will be safe.
* Forgetting admin panels: stored XSS often targets moderators/admins.

## Room Q&A (Conceptual)

* **Which type of XSS requires payload to be persisted on the backend?** → **Stored XSS**.

## Related Tools

* Burp Suite (Proxy/Repeater/Intruder): payload delivery & request inspection
* Browser DevTools: DOM inspection, CSP errors, network traces
* OWASP ZAP: automated scanning + passive checks

## Further Reading

* OWASP Cheat Sheet Series: XSS Prevention, DOM-based XSS Prevention
* OWASP Cheat Sheet Series: Content Security Policy
* MDN Web Docs: Content Security Policy (CSP)
* MDN Web Docs: Set-Cookie attributes (HttpOnly/Secure/SameSite)

## Small Chinese Glossary (术语对照)

* Cross-Site Scripting (XSS)：跨站脚本
* Reflected XSS：反射型 XSS
* Stored XSS：存储型 XSS
* DOM-based XSS：基于 DOM 的 XSS
* Output Encoding（输出编码）：按输出上下文转义
* Sanitization（输入净化/清理）：移除或中和危险片段（通常需 allowlist）
* CSP (Content Security Policy)：内容安全策略
* Sink / Source（汇/源）：DOM 中“读取不可信数据/写入危险位置”的点
