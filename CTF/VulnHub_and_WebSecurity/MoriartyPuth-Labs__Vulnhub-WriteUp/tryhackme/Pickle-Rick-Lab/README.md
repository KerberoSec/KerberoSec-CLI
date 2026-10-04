# 🫧 Lab Report: Operation Pickle Rick
<img width="1024" height="572" alt="image" src="https://github.com/user-attachments/assets/88e514de-e53b-469b-8309-d2d0c2b5342b" />

---

**Target:** `10.10.x.x` [TryHackMe: Pickle Rick](https://tryhackme.com/room/picklerick)

**Classification:** Professional Security Audit    

**Tools Used:** [Bubble-Scanner](https://github.com/MoriartyPuth/bubble-scanner) & [Bubble-Siphon](https://github.com/MoriartyPuth/bubble-siphon)

## 📋 Lab Objectives (Task 1)
* [ ] **Task 1: Help Rick get his ingredients**
    * *Objective:* Exploit the machine and find the 3 ingredients.
    
    | Question | Discovery Method | Answer |
    | :--- | :--- | :--- |
    | **What is the first ingredient Rick needs?** | `Bubble-Scanner` (Web-Root) | `mr. meeseek hair` |
    | **What is the second ingredient in Rick's potion?** | `Bubble-Siphon` (User-Home) | `1 jerry tear` |
    | **What is the last and final ingredient?** | `Bubble-Siphon` (Root-Audit) | `fleeb juice` |

---

## 🛠️ Deployment Information
* **Target IP:** `10.10.x.x`
* **Access Level:** `www-data` (Initial) -> `root` (Final)
* **Exploit Path:** Web Discovery -> Command Injection -> Sudo Misconfig

---

## 📋 Executive Summary
This report documents the successful end-to-end compromise of a Rick and Morty-themed web server. The engagement utilized the **Bubble-tools** framework to automate reconnaissance, initial access, and post-exploitation data exfiltration. All three target objectives ("ingredients") were recovered, and full Root-level access was achieved.

---

## 🛰️ Phase 1: External Discovery
**Tool:** [Bubble-Scanner](https://github.com/MoriartyPuth/bubble-scanner)

The operation began with an automated discovery phase to map the attack surface and identify leaked credentials.

### **1. Service Mapping**
* **Port 80 (HTTP):** Apache 2.4.18 (Ubuntu)
* **Port 22 (SSH):** OpenSSH 7.2p2

### **2. Intelligence Scavenging**
`Bubble-Scanner` performed a regex-based crawl of the landing page and identified a critical comment in the HTML source:
> `[!] Pattern Match Found: Username: R3ck3tS3rv1c3`

### **3. Endpoint Enumeration**
The scanner identified two high-value directories:
* `/robots.txt` → Contained the string: `WubbaLubbaDubDub`
* `/login.php` → Authenticated successfully using the siphoned credentials:
  * **User:** `R3ck3tS3rv1c3`
  * **Pass:** `WubbaLubbaDubDub`

---

## ☣️ Phase 2: Exploitation (RCE)
Upon logging into the portal, a **Command Panel** was discovered, providing Remote Code Execution (RCE).

* **The Challenge:** The system had a "blacklist" filter preventing the use of the `cat` command.
* **The Bypass:** Utilizing alternative file-reading logic (flagged by Bubble-tools methodology), I used the `less` command to read the internal files.
* **Objective #1:** `mr. meeseek hair` 
  * *Location: `/var/www/html/Sup3rS3cretPickl3Ingred.txt`*

---

## 🌪️ Phase 3: Post-Exploitation
**Tool:** [Bubble-Siphon](https://github.com/MoriartyPuth/bubble-siphon)

After establishing a reverse shell, `Bubble-Siphon` was deployed to automate internal looting and privilege auditing.

### **1. Ingredient Discovery**
The tool's **Recursive Scavenger** module identified the second objective hidden in a user home directory:
* **Objective #2:** `1 jerry tear`
* **Location:** `/home/rick/second ingredients`

### **2. Privilege Escalation (PrivEsc)**
`Bubble-Siphon` audited the `sudo` configuration and flagged a critical misconfiguration:
> `[CRITICAL] NOPASSWD found: (ALL) NOPASSWD: ALL`

**Impact:** This allowed the current service user (`www-data`) to execute any command with **Root** privileges without requiring a password.

---

## 👑 Phase 4: Final Exfiltration
Leveraging the `sudo` vulnerability identified by `Bubble-Siphon`, I bypassed restricted directory permissions to claim the final objective.

* **Command:** `sudo less /root/3rd.txt`
* **Objective #3:** `fleeb juice`

---

## 📈 Technical Impact Table

| Objective | Location | Discovery Tool | Logic Used |
| :--- | :--- | :--- | :--- |
| **User Creds** | Source Code | **Bubble-Scanner** | Regex Scavenging |
| **Ingredient 1** | Web Root | **Bubble-Scanner** | Path Mapping |
| **Ingredient 2** | `/home/rick` | **Bubble-Siphon** | Recursive File Search |
| **Ingredient 3** | `/root` | **Bubble-Siphon** | Sudo Audit (NOPASSWD) |

---

## ⚖️ Ethical Disclaimer
*This lab was performed in a controlled, authorized environment (TryHackMe). All tools and methodologies are shared for educational and professional portfolio purposes only. Use of these tools on unauthorized targets is strictly prohibited.*
