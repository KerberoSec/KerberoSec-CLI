# 🛡️ PicoCTF Lab Walkthrough: Search Source

## 📌 Challenge Info

* **Category**: Web Exploitation
* **Difficulty**: Easy

---

## 📝 Challenge Description

Flag hidden in website source code.

---

## 🔍 Initial Recon

* **Files provided**: Website URL
* **Services/Ports**: HTTP
* **Hints given**: None

---

## 🛠️ Tools & Commands Used

| Tool / Command           | Purpose                 |
| ------------------------ | ----------------------- |
| `wget -r -l 10 -k -p -E` | Mirror the site locally |
| `grep -R "picoCTF"`      | Search for flag pattern |

---

## 🧠 Step-by-Step Solution

1. Mirrored the website:

   ```bash
   wget -r -l 10 -k -p -E http://saturn.picoctf.net:56751/
   ```
2. Searched mirrored files for flag:

   ```bash
   grep -R "picoCTF" saturn.picoctf.net:56751/
   ```
3. Found flag inside `style.css` as a CSS comment.

---

## 🧾 Flag

picoCTF{1nsp3ti0n\_0f\_w3bpag3s\_ec95fa49}

---

## 📚 Learning Outcomes

* Website mirroring allows offline static analysis.
* Searching with regex patterns speeds up flag discovery.

