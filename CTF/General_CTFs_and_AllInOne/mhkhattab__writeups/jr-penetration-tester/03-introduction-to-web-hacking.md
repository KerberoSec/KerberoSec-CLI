# Module 3: Introduction to Web Hacking

> **Portfolio scope:** Technical learning notes on application mapping, content discovery, subdomain enumeration, authentication, authorization, file inclusion, SSRF, XSS, race conditions, command injection, and SQL injection. Examples are restricted to authorized labs.

## Module coverage

This module covered the core web-application testing workflow:

1. walk the application;
2. discover hidden content and alternate hosts;
3. understand authentication and session state;
4. test authorization boundaries;
5. identify dangerous input paths;
6. validate vulnerabilities safely;
7. document impact and remediation.

The central technique is **source → transformation → sink → control**. Instead of spraying payloads, I identify where input originates, how the application processes it, which sensitive operation receives it, and whether a context-appropriate control is present.

---

## 1. Application mapping

### Build an endpoint inventory

Record:

- URL and HTTP method;
- authentication requirement;
- user role;
- parameters and content type;
- response status and schema;
- state-changing behavior;
- referenced object identifiers;
- client-side API calls;
- technology clues;
- error behavior;
- external services.

Example table:

| Method | Endpoint | Role | Inputs | Security interest |
|---|---|---|---|---|
| GET | `/api/profile` | User | cookie/token | session and data exposure |
| GET | `/api/orders/{id}` | User | path ID | object authorization |
| POST | `/api/admin/users` | Admin | JSON | function authorization, mass assignment |
| POST | `/api/import` | Manager | file | parser, file inclusion, command execution |
| POST | `/api/preview` | User | URL | SSRF and outbound controls |

### Browser-side inspection

Inspect:

- developer tools Network tab;
- JavaScript bundles and source maps;
- forms and hidden fields;
- cookies and storage;
- API base URLs;
- feature flags;
- comments and error messages;
- WebSocket or GraphQL traffic.

Client-side code is not a trusted control, but it often reveals endpoints and workflow assumptions.

### Baseline requests

Capture a normal request before testing. Record dynamic elements such as CSRF tokens, nonces, timestamps, and session cookies. Modify one variable at a time to make interpretation reliable.

---

## 2. Content discovery

Hidden content can include backups, administration panels, old versions, API documentation, debug endpoints, and source-control artifacts.

### Manual checks

- `/robots.txt`;
- `/sitemap.xml`;
- common API documentation paths;
- linked JavaScript and source maps;
- server headers and error pages;
- backup filename patterns;
- historical URLs from authorized sources.

### Wordlist-based discovery

Authorized lab example:

```bash
gobuster dir \
  -u http://TARGET/ \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php,txt,html \
  -s 200,204,301,302,307,401,403 \
  -o evidence/content-discovery.txt
```

Interpretation matters:

- `200` may be a real page or a custom “not found” response;
- `301/302` may reveal canonical paths;
- `401` confirms authentication is required;
- `403` confirms a resource exists but is forbidden;
- response length and title help identify false positives.

Rate and concurrency should be controlled to avoid service impact.

---

## 3. Subdomain enumeration

Subdomains may represent environments or separate trust zones:

- `api.example.test`;
- `admin.example.test`;
- `dev.example.test`;
- `staging.example.test`;
- `files.example.test`.

### Passive sources

- certificate transparency;
- DNS records;
- public documentation;
- source-code references;
- search engines;
- cloud asset inventory supplied by the client.

### Active DNS enumeration

In an authorized lab:

```bash
ffuf -w subdomains.txt \
  -u http://TARGET/ \
  -H 'Host: FUZZ.example.test' \
  -fs <baseline-size>
```

This tests virtual hosts when multiple sites share an IP. First obtain a random-host baseline and filter by size/status to avoid false positives.

### Risks to investigate

- abandoned DNS records and subdomain takeover;
- development systems exposed publicly;
- weaker authentication on alternate hosts;
- inconsistent security headers;
- internal hostnames leaked through certificates or errors.

---

## 4. Authentication testing

### Authentication attack surface

- login;
- registration;
- password reset;
- MFA enrollment and recovery;
- remember-me functions;
- session renewal;
- logout;
- API token creation;
- SSO/OAuth callbacks.

### Testing questions

- Are usernames enumerable by message, status, or timing?
- Are login attempts rate-limited by user and source?
- Does password reset use single-use, short-lived tokens?
- Does resetting a password revoke existing sessions?
- Can MFA be bypassed through an alternate endpoint or recovery path?
- Does session ID rotate after login?
- Are cookies marked `Secure`, `HttpOnly`, and suitable `SameSite`?
- Are token issuer, audience, expiry, and algorithm validated?
- Can an inactive or disabled account retain access?

### Session fixation test

1. obtain a pre-authentication session cookie;
2. authenticate normally;
3. compare the session identifier;
4. confirm it changed;
5. test whether the old identifier remains valid.

A secure system rotates the session at privilege change and invalidates the old one.

---

## 5. Authorization and IDOR

### Object-level authorization

An IDOR appears when the application uses a client-controlled object reference without checking ownership or permission.

Example:

```http
GET /api/v1/documents/1248
Authorization: Bearer <user-A-token>
```

Testing methodology:

1. create documents with user A and user B;
2. request user A’s object normally;
3. change only the object ID to user B’s object;
4. test read, update, delete, and download;
5. test nested and bulk endpoints;
6. inspect status, body, and side effects;
7. verify audit logging.

Do not assume random UUIDs are authorization. They reduce guessing but do not enforce policy.

### Function-level authorization

Test direct access to administrator or privileged functions, alternate HTTP methods, old API versions, and hidden routes. The server must verify the caller’s permission for every action.

### Tenant isolation

In multi-tenant systems, confirm tenant context is derived from trusted identity or server-side mapping, not a modifiable header or request field.

---

## 6. File inclusion and path traversal

### Root cause

User input influences a filesystem path or included resource without correct containment.

Potential patterns:

```text
?page=about.php
?file=../../../../etc/passwd
?template=user-selected-value
```

### Testing considerations

- local versus remote inclusion;
- path normalization;
- URL encoding and double decoding;
- null-byte behavior in legacy stacks;
- wrapper/protocol handlers;
- fixed prefixes or suffixes;
- permissions of the application account;
- whether inclusion executes or only reads content.

### Safe lab validation

Use known non-sensitive lab files and stop after proving read or include behavior. Avoid collecting real secrets.

### Remediation

- never map raw user input to filesystem paths;
- use server-side IDs mapped to approved resources;
- canonicalize and verify paths remain under a fixed root;
- use allow-lists;
- remove unnecessary interpreter wrappers;
- run with minimal filesystem permissions;
- isolate uploaded content from executable paths.

---

## 7. Server-side request forgery (SSRF)

### Root cause

The server fetches a user-controlled URL or destination. Common features:

- URL preview;
- webhook validation;
- image import;
- PDF generation;
- cloud-storage import;
- feed readers;
- proxy endpoints.

### Test methodology

1. identify the server-side fetch behavior;
2. use a controlled lab listener or collaboration service;
3. confirm DNS and HTTP request from the target;
4. test allowed schemes and redirects;
5. test loopback, private, link-local, and metadata ranges only where the lab permits;
6. evaluate response reflection, timing, and blind behavior;
7. inspect egress logging and controls.

### Bypass categories

- alternate IP representations;
- IPv6 forms;
- DNS rebinding;
- redirects;
- URL parser disagreement;
- embedded credentials;
- mixed encoding;
- allowed hostname resolving to prohibited address.

### Remediation

- allow-list destinations where possible;
- parse and canonicalize once;
- validate scheme, hostname, resolved IP, and redirect target;
- block prohibited address ranges;
- enforce egress proxy/firewall policy;
- restrict response size and time;
- sandbox content parsing;
- log outbound requests.

---

## 8. Cross-site scripting (XSS)

### Types

- **Reflected:** payload returns in the immediate response.
- **Stored:** payload is saved and rendered to other users.
- **DOM-based:** client-side JavaScript moves untrusted data into a dangerous DOM sink.

### Context matters

The correct defense depends on where data is inserted:

- HTML text;
- HTML attribute;
- JavaScript string;
- CSS;
- URL;
- DOM API.

A payload that works in one context may be harmless in another.

### Testing workflow

1. use a harmless unique marker;
2. locate reflection or storage;
3. determine output context;
4. inspect encoding and sanitization;
5. test whether dangerous characters survive;
6. confirm execution only in the authorized lab;
7. evaluate victim roles and session protections.

### Remediation

- context-aware output encoding;
- safe templating with auto-escaping;
- avoid dangerous sinks such as `innerHTML` for untrusted data;
- sanitize rich HTML with a maintained library;
- Content Security Policy as defense in depth;
- `HttpOnly` cookies to reduce session theft impact;
- input validation for expected formats.

---

## 9. Race conditions

### Root cause

A system checks state and then changes it without atomicity, allowing concurrent requests to violate a rule.

Examples:

- redeeming one coupon multiple times;
- withdrawing beyond a balance;
- bypassing one-time token use;
- creating duplicate privileged actions;
- time-of-check to time-of-use file issues.

### Testing methodology

1. understand the expected state transition;
2. capture the valid request;
3. send controlled concurrent requests in the lab;
4. inspect resulting state, not only responses;
5. repeat to account for timing;
6. avoid service exhaustion.

### Remediation

- database transactions;
- unique constraints;
- atomic compare-and-set operations;
- idempotency keys;
- server-side locking;
- state-machine validation;
- replay protection.

Rate limiting alone may reduce exploitation but does not fix the underlying concurrency flaw.

---

## 10. Command injection

### Root cause

Untrusted input reaches a shell or command interpreter.

Unsafe pattern:

```python
os.system("ping -c 1 " + hostname)
```

### Testing logic

Determine:

- operating system and shell context;
- quoting and delimiters;
- whether output is reflected;
- blind timing or out-of-band behavior;
- privileges of the process;
- network and filesystem restrictions.

Use harmless proof commands in a lab, such as displaying the current identity. Do not use destructive or persistent actions.

### Remediation

- avoid shell execution;
- use library functions;
- pass argument arrays with `shell=False`;
- allow-list expected values;
- run the process with minimal privileges;
- sandbox converters and parsers;
- enforce time and resource limits;
- restrict egress.

---

## 11. SQL injection

### Root cause

Untrusted input changes the structure of a database query.

Unsafe conceptual query:

```python
query = "SELECT * FROM users WHERE username='" + username + "'"
```

### Detection categories

- error-based;
- union-based;
- boolean blind;
- time-based blind;
- stacked queries where supported;
- second-order injection;
- injection in JSON, headers, cookies, or stored values.

### Testing methodology

1. establish baseline behavior;
2. identify parameter type and query context;
3. use syntax errors or boolean differences carefully;
4. confirm through repeated controlled observations;
5. minimize data retrieval;
6. determine database account privilege;
7. document exact request and response evidence.

### Remediation

- prepared statements/parameterized queries;
- safe query builders;
- allow-list dynamic identifiers such as sort columns;
- least-privileged database accounts;
- consistent error handling;
- SAST and negative tests;
- monitoring for injection patterns as detection, not primary prevention.

---

## 12. Integrated web assessment workflow

1. define roles and test accounts;
2. crawl and map normal workflows;
3. enumerate hidden content and virtual hosts;
4. inspect client-side code;
5. build endpoint/parameter inventory;
6. test authentication and session lifecycle;
7. test object and function authorization with multiple users;
8. trace input to sensitive sinks;
9. test business logic and concurrency;
10. review deployment configuration and headers;
11. correlate findings with logs;
12. clean up and report.

---

## Common mistakes

- launching payloads before mapping the application;
- using only one user account for authorization testing;
- treating a hidden endpoint as protected;
- relying on response text without checking state change;
- confusing random identifiers with access control;
- using generic sanitization instead of sink-specific defenses;
- ignoring redirects and DNS resolution in SSRF testing;
- testing XSS without understanding context;
- exploiting race conditions with uncontrolled load;
- retrieving excessive data after proving SQL injection.

---

## Portfolio takeaway

I learned to test web applications through structured mapping, multi-user authorization checks, and source-to-sink reasoning. The technical goal is to understand why the server behaves insecurely and identify the design or implementation control that should prevent it.

## References

- TryHackMe Jr Penetration Tester (Legacy): https://tryhackme.com/path/outline/jrpenetrationtester-legacy
- OWASP Web Security Testing Guide: https://owasp.org/www-project-web-security-testing-guide/
- OWASP PortSwigger Web Security Academy: https://portswigger.net/web-security
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
