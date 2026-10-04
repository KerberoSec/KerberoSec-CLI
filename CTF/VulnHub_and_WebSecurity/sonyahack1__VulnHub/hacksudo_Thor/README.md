---
<div align="center">

*[Image: logo]*

# VulnHub: hacksudo: Thor

### 📊 Difficulty: **Easy**
### 📁 Category: Linux / Privilege Escalation (sudo misconfig)

</div>

---

<div align="center">

🔎 During the attack on the `hacksudo: Thor` system, directory scanning revealed an outdated and vulnerable `cgi-bin` directory containing two scripts: `backup.cgi` and `shell.sh`.
Exploitation of the `shellshock` vulnerability via the `shell.sh` script by injecting a command into the HTTP `User-Agent` header: allowed `Initial Access` to the system as the
`www-data` user. Subsequent `Local Enumeration` revealed a potentially insecure `sudoers` configuration for both the `www-data` and `thor` users, which ultimately led to `full system compromise`.

</div>

---

> 💡 **Skills Required**
- Basic `Web Enumeartion`
- Linux Command Line

> 🛠️ **Skills Learned**
- Exploitation of the `Shellshock` vulnerability
- `SUDO` Exploitation
