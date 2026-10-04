# eCPPTv3/OSCP/CPTS Preparation Arsenal

This repository contains a curated list of machines, notes, and resources targeting the eCPPT, OSCP and CPTS exams.
It covers **VulnHub, VulNyx, HackMyVM, TryHackMe, HackTheBox, PortSwigger and HackingHub** targets, plus
[self-hosted labs and full AD ranges](#labs--ranges) you can run offline.

[![LinkedIn](https://img.shields.io/badge/Linkedin-blue?style=plastic&logo=linkedin&logoColor=#0A66C2)](https://www.linkedin.com/in/fadymoheb/)
[![Blog](https://img.shields.io/badge/Blog-Fady%20Moheb-orange?style=plastic&logo=wordpress)](https://fadymoheb.com/)
[![Website](https://img.shields.io/badge/Website-RedTeam%20Recipes-orange?style=plastic&logo=googlechrome)](https://redteamrecipes.com/)
[![X](https://img.shields.io/badge/@N1NJ1O-black?style=plastic&logo=x&logoColor=white)](https://x.com/N1NJ10_)

<p align="center">
  <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDF5YzV6cjF3MWNzcWtrZWFscnllYmN6b3FoZXBna3B6c3M5NDd6ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2Pk9newN8fkbu/giphy.gif" width="1000" />
</p>

---

## eCPPT/OSCP/CPTS Exam Domains & Labs

The following machines are categorized by the specific skill sets required for the eCPPT exam.

### 1. Resource Development & Initial Access
*Focus: Enumeration, Brute-force, Shells, Old School Exploits.*

| Machine / Room | Platform | Difficulty | Focus | Cost | Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Basic** | VulNyx | Low | CUPS, SSH Brute-force, env SUID, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Basic) |
| **Beginner** | VulNyx | Low | UDP, TFTP, TFTP Brute-force, sudo html2text | Free | [Download](https://vulnyx.com/download.php?vm=Beginner) |
| **Exec** | VulNyx | Low | SMB, SMB Shares, PHP, sudo bash | Free | [Download](https://vulnyx.com/download.php?vm=Exec) |
| **Fing** | VulNyx | Low | finger, Finger user enumeration, SSH Brute-force, doas | Free | [Download](https://vulnyx.com/download.php?vm=Fing) |
| **Fuser** | VulNyx | Low | CUPS, CVE-2024-47176, Dash suid, RCE | Free | [Download](https://vulnyx.com/download.php?vm=Fuser) |
| **Lower** | VulNyx | Low | VHost Fuzzing, SSH Brute-force, Group writable | Free | [Download](https://vulnyx.com/download.php?vm=Lower) |
| **Lower4** | VulNyx | Low | ident, SSH Brute-force, sudo multitail, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Lower4) |
| **Lower6** | VulNyx | Low | Redis, Redis Brute-force, SSH Brute-force, Capabilities | Free | [Download](https://vulnyx.com/download.php?vm=Lower6) |
| **Lower7** | VulNyx | Low | FTP, FTP Brute-force, Node.js, shadow Group | Free | [Download](https://vulnyx.com/download.php?vm=Lower7) |
| **Noob** | VulNyx | Low | id_rsa Cracking, su Brute-force, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Noob) |
| **Absolute** | VulNyx | Easy | SMB, HTTP GET Brute-force, PHP, sudo rclone | Free | [Download](https://vulnyx.com/download.php?vm=Absolute) |
| **APex** | VulNyx | Easy | OSINT, finger, SQLite, SSH Brute-force | Free | [Download](https://vulnyx.com/download.php?vm=APex) |
| **Basic Pentesting 1** | VulnHub | Beg | Web to Root | Free | [Download](https://www.vulnhub.com/entry/basic-pentesting-1,216/) |
| **Beep** | HackTheBox | Easy | Web/Asterisk | VIP | [HTB Link](https://app.hackthebox.com/machines/Beep) |
| **Call** | VulNyx | Easy | UDP, SIP, Md5 Cracking, sudo (CVE) | Free | [Download](https://vulnyx.com/download.php?vm=Call) |
| **EasyPeasy** | HackMyVM | Easy | Web/Shells | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=EasyPeasy) |
| **Fire** | VulNyx | Easy | FTP, Anonymous FTP, Firefox decrypt, Cockpit | Free | [Download](https://vulnyx.com/download.php?vm=Fire) |
| **Friendly** | HackMyVM | Easy | FTP/SSH | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=Friendly) |
| **Gift** | HackMyVM | Easy | Basic Enumeration | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=Gift) |
| **Kioptrix Level 1** | VulnHub | Beg | SMB, Apache, mod_ssl | Free | [Download](https://lnkd.in/dTuRjrdr) |
| **Kioptrix Level 1.1** | VulnHub | Beg | SQL Injection, RCE | Free | [Download](https://lnkd.in/d9CUexHU) |
| **Kioptrix Level 1.2** | VulnHub | Beg | LotusCMS | Free | [Download](https://lnkd.in/dVH7GyrR) |
| **Kioptrix Level 1.3** | VulnHub | Beg | SQLi, Restricted Shell | Free | [Download](https://lnkd.in/dFbQzpD9) |
| **Lame** | HackTheBox | Easy | Enumeration/Samba | VIP | [HTB Link](https://app.hackthebox.com/machines/Lame) |
| **LazySysAdmin 1** | VulnHub | Beg | Info Disclosure | Free | [Download](https://www.vulnhub.com/entry/lazysysadmin-1,205/) |
| **Lookup** | VulNyx | Easy | DNS, Reverse DNS Lookup, DNS Zone Transfer, SSH Brute-force | Free | [Download](https://vulnyx.com/download.php?vm=Lookup) |
| **Mission 1** | HackingHub | Easy | Basic Recon | Free | [Start Mission](https://hackinghub.io/missions) |
| **Open** | VulNyx | Easy | Openplc, Default Creds, HTTP GET Brute-force, Ttyd | Free | [Download](https://vulnyx.com/download.php?vm=Open) |
| **RickdiculouslyEasy 1** | VulnHub | Beg | Multiple Paths | Free | [Download](https://lnkd.in/d8Aw5-cE) |
| **Swamp** | VulNyx | Easy | DNS, DNS Zone Transfer, Command Injection, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Swamp) |
| **Yadis** | VulNyx | Easy | SMB, Redis, sudo yaegi, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Yadis) |
| **Belial** | VulNyx | Medium | FTP, Anonymous FTP, FTP Brute-force, KeePass | Free | [Download](https://vulnyx.com/download.php?vm=Belial) |
| **Bulldog 1** | VulnHub | Int | Django, Hidden Files | Free | [Download](https://www.vulnhub.com/entry/bulldog-1,211/) |
| **Bund** | VulNyx | Medium | rsync, rsync Brute-force, rsync Enumeration, Jekyll | Free | [Download](https://vulnyx.com/download.php?vm=Bund) |
| **Chain** | VulNyx | Medium | UDP, SNMP, SNMP Community String Brute-force, SNMP Enumeration | Free | [Download](https://vulnyx.com/download.php?vm=Chain) |
| **Cronos** | HackTheBox | Medium | DNS/Web | VIP | [HTB Link](https://app.hackthebox.com/machines/Cronos) |
| **Dark** | VulNyx | Medium | UDP, SNMP, SNMP Community String Brute-force, SNMP Enumeration | Free | [Download](https://vulnyx.com/download.php?vm=Dark) |
| **Discover** | VulNyx | Medium | SMB, RPC Enumeration, SMB Brute-force, SMB Shares | Free | [Download](https://vulnyx.com/download.php?vm=Discover) |
| **HackLAB: Vulnix** | VulnHub | Int | General Pentest | Free | [Download](https://lnkd.in/dGKEW6pw) |
| **Hunter** | VulNyx | Medium | DNS, DNS Zone Transfer, File Upload, sudo bsh | Free | [Download](https://vulnyx.com/download.php?vm=Hunter) |
| **Kioptrix 2014** | VulnHub | Int | Web Exploits | Free | [Download](https://lnkd.in/d9R3b9gu) |
| **Mission 2** | HackingHub | Medium | Foothold | Free | [Start Mission](https://hackinghub.io/missions) |
| **NullByte** | VulnHub | Int | General Pentest | Free | [Download](https://lnkd.in/dGpitNGx) |
| **Prime 1** | VulnHub | Int | General Pentest | Free | [Download](https://lnkd.in/dhrzZXAx) |
| **pWnOS 2.0** | VulnHub | Int | Old School | Free | [Download](https://lnkd.in/dgM7-Mug) |
| **SickOs 1.1** | VulnHub | Int | Squid Proxy, Shellshock | Free | [Download](https://www.vulnhub.com/entry/sickos-11,132/) |
| **SickOs 1.2** | VulnHub | Int | PUT Method, Cron Jobs | Free | [Download](https://lnkd.in/dfuB4EiZ) |
| **SkyTower 1** | VulnHub | Int | SSH Tunneling | Free | [Download](https://lnkd.in/dxmDvNHq) |
| **Stapler 1** | VulnHub | Int | SMB Enum, Password Spraying | Free | [Download](https://lnkd.in/dWH8Ugna) |
| **System** | VulNyx | Medium | Redis, Redis Brute-force, FTP Brute-force, Redis module | Free | [Download](https://vulnyx.com/download.php?vm=System) |
| **Tr0ll 1** | VulnHub | Int | FTP, Binary Analysis | Free | [Download](https://lnkd.in/dmHDPTgV) |
| **Unbaked Pie** | HackMyVM | Medium | Docker/Pivoting | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=UnbakedPie) |
| **VulnOS 2** | VulnHub | Int | General Pentest | Free | [Download](https://lnkd.in/dUVpYByJ) |
| **Denied** | VulNyx | Hard | SSH Enumeration, SSH Brute-force, doas, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Denied) |
| **Raw** | VulNyx | Hard | SNMP, SNMP Community String Brute-force, SNMP Enumeration, SMB | Free | [Download](https://vulnyx.com/download.php?vm=Raw) |
| **Tr0ll 2** | VulnHub | Hard | Deep Rabbit Holes | Free | [Download](https://lnkd.in/dPW33XZ4) |
| **Blue** | TryHackMe | - | EternalBlue (MS17-010) | Free | [THM Link](https://tryhackme.com/room/blue) |
| **Bounty Hacker** | TryHackMe | - | FTP/SSH Attacks | Free | [THM Link](https://tryhackme.com/room/cowboyhacker) |
| **Hydra** | TryHackMe | - | Brute-forcing | Free | [THM Link](https://tryhackme.com/room/hydra) |
| **Nmap Live Host Discovery** | TryHackMe | - | Network Scanning | Free | [THM Link](https://tryhackme.com/room/nmap) |
| **Vulnversity** | TryHackMe | - | Upload Vulnerabilities | Free | [THM Link](https://tryhackme.com/room/vulnversity) |

### 2. Web Application Penetration Testing 
*Focus: SQLi, XSS, LFI, RCE, Manual Exploitation.*

| Machine / Room | Platform | Difficulty | Focus | Cost | Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Blogger** | VulNyx | Low | WordPress, CMS, WP User Enum, WP Brute | Free | [Download](https://vulnyx.com/download.php?vm=Blogger) |
| **Deploy** | VulNyx | Low | Tomcat, Default Creds, WAR, sudo ex | Free | [Download](https://vulnyx.com/download.php?vm=Deploy) |
| **Diff3r3ntS3c** | VulNyx | Low | File Upload, PHP, Cron, RCE | Free | [Download](https://vulnyx.com/download.php?vm=Diff3r3ntS3c) |
| **Loweb** | VulNyx | Low | SQLi, LFI, sudo chown, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Loweb) |
| **Lower5** | VulNyx | Low | LFI, Log Poisoning, sudo bash, Gpg Cracking | Free | [Download](https://vulnyx.com/download.php?vm=Lower5) |
| **Wicca** | VulNyx | Low | Node.js, Command Injection, sudo links | Free | [Download](https://vulnyx.com/download.php?vm=Wicca) |
| **Arpon** | VulNyx | Easy | File Upload, PHP, Zip Cracking, sudo arp | Free | [Download](https://vulnyx.com/download.php?vm=Arpon) |
| **Automation** | VulNyx | Easy | VHost Fuzzing, Livewire, CVE-2025-54068, Git | Free | [Download](https://vulnyx.com/download.php?vm=Automation) |
| **Bank** | VulNyx | Easy | SMB, SMB Shares, JWT, Bcrypt Cracking | Free | [Download](https://vulnyx.com/download.php?vm=Bank) |
| **Base** | HackMyVM | Easy | Basic Web | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=Base) |
| **Blog** | VulNyx | Easy | Nibbleblog, CMS, HTTP POST Brute-force, File Upload | Free | [Download](https://vulnyx.com/download.php?vm=Blog) |
| **Cibercamp** | VulNyx | Easy | WordPress, CMS, WP File Manager, CVE-2020-25213 | Free | [Download](https://vulnyx.com/download.php?vm=Cibercamp) |
| **Code** | VulNyx | Easy | Pluck, CMS, Default Creds, File Upload | Free | [Download](https://vulnyx.com/download.php?vm=Code) |
| **Druid** | VulNyx | Easy | VHost Fuzzing, HotelDruid, CVE-2022-22909, sudo perl | Free | [Download](https://vulnyx.com/download.php?vm=Druid) |
| **Explorer** | VulNyx | Easy | Extplorer, PHP, Misconfiguration, RCE | Free | [Download](https://vulnyx.com/download.php?vm=Explorer) |
| **External** | VulNyx | Easy | VHost Fuzzing, XXE, MySQL, sudo mysql | Free | [Download](https://vulnyx.com/download.php?vm=External) |
| **Horizontall** | HackTheBox | Easy | Strapi CMS | VIP | [HTB Link](https://app.hackthebox.com/machines/Horizontall) |
| **Load** | VulNyx | Easy | RiteCMS, CMS, Default Creds, File Upload | Free | [Download](https://vulnyx.com/download.php?vm=Load) |
| **MailForge** | VulNyx | Easy | SSTI, File Upload, Eml file, CVE-2026-27641 | Free | [Download](https://vulnyx.com/download.php?vm=MailForge) |
| **Method** | VulNyx | Easy | HTTP Methods, PHP, Wildcard Injection, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Method) |
| **Northwing** | VulNyx | Easy | LFI, PHP Wrappers, MySQL, Bcrypt Cracking | Free | [Download](https://vulnyx.com/download.php?vm=Northwing) |
| **Ober** | VulNyx | Easy | October, CMS, Default Creds, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Ober) |
| **Panel** | HackMyVM | Easy | Admin Panel Bypass | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=Panel) |
| **Photographer 1** | VulnHub | Beg | Web/SMB | Free | [Download](https://lnkd.in/dcqxgEyH) |
| **Printer** | VulNyx | Easy | Command Injection, Screen suid, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Printer) |
| **Ready** | VulNyx | Easy | Redis, PHP, disk Group, id_rsa Cracking | Free | [Download](https://vulnyx.com/download.php?vm=Ready) |
| **Remote** | VulNyx | Easy | WordPress, CMS, WP Gwolle Plugin, CVE-2015-8351 | Free | [Download](https://vulnyx.com/download.php?vm=Remote) |
| **Sales** | VulNyx | Easy | VHost Fuzzing, HTTP POST Brute-force, SuiteCRM, CVE-2022-23940 | Free | [Download](https://vulnyx.com/download.php?vm=Sales) |
| **Serve** | VulNyx | Easy | WebDAV, KDBX Cracking, HTTP GET Brute-force, HTTP Methods | Free | [Download](https://vulnyx.com/download.php?vm=Serve) |
| **Service** | VulNyx | Easy | Joomla, CMS, CVE-2023-23752, PHP | Free | [Download](https://vulnyx.com/download.php?vm=Service) |
| **Twitx** | VulNyx | Easy | File Upload, PHP, Bcrypt Cracking, sudo ascii85 | Free | [Download](https://vulnyx.com/download.php?vm=Twitx) |
| **Unit** | VulNyx | Easy | HTTP Methods, PHP, sudo su, sudo xargs | Free | [Download](https://vulnyx.com/download.php?vm=Unit) |
| **VulnCMS 1** | VulnHub | Beg | CMS Enumeration | Free | [Download](https://www.vulnhub.com/entry/vulncms-1,169/) |
| **Web App Mission 1** | HackingHub | Easy | Common Web Vulns | Free | [Start Mission](https://hackinghub.io/missions) |
| **YourWAF** | VulNyx | Easy | VHost Fuzzing, Command Injection, WAF, API | Free | [Download](https://vulnyx.com/download.php?vm=YourWAF) |
| **Zone** | VulNyx | Easy | DNS, DNS Zone Transfer, File Upload, PHP | Free | [Download](https://vulnyx.com/download.php?vm=Zone) |
| **Access** | VulNyx | Medium | WebSocket, FTP Brute-force, PHP 5, sudo perl | Free | [Download](https://vulnyx.com/download.php?vm=Access) |
| **Billu: b0x** | VulnHub | Int | SQLi, RCE, LFI | Free | [Download](https://www.vulnhub.com/entry/billu-b0x,188/) |
| **Breach 1.0** | VulnHub | Int | Traffic Analysis, SSL | Free | [Download](https://lnkd.in/dq8VX2p3) |
| **Breach 2.1** | VulnHub | Int | Traffic Analysis | Free | [Download](https://lnkd.in/dNdyR-pz) |
| **Ceres** | VulNyx | Medium | LFI, PHP Wrappers, Log Poisoning, sudo python | Free | [Download](https://vulnyx.com/download.php?vm=Ceres) |
| **DC-9** | VulnHub | Int | SQLi Search, LFI | Free | [Download](https://lnkd.in/dEWTetyy) |
| **Deathnote 1** | VulnHub | Int | LFI, RCE, Upload | Free | [Download](https://www.vulnhub.com/entry/deathnote-1,739/) |
| **DevGuru 1** | VulnHub | Int | Web Focus | Free | [Download](https://lnkd.in/dWZUtXvG) |
| **EID** | VulNyx | Medium | VHost Fuzzing, HTTP POST Brute-force, SSTI, RCE | Free | [Download](https://vulnyx.com/download.php?vm=EID) |
| **Express** | VulNyx | Medium | API, API Enumeration, HTTP Verb Tampering, SSRF | Free | [Download](https://vulnyx.com/download.php?vm=Express) |
| **FristiLeaks 1.3** | VulnHub | Int | LFI to Shell, PrivEsc | Free | [Download](https://lnkd.in/dQCe_qJ4) |
| **Future** | VulNyx | Medium | SSRF, LFI, id_rsa Cracking, Docker SUID | Free | [Download](https://vulnyx.com/download.php?vm=Future) |
| **Hacksudo: Thor** | VulnHub | Int | CGI-bin, Shellshock | Free | [Download](https://www.vulnhub.com/entry/hacksudo-thor,733/) |
| **JarJar** | VulNyx | Medium | LFI, Ab suid, Yescrypt Cracking, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=JarJar) |
| **Jenk** | VulNyx | Medium | LFI, Jenkins, Bcrypt Cracking, Hping3 ping | Free | [Download](https://vulnyx.com/download.php?vm=Jenk) |
| **Kyubi** | VulNyx | Medium | Grafana, CVE-2021-43798, Path Traversal, Redis | Free | [Download](https://vulnyx.com/download.php?vm=Kyubi) |
| **LemonSqueezy** | VulnHub | Int | Web | Free | [Download](https://lnkd.in/deWTbhma) |
| **Mr-Robot 1** | VulnHub | Int | Wordpress, Keys, Decoding | Free | [Download](https://lnkd.in/d3GwymtW) |
| **MyWAF** | VulNyx | Medium | VHost Fuzzing, WAF, MySQL, Capabilities | Free | [Download](https://vulnyx.com/download.php?vm=MyWAF) |
| **PwnLab: init** | VulnHub | Int | LFI, PHP Filters, Cmd Inj | Free | [Download](https://lnkd.in/dJkxy44d) |
| **Raven 1** | VulnHub | Int | Wordpress, PHPMailer | Free | [Download](https://www.vulnhub.com/entry/raven-1,256/) |
| **Raven 2** | VulnHub | Int | PHPMailer RCE | Free | [Download](https://www.vulnhub.com/entry/raven-2,269/) |
| **Registry** | HackMyVM | Medium | Docker Registry/Web | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=Registry) |
| **Reset** | VulNyx | Medium | LFI, SSRF, Command Injection, Find suid | Free | [Download](https://vulnyx.com/download.php?vm=Reset) |
| **Sandwich** | VulNyx | Medium | VHost Fuzzing, HTTP POST Brute-force, sudo chvt | Free | [Download](https://vulnyx.com/download.php?vm=Sandwich) |
| **Shared** | VulNyx | Medium | WordPress, Wordpress plugin site editor, CVE-2018-7422, LFI | Free | [Download](https://vulnyx.com/download.php?vm=Shared) |
| **Site** | HackMyVM | Medium | Web Exploitation | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=Site) |
| **Spooisong** | VulNyx | Medium | PHP, LFI, Log Poisoning, Dns spoofing | Free | [Download](https://vulnyx.com/download.php?vm=Spooisong) |
| **TheDoor** | VulNyx | Medium | FTP, Anonymous FTP, SQLi, IDOR | Free | [Download](https://vulnyx.com/download.php?vm=TheDoor) |
| **Tom** | VulNyx | Medium | LFI, Tomcat, WAR, sudo ascii85 | Free | [Download](https://vulnyx.com/download.php?vm=Tom) |
| **W34kn3ss 1** | VulnHub | Int | Web/PrivEsc | Free | [Download](https://lnkd.in/dY5QZr34) |
| **Web App Mission 2** | HackingHub | Medium | Advanced Web Vulns | Free | [Start Mission](https://hackinghub.io/missions) |
| **WebSploit2018** | VulnHub | Int | Vulnerable Apps Collection | Free | [Download](https://www.vulnhub.com/entry/websploit-2018,245/) |
| **Blind XSS Masterclass** | HackingHub | Advanced | XSS | Paid | [Course Link](https://hackinghub.io/courses) |
| **GoldenEye 1** | VulnHub | Hard | POP3, Compilation | Free | [Download](https://lnkd.in/dUSzXPks) |
| **Hands-On Web Exploitation Course** | HackingHub | Advanced | Various Web Vulns | Paid | [Course Link](https://hackinghub.io/courses) |
| **Headache** | VulNyx | Hard | API, API Enumeration, Api rest, SSRF | Free | [Download](https://vulnyx.com/download.php?vm=Headache) |
| **Init** | VulNyx | Hard | Command Injection, Git, SQLite, XXE | Free | [Download](https://vulnyx.com/download.php?vm=Init) |
| **Jerry** | VulNyx | Hard | File Upload, XXE, PHP, sudo node | Free | [Download](https://vulnyx.com/download.php?vm=Jerry) |
| **Mirage** | VulNyx | Hard | API, API Enumeration, Reverse engineering, Suid binary | Free | [Download](https://vulnyx.com/download.php?vm=Mirage) |
| **Nuclei Masterclass** | HackingHub | Advanced | Vulnerability Scanning | Paid | [Course Link](https://hackinghub.io/courses) |
| **Pinkys Palace v1** | VulnHub | Hard | SQLi, Dictionary Attacks | Free | [Download](https://www.vulnhub.com/entry/pinkys-palace-v1,225/) |
| **Pinkys Palace v2** | VulnHub | Hard | Proxy Tunneling, SQLi | Free | [Download](https://lnkd.in/dbdDRyUT) |
| **Pressed** | HackTheBox | Hard | WordPress/XML-RPC | VIP | [HTB Link](https://app.hackthebox.com/machines/Pressed) |
| **SlyWindow** | VulNyx | Hard | VHost Fuzzing, Stego, XSS, API | Free | [Download](https://vulnyx.com/download.php?vm=SlyWindow) |
| **Solar** | VulNyx | Hard | XSS, Mqtt, LFI, PHP | Free | [Download](https://vulnyx.com/download.php?vm=Solar) |
| **Trace** | VulNyx | Hard | NFS, Nfs enumeration, VHost Fuzzing, Type juggling | Free | [Download](https://vulnyx.com/download.php?vm=Trace) |
| **Wrapp** | VulNyx | Hard | SSRF, PHP Wrappers, LFI, Tomcat | Free | [Download](https://vulnyx.com/download.php?vm=Wrapp) |
| **Yincana** | VulNyx | Hard | XSS, IDOR, LFI, id_rsa Cracking | Free | [Download](https://vulnyx.com/download.php?vm=Yincana) |
| **Authentication & Logic** | PortSwigger | - | Bypassing Controls | Free | [Start Lab](https://portswigger.net/web-security/authentication) |
| **Burp Suite Basics** | TryHackMe | - | Proxy Interception | Paid | [THM Link](https://tryhackme.com/room/burpsuitebasics) |
| **Command Injection** | PortSwigger | - | OS Command Execution | Free | [Start Lab](https://portswigger.net/web-security/os-command-injection) |
| **Cross-Site Request Forgery** | PortSwigger | - | CSRF Token Bypass | Free | [Start Lab](https://portswigger.net/web-security/csrf) |
| **Cross-Site Scripting (XSS)** | PortSwigger | - | Reflected, Stored, DOM | Free | [Start Lab](https://portswigger.net/web-security/cross-site-scripting) |
| **Directory Traversal** | PortSwigger | - | File Path Traversal | Free | [Start Lab](https://portswigger.net/web-security/file-path-traversal) |
| **File Inclusion** | TryHackMe | - | LFI/RFI/Path Traversal | Paid | [THM Link](https://tryhackme.com/room/fileinc) |
| **OWASP Juice Shop** | TryHackMe | - | Modern Web Exploitation | Free | [THM Link](https://tryhackme.com/room/owaspjuiceshop) |
| **OWASP Top 10** | TryHackMe | - | Critical Web Vulns | Free | [THM Link](https://tryhackme.com/room/owasptop10) |
| **Server-Side Request Forgery** | PortSwigger | - | SSRF & Cloud Metadata | Free | [Start Lab](https://portswigger.net/web-security/ssrf) |
| **SQL Injection (All Labs)** | PortSwigger | - | Manual SQLi Mastery | Free | [Start Lab](https://portswigger.net/web-security/sql-injection) |
| **SQL Injection Lab** | TryHackMe | - | Manual/Automated SQLi | Free | [THM Link](https://tryhackme.com/room/sqlilab) |
| **XML External Entity (XXE)** | PortSwigger | - | Injection & Retrieval | Free | [Start Lab](https://portswigger.net/web-security/xxe) |

### 3. Network Security & Pivoting 
*Focus: Recon, Lateral Movement, Tunneling. (Requires Lab Setup)*

| Machine / Room | Platform | Difficulty | Focus | Cost | Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Care** | VulNyx | Easy | LFI, Squid, Log Poisoning, sudo perl | Free | [Download](https://vulnyx.com/download.php?vm=Care) |
| **Goetia** | VulNyx | Easy | Command Injection, Port Forwarding, PHP Filter Chain, LD_PRELOAD | Free | [Download](https://vulnyx.com/download.php?vm=Goetia) |
| **Hidden** | VulNyx | Easy | UDP, TFTP, PHP, sudo dash | Free | [Download](https://vulnyx.com/download.php?vm=Hidden) |
| **Observer** | VulNyx | Easy | SSH Brute-force, X11, X11 Forwarding, Env Vars | Free | [Download](https://vulnyx.com/download.php?vm=Observer) |
| **Psymin** | VulNyx | Easy | PHP, PsySH, id_rsa Cracking, Port Forwarding | Free | [Download](https://vulnyx.com/download.php?vm=Psymin) |
| **ShadowBlocks** | VulNyx | Easy | iSCSI, 7z Cracking, Port Forwarding, NFS no_root_squash | Free | [Download](https://vulnyx.com/download.php?vm=ShadowBlocks) |
| **Anon** | VulNyx | Medium | Log Poisoning, Pivoting, SSH Brute-force, Docker Group | Free | [Download](https://vulnyx.com/download.php?vm=Anon) |
| **Baal** | VulNyx | Medium | CVE-2023-25690, ICMP Tunneling, RCE | Free | [Download](https://vulnyx.com/download.php?vm=Baal) |
| **Bola** | VulNyx | Medium | rsync, rsync Brute-force, Port Forwarding, IDOR | Free | [Download](https://vulnyx.com/download.php?vm=Bola) |
| **Cache** | VulNyx | Medium | Squid, SSH Brute-force, sudo python3, Writable /etc/passwd | Free | [Download](https://vulnyx.com/download.php?vm=Cache) |
| **ExposedDev** | VulNyx | Medium | VHost Fuzzing, LFI, Git, Port Forwarding | Free | [Download](https://vulnyx.com/download.php?vm=ExposedDev) |
| **Hat** | VulNyx | Medium | LFI, IPv6, FTP, FTP Brute-force | Free | [Download](https://vulnyx.com/download.php?vm=Hat) |
| **Internal** | VulNyx | Medium | LFI, Port Forwarding, Vnc, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Internal) |
| **Key** | VulNyx | Medium | IPv6, Redis, sudo perl, sudo runc | Free | [Download](https://vulnyx.com/download.php?vm=Key) |
| **Leak** | VulNyx | Medium | Jenkins, Cve‑2024‑23897, IPv6, sudo wkhtmltopdf | Free | [Download](https://vulnyx.com/download.php?vm=Leak) |
| **Responder** | VulNyx | Medium | LFI, PHP Wrappers, id_rsa Cracking, IPv6 | Free | [Download](https://vulnyx.com/download.php?vm=Responder) |
| **Static** | VulNyx | Medium | rsync, rsync Brute-force, Node.js, Nodejs ecstatic | Free | [Download](https://vulnyx.com/download.php?vm=Static) |
| **SummarizeThis** | VulNyx | Medium | Ai, Prompt injection, PostgreSQL, Port Forwarding | Free | [Download](https://vulnyx.com/download.php?vm=SummarizeThis) |
| **Unbaked Pie** | HackMyVM | Medium | Docker Pivoting | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=UnbakedPie) |
| **Vault** | HackTheBox | Medium | SSH Tunneling | VIP | [HTB Link](https://app.hackthebox.com/machines/Vault) |
| **Cap** | VulNyx | Hard | ident, IPv6, SSH Brute-force, GRUB | Free | [Download](https://vulnyx.com/download.php?vm=Cap) |
| **Gattaca** | VulNyx | Hard | HTTP GET Brute-force, Command Injection, Port Forwarding, FTP Brute-force | Free | [Download](https://vulnyx.com/download.php?vm=Gattaca) |
| **Gen** | VulNyx | Hard | SSH Brute-force, Port Forwarding, sudo puttygen | Free | [Download](https://vulnyx.com/download.php?vm=Gen) |
| **Lang** | VulNyx | Hard | UDP, SNMP, SNMP Community String Brute-force, SNMP Enumeration | Free | [Download](https://vulnyx.com/download.php?vm=Lang) |
| **Lost** | VulNyx | Hard | VHost Fuzzing, SQLi, Port Forwarding, Command Injection | Free | [Download](https://vulnyx.com/download.php?vm=Lost) |
| **Machine** | HackMyVM | Hard | Internal Network | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=Machine) |
| **Monitor** | VulNyx | Hard | VHost Fuzzing, HTTP GET Brute-force, PHP, Log Poisoning | Free | [Download](https://vulnyx.com/download.php?vm=Monitor) |
| **Travel** | VulNyx | Hard | LFI, IPv6, rsync, Log Poisoning | Free | [Download](https://vulnyx.com/download.php?vm=Travel) |
| **Tunnel** | VulNyx | Hard | Squid, FTP, Zip Cracking, sudo bash | Free | [Download](https://vulnyx.com/download.php?vm=Tunnel) |
| **WinterMute** | HackMyVM | Hard | (Clone of VulnHub Lab) | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=WinterMute) |
| **Reddish** | HackTheBox | Insane | Chisel/Socat Pivoting | VIP | [HTB Link](https://app.hackthebox.com/machines/Reddish) |
| **Lateral Movement** | TryHackMe | - | Moving through Windows | Paid | [THM Link](https://tryhackme.com/room/lateralmovement) |
| **Metasploitable 3** | GitHub | - | Setup as dual-homed target. | Free | [GitHub](https://github.com/rapid7/metasploitable3) |
| **myHouse7** | VulnHub | - | Docker/Subnet pivoting. | Free | [Download](https://www.vulnhub.com/entry/myhouse7,466/) |
| **Pivoting** | TryHackMe | - | Proxychains, sshuttle, Chisel | Paid | [THM Link](https://tryhackme.com/room/pivoting) |
| **Symfonos Series** | VulnHub | - | Good for internal service chains. | Free | [Download](https://www.vulnhub.com/?q=symfonos) |
| **WinterMute 1** | VulnHub | - | **Best for Pivoting.** Dual-VM lab. | Free | [Download](https://www.vulnhub.com/entry/wintermute-1,175/) |
| **Wpwn 1** | VulnHub | - | Dual NICs designed for pivoting. | Free | [Download](https://www.vulnhub.com/entry/wpwn-1,537/) |
| **Wreath** | TryHackMe | - | Full Pivoting Network (Must Do) | Free* | [THM Link](https://tryhackme.com/room/wreath) |

### 4. Exploit Development 
*Focus: Stack Buffer Overflow.*

| Machine / Room | Platform | Difficulty | Focus | Cost | Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Buffer** | HackMyVM | Medium | Stack Overflow | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=Buffer) |
| **Bunker** | VulNyx | Medium | SCTP, Default Creds, Tomcat, WAR | Free | [Download](https://vulnyx.com/download.php?vm=Bunker) |
| **Debug** | VulNyx | Medium | UDP, SNMP, SNMP Community String Brute-force, gdbserver | Free | [Download](https://vulnyx.com/download.php?vm=Debug) |
| **Encode** | VulNyx | Medium | Node.js, node-serialize, Deserialization, sudo gcc | Free | [Download](https://vulnyx.com/download.php?vm=Encode) |
| **October** | HackTheBox | Medium | Buffer Overflow (ASLR/NX) | VIP | [HTB Link](https://app.hackthebox.com/machines/October) |
| **Overflow** | HackMyVM | Medium | Binary Exploitation | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=Overflow) |
| **Brainpan** | HackMyVM | Hard | (Clone/Similar) | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=Brainpan) |
| **Developer** | VulNyx | Hard | LFI, IPv6, rsync, disable_functions Bypass | Free | [Download](https://vulnyx.com/download.php?vm=Developer) |
| **Overflow** | HackTheBox | Hard | Buffer Overflow | VIP | [HTB Link](https://app.hackthebox.com/machines/Overflow) |
| **Transfer** | VulNyx | Hard | VHost Fuzzing, PHP Wrappers, Command Injection, Port Forwarding | Free | [Download](https://vulnyx.com/download.php?vm=Transfer) |
| **Brainpan 1** | VulnHub | - | **The King of BoF.** Do this until you dream in hex. | Free | [Download](https://lnkd.in/dcUQcjQa) |
| **Brainpan 2** | VulnHub | - | Advanced Binary Exploitation. | Free | [Download](https://www.vulnhub.com/entry/brainpan-2,56/) |
| **Brainpan** | TryHackMe | - | THM Port of VulnHub Machine | Free | [THM Link](https://tryhackme.com/room/brainpan) |
| **Buffer Overflow Prep** | TryHackMe | - | Tib3rius Room (TryHackMe). | Free | [THM Link](https://tryhackme.com/room/bufferoverflowprep) |
| **Gatekeeper** | TryHackMe | - | Binary Exploitation | Free | [THM Link](https://tryhackme.com/room/gatekeeper) |
| **Intro To Pwntools** | TryHackMe | - | Scripting Exploits. | Free | [THM Link](https://tryhackme.com/room/introtopwntools) |
| **Smasher** | VulnHub | - | Web to Buffer Overflow. | Free | [Download](https://www.vulnhub.com/entry/smasher-1,398/) |
| **Stack Overflows for Beginners** | VulnHub | - | Linear progression BoF. | Free | [Download](https://www.vulnhub.com/entry/stack-overflows-for-beginners-101,659/) |
| **Sudo Buffer Overflow** | TryHackMe | - | CVE-2019-18634 | Free | [THM Link](https://tryhackme.com/room/sudovulnsbof) |

### 5. Post-Exploitation & Privilege Escalation 
*Focus: Linux PrivEsc, Cron jobs, SUID, Kernel exploits.*

| Machine / Room | Platform | Difficulty | Focus | Cost | Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Agent** | VulNyx | Low | WebSVN, CVE-2021-32305, sudo c99, sudo ssh-agent | Free | [Download](https://vulnyx.com/download.php?vm=Agent) |
| **Doctor** | VulNyx | Low | LFI, id_rsa Cracking, Writable /etc/passwd, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Doctor) |
| **First** | VulNyx | Low | Raspberry Pi, Default Creds, rbash, rbash Bypass | Free | [Download](https://vulnyx.com/download.php?vm=First) |
| **HackingStation** | VulNyx | Low | Command Injection, sudo nmap, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=HackingStation) |
| **Infected** | VulNyx | Low | Backdoor, Apache mod_backdoor, sudo service, sudo joe | Free | [Download](https://vulnyx.com/download.php?vm=Infected) |
| **Look** | VulNyx | Low | SSH Brute-force, Env Vars, sudo nokogiri, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Look) |
| **Lower2** | VulNyx | Low | Telnet, Telnet Brute-force, shadow Group, Shadow writable | Free | [Download](https://vulnyx.com/download.php?vm=Lower2) |
| **Lower3** | VulNyx | Low | NFS, NFS no_root_squash, Misconfiguration, RCE | Free | [Download](https://vulnyx.com/download.php?vm=Lower3) |
| **Mux** | VulNyx | Low | Stego, strings, rlogin, sudo tmux | Free | [Download](https://vulnyx.com/download.php?vm=Mux) |
| **Network** | VulNyx | Low | Command Injection, sudo ip, RCE, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Network) |
| **Node** | VulNyx | Low | Node red, sudo node, Misconfiguration, RCE | Free | [Download](https://vulnyx.com/download.php?vm=Node) |
| **Plot** | VulNyx | Low | VHost Fuzzing, sar2html, sudo ssh, Wildcard Injection | Free | [Download](https://vulnyx.com/download.php?vm=Plot) |
| **Real** | VulNyx | Low | Unrealircd, CVE-2010-2075, Cron, Hosts writable | Free | [Download](https://vulnyx.com/download.php?vm=Real) |
| **Robot** | VulNyx | Low | Stego, MongoDB, SSH Brute-force, sudo sh | Free | [Download](https://vulnyx.com/download.php?vm=Robot) |
| **Share** | VulNyx | Low | Weborf, CVE-2010-3306, LFI, id_rsa Cracking | Free | [Download](https://vulnyx.com/download.php?vm=Share) |
| **Shock** | VulNyx | Low | Shellshock, CVE-2014-6271, cgi-bin, sudo busybox | Free | [Download](https://vulnyx.com/download.php?vm=Shock) |
| **Zero** | VulNyx | Low | PHP 8.1.0-dev Backdoor, Backdoor, sudo wine, RCE | Free | [Download](https://vulnyx.com/download.php?vm=Zero) |
| **Air** | VulNyx | Easy | File Upload, sudo vifm, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Air) |
| **Alpine** | VulNyx | Easy | Git, Cron, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Alpine) |
| **Blind** | VulNyx | Easy | Blind command injection, sudo jshell, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Blind) |
| **Brain** | VulNyx | Easy | LFI, sudo wfuzz, Python Library Hijacking | Free | [Download](https://vulnyx.com/download.php?vm=Brain) |
| **Flash** | VulNyx | Easy | SSTI, sudo expect, RCE, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Flash) |
| **Friends** | VulNyx | Easy | OSINT, MySQL, MySQL Brute-force, Mysql load_file | Free | [Download](https://vulnyx.com/download.php?vm=Friends) |
| **Hit** | VulNyx | Easy | Git, Knock, Port knocking, id_rsa Cracking | Free | [Download](https://vulnyx.com/download.php?vm=Hit) |
| **Hook** | VulNyx | Easy | Htmlawed, CVE-2022-35914, sudo perl, sudo iex | Free | [Download](https://vulnyx.com/download.php?vm=Hook) |
| **Memory** | VulNyx | Easy | Memcache, SSH Brute-force, sudo wormhole, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Memory) |
| **Misstep** | VulNyx | Easy | API, Docker, Docker Group, Cron | Free | [Download](https://vulnyx.com/download.php?vm=Misstep) |
| **Play** | VulNyx | Easy | Musicco, Path Traversal, Arbitrary directory download, SSH Brute-force | Free | [Download](https://vulnyx.com/download.php?vm=Play) |
| **Plex** | VulNyx | Easy | Sslh, Multiplexer, JWT, sudo mutt | Free | [Download](https://vulnyx.com/download.php?vm=Plex) |
| **Return** | HackTheBox | Easy | Windows/Server Operators | VIP | [HTB Link](https://app.hackthebox.com/machines/Return) |
| **Send** | VulNyx | Easy | rsync, Cron, Apt writable, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Send) |
| **Shop** | VulNyx | Easy | SQLi, Sqli time based, SSH Brute-force, Capabilities | Free | [Download](https://vulnyx.com/download.php?vm=Shop) |
| **Slash** | VulNyx | Easy | Nginx misconfigured, Path Traversal, SSH Brute-force, sudo aoss | Free | [Download](https://vulnyx.com/download.php?vm=Slash) |
| **Bind** | VulNyx | Medium | SCTP, sudo wtfutil, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Bind) |
| **Chimera** | VulNyx | Medium | Gitea, Git, CVE-2024-1086 | Free | [Download](https://vulnyx.com/download.php?vm=Chimera) |
| **Coliseum** | VulNyx | Medium | IDOR, PostgreSQL, su Brute-force, sudo busybox | Free | [Download](https://vulnyx.com/download.php?vm=Coliseum) |
| **Escalate** | HackMyVM | Medium | SUID/Sudo Abuse | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=Escalate) |
| **Hellman** | VulNyx | Medium | _TBA_ | Free | [Download](https://vulnyx.com/download.php?vm=Hellman) |
| **Jeeves** | HackTheBox | Medium | Windows/RottenPotato | VIP | [HTB Link](https://app.hackthebox.com/machines/Jeeves) |
| **Listen** | VulNyx | Medium | id_rsa Cracking, CVE-2018-15473, Cron, Cron Hijacking | Free | [Download](https://vulnyx.com/download.php?vm=Listen) |
| **LostTape** | VulNyx | Medium | Git, LFI, Xinetd, Bof | Free | [Download](https://vulnyx.com/download.php?vm=LostTape) |
| **Mail** | VulNyx | Medium | LFI, Smtp, Mail poisoning, sudo mail | Free | [Download](https://vulnyx.com/download.php?vm=Mail) |
| **Matrix** | VulNyx | Medium | Pcap, Stego, Wildcard Injection, sudo rsync | Free | [Download](https://vulnyx.com/download.php?vm=Matrix) |
| **PrivEsc Mission** | HackingHub | Medium | Linux PrivEsc | Free | [Start Mission](https://hackinghub.io/missions) |
| **PrivEsc** | HackMyVM | Medium | Multi-vector Escalation | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=PrivEsc) |
| **Safeguard** | VulNyx | Medium | Tomcat, CVE-2025-24813, Cron, Cron Hijacking | Free | [Download](https://vulnyx.com/download.php?vm=Safeguard) |
| **Secrets** | VulNyx | Medium | HTTP POST Brute-force, id_rsa Cracking, sudo date, sudo jed | Free | [Download](https://vulnyx.com/download.php?vm=Secrets) |
| **Toxin** | HackMyVM | Medium | Kernel Exploits | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=Toxin) |
| **University** | VulNyx | Medium | Moodle, CVE-2024-43425, KDBX Cracking, sudo git | Free | [Download](https://vulnyx.com/download.php?vm=University) |
| **Volt** | VulNyx | Medium | _TBA_ | Free | [Download](https://vulnyx.com/download.php?vm=Volt) |
| **Zerotrace** | VulNyx | Medium | LFI, sudo chattr, Cron, Ethereum Cracking | Free | [Download](https://vulnyx.com/download.php?vm=Zerotrace) |
| **Annunciation** | VulNyx | Hard | Command Injection, Cron, CVE-2021-3156, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Annunciation) |
| **Backdoor** | VulNyx | Hard | Backdoor, HTTP POST Brute-force, Writable apache2.conf, sudo bettercap | Free | [Download](https://vulnyx.com/download.php?vm=Backdoor) |
| **QuartzLock** | VulNyx | Hard | _TBA_ | Free | [Download](https://vulnyx.com/download.php?vm=QuartzLock) |
| **DC-1** | VulnHub | - | SUID Abuse. | Free | [Download](https://www.vulnhub.com/entry/dc-1,292/) |
| **DC-2** | VulnHub | - | Restricted Shell. | Free | [Download](https://www.vulnhub.com/entry/dc-2,311/) |
| **DC-3** | VulnHub | - | Kernel Exploit. | Free | [Download](https://www.vulnhub.com/entry/dc-3,312/) |
| **DC-4** | VulnHub | - | Sudo Abuse. | Free | [Download](https://www.vulnhub.com/entry/dc-4,313/) |
| **DC-5** | VulnHub | - | Screen Exploit. | Free | [Download](https://www.vulnhub.com/entry/dc-5,314/) |
| **DC-6** | VulnHub | - | Script Abuse. | Free | [Download](https://lnkd.in/dF57--hm) |
| **Escalate_Linux 1** | VulnHub | - | 12+ Methods of Escalation. | Free | [Download](https://lnkd.in/dCb7U_3a) |
| **Lin.Security** | VulnHub | - | Dedicated PrivEsc Practice. | Free | [Download](https://lnkd.in/dNUdqAPQ) |
| **Linux for Hackers Course** | HackingHub | Intermediate | Linux Skills | Paid | [Course Link](https://hackinghub.io/courses) |
| **Linux PrivEsc** | TryHackMe | - | Full Linux Escalation Course | Paid | [THM Link](https://tryhackme.com/room/linuxprivesc) |
| **Post-Exploitation Basics** | TryHackMe | - | Mimikatz, Bloodhound, Powerview | Paid | [THM Link](https://tryhackme.com/room/postexploit) |
| **PrivEsc Arena** | TryHackMe | - | Multi-vector Practice | Paid | [THM Link](https://tryhackme.com/room/linuxprivescarena) |
| **Temple of Doom** | VulnHub | - | Node.js / Serialization. | Free | [Download](https://lnkd.in/dceCu63Q) |
| **Tommy Boy 1** | VulnHub | - | Sudo Abuse. | Free | [Download](https://lnkd.in/ddCEnGDu) |
| **Windows PrivEsc** | TryHackMe | - | Full Windows Escalation Course | Paid | [THM Link](https://tryhackme.com/room/windows10privesc) |

### 6. Active Directory & Red Teaming 
*Focus: Kerberoasting, AS-REP, Domain Dominance.*

> **WARNING:** VulnHub is weak for AD. Use these resources instead.

| Machine / Room | Platform | Difficulty | Focus | Cost | Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Build** | VulNyx | Low | Jenkins, Default Creds, Misconfiguration, RCE | Free | [Download](https://vulnyx.com/download.php?vm=Build) |
| **Eternal** | VulNyx | Low | SMB, MS17-010, CVE-2017-0143, EternalBlue | Free | [Download](https://vulnyx.com/download.php?vm=Eternal) |
| **Experience** | VulNyx | Low | SMB, MS08-067, CVE-2008-4250, NetAPI | Free | [Download](https://vulnyx.com/download.php?vm=Experience) |
| **Active** | HackTheBox | Easy | Kerberoasting/GPP | VIP | [HTB Link](https://app.hackthebox.com/machines/Active) |
| **Admin** | VulNyx | Easy | SMB Brute-force, WinRM, PowerShell History, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Admin) |
| **Carlam** | VulNyx | Easy | NFS, SMB, RID Brute, SSH Brute-force | Free | [Download](https://vulnyx.com/download.php?vm=Carlam) |
| **Dump** | VulNyx | Easy | FTP, Anonymous FTP, SAM/SYSTEM Dump, NTLM Cracking | Free | [Download](https://vulnyx.com/download.php?vm=Dump) |
| **Hosting** | VulNyx | Easy | SMB, SMB Brute-force, RPC Enumeration, WinRM | Free | [Download](https://vulnyx.com/download.php?vm=Hosting) |
| **Magic** | VulNyx | Easy | SMB, SMB RID Brute, SMB Brute-force, SMB Shares | Free | [Download](https://vulnyx.com/download.php?vm=Magic) |
| **Policy** | VulNyx | Easy | Zip Cracking, GPP, groups.xml, GPP Decrypt | Free | [Download](https://vulnyx.com/download.php?vm=Policy) |
| **Sauna** | HackTheBox | Easy | AD Enumeration | VIP | [HTB Link](https://app.hackthebox.com/machines/Sauna) |
| **SRV** | VulNyx | Easy | FTP, Anonymous FTP, IIS, ASPX | Free | [Download](https://vulnyx.com/download.php?vm=SRV) |
| **Store** | VulNyx | Easy | IIS, File Upload, ASPX, SeImpersonatePrivilege | Free | [Download](https://vulnyx.com/download.php?vm=Store) |
| **Sun** | VulNyx | Easy | SMB, SMB RID Brute, SMB Brute-force, SMB Shares | Free | [Download](https://vulnyx.com/download.php?vm=Sun) |
| **War** | VulNyx | Easy | Tomcat, Default Creds, WAR, SeImpersonatePrivilege | Free | [Download](https://vulnyx.com/download.php?vm=War) |
| **Change** | VulNyx | Medium | Active Directory, SMB Brute-force, Kerberos, LDAP | Free | [Download](https://vulnyx.com/download.php?vm=Change) |
| **Controler** | VulNyx | Medium | Active Directory, SMB Brute-force, Kerberos, LDAP | Free | [Download](https://vulnyx.com/download.php?vm=Controler) |
| **Misconfigured** | VulNyx | Medium | Active Directory, SMB Brute-force, LDAP, LDAP Enumeration | Free | [Download](https://vulnyx.com/download.php?vm=Misconfigured) |
| **Monteverde** | HackTheBox | Medium | Azure AD Traits | VIP | [HTB Link](https://app.hackthebox.com/machines/Monteverde) |
| **Tech** | VulNyx | Medium | LFI, PHP, Log Poisoning, Misconfiguration | Free | [Download](https://vulnyx.com/download.php?vm=Tech) |
| **AD Course** | HackingHub | Advanced | Full AD Compromise | Paid | [Course Link](https://hackinghub.io/courses) |
| **AD Mission** | HackingHub | Hard | AD Exploitation | Free | [Start Mission](https://hackinghub.io/missions) |
| **AD** | HackMyVM | Hard | Basic AD Chain | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=AD) |
| **Blackfield** | HackTheBox | Hard | Forensics/AD | VIP | [HTB Link](https://app.hackthebox.com/machines/Blackfield) |
| **Domain** | HackMyVM | Hard | Kerberos Attacks | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=Domain) |
| **Manager** | VulNyx | Hard | UDP, SNMP, SNMP Community String Brute-force, SNMP Enumeration | Free | [Download](https://vulnyx.com/download.php?vm=Manager) |
| **School** | VulNyx | Hard | LFI, Tomcat, WAR, SeImpersonatePrivilege | Free | [Download](https://vulnyx.com/download.php?vm=School) |
| **Sizzle** | HackTheBox | Hard | Deep AD | VIP | [HTB Link](https://app.hackthebox.com/machines/Sizzle) |
| **Controller** | HackMyVM | Insane | Full Forest Compromise | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?vm=Controller) |
| **[GOAD](https://github.com/Orange-Cyberdefense/GOAD)** | GitHub | - | Full Lab | Free | [GitHub](https://github.com/Orange-Cyberdefense/GOAD) |
| **[VulnLab](https://vulnlab.com/)** | VulnLab | - | Cloud Lab | Paid | [Website](https://vulnlab.com/) |
| **Active Directory Basics** | TryHackMe | - | AD Fundamentals | Free | [THM Link](https://tryhackme.com/room/activedirectorybasics) |
| **Attacktive Directory** | TryHackMe | - | Kerberos, Impacket, Domain Admin | Free | [THM Link](https://tryhackme.com/room/attacktivedirectory) |
| **Breaching Active Directory** | TryHackMe | - | Initial Access in AD | Free | [THM Link](https://tryhackme.com/room/breachingad) |
| **Dante** | HackTheBox | - | Pro Lab | Paid | [HTB Link](https://app.hackthebox.com/prolabs/Dante) |
| **HTB ProLabs** | HackTheBox | - | Cloud Lab | Paid | [Website](https://www.hackthebox.com/hacker/pro-labs) |
| **Lateral Movement in AD** | TryHackMe | - | Spreading through the Domain | Paid | [THM Link](https://tryhackme.com/room/lateralmovement) |
| **Metasploitable 3** | GitHub | - | Local Lab | Free | [GitHub](https://github.com/rapid7/metasploitable3) |
| **Offshore** | HackTheBox | - | Pro Lab | Paid | [HTB Link](https://app.hackthebox.com/prolabs/Offshore) |
| **Post-Exploitation Basics** | TryHackMe | - | Persistence & Looting | Paid | [THM Link](https://tryhackme.com/room/postexploit) |
| **RastaLabs** | HackTheBox | - | Pro Lab | Paid | [HTB Link](https://app.hackthebox.com/prolabs/RastaLabs) |
| **Zephyr** | HackTheBox | - | Pro Lab | Paid | [HTB Link](https://app.hackthebox.com/prolabs/Zephyr) |

---

##  Malware Analysis

| Machine / Room | Platform | Difficulty | Focus | Cost | Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Basic Malware RE** | TryHackMe | - | Reversing Fundamentals | Free | [THM Link](https://tryhackme.com/room/basicmalwarere) |
| **Carnage** | TryHackMe | - | C2 Simulation | Free | [THM Link](https://tryhackme.com/room/c2carnage) |
| **Dunkle Materie** | TryHackMe | - | Packed Malware | Free | [THM Link](https://tryhackme.com/room/dunklematerieptxc9) |
| **History of Malware** | TryHackMe | - | Intro to Malware | Free | [THM Link](https://tryhackme.com/room/historyofmalware) |
| **MAL: Malware Introductory** | TryHackMe | - | Basic Concepts | Free | [THM Link](https://tryhackme.com/room/malmalintroductory) |
| **MAL: Researching** | TryHackMe | - | Analysis & Research | Free | [THM Link](https://tryhackme.com/room/malresearching) |
| **Mobile Malware Analysis** | TryHackMe | - | Android/iOS Malware | Free | [THM Link](https://tryhackme.com/room/mma) |

##  Reverse Engineering

| Machine / Room | Platform | Difficulty | Focus | Cost | Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Aster** | TryHackMe | - | Decompiling Python | Free | [THM Link](https://tryhackme.com/room/aster) |
| **CC: Ghidra** | TryHackMe | - | Ghidra Tool | Free | [THM Link](https://tryhackme.com/room/ccghidra) |
| **CC: Radare2** | TryHackMe | - | Radare2 Tool | Free | [THM Link](https://tryhackme.com/room/ccradare2) |
| **Classic Passwd** | TryHackMe | - | Binary Reversing | Free | [THM Link](https://tryhackme.com/room/classicpasswd) |
| **Intro to x86-64** | TryHackMe | - | Assembly Basics | Free | [THM Link](https://tryhackme.com/room/introtox8664) |
| **JVM Reverse Engineering** | TryHackMe | - | Java Bytecode | Free | [THM Link](https://tryhackme.com/room/jvmreverseengineering) |
| **REloaded** | TryHackMe | - | Various Challenges | Free | [THM Link](https://tryhackme.com/room/reloaded) |
| **Reverse Engineering** | TryHackMe | - | RE Fundamentals | Free | [THM Link](https://tryhackme.com/room/reverseengineering) |
| **Reversing ELF** | TryHackMe | - | Linux ELF Binaries | Free | [THM Link](https://tryhackme.com/room/reverselfiles) |
| **Windows x64 Assembly** | TryHackMe | - | Windows Assembly | Free | [THM Link](https://tryhackme.com/room/win64assembly) |

##  Hard CTF / Challenges

| Machine / Room | Platform | Difficulty | Focus | Cost | Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **All Hard Machines** | HackTheBox | Hard | Various | VIP | [HTB Link](https://app.hackthebox.com/machines?difficulty=Hard) |
| **doubletrouble: 1** | VulnHub | Hard | Misconfigs/PrivEsc | Free | [Download](https://www.vulnhub.com/entry/doubletrouble-1,162/) |
| **Empire: Breakout** | VulnHub | Hard | Adv. PrivEsc | Free | [Download](https://www.vulnhub.com/entry/empire-breakout,181/) |
| **Hacksudo: FOG** | VulnHub | Hard | Web/Linux PrivEsc | Free | [Download](https://www.vulnhub.com/entry/hacksudo-fog,732/) |
| **Hacksudo: Thor** | VulnHub | Hard | Unique PrivEsc | Free | [Download](https://www.vulnhub.com/entry/hacksudo-thor,733/) |
| **Hard** | HackMyVM | Hard | Advanced Exploits | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?difficulty=hard) |
| **Metasploitable 3** | VulnHub | Hard | Windows Exploit | Free | [GitHub](https://github.com/rapid7/metasploitable3) |
| **SickOS 1.2** | VulnHub | Hard | Masterful Exploitation | Free | [Download](https://www.vulnhub.com/entry/sickos-12,144/) |
| **Temple of Doom** | VulnHub | Hard | Obscure Puzzles | Free | [Download](https://lnkd.in/dceCu63Q) |
| **Tr0ll 2** | VulnHub | Hard | Deep Exploitation | Free | [Download](https://lnkd.in/dPW33XZ4) |
| **Vikings: 1** | VulnHub | Hard | Lateral Movement | Free | [Download](https://www.vulnhub.com/entry/vikings-1,208/) |
| **All Insane Machines** | HackTheBox | Insane | Various | VIP | [HTB Link](https://app.hackthebox.com/machines?difficulty=Insane) |
| **Insane** | HackMyVM | Insane | Complex Challenges | Free | [HMV Link](https://hackmyvm.eu/machines/machine.php?difficulty=insane) |
| **Borderlands** | TryHackMe | - | Boot2Root | Free | [THM Link](https://tryhackme.com/room/borderlands) |
| **Brainpan 1** | TryHackMe | - | Buffer Overflow | Paid | [THM Link](https://tryhackme.com/room/brainpan) |
| **Daily Bugle** | TryHackMe | - | CMS Exploitation | Paid | [THM Link](https://tryhackme.com/room/dailybugle) |
| **Internal** | TryHackMe | - | Pivoting/AD | Paid | [THM Link](https://tryhackme.com/room/internal) |
| **Iron Corp** | TryHackMe | - | Web/Linux Exploit | Paid | [THM Link](https://tryhackme.com/room/ironcorp) |
| **Jeff** | TryHackMe | - | Boot2Root | Paid | [THM Link](https://tryhackme.com/room/jeff) |
| **Motunui** | TryHackMe | - | Boot2Root | Free | [THM Link](https://tryhackme.com/room/motunui) |
| **Ra** | TryHackMe | - | AD/Internal Network | Paid | [THM Link](https://tryhackme.com/room/ra) |
| **Retro** | TryHackMe | - | Boot2Root | Free | [THM Link](https://tryhackme.com/room/retro) |
| **Spring** | TryHackMe | - | Web App Hacking | Paid | [THM Link](https://tryhackme.com/room/spring) |
| **Squid Game** | TryHackMe | - | Malware/RE | Paid | [THM Link](https://tryhackme.com/room/squidgameroom) |
| **VulnNet: dotjar** | TryHackMe | - | Java Deserialization | Paid | [THM Link](https://tryhackme.com/room/vulnnetdotjar) |

---

##  Labs & Ranges

Full multi-host environments for practising lateral movement, AD attacks and detection engineering.
These are the closest free stand-ins for the OSCP challenge labs and the CPTS/eCPPTv3 internal-network
sections.

### Labs

| Lab | Type | Focus | Cost | Link |
| :--- | :--- | :--- | :--- | :--- |
| **HackLabs** | Self-hosted | Curated vulnerable-lab collection & guided paths | Free | [GitHub](https://github.com/afsh4ck/HackLabs) |
| **Metasploitable 3** | Self-hosted (Vagrant) | Windows Server 2008 + Ubuntu targets, dual-homed for pivoting | Free | [GitHub](https://github.com/rapid7/metasploitable3) |
| **HackMyVM** | Downloadable VMs | 400+ boot2root machines, free flag submission & ladder | Free | [Website](https://hackmyvm.eu/) |
| **VulNyx** | Downloadable VMs | 179 free boot2root VMs, listed by domain above | Free | [Website](https://vulnyx.com/) |
| **DetectionLab** | Self-hosted (Vagrant/Terraform) | Blue-team telemetry: Splunk, Sysmon, osquery, Velociraptor | Free | [GitHub](https://github.com/clong/DetectionLab) |
| **Windows Attack & Defense Lab** | Self-hosted | Windows/AD attack paths paired with defensive tooling | Free | [GitHub](https://github.com/jaredhaight/WindowsAttackAndDefenseLab) |

### Ranges

| Range | Type | Focus | Cost | Link |
| :--- | :--- | :--- | :--- | :--- |
| **GOAD v3** | Multi-domain AD range | Kerberoasting, AS-REP, delegation, trust abuse, ADCS. **The** free AD range | Free | [GitHub](https://github.com/Orange-Cyberdefense/GOAD) |
| **VulnLab** | Cloud range | Chained AD/Windows labs, OSCP+ difficulty | Paid | [Website](https://vulnlab.com/) |
| **HTB Pro Labs** | Cloud range | Dante, RastaLabs, Offshore, Zephyr | Paid | [Website](https://www.hackthebox.com/hacker/pro-labs) |

**GOAD lab variants**: pick one that fits your hardware; all ship in the same repo and deploy via
Vagrant/Ansible (VirtualBox, VMware, Proxmox, or Azure providers).

| Variant | Size | Topology | Link |
| :--- | :--- | :--- | :--- |
| **MINILAB** | 2 VMs | 1 forest, 1 domain (1 DC + 1 Win10 workstation) | [Docs](https://orange-cyberdefense.github.io/GOAD/labs/MINILAB/) |
| **GOAD-Light** | 3 VMs | 1 forest, 2 domains. Start here on a smaller PC | [Docs](https://orange-cyberdefense.github.io/GOAD/labs/GOAD-Light/) |
| **GOAD** | 5 VMs | 2 forests, 3 domains. The full lab | [Docs](https://orange-cyberdefense.github.io/GOAD/labs/GOAD/) |
| **SCCM** | 4 VMs | 1 forest, 1 domain with Microsoft Configuration Manager | [Docs](https://orange-cyberdefense.github.io/GOAD/labs/SCCM/) |
| **DRACARYS** | 3 VMs | Challenge lab, 1 domain, no schema provided | [Docs](https://orange-cyberdefense.github.io/GOAD/labs/DRACARYS/) |
| **NHA** | 5 VMs | Challenge lab, 2 domains, no schema provided | [Docs](https://orange-cyberdefense.github.io/GOAD/labs/NHA/) |

---
## License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this toolkit for personal or commercial purposes, provided that the original copyright
notice and this permission notice are included in all copies or substantial portions of the software.

See the full license text in the [MIT License](https://opensource.org/licenses/MIT).
