# OTP Chapter 3

**Category:** Web Exploitation  
**Points:** 50  

---

## Description

> Found the IMS credentials of Prof. Manish, but Multi Layer Auth is annoying.  
>
> Mail: `manish@iitgn.ac.in`  
> Password: `pineapple321`  
>
> Target: http://4.188.84.14:4444/  

---

## Approach

### 1. Initial Access

- Logged into the portal using provided credentials:
  - Email: `manish@iitgn.ac.in`
  - Password: `pineapple321`

- Encountered a **multi-layer authentication (OTP verification)** system.

---

## 2. Analyzing the Flow

- Observed that the OTP flow involved two endpoints:

```

/verify/process.php
/verify/check.php

```

### Flow:
1. OTP submission handled by `process.php`
2. Validation handled by `check.php`

---

## 3. Inspecting Network Requests

- Opened **Developer Tools → Network tab**
- Observed a POST request to:

```

[http://4.188.84.14:4444/verify/check.php](http://4.188.84.14:4444/verify/check.php)

```

- The request contained a parameter:

```

goodness = 0

```

---

## 4. Identifying the Vulnerability

### Key Observation:

- The server relied on a **client-controlled parameter (`goodness`)**
- This value determined whether authentication passed

👉 This indicates:
- **Improper server-side validation**
- Trusting client input for security decisions

---

## 5. Exploitation

- Instead of submitting a valid OTP:
  - Directly manipulated the request

### Method:

- Sent a POST request manually:
  - Set:

```

goodness = 1
```

- This bypassed OTP verification completely

---

## 6. Execution

- Attempted using browser DevTools → faced issues
- Used an alternative approach:
  - Sent request via terminal (script/tool)

Example:

```bash
POST /verify/check.php
goodness=1
```

---

## 7. Result

* Server accepted the request
* Authentication bypassed successfully
* Flag returned

---

## Key Insight

* The application trusted a **client-side parameter for authentication logic**
* This is a classic case of:

  * **Client-side validation flaw**
  * **Authentication bypass**

---

## Tools Used

* Browser Developer Tools (Network tab)
* Terminal-based HTTP client (for manual request crafting)

---

## Flag

```text id="s9dl7x"
HRCTF{SM4LL_M1ST4K3_B1G_PR0BL3M}
```

---

## Lessons Learned

* Never trust client-side parameters for authentication decisions
* Always validate critical values on the server side
* Multi-layer authentication is ineffective if backend logic is flawed
* Inspecting network traffic is crucial in web exploitation challenges

---

