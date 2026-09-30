---
<div align="center">

*[Image: logo]*

# VulnHub: Thales: 1

### 📊 Difficulty: **Easy**
### 📁 Category: Privilege Escalation

</div>

---

<div align="center">

🔎 During the execution of this attack, the target system `Thales:1` became `Fully Compromised`.

`Initial scanning and reconnaissance` revealed an `Apache Tomcat web server` running on port `8080`, which was vulnerable to a `bruteforce` attack. Exploiting this weakness allowed
access to the Tomcat `Web Application Manager interface`, where a malicious `.war` payload was uploaded. This resulted in obtaining `Initial Access` to the server under the `tomcat` user account.

At the next stage, a technique of `Horizontal Privilege Escalation` was performed by compromising the user `thales` through their encrypted private key `id_rsa`, which was protected with a `passphrase`.
Using the `john` tool and a `bruteforce` attack, the passphrase was successfully recovered, allowing decryption of the private key and subsequent access to the `thales` account.

Further internal `Enumeration` uncovered an executable script `backup.sh` located in `/usr/local/bin/`, which had overly permissive write rights for the `other access category`. The script was executed
every five minutes by a scheduled cron job running with `root privileges`. By overwriting the contents of `backup.sh` and waiting for the next cron execution cycle, full system compromise was achieved
with `root‑level access`.

</div>

---

> 💡 **Skills Required**
- Metasploit Knowledge
- Linux Command Line (Basic)

> 🛠️ **Skills Learned**
- cron job exploitation
- private key exploitation
- Improve skill of working with Metasploi
