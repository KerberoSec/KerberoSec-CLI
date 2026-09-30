# 🛡️ PicoCTF Lab Walkthrough: Login

## 📌 Challenge Info

* **Category**: Web Exploitation
* **Difficulty**: Easy

---

## 📝 Challenge Description

Bypass a login page to retrieve the flag.

---

## 🔍 Initial Recon

* **Files provided**: None
* **Services/Ports**: Web login page
* **Hints given**: Credentials hidden in client-side JavaScript

---

## 🛠️ Tools & Commands Used

| Tool / Command            | Purpose                       |
| ------------------------- | ----------------------------- |
| Browser DevTools          | Inspect source code           |
| `base64` / online decoder | Decode obfuscated credentials |

---

## 🧠 Step-by-Step Solution

1. **Source Code Analysis**

   * Inspected JavaScript snippet and found base64-encoded username & password.

2. **Decoding Credentials**

   * Decoded `YWRtaW4` → **admin** (username).
   * Decoded `cGljb0NURns1M3J2M3JfNTNydjNyXzUzcnYzcl81M3J2M3JfNTNydjNyfQ` →
     **picoCTF{53rv3r\_53rv3r\_53rv3r\_53rv3r\_53rv3r}** (password and flag).

3. **Flag Retrieval**

   * Submitted credentials and retrieved the flag.

---

## 🧾 Flag

picoCTF{53rv3r\_53rv3r\_53rv3r\_53rv3r\_53rv3r}

---

## 📚 Learning Outcomes

* Client-side obfuscation is **not security**.
* Sensitive information (like credentials) should never be stored in client-side code.
* Always perform authentication server-side.

---
