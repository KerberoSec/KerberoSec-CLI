---
tags: [hackthebox, pentest, OSCP, roadmap]
created: 2026-03-01
---

# 🎯 HackTheBox Easy Machines: Çözüm Sıralaması

> **Onurcan'ın tamamlanmamış easy makineleri**, kolaydan zora sıralanmış.
> Toplam **126** makine | TJNull + 0xdf + topluluk önerilerine göre sıralanmıştır.

## 📊 Özet Tablo

| Tier | Makine Sayısı | Tahmini Süre | Odak Alanı |
|------|:---:|:---:|---|
| 🟢 Tier 1 | 6 | 1-2 gün | Temel exploit çalıştırma |
| 🟢 Tier 2 | 13 | 3-5 gün | Enumeration + bilinen CVE |
| 🟡 Tier 3 | 23 | 5-7 gün | Exploit zincirleme |
| 🟠 Tier 4 | 34 | 8-12 gün | Karmaşık privesc & lateral movement |
| 🔴 Tier 5 | 50 | 10-15 gün | Gerçekçi senaryolar & yeni makineler |
| **TOPLAM** | **126** | **~30-40 gün** | |

---

## 🟢 TIER 1: En Kolay (Buradan Başla!)

> Tek exploit ile root. Nmap → exploit → flag. Metodoloji öğrenmek için ideal.

| # | Makine | OS | Rating | Skills | Notes | Done |
|:--:|--------|:--:|:------:|--------|-------|:----:|
| 1 | **Keeper** | 🐧 Linux | ⭐ 3.8 | Default credentials, KeePass CVE-2023-32784 | Request Tracker default creds + KeePass memory dump | ☐ |
| 2 | **Knife** | 🐧 Linux | ⭐ 3.8 | PHP 8.1.0-dev backdoor, sudo knife | User-Agent header backdoor + GTFOBins knife | ☐ |
| 3 | **Broker** | 🐧 Linux | ⭐ 4.5 | Apache ActiveMQ CVE-2023-46604, sudo nginx | Deserialization RCE + nginx root read | ☐ |
| 4 | **Bashed** | 🐧 Linux | ⭐ 4.7 | Web shell discovery, cron job exploitation | phpbash webshell zaten mevcut, cron ile privesc | ☐ |
| 5 | **Mirai** | 🐧 Linux | ⭐ 4.7 | Default IoT credentials, USB data recovery | Raspberry Pi default creds + deleted root.txt recovery | ☐ |
| 6 | **Shocker** | 🐧 Linux | ⭐ 4.8 | Shellshock (CVE-2014-6271), sudo abuse | CGI-bin Shellshock + Perl sudo | ☐ |

---

## 🟢 TIER 2: Başlangıç

> Basit enumeration + bilinen CVE. Web tarama ve exploit-db kullanımı.

| # | Makine | OS | Rating | Skills | Notes | Done |
|:--:|--------|:--:|:------:|--------|-------|:----:|
| 1 | **Sense** | 🐡 OpenBSD | ⭐ 4.0 | pfSense RCE, directory bruteforce | pfSense command injection, direkt root shell | ☐ |
| 2 | **Arctic** | 🪟 Windows | ⭐ 4.1 | ColdFusion 8 RCE, Chimichurri privesc | Adobe ColdFusion directory traversal + upload | ☐ |
| 3 | **Return** | 🪟 Windows | ⭐ 4.5 | Printer LDAP config abuse, Server Operators | LDAP credential capture + service binary path abuse | ☐ |
| 4 | **Bounty** | 🪟 Windows | ⭐ 4.5 | IIS short name, web.config upload, Juicy Potato | ASP upload bypass + token impersonation | ☐ |
| 5 | **Devvortex** | 🐧 Linux | ⭐ 4.6 | Joomla CVE, MySQL creds, apport-cli | Joomla info disclosure + MySQL + apport SUID | ☐ |
| 6 | **Nibbles** | 🐧 Linux | ⭐ 4.6 | Nibbleblog file upload, sudo script abuse | CMS arbitrary upload + sudo shell script | ☐ |
| 7 | **Bank** | 🐧 Linux | ⭐ 4.6 | DNS zone transfer, file upload bypass | Virtual host + upload bypass + SUID dash | ☐ |
| 8 | **Cicada** | 🪟 Windows | ⭐ 4.7 | AD enumeration, password spray, SeBackupPrivilege | Beginner AD: RID cycling + spray + backup privesc | ☐ |
| 9 | **Irked** | 🐧 Linux | ⭐ 4.7 | UnrealIRCd backdoor, steganography, SUID | IRC backdoor + steg password + viewuser SUID | ☐ |
| 10 | **Beep** | 🐧 Linux | ⭐ 4.7 | Multiple vectors: LFI, Elastix, ShellShock | 10+ farkli exploit yolu, enum pratigi icin mukemmel | ☐ |
| 11 | **Curling** | 🐧 Linux | ⭐ 4.8 | Joomla, base64 creds, cron/bzip2 abuse | Page source creds + hex/bzip2 extraction + cron | ☐ |
| 12 | **Valentine** | 🐧 Linux | ⭐ 4.8 | Heartbleed (CVE-2014-0160), tmux hijack | SSL Heartbleed memory leak + tmux session | ☐ |
| 13 | **Bastion** | 🪟 Windows | ⭐ 4.9 | SMB mount, VHD extraction, mRemoteNG creds | VHD SAM dump + mRemoteNG password decrypt | ☐ |

---

## 🟡 TIER 3: Başlangıç-Orta

> Birden fazla adım, exploit zincirleme, daha detaylı enumeration.

| # | Makine | OS | Rating | Skills | Notes | Done |
|:--:|--------|:--:|:------:|--------|-------|:----:|
| 1 | **GreenHorn** | 🐧 Linux | ⭐ 2.9 | Pluck CMS, pixelated password recovery | Pluck file upload + depixelation + sudo su | ☐ |
| 2 | **Topology** | 🐧 Linux | ⭐ 3.6 | LaTeX injection, Apache vhost, pspy | LaTeX file read + .htpasswd + gnuplot cron | ☐ |
| 3 | **Usage** | 🐧 Linux | ⭐ 3.8 | Blind SQL injection, Laravel file upload | Boolean-based blind SQLi + admin upload abuse | ☐ |
| 4 | **Networked** | 🐧 Linux | ⭐ 3.8 | PHP upload bypass, command injection, cron | Double extension + network script injection | ☐ |
| 5 | **Analytics** | 🐧 Linux | ⭐ 4.1 | Metabase pre-auth RCE, Docker escape, kernel CVE | CVE-2023-38646 + container escape + GameOver(lay) | ☐ |
| 6 | **Postman** | 🐧 Linux | ⭐ 4.1 | Redis unauthorized SSH key write, Webmin CVE | Redis key injection + Webmin package update RCE | ☐ |
| 7 | **Titanic** | 🐧 Linux | ⭐ 4.2 | Path traversal, Gitea, ImageMagick | Web traversal + Gitea creds + ImageMagick metadata | ☐ |
| 8 | **Editorial** | 🐧 Linux | ⭐ 4.3 | SSRF, internal API enumeration, Git history | SSRF to internal API + git log credential leak | ☐ |
| 9 | **Traverxec** | 🐧 Linux | ⭐ 4.3 | Nostromo RCE, SSH key, journalctl pager | Nostromo CVE + htpasswd + journalctl GTFOBin | ☐ |
| 10 | **Sunday** | ☀️ Solaris | ⭐ 4.3 | Finger enumeration, SSH brute, wget sudo | Solaris OS, finger user enum + shadow hash + sudo wget | ☐ |
| 11 | **Chemistry** | 🐧 Linux | ⭐ 4.4 | Pymatgen CVE, path traversal | Python library deserialization + web path traversal | ☐ |
| 12 | **Codify** | 🐧 Linux | ⭐ 4.4 | vm2 sandbox escape, bash script password brute | Node.js sandbox CVE + bash glob matching brute | ☐ |
| 13 | **Busqueda** | 🐧 Linux | ⭐ 4.4 | Python eval() injection, Git credential leak | Searchor library RCE + gitconfig password reuse | ☐ |
| 14 | **BoardLight** | 🐧 Linux | ⭐ 4.5 | Dolibarr CMS RCE, Enlightenment SUID | Dolibarr admin + reverse shell + CVE-2022-37706 | ☐ |
| 15 | **CozyHosting** | 🐧 Linux | ⭐ 4.5 | Spring Boot Actuator, OS command injection, hash crack | Session hijack + command injection + psql creds | ☐ |
| 16 | **Pilgrimage** | 🐧 Linux | ⭐ 4.5 | ImageMagick CVE-2022-44268, Binwalk CVE-2022-4510 | Arbitrary file read + Binwalk RCE | ☐ |
| 17 | **Sauna** | 🪟 Windows | ⭐ 4.5 | AS-REP Roasting, BloodHound, DCSync | AD: username enum + ASREPRoast + DCSync chain | ☐ |
| 18 | **OpenAdmin** | 🐧 Linux | ⭐ 4.5 | OpenNetAdmin RCE, internal pivot, nano sudo | ONA exploit + internal web + nano GTFOBin | ☐ |
| 19 | **Support** | 🪟 Windows | ⭐ 4.6 | .NET reversing, LDAP, BloodHound, RBCD | AD: .NET decompile + GenericAll + RBCD attack | ☐ |
| 20 | **Forest** | 🪟 Windows | ⭐ 4.6 | AS-REP Roasting, BloodHound, WriteDACL, DCSync | AD: ASREPRoast + Exchange group abuse + DCSync | ☐ |
| 21 | **FriendZone** | 🐧 Linux | ⭐ 4.6 | DNS zone transfer, SMB creds, Python library hijack | Zone transfer + LFI + writable Python module | ☐ |
| 22 | **SwagShop** | 🐧 Linux | ⭐ 4.7 | Magento SQLi + RCE chain, sudo vi | Magento exploit chain + vi shell escape | ☐ |
| 23 | **Help** | 🐧 Linux | ⭐ 4.8 | HelpDeskZ file upload, kernel exploit | Upload timestamp prediction + kernel privesc | ☐ |

---

## 🟠 TIER 4: Orta Seviye

> Çoklu adım, karmaşık privesc, lateral movement, gerçek dünya teknikleri.

| # | Makine | OS | Rating | Skills | Notes | Done |
|:--:|--------|:--:|:------:|--------|-------|:----:|
| 1 | **Crafty** | 🪟 Windows | ⭐ 2.4 | Minecraft Log4j, RunasCs privesc | Log4Shell CVE-2021-44228 + RunasCs admin | ☐ |
| 2 | **Safe** | 🐧 Linux | ⭐ 2.9 | Binary exploitation, ROP chain, KeePass | Buffer overflow + ROP + KeePass database | ☐ |
| 3 | **RouterSpace** | 🐧 Linux | ⭐ 3.2 | APK analysis, command injection, sudo Baron Samedit | Android APK + API cmd injection + CVE-2021-3156 | ☐ |
| 4 | **Blunder** | 🐧 Linux | ⭐ 3.4 | Bludit brute bypass, sudo CVE-2019-14287 | X-Forwarded-For bypass + sudo -u#-1 bash | ☐ |
| 5 | **Admirer** | 🐧 Linux | ⭐ 3.4 | Adminer LOAD DATA, Python library hijack | Adminer MySQL read + shutil.make_archive override | ☐ |
| 6 | **Backdoor** | 🐧 Linux | ⭐ 3.6 | WordPress plugin LFI, gdbserver RCE | Ebook plugin LFI + /proc enum + gdbserver exploit | ☐ |
| 7 | **Haystack** | 🐧 Linux | ⭐ 3.8 | Elasticsearch, Kibana LFI, LogStash exec | ES data mining + Kibana CVE + LogStash filter RCE | ☐ |
| 8 | **Nest** | 🪟 Windows | ⭐ 3.9 | SMB deep enum, .NET decompile, ADS | SMB nested creds + VB.NET decrypt + NTFS ADS | ☐ |
| 9 | **TraceBack** | 🐧 Linux | ⭐ 4.0 | Web shell hunting, Lua sudo, motd write | Existing webshell + luvit sudo + motd file write | ☐ |
| 10 | **Frolic** | 🐧 Linux | ⭐ 4.0 | Esoteric languages, Playsms RCE, ret2libc | Ook/brainfuck decode + PlaySMS + BOF privesc | ☐ |
| 11 | **Teacher** | 🐧 Linux | ⭐ 4.1 | Moodle, command injection, MySQL creds | Moodle math formula injection + MySQL password | ☐ |
| 12 | **Explore** | 🤖 Android | ⭐ 4.2 | ES File Explorer CVE, ADB port forward | Android CVE-2019-6447 + ADB root | ☐ |
| 13 | **LinkVortex** | 🐧 Linux | ⭐ 4.3 | Ghost CMS, Git exposure, symlink archive | Ghost CVE + .git credential leak + symlink privesc | ☐ |
| 14 | **Alert** | 🐧 Linux | ⭐ 4.3 | XSS, LFI via Markdown, group file access | Stored XSS + Markdown LFI + website-manager group | ☐ |
| 15 | **Secret** | 🐧 Linux | ⭐ 4.3 | JWT secret leak, Git history, SUID coredump | Git log JWT secret + command injection + crash dump | ☐ |
| 16 | **ScriptKiddie** | 🐧 Linux | ⭐ 4.3 | MSFvenom APK template CVE, command injection | CVE-2020-7384 + log script injection | ☐ |
| 17 | **Remote** | 🪟 Windows | ⭐ 4.3 | NFS mount, Umbraco RCE, service abuse | NFS SDB file + Umbraco admin RCE + UsoSvc | ☐ |
| 18 | **Pandora** | 🐧 Linux | ⭐ 4.4 | SNMP creds, Pandora FMS SQLi+upload, PATH hijack | SNMPv1 walk + PandoraFMS chain + SUID path | ☐ |
| 19 | **Antique** | 🐧 Linux | ⭐ 4.4 | SNMP password leak, CUPS CVE | SNMP community string + printer service CVE | ☐ |
| 20 | **Horizontall** | 🐧 Linux | ⭐ 4.4 | Strapi RCE, port forwarding, Laravel RCE | Strapi CVE + chisel tunnel + Laravel debug RCE | ☐ |
| 21 | **LaCasaDePapel** | 🐧 Linux | ⭐ 4.4 | vsftpd backdoor, DALI certificate, SUID | FTP shell + client cert + Psy shell + supervisor | ☐ |
| 22 | **Paper** | 🐧 Linux | ⭐ 4.5 | WordPress draft leak, Rocket.Chat bot, Polkit CVE | WP ?static=1 + bot file read + CVE-2021-3560 | ☐ |
| 23 | **Nunchucks** | 🐧 Linux | ⭐ 4.5 | SSTI (Nunjucks), AppArmor bypass | Server-side template injection + cap_setuid Perl | ☐ |
| 24 | **Validation** | 🐧 Linux | ⭐ 4.5 | SQL injection to RCE, web shell write | Second-order SQLi + INTO OUTFILE webshell | ☐ |
| 25 | **Love** | 🪟 Windows | ⭐ 4.5 | SSRF, file scanner, AlwaysInstallElevated | SSRF internal port + voting admin + MSI privesc | ☐ |
| 26 | **Heist** | 🪟 Windows | ⭐ 4.5 | Cisco password crack, SID brute, process dump | Cisco type 5/7 + lookupsid + Firefox procdump | ☐ |
| 27 | **Precious** | 🐧 Linux | ⭐ 4.6 | pdfkit command injection, Ruby deserialization | PDFKit CVE + henry .bundle creds + YAML deserialize | ☐ |
| 28 | **NodeBlog** | 🐧 Linux | ⭐ 4.6 | NoSQL injection, Node deserialization | MongoDB auth bypass + serialize-javascript RCE | ☐ |
| 29 | **Driver** | 🪟 Windows | ⭐ 4.6 | SCF file upload, PrintNightmare | SCF NTLMv2 capture + CVE-2021-1675 | ☐ |
| 30 | **BountyHunter** | 🐧 Linux | ⭐ 4.6 | XXE injection, Python script analysis | XML external entity + sudo Python ticket validator | ☐ |
| 31 | **Delivery** | 🐧 Linux | ⭐ 4.6 | osTicket trick, Mattermost, hashcat rules | Email verification bypass + hash rule-based crack | ☐ |
| 32 | **SteamCloud** | 🐧 Linux | ⭐ 4.7 | Kubernetes, kubelet API, cloud enum | K8s pod listing + kubelet exec + service account | ☐ |
| 33 | **GoodGames** | 🐧 Linux | ⭐ 4.8 | SQL injection, SSTI, Docker escape | Flask SQLi + Jinja2 SSTI + Docker mount escape | ☐ |
| 34 | **Writeup** | 🐧 Linux | ⭐ 4.9 | CMS Made Simple SQLi, PATH hijack | CMSS blind SQLi + writable PATH + ssh-keygen | ☐ |

---

## 🔴 TIER 5: Zor Easy / Yeni Makineler

> Easy etiketi var ama medium gibi hissettirir. İleri seviye exploit chain'ler.

| # | Makine | OS | Rating | Skills | Notes | Done |
|:--:|--------|:--:|:------:|--------|-------|:----:|
| 1 | **ServMon** | 🪟 Windows | ⭐ 2.2 | FTP anonymous, NVMS directory traversal, NSClient | NVMS LFI + SSH creds + NSClient++ API privesc | ☐ |
| 2 | **Luanne** | 🖥️ Other | ⭐ 2.7 | Lua web injection, htpasswd, doas | NetBSD + bozohttpd + Lua library injection | ☐ |
| 3 | **Late** | 🐧 Linux | ⭐ 3.1 | Flask OCR SSTI, cron script append | Image-based SSTI + writable linpeas cron script | ☐ |
| 4 | **Omni** | 🖥️ Other | ⭐ 3.2 | Windows IoT SirepRAT, PSCredential decrypt | IoT core exploit + DPAPI credential decrypt | ☐ |
| 5 | **Sightless** | 🐧 Linux | ⭐ 3.5 | SQLPad CVE, Chrome debug port, Froxlor | CVE-2022-0944 + remote debugging + shadow read | ☐ |
| 6 | **Sea** | 🐧 Linux | ⭐ 3.5 | WonderCMS XSS+RCE, System Monitor command injection | CVE-2023-41425 + port forward + log reader RCE | ☐ |
| 7 | **Buff** | 🪟 Windows | ⭐ 3.5 | Gym Management RCE, Chisel tunnel, CloudMe BOF | PHP upload + port forward + CloudMe buffer overflow | ☐ |
| 8 | **Outbound** | 🐧 Linux | ⭐ 3.7 | Firewall bypass, egress filtering | Restrictive egress + creative tunneling + privesc | ☐ |
| 9 | **Spectra** | 🖥️ Other | ⭐ 3.7 | WordPress, autologin creds, initctl | ChromeOS + WP config + autologin passwd + init | ☐ |
| 10 | **Nocturnal** | 🐧 Linux | ⭐ 3.8 | IDOR, command injection, log file analysis | Web app IDOR + cmd injection + log-based privesc | ☐ |
| 11 | **Dog** | 🐧 Linux | ⭐ 3.8 | Backdrop CMS, Git credentials, sudo service | Backdrop RCE + git creds + sudo service manipulation | ☐ |
| 12 | **UnderPass** | 🐧 Linux | ⭐ 3.8 | SNMP enum, daloRADIUS, mosh sudo | SNMP user discovery + RADIUS portal + mosh-server | ☐ |
| 13 | **Toolbox** | 🪟 Windows | ⭐ 3.8 | SQL injection, Docker Toolbox, boot2docker | PostgreSQL SQLi + Docker Toolbox default key | ☐ |
| 14 | **Armageddon** | 🐧 Linux | ⭐ 3.8 | Drupalgeddon2 RCE, snap install privesc | CVE-2018-7600 + dirty_sock snap privesc | ☐ |
| 15 | **Planning** | 🐧 Linux | ⭐ 3.9 | Gitea enumeration, token abuse, container escape | Gitea repo secrets + service token + Docker escape | ☐ |
| 16 | **RedPanda** | 🐧 Linux | ⭐ 3.9 | SSTI (Spring), XXE-like image metadata attack | Java SSTI + log poisoning + XML author injection | ☐ |
| 17 | **Code** | 🐧 Linux | ⭐ 4.0 | Code editor sandbox escape, Git hooks | Online IDE breakout + Gitea repo + Git hook RCE | ☐ |
| 18 | **Doctor** | 🐧 Linux | ⭐ 4.0 | SSTI (Jinja2), Splunk forwarder RCE | Server-side template injection + SplunkWhisperer2 | ☐ |
| 19 | **VulnEscape** `VIP+` | 🪟 Windows | ⭐ 4.1 | Container escape, vulnerability chaining | VIP+ exclusive Windows machine | ☐ |
| 20 | **Shoppy** | 🐧 Linux | ⭐ 4.1 | NoSQL injection, subdomain enum, Docker group | Mattermost creds + NoSQLi + Docker socket | ☐ |
| 21 | **Trick** | 🐧 Linux | ⭐ 4.1 | DNS zone transfer, LFI, fail2ban abuse | AXFR + vhost + LFI + fail2ban action rewrite | ☐ |
| 22 | **Artificial** | 🐧 Linux | ⭐ 4.2 | AI/ML exploitation, model abuse | AI service exploitation + model manipulation | ☐ |
| 23 | **Photobomb** | 🐧 Linux | ⭐ 4.2 | Command injection, PATH/LD_PRELOAD hijack | Sinatra auth bypass + convert cmd injection + PATH | ☐ |
| 24 | **Laboratory** | 🐧 Linux | ⭐ 4.2 | GitLab CVE, Ruby deserialization, PATH hijack | GitLab arbitrary file read + RCE + SUID docker | ☐ |
| 25 | **9""Tabby** | 🐧 Linux | ⭐ 4.2 | Bilinmiyor: Writeup kontrol et | Detay icin IppSec/0xdf writeup bak | ☐ |
| 26 | **Editor** | 🐧 Linux | ⭐ 4.3 | Web editor exploitation, cron abuse | OSCP-like: editor service + cron + privilege escalation | ☐ |
| 27 | **Inject** | 🐧 Linux | ⭐ 4.3 | Spring framework LFI, CVE-2022-22963, cron Ansible | Directory traversal + Spring Cloud RCE + Ansible | ☐ |
| 28 | **EscapeTwo** | 🪟 Windows | ⭐ 4.4 | AD: MSSQL, NTLM relay, AD CS ESC1 | MSSQL xp_dirtree + cert template abuse + DCSync | ☐ |
| 29 | **CodePartTwo** | 🐧 Linux | ⭐ 4.4 | Code editor advanced, pivot, privesc chain | Part 1'in devami, daha karmasik chain | ☐ |
| 30 | **RetroTwo** `VIP+` | 🪟 Windows | ⭐ 4.4 | Legacy service exploitation | VIP+ exclusive Windows machine | ☐ |
| 31 | **Wifinetic** | 🐧 Linux | ⭐ 4.4 | FTP config files, wireless WPS reaver attack | FTP WiFi config + reaver WPS pin brute + root | ☐ |
| 32 | **PC** | 🐧 Linux | ⭐ 4.4 | gRPC enumeration, SQL injection, pyLoad CVE | gRPC service + SQLi + CVE-2023-0297 pyLoad RCE | ☐ |
| 33 | **9" "MonitorsTwo** | 🐧 Linux | ⭐ 4.5 | Bilinmiyor: Writeup kontrol et | Detay icin IppSec/0xdf writeup bak | ☐ |
| 34 | **Stocker** | 🐧 Linux | ⭐ 4.5 | NoSQL auth bypass, PDF SSRF/LFI, path wildcard | MongoDB bypass + HTML injection PDF + sudo path | ☐ |
| 35 | **Soccer** | 🐧 Linux | ⭐ 4.5 | Tiny File Manager, WebSocket SQLi, doas | File manager shell + WS blind SQLi + dstat plugin | ☐ |
| 36 | **Squashed** | 🐧 Linux | ⭐ 4.5 | NFS no_root_squash abuse, .Xauthority steal | NFS UID spoof + X11 screenshot capture | ☐ |
| 37 | **9" Previse** | 🐧 Linux | ⭐ 4.5 | Bilinmiyor: Writeup kontrol et | Detay icin IppSec/0xdf writeup bak | ☐ |
| 38 | **9" "TwoMillion** | 🐧 Linux | ⭐ 4.6 | Bilinmiyor: Writeup kontrol et | Detay icin IppSec/0xdf writeup bak | ☐ |
| 39 | **Forgotten** `VIP+` | 🐧 Linux | ⭐ 4.6 | Web app exploitation, credential recovery | VIP+ exclusive Linux machine | ☐ |
| 40 | **Reset** `VIP+` | 🐧 Linux | ⭐ 4.6 | Service exploitation, credential reset | VIP+ exclusive Linux machine | ☐ |
| 41 | **Retro** `VIP+` | 🪟 Windows | ⭐ 4.6 | Legacy Windows exploitation | VIP+ exclusive Windows machine | ☐ |
| 42 | **Down** `VIP+` | 🐧 Linux | ⭐ 4.6 | Service downtime exploitation | VIP+ exclusive Linux machine | ☐ |
| 43 | **9" "PermX** | 🐧 Linux | ⭐ 4.6 | Bilinmiyor: Writeup kontrol et | Detay icin IppSec/0xdf writeup bak | ☐ |
| 44 | **MetaTwo** | 🐧 Linux | ⭐ 4.6 | WordPress BookingPress SQLi, XXE, PGP decrypt | WP plugin SQLi + media XXE + PGP key decrypt | ☐ |
| 45 | **OpenSource** | 🐧 Linux | ⭐ 4.6 | Git exposure, pin bypass, Gitea hooks | Source code review + Werkzeug pin + Git hook RCE | ☐ |
| 46 | **9" "Timelapse** | 🪟 Windows | ⭐ 4.6 | Bilinmiyor: Writeup kontrol et | Detay icin IppSec/0xdf writeup bak | ☐ |
| 47 | **Manage** `VIP+` | 🐧 Linux | ⭐ 4.7 | Management interface exploitation | VIP+ exclusive Linux machine | ☐ |
| 48 | **Baby** `VIP+` | 🪟 Windows | ⭐ 4.8 | AD: LDAP anonymous, password reset, WinRM | VIP+ exclusive AD beginner machine | ☐ |
| 49 | **Lock** `VIP+` | 🪟 Windows | ⭐ 4.9 | Windows service exploitation | VIP+ exclusive Windows machine | ☐ |
| 50 | **Data** `VIP+` | 🐧 Linux | ⭐ 4.9 | Database exploitation, data exfiltration | VIP+ exclusive Linux machine | ☐ |

---

## 💡 Çözüm Stratejisi

1. **Her makineyi writeup olmadan dene**: En az 2-3 saat uğraş, sonra bak
2. **Not al**: Her makine için Obsidian'da ayrı sayfa oluştur: `[[HTB-MachineName]]`
3. **Nmap metodolojisi**: `nmap -sC -sV -p-` ile başla, her zaman full port scan
4. **Her tier'ı bitirmeden sonrakine geçme**: Temeli sağlam at
5. **Writeup sonrası tekrar çöz**: 1 hafta sonra writeup'sız tekrar dene
6. **LinPEAS/WinPEAS her zaman çalıştır**: Privesc checklist olarak kullan
7. **searchsploit**: Versiyon bulduktan sonra hemen `searchsploit <service version>`
8. **Günlük 1-2 makine**: Tutarlılık önemli, her gün en az 1 makine

## 📚 Faydalı Kaynaklar

| Kaynak | Link | Açıklama |
|--------|------|----------|
| TJNull OSCP Listesi | [Google Sheets](https://docs.google.com/spreadsheets/d/1dwSMIAPIam0PuRBkCiDI88pU3yzrqqHkDtBngUHNCw8/) | OSCP-like makine listesi |
| 0xdf Writeups | [0xdf.gitlab.io](https://0xdf.gitlab.io) | En kaliteli HTB writeup'ları |
| IppSec YouTube | [youtube.com/ippsec](https://youtube.com/ippsec) | Video walkthrough'lar |
| HackTricks | [book.hacktricks.xyz](https://book.hacktricks.xyz) | Pentest cheatsheet |
| GTFOBins | [gtfobins.github.io](https://gtfobins.github.io) | Linux SUID/sudo binary'leri |
| LOLBAS | [lolbas-project.github.io](https://lolbas-project.github.io) | Windows LOLBins |
| PayloadsAllTheThings | [GitHub](https://github.com/swisskyrepo/PayloadsAllTheThings) | Payload koleksiyonu |

## 🏷️ Tag'ler ile Arama

Makineleri teknik bazında aramak için:
- `#AD`: Active Directory makineleri
- `#SSRF`: SSRF exploit içerenler
- `#CVE`: Bilinen CVE exploit'leri
- `#BOF`: Buffer overflow içerenler
- `#WebApp`: Web uygulama exploitation
- `#PrivEsc`: İleri seviye privilege escalation

---
*Son güncelleme: Mart 2026 | Kaynak: HTB + TJNull + 0xdf + topluluk*
