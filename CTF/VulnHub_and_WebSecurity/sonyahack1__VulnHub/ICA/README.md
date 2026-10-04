
---
<div align="center">

*[Image: logo]*

# VulnHub: ICA: 1

### 📊 Difficulty: **Easy**
### 📁 Category: Web / Privilege Escalation

</div>

---

<div align="center">

🔎 During the attack on the target system `ICA:1`, a vulnerable version of the web application `qdPM 9.2` was discovered, which provided unauthorized access to
the `configuration file databases.yml` located at `http://192.168.50.156/core/config/databases.yml`.

The credentials obtained from this file allowed connection to the `MySQL database`, from which user login `names` and `passwords` were extracted. One of the retrieved
accounts (`travis`) was valid for `SSH authentication`, granting `Initial Access` to the system.

During reconnaissance, a binary file named `get_access` was found with the `SUID bit` set under the `root` user. `Reverse engineering` of the binary revealed that it
executed the `cat` command without specifying an `absolute path`. This behavior made it possible to `inject` a malicious replacement of the `cat` command and modify
the `PATH` environment variable to include a custom directory.

As a result, executing `get_access` led to `Privilege Escalation` and a `root shell`, resulting in full `System Compromise`.

</div>

---

> 💡 **Skills Required**
- Web Enumeration
- Linux Command Line

> 🛠️ **Skills Learned**
- Exploitation Web Application
- SUID exploitation
