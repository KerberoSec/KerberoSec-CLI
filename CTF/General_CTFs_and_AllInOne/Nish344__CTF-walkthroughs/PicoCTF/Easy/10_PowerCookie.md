# 🛡️ PicoCTF Lab Walkthrough: Power Cookie

## 📌 Challenge Info

* **Category**: Web Exploitation
* **Difficulty**: Easy

---

## 📝 Challenge Description

Exploit cookie-based authentication to reveal flag.

---

## 🔍 Initial Recon

* **Files provided**: None
* **Services/Ports**: Web app with cookies
* **Hints given**: Cookie manipulation suggested

---

## 🛠️ Tools & Commands Used

| Tool / Command   | Purpose                |
| ---------------- | ---------------------- |
| Browser DevTools | Inspect/modify cookies |

---

## 🧠 Step-by-Step Solution

1. Inspected cookies → found value set to `0`.
2. Modified cookie to `1` in DevTools.
3. Refreshed page → flag revealed.

---

## 🧾 Flag

picoCTF{\[flag\]}

---

## 📚 Learning Outcomes

* Weak cookie-based authentication can be bypassed easily.
* Always validate authentication server-side.
