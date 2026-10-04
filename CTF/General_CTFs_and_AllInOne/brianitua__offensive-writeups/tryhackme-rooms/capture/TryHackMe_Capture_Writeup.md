# TryHackMe --- Capture

> **Difficulty:** Easy\
> **Category:** Web Application Security\
> **Topics:** Authentication · Account Enumeration · CAPTCHA · Input
> Validation · Web Enumeration

------------------------------------------------------------------------

## Overview

Capture is an authentication-focused web application room that
demonstrates several common weaknesses found in login mechanisms. The
room revolves around identifying information disclosure within the
authentication process, understanding how CAPTCHA implementations affect
login workflows, and analysing the application's validation logic.

Unlike traditional exploitation rooms, Capture emphasizes analysing
authentication behaviour and recognising how seemingly small
implementation flaws can reveal useful information about the
application's security model.

------------------------------------------------------------------------

## Enumeration

### Port Scan

``` bash
nmap -sV <TARGET_IP>
```

The scan identified an HTTP service running on the target.

### Web Application Reconnaissance

The login portal contained three inputs:

-   Username
-   Password
-   CAPTCHA

After several failed authentication attempts, the application enabled
CAPTCHA verification.

------------------------------------------------------------------------

## Authentication Analysis

### Response Behaviour

The application returned different responses depending on the
authentication state, such as:

-   Invalid username
-   Invalid password
-   Invalid CAPTCHA

These distinct responses leak information about the authentication
workflow.

### CAPTCHA Analysis

Each failed authentication generated a new arithmetic challenge, for
example:

``` text
557 + 33 = ?
```

The HTML response was parsed dynamically to extract the challenge before
solving it.

``` python
m = re.search(r'(\d+)\s*([+\-*/])\s*(\d+)\s*=', page)
```

### HTML Entity Decoding

The application HTML-encoded quotation marks:

``` html
The user &#39;example&#39; does not exist
```

Decoding entities simplified response parsing.

``` python
from html import unescape
page = unescape(response.text)
```

------------------------------------------------------------------------

## Vulnerability Summary

  -----------------------------------------------------------------------
  \#                      Vulnerability           Impact
  ----------------------- ----------------------- -----------------------
  1                       Authentication          Account enumeration
                          responses disclose      
                          excessive information   

  2                       Distinct error messages Information disclosure
                          reveal authentication   
                          state                   

  3                       Predictable arithmetic  Increased attack
                          CAPTCHA                 surface

  4                       Authentication logic    Reconnaissance aid
                          leaks validation flow   
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Lessons & Mitigations

-   Use generic authentication error messages.
-   Implement server-side rate limiting.
-   Combine CAPTCHA with account lockout and monitoring.
-   Perform all authentication checks server-side.

------------------------------------------------------------------------

## Tools Used

-   Nmap
-   Burp Suite
-   Python (`requests`, `re`, `html`)
-   Browser Developer Tools

------------------------------------------------------------------------

## Key Takeaways

Capture demonstrates how small authentication design decisions can
unintentionally expose information that assists attackers during
reconnaissance. Robust authentication should minimize information
disclosure while maintaining usability.
