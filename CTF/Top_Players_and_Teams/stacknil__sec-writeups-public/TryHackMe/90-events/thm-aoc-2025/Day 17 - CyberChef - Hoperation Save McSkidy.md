---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-12
tags: [security-writeup, tryhackme, aoc2025, cyberchef]
source: TryHackMe: Advent of Cyber 2025 Day 17
platform: tryhackme
room: Advent of Cyber 2025 Day 17: CyberChef: Hoperation Save McSkidy
slug: aoc-2025-day-17-cyberchef-hoperation-save-mcskidy
path: TryHackMe/90-events/thm-aoc-2025/Day 17: CyberChef: Hoperation Save McSkidy.md
topic: 90-events
domain: [forensics]
skills: [extractors, triage]
artifacts: [lab-notes]
sanitized: true
---

# Advent of Cyber 2025 Day 17: CyberChef: Hoperation Save McSkidy

> Theme: break 5 “locks” by combining **browser DevTools** (Network/Debugger) with **CyberChef** recipes. The whole room is a practical reminder that *encoding ≠ encryption*.

---

## Summary

This challenge hides authentication clues in places developers often forget to defend:

* **HTTP response headers** (e.g., `X-Level`, `X-Magic-Question`, `X-Recipe-Key`, `X-Recipe-ID`).
* **Client-side login logic** in `static/app.js` (visible in DevTools → Debugger).
* A built-in **Base64-only chat** (“Bunnygram”) that returns encoded secrets.

You repeatedly:

1. learn what format the guard speaks (Base64),
2. extract hints from headers / JS,
3. cook the *reverse* recipe in CyberChef,
4. log in.

---

## Key Concepts

* **Encoding vs Encryption**

  * Encoding (Base64, Hex): compatibility / transport.
  * Encryption (AES/TLS): confidentiality with key-based security.

* **HTTP Headers as Side Channels**

  * `X-*` headers can leak business logic and “hidden” parameters.

* **Client-side Auth Anti-pattern**

  * If the browser can verify the password, then the attacker can too.
  * JS-based checks + constants in HTML/JS are *not secrets*.

* **Chained Transformations (Pipeline Thinking)**

  * Each lock uses a transform chain (Base64, double Base64, XOR, MD5, ROT13/ROT47, reverse).
  * Solving means **inverting** the chain.

* **XOR Involution**

  * `XOR(XOR(data, key), key) == data`.

---

### Tooling

* **Browser DevTools**

  * *Network*: inspect response headers.
  * *Debugger / Sources*: read `static/app.js`.

* **CyberChef** (offline in AttackBox bookmarks or online)

  * Operations you’ll use a lot: `To Base64`, `From Base64`, `From Hex`, `XOR`, `ROT13`, `ROT47`, `Reverse`.

---

### Repeatable Workflow (Lock Solver Loop)

#### 0) Decode the Bunnygram banner (optional story clue)

* The guard greeting / banner is Base64 → decode with `From Base64`.

#### 1) Build the username

* Take **guard name** (shown in the UI) → `To Base64` → use as **Username**.

#### 2) Obtain the password material

Depending on the level:

* **Locks 1-2**: find `X-Magic-Question` in headers → `To Base64` → send in chat → guard returns Base64 payload.
* **Locks 3+**: no magic question; send a short prompt in Base64 (e.g., `Password please.`) → guard replies (slowly).

#### 3) Identify the login logic

* DevTools → Debugger → `static/app.js`
* Locate the block:

  * `if (level === 1) { ... } else if (level === 2) { ... } ...`

#### 4) Reverse the transform in CyberChef

* Take guard reply → apply the **reverse recipe** to recover plaintext password.

#### 5) Log in

* Username = Base64(guard name)
* Password = plaintext (unless the JS logic requires you to input something else)

---

### Mental Model: Dataflow

```
[Network Headers] -----> (parameters: X-Level / X-Magic-Question / X-Recipe-*)
         |
         v
[Chat requires Base64] -> guard returns Base64 blob -> [CyberChef reverse recipe]
                                              |
                                              v
                                      plaintext password
                                              |
                                              v
                                  [Login form submits]
```

---

### Lock-by-Lock Cheat Sheet

#### Lock 1: Outer Gate

**DevTools hint**: `X-Magic-Question: What is the password for this level?`

**JS logic pattern** (conceptually):

* The app checks `btoa(pwd)` against an expected constant.

**Practical**:

* Ask the magic question in Base64.
* Decode guard response in CyberChef.
* **Input password** in the form as the *properly prepared string required by logic* (in this lock, that often ends up being Base64-related).

#### Lock 2: Outer Wall

**DevTools hint**: `X-Magic-Question: Did you change the password?`

**JS logic pattern**:

* Double Base64 layer (encode/decode twice).

**Practical**:

* Same as lock 1, but **apply Base64 twice** in the correct direction when reversing.

#### Lock 3: Guard House

**Header hint**: `X-Recipe-Key: <key>` (e.g., `cyberchef`).

**JS logic pattern**:

* Base64 + XOR with key.

**Reverse recipe idea**:

1. `From Base64`
2. `XOR` with the key from header (same key)
3. Interpret as `UTF-8`

#### Lock 4: Inner Castle

**JS logic pattern**:

* Password verified via **MD5 hash** comparison.

**Practical**:

* Guard replies with a hash-like string.
* Use a hash lookup / cracking workflow (in a real engagement: *only with authorization*).

#### Lock 5: Prison Tower (Recipe IDs)

**Header hints**:

* `X-Recipe-ID: R1|R2|R3|R4`
* `X-Recipe-Key: ...` (sometimes needed)

**Reverse Logic Cheat Sheet** (what you cook in CyberChef to recover plaintext):

| Recipe ID | Reverse logic (decode path)            |
| --------- | -------------------------------------- |
| R1        | `From Base64` → `Reverse` → `ROT13`    |
| R2        | `From Base64` → `From Hex` → `Reverse` |
| R3        | `ROT13` → `From Base64` → `XOR(key)`   |
| R4        | `ROT13` → `From Base64` → `ROT47`      |

---

### Pitfalls (Common Failure Modes)

* **Forgetting chat is Base64-only**: guards ignore plaintext.
* **Wrong direction**: `To Base64` vs `From Base64` (symptom: output still “looks Base64”).
* **XOR output encoding**: after XOR, ensure you interpret bytes as `UTF-8` (or try Latin-1 if it looks garbled).
* **Key mismatch**: always trust the header’s `X-Recipe-Key`.
* **Guard latency** (locks ≥ 3): keep prompts short; wait before re-sending.
* **Padding (`=`)**: don’t delete it unless the recipe explicitly demands it.

---

### Security Takeaways (Real-World Mapping)

* **Never do authentication purely in client-side JS**.

  * Anything shipped to the browser is attacker-readable.
* **Don’t leak secrets via headers**.

  * Headers are first-class attack surface.
* **Obfuscation is not protection**.

  * Encoding chains are reversible.

---

## Related Tools

* **Burp Suite / Caido**: capture, modify, and replay HTTP traffic.
* **mitmproxy**: scriptable interception.
* **hashcat / John the Ripper**: authorized hash recovery.

---

## Further Reading

* Base64 & Base-N encodings: RFC 4648 (standardized behavior, padding, line breaks).
* MD5: why it’s obsolete for security (collision resistance issues) and how hash lookups work.
* Secure auth design: server-side validation, rate limits, and proper password hashing (bcrypt/Argon2).

---

## Mini Glossary (中英对照)

* Encoding（编码）: reversible representation transform for compatibility.
* Encryption（加密）: confidentiality transform using algorithm + key.
* HTTP Header（HTTP 头）: metadata fields sent with requests/responses.
* Client-side validation（前端校验）: checks performed in browser; not a security boundary.
* XOR（异或）: bitwise operation; applying twice with same key reverses.
* Hash（哈希）: one-way digest (idealized); MD5 is legacy/insecure for crypto.
