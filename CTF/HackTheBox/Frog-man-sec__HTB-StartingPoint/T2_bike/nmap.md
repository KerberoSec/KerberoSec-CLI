Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-07-16 12:15 +06
NSE: Loaded 156 scripts for scanning.
NSE: Script Pre-scanning.
Initiating NSE at 12:15
Completed NSE at 12:15, 0.00s elapsed
Initiating NSE at 12:15
Completed NSE at 12:15, 0.00s elapsed
Initiating NSE at 12:15
Completed NSE at 12:15, 0.00s elapsed
Initiating Ping Scan at 12:15
Scanning 10.129.124.162 [4 ports]
Completed Ping Scan at 12:15, 0.25s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 12:15
Completed Parallel DNS resolution of 1 host. at 12:15, 0.04s elapsed
Initiating SYN Stealth Scan at 12:15
Scanning 10.129.124.162 [65535 ports]
Discovered open port 22/tcp on 10.129.124.162
Discovered open port 80/tcp on 10.129.124.162
SYN Stealth Scan Timing: About 6.71% done; ETC: 12:23 (0:07:11 remaining)
Increasing send delay for 10.129.124.162 from 0 to 5 due to 1827 out of 4566 dropped probes since last increase.
Increasing send delay for 10.129.124.162 from 5 to 10 due to 11 out of 12 dropped probes since last increase.
SYN Stealth Scan Timing: About 8.43% done; ETC: 12:27 (0:11:03 remaining)
SYN Stealth Scan Timing: About 11.22% done; ETC: 12:28 (0:12:00 remaining)
SYN Stealth Scan Timing: About 15.29% done; ETC: 12:28 (0:11:10 remaining)
SYN Stealth Scan Timing: About 19.51% done; ETC: 12:28 (0:10:23 remaining)
SYN Stealth Scan Timing: About 23.70% done; ETC: 12:28 (0:09:43 remaining)
SYN Stealth Scan Timing: About 28.35% done; ETC: 12:27 (0:09:01 remaining)
SYN Stealth Scan Timing: About 32.69% done; ETC: 12:27 (0:08:23 remaining)
SYN Stealth Scan Timing: About 37.12% done; ETC: 12:27 (0:07:44 remaining)
SYN Stealth Scan Timing: About 42.14% done; ETC: 12:27 (0:07:06 remaining)
SYN Stealth Scan Timing: About 47.21% done; ETC: 12:27 (0:06:27 remaining)
SYN Stealth Scan Timing: About 52.35% done; ETC: 12:27 (0:05:48 remaining)
SYN Stealth Scan Timing: About 57.40% done; ETC: 12:27 (0:05:10 remaining)
SYN Stealth Scan Timing: About 62.61% done; ETC: 12:27 (0:04:31 remaining)
SYN Stealth Scan Timing: About 68.11% done; ETC: 12:27 (0:03:52 remaining)
SYN Stealth Scan Timing: About 73.42% done; ETC: 12:27 (0:03:13 remaining)
SYN Stealth Scan Timing: About 78.53% done; ETC: 12:27 (0:02:35 remaining)
SYN Stealth Scan Timing: About 83.76% done; ETC: 12:27 (0:01:58 remaining)
SYN Stealth Scan Timing: About 88.82% done; ETC: 12:27 (0:01:21 remaining)
SYN Stealth Scan Timing: About 94.18% done; ETC: 12:27 (0:00:43 remaining)
Completed SYN Stealth Scan at 12:27, 733.70s elapsed (65535 total ports)
Initiating Service scan at 12:27
Scanning 2 services on 10.129.124.162
Completed Service scan at 12:27, 6.51s elapsed (2 services on 1 host)
Initiating OS detection (try #1) against 10.129.124.162
Retrying OS detection (try #2) against 10.129.124.162
Retrying OS detection (try #3) against 10.129.124.162
Retrying OS detection (try #4) against 10.129.124.162
Retrying OS detection (try #5) against 10.129.124.162
Initiating Traceroute at 12:27
Completed Traceroute at 12:27, 0.23s elapsed
Initiating Parallel DNS resolution of 2 hosts. at 12:27
Completed Parallel DNS resolution of 2 hosts. at 12:27, 0.04s elapsed
NSE: Script scanning 10.129.124.162.
Initiating NSE at 12:27
Completed NSE at 12:28, 6.50s elapsed
Initiating NSE at 12:28
Completed NSE at 12:28, 0.94s elapsed
Initiating NSE at 12:28
Completed NSE at 12:28, 0.00s elapsed
Nmap scan report for 10.129.124.162
Host is up (0.23s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 48:ad:d5:b8:3a:9f:bc:be:f7:e8:20:1e:f6:bf:de:ae (RSA)
|   256 b7:89:6c:0b:20:ed:49:b2:c1:86:7c:29:92:74:1c:1f (ECDSA)
|_  256 18:cd:9d:08:a6:21:a8:b8:b6:f7:9f:8d:40:51:54:fb (ED25519)
80/tcp open  http    Node.js (Express middleware)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-title:  Bike 
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.94SVN%E=4%D=7/16%OT=22%CT=1%CU=35218%PV=Y%DS=2%DC=T%G=Y%TM=6696
OS:12F1%P=x86_64-pc-linux-gnu)SEQ(SP=106%GCD=1%ISR=10A%TI=Z%CI=Z%II=I%TS=A)
OS:OPS(O1=M539ST11NW7%O2=M539ST11NW7%O3=M539NNT11NW7%O4=M539ST11NW7%O5=M539
OS:ST11NW7%O6=M539ST11)WIN(W1=FE88%W2=FE88%W3=FE88%W4=FE88%W5=FE88%W6=FE88)
OS:ECN(R=Y%DF=Y%T=40%W=FAF0%O=M539NNSNW7%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S+%
OS:F=AS%RD=0%Q=)T2(R=N)T3(R=N)T4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T
OS:5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=
OS:Z%F=R%O=%RD=0%Q=)T7(R=Y%DF=Y%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%DF
OS:=N%T=40%IPL=164%UN=0%RIPL=G%RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=40
OS:%CD=S)

Uptime guess: 1.602 days (since Sun Jul 14 22:00:43 2024)
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=262 (Good luck!)
IP ID Sequence Generation: All zeros
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 554/tcp)
HOP RTT       ADDRESS
1   230.41 ms 10.10.14.1
2   231.74 ms 10.129.124.162

NSE: Script Post-scanning.
Initiating NSE at 12:28
Completed NSE at 12:28, 0.00s elapsed
Initiating NSE at 12:28
Completed NSE at 12:28, 0.00s elapsed
Initiating NSE at 12:28
Completed NSE at 12:28, 0.00s elapsed
Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 763.44 seconds
           Raw packets sent: 69420 (3.059MB) | Rcvd: 66638 (2.669MB)
