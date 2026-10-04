---
<div align="center">

*[Image: logo]*

# VulnHub: Escalate My Privileges: 1

### 📊 Difficulty: **Easy / Beginner Level**
### 📁 Category: Linux / Privilege Escalation

</div>

---

<div align="center">

🔎 During the attack on the `Escalate My Privileges: 1` system, a network scan revealed an insecure publicly accessible page at `/phpbash.php`, which provided a web-based command shell
running with the privileges of the `apache` user. This allowed for `Initial Access` to the system by establishing a reverse shell to the attacker's machine.
Subsequent local `Enumeration` identified a potentially dangerous executable `python2.7` with the `SUID` bit set and owned by `root`. This led to full system compromise by leveraging a
one-liner in python to `Escalate Privileges`.

</div>

---

> 💡 **Skills Required**
- Linux CLI

> 🛠️ **Skills Learned**
- SUID exploitation
