# 🖥️ What are Hack The Box (HTB) Labs Machines?

**HTB Labs Machines** are virtual machines hosted on the Hack The Box platform that are intentionally designed to contain security vulnerabilities. Your goal is to discover, exploit, and escalate privileges within these machines to retrieve **flags** and gain points.

---

## 🎯 Objective

Each machine typically contains two flags:
- **User Flag**: Requires exploiting a service or vulnerability to gain user-level access.
- **Root Flag**: Requires privilege escalation to gain full system (root/administrator) access.

Example flags:
```

HTB{user_access_flag} HTB{root_access_flag}

```

---

## 🧱 Machine Structure

- **Operating Systems**: Windows or Linux
- **Access Method**: Connect via VPN (HTB provides `.ovpn` file)
- **Difficulty Levels**: Easy, Medium, Hard, Insane
- **Points**: Based on difficulty: more points for harder machines

---

## 🛠️ Skills You'll Practice

- Information Gathering & Enumeration
- Exploiting Web or Network Services
- File Transfer & Remote Access
- Post-Exploitation Techniques
- Privilege Escalation (Linux/Windows)
- Password Cracking, Pivoting, and more

---

## 🧰 Common Tools Used

- Nmap
- Burp Suite
- Hydra / John / Hashcat
- LinPEAS / WinPEAS / PowerUp
- Metasploit
- Gobuster / Feroxbuster
- Custom scripts or public exploits

---

## 🔓 Example Machine Flow

1. **Scan** the machine with `nmap`
2. **Enumerate** open ports/services
3. **Identify vulnerabilities**
4. **Exploit** the system to get a shell
5. **Escalate privileges** to get root access
6. **Retrieve both flags**

---

## 📈 Progression System

- Solving machines earns points
- Points contribute to your **HTB Rank**
- Machines can be Active (in rotation) or Retired (archived but still solvable)

---

## 🔥 Pro Tips

- Take notes after every step (use Obsidian!)
- Start with **Easy machines** like:
  - **Lame**
  - **Optimum**
  - **Blue**
- Learn **Privilege Escalation** for both Linux & Windows
- After solving, check out writeups (available for retired machines)

---

> 💡 Mastering HTB Machines is a great way to prepare for real-world pentesting and certifications like OSCP!

[[HTB Labs]]

