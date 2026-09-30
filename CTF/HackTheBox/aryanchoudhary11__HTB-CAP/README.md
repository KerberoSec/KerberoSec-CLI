# 🔐 Hack The Box: Cap (Writeup)

## 📌 Machine Information

| Attribute   | Value                                                     |
| ----------- | --------------------------------------------------------- |
| Name        | Cap                                                       |
| Platform    | Hack The Box                                              |
| OS          | Linux                                                     |
| Focus Areas | IDOR, PCAP Analysis, Credential Reuse, Linux Capabilities |

---

## 🧠 Objective

* Enumerate the target
* Identify vulnerabilities
* Gain user access
* Escalate privileges to root

---

## 🌐 Initial Reconnaissance

After connecting to the HTB VPN, the target web application was accessible over HTTP.

The application exposed multiple functionalities:

* Security Snapshot
* IP Config
* Netstat

These features suggested backend interaction with system-level commands and stored scan results.

*[Image: Initial Recon]*

---

## 🔍 Web Application Analysis

While interacting with the **Security Snapshot** feature, the application redirected to a URL structured as:

```
/data/{id}
```

This indicated that scan results were indexed and accessible via an ID parameter.

*[Image: Snapshot]*

---

## 🚨 IDOR Vulnerability

By modifying the `id` parameter manually:

```
/data/0
/data/1
/data/2
...
```

It was possible to access scan results belonging to other users.

This confirmed an **Insecure Direct Object Reference (IDOR)** vulnerability, allowing unauthorized data access.

*[Image: IDOR]*

---

## 📦 Sensitive Data Exposure (PCAP Files)

Each `/data/{id}` endpoint returned downloadable `.pcap` files.

During enumeration, it was discovered that:

```
/data/0
```

contained meaningful captured traffic.

---

## 🔬 PCAP Analysis

The PCAP file was analyzed using:

* Wireshark

Sensitive credentials were identified within the network capture:

```
Username: nathan
Password: ********
```

This demonstrated plaintext credential leakage over network traffic.

*[Image: PCAP Analysis]*

---

## 🔑 Credential Reuse

Using the extracted credentials, authentication was attempted across services.

### SSH Access

```
ssh nathan@<target_ip>
```

The same password worked successfully, granting shell access.

This confirmed **credential reuse across services**, a common real-world vulnerability.

*[Image: Crdeential Reuse]*

---

## 👤 User Access

After successful login:

```
cat /home/nathan/user.txt
```

---

## 🚀 Privilege Escalation

To identify privilege escalation vectors, Linux capabilities were enumerated:

```
getcap -r / 2>/dev/null
```

### 🔎 Result

```
/usr/bin/python3.8 = cap_setuid,cap_net_bind_service+eip
```

---

## ⚠️ Exploitation

The `cap_setuid` capability allows arbitrary UID changes.

Using Python, root privileges were obtained:

```
/usr/bin/python3.8 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

---

## 👑 Root Access

After privilege escalation:

```
cd /root
cat root.txt
```
*[Image: Final Root Access]*

---

## 🎯 Key Learnings

* **IDOR vulnerabilities** can expose sensitive user data
* **PCAP files** may contain plaintext credentials
* **Credential reuse** significantly increases attack impact
* **Linux capabilities** can be abused for privilege escalation

---

## 🛠️ Tools & Techniques

* Nmap (Reconnaissance)
* Browser DevTools (Analysis)
* ffuf (Enumeration)
* Wireshark / strings (PCAP Analysis)
* SSH (Access)
* Linux Enumeration (getcap)

---

## 🔗 Attack Chain Summary

1. Web Enumeration
2. IDOR Exploitation
3. PCAP File Discovery
4. Credential Extraction
5. SSH Access via Credential Reuse
6. Privilege Escalation using Capabilities
7. Root Access

---

## ✅ Conclusion

The **Cap** machine demonstrates a realistic attack chain starting from a simple web vulnerability (IDOR) leading to full system compromise. It highlights the importance of secure access control, proper handling of sensitive data, and restricting system-level capabilities.

---

## 📌 Author

**Aryan**
Cybersecurity Enthusiast | Web Developer

---
