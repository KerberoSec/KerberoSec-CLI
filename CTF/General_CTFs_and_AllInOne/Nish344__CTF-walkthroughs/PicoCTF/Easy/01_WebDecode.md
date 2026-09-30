# 🛡️ PicoCTF Lab Walkthrough: WebDecode

## 📌 Challenge Info
- **Category**: Web Exploitation
- **Difficulty**: Easy

---

## 📝 Challenge Description
The target application contained three pages: Home, About, and Contact. Inspection of the About page’s HTML revealed a hidden attribute (`notify_true`) containing a Base64-encoded string.

---

## 🔍 Initial Recon
- **Files provided**: None
- **Services/Ports**: Web server with three pages
- **Hints given**: None

---

## 🛠️ Tools & Commands Used
| Tool / Command | Purpose |
|----------------|---------|
| Browser DevTools | Inspect HTML source code |
| `base64 -d` | Decode Base64 encoded string |

---

## 🧠 Step-by-Step Solution
1. Opened **About** page in browser, used **F12** to inspect HTML.
2. Found hidden attribute with Base64 string:
```text
cGljb0NURnt3ZWJfc3VjYzNzc2Z1bGx5X2QzYzBkZWRfMDdiOTFjNzl9
```

4. Decoded it:
```bash
echo cGljb0NURnt3ZWJfc3VjYzNzc2Z1bGx5X2QzYzBkZWRfMDdiOTFjNzl9 | base64 -d
```
Output:
```text
picoCTF{web_succ3ssfully_d3c0ded_07b91c79}
```

## 🧾 Flag
picoCTF{web_succ3ssfully_d3c0ded_07b91c79}

## 📚 Learning Outcomes
- Always inspect client-side code for hidden attributes.
- Base64 encoding is not encryption; it can be easily decoded.

## 🔗 References
Base64 Command: Linux Manual
