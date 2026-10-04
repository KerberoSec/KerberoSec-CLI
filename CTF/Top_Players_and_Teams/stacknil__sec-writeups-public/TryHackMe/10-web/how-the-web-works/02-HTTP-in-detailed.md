---
type: resource-note
status: done
created: 2025-11-30
updated: 2026-03-11
tags: [security-writeup, tryhackme, http, web]
source: TryHackMe: HTTP in Detail
platform: tryhackme
room: HTTP in Detail
slug: http-in-detail
path: TryHackMe/10-web/how-the-web-works/02-HTTP-in-detailed.md
topic: 10-web
domain: [web]
skills: [http-basics, response-analysis]
artifacts: [concept-notes]
sanitized: true
description: Learn how HTTP works and how to request content from web servers.
---

# HTTP in Detail

## Summary

```mermaid
sequenceDiagram
    participant C as Client (Browser)
    participant S as Web Server

    C->>S: HTTP Request<br/>GET / HTTP/1.1<br/>Host: tryhackme.com
    S-->>C: HTTP Response<br/>HTTP/1.1 200 OK<br/>Content-Type: text/html

    Note over C,S: Client renders HTML / assets from the response body

```

* **HTTP (HyperText Transfer Protocol)**

  * Application‑layer protocol for transferring web content: HTML, images, video, JSON, etc.

  * Stateless: each request is independent; server does not remember previous ones by default.

  * Runs *usually* on TCP port **80**.

* **HTTPS (HTTP Secure)**

  * HTTP sent over **TLS/SSL**.
  * Provides:

    * **Confidentiality**: traffic is encrypted → passive eavesdroppers cannot read it.

    * **Integrity**: prevents unnoticed tampering in transit.

    * **(Weak) Authentication**: browser can verify it’s talking to the domain named in the certificate, not a random impostor.

  * Runs *usually* on TCP port **443**.

> Key idea: HTTP defines *what* is said; TLS/HTTPS adds *how* it’s protected.

---

## Key Concepts

### 2. URL Structure (Uniform Resource Locator)

```mermaid
flowchart LR
    A[URL 输入: http://tryhackme.com/room] --> B[解析 Scheme / Host / Path]
    B --> C[建立 TCP 连接<br/>默认端口 80 或 443]
    C --> D[发送 HTTP 请求<br/>GET /room HTTP/1.1]
    D --> E[服务器处理请求]
    E --> F[返回 HTTP 响应<br/>状态码 + 头部 + Body]
    F --> G[浏览器渲染页面资源]

```

Example:

```text
http://user:password@tryhackme.com:80/view-room?id=1#task3

```

Breakdown:

* **Scheme / Protocol**: `http`

  * How to access the resource. Common: `http`, `https`, `ftp`, etc.

* **Userinfo (optional)**: `user:password@`

  * Legacy way to embed credentials directly in URL.

  * Mostly discouraged now for security/usability reasons.

* **Host**: `tryhackme.com`

  * Domain name or IP of target web server.

* **Port**: `:80`

  * TCP port to connect to. Defaults:

    * HTTP → 80
    * HTTPS → 443

  * Can be any value 1-65535 if server is configured.

* **Path**: `/view-room`

  * Location or “file” on the server.

  * Often maps to a route in an application rather than a literal file.

* **Query string**: `?id=1`

  * `key=value` pairs giving extra parameters (e.g. `?page=2&sort=date`).

* **Fragment**: `#task3`

  * Client‑side anchor *inside* the returned page.

  * Not sent to server; handled by browser for scrolling or JS routing.

Constraints:

* Each **label** (subdomain or second‑level domain) ≤ 63 characters.

* Full domain name (without scheme/port/path) ≤ 253 characters.

---

### 3. HTTP Messages: Requests & Responses

#### 3.1 Basic request format

```http
GET / HTTP/1.1
Host: tryhackme.com
User-Agent: Mozilla/5.0 Firefox/87.0

Referer: https://tryhackme.com/

```

Structure:

1. **Request line**: `METHOD SP PATH SP HTTP-VERSION`

   Example: `GET / HTTP/1.1`

2. **Headers**: `Header-Name: value` (one per line).

3. **Blank line** (CRLF CRLF) to mark end of headers.

4. **Optional body** (for e.g. POST/PUT with form data or JSON).

#### 3.2 Basic response format

```http
HTTP/1.1 200 OK
Server: nginx/1.15.8
Date: Fri, 09 Apr 2021 13:34:03 GMT

Content-Type: text/html
Content-Length: 98

<html>
  <head><title>TryHackMe</title></head>

  <body>Welcome To TryHackMe.com</body>

</html>

```

Structure:

1. **Status line**: `HTTP-VERSION SP STATUS-CODE SP REASON-PHRASE`.

2. **Headers** (meta‑information about the response).

3. **Blank line**.
4. **Body**: the actual content (HTML, JSON, etc.).

Important headers in this example:

* `Content-Type`: tells client how to interpret body (`text/html`, `application/json`, etc.).

* `Content-Length`: number of bytes in body → lets client know when it’s fully received.

---

```mermaid
sequenceDiagram
    participant C as Client (Browser)
    participant S as Web Server

    %% Step 1: 访问登录页
    C->>S: GET /login HTTP/1.1
    S-->>C: 200 OK<br/>返回带登录表单的 HTML

    %% Step 2: 提交用户名密码
    C->>S: POST /login HTTP/1.1<br/>username=thm&password=letmein
    S-->>C: 200 OK<br/>Set-Cookie: session=abcdef123456<br/>HTML: "Welcome Back"

    Note over C: 浏览器把 session=abcdef123456<br/>存到本地 Cookie Jar

    %% Step 3: 后续访问携带 Cookie
    C->>S: GET /profile HTTP/1.1<br/>Cookie: session=abcdef123456
    S-->>C: 200 OK<br/>返回个性化页面 (如 "Welcome THM")

```

---

### 4. HTTP Methods

The method expresses **intent** of the request.

* **GET**

  * Retrieve a resource.
  * Usually no body; parameters via path or query string.

  * Should be *safe* (no state change) and *idempotent*.

* **POST**

  * Submit data, often to **create** a new resource (e.g. register user, submit form).

  * Data usually in request body.

* **PUT**

  * **Replace / update** a resource with provided data.

  * Ideally idempotent: repeated calls have same effect.

* **DELETE**

  * Remove a resource.

> In real applications you mostly see GET and POST; PUT/DELETE appear in RESTful APIs.

---

### 5. HTTP Status Codes

First digit indicates category:

* **1xx: Informational**: request received, continue (rare today).

* **2xx: Success**: request processed successfully.

* **3xx: Redirection**: client must make another request.

* **4xx: Client error**: problem with request (missing data, no auth, etc.).

* **5xx: Server error**: server failed to handle a valid request.

Common codes:

* **200 OK**: Standard success.
* **201 Created**: Resource successfully created (e.g. new user/blog post).

* **301 Moved Permanently**: Resource moved; update links/search engines.

* **302 Found**: Temporary redirect.

* **400 Bad Request**: Malformed or invalid request.

* **401 Unauthorized**: Not authenticated; need to log in.

* **403 Forbidden**: Authenticated but not allowed (or completely blocked).

* **404 Not Found**: Resource does not exist.

* **405 Method Not Allowed**: URL exists but method not supported (e.g. GET on a POST‑only endpoint).

* **500 Internal Server Error**: Generic server failure.

* **503 Service Unavailable**: Overloaded or maintenance.

---

### 6. Headers (Request vs Response)

Headers are key: value metadata lines.

#### 6.1 Common request headers

* **Host**

  * Which virtual host we want (many domains can share an IP).

* **User-Agent**

  * Browser / client identifier + version.

* **Content-Length**

  * Size of body in bytes (when sending data).

* **Accept-Encoding**

  * Compression algorithms the client supports (e.g. `gzip`, `br`).

* **Cookie**

  * Previously stored cookies relevant to this domain.

#### 6.2 Common response headers

* **Set-Cookie**

  * Ask browser to store a cookie.
* **Cache-Control**

  * How/if the response should be cached and for how long.

* **Content-Type**

  * Type of payload: `text/html`, `application/json`, etc.

* **Content-Encoding**

  * Compression applied (e.g. `gzip`).

---

### 7. Cookies & Stateless HTTP

HTTP itself is stateless: the server does not remember prior requests.

**Cookies** give the illusion of state:

1. Client makes a request without cookies.

2. Server responds with `Set-Cookie: name=adam`.

3. Browser stores `name=adam` in its cookie jar for this domain.

4. On subsequent requests, browser automatically sends:

   ```http
   Cookie: name=adam

   ```

5. Server uses cookie to recognize the user, persist sessions or preferences.

Properties:

* Cookie value is usually an opaque **session token**, not raw credentials.

* Can have attributes: `Expires`, `Max-Age`, `Secure`, `HttpOnly`, `SameSite`, etc. (not heavily covered in this room, but crucial for security).

Cookie‑related headers:

* Save to browser: **`Set-Cookie`** (response).

* Send back to server: **`Cookie`** (request).

---

### 8. Mini Practical (From Room Emulator)

Conceptual mapping rather than step‑by‑step GUI:

1. **GET /room** → returns flag `THM{YOU'RE_IN_THE_ROOM}`.

   → Demonstrates a simple GET on a path.

2. **GET /blog?id=1**

   → Query string parameter used to select blog post.

3. **DELETE /user/1**

   → Example of DELETE method acting on `/user/1`.

4. **PUT /user/2** with body `username=admin`

   → Example of updating existing user via PUT + body.

5. **POST /login** with body `username=thm&password=letmein`

   → Typical login form submission using POST.

These exercises tie together: URL structure, methods, status codes and simple request bodies.

---

### 9. Quick EN: ZH Glossary

* **HTTP (HyperText Transfer Protocol)**: 超文本传输协议
* **HTTPS (HTTP Secure)**: 安全超文本传输协议（加密+认证）
* **URL (Uniform Resource Locator)**: 统一资源定位符
* **Method**: 请求方法（GET / POST / PUT / DELETE 等）
* **Status code**: 状态码（200, 404, 500…）
* **Header**: 头部字段（元数据）
* **Body**: 报文实体 / 内容
* **Cookie**: 浏览器本地小数据，用于会话与偏好
* **Session token**: 会话令牌（通常保存在 Cookie 中）
* **Cache**: 缓存

---

> Mental model: **DNS maps names → IPs; HTTP/HTTPS defines how browsers and servers talk once they’re connected.**  Mastering requests, responses, headers and cookies is the foundation for all later web hacking and defence.
