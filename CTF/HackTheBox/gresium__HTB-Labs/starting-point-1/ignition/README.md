# Hack The Box: Ignition (Starting Point)

## Overview
**Ignition** is a Hack The Box Starting Point machine designed to introduce basic **web enumeration**, **virtual host discovery**, **directory brute-forcing**, and **credential guessing** against a real-world web application stack.

The machine focuses on identifying a virtual host: based web service, discovering an exposed **Magento** admin panel, and gaining administrative access using weak credentials.

- **Difficulty:** Starting Point  
- **Category:** Web / Linux  
- **Platform:** Hack The Box  
- **Key Skills:** Nmap, HTTP enumeration, virtual hosts, directory brute force, credential attacks

---

## Service Enumeration

An initial TCP scan shows a single exposed web service:

- **Port 80** running **nginx 1.14.2**

Visiting the server directly by IP returns an HTTP **302 redirect**, indicating the application expects a specific virtual host rather than direct IP access.

---

## Virtual Host Discovery

Inspection of HTTP headers and responses reveals the site expects to be accessed via a hostname instead of an IP address.

The discovered virtual host is: ignition.htb

To resolve this locally, the hostname is mapped manually using the system hosts file: /etc/hosts 

Once added, the website becomes accessible through the expected domain.

---

## Web Application Enumeration

With the correct virtual host configured, directory brute-forcing is performed against the web server.

This reveals an exposed **Magento** administration interface located at: http://ignition.htb/admin

Magento is a widely used e-commerce platform and a common target when default or weak credentials are present.

---

## Authentication Weakness

Research into Magento password requirements combined with common password lists reveals that the admin panel is protected by weak credentials.

Using a commonly reused password, administrative access is successfully obtained.

- **Admin Password Identified:** `qwerty123`

This grants full access to the Magento backend.

---

## Exploitation Outcome

After authenticating as an administrator:

- Full administrative control over the Magento application is achieved
- The **root flag** is accessible via the admin interface
- The machine is considered fully compromised

---

## Key Takeaways

- Virtual host misconfigurations can hide entire applications
- HTTP redirects often indicate hostname-based routing
- Admin panels should never be exposed without strong authentication
- Weak passwords remain one of the most common real-world attack vectors

---

## Summary

Ignition demonstrates how **basic enumeration**, **hostname analysis**, and **credential hygiene failures** can lead to full compromise without advanced exploitation techniques.

This machine reinforces the importance of:
- Proper virtual host configuration
- Strong administrative passwords
- Limiting exposed management interfaces

---

## Status

✅ **Root flag owned**

