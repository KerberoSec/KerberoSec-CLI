<div align="center">
  *[Image: Tutorial Challenge]*

  # WEEK 0: Tutorial Challenge
  ### OffSec Arctic Howl · Tundra Realm · Season 2
</div>

---

## Challenge Overview

| Field | Details |
|-------|---------|
| **Status** | ✅ COMPLETED |
| **Category** | Log Analysis · Encoding · Web Forensics |
| **Difficulty** | Beginner |
| **Event** | Arctic Howl: The Cascade Expanse: Season 2 |
| **Score** | 50 / 50 |

---

## 📋 Scenario

An IT department has detected unusual activity on a web server. The challenge provides:
- `tutorial.txt`: Base64-encoded message with a hidden flag
- `access.log`: Apache web server access logs from the last 48 hours

Your task is to extract the flag from `tutorial.txt` and then analyze `access.log` to identify how an attacker gained access to the server and what data they were able to steal.

---

## 🎯 Questions

| # | Question | Answer |
|---|----------|--------|
| 1 | What is the flag in tutorial.txt? | `TryHarder` |
| 2 | How did the attacker gain access? What data was extracted? | Path traversal attack: stole `/home/dave/.ssh/id_rsa` (1,678 bytes) |

---

## 🔑 Key Skills

- Base64 encoding/decoding
- Web server log analysis (Apache/Nginx)
- Path traversal vulnerability detection (`../` sequences)
- SSH private key theft impact assessment
- Security incident investigation

---

## 🔍 Key Findings

- **Flag:** `TryHarder` (decoded from Base64 in `tutorial.txt`)
- **Attacker IP:** `192.168.1.101`
- **Attack Timestamp:** `01/Oct/2025:08:17:55 +0000`
- **Attack Type:** Path Traversal / Directory Traversal
- **Vulnerable Endpoint:** `/public/plugins/welcome/`
- **Malicious Request:** `GET /public/plugins/welcome/../../../../../../../../home/dave/.ssh/id_rsa`
- **Data Stolen:** SSH Private Key (`id_rsa`) belonging to user "dave"
- **HTTP Response:** `200 OK`: attack was successful
- **Bytes Exfiltrated:** 1,678 bytes

---

## 📂 Files

| File | Description |
|------|-------------|
| [INVESTIGATION_REPORT.md](./INVESTIGATION_REPORT.md) | Full forensic analysis + solution |

---

## 🛠️ Tools Used

`cat` · `base64` · `grep` · `awk` · `sort` · `uniq`

---

*Writeup completed: March 4, 2026 · OffSec Arctic Howl: Season 2*
