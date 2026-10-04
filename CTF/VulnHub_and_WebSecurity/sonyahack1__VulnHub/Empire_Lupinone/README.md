---
<div align="center">

*[Image: logo]*

# VulnHub: Empire: LupinOne

### 📊 Difficulty: **Medium**
### 📁 Category: Privilege Escalation / Misconfiguration

</div>

---

<div align="center">

🔎 During this attack, the target system `Empire: LupinOne` was fully compromised.
`Initial scanning and reconnaissance` revealed the presence of a password protected `private ssh key` that was insecurely stored at the URL `http://192.168.50.235/~secret/.mysecret.txt`.
The `passphrase` was successfully cracked using the `john` utility, which allowed to gain `Initial Access` to the system as user `icex64` via an `External Remote Service` (`ssh`).

In the next phase, a method of `Horizontal Privilege Escalation` was applied by compromising user `arsene` through a `misconfiguration in the sudoers file`.
Insecure permissions on the `webbrowser.py library` allowed overwriting its contents with `malicious reverse shell code`, resulting in shell access under the `arsene` account.

Further `Internal Enumeration` revealed another `misconfiguration in the sudoers file`.
The ability to execute the `pip package manager` with `root` privileges led to `full control over the system`.

</div>

---

> 💡 **Skills Required**
- Recon (Initial Fuzzing)
- Linux Enumeration
- Programming Language

> 🛠️ **Skills Learned**
- Sudo Exploitation (misconfig)
- Brute Force private key
