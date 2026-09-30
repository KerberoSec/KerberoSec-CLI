# 🔌 API Enumeration
## 📋 Contents

- [What is an API: Plain English](#-what-is-an-api--plain-english)
- [Why APIs Are the Most Overlooked Attack Surface](#-why-apis-are-the-most-overlooked-attack-surface)
- [Finding Hidden API Endpoints](#-finding-hidden-api-endpoints)
- [API Authentication: What You'll Encounter](#-api-authentication--what-youll-encounter)
- [Tools for API Enumeration](#️-tools-for-api-enumeration)
- [Recommended API Enumeration Workflow](#-recommended-api-enumeration-workflow)
- [CTF vs Professional Use](#️-ctf-vs-professional-use)

---

APIs are the most overlooked attack surface in modern web security. While everyone is running gobuster against `/admin` and `/login`, the real findings are hiding in `/api/v1/users`, `/api/internal/config`, and endpoints that were never supposed to be public. This is where modern web applications live, and where modern vulnerabilities are found.

---

## 🧠 What is an API: Plain English

API stands for Application Programming Interface. In plain English: it's a way for two pieces of software to talk to each other.

Think of it like a restaurant. You're the customer (the frontend: the website or app you see). The kitchen is the backend: the database, the business logic, the actual data. You don't walk into the kitchen and grab your own food. Instead you talk to a waiter: that's the API. You make a request ("I'd like the pasta"), the waiter takes it to the kitchen, the kitchen prepares it, the waiter brings it back to you.

Every time you use an app: checking your bank balance, scrolling Instagram, ordering from DoorDash: APIs are working behind the scenes. Your app sends a request to an API endpoint, the server processes it, and sends data back.

**A real example:**
```
You open Instagram
Your app sends: GET https://api.instagram.com/v1/feed?user_id=12345
Instagram's server responds with: your feed data in JSON format
Your app displays it as photos and captions
```

That URL: `https://api.instagram.com/v1/feed`: is an API endpoint. It's just a URL that returns data instead of a webpage.

---

## 🎯 Why APIs Are the Most Overlooked Attack Surface

**The problem with modern APIs:**

Most web applications have separated their frontend (what you see) from their backend (the data and logic). The frontend is a React or Angular app that makes API calls. This means:

- The actual functionality lives in API endpoints: not in HTML pages
- Traditional directory busting finds HTML pages: it often misses API endpoints entirely
- API endpoints are frequently undocumented, forgotten, or accidentally exposed
- Developers move fast and leave debug endpoints, internal endpoints, and old API versions running
- Authentication on API endpoints is often inconsistent: the web app checks permissions, but the raw API endpoint sometimes doesn't

**What you find in API endpoints that you don't find in web pages:**
- Raw database records: user data, credentials, internal configurations
- Admin functionality exposed without proper authentication
- Debug endpoints that return stack traces with file paths and credentials
- Internal documentation that reveals the entire API surface
- Old API versions (v1, v2) that were "deprecated" but still running with fewer security controls

---

## 🔒 What Companies Have Done to Protect APIs

Modern companies have gotten smarter. Here's what you'll encounter:

**Rate limiting**: after X requests per minute from the same IP, the server starts returning 429 (Too Many Requests) or silently drops your requests. Slow down your enumeration or use delays.

**API gateways**: a dedicated layer that sits in front of APIs handling authentication, rate limiting, and logging. AWS API Gateway, Kong, and Apigee are common. These make brute forcing harder but don't eliminate misconfigurations.

**JWT authentication**: JSON Web Tokens. Most modern APIs use these instead of session cookies. You need a valid token to access authenticated endpoints. However: JWT implementation vulnerabilities are extremely common (weak secrets, algorithm confusion, none algorithm attacks).

**WAF (Web Application Firewall)**: blocks common attack patterns. Can be bypassed with encoding, header manipulation, and slow enumeration.

**CORS restrictions**: Cross-Origin Resource Sharing. Controls which domains can make API requests. Misconfigured CORS is itself a vulnerability.

**In CTF vs real engagements:**

| Aspect | CTF | Real Engagement |
|---|---|---|
| Rate limiting | Rarely enforced | Almost always present |
| Authentication | Often intentionally weak | JWTs, OAuth, API keys |
| WAF | Usually absent | Common in enterprise |
| Documentation | Sometimes provided | Rarely provided: you find it |
| Scope | Everything on the box | Defined in rules of engagement |

---

## 🔍 Finding Hidden API Endpoints

### Check the obvious paths first
```bash
# Common API paths to always try
/api
/api/v1
/api/v2
/api/v3
/v1
/v2
/rest
/graphql
/swagger
/swagger-ui
/swagger-ui.html
/api-docs
/openapi.json
/openapi.yaml
/docs
/redoc
```
```bash
# gobuster with API-focused wordlist
gobuster dir -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt -t 50

# ffuf for API paths
ffuf -u http://<target>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt
```

---

### Swagger & OpenAPI: The Jackpot

Swagger UI and OpenAPI documentation are interactive API documentation pages that list every endpoint, every parameter, and sometimes let you make live API calls directly from the browser.

If you find `/swagger`, `/swagger-ui`, `/api-docs`, or `/openapi.json`: you have a complete map of the entire API surface handed to you.
```bash
# Check for common documentation endpoints
curl http://<target>/swagger.json
curl http://<target>/openapi.json
curl http://<target>/api-docs
curl http://<target>/v2/api-docs    # Spring Boot common path
```

> 💡 **Swagger on a CTF box is almost always intentional**: it's there for you to find and use. Read every endpoint listed. Look for admin endpoints, user management, file operations, and anything that takes user input.

---

### JavaScript File Analysis

This is the technique most beginners completely miss. Modern web applications load JavaScript files that contain the frontend code, and that code makes API calls. Those API calls contain the endpoint URLs.
```bash
# Find JavaScript files with gobuster
gobuster dir -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -x js

# Download and search for API endpoints
curl http://<target>/app.js | grep -oP '["'"'"']/api/[^"'"'"']+["'"'"']'

# Search for common API patterns
curl http://<target>/app.js | grep -E "(fetch|axios|xhr|http|api|endpoint)"

# Search for hardcoded credentials or API keys
curl http://<target>/app.js | grep -iE "(password|secret|key|token|auth)"
```

**What you're looking for in JS files:**
- API endpoint URLs: `/api/v1/users`, `/internal/admin`
- Hardcoded API keys or tokens
- AWS S3 bucket names or cloud storage URLs
- Internal hostnames or IP addresses
- Debug flags or feature flags

---

### GraphQL: The Modern API

GraphQL is an alternative to REST APIs that's increasingly common. Instead of multiple endpoints, it uses a single endpoint (usually `/graphql`) and lets clients specify exactly what data they want.
```bash
# Check if GraphQL is running
curl -X POST http://<target>/graphql -H "Content-Type: application/json" -d '{"query":"{__typename}"}'

# Introspection query: dumps the entire schema (often left enabled)
curl -X POST http://<target>/graphql -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name fields { name } } } }"}'

# Use graphw00f to detect GraphQL engine
pip3 install graphw00f
graphw00f -d -t http://<target>
```

> 💡 **GraphQL introspection** is like getting the Swagger docs for GraphQL. If it's enabled (it often is in CTF and dev environments), you get a complete map of every query, mutation, and data type available. Always try it.

---

## 🔐 API Authentication: What You'll Encounter

### API Keys

Simple string tokens passed in headers or URL parameters:
```bash
# Common header names
curl -H "X-API-Key: <key>" http://<target>/api/users
curl -H "Authorization: ApiKey <key>" http://<target>/api/users
curl -H "api-key: <key>" http://<target>/api/users

# Sometimes in URL
curl "http://<target>/api/users?api_key=<key>"
```

### JWT (JSON Web Tokens)

JWTs are the most common API authentication mechanism. They look like three base64-encoded sections separated by dots:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
     header                                    payload              signature
```

**Common JWT vulnerabilities:**
```bash
# Decode a JWT without a tool
echo "eyJ1c2VyIjoiYWRtaW4ifQ" | base64 -d

# Use jwt_tool for analysis and attacks
pip3 install jwt_tool
jwt_tool <token>

# Test for none algorithm attack
jwt_tool <token> -X a

# Test for weak secret
jwt_tool <token> -C -d /usr/share/wordlists/rockyou.txt
```

---

## 🛠️ Tools for API Enumeration

| Tool | What it does | Install |
|---|---|---|
| **ffuf** | Fast API endpoint fuzzing | `sudo apt install ffuf` |
| **gobuster** | Directory and API path discovery | `sudo apt install gobuster` |
| **Postman** | Interactive API testing | https://postman.com |
| **Burp Suite** | Intercept and modify API requests | https://portswigger.net/burp |
| **jwt_tool** | JWT analysis and attacks | `pip3 install jwt_tool` |
| **graphw00f** | GraphQL fingerprinting | `pip3 install graphw00f` |
| **Arjun** | Hidden parameter discovery | `pip3 install arjun` |

---

## 🔄 Recommended API Enumeration Workflow
```bash
# Step 1: check for documentation
curl -s http://<target>/swagger.json
curl -s http://<target>/openapi.json
curl -s http://<target>/api-docs
ffuf -u http://<target>/FUZZ -w /usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt

# Step 2: find JavaScript files and extract endpoints
gobuster dir -u http://<target> -w /usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt -x js
curl http://<target>/app.js | grep -E "api|endpoint|fetch|axios"

# Step 3: check for GraphQL
curl -X POST http://<target>/graphql -H "Content-Type: application/json" -d '{"query":"{__typename}"}'

# Step 4: enumerate API versions
ffuf -u http://<target>/api/FUZZ -w /usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt

# Step 5: test unauthenticated access on found endpoints
curl -s http://<target>/api/v1/users
curl -s http://<target>/api/v1/admin
curl -s http://<target>/api/v1/config

# Step 6: if JWT is used: analyze and test it
jwt_tool <token>
```

---

*by SudoChef · Part of the SudoCode Pentesting Methodology Guide*