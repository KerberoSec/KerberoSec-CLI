```terminal
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-07-16 11:12 +06
NSE: Loaded 156 scripts for scanning.
NSE: Script Pre-scanning.
Initiating NSE at 11:12
Completed NSE at 11:12, 0.00s elapsed
Initiating NSE at 11:12
Completed NSE at 11:12, 0.00s elapsed
Initiating NSE at 11:12
Completed NSE at 11:12, 0.00s elapsed
Initiating Ping Scan at 11:12
Scanning 10.129.124.90 [4 ports]
Completed Ping Scan at 11:12, 0.29s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 11:12
Completed Parallel DNS resolution of 1 host. at 11:12, 0.04s elapsed
Initiating SYN Stealth Scan at 11:12
Scanning 10.129.124.90 [65535 ports]
Discovered open port 80/tcp on 10.129.124.90
Increasing send delay for 10.129.124.90 from 0 to 5 due to 1663 out of 4156 dropped probes since last increase.
Increasing send delay for 10.129.124.90 from 5 to 10 due to 11 out of 22 dropped probes since last increase.
SYN Stealth Scan Timing: About 7.62% done; ETC: 11:19 (0:06:16 remaining)
SYN Stealth Scan Timing: About 9.38% done; ETC: 11:23 (0:09:50 remaining)
SYN Stealth Scan Timing: About 12.44% done; ETC: 11:24 (0:10:40 remaining)
SYN Stealth Scan Timing: About 16.74% done; ETC: 11:24 (0:10:02 remaining)
SYN Stealth Scan Timing: About 22.05% done; ETC: 11:24 (0:09:26 remaining)
SYN Stealth Scan Timing: About 28.23% done; ETC: 11:24 (0:08:49 remaining)
SYN Stealth Scan Timing: About 32.93% done; ETC: 11:24 (0:08:11 remaining)
SYN Stealth Scan Timing: About 37.79% done; ETC: 11:24 (0:07:31 remaining)
SYN Stealth Scan Timing: About 42.79% done; ETC: 11:24 (0:06:55 remaining)
SYN Stealth Scan Timing: About 47.94% done; ETC: 11:24 (0:06:16 remaining)
SYN Stealth Scan Timing: About 53.35% done; ETC: 11:24 (0:05:37 remaining)
SYN Stealth Scan Timing: About 58.24% done; ETC: 11:24 (0:05:00 remaining)
SYN Stealth Scan Timing: About 63.36% done; ETC: 11:24 (0:04:23 remaining)
SYN Stealth Scan Timing: About 68.57% done; ETC: 11:24 (0:03:45 remaining)
SYN Stealth Scan Timing: About 73.58% done; ETC: 11:24 (0:03:09 remaining)
SYN Stealth Scan Timing: About 78.71% done; ETC: 11:24 (0:02:32 remaining)
SYN Stealth Scan Timing: About 83.95% done; ETC: 11:24 (0:01:54 remaining)
SYN Stealth Scan Timing: About 89.33% done; ETC: 11:24 (0:01:16 remaining)
SYN Stealth Scan Timing: About 94.43% done; ETC: 11:24 (0:00:40 remaining)
Completed SYN Stealth Scan at 11:24, 723.09s elapsed (65535 total ports)
Initiating Service scan at 11:24
Scanning 1 service on 10.129.124.90
Completed Service scan at 11:24, 7.13s elapsed (1 service on 1 host)
Initiating OS detection (try #1) against 10.129.124.90
Retrying OS detection (try #2) against 10.129.124.90
Retrying OS detection (try #3) against 10.129.124.90
Retrying OS detection (try #4) against 10.129.124.90
Retrying OS detection (try #5) against 10.129.124.90
Initiating Traceroute at 11:24
Completed Traceroute at 11:24, 0.26s elapsed
Initiating Parallel DNS resolution of 2 hosts. at 11:24
Completed Parallel DNS resolution of 2 hosts. at 11:24, 0.04s elapsed
NSE: Script scanning 10.129.124.90.
Initiating NSE at 11:24
Completed NSE at 11:25, 5.21s elapsed
Initiating NSE at 11:25
Completed NSE at 11:25, 1.19s elapsed
Initiating NSE at 11:25
Completed NSE at 11:25, 0.00s elapsed
Nmap scan report for 10.129.124.90
Host is up (0.26s latency).
Not shown: 65534 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
80/tcp open  http    nginx 1.14.2
| http-methods: 
|_  Supported Methods: GET HEAD POST
|_http-title: Did not follow redirect to http://ignition.htb/
|_http-server-header: nginx/1.14.2
No exact OS matches for host (If you know what OS is running on it, see https://nmap.org/submit/ ).
TCP/IP fingerprint:
OS:SCAN(V=7.94SVN%E=4%D=7/16%OT=80%CT=1%CU=33275%PV=Y%DS=2%DC=T%G=Y%TM=6696
OS:042E%P=x86_64-pc-linux-gnu)SEQ(SP=102%GCD=1%ISR=10F%TI=Z%CI=Z%II=I%TS=A)
OS:SEQ(SP=FF%GCD=1%ISR=110%TI=Z%CI=Z%II=I%TS=A)OPS(O1=M539ST11NW7%O2=M539ST
OS:11NW7%O3=M539NNT11NW7%O4=M539ST11NW7%O5=M539ST11NW7%O6=M539ST11)WIN(W1=F
OS:E88%W2=FE88%W3=FE88%W4=FE88%W5=FE88%W6=FE88)ECN(R=Y%DF=Y%T=40%W=FAF0%O=M
OS:539NNSNW7%CC=Y%Q=)T1(R=Y%DF=Y%T=40%S=O%A=S+%F=AS%RD=0%Q=)T2(R=N)T3(R=N)T
OS:4(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T5(R=Y%DF=Y%T=40%W=0%S=Z%A=S+
OS:%F=AR%O=%RD=0%Q=)T6(R=Y%DF=Y%T=40%W=0%S=A%A=Z%F=R%O=%RD=0%Q=)T7(R=Y%DF=Y
OS:%T=40%W=0%S=Z%A=S+%F=AR%O=%RD=0%Q=)U1(R=Y%DF=N%T=40%IPL=164%UN=0%RIPL=G%
OS:RID=G%RIPCK=G%RUCK=G%RUD=G)IE(R=Y%DFI=N%T=40%CD=S)

Uptime guess: 15.555 days (since Sun Jun 30 22:06:11 2024)
Network Distance: 2 hops
TCP Sequence Prediction: Difficulty=255 (Good luck!)
IP ID Sequence Generation: All zeros

TRACEROUTE (using port 8080/tcp)
HOP RTT       ADDRESS
1   259.13 ms 10.10.14.1
2   259.19 ms 10.129.124.90

NSE: Script Post-scanning.
Initiating NSE at 11:25
Completed NSE at 11:25, 0.00s elapsed
Initiating NSE at 11:25
Completed NSE at 11:25, 0.00s elapsed
Initiating NSE at 11:25
Completed NSE at 11:25, 0.00s elapsed
Read data files from: /usr/bin/../share/nmap
OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 754.18 seconds
           Raw packets sent: 69725 (3.072MB) | Rcvd: 66349 (2.657MB)
```