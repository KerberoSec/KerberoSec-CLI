# 🔐 Password Attacks

## 📌 Overview

The **Password Attacks** section contains tools, techniques, and resources used to test the strength of authentication systems.

These attacks focus on identifying:

* Weak passwords
* Poor authentication mechanisms
* Misconfigured login systems

This category is essential in **penetration testing** and **security assessments**, as compromised credentials are one of the most common attack vectors.

---

## 🎯 Objectives

* Identify weak or reused passwords
* Test login mechanisms against brute-force attacks
* Simulate real-world credential-based attacks
* Improve overall authentication security

---

## 🧠 Types of Password Attacks

### 🔹 1. Brute Force Attack

Attempts every possible combination of characters.

* Very slow (if no optimization)
* Guaranteed success (given enough time)

---

### 🔹 2. Dictionary Attack

Uses a predefined list of common passwords.

* Faster than brute force
* Highly effective against weak passwords

---

### 🔹 3. Credential Stuffing

Uses leaked username/password combinations.

* Very effective in real-world scenarios
* Exploits password reuse

---

### 🔹 4. Password Spraying

Attempts a few common passwords across many accounts.

* Avoids account lockouts
* Useful in enterprise environments

---

### 🔹 5. Hybrid Attack

Combines dictionary + variations (e.g., `Password123`)

---

## 🛠️ Tools in This Folder

| Tool                   | Description                         |
| ---------------------- | ----------------------------------- |
| **Hydra**              | Fast network login brute-force tool |
| *(Add more as needed)* | e.g., John the Ripper, Medusa       |

---

## ⚙️ Common Use Cases

* SSH login testing
* FTP credential auditing
* Web login brute forcing
* RDP authentication testing
* API authentication testing

---

## 📂 Example Structure

```
password-attacks/
│
├── hydra/
│   ├── README.md
│   └── examples/
│
├── john-the-ripper/
│
└── wordlists/
```

---

## 🔑 Wordlists

Password attacks rely heavily on wordlists.

### Common Sources:

* RockYou
* SecLists
* Custom-generated lists

### Wordlist Types:

* Generic passwords
* Target-specific passwords
* Generated combinations

---

## ⚠️ Important Considerations

* Always use **authorized environments only**
* Be aware of:

  * Account lockout policies
  * Rate limiting
  * Intrusion detection systems

---

## 🧪 Lab Practice Recommendations

Practice safely using:

* TryHackMe
* Hack The Box
* Local lab environments (e.g., Metasploitable, DVWA)

---

## 🛑 Legal Disclaimer

> These tools and techniques must only be used on systems you own or have explicit permission to test. Unauthorized use is illegal.

---

## 🚀 Learning Path

1. Start with **Hydra basics**
2. Learn **wordlist creation**
3. Practice on **network services**
4. Move to **web authentication attacks**
5. Combine with tools like:

   * Nmap
   * Burp Suite

---

## 🧠 Key Takeaway

> Password attacks are not about the tool: they are about **strategy, wordlists, and understanding human behavior**.

---

## 📚 Next Steps

* Explore each tool inside this folder
* Practice real-world scenarios
* Build custom wordlists for better success rates

---

**Happy Ethical Hacking 🔥**
