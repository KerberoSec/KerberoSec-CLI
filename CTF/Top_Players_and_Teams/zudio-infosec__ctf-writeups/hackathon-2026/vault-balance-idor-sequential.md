# 🔓 Vault Balance (Web: Sequential IDOR)

## Challenge Info

| Field | Details |
|---|---|
| Platform | Cybersecurity Hackathon 2026 (CydeaRange) |
| Category | Web Exploitation / IDOR |
| Tools Used | Browser, view-source |

---

## 🧩 Description

Given a working login for a "vault balance" style dashboard: logged-in
users could see their own balance and a limited slice of other users'
transactions. The scope of what "your own" data meant looked
suspiciously loose.

---

## 🔍 Reconnaissance

**Step 1: Log in and look at the URL/requests**

After logging in with the provided credentials, the dashboard loaded
data keyed by a numeric ID: visible either in the URL or in the
underlying request. Changed that ID once, on a whim, and the page
happily returned a different account's data. No ownership check.

That confirmed it: classic **IDOR** (Insecure Direct Object Reference): the server trusts whatever ID the client sends instead of checking it
belongs to the logged-in user.

---

## ⚔️ Attack Process

**Step 1: Confirm the pattern is walkable**

Since one ID swap worked, the natural next question was: is the flag
sitting on *some specific* user's dashboard? With no other clue about
which ID, the only path was to walk the ID space.

**Step 2: View page source for each ID**

Iterated the ID field manually starting from `1`, checking the rendered
page source each time (rather than trusting only what rendered visually
on screen: some content only showed up in source).

**Step 3: Land on the flag**

At ID `11`, the page source contained the flag: sitting on that
specific user's dashboard, exposed to anyone who guessed their
account ID.

---

## 🚩 Flag
```
flag{...}   <!-- fill in exact string -->
```

---

## 💡 Lessons Learned

- IDOR is often just "change the number in the URL/request and see what
  happens": it doesn't need any special tooling to spot
- Sequential, low-cardinality IDs (1, 2, 3...) turn IDOR into a trivial
  walk: an attacker doesn't even need automation for a small ID space
- Always check page **source**, not just the rendered page: some
  challenge data (and some real-world leaks) only show up there

---

## 🛠️ Tools Used

- **Browser**: manual ID iteration
- **View Source**: confirming flag presence per ID

---

*Solved during Cybersecurity Hackathon 2026: legal, authorized CTF environment*
