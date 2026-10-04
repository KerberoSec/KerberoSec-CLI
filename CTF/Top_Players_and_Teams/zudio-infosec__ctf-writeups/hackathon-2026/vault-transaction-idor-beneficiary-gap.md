# 💸 Vault Transaction (Web: IDOR via Beneficiary ID Gap)

## Challenge Info

| Field | Details |
|---|---|
| Platform | Cybersecurity Hackathon 2026 (CydeaRange) |
| Category | Web Exploitation / IDOR |
| Tools Used | Browser, Burp Suite (request inspection) |

---

## 🧩 Description

A banking-style transfer app. Logged in with provided credentials to
find four beneficiaries listed: three transferable, one marked
**restricted**. The task: get a transaction through to the restricted
beneficiary anyway.

---

## 🔍 Reconnaissance

**Step 1: Try the obvious path first**

Transferred to the three *allowed* beneficiaries directly through the
UI to see what a normal transaction looked like end-to-end. Balance
dropped correctly each time: normal, expected behavior. The UI simply
never offered the restricted one as an option at all.

**Step 2: Look at what a transaction request actually contains**

Doing it "the UI way" got nowhere for the restricted beneficiary: it
wasn't selectable. So instead of the UI, looked at the actual
transaction request being sent under the hood. It carried a
**beneficiary ID** field.

**Step 3: Spot the gap**

The three allowed beneficiaries had IDs `101`, `102`, `103`: a tight,
sequential cluster. The restricted one, visible elsewhere on the page,
had ID `999`: a huge, deliberate gap from the others. That gap was the
tell: the restriction lived only in the UI, not the backend.

---

## ⚔️ Attack Process

**Step 1: Forge the transaction**

Took a normal transaction request (to one of the allowed beneficiaries)
and edited the beneficiary ID field from `101`/`102`/`103` to `999`: the restricted beneficiary's actual ID.

**Step 2: Send it**

Submitted the modified request directly, bypassing the UI's restriction
entirely (the restriction was cosmetic: a missing option in a
dropdown, not a server-side check).

**Step 3: Flag**

The server processed the transaction to the restricted beneficiary
without complaint, and the flag came back in the response.

---

## 🚩 Flag
```
flag{...}   <!-- fill in exact string -->
```

---

## 💡 Lessons Learned

- "Not shown in the UI" is not the same as "not accessible": a
  restriction that only hides an option from a dropdown does nothing
  against a forged request
- A large numeric gap between IDs (`101,102,103` vs `999`) is often a
  deliberate signal that the high-numbered object is special/restricted, and therefore exactly the one worth testing directly
- Authorization checks belong on the server, on every request, for
  every referenced object: not just in what the client is allowed to
  click

---

## 🛠️ Tools Used

- **Browser**: baseline transaction flow
- **Burp Suite**: inspecting and forging the beneficiary ID field

---

*Solved during Cybersecurity Hackathon 2026: legal, authorized CTF environment*
