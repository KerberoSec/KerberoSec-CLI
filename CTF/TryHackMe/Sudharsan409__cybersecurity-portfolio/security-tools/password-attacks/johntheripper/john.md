# 🔓 John the Ripper: The Complete Practical Guide (The “Bible”)

## 📌 What is John the Ripper?

**John the Ripper (JtR)** is a powerful **password cracking tool** used to detect weak passwords by performing:

* Dictionary attacks
* Brute-force attacks
* Rule-based attacks

It is widely used by **penetration testers**, **security analysts**, and **red teamers**.

---

## ⚠️ Legal Disclaimer

> Use John the Ripper only on systems you own or have explicit permission to test. Unauthorized use is illegal.

---

# 🚀 Features

* Supports **hundreds of hash formats**
* Fast and optimized cracking engine
* Highly customizable attack modes
* Supports:

  * CPU cracking
  * GPU (via Jumbo version)
* Rule-based transformations (very powerful)

---

# 📦 Installation

## 🐧 Kali Linux (Pre-installed)

```bash id="h1j2k3"
john
```

---

## 🐧 Ubuntu / Debian

```bash id="h4j5k6"
sudo apt update
sudo apt install john
```

---

## 🍎 macOS (Homebrew)

```bash id="h7j8k9"
brew install john-jumbo
```

---

## 🧰 Install Jumbo Version (Recommended)

```bash id="h10j11"
git clone https://github.com/openwall/john.git
cd john/src
./configure
make -s clean && make -sj4
```

Run:

```bash id="h12j13"
cd ../run
./john
```

---

# 🧠 Core Concepts

## 🔹 What is a Hash?

A **hash** is a one-way encrypted version of a password.

Example:

```id="h14j15"
password123 → 482c811da5d5b4bc6d497ffa98491e38
```

---

## 🔹 Goal of John

👉 Convert hash → original password

---

# 🔑 Input Files (Very Important)

John works with files like:

```id="h16j17"
username:hash
```

Example:

```id="h18j19"
admin:5f4dcc3b5aa765d61d8327deb882cf99
```

---

# 📚 Wordlists

## 🔹 Default Wordlist (Kali)

```bash id="h20j21"
/usr/share/wordlists/rockyou.txt
```

Unzip:

```bash id="h22j23"
gunzip /usr/share/wordlists/rockyou.txt.gz
```

---

## 🔹 Download SecLists

```bash id="h24j25"
git clone https://github.com/danielmiessler/SecLists.git
```

---

## 🔹 Best Wordlists to Use

* RockYou (baseline)
* SecLists (professional)
* Custom lists (BEST)

---

# 🧠 Dynamic Wordlist Generation

---

## 🔹 Using Crunch

```bash id="h26j27"
crunch 6 8 abc123 -o wordlist.txt
```

---

## 🔹 Using CeWL (Website scraping)

```bash id="h28j29"
cewl http://target.com -w wordlist.txt
```

---

## 🔹 Using Rules (Most Powerful)

```bash id="h30j31"
john --wordlist=rockyou.txt --rules hashes.txt
```

Rules modify words:

* password → Password123
* admin → admin@2024

---

## 🔹 Custom Wordlists

Use:

* Names
* Dates
* Company names

Example:

```id="h32j33"
john
john123
john@2025
company123
```

---

# 🎯 Basic Usage

## 🔹 Crack with Wordlist

```bash id="h34j35"
john --wordlist=rockyou.txt hashes.txt
```

---

## 🔹 Show Cracked Passwords

```bash id="h36j37"
john --show hashes.txt
```

---

## 🔹 Incremental Mode (Brute Force)

```bash id="h38j39"
john --incremental hashes.txt
```

---

## 🔹 Specify Hash Format

```bash id="h40j41"
john --format=raw-md5 hashes.txt
```

---

# 🔍 Identify Hash Type

## 🔹 Using `john`

```bash id="h42j43"
john --list=formats
```

## 🔹 Using `hashid`

```bash id="h44j45"
hashid hash.txt
```

---

# 🔥 Attack Modes

---

## 🔹 1. Dictionary Attack

```bash id="h46j47"
john --wordlist=rockyou.txt hashes.txt
```

---

## 🔹 2. Rule-Based Attack

```bash id="h48j49"
john --wordlist=rockyou.txt --rules hashes.txt
```

---

## 🔹 3. Incremental (Brute Force)

```bash id="h50j51"
john --incremental hashes.txt
```

---

## 🔹 4. Single Crack Mode

Uses username info:

```bash id="h52j53"
john hashes.txt
```

---

## 🔹 5. Mask Attack (Jumbo)

```bash id="h54j55"
john --mask=?l?l?l?d?d hashes.txt
```

---

# 🧪 Real-World Scenarios

---

## 🏢 Scenario 1: Cracking Linux Passwords

Extract hashes:

```bash id="h56j57"
unshadow /etc/passwd /etc/shadow > hashes.txt
```

Crack:

```bash id="h58j59"
john --wordlist=rockyou.txt hashes.txt
```

---

## 🌐 Scenario 2: Web App Database Leak

* Extract hashes from DB dump
* Crack using John

---

## 📧 Scenario 3: Cracking ZIP File Password

```bash id="h60j61"
zip2john file.zip > hash.txt
john hash.txt
```

---

## 📄 Scenario 4: Cracking PDF Password

```bash id="h62j63"
pdf2john file.pdf > hash.txt
john hash.txt
```

---

## 🔐 Scenario 5: Cracking SSH Keys

```bash id="h64j65"
ssh2john id_rsa > hash.txt
john hash.txt
```

---

## 💾 Scenario 6: Cracking Windows Hashes

* Dump SAM hashes
* Use John

---

## 🧑‍💻 Scenario 7: Credential Audit

* Extract hashes
* Test password strength

---

# ⚡ Advanced Usage

---

## 🔹 Resume Session

```bash id="h66j67"
john --restore
```

---

## 🔹 Session Name

```bash id="h68j69"
john --session=test hashes.txt
```

---

## 🔹 Fork for Speed

```bash id="h70j71"
john --fork=4 hashes.txt
```

---

## 🔹 External Rules

```bash id="h72j73"
john --rules=best64 hashes.txt
```

---

# 🛑 Common Errors

| Error            | Fix                 |
| ---------------- | ------------------- |
| No hashes loaded | Check format        |
| Slow cracking    | Use better wordlist |
| Wrong format     | Specify `--format`  |

---

# 🔗 Integration with Other Tools

---

## 🔹 With Hydra

* Hydra → Get credentials
* John → Crack hashes

---

## 🔹 With Hashcat

* John (CPU)
* Hashcat (GPU)

---

# 📊 Performance Tips

* Use **Jumbo version**
* Use **rules instead of brute force**
* Start with **small wordlist**
* Use **multi-core CPU**

---

# 🧠 Best Practices

* Always identify hash type first
* Use targeted wordlists
* Avoid blind brute force
* Use rules aggressively

---

# 🧾 Cheat Sheet

```bash id="h74j75"
# Basic
john hashes.txt

# Wordlist
john --wordlist=rockyou.txt hashes.txt

# Rules
john --wordlist=rockyou.txt --rules hashes.txt

# Show results
john --show hashes.txt

# Incremental
john --incremental hashes.txt
```

---

# 🧠 Key Takeaway

> John the Ripper is not just a tool: it’s a **password analysis engine**.

Success depends on:

* Wordlists
* Rules
* Understanding human password behavior

---

# 📘 Conclusion

John the Ripper is essential for:

* Password auditing
* Hash cracking
* Security testing

Master it, and you master one of the **core pillars of cybersecurity**.

---

# 🚀 Next Steps

* Learn **Hashcat (GPU cracking)**
* Practice on:

  * TryHackMe
  * Hack The Box
* Combine with:

  * Hydra
  * Nmap

---

**Happy Ethical Hacking 🔥**
