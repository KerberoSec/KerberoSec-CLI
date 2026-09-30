---
title: Host Header Injection (HHI)
layout: post
categories: [Web-Vulnerabilities,host-header-injection]
tags: [Vulnerability,host-header-injection]
toc: true
published: true
---

# Host Header Injection (HHI)

| Content             |
| ------------------- |
| 📚 What is HHI ?    |
| 🤔 Why HHI Happen ? |
| 💥 Exploitation     |
| ⚔ Impact            |
| 🔎 How To Find      |
| ⚙ Remediation       |
| 🛠 Tools             |
| 📕 Referance        |
| 🔬 Labs             |

## 📚 What is HHI ?

### Definition

A web server commonly hosts several web applications on the same IP address, referring to each application via the virtual host. In an incoming HTTP request, web servers often dispatch the request to the target virtual host based on the value supplied in the Host header, Without proper validation of the header value.

![](https://i.imgur.com/sHLYH0b.png)

### What is Host Header Injection

if you want to visit login page in `https://example.com/login`
The Host Header in Request will be like that:

```ruby
GET /login HTTP/1.1
Host: example.com
```

### Virtual hosting
One possible scenario is when a single web server hosts multiple websites or applications. This could be multiple websites with a single owner, but it is also possible for websites with different owners to be hosted on a single, shared platform. This is less common than it used to be, but still occurs with some cloud-based SaaS solutions.

In either case, although each of these distinct websites will have a different domain name, they all share a common IP address with the server. Websites hosted in this way on a single server are known as "virtual hosts".

To a normal user accessing the website, a virtual host is often indistinguishable from a website being hosted on its own dedicated server.

We can even take this a step further and try to identify all sites that are hosted on the target web server by performing virtual host enumeration. How to enumerate virtual hosts? We could use tools such as these:

* [**ffuf**](https://github.com/ffuf/ffuf)
* [**http-vhosts**](https://nmap.org/nsedoc/scripts/http-vhosts.html)
* [**virtual-host-discovery**](https://github.com/jobertabma/virtual-host-discovery)

---
## 🤔 Why HHI Happen ?

* HTTP headers are dynamically generated based on the input of the user. User inputs can be edited, or spoofed by attackers. It is accessible by everyone.
* If websites fail to correctly validate or verify the HTTP Host headers.

---
## 💥 Exploitation 

Initial testing is as simple as supplying another domain (i.e. attacker.com) into the Host header field. It is how the web server processes the header value that dictates the impact. The attack is valid when the web server processes the input to send the request to an attacker-controlled host that resides at the supplied domain, and not to an internal virtual host that resides on the web server.

```ruby
GET / HTTP/1.1
Host: www.attacker.com
```

In the simplest case, this may cause a 302 redirect to the supplied domain.

```ruby
HTTP/1.1 302 Found
Location: http://www.attacker.com/login.php
```
Alternatively, the web server may send the request to the first virtual host on the list.

---
## ⚔ Impact

the attacker can supply invalid input to cause the webserver to:

- Dispatch requests to the **first virtual host** on the list.
- Perform a **redirect to an attacker-controlled domain.**
- Perform web **cache poisoning.**
- Manipulate **password reset functionality.**
- Allow access to **virtual hosts** that were **not intended to be externally accessible** lead to **information disclosure**
- **Business logic flaws** in specific functionality
- Exploiting **classic server-side vulnerabilities**

![](https://i.imgur.com/mbVBDrL.png)

![](https://i.imgur.com/GApQ7uA.png)

---
## 🔎 How To Find

Assess if the Host header is being parsed dynamically in the application.
Bypass security controls that rely on the header.

### Some bypass Techniques

#### X-Forwarded-Host Header Bypass

In the event that Host header injection is mitigated by checking for invalid input injected via the Host header, you can supply the value to the **X-Forwarded-Host** header.

```ruby
GET / HTTP/1.1
Host: www.example.com
X-Forwarded-Host: www.attacker.com
```

And there are some another Headers to bypass

```ruby
X-Forwarded-Host: evil.com
X-Forwarded-Port
X-Forwarded-Scheme
Origin: null
Origin: [siteDomain].attacker.com
X-Frame-Options: Allow
X-Forwarded-For: 127.0.0.1
X-Client-IP: 127.0.0.1
Client-IP: 127.0.0.1
X-Host
X-Forwarded-Server
X-HTTP-Host-Override
Forwarded
X-Host: evil.com
X-Server: evil.com
X-Forwarded-For: evil.com
X-Forwarded-For
X-Forwarded-Host
X-Forwarded-Proto
```

#### Others

```ruby
GET /example HTTP/1.1
Host: vulnerable-website.com
Host: bad-stuff-here # duplicate
----------------------------------
GET /example HTTP/1.1
Host: bad-stuff-here # duplicate
Host: vulnerable-website.com
----------------------------------
GET https://vulnerable-website.com/ HTTP/1.1
Host: bad-stuff-here # Supply an absolute URL
----------------------------------
GET https://vulnerable-website.com/ HTTP/1.1
Host: intranet.example.com # Accessing internal websites with virtual host brute-forcing
----------------------------------
GET /example HTTP/1.1
Host: vulnerable-website.com
X-Forwarded-Host: bad-stuff-here #  X-Forwarded-Host Header
```

---
## ⚙ Remediation

1. To avoid Host header attacks:
1. simply don’t trust the Host header. 
1. If you must use the Host header to identify the location of the web server validate the Host header. 
1. use a whitelist of allowed hostnames.
1. Don't support Host override headers.

---
## 🛠 Tools

[**Host-Header-Attack-Test:**](https://github.com/keramatAlijani/Host-Header-Attack-Test) A simple code for detects Host header vulnerability

[**xforwardy:**](https://github.com/roottusk/xforwardy) Host Header Injection Scanner

[**BHHIT-v1.0:**](https://github.com/briskinfosec/BHHIT-v1.0) BHHIT is a automated Host-Header-Injection attack detector.

---
## 📕 Referance

[**OWASP**](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/17-Testing_for_Host_Header_Injection)

[**Acunetix**](https://www.acunetix.com/blog/articles/automated-detection-of-host-header-attacks/)

[**Briskinfosec**](https://www.briskinfosec.com/blogs/blogsdetail/Host-Header-Attack)

[**Portswigger**](https://portswigger.net/web-security/host-header)

[**Portswigger Exploiting**](https://portswigger.net/web-security/host-header/exploiting)

[**Portswigger Password Reset Poisoning**](https://portswigger.net/web-security/host-header/exploiting/password-reset-poisoning)

---

## 🔬 Labs

[**portswigger**](https://portswigger.net/web-security/host-header)

[**application.security**](https://application.security/free-application-security-training/owasp-top-10-host-header-injection)

[**OWASP Broken Web Applications Project**](https://sourceforge.net/projects/owaspbwa/) Install this Machine and will have a lot of Labs like **DVWA**, **BWAPP** and **Webgoat** etc
