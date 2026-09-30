---
status: done
created: 2026-04-12
updated: 2026-04-12
date: 2026-04-12
platform: tryhackme
room: IDOR
slug: idor
path: notes/10-web/idor.md
topic: 10-web
domain: [web-app-security, access-control]
skills: [idor, broken-access-control, http-traffic-inspection, enum]
artifacts: [concept-notes, pattern-card, lab-notes]
type: resource-note
source: User-provided room text and screenshots
next_action: Continue with Broken Access Control, API authorization testing, and parameter mining notes
---

# IDOR

## Summary

* **IDOR (Insecure Direct Object Reference)** is an **access control vulnerability**.
* It happens when the server trusts a user-supplied identifier such as `id=13`, `/order/1234/invoice`, or a hidden field, but does **not** verify whether the current user is allowed to access that object.
* The vulnerability is usually simple in appearance and severe in effect: changing one identifier may expose another user's profile, invoice, ticket, file, or API record.
* IDOR is often part of the broader OWASP category **Broken Access Control**.
* Manual testing is highly effective because many IDORs live in URLs, AJAX/API calls, hidden parameters, cookies, or encoded identifiers rather than obvious front-end pages.

```text
User-controlled object reference
        +
missing server-side authorization check
        =
IDOR
```

---

## 1. Core Concept

### Definition

An IDOR exists when an application lets a client directly reference an internal object and fails to enforce authorization on that object lookup.

### Typical objects

* user profiles
* invoices
* tickets
* private messages
* uploaded files
* API records
* order history
* admin-only resources

### Minimal vulnerable pattern

```text
GET /api/v1/customer?id=13
```

If changing `13` to `1` or `3` returns another user's data while staying in the same session, the server is authorizing incorrectly.

---

## 2. Why IDOR Happens

The root cause is not predictable IDs by itself.
The real issue is **missing object-level authorization**.

### Bad server logic

```text
1. Read user-supplied object ID
2. Query database for that object
3. Return result
4. Never verify object ownership or access rights
```

### Correct server logic

```text
1. Read user-supplied object ID
2. Query database for object
3. Verify current user is allowed to access that specific object
4. Return data only if authorized
```

### Important point

Random IDs, UUIDs, hashes, or encoded values can make guessing harder, but they do **not** fix IDOR.
They are defense-in-depth at best.

---

## 3. Common Places Where IDOR Appears

The room explicitly points out that the vulnerable reference is not always visible in the address bar.
That is correct and operationally important.

### Common locations

| Location | Example |
| --- | --- |
| URL path | `/order/1234/invoice` |
| query parameter | `/api/v1/customer?id=13` |
| POST body | `user_id=13` |
| hidden form field | `<input type="hidden" name="id" value="13">` |
| cookie value | session or user context object |
| JavaScript-triggered API call | XHR/fetch request in browser dev tools |
| unreferenced parameter | `/user/details?user_id=123` |

### Practical implication

You should inspect:

* browser address bar
* Network tab
* XHR / fetch requests
* JavaScript files
* hidden form fields
* decoded cookies and tokens where appropriate

---

## 4. Lab Walkthrough Logic

This room teaches three progressively useful ideas:

1. **obvious numeric ID tampering**
2. **encoded / hashed identifiers**
3. **unpredictable IDs and cross-account comparison**

That sequence is good because real-world testers often stop too early after failing with direct sequential IDs.

---

## 5. Task Answers and What They Mean

### Task 2: IDOR example site

The email shows a link like:

```text
https://onlinestore.thm/order/1234/invoice
```

Changing the order ID from `1234` to `1000` reveals another user's invoice, proving the site does not validate ownership.

**Flag:**

```text
THM{IDOR-VULN-FOUND}
```

### Why it matters

This is the classic **horizontal privilege escalation** pattern:

* same privilege level
* different user's data
* authorization bypass through object reference tampering

---

## 6. Encoded IDs

Sometimes the ID is not shown directly. Developers may encode it before sending it between pages, requests, or cookies.

### Common type mentioned in the room

**Base64** is the common encoding highlighted here.

### Testing pattern

```text
encoded value -> decode -> inspect structure -> modify object reference -> re-encode -> resubmit
```

**Important distinction**

Encoding is reversible.
Encoding is **not** security.

If a server relies on "users won't decode this" as protection, that is weak design.

**Task answer**

* Common type of encoding used by websites: **base64**

---

## 7. Hashed IDs

The room also introduces hashed identifiers.

### Example logic

A developer may store or send something like:

```text
123 -> md5 -> 202cb962ac59075b964b07152d234b70
```

### Testing thought process

* identify the hashing pattern
* test if hashes correspond to predictable integers
* try hash cracking / lookup services for common patterns
* see whether changing the underlying value changes the accessible object

**Important distinction**

A hash is not the same as encryption.
A hash is not meant to be reversed mathematically, but predictable source values still make it testable.

**Task answer**

* Common algorithm used for hashing IDs: **md5**

---

## 8. Unpredictable IDs and Cross-Account Testing

If the IDs are not sequential, not obvious, and not trivially decodable, the best method is often **differential testing across accounts**.

### Room principle

Create at least two accounts and compare how the application references owned objects.

### Why this works

Because the real question is not:

> "Can I guess the identifier?"

The real question is:

> "Can I access another user's object while authenticated as myself?"

### Minimum account requirement

* Minimum number of accounts needed to check between accounts: **2**

---

## 9. Practical API Example

The practical section is the most useful part of the room because it maps IDOR to a realistic API call.

### Observed endpoint

After logging in and opening **Your Account**, the browser issues:

```text
/api/v1/customer?id={user_id}
```

The response contains JSON like:

```json
{
  "id": 13,
  "username": "adam",
  "email": "adam@test.com"
}
```

### Test method

1. log in with your own account
2. open developer tools
3. refresh the page
4. capture the request to `/api/v1/customer?id=...`
5. modify the `id` value manually
6. compare returned user objects

### Why this is a real pattern

Many modern apps do not expose the issue in the visible HTML page.
They expose it in background API traffic.

---

## 10. Practical Task Results

### User ID 1

From the practical screenshots, querying user ID `1` returned:

```json
{"id":1,"username":"adam84","email":"adam-84@fakemail.thm"}
```

**Answer:** `adam84`

### User ID 3

From the practical screenshots, querying user ID `3` returned:

```json
{"id":3,"username":"john911","email":"j@fakemail.thm"}
```

**Answer:** `j@fakemail.thm`

---

## 11. IDOR Testing Workflow

Use this as a repeatable checklist.

### Step 1: Map object references

Look for where the application references:

* users
* orders
* invoices
* tickets
* files
* messages
* profiles

### Step 2: Find the transport

Determine whether the reference is in:

* URL path
* query parameter
* POST body
* cookie
* hidden field
* XHR / fetch request
* encoded blob

### Step 3: Manipulate the reference

Try:

* sequential values
* neighboring values
* another account's known ID
* decoded and re-encoded value
* alternate hash candidate if predictable

### Step 4: Compare response behavior

Indicators of an IDOR include:

* another user's data is returned
* another user's record count changes
* edit or delete succeeds on a foreign object
* authorization error is missing where it should exist

### Step 5: Validate severity

Check whether the flaw enables:

* read access only
* edit capability
* delete capability
* role escalation
* access without authentication

---

## 12. Pattern Cards

### Pattern Card: Classic Numeric IDOR

**Indicator:** numeric object ID in path or parameter
**Test:** increment / decrement / substitute known foreign ID
**Risk:** user-to-user data disclosure or modification

### Pattern Card: Encoded IDOR

**Indicator:** base64-like string passed in request/cookie
**Test:** decode, inspect structure, modify reference, re-encode
**Risk:** fake obscurity mistaken for authorization

### Pattern Card: API IDOR

**Indicator:** XHR/fetch call returning JSON object by `id`
**Test:** replay request with alternate IDs in browser or repeater
**Risk:** large-scale exposure because APIs are highly scriptable

### Pattern Card: Cross-Account IDOR

**Indicator:** object references differ across two accounts
**Test:** capture both identities' objects and swap IDs
**Risk:** confirmation even when identifiers are non-sequential

---

## 13. Horizontal vs Vertical Privilege Escalation

IDOR most commonly appears as **horizontal privilege escalation**.

### Horizontal

Same general privilege level, different user's data.

Examples:

* viewing another customer's invoice
* reading another user's API profile
* opening another person's ticket

### Vertical

Crossing into a higher privilege boundary.

Examples:

* user accesses admin object by changing an object reference
* non-admin modifies privileged resources

### Room-specific observation

The onlinestore and customer API examples are **horizontal** privilege escalation cases.

---

## 14. Common Developer Mistakes

| Mistake | Why it fails |
| --- | --- |
| trusting query string IDs | user controls them |
| hiding IDs in the UI only | browser/dev tools still expose them |
| base64-encoding identifiers | reversible, not authorization |
| hashing predictable integers | may still be testable or guessable |
| checking authentication only | authenticated does not mean authorized |
| filtering only in frontend | attacker can call backend/API directly |

---

## 15. Prevention Principles

### Correct defense

**Always enforce object-level authorization on the server.**

### Good mitigation set

* verify the current user owns or is allowed to access the referenced object
* derive the object from session/user context where possible instead of trusting user-supplied IDs
* use indirect references or opaque IDs only as defense-in-depth
* log suspicious enumeration attempts
* review APIs and background XHR traffic during testing
* test with at least two accounts

### Important design lesson

Obscurity reduces convenience for the attacker.
Authorization blocks the attacker.

Only the second actually fixes IDOR.

---

## 16. Interview-Style Distinctions

### IDOR vs authentication bypass

* authentication bypass = get access without proving identity correctly
* IDOR = identity may be valid, but authorization to a specific object is missing

### IDOR vs information disclosure

* information disclosure is the outcome
* IDOR is one specific authorization failure causing that disclosure

### IDOR vs predictable IDs

* predictable IDs help discovery
* missing authorization is the real vulnerability

---

## 17. CN-EN Glossary

* Insecure Direct Object Reference (IDOR): 不安全直接对象引用
* Broken Access Control: 访问控制失效 / 访问控制破坏
* Authorization: 授权
* Authentication: 认证
* Object reference: 对象引用
* Query string: 查询字符串
* Hidden field: 隐藏字段
* AJAX / XHR / Fetch: 异步请求 / 后台请求
* Horizontal Privilege Escalation: 横向越权
* Vertical Privilege Escalation: 纵向越权
* Parameter tampering: 参数篡改
* Enumeration: 枚举
* Base64 encoding: Base64 编码
* MD5 hashing: MD5 哈希
* JSON API: JSON 接口
* Object-level authorization: 对象级授权

---

## 18. Takeaways

The room looks beginner-level, but the underlying lesson is production-relevant:

**many IDORs are not visible in the main interface; they live in background requests, object identifiers, and weak authorization logic.**

That is why browser dev tools matter.

If you remember only three things, keep these:

1. **Authentication is not authorization.**
2. **Encoding is not security.**
3. **Changing the object ID should never bypass ownership checks.**

---

## 19. Minimal Review Checklist

```text
[ ] I can explain what IDOR is in one sentence.
[ ] I know that IDOR is primarily an authorization issue.
[ ] I can test query params, path params, and API calls for IDOR.
[ ] I can distinguish encoding from hashing.
[ ] I know why two test accounts are useful.
[ ] I can explain horizontal vs vertical privilege escalation.
[ ] I know the practical answers: THM{IDOR-VULN-FOUND}, adam84, j@fakemail.thm
```

---

## 20. Suggested Next Notes

Natural follow-ups:

* Broken Access Control
* Authorization testing in OWASP WSTG
* Walking an Application
* API Security basics
* Authentication Bypass
