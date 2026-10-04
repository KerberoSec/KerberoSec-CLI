# 🛡️ PicoCTF Lab Walkthrough: Tab Tab Attack

## 📌 Challenge Info
- **Category**: Forensics / Web Exploitation
- **Difficulty**: Easy

---

## 📝 Challenge Description
A zip file contained nested folders, with the flag in a hidden subdirectory.

---

## 🔍 Initial Recon
- **Files provided**: archive.zip
- **Services/Ports**: None
- **Hints given**: None

---

## 🛠️ Tools & Commands Used
| Tool / Command | Purpose |
|----------------|---------|
| `unzip` | Extract archive |
| `ls -a` | Show hidden directories |

---

## 🧠 Step-by-Step Solution
1. Extracted:
   ```bash
   unzip archive.zip
   ```
Navigated directories until finding hidden folder.

Found flag inside a .txt file.

## 🧾 Flag  
picoCTF{[flag_here]}

## 📚 Learning Outcomes  
-Zip archives can conceal flags in nested paths.  
-Always check hidden folders.  
  
## 🔗 References  
[zip/unzip Manual](https://linux.die.net/man/1/unzip)
