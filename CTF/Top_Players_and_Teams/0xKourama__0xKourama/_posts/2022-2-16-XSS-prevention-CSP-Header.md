---
title: XSS prevention | CSP
layout: post
categories: [Web-Vulnerabilities,CSP]
tags: [Vulnerability,XSS,CSP]
toc: true
published: true
---
# XSS prevention | CSP Header

| Content                                        |
| ---------------------------------------------- |
| ▶◀ Inputs & Outputs                            |
| ⚪⚫ Whitelisting vs blacklisting              |
| 🛡 X-XSS-Protection                             |
| ⚔ Content Security Policy (CSP) Respose Header |
| 📕 Referance                                   |

## ▶◀ Inputs & Outputs

In general Cross-site scripting prevention can generally be achieved via **two layers of defense** for parameters:

**1. Encode data on output**
**2. Validate input on arrival**

In an **HTML** context, you should convert non-whitelisted values into HTML entities:

```ruby
< converts to: &lt;
> converts to: &gt;
```
In a **JavaScript** string context, non-alphanumeric values should be Unicode-escaped:

```RUBY
< converts to: \u003c
> converts to: \u003e
```

## ⚪⚫ Whitelisting vs blacklisting

Input validation should generally employ whitelists rather than blacklists. For example, instead of trying to make a list of all harmful protocols (javascript, data, etc.), simply make a list of safe protocols (HTTP, HTTPS) and disallow anything not on the list.

---

## 🛡 X-XSS-Protection

The HTTP **X-XSS-Protection** **response** **Header** is a feature of **Internet Explorer**, **Chrome** and **Safari** that stops pages from loading when they detect reflected cross-site scripting (XSS) attacks. These protections are largely **unnecessary in modern browsers** when sites implement a strong **Content-Security-Policy** that **disables** the use of **inline JavaScript** ('**unsafe-inline**').

Syntax

```ruby
X-XSS-Protection: 0
X-XSS-Protection: 1
X-XSS-Protection: 1; mode=block
X-XSS-Protection: 1; report=<reporting-uri>
```
    
**0**
Disables XSS filtering.

**1**
Enables XSS filtering (usually default in browsers). If a cross-site scripting attack is detected, the browser will sanitize the page (remove the unsafe parts).

**1; mode=block**
Enables XSS filtering. Rather than sanitizing the page, the browser will prevent rendering of the page if an attack is detected.

**1; report=<reporting-URI>** (Chromium only)
Enables XSS filtering. If a cross-site scripting attack is detected, the browser will sanitize the page and report the violation. This uses the functionality of the CSP report-uri directive to send a report.

---

## ⚔ Content Security Policy (CSP) Respose Header

Content security policy (**CSP**) is the last line of defense against cross-site scripting.

If your XSS prevention fails, you can use CSP to mitigate XSS by restricting what an attacker can do.
    
The **HTTP Content-Security-Policy response header** allows web site administrators to control resources the user agent is allowed to load for a given page.

With a few exceptions, policies mostly involve specifying server origins and script endpoints. This helps guard against cross-site scripting attacks (Cross-site_scripting).
    
![](https://i.imgur.com/JPjzh1q.jpg)

Implemented via response header:

```ruby
Content-Security-policy: default-src 'self'; img-src 'self' allowed-website.com; style-src 'self';
```

Implemented via meta tag:

```ruby
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src https://*; child-src 'none';">
```
    
Defining resources
CSP works by restricting the origins that active and passive content can be loaded from. It can additionally restrict certain aspects of active content such as the execution of inline javascript, and the use of eval()
    
```ruby
default-src 'none';
img-src 'self';
script-src 'self' https://code.jquery.com;
style-src 'self';
report-uri /__cspreport__
font-src 'self' https://addons.cdn.mozilla.net;
frame-src 'self' https://ic.paypal.com https://paypal.com;
media-src https://videos.cdn.mozilla.net;
object-src 'none';
```
    
### Directives:
**script-src:** This directive specifies allowed sources for JavaScript. This includes not only URLs loaded directly into  elements, but also things like inline script event handlers (onclick) and XSLT stylesheets which can trigger script execution. 

**default-src:** This directive defines the policy for fetching resources by default. When fetch directives are absent in CSP header the browser follows this directive by default. 

**Child-src:** This directive defines allowed resources for web workers and embedded frame contents. 

**connect-src:** This directive restricts URLs to load using interfaces like fetch, websocket, XMLHttpRequest 

**frame-src:** This directive restricts URLs to which frames can be called out. 
    
**frame-ancestors:** This directive specifies the sources that can embed the current page. This directive applies to , , , and  tags. This directive can't be used in  tags and applies only to non-HTML resources. 

**img-src:** It defines allowed sources to load images on the web page.

**font-src:** directive specifies valid sources for fonts loaded using @font-face.

**manifest-src:** This directive defines allowed sources of application manifest files. 

**media-src:** It defines allowed sources from where media objects like , and  can be loaded. 

**object-src:** It defines allowed sources for the <object>, <embed>, and <applet> elements  elements.

**base-uri:** It defines allowed URLs which can be loaded using  element. 

**form-action:** This directive lists valid endpoints for submission from  tags. 

**plugin-types:** It defines limits the kinds of mime types a page may invoke. 

**upgrade-insecure-requests:** This directive instructs browsers to rewrite URL schemes, changing HTTP to HTTPS. This directive can be useful for websites with large numbers of old URL's that need to be rewritten. 

**sandbox:** sandbox directive enables a sandbox for the requested resource similar to the  sandbox attribute. It applies restrictions to a page's actions including preventing popups, preventing the execution of plugins and scripts, and enforcing a same-origin policy.
    
---
    
### Sources:
    
*: This allows any URL except data: , blob: , filesystem: schemes

**self:** This source defines that loading of resources on the page is  allowed from the same domain.

**data:** This source allows loading resources via the data scheme (eg Base64 encoded images)
    
**none:** This directive allows nothing to be loaded from any source.
    
**unsafe-eval:** This allows the use of eval() and similar methods for creating code from strings. This is not a safe practice to include this source in any directive. For the same reason it is named as unsafe.
    
**unsafe-hashes:** This allows to enable specific inline event handlers.
    
**unsafe-inline:** This allows the use of inline resources, such as inline  elements, javascript: URLs, inline event handlers, and inline  elements. Again this is not recommended for security reasons.
    
**nonce:** A whitelist for specific inline scripts using a cryptographic nonce (number used once). The server must generate a unique nonce value each time it transmits a policy.
sha256-<hash>: Whitelist scripts with an specific sha256 hash
    
## Unsafe Scenarios
    
**unsafe-inline**
```ruby
Content-Security-Policy: script-src https://google.com 'unsafe-inline';
```
**Working payload:** `"/><script>alert(1);</script>`

**'unsafe-eval'**
```ruby
Content-Security-Policy: script-src https://google.com 'unsafe-eval';
```
**Working payload:** `<script src="data:;base64,YWxlcnQoZG9jdW1lbnQuZG9tYWluKQ=="></script>`
    
---
    
## 📕 Referance 
    
1. [**hacktricks**](https://book.hacktricks.xyz/pentesting-web/content-security-policy-csp-bypass)

1. [**csp-evaluator**](https://csp-evaluator.withgoogle.com/)

1. [**cspvalidator**](https://cspvalidator.org/#url=https://cspvalidator.org/)
   
1. [**Ebrahem Hegazy**](https://www.youtube.com/watch?v=OcrmPMSjdSw&t=761s)
 
1. [**mozilla CSP**](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)

1. [**mozilla X-XSS-Protection**](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection)
    
1. [**ro**](@sec_r0)
  
1. [**portswigger**](https://portswigger.net/web-security/cross-site-scripting/preventing)
