# 🔐 Hydra: The Complete Practical Guide (The “Bible”)

## 📌 What is Hydra?

**Hydra (THC-Hydra)** is a powerful and fast **password brute-force tool** used by security professionals and penetration testers to test authentication mechanisms.

It supports **multiple protocols** and allows **parallelized login attempts**, making it extremely efficient.

---

## ⚠️ Legal Disclaimer

> Hydra must only be used on systems you **own** or have **explicit permission** to test.
> Unauthorized use is illegal and unethical.

---

# 🚀 Features

* Supports **50+ protocols**
* Multi-threaded (fast brute force)
* Works with:

  * Network services
  * Web login forms
  * APIs
* Supports:

  * Username/password lists
  * Brute-force
  * Dictionary attacks

---

# 📦 Installation

## 🐧 Kali Linux (Pre-installed)

```bash
hydra -h
```

## 🐧 Ubuntu / Debian

```bash
sudo apt update
sudo apt install hydra
```

## 🍎 macOS (Homebrew)

```bash
brew install hydra
```

## 🧰 From Source

```bash
git clone https://github.com/vanhauser-thc/thc-hydra.git
cd thc-hydra
./configure
make
sudo make install
```

---

# 📚 Understanding Hydra Basics

## 🔹 Basic Syntax

```bash
hydra -l <username> -P <password_list> <target> <protocol>
```

## 🔹 Key Parameters

| Option | Description        |
| ------ | ------------------ |
| `-l`   | Single username    |
| `-L`   | Username list      |
| `-p`   | Single password    |
| `-P`   | Password list      |
| `-t`   | Threads            |
| `-V`   | Verbose output     |
| `-o`   | Output file        |
| `-f`   | Stop after success |
| `-s`   | Port               |
| `-u`   | Loop users first   |

---

# 🔑 Wordlists (VERY IMPORTANT)

## 🔹 Common Wordlists

### Kali Built-in

```bash
/usr/share/wordlists/rockyou.txt
```

Unzip it:

```bash
gunzip /usr/share/wordlists/rockyou.txt.gz
```

### Recommended Wordlists

* RockYou (default)
* SecLists
* Custom-generated

---

## 📥 Download SecLists

```bash
git clone https://github.com/danielmiessler/SecLists.git
```

Useful paths:

```
SecLists/Passwords/
SecLists/Usernames/
```

---

# 🧠 Dynamic Wordlist Generation

## 🔹 Using `crunch`

```bash
crunch 6 8 abc123 -o wordlist.txt
```

Generate:

* Min length: 6
* Max length: 8
* Characters: abc123

---

## 🔹 Using `cewl` (Website scraping)

```bash
cewl http://target.com -w wordlist.txt
```

---

## 🔹 Using `hashcat rules`

```bash
hashcat --stdout rockyou.txt -r rules/best64.rule > newlist.txt
```

---

## 🔹 Custom Target-Based Wordlist

Think like attacker:

* Names
* Birthdays
* Company name
* Patterns

Example:

```
john123
john@2024
company123
```

---

# 🎯 Protocol Attacks (Examples)

---

## 🔐 SSH Brute Force

```bash
hydra -l root -P rockyou.txt ssh://192.168.1.10
```

---

## 🌐 FTP Attack

```bash
hydra -l admin -P rockyou.txt ftp://192.168.1.10
```

---

## 📡 Telnet

```bash
hydra -l admin -P passwords.txt telnet://192.168.1.10
```

---

## 🗄️ MySQL

```bash
hydra -l root -P passwords.txt mysql://192.168.1.10
```

---

## 📧 SMTP

```bash
hydra -l user@example.com -P passwords.txt smtp://mail.target.com
```

---

## 🔑 RDP

```bash
hydra -l administrator -P passwords.txt rdp://192.168.1.10
```

---

## 🌍 HTTP Login Form (IMPORTANT)

### Step 1: Capture Request (Burp Suite)

Example form:

```
username=^USER^&password=^PASS^
```

---

### Step 2: Hydra Command

```bash
hydra -L users.txt -P passwords.txt 192.168.1.10 http-post-form "/login:username=^USER^&password=^PASS^:F=incorrect"
```

---

## 🔓 HTTPS Login

```bash
hydra -L users.txt -P passwords.txt https-post-form "/login:username=^USER^&password=^PASS^:F=Invalid"
```

---

# ⚡ Advanced Usage

---

## 🔹 Multiple Users + Passwords

```bash
hydra -L users.txt -P passwords.txt ssh://192.168.1.10
```

---

## 🔹 Increase Speed

```bash
hydra -t 16 -l admin -P passwords.txt ftp://192.168.1.10
```

---

## 🔹 Save Output

```bash
hydra -l admin -P passwords.txt ssh://192.168.1.10 -o result.txt
```

---

## 🔹 Stop After First Success

```bash
hydra -f -l admin -P passwords.txt ssh://192.168.1.10
```

---

## 🔹 Use Specific Port

```bash
hydra -s 2222 -l root -P passwords.txt ssh://192.168.1.10
```

---

## 🔹 Verbose Mode

```bash
hydra -V -l admin -P passwords.txt ftp://192.168.1.10
```

---

# 🧪 Real-World Scenarios

---

## 🏢 Scenario 1: Weak SSH Password

* Target: Linux server
* Goal: Find weak credentials

```bash
hydra -L users.txt -P rockyou.txt ssh://target
```

---

## 🌐 Scenario 2: Web Login Testing

* Target: Login page
* Tool: Hydra + Burp

```bash
hydra -L users.txt -P passwords.txt target.com http-post-form "/login:user=^USER^&pass=^PASS^:Invalid"
```

---

## 🏦 Scenario 3: Internal Network Audit

* Services:

  * FTP
  * SSH
  * RDP

Run multiple tests:

```bash
hydra -L users.txt -P passwords.txt ftp://ip
hydra -L users.txt -P passwords.txt ssh://ip
hydra -L users.txt -P passwords.txt rdp://ip
```

---

## ☁️ Scenario 4: Cloud Misconfiguration

* Open ports exposed
* Weak admin credentials

---

## 🧑‍💻 Scenario 5: Credential Stuffing

Using leaked passwords:

```bash
hydra -L users.txt -P leaked_passwords.txt ssh://target
```

---

# 🧠 Best Practices

* Use **targeted wordlists**
* Start **slow**, then increase threads
* Avoid detection (rate limiting)
* Combine with:

  * Nmap
  * Burp Suite
  * Metasploit

---

# 🛑 Common Errors

| Error              | Fix                    |
| ------------------ | ---------------------- |
| Connection refused | Check port             |
| Too many attempts  | Reduce threads         |
| False positives    | Verify response string |

---

# 🔗 Hydra + Other Tools

## With Nmap

```bash
nmap -sV target
```

Find services → attack with Hydra

---

## With Burp Suite

* Capture request
* Extract parameters
* Use in Hydra

---

# 📊 Performance Tips

* Use SSD (faster reads)
* Reduce wordlist size
* Increase threads carefully

---

# 🔥 Pro Tips

* Always **customize wordlists**
* Use **username enumeration first**
* Combine:

  * Small list → fast success
  * Large list → deep testing

---

# 📘 Conclusion

Hydra is one of the most powerful tools for:

* Password auditing
* Penetration testing
* Security validation

Mastering Hydra means understanding:

* Protocols
* Authentication flows
* Wordlist strategy

---

# 🧾 Cheat Sheet

```bash
# SSH
hydra -l user -P pass.txt ssh://ip

# FTP
hydra -l user -P pass.txt ftp://ip

# HTTP POST
hydra -L users.txt -P pass.txt ip http-post-form "/login:user=^USER^&pass=^PASS^:F=fail"

# RDP
hydra -l admin -P pass.txt rdp://ip
```

---

# 🧠 Final Advice

> Hydra is not just a tool: it’s a **strategy weapon**.

Success depends more on:

* Wordlists
* Target understanding
* Smart testing

---

**Happy Ethical Hacking 🚀**
