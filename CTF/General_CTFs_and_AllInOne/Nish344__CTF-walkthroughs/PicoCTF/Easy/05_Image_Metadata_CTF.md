# 🛡️ PicoCTF Lab Walkthrough: Image Metadata CTF

## 📌 Challenge Info
- **Category**: Forensics / Web Exploitation / File Analysis  
- **Difficulty**: Easy

---

## 📝 Challenge Description
An image contained a hidden flag in its EXIF metadata.

---

## 🔍 Initial Recon
- **Files provided**: cat.jpg
- **Services/Ports**: None
- **Hints given**: None

---

## 🛠️ Tools & Commands Used
| Tool / Command | Purpose |
|----------------|---------|
| `exiftool` | Read EXIF metadata |
| `base64 -d` | Decode embedded string |

---

## 🧠 Step-by-Step Solution
1. Ran:
   ```bash
   exiftool cat.jpg
   ```
Found Base64 string in License field.

Decoded it:
```bash
echo <encoded_string> | base64 -d

```

Got flag:
picoCTF{example_flag_here}

## 🧾 Flag
picoCTF{example_flag_here}

## 📚 Learning Outcomes
-EXIF metadata can leak sensitive data.
-Always sanitize images before sharing.

## 🔗 References
[ExifTool Documentation](https://exiftool.org/)
