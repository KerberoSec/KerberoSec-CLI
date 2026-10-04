# 🧩 Linux Privilege Escalation: Writeup

🔗 Room: TryHackMe
📚 Based on material by Tib3rius

> Practice Linux Privilege Escalation techniques on an intentionally misconfigured Debian VM.

---

## 🎯 Objective

This room focuses on identifying and exploiting multiple **Privilege Escalation vectors** in Linux systems.

The goal is not just to gain root, but to understand:

* where to look
* what to look for
* how misconfigurations lead to escalation

---

## 🔐 Initial Access

```bash
ssh user@MACHINE_IP
```

Credentials:

```
user:password321
```

Check current privileges:

```bash
id
```

Output:

```
uid=1000(user) gid=1000(user) groups=1000(user),24(cdrom),25(floppy),29(audio),30(dip),44(video),46(plugdev)
```

💡 **Insight:**
The user is non-privileged but belongs to several groups, which may increase the attack surface.

---

# 🧗 Privilege Escalation Techniques

---

## 🧨 Task 3: Readable `/etc/shadow`

Root password hash:

```
$6$Tb/euwmK$OXA.dwMeOAcopwBl68boTG5zi65wIHsc84OWAIye5VITLLtVlaXvRDJXET..it8r.jbrlpfZeMdwD3B0fGxJI0
```

Hashing algorithm:

```
sha512crypt
```

Cracked password:

```
password123
```

💡 **Analysis:**
If `/etc/shadow` is readable:

* attackers can perform offline cracking
* this completely breaks authentication security

---

## 🧨 Task 5: Writable `/etc/passwd`

After modifying the file and creating a privileged user:

```bash
id
```

Output:

```
uid=0(root) gid=0(root) groups=0(root)
```

💡 **Insight:**
Writable `/etc/passwd` allows:

* changing UID to 0
* creating root-equivalent users

👉 This is a **critical misconfiguration**

---

## 🔥 Task 6: SUDO Abuse

Number of allowed sudo programs:

```
11
```

Program without direct GTFOBins shell escape:

```
apache2
```

💡 **Important point:**
Even if a binary has no direct shell escape:

* it may be abused via configs
* indirect execution paths
* chaining techniques

👉 PrivEsc often requires creativity beyond known payloads.

---

## 🌱 Task 9: Cron + PATH Hijacking

PATH value:

```
/home/user:/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
```

💡 **Critical Insight:**
Since `/home/user` appears first:

* we can place a malicious binary there
* it will be executed by cron as root

👉 Classic privilege escalation vector.

---

## 🔐 Exposed Credentials

### History files

```
mysql -h somehost.local -uroot -ppassword123
```

💡 **Issue:**

* credentials stored in `.bash_history`
* easily reusable by attackers

---

### Config files

Discovered file:

```
/etc/openvpn/auth.txt
```

💡 **Insight:**
Configuration files often contain:

* plaintext credentials
* API keys
* tokens

👉 Always worth thorough enumeration.

---

## 📡 NFS Misconfiguration

Vulnerable option:

```
no_root_squash
```

💡 **Impact:**

* remote root retains privileges
* allows root-level file access and execution

---

## 🧠 Key Takeaways

* Enumeration is more important than exploitation
* Small misconfigurations can lead to full compromise
* Credential exposure is extremely common
* PATH and permissions are frequent weak points

---

## 🛡️ Mitigations

* Restrict permissions on `/etc/shadow` and `/etc/passwd`
* Avoid `no_root_squash`
* Never store credentials in plaintext
* Audit cron jobs and PATH variables
* Apply least privilege principle

---

## 🔥 Conclusion

This room demonstrates that privilege escalation is not about complex exploits, but about:

> 🔎 **Systematic enumeration + understanding misconfigurations**

The real skill lies in thinking like an attacker, not just running tools.
