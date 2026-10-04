# HTB and TryHackMe Writeups: Jay Patel

Building toward a penetration testing career through HTB Academy CPTS and hands-on lab work.
Every writeup in this repo documents the full attack path: enumeration, exploitation, and
privilege escalation: with the exact commands, reasoning, and lessons learned at each step.

HTB writeups are only published after a machine is confirmed retired.

---

## Certification Roadmap

| Certification | Provider | Status |
|---|---|---|
| INE ICCA (Certified Cloud Associate) | INE | ✅ Completed |
| eJPT (eLearnSecurity Junior Penetration Tester) | INE / eLearnSecurity | ✅ Completed |
| HTB CPTS (Certified Penetration Testing Specialist) | HackTheBox | 🔄 In Progress |
| OSCP (Offensive Security Certified Professional) | OffSec | ⏳ Upcoming |
| eWPTX (Web Application Penetration Tester eXtreme) | INE / eLearnSecurity | ⏳ Upcoming |
| CPSA (CREST Practitioner Security Analyst) | CREST | ⏳ Upcoming |
| CRT (CREST Registered Tester) | CREST | ⏳ Upcoming |
| AZ-900 (Azure Fundamentals) | Microsoft | ⏳ Upcoming |

---

## Progress

| Category | Completed | Target |
|---|---|---|
| HTB Linux | 16 | 15+ |
| HTB Windows | 15 | 10+ |
| HTB Active Directory | 0 | 10+ |
| HTB Web Challenges | 0 | 9+ |
| TryHackMe Rooms | 11 | Ongoing |
| **Total** | **42** | **40+** |

---

## HTB Machines: Linux · 16 completed

<details>
<summary>View writeups</summary>

| Machine | Difficulty | Key Technique | Date | Writeup |
|---|---|---|---|---|
| Valentine | Easy | Heartbleed (CVE-2014-0160) memory leak → SSH key decryption → tmux root socket | April 2026 | [writeup](HTB-Machines/Linux/Valentine.md) |
| Underpass | Easy | UDP scan → SNMP default community string → daloRADIUS default creds → MD5 crack → mosh-server sudo privesc | April 2026 | [writeup](HTB-Machines/Linux/Underpass.md) |
| Postman | Easy | Redis unauthenticated file write, SSH key injection, ssh2john, Webmin 1.910 RCE (CVE-2019-12840) | April 2026 | [writeup](HTB-Machines/Linux/Postman.md) |
| Lame | Easy | distcc CVE-2004-2687 unauthenticated RCE → SUID nmap --interactive GTFOBins shell escape | May 2026 | [writeup](HTB-Machines/Linux/Lame.md) |
| Bashed | Easy | phpbash webshell → sudo lateral move to scriptmanager → root cron job overwrites writable test.py | May 2026 | [writeup](HTB-Machines/Linux/Bashed.md) |
| Codify | Easy | vm2 CVE-2023-30547 sandbox escape → SQLite bcrypt crack → bash [[ ]] pattern match bypass + pspy root cred sniff | May 2026 | [writeup](HTB-Machines/Linux/Codify.md) |
| Shocker | Easy | Shellshock CVE-2014-6271 via CGI User-Agent → shelly reverse shell → sudo perl GTFOBins root | May 2026 | [writeup](HTB-Machines/Linux/Shocker.md) |
| Knife | Easy | PHP 8.1.0-dev backdoor CVE-2021-39165 (User-Agentt header RCE) → james reverse shell → sudo knife GTFOBins root | May 2026 | [writeup](HTB-Machines/Linux/Knife.md) |
| Irked | Easy | UnrealIRCd 3.2.8.1 backdoor CVE-2010-2075 (echo + netcat) → steghide hidden SSH creds → PwnKit CVE-2021-4034 (32-bit static compile) | May 2026 | [writeup](HTB-Machines/Linux/Irked.md) |
| SolidState | Medium | Apache James 2.3.2 default creds (root:root) → POP3 inbox harvest → SSH as mindy → rbash escape (ssh -t sh) → PwnKit CVE-2021-4034 (32-bit static) | May 2026 | [writeup](HTB-Machines/Linux/SolidState.md) |
| Traverxec | Easy | Nostromo 1.9.6 CVE-2019-16278 path traversal RCE → nhttpd.conf homedirs → backup SSH key tar → ssh2john passphrase crack (hunter) → sudo journalctl pager escape (stty rows 2) | May 2026 | [writeup](HTB-Machines/Linux/Traverxec.md) |
| Nineveh | Medium | phpLiteAdmin SQLite injection + LFI RCE → RSA key in PNG → port knocking → SSH as amrois → chkrootkit 0.49 /tmp/update cron LPE | May 2026 | [writeup](HTB-Machines/Linux/Nineveh.md) |
| Delivery | Easy | TicketTrick osTicket email alias → MatterMost Internal channel cred leak → SSH as maildeliverer → CVE-2021-4034 PwnKit pkexec → root (Path 2: config.json MySQL creds → bcrypt hash → hashcat best64 wordlist → john crack → su root) | July 2026 | [writeup](HTB-Machines/Linux/Delivery.md) |
| Keeper | Easy | Request Tracker default credentials → plaintext lnorgaard password in user comments → SSH foothold → KeePass memory dump CVE-2023-32784 → PuTTY private key conversion → root SSH | July 2026 | [writeup](HTB-Machines/Linux/Keeper.md) |
| Analytics | Easy | CVE-2023-38646 Metabase Pre-Auth RCE via setup-token abuse → Docker container shell → printenv credential leak → SSH as metalytics → GameOver(lay) CVE-2023-2640/CVE-2023-32629 OverlayFS LPE → root | July 2026 | [writeup](HTB-Machines/Linux/Analytics.md) |
| Inception | Hard | dompdf v0.6.0 LFI (EDB-33004) → php://filter file read → Apache config enumeration → WebDAV md5crypt crack (babygurl69) → PHP webshell upload → wp-config DB cred → Squid proxy SSH pivot (cobb) → sudo su (container root) → static nmap → FTP anon crontab read → TFTP APT Pre-Invoke RCE → host root | July 2026 | [writeup](HTB-Machines/Linux/Inception.md) |

</details>

---

## HTB Machines: Windows · 15 completed

<details>
<summary>View writeups</summary>

| Machine | Difficulty | Key Technique | Date | Writeup |
|---|---|---|---|---|
| Legacy | Easy | MS08-067 (CVE-2008-4250): pre-auth RCE via SMB netapi32.dll stack overflow → NT AUTHORITY\SYSTEM | May 2026 | [writeup](HTB-Machines/Windows/Legacy.md) |
| Blue | Easy | MS17-010 / EternalBlue (CVE-2017-0143): pre-auth SMB kernel pool corruption → NT AUTHORITY\SYSTEM | May 2026 | [writeup](HTB-Machines/Windows/Blue.md) |
| Jerry | Easy | Default Tomcat credentials (tomcat:s3cret) → WAR reverse shell deploy → NT AUTHORITY\SYSTEM | May 2026 | [writeup](HTB-Machines/Windows/Jerry.md) |
| Devel | Easy | Anonymous FTP write access to IIS webroot → ASPX reverse shell (msfvenom) → MS11-046 Chimichurri (afd.sys) → NT AUTHORITY\SYSTEM | May 2026 | [writeup](HTB-Machines/Windows/Devel.md) |
| Chatterbox | Easy | AChat BOF (CVE-2015-1578) → msfvenom x86/unicode_mixed shellcode → shell as Alfred → Registry Winlogon DefaultPassword → Plink reverse SSH tunnel → winexe Administrator shell | May 2026 | [writeup](HTB-Machines/Windows/Chatterbox.md) |
| SecNotes | Medium | Second-Order SQLi (registration form → notes leak tyler creds) → SMB write to IIS webroot → nc.exe + PHP revshell → wsl.exe Linux root → bash_history Administrator creds | May 2026 | [writeup](HTB-Machines/Windows/SecNotes.md) |
| Jeeves | Medium | Jenkins Groovy Script Console unauthenticated RCE → web_delivery Meterpreter → SeImpersonatePrivilege → MS16-075 NBNS reflection → SYSTEM token → root flag in NTFS ADS | May 2026 | [writeup](HTB-Machines/Windows/Jeeves.md) |
| Access | Easy | Anonymous FTP → backup.mdb credential extraction (mdb-tools) → Access Control.pst email (readpst) → Telnet as security → cmdkey cached Administrator credential → runas /savecred | May 2026 | [writeup](HTB-Machines/Windows/Access.md) |
| Arctic | Easy | ColdFusion 8.0.1 FCKeditor CVE-2009-2265 arbitrary file upload → JSP web shell → reverse shell as tolis → SeImpersonatePrivilege → Juicy Potato SYSTEM | May 2026 | [writeup](HTB-Machines/Windows/Arctic.md) |
| Bastard | Medium | Drupal 7.54 CVE-2018-7600 (Drupalgeddon2) form cache poisoning → RCE as iusr → SeImpersonatePrivilege → Juicy Potato SYSTEM | June 2026 | [writeup](HTB-Machines/Windows/Bastard.md) |
| Bastion | Easy | Anonymous SMB → VHD mount (guestmount) → SAM/SYSTEM offline secretsdump → NTLM crack → SSH as L4mpje → mRemoteNG confCons.xml decrypt → SSH as Administrator | June 2026 | [writeup](HTB-Machines/Windows/Bastion.md) |
| Querier | Medium | Anonymous SMB → XLSM VBA macro creds → MSSQL xp_dirtree NTLMv2 capture → hashcat crack → sysadmin xp_cmdshell RCE → SeImpersonatePrivilege → PrintSpoofer SYSTEM | June 2026 | [writeup](HTB-Machines/Windows/Querier.md) |
| Optimum | Easy | CVE-2014-6287 Rejetto HFS 2.3 null byte RCE (no auth) → Meterpreter as kostas → x86→x64 migration to explorer.exe → MS16-032 Secondary Logon race condition → NT AUTHORITY\SYSTEM | June 2026 | [writeup](HTB-Machines/Windows/Optimum.md) |
| Grandpa | Easy | IIS 6.0 WebDAV CVE-2017-7269 ScStoragePathFromUrl buffer overflow → Meterpreter as Network Service → migrate to davcdata.exe → MS14-070 tcpip.sys ioctl → NT AUTHORITY\SYSTEM | June 2026 | [writeup](HTB-Machines/Windows/Grandpa.md) |
| Fuse | Medium | PaperCut print logs username harvest → Fabricorp01 password spray → kpasswd reset → RPC printer description credential leak → WinRM as svc-print → SeLoadDriverPrivilege + Capcom.sys SYSTEM | July 2026 | [writeup](HTB-Machines/Windows/Fuse.md) |

</details>

---

## HTB: Active Directory · 0 completed

<details>
<summary>View writeups</summary>

| Machine | Key Technique | Date | Writeup |
|---|---|---|---|
|: |: |: |: |

</details>

---

## HTB: Web Challenges · 0 completed

<details>
<summary>View writeups</summary>

| Challenge | Key Technique | Date | Writeup |
|---|---|---|---|
|: |: |: |: |

</details>

---

## TryHackMe: Rooms · 11 completed

<details>
<summary>View writeups</summary>

| Room | Difficulty | Key Technique | Date | Writeup |
|---|---|---|---|---|
| Simple CTF | Easy | FTP anon, SQLi CVE-2019-9053, sudo vim | March 2026 | [writeup](TryHackMe/Rooms/Simple-CTF.md) |
| Bounty Hacker | Easy | FTP anon, Hydra SSH brute force, sudo tar | March 2026 | [writeup](TryHackMe/Rooms/Bounty-Hacker.md) |
| Basic Pentesting | Easy | SMB enum, SSH brute force, world-readable id_rsa, ssh2john | March 2026 | [writeup](TryHackMe/Rooms/Basic-Pentesting.md) |
| Fowsniff CTF | Easy | OSINT, POP3 brute force, MOTD cube.sh privesc | March 2026 | [writeup](TryHackMe/Rooms/Fowsniff-CTF.md) |
| Kenobi | Easy | SMB anon, NFS enum, ProFTPD mod_copy CVE-2015-3306, SUID PATH hijack | April 2026 | [writeup](TryHackMe/Rooms/Kenobi.md) |
| CMesS | Medium | VHost fuzzing, Gila CMS file upload RCE, world-readable .password.bak, tar wildcard injection | April 2026 | [writeup](TryHackMe/Rooms/CMesS.md) |
| UltraTech | Medium | Full port scan, JS source review, OS command injection (backtick), SQLite exfil via nc, MD5 cracking, Docker group privesc | April 2026 | [writeup](TryHackMe/Rooms/UltraTech.md) |
| Anonymous | Medium | FTP anon login + world-writable cron script → reverse shell, LXD group privesc (Alpine image build → privileged container → host filesystem mount) | April 2026 | [writeup](TryHackMe/Rooms/Anonymous.md) |
| TomGhost | Easy | GhostCat CVE-2020-1938 AJP file read → web.xml credentials → SSH → GPG crack (gpg2john + john) → sudo zip GTFOBins root | May 2026 | [writeup](TryHackMe/Rooms/TomGhost.md) |
| Steel Mountain | Medium | Rejetto HFS 2.3 CVE-2014-6287 (39161.py) → reverse shell as bill → PowerUp.ps1 unquoted service path (AdvancedSystemCareService9) → Advanced.exe → sc restart → SYSTEM | May 2026 | [writeup](TryHackMe/Rooms/Steel-Mountain.md) |
| Alfred | Easy | Default credentials (admin:admin) → Jenkins Groovy Script Console RCE → Meterpreter → process migration to SYSTEM svchost.exe → Incognito token impersonation | June 2026 | [writeup](TryHackMe/Rooms/Alfred.md) |

</details>
