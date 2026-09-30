# 🐱 TailChase v1.0: Vulnerable VM
**Author:** Ankit Patidar  
**Difficulty:** OSCP-Level Medium  
**Format:** OVA (VirtualBox)

## 📥 Download
**[⬇ Download from Mega](https://mega.nz/file/iY5XyIDb#948dXI7bn1ujucYPNrH4X-AbYdeWcZdJAEqr1fBYJoI)**

## 📖 Story
TailChase Software Solutions: a growing tech company. DevOps was fired for exposing security flaws. Before leaving, he planted backdoors everywhere. Your mission: infiltrate, trace his footprints, recover the evidence.

## 🎯 Services
| Port | Service | Description |
|------|---------|-------------|
| 21 | FTP | Anonymous file sharing |
| 22 | SSH | Remote access |
| 80 | HTTP | Company website + Portal |
| 139/445 | SMB | Internal file shares |
| 8080 | Custom | Backdoor service |

## 🚀 Quick Start
1. Import OVA into VirtualBox
2. Set Host-Only adapter
3. Boot VM → Find IP: `netdiscover -r 192.168.56.0/24`
4. Start hacking!

## 🏆 Flags
| Flag | Value |
|------|-------|
| User | `TAILCHASE{wh0_1s_th3_c4t_wh0_1s_th3_m0us3}` |
| Root | `TAILCHASE{t@1lch4s3_m4st3r_0f_d1sgu1s3}` |
| Bonus | `TAILCHASE{d3v0ps_w4s_h3r3}` |

## 📚 What You'll Learn
- FTP/SMB enumeration
- Flask session forging
- LFI / Path traversal
- SSH key cracking (ssh2john)
- Command injection
- SUID binary + TOCTOU race condition

## 📁 Repo Contents
| File | Purpose |
|------|---------|
| `setup_vuln.sh` | VM build configuration script |
| `exploit_portal.py` | Automated portal exploit |
| `flask_session_forge.py` | Flask cookie tool |
| `werkzeug_pin_cracker.py` | Werkzeug PIN calculator |
| `writeup/Walkthrough.md` | Full solution guide |

**M4d3 w1th ❤️ by Ankit Patidar**
