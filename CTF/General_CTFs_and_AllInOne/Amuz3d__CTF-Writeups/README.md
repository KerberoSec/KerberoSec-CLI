CTF-Writeups

<p align="center"> 
  <img src="https://img.shields.io/badge/Total%20Progress-56%20%2F%2095-brightgreen?style=for-the-badge&logo=target" alt="Total Progress"> 
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HackTheBox-19%20%2F%2056-97ca00?style=for-the-badge&logo=hackthebox&logoColor=white" alt="HTB Progress"> 
  <img src="https://img.shields.io/badge/TryHackMe-37%20%2F%2039-0069ff?style=for-the-badge&logo=tryhackme&logoColor=white" alt="THM Progress"> 
</p>

<p align="center"> 
  <img src="https://geps.dev/progress/59?dangerColor=800080&warningColor=ff0000&successColor=00ff00" alt="Overall Progress"> 
</p>

Welcome to my collection of Capture The Flag (CTF) writeups. This repository serves as a dual-purpose project: a personal archive of my growth in cybersecurity and a structured learning resource for others. My current goal is to get OSCP certified.
This list of machines are all on the Lain Kusanagi list of recommended boxes for the OSCP.

📁 Repository Goal
I am currently documenting my journey through platforms like HackTheBox and TryHackMe. These writeups are "washed" and refined through an LLM to ensure they are clear, readable, and educational: specifically tailored for a friend I am mentoring in the basics of penetration testing.

🛠️ My Methodology
I follow the "Try Harder" philosophy. When I hit a wall, I commit to at least 1-2 hours of independent research, manual enumeration, and trial-and-error before consulting external walkthroughs. This ensures that I understand the why behind a vulnerability, not just the how.

📝 Writeup Format
Every walkthrough in this repository is standardized for clarity:

Reconnaissance: Initial scans and service enumeration.

Foothold: Exploitation and initial access.

Movement: Lateral movement and privilege escalation.

Key Takeaways: What was learned from the machine.

Note: These writeups are intended for educational purposes only. Always practice ethical hacking on authorized platforms.

## 🏁 Machines Completed

| Date | Machine | Platform | Difficulty | Key Skills/Tools | Writeup |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-05-15 | **Year of the Jellyfish** | THM | Hard | Web Enumeration, Monitorr RCE, OOB Exploit Modification, Snapd Exploitation (dirty_sock), Python script debugging | [View](./TryHackMe/Year_of_the_Jellyfish.md) |
| 2026-05-10 | **VulnNet: Active** | THM | Medium | SMB Enumeration, Redis exploitation (NTLM theft), NTLMv2 Hash Cracking, Scheduled Task hijacking (PowerShell), Local Privilege Escalation (GodPotato) | [View](./TryHackMe/VulnNet_Active.md) |
| 2026-05-10 | **Weasel** | THM | Medium |  SMB Enumeration, Jupyter Notebook Exploitation, SSH Private Key usage, AlwaysInstallElevated Privilege Escalation | [View](./TryHackMe/Weasel.md) |
| 2026-05-04 | **HackPark** | THM | Medium | HTTP Post-Form Brute-forcing, BlogEngine.NET Exploitation (CVE-2019-6714), Service Hijacking, Windows Enumeration | [View](./TryHackMe/HackPark.md) |
| 2026-04-29 | **Retro** | THM | Hard | WordPress User Enumeration, Custom Wordlist Generation (CeWL), RDP Exploitation, Windows Privilege Escalation (CVE-2017-0213) | [View](./TryHackMe/Retro.md) |
| 2026-04-29 | **Year of the Owl** | THM | Hard | SNMP Enumeration, Password Brute-forcing, WinRM Exploitation, Hidden Directory Discovery (gci -path), SAM/SYSTEM Backup Extraction, Pass-the-Hash (PtH) | [View](./TryHackMe/Year_of_the_Owl.md) |
| 2026-04-19 | **Ultratech** | THM | Medium | API Enumeration, Command Injection, Hash Cracking (MD5), Docker Group Privilege Escalation (GTFOBins) | [View](./TryHackMe/Ultratech.md) |
| 2026-04-16 | **Internal** | THM | Hard | WordPress Brute-forcing, Reverse Shells, Docker Pivoting (Jenkins), Information Disclosure, SSH Password Authentication | [View](./TryHackMe/Internal.md) |
| 2026-04-09 | **Zeno** | THM | Medium | Web Enumeration, Broken Exploit Debugging, Information Disclosure (/etc/fstab), Systemd Service Misconfiguration, Persistence via sudoers | [View](./TryHackMe/Zeno.md) |
| 2026-04-08 | **Wonderland** | THM | Medium | Web Enumeration (Recursive Pathing), Python Library Hijacking, SSH Key Management, Linux Capabilities (setuid), Path Hijacking | [View](./TryHackMe/Wonderland.md) |
| 2026-04-01 | **Tomghost** | THM | Easy |  AJP Protocol Exploitation (Ghostcat), GPG Decryption, SSH Access, Privilege Escalation (GTFOBins: zip) | [View](./TryHackMe/Tomghost.md) |
| 2026-04-01 | **Daily Bugle** | THM | Hard |  CMS Enumeration (Joomla), SQL Injection, Password Cracking (bcrypt), SSH Access, Privilege Escalation (GTFOBins: yum) | [View](./TryHackMe/Daily_Bugle.md) |
| 2026-03-24 | **Skynet** | THM | Easy |  SMB Enumeration, Web Directory Brute-forcing, Brute-forcing (Hydra), Local File Inclusion (LFI), Remote Code Execution (RCE), Kernel Exploitation (OverlayFS) | [View](./TryHackMe/Skynet.md) |
| 2026-03-24 | **Thompson** | THM | Easy |  Web Enumeration, Tomcat Manager Exploitation, WAR Payload Deployment, Shell Stabilization, SUID Binary Creation, Cron Job Exploitation | [View](./TryHackMe/Thompson.md) |
| 2026-03-24 | **Reset** | THM | Hard |  Active Directory Enumeration, Password Reset Exploitation, User Delegation, BloodHound Analysis, Remote Desktop Protocol (RDP) | [View](./TryHackMe/Reset.md) |
| 2026-03-23 | **Poison** | HTB | Medium |  Information Disclosure, Base64 Decoding, SSH Access, Local Enumeration, VNC Exploitation | [View](./HackTheBox/Poison.md) |
| 2026-03-23 | **Game Zone** | THM | Hard |  SQL Injection (Auth Bypass) , Database Dumping , Hash Cracking (SHA256) , Local Port Forwarding , Remote Command Execution (RCE) | [View](./TryHackMe/Game_Zone.md) |
| 2026-03-22 | **Attacking Kerberos** | THM | Hard | AS-REP Roasting, Kerberoasting, Ticket Harvesting, Golden Ticket Forgery, Skeleton Key Injection | [View](./TryHackMe/Attacking_Kerberos.md) |
| 2026-03-19 | **Boiler** | THM | Medium | SUID Exploitation (find), sar2html RCE (CVE-2019-15107), Anonymous FTP, ROT13, Information Disclosure | [View](./TryHackMe/Boiler.md) |
| 2026-03-18 | **Buff** | HTB | Easy | Gym Management System 1.0 (RCE), Chisel (Reverse Port Forwarding), CloudMe 1.11.2 (Buffer Overflow), Msfvenom (Shellcode), Netcat | [View](./HackTheBox/Buff.md) |
| 2026-03-18 | **Wreath** | THM | Hard | Ligolo-ng (TUN-based pivoting), CVE-2019-15107 (Webmin RCE), Polyglot JPEG Web Shells,  Mimikatz, Pass-the-Hash (PtH), Local group manipulation | [View](./TryHackMe/Wreath.md) |
| 2026-02-24 | **RootME** | THM | Easy | nmap, gobuster, File Upload Bypass (Extension Filtering), SUID Exploitation, Python GTFOBins | [View](./TryHackMe/RootMe.md) |
| 2026-01-18 | **Timelapse** | HTB | Easy |  ActiveDirectory, LAPS, PFX, WinRM, PowerShellHistory, SMB-Null-Session | [View](./HackTheBox/Timelapse.md) |
| 2026-02-24 | **Blueprint** | THM | Easy | Nmap, NetExec, osCommerce Exploitation, PHP Code Injection, Certutil, Mimikatz, NTLM Hash Dumping | [View](./TryHackMe/Blueprint.md) |
| 2026-02-23 | **Anthem** | THM | Easy | Nmap, Gobuster, OSINT (Credential Guessing), RDP, Windows File Permissions (`icacls`), Umbraco CMS | [View](./TryHackMe/Anthem.md) |
| 2026-02-26 | **CmesS** | THM | Easy | Subdomain Fuzzing (`ffuf`), Gila CMS Exploitation, PHP Reverse Shell, Wildcard Exploitation (`tar`), Linux Privilege Escalation | [View](./TryHackMe/CmesS.md) |
| 2026-02-26 | **Kenobi** | THM | Easy | Nmap, SMB Enumeration, ProFTPD `mod_copy` exploitation, NFS Mounting, SUID Path Hijacking | [View](./TryHackMe/Kenobi.md) |
| 2026-02-19 | **Broker** | HTB | Easy | ActiveMQ Exploitation, CVE-2023-46604, Nginx Sudo Abuse, Arbitrary File Read, OpenWire Protocol | [View](./HackTheBox/Broker.md) |
| 2026-02-14 | **Bounty** | HTB | Easy | IS Short Filename Enumeration (`Shortscan`), `web.config` ASP Injection, Nishang, JuicyPotato (Abusing `SeImpersonatePrivilege`) | [View](./HackTheBox/Bounty.md) |
| 2026-02-12 | **Boardlight** | HTB | Easy | Nmap, FFUF, Dolibarr Exploitation, Credential Reuse, SUID Binaries, CVE-2022-37706 | [View](./HackTheBox/Boardlight.md) |
| 2026-02-04 | **Blackfield** | HTB | Hard | Windows, Active Directory Enumeration, RID Brute Force, LDAP/SMB Null Sessions, Kerberos Attacks, AS-REP Roasting | [View](./HackTheBox/Blackfield.md) |
| 2026-02-04 | **Bashed** | HTB | Easy | Linux, Webshell, Sudo, CronJob, Python, phpbash | [View](./HackTheBox/Bashed.md) |
| 2026-02-01 | **Flight** | HTB | Medium | Windows, Active Directory, NTLM-Theft, Responder, Rubeus, Kerberos Delegation | [View](./HackTheBox/Flight.md) |
| 2026-01-06 | **Resolute** | HTB | Easy/Medium | Windows, Active Directory, Password Spraying, DNSAdmins | [View](./HackTheBox/Resolute.md) |
| 2025-12-21 | **EscapeTwo** | HTB | Hard | Windows, ADCS, MSSQL, ESC4, ESC1, Shadow Credentials | [View](./HackTheBox/EscapeTwo.md) |
| 2025-12-12 | **Enterprise** | THM | Medium | Active Directory, Kerberoasting, SMB, Unquoted Service Path, Windows PrivEsc | [View](./TryHackMe/Enterprise.md) |
| 2025-12-12 | **Services** | THM | Medium | Active Directory, Kerberos, AS-REP Roasting, Hash Cracking, WinRM, Insecure Service | [View](./TryHackMe/Services.md) |
| 2025-11-28 | **Analytics** | HTB | Medium | Web Exploitation, CVE-2023-38646, Metabase, Reverse Shell, LFI/RCE, OverlayFS | [View](./HackTheBox/Analytics.md) |
| 2025-11-28 | **Access** | HTB | Easy/Medium | Web, FTP, Cracking, Microsoft Access, Telnet, Privilege Escalation | [View](./HackTheBox/Access.md) |
| 2025-11-24 | **Cicada** | HTB | Hard | Active Directory, Info Leakage, Password Spraying, SeBackupPrivilege, NTDS Dumping | [View](./HackTheBox/Cicada.md) |
| 2025-11-24 | **Escape** | HTB | Hard | Active Directory, MS-SQL, NTLM Relay, ESC1 (Certifried) | [View](./HackTheBox/Escape.md) |
| 2025-11-24 | **AllSignsPoint2Pwnage** | THM | Easy/Medium | Windows, SMB, PHP, PrintSpoofer, VNC | [View](./TryHackMe/AllSignsPoint2Pwnage.md) |
| 2025-11-24 | **LazyAdmin** | THM | Easy/Medium | Web Exploitation, CMS Vulnerability, File Disclosure, SUDO Abuse | [View](./TryHackMe/LazyAdmin.md) |
| 2025-11-23 | **Active** | HTB | Easy/Medium | Active Directory, GPP Decryption, Kerberoasting | [View](./HackTheBox/Active.md) |
| 2025-11-23 | **Forest** | HTB | Hard | Active Directory, Kerberoasting, DCSync, Privilege Escalation | [View](./HackTheBox/Forest.md) |
| 2025-11-22 | **Sauna** | HTB | Medium/Hard | Active Directory, Kerberoasting, LPE, PrintNightmare | [View](./HackTheBox/Sauna.md) |
| 2025-11-21 | **Certified** | HTB | Hard | Active Directory, Privilege Escalation, PKI Abuse | [View](./HackTheBox/Certified.md) |
| 2025-11-14 | **Fusion Corp** | THM | Hard | Active Directory, AS-REP Roasting, NTDS Dumping | [View](./TryHackMe/Fusion_Corp.md) |
| 2025-09-03 | **Relevant** | THM | Easy | Web Exploitation, Privilege Escalation | [View](./TryHackMe/Relevant.md) |
| 2025-09-01 | **Attacktive Directory** | THM | Easy | Active Directory, Privilege Escalation | [View](./TryHackMe/Attacktive_Directory.md) |
| 2025-08-29 | **Ledger** | THM | Medium | Active Directory, Privilege Escalation | [View](./TryHackMe/Ledger.md) |
| 2025-06-05 | **Corp** | THM | Medium | Privilege Escalation, Active Directory, Windows Basics | [View](./TryHackMe/Corp.md) |
| 2025-05-28 | **Cyberlens** | THM | Medium | Web Exploitation, Windows PrivEsc, Command Injection | [View](./TryHackMe/Cyberlens.md) |
| 2025-05-21 | **Alfred** | THM | Easy | Web Exploitation, Windows PrivEsc, Credential Brute-forcing | [View](./TryHackMe/Alfred.md) |
| 2025-05-14 | **Mr. Robot** | THM | Easy | Web Exploitation, Linux Privilege Escalation | [View](./TryHackMe/MrRobot.md) |
| 2025-05-14 | **Steel Mountain** | THM | Medium | Windows Exploitation, Web Exploitation, Service Exploitation | [View](./TryHackMe/Steel_Mountain.md) |

