---
title: Proving Impact Without Full Takeover: A Short XSS Story
date: 2026-01-19
categories: [Web App, XSS, AppSec]
tags: [xss,webapp,appsec,pentest,owasp,escalation,impact]
comments: true
---

## Prelude

Sometime during the last quarter of 2025, I led a web app pentest engagement for an internal application, and I stumbled 
across a reflected XSS vulnerability within a [WYSIWYG](https://en.wikipedia.org/wiki/WYSIWYG) editor used for making complaints. 

Basic XSS is often times dismissed as a low severity vulnerability and as an offensive security engineer, showing 
impact is imperative when communicating findings to the development or triage team.

Therefore, I was fully aware that reporting this vulnerability without showing impact would likely be futile. So I 
thought of ways in which the reflected XSS could be escalated to demonstrate high impact.

In this post, I discuss how I chained a reflected XSS within a WYSIWYG editor’s link feature with a phishing email to 
exfiltrate the cookie of the recipient.

## Caveat

Before getting into the weeds, please note that this post is for educational and ethical purposes. Unauthorized testing 
or misuse of the concepts discussed in this post, without explicit permission is unethical and unlawful.

## Why a Final Pass Matters

Prior to discovering the reflected XSS, I had pretty much tested every major functionality of the application. 
Nevertheless, I almost missed out on testing the complaint email functionality. It was very easy to overlook because 
it was tucked away in an obscure corner of the interface.

Over the past year, I have been intentional about refining my pentest methodology, ensuring that every component of 
an application is tested: especially the ones that are easy to overlook or rarely exercised.

As the testing window drew to a close, I went back through the application to see if I had missed out on something, 
and thank God I did, because that decision ultimately proved critical to uncovering the vulnerability.

## When a Low-Risk Bug Refused to Stay Small

Upon reaching the complaint functionality, I noticed that it uses a WYSIWYG editor for user input, and my first 
instinct was to test the link feature for XSS or injection vulnerabilities.

With just a basic XSS payload, the link field executed and reflected the payload in my browser. A valid 
finding but as mentioned earlier, showing impact is key.

### PoC

I decided to host a web server on my attacker machine and expose it externally through a secure tunnel using 
[LocalXpose](https://localxpose.io/). 
To make the attack more convincing and increase the likelihood of the recipient clicking the XSS-laced link used for 
cookie exfiltration, I crafted a simple phishing email.

Unfortunately, the payload worked, but only the recipient's `twk_uuid` cookie was exfiltrated. The session cookie 
was not, because the `HttpOnly` flag was enabled.

*[Image: xss-3]*
*[Image: xss-2]*
*[Image: xss-4]*{: .center-image}

## Closing Thoughts

From an attacker’s perspective, this would not be considered a complete win, because only the `twk_uuid` cookie was 
exfiltrated; thanks to the `HttpOnly` flag protecting the session cookie. However, one of the primary reasons for 
sharing this experience was to illustrate how a low-risk vulnerability can be escalated to demonstrate real impact.
Even without full session compromise, successfully exfiltrating another user’s cookie was enough to prove real-world 
exploitability and cross-user impact.

Personally, this assessment served as a reminder that effective security testing is not just about identifying flaws, 
but about understanding how they can be abused, communicating risk clearly, and maintaining a disciplined methodology 
that leaves no stone unturned. It also highlights where these kinds of bugs tend to hide: inside obscure, rarely used 
features that are easy to overlook but often worth a closer look.

### Resources
- [Portswigger: XSS Prevention](https://portswigger.net/web-security/cross-site-scripting/preventing)
- [OWASP: Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

