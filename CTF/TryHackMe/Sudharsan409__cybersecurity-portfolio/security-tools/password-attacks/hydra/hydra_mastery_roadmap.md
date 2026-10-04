# 🧠 Hydra Mastery Roadmap (Step-by-Step)

## 🎯 Goal

Become highly skilled at using **Hydra** for real-world penetration testing by mastering:

* Protocol attacks
* Wordlist strategy
* Web authentication bypassing
* Real-world scenarios

---

# 🟢 Phase 1: Foundations (Day 1-2)

## ✅ Learn Core Concepts

Understand:

* What is brute force?
* Dictionary attack vs brute force
* Authentication mechanisms

## ✅ Install & Verify Hydra

```bash
hydra -h
```

## ✅ Learn Basic Syntax

```bash
hydra -l user -P pass.txt ssh://target
```

👉 Focus on:

* `-l`, `-L`, `-p`, `-P`
* Protocol structure

---

## 🧪 Practice Task

* Install Hydra
* Run a test on a **local machine or lab**
* Use a small wordlist

---

# 🟡 Phase 2: Wordlist Mastery (Day 3-5)

## ✅ Understand Wordlists

Learn:

* Why wordlists matter more than the tool
* Difference between:

  * Generic (rockyou)
  * Targeted
  * Generated

---

## ✅ Use Existing Wordlists

```bash
/usr/share/wordlists/rockyou.txt
```

---

## ✅ Learn SecLists

```bash
git clone https://github.com/danielmiessler/SecLists.git
```

Explore:

* Passwords/
* Usernames/

---

## ✅ Generate Custom Wordlists

### Crunch

```bash
crunch 6 8 abc123 -o list.txt
```

### CeWL (from website)

```bash
cewl http://target.com -w list.txt
```

---

## 🧪 Practice Task

* Create 3 wordlists:

  * Small (10 passwords)
  * Medium (1000)
  * Target-based

---

# 🔵 Phase 3: Protocol Attacks (Day 6-10)

## ✅ Learn Common Protocols

Focus on:

### SSH

```bash
hydra -l root -P rockyou.txt ssh://ip
```

### FTP

```bash
hydra -l admin -P pass.txt ftp://ip
```

### Telnet

```bash
hydra -l admin -P pass.txt telnet://ip
```

### MySQL

```bash
hydra -l root -P pass.txt mysql://ip
```

### RDP

```bash
hydra -l admin -P pass.txt rdp://ip
```

---

## 🧪 Practice Task

* Use **Metasploitable2** or TryHackMe labs
* Identify open ports using Nmap
* Attack each service with Hydra

---

# 🔴 Phase 4: Web Login Attacks (Day 11-15)

## ⚡ MOST IMPORTANT PHASE

---

## ✅ Learn HTTP Forms

Understand:

* POST requests
* Parameters
* Failure messages

---

## ✅ Use Burp Suite

Steps:

1. Capture login request
2. Identify:

   * Username field
   * Password field
   * Error message

---

## ✅ Hydra Web Attack

```bash
hydra -L users.txt -P pass.txt target http-post-form "/login:user=^USER^&pass=^PASS^:F=Invalid"
```

---

## 🧪 Practice Task

* Attack:

  * DVWA (Damn Vulnerable Web App)
  * Juice Shop
* Try:

  * Correct failure string
  * Different login endpoints

---

# 🟣 Phase 5: Optimization & Speed (Day 16-18)

## ✅ Threads

```bash
hydra -t 16 ...
```

## ✅ Stop After Success

```bash
hydra -f ...
```

## ✅ Output Results

```bash
hydra -o result.txt ...
```

---

## 🧪 Practice Task

* Compare:

  * 4 threads vs 16 threads
* Measure speed

---

# 🟠 Phase 6: Real-World Scenarios (Day 19-25)

## 🎯 Scenario-Based Learning

---

## 🏢 Scenario 1: Weak Credentials

* Target: SSH server
* Use:

  * Small wordlist
  * Common usernames

---

## 🌐 Scenario 2: Web Login

* Target: Login page
* Use:

  * Burp + Hydra

---

## ☁️ Scenario 3: Misconfigured Server

* Scan with Nmap
* Attack exposed services

---

## 🧑‍💻 Scenario 4: Credential Stuffing

* Use leaked passwords

---

## 🧪 Practice Task

* Combine:

  * Nmap → Hydra
  * Burp → Hydra

---

# 🔥 Phase 7: Advanced Techniques (Day 26-30)

## ✅ Username Enumeration

* Find valid usernames first

---

## ✅ Custom Attack Strategy

* Small list → fast win
* Large list → deep attack

---

## ✅ Combine Tools

* Nmap
* Burp Suite
* Metasploit

---

## ✅ Avoid Detection

* Reduce threads
* Add delays
* Use proxies (advanced)

---

## 🧪 Practice Task

* Simulate real pentest:

  * Scan
  * Identify service
  * Build wordlist
  * Attack

---

# 🧠 Phase 8: Expert Level

## 🚀 Think Like a Hacker

Ask:

* What passwords would THIS user choose?
* What patterns exist?

---

## ✅ Build Smart Wordlists

Include:

* Names
* Dates
* Company terms

---

## ✅ Automate

* Write scripts combining:

  * Nmap
  * Hydra

---

# 📅 Daily Study Plan (Quick Version)

| Day   | Focus        |
| ----- | ------------ |
| 1-2   | Basics       |
| 3-5   | Wordlists    |
| 6-10  | Protocols    |
| 11-15 | Web attacks  |
| 16-18 | Optimization |
| 19-25 | Scenarios    |
| 26-30 | Advanced     |

---

# 🏆 Final Milestone

You are “Hydra Master” when you can:

✅ Identify attack surface
✅ Build custom wordlists
✅ Attack web + network services
✅ Avoid false positives
✅ Optimize speed & accuracy

---

# 💡 Pro Tip

> Hydra success = 80% wordlist + 20% tool usage

---

# 🚀 Next Step

After Hydra mastery, learn:

* Hashcat (password cracking)
* Burp Suite (web security)
* Nmap scripting

---

**You’re now on the path to becoming a real penetration tester 🔥**
