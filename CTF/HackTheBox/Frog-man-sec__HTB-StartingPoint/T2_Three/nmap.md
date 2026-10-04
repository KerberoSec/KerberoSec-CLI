```terminal
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-07-14 11:12 +06
NSE: Loaded 156 scripts for scanning.
NSE: Script Pre-scanning.
Initiating NSE at 11:12
Completed NSE at 11:12, 0.00s elapsed
Initiating NSE at 11:12
Completed NSE at 11:12, 0.00s elapsed
Initiating NSE at 11:12
Completed NSE at 11:12, 0.00s elapsed
Initiating Ping Scan at 11:12
Scanning 10.129.123.43 [4 ports]
Completed Ping Scan at 11:12, 0.26s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 11:12
Completed Parallel DNS resolution of 1 host. at 11:12, 0.01s elapsed
Initiating SYN Stealth Scan at 11:12
Scanning 10.129.123.43 [65535 ports]
Discovered open port 80/tcp on 10.129.123.43
Discovered open port 22/tcp on 10.129.123.43
SYN Stealth Scan Timing: About 6.48% done; ETC: 11:20 (0:07:27 remaining)
Increasing send delay for 10.129.123.43 from 0 to 5 due to 1891 out of 4727 dropped probes since last increase.
Increasing send delay for 10.129.123.43 from 5 to 10 due to 11 out of 12 dropped probes since last increase.
SYN Stealth Scan Timing: About 8.01% done; ETC: 11:25 (0:11:40 remaining)
SYN Stealth Scan Timing: About 10.91% done; ETC: 11:26 (0:12:23 remaining)
SYN Stealth Scan Timing: About 15.21% done; ETC: 11:25 (0:11:15 remaining)
SYN Stealth Scan Timing: About 21.92% done; ETC: 11:24 (0:08:58 remaining)
SYN Stealth Scan Timing: About 22.83% done; ETC: 11:25 (0:10:12 remaining)
SYN Stealth Scan Timing: About 23.91% done; ETC: 11:27 (0:11:12 remaining)
SYN Stealth Scan Timing: About 24.99% done; ETC: 11:28 (0:12:04 remaining)
SYN Stealth Scan Timing: About 29.34% done; ETC: 11:27 (0:10:53 remaining)
SYN Stealth Scan Timing: About 33.71% done; ETC: 11:27 (0:09:52 remaining)
SYN Stealth Scan Timing: About 38.02% done; ETC: 11:27 (0:09:00 remaining)
SYN Stealth Scan Timing: About 42.13% done; ETC: 11:26 (0:08:16 remaining)
SYN Stealth Scan Timing: About 46.61% done; ETC: 11:26 (0:07:31 remaining)
SYN Stealth Scan Timing: About 51.30% done; ETC: 11:26 (0:06:45 remaining)
SYN Stealth Scan Timing: About 55.92% done; ETC: 11:26 (0:06:03 remaining)
SYN Stealth Scan Timing: About 60.75% done; ETC: 11:26 (0:05:18 remaining)
SYN Stealth Scan Timing: About 66.02% done; ETC: 11:26 (0:04:34 remaining)
SYN Stealth Scan Timing: About 70.86% done; ETC: 11:25 (0:03:54 remaining)
SYN Stealth Scan Timing: About 76.06% done; ETC: 11:25 (0:03:11 remaining)
SYN Stealth Scan Timing: About 83.18% done; ETC: 11:25 (0:02:10 remaining)
SYN Stealth Scan Timing: About 86.67% done; ETC: 11:27 (0:01:59 remaining)
SYN Stealth Scan Timing: About 92.01% done; ETC: 11:28 (0:01:14 remaining)
Completed SYN Stealth Scan at 11:28, 928.26s elapsed (65535 total ports)
Initiating Service scan at 11:28
Scanning 2 services on 10.129.123.43
Completed Service scan at 11:28, 6.51s elapsed (2 services on 1 host)
Initiating OS detection (try #1) against 10.129.123.43
Retrying OS detection (try #2) against 10.129.123.43
Retrying OS detection (try #3) against 10.129.123.43
Retrying OS detection (try #4) against 10.129.123.43
Retrying OS detection (try #5) against 10.129.123.43
Initiating Traceroute at 11:28
Completed Traceroute at 11:28, 0.23s elapsed
Initiating Parallel DNS resolution of 2 hosts. at 11:28
Completed Parallel DNS resolution of 2 hosts. at 11:28, 0.01s elapsed
NSE: Script scanning 10.129.123.43.
Initiating NSE at 11:28
Completed NSE at 11:28, 7.09s elapsed
Initiating NSE at 11:28
Completed NSE at 11:28, 1.48s elapsed
Initiating NSE at 11:28
Completed NSE at 11:28, 0.00s elapsed
Nmap scan report for 10.129.123.43
Host is up (0.21s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 17:8b:d4:25:45:2a:20:b8:79:f8:e2:58:d7:8e:79:f4 (RSA)
|   256 e6:0f:1a:f6:32:8a:40:ef:2d:a7:3b:22:d1:c7:14:fa (ECDSA)
|_  256 2d:e1:87:41:75:f3:91:54:41:16:b7:2b:80:c6:8f:05 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-title: The Toppers
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.94SVN%E=4%D=7/14%OT=22%CT=1%CU=31975%PV=Y%DS=2%DC=T%G=Y%TM=6693
OS:6202%P=x86_64-pc-linux-gnu)SEQ(SP=FB%GCD=1%ISR=10A%TI=Z%CI=Z%II=I%TS=A)O
OS:PS(O1=M539ST11NW7%O2=M539ST11NW7%O3=M539NNT11NW7%O4=M539ST11NW7%O5=M539S
OS:T11NW7%O6=M539ST11)WIN(W1=FE88%W2=FE88%W3=FE88%W4=FE88%W5=FE88%W6=FE88)E
OS:CN(R=Y%DF=Y%T=40%W=FAF0%O=M539NNSNW7%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S+%F
OS:=AS%RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5
OS:(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z
OS:%F=R%O=%RD=0%Q=)T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%DF=
OS:N%T=40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=40%
OS:CD=S)

Uptime guess: 37.685 days (since Thu Jun  6 19:01:32 2024)
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=251 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 80/tcp)
HOP RTT       ADDRESS
1   223.20 ms 10.10.14.1
2   223.03 ms 10.129.123.43

NSE: Script Post-scanning.
Initiating NSE at 11:28
Completed NSE at 11:28, 0.00s elapsed
Initiating NSE at 11:28
Completed NSE at 11:28, 0.00s elapsed
Initiating NSE at 11:28
Completed NSE at 11:28, 0.00s elapsed
Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 959.98 seconds
           Raw packets sent: 74356 (3.276MB) | Rcvd: 96311 (10.199MB)
```