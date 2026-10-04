Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-08-01 13:12 +06
NSE: Loaded 156 scripts for scanning.
NSE: Script Pre-scanning.
Initiating NSE at 13:12
Completed NSE at 13:12, 0.00s elapsed
Initiating NSE at 13:12
Completed NSE at 13:12, 0.00s elapsed
Initiating NSE at 13:12
Completed NSE at 13:12, 0.00s elapsed
Initiating Ping Scan at 13:12
Scanning 10.129.249.238 [4 ports]
Completed Ping Scan at 13:12, 0.27s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 13:12
Completed Parallel DNS resolution of 1 host. at 13:12, 0.05s elapsed
Initiating SYN Stealth Scan at 13:12
Scanning 10.129.249.238 [2 ports]
Discovered open port 22/tcp on 10.129.249.238
Discovered open port 21/tcp on 10.129.249.238
Completed SYN Stealth Scan at 13:12, 0.28s elapsed (2 total ports)
Initiating Service scan at 13:12
Scanning 2 services on 10.129.249.238
Completed Service scan at 13:12, 1.51s elapsed (2 services on 1 host)
Initiating OS detection (try #1) against 10.129.249.238
Retrying OS detection (try #2) against 10.129.249.238
Initiating Traceroute at 13:12
Completed Traceroute at 13:12, 1.25s elapsed
Initiating Parallel DNS resolution of 2 hosts. at 13:12
Completed Parallel DNS resolution of 2 hosts. at 13:12, 4.05s elapsed
NSE: Script scanning 10.129.249.238.
Initiating NSE at 13:12
NSE: [ftp-bounce] PORT response: 500 Illegal PORT command.
Completed NSE at 13:12, 12.72s elapsed
Initiating NSE at 13:12
Completed NSE at 13:12, 2.75s elapsed
Initiating NSE at 13:12
Completed NSE at 13:12, 0.00s elapsed
Nmap scan report for 10.129.249.238
Host is up (0.24s latency).

PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_drwxr-xr-x    2 ftp      ftp          4096 Nov 28  2022 mail_backup
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to : ffff:10.10.14.14
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 1
|      vsFTPd 3.0.3: secure, fast, stable
|_End of status
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 48:ad:d5:b8:3a:9f:bc:be:f7:e8:20:1e:f6:bf:de:ae (RSA)
|   256 b7:89:6c:0b:20:ed:49:b2:c1:86:7c:29:92:74:1c:1f (ECDSA)
|_  256 18:cd:9d:08:a6:21:a8:b8:b6:f7:9f:8d:40:51:54:fb (ED25519)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Aggressive OS guesses: Linux 5.4 (96%), Linux 3.1 (95%), Linux 3.2 (95%), AXIS 210A or 211 Network Camera (Linux 2.6.17) (95%), ASUS RT-N56U WAP (Linux 3.4) (93%), Linux 3.16 (93%), Linux 4.15: 5.8 (93%), Linux 5.3: 5.4 (93%), Linux 2.6.32 (92%), Linux 5.0: 5.5 (92%)
No exact OS matches for host (test conditions non-ideal).
Uptime guess: 4.927 days (since Sat Jul 27 14:58:00 2024)
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=258 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 80/tcp)
HOP RTT       ADDRESS
1   241.83 ms 10.10.14.1
2   243.36 ms 10.129.249.238

NSE: Script Post-scanning.
Initiating NSE at 13:12
Completed NSE at 13:12, 0.00s elapsed
Initiating NSE at 13:12
Completed NSE at 13:12, 0.00s elapsed
Initiating NSE at 13:12
Completed NSE at 13:12, 0.00s elapsed
Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 28.54 seconds
           Raw packets sent: 65 (4.472KB) | Rcvd: 43 (3.188KB)
