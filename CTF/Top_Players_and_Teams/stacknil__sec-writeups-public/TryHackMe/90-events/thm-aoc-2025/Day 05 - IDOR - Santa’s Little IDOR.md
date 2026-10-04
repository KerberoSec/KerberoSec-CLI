---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-12
tags: [security-writeup, tryhackme, aoc2025, idor, access-control]
source: TryHackMe: Advent of Cyber 2025 Day 5
platform: tryhackme
room: Advent of Cyber 2025 Day 05: IDOR: Santa's Little IDOR
slug: aoc-2025-day-05-idor-santas-little-idor
path: TryHackMe/90-events/thm-aoc-2025/Day 05: IDOR: Santa’s Little IDOR.md
topic: 90-events
domain: [web]
skills: [auth-session, reporting]
artifacts: [lab-notes]
sanitized: true
---

# Advent of Cyber 2025 Day 05: IDOR: Santa's Little IDOR

## Summary

> Focus: IDOR (Insecure Direct Object Reference) / Broken Access Control

---

## Key Concepts

### 1. Room Overview

**Target app:** `TrypresentMe`: a parent dashboard for managing children, gifts and vouchers.

**Learning goals**

* Understand **authentication** vs **authorization**.
* Understand what **IDOR** is and why it is really an **authorization bypass**.
* Practice spotting IDORs in:

  * Query parameters (`user_id=10`)
  * Encoded IDs (Base64)
  * Hashed IDs (MD5)
  * Time‑based UUID vouchers (UUIDv1)
* Use browser DevTools + Burp Suite Intruder to enumerate IDs.
* Think about **proper mitigations**.

---

### 2. Core Concepts

#### 2.1 Authentication vs Authorization

* **Authentication (身份验证)**: Who are you?

  * Example: login with username `niels` and password.
  * Browser stores a **session token** (cookie/localStorage) after success.

* **Authorization (授权)**: What are you allowed to do?

  * Every request *after* login should check:

    * Which user is associated with this session?
    * Do they own / have rights to this object (child, voucher, account)?

Key point: **authorization must happen on every request, after authentication**.

---

#### 2.2 IDOR: Insecure Direct Object Reference

* App uses a **direct identifier** (object reference) from user input to fetch data:

  * Database key
  * File name
  * Voucher code
  * Child ID / Account ID
* **Vulnerability** appears when the server **does not verify ownership/permissions** before returning the object.
* Typical manifestation: horizontal privilege escalation.

##### Classic pattern

```http
GET /TrackPackage?packageID=1001 HTTP/1.1
```

Change `packageID` to `1002`, `1003` … and get other people’s packages because the server never checks that the session user actually owns them.

---

#### 2.3 Privilege Escalation Types

* **Vertical privilege escalation (垂直权限提升)**

  * Normal user gains admin‑only actions.
  * Example: normal parent can access `/admin/`.

* **Horizontal privilege escalation (横向权限提升)**

  * Same feature, *different victim*.
  * Example: parent A views or edits children of parent B.

Most IDORs in this room are **horizontal**.

---

### 3. TryPresentMe: Endpoint Map

#### 3.1 Account info

Captured via Firefox DevTools → **Network**:

```http
GET /api/parents/view_accountinfo?user_id=10 HTTP/1.1
```

* Response JSON contains:

  * `user_id`, `username`, `email`
  * Address fields
  * `children` array
* `user_id` is also stored client‑side in **Local Storage** under `auth_user`.

#### 3.2 Children

1. **View child (eye icon)**: Base64 endpoint:

   ```http
   GET /api/child/b64/Mg== HTTP/1.1
   ```

   * `Mg==` decodes from Base64 → string `2`.
   * So this is really: "view child where child_id = 2".

2. **Edit child (pencil icon)**: MD5 endpoint:

   ```http
   GET /api/child/md5/098f6bcd4621d373cade4e832627b4f6 HTTP/1.1
   ```

   * Hash is MD5 of a predictable value (e.g., child numeric ID).

#### 3.3 Vouchers

* **List vouchers**:

  ```http
  GET /api/parents/vouchers HTTP/1.1
  ```

* **Claim voucher**:

  ```http
  POST /api/parents/vouchers/claim HTTP/1.1
  Content-Type: application/json

  { "voucher": "37f0010f-a489-11f0-ac99-026ccdf7d769" }
  ```

* Voucher format: **UUIDv1** (time‑based).

---

### 4. Exploits Walkthrough

#### 4.1 Simple IDOR: `view_accountinfo` `user_id`

Goal question from room: *“Exploiting the IDOR found in the view_accounts parameter, what is the user_id of the parent that has 10 children?”*

Steps (manual enumeration):

1. Login as `niels`.
2. Open **DevTools → Network**, refresh page → capture `view_accountinfo?user_id=10`.
3. Open **DevTools → Storage → Local Storage** and locate `auth_user` JSON.
4. Change `user_id` value from `10` to another integer, e.g. `11`, press **Enter**.
5. Refresh the page: dashboard now shows another user’s account (horizontal escalation).
6. Keep incrementing: 12, 13, 14, 15…
7. For `user_id = 15` the dashboard displays a parent with **10 children**.

> Answer: `user_id = 15`.

Observation: **Changing a single number** in localStorage is enough to become a different user. Server never cross‑checks `user_id` in the request with the session.

---

#### 4.2 Encoded child IDs: Base64 endpoint

Goal bonus task: find the **`id_number`** of the child born on `2019‑04‑17` using Base64 or MD5 endpoints.

##### Understanding the encoding

1. Click eye icon on Bilbo → see request:

   ```http
   GET /api/child/b64/Mg== HTTP/1.1
   ```

2. Use a Base64 decoder:

   * Input `Mg==` → output `2`.
   * So path segment is just **Base64(child_id)**.

> Encoding = *obfuscation only*, no authorization.

##### Automating search with Burp Intruder (Base64 path)

1. Turn on Burp proxy (FoxyProxy → `Burp`).
2. Click the eye icon to capture one `GET /api/child/b64/Mg==` in Burp.
3. In Burp **Proxy → HTTP history**, send that request to **Intruder**.
4. In **Intruder → Positions**:

   * Highlight `Mg==`.
   * Click **Add** → becomes a payload position.
5. Build a payload list of candidate child IDs (e.g. `1` to `25`).

   * Convert each to Base64, or easier: create a wordlist of Base64 encoded values directly: `MQ==`, `Mg==`, `Mw==`, …
6. Load the wordlist in **Intruder → Payloads**.
7. Start attack.
8. Examine each **Response** tab, look for `"birthdate": "2019-04-17"`.
9. The matching response shows `child_id = 19`.

> Bonus answer: child `id_number = 19`.

Again, the server never checks that this child actually belongs to the logged‑in parent: pure IDOR.

---

#### 4.3 Hashed child IDs: MD5 endpoint

The edit‑child request uses an MD5 hash in the path.

Key ideas:

* The path looks like a random hex string, but tools like **hash‑identifier** or online checkers reveal it’s MD5.
* If the input to MD5 is predictable (e.g. numeric child ID), an attacker can:

  1. Generate `MD5(1)`, `MD5(2)`, …
  2. Replace the hash in the URL.
  3. Enumerate other children’s data using the edit endpoint.

Hashing **does not fix** IDOR if the server still does no **authorization check**.

---

#### 4.4 UUIDv1 vouchers: time‑based brute force

Goal bonus task: using `/parents/vouchers/claim`, find a voucher valid on **2025‑11‑20**, with insider info:

* Voucher was generated **on the minute** between `20:00` and `24:00` UTC.

##### 4.4.1 Why UUIDv1 is dangerous here

* UUIDv1 encodes a **timestamp** + **node/clock** bits.
* If an attacker knows a narrow time window, they can generate candidate UUIDs for each minute/second.

Total candidates:

* 4 hours × 60 minutes = **240** possible minute timestamps.

##### 4.4.2 Building the attack

1. Capture a normal voucher claim request using DevTools / Burp:

   ```http
   POST /api/parents/vouchers/claim HTTP/1.1
   Content-Type: application/json

   { "voucher": "TEST" }
   ```

   Response: `{"detail":"Voucher not found"}` (404).

2. Use an external script or AI to generate 240 candidate **UUIDv1** strings matching the time window.

3. Put all candidates in a wordlist `vouchers.txt`.

4. In Burp:

   * Send the sample claim request to **Intruder**.
   * Mark the `TEST` value as the payload position.
   * Load `vouchers.txt` as the payload list.

5. Start attack.

6. Sort results by **Status / Length**; most will be `404`.

7. The single request with HTTP `200` and different body is the *valid* voucher.

   * Voucher starts with `2264 300c 6655 …` (full code recorded in the room as the correct answer).

This demonstrates how even “random‑looking” identifiers (UUIDv1) can be exploitable when they leak structure (timestamp).

---

### 5. Mitigations / How to Fix

#### 5.1 Server‑side authorization on every object access

For each request involving an object (`user`, `child`, `voucher`, etc.):

1. Resolve session → `current_user_id`.
2. Extract object reference from request (query param, path, body).
3. Fetch object from DB.
4. Enforce rule like:

```pseudo
if object.owner_id != current_user_id:
    return 403 Forbidden
```

No response data should leak before this check passes.

#### 5.2 Do not rely on obscurity

* Base64, hashes, UUIDs, and long random strings **do not replace** authorization.
* They can reduce casual guessing but not determined attackers.

#### 5.3 Better ID design (secondary)

* Use **non‑sequential IDs** for public resources (UUIDv4, random tokens), but *only together with* proper access control.
* For highly sensitive resources, consider **indirect references**:

  * Map a short public token → internal object ID on the server side.

#### 5.4 Monitoring & rate limiting

* Log failed access attempts (many `404/403` with varying IDs).
* Apply rate limiting on sensitive endpoints to slow brute‑force attempts.

---

### 6. Quick Checklist for Hunting IDORs

1. **Identify objects**

   * For each page/action, ask: *"Which object is this request operating on?"*
2. **Find the reference**

   * URL path segment
   * Query parameter
   * JSON body field
   * Header / cookie value
3. **Change the reference**

   * Try neighbour IDs (N±1, small ranges).
   * Try another user’s ID if you have permission.
4. **Observe responses**

   * New data? Different user’s info? More children / vouchers?
   * Any indication of horizontal or vertical escalation.
5. **Automate when needed**

   * Burp Intruder / Repeater
   * Custom scripts or fuzzers

Ask continuously: **“If I were another user, could I use this same request to access your data?”**

---

### 7. Mini Chinese Glossary (术语小表)

* **IDOR**: Insecure Direct Object Reference，不安全直接对象引用
* **Authentication**: 身份验证
* **Authorization**: 授权 / 访问控制
* **Session token**: 会话令牌
* **Horizontal privilege escalation**: 横向权限提升
* **Vertical privilege escalation**: 垂直权限提升
* **Base64 encoding**: Base64 编码
* **Hash (MD5)**: 哈希（MD5）
* **UUIDv1**: 带时间戳的 UUID 版本 1
* **Burp Suite Intruder**: Burp 套件中的自动化枚举模块
