# 📝 **XSS: Merry XSSMas**
## TOOOOOO EASY

---

# **Task 1: Introduction**

Santa’s upgraded workshop now includes a secure message portal run by McSkidy.
But recently, suspicious search terms, weird input, and scripts have been appearing in the logs.

Your mission:
Investigate the portal and uncover who is injecting malicious payloads.

### **Learning Objectives**

- Understand **how XSS (Cross-Site Scripting) works**
- Learn how to **exploit and prevent XSS attacks**

---

# **Task 2: Leave the Cookies, Take the Payload**

You are using the web app at:
**http://MACHINE_IP**

The portal includes a **search bar** and a **message form**, both potential targets for XSS.

---

## 🎄 **What is XSS?**

XSS (Cross-Site Scripting) is a vulnerability caused by **unsanitised user input**, allowing attackers to inject **JavaScript** into pages viewed by other users.

This can result in attackers:

- Stealing cookies
- Impersonating users
- Defacing pages
- Triggering fake login prompts
- Taking over accounts

There are different types; this room focuses on **Reflected** and **Stored** XSS.

---

# **Reflected XSS**

Occurs when:

- Input is immediately reflected in the response
- No sanitisation occurs
- Typically delivered via **malicious URLs**

Example payload:

```
<script>alert('Reflected Meow Meow')</script>
```

You inject this into the search box.
If it pops an alert, the site is vulnerable.

---

# **Stored XSS**

Occurs when:

- The payload is **saved in the database**
- Every user who visits the page triggers the script

Stored XSS is more dangerous because it persists.

Example malicious message:

```
<script>alert('Stored Meow Meow')</script>
```

Once saved, the alert appears **every time the page loads**.

---

# **Preventing XSS**

Key mitigation steps:

### ✔ Disable dangerous rendering (avoid `innerHTML`)

Use `textContent` instead.

### ✔ Harden cookies

Set cookies with:

- HttpOnly
- Secure
- SameSite

### ✔ Sanitise & encode input/output

Remove or escape:

- `<script>`
- event handlers (e.g., `onclick`)
- `javascript:` URLs
- Inline HTML that could be dangerous

---

# **Task Answers (Collapsible Format)**

---

### **Which type of XSS attack requires payloads to be persisted on the backend?**

<details><summary>Click to reveal</summary>
stored  
</details>

---

### **What's the reflected XSS flag?**

<details><summary>Click to reveal</summary>
THM{Evil_Bunny}  
</details>

---

### **What's the stored XSS flag?**

<details><summary>Click to reveal</summary>
THM{Evil_Stored_Egg}  
</details>

---
