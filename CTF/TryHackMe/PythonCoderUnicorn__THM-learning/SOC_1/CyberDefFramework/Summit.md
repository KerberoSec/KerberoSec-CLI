
https://tryhackme.com/r/room/summit

```
sample1.exe scanned

MD5	cbda8ae000aa9cbe7c8b982bae006c2a
SHA1	83d2791ca93e58688598485aa62597c0ebbf7610
SHA256	9c550591a25c6228cb7d74d970d133d75c961ffed2ef7180144859cc09efca8c

Menu > detect hashes > paste cbda8ae000aa9cbe7c8b982bae006c2a > add to block list

THM{f3cbf08151a11a6a331db9c6cf5f4fe4}

sample2.exe scanned

MD5	4d661bf605d6b0b15915a533b572a6bd
SHA1	6878976974c27c8547cfc5acc90fb28ad2f0e975
SHA256	d576245e85e6b752b2fdffa43abaab1b2e1383556b0169fd04924d6cebc1cdf9
PID	   Process	    Method	IP	
1927   sample2.exe	GET	    154.35.10.113:4444	
URL http://154.35.10.113:4444/uvLk8YI32
    40.97.128.3:443

PID 	Process 	IP 	          Domain 	         ASN
1927	sample2.exe	154.35.10.113:4444	-	Intrabuzz Hosting Limited
1927	sample2.exe	40.97.128.3:443	    -	Microsoft Corporation
1927	sample2.exe	40.97.128.4:443	    -	Microsoft Corporation

Menu > Firewall rule manager > add rule 

Type: Egress
Source IP: ANY
Destination IP: 154.35.10.113
Action: DENY

THM{2ff48a3421a938b388418be273f4806d}

sample3.exe  scanned 

MD5	e31f0c62927d9d5a897b4c45e3c64dbc
SHA1	a92d3de6b1e3ab295f10587ca75f15318cb85a7b
SHA256	acb9b1260bcd08a465f9f300ac463b9b1215c097ebe44610359bb80881fe6a05

```

![[Screen Shot 2025-01-11 at 1.08.16 PM.png]]

```
block that domain name
emudyn.bresonicz.info

Menu > DNS rule manager 

Rule Name: Sample3 C2 DOmain
Category: Malware
Domain Name: emudyn.bresonicz.info
Action: Deny

THM{4eca9e2f61a19ecd5df34c788e7dce16}

sample 4.exe scanned

MD5	5f29ff19d99fe244eaf5835ce01a4631
SHA1	cd12d2328f700ae1ba1296a5f011bfc5a49f456d
SHA256	a80cffb40cea83c1a20973a5b803828e67691f71f3c878edb5a139634d7dd422

```

![[Screen Shot 2025-01-11 at 1.18.33 PM.png]]

domain names changed and IPs
need to block a software command change
```
Key: HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows Defender\Real-Time Protection
Name: DisableRealtimeMonitoring

Menu > Sigma rule builder > new rule

1. Sysmon event logs
2. registry modification
3. registry modifications

Registry key: HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows Defender\Real-Time Protection
Registry name: DisableRealtimeMonitoring
Value: 1
ATT&CK ID: Defensive Evasion (TA0005)

THM{c956f455fc076aea829799c0876ee399}

```

now we have a `connections.log` 

```
2023-08-15 09:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes
2023-08-15 09:23:45 | Source: 10.10.15.12 | Destination: 43.10.65.115 | Port: 443 | Size: 21541 bytes
2023-08-15 09:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes
2023-08-15 10:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes
2023-08-15 10:14:21 | Source: 10.10.15.12 | Destination: 87.32.56.124 | Port: 80  | Size: 1204 bytes
2023-08-15 10:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes
2023-08-15 11:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes
2023-08-15 11:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes
2023-08-15 11:45:09 | Source: 10.10.15.12 | Destination: 145.78.90.33 | Port: 443 | Size: 805 bytes
2023-08-15 12:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes

...
```

start in ascending order , seems to be 30 min window between connections
need to use Sigma rule

```
1. Sysmon event logs
2. network connections
3. network connections

Remote IP: any
Remote Port: any
Size (bytes): 97
Frequency (seconds) : 1800
ATT&CK ID: Command & Control (TA0011)

THM{46b21c4410e47dc5729ceadef0fc722e}
```

we have `commands.log` file

```
dir c:\ >> %temp%\exfiltr8.log
dir "c:\Documents and Settings" >> %temp%\exfiltr8.log
dir "c:\Program Files\" >> %temp%\exfiltr8.log
dir d:\ >> %temp%\exfiltr8.log
net localgroup administrator >> %temp%\exfiltr8.log
ver >> %temp%\exfiltr8.log
systeminfo >> %temp%\exfiltr8.log
ipconfig /all >> %temp%\exfiltr8.log
netstat -ano >> %temp%\exfiltr8.log
net start >> %temp%\exfiltr8.log
```

system admins use these commands too so can't block them but temp file is rare

```
Menu > Sigma rules > new rule

1. Sysmon log 
2. file creation and modification
3. file creation and modification

File path: %temp%
File name: exfiltr8.log
ATT&CK ID: Exfiltration (TA0010)

Well, that's it. I have officially given up.

Throughout the engagement, you managed to chase me to the very top of the Pyramid of Pain, and I have to say, it's not fun up here!

You detected my samples file hashes, IPs, domains, host artifacts, tools, and now my own behavioural techniques! To continue, I have no choice but to completely retrain myself and conduct extensive research to figure out how you're catching me. And with that, I don't think you'll ever see me again. Enjoy the final flag; you've earned it!

Here's your flag: THM{c8951b2ad24bbcbac60c16cf2c83d92c}
```

