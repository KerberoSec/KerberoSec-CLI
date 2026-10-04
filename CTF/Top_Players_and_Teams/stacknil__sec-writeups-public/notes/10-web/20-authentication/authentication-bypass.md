---
status: done
created: 2026-04-12
updated: 2026-04-12
date: 2026-04-12
platform: tryhackme
room: Authentication Bypass
slug: authentication-bypass
path: notes/10-web/20-authentication/authentication-bypass.md
topic: 10-web
domain: [web-app-security, authentication]
skills: [enum, password-cracking, workflow, cookies, auth-session]
artifacts: [concept-notes, pattern-card, cookbook]
type: resource-note
source: user-provided room text and screenshots; defensive recommendations aligned with OWASP and NIST guidance
next_action: Build a follow-up note on session management, reset-token security, and MFA design.
---

# Authentication Bypass

## Summary

* Authentication bypass is not only about guessing passwords. In practice, it often starts with identity discovery, then escalates into credential attacks, workflow abuse, or session manipulation.
* The room covers four high-value classes: username enumeration, brute force, logic flaws in reset flows, and cookie tampering.
* The offensive sequence is usually simple: find valid users -> test authentication controls -> abuse business logic -> modify client-controlled state.
* The defensive lesson is equally simple: authentication is a system, not a login page. Signup, login, reset, sessions, cookies, and account recovery all belong to the same attack surface.
* The password reset case is the most important conceptually. It shows that a workflow can look correct in the UI but still be broken at the request-handling layer.
* If the server trusts user-controlled cookies or merges request parameters unsafely, the application can hand over access without any cryptographic break at all.

```text
Attacker path
  valid usernames
      -> password guessing
      -> recovery-flow abuse
      -> session or cookie abuse
      -> account takeover
```

## 1. Why Authentication Bypass Matters

Authentication bugs are structurally severe because they collapse the boundary between "my account" and "someone else's account". Once that line fails, every downstream control becomes weaker:

* private tickets become readable
* reset flows become account takeover paths
* session state becomes forgeable
* privilege boundaries become meaningless

This is why OWASP keeps authentication failures near the top of real-world risk models. Broken authentication is rarely a cosmetic issue. It is usually a direct access-control failure with user impact. OWASP's guidance explicitly calls out credential stuffing, brute force, weak/default passwords, and recovery-flow weaknesses as common causes of authentication failure. ([cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html?utm_source=chatgpt.com))

## 2. Attack Surface Map

Authentication surface should be reviewed as a full workflow, not one form.

## 2.1 Primary entry points

* `/customers/signup`
* `/customers/login`
* `/customers/reset`
* session cookies after login
* any ticket, email, or support workflow linked to identity recovery

## 2.2 Secondary indicators

* different error messages
* different response codes
* redirects after login failure vs success
* cookies that expose role or session state
* reset links delivered through alternate channels

```text
Authentication surface
├── signup
├── login
├── password reset
├── session cookies
├── remember-me features
├── support or ticket workflows
└── any link that auto-authenticates a user
```

## 3. Username Enumeration

## 3.1 Concept

Username enumeration happens when the application reveals whether a username exists.

Typical signs:

* `username already exists`
* `account not found`
* different response length or timing
* different status code or redirect path

This looks minor, but operationally it is the first stage of many credential attacks. A list of valid usernames compresses the search space and makes brute force, password spraying, and phishing more efficient.

## 3.2 Room example

On signup, submitting a known username such as `admin` returns a distinct error indicating the account already exists. That difference is enough to automate discovery.

## 3.3 ffuf pattern

```bash
ffuf \
  -w /usr/share/wordlists/SecLists/Usernames/Names/names.txt \
  -X POST \
  -d "username=FUZZ&email=x&password=x&cpassword=x" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u http://TARGET_HOST/customers/signup \
  -mr "username already exists"
```

## 3.4 Why this matters

Enumeration is not the breach by itself. It is the enabler.

A good analyst should always ask:

* Can I tell whether an account exists?
* Does the application leak it via content, timing, or status code?
* Can I scale the test safely and within scope?

## 3.5 Defensive principle

Return consistent messages and near-consistent behavior for valid and invalid identities in auth-related flows. OWASP's forgot-password guidance also recommends consistent responses so attackers cannot learn whether an account exists from the reset endpoint. ([cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html?utm_source=chatgpt.com))

## 4. Brute Force and Credential Attacks

## 4.1 Concept

Once valid usernames exist, the next move is password guessing.

Three related patterns:

* brute force: many passwords against one or many users
* password spraying: a few common passwords against many users
* credential stuffing: leaked real credentials reused elsewhere

The room demonstrates a classic brute-force workflow using previously enumerated usernames.

## 4.2 ffuf pattern with two wordlists

```bash
ffuf \
  -w valid_usernames.txt:W1,/usr/share/wordlists/SecLists/Passwords/Common-Credentials/10-million-password-list-top-100.txt:W2 \
  -X POST \
  -d "username=W1&password=W2" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u http://TARGET_HOST/customers/login \
  -fc 200
```

## 4.3 Interpretation

The filtering logic matters.

If failure returns HTTP 200 with an error page, then a successful login may redirect or return a different status. In this room, filtering out 200s is enough to expose the valid credential pair.

## 4.4 Defensive principle

Rate limiting is not optional. NIST SP 800-63B requires effective rate limiting for low-entropy authenticators and OWASP explicitly recommends anti-brute-force mechanisms, account lockout/captcha controls, and MFA against brute force and credential stuffing. ([pages.nist.gov](https://pages.nist.gov/800-63-3/sp800-63b.html?utm_source=chatgpt.com))

### Minimum defensive controls

* rate limiting
* detection of repeated failures
* MFA for sensitive access
* password hygiene and blocklists
* monitoring for spray/stuffing behavior

## 5. Logic Flaws in Password Reset

## 5.1 What makes this class dangerous

This is the most interesting part of the room.

The UI suggests the reset process is secure because it asks for both:

* email address
* username

At the human interface level, it looks stricter than a one-field reset form.

At the HTTP processing level, it is broken.

## 5.2 The root flaw

The application takes the account identity from the query string, but later uses `$_REQUEST` to decide where the reset message is sent.

In PHP, `$_REQUEST` can merge GET and POST parameters. If the same key appears in both places, POST data may override the query-string value depending on configuration and implementation assumptions.

That means the attacker can:

1. reference the victim's account in the URL
2. submit the victim's username in POST
3. inject a second `email=` in POST
4. redirect the password reset delivery to an attacker-controlled mailbox

This is a clean example of parameter precedence abuse.

## 5.3 Room request structure

Expected-looking request:

```bash
curl 'http://TARGET_HOST/customers/reset?email=user@example.com' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=victim'
```

Abusive variant:

```bash
curl 'http://TARGET_HOST/customers/reset?email=user@example.com' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=victim&email=attacker@example.com'
```

## 5.4 Why this is a logic flaw

Nothing is cracked. No crypto is broken. No SQL injection is needed.

The attacker simply uses the application's own contradictory logic:

* account lookup uses one source
* message delivery uses another source
* the server fails to bind the reset request to a single canonical account record

## 5.5 Defensive principle

Password reset should be treated like an authentication endpoint. OWASP's forgot-password guidance and API auth guidance both emphasize consistent responses, strong token design, and the same brute-force protections applied to login flows. ([cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html?utm_source=chatgpt.com))

### Secure design rules

* derive the destination email only from the server-side account record
* never let client input decide where reset mail is delivered after identity lookup
* bind reset requests to a single canonical user object
* use strong, single-use, short-lived reset tokens
* invalidate tokens after use or password change
* log reset attempts and delivery anomalies

## 6. Cookie Tampering

## 6.1 Core idea

Cookies are client-side state containers. If the server stores trust decisions directly in a tamperable cookie without integrity protection, the client can rewrite privilege.

## 6.2 Plain-text cookie abuse

Example insecure design:

```http
Set-Cookie: logged_in=true; Max-Age=3600; Path=/
Set-Cookie: admin=false; Max-Age=3600; Path=/
```

If the server later trusts those values directly, the client can just send:

```bash
curl -H "Cookie: logged_in=true; admin=true" http://TARGET_HOST/cookie-test
```

That is not session management. That is delegated authorization to the attacker.

## 6.3 Hashed vs encoded

The room makes an important distinction.

### Hashing

A hash is one-way. You cannot normally reverse it directly, but if the original value is common and precomputed in public databases, you may still infer it.

### Encoding

Encoding is reversible. Base64 is transport formatting, not security.

If a cookie contains:

```text
eyJpZCI6MSwiYWRtaW4iOmZhbHNlfQ==
```

and that decodes to:

```json
{"id":1,"admin":false}
```

then changing it to:

```json
{"id":1,"admin":true}
```

and re-encoding is trivial unless the server signs or validates it.

## 6.4 Defensive principle

Client-readable is acceptable. Client-trusted is dangerous.

Use server-side sessions or cryptographically signed tokens with strict verification, expiry, audience, and integrity guarantees.

## 7. Pattern Cards

## Pattern Card: Enumeration leak

**Signal:** different auth error messages for valid vs invalid users  
**Attacker gain:** build valid identity list  
**Fix:** unify responses, timing, and observable outcomes

## Pattern Card: Credential attack window

**Signal:** no rate limit, no lockout strategy, no MFA  
**Attacker gain:** brute force, spraying, stuffing  
**Fix:** throttle, detect, challenge, and step-up authentication

## Pattern Card: Reset flow confusion

**Signal:** identity lookup and reset delivery use different request sources  
**Attacker gain:** redirect reset flow to attacker-controlled address  
**Fix:** canonicalize account lookup server-side and bind reset actions to stored identity only

## Pattern Card: Trusting client cookies

**Signal:** `admin=false` or similar role/state in readable client cookie  
**Attacker gain:** privilege escalation by editing cookie  
**Fix:** server-side session state or signed tokens with verified integrity

## 8. Command Cookbook

## 8.1 Username enumeration

```bash
ffuf \
  -w /usr/share/wordlists/SecLists/Usernames/Names/names.txt \
  -X POST \
  -d "username=FUZZ&email=x&password=x&cpassword=x" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u http://TARGET_HOST/customers/signup \
  -mr "username already exists"
```

## 8.2 Credential brute force

```bash
ffuf \
  -w valid_usernames.txt:W1,/usr/share/wordlists/SecLists/Passwords/Common-Credentials/10-million-password-list-top-100.txt:W2 \
  -X POST \
  -d "username=W1&password=W2" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u http://TARGET_HOST/customers/login \
  -fc 200
```

## 8.3 Reset-flow review with curl

```bash
curl 'http://TARGET_HOST/customers/reset?email=user@example.com' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=victim&email=attacker@example.com'
```

## 8.4 Cookie tampering test

```bash
curl -H "Cookie: logged_in=true; admin=true" http://TARGET_HOST/cookie-test
```

## 9. Pitfalls for Analysts

## 9.1 Treating login as the whole auth surface

Wrong mental model.

The real auth surface includes:

* signup
* login
* reset
* session renewal
* remember-me features
* account recovery
* email-delivered auto-login links

## 9.2 Focusing only on code injection

Authentication bypass often does not require injection.

Business logic and state handling failures can be enough.

## 9.3 Assuming encoded = protected

Base64 is not protection. It is formatting.

## 9.4 Ignoring response metadata

Status codes, redirect behavior, and content length frequently reveal more than visible error text.

## 10. Secure Design Checklist

```text
[ ] generic signup/login/reset error messages
[ ] rate limiting on login and reset endpoints
[ ] MFA on sensitive accounts and risky actions
[ ] no client-controlled role or auth state
[ ] reset email destination derived only from server-side account data
[ ] short-lived, single-use reset tokens
[ ] token invalidation after password change
[ ] session rotation after login, reset, and privilege change
[ ] logging for failed logins, reset requests, token use, and cookie anomalies
```

## 11. ASCII Flow Diagram

```text
Enumeration
   |
   v
Valid users discovered
   |
   v
Credential attack or recovery abuse
   |
   v
Session or cookie tampering
   |
   v
Unauthorized access / account takeover
```

And the defensive inversion:

```text
Consistent errors
 + rate limits
 + MFA
 + secure reset binding
 + signed/server-side sessions
 = much smaller auth attack surface
```

## 12. CN-EN Glossary

* Authentication bypass: 认证绕过
* Username enumeration: 用户名枚举
* Brute force: 暴力破解
* Password spraying: 密码喷洒
* Credential stuffing: 凭证填充 / 凭证复用攻击
* Logic flaw: 逻辑缺陷
* Password reset flow: 密码重置流程
* Query string: 查询字符串 / URL 参数
* POST body: POST 请求体
* Parameter precedence: 参数优先级
* Cookie tampering: Cookie 篡改
* Session management: 会话管理
* Integrity protection: 完整性保护
* Single-use token: 一次性令牌
* Rate limiting: 速率限制
* Account takeover (ATO): 账户接管

## 13. Takeaways

The strongest lesson from this room is structural:

**Authentication is not a screen. It is a chain of identity, workflow, and state transitions.**

Breaks usually happen when the application:

* reveals identity information too early,
* accepts too many guesses too quickly,
* trusts conflicting request data,
* or lets the client define privileged session state.

For pentesting, this room is a beginner lab. For real systems, it is a reminder that auth review must include the entire lifecycle, not just the password field.
