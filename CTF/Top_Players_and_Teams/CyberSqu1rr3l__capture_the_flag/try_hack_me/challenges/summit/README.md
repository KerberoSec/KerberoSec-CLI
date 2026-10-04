```
      ___           ___           ___           ___                             
     /  /\         /__/\         /__/\         /__/\        ___           ___   
    /  /:/_        \  \:\       |  |::\       |  |::\      /  /\         /  /\  
   /  /:/ /\        \  \:\      |  |:|:\      |  |:|:\    /  /:/        /  /:/  
  /  /:/ /::\   ___  \  \:\   __|__|:|\:\   __|__|:|\:\  /__/::\       /  /:/   
 /__/:/ /:/\:\ /__/\  \__\:\ /__/::::| \:\ /__/::::| \:\ \__\/\:\__   /  /::\   
 \  \:\/:/~/:/ \  \:\ /  /:/ \  \:\~~\__\/ \  \:\~~\__\/    \  \:\/\ /__/:/\:\  
  \  \::/ /:/   \  \:\  /:/   \  \:\        \  \:\           \__\::/ \__\/  \:\ 
   \__\/ /:/     \  \:\/:/     \  \:\        \  \:\          /__/:/       \  \:\
     /__/:/       \  \::/       \  \:\        \  \:\         \__\/         \__\/
     \__\/         \__\/         \__\/         \__\/                            
```
This THM challenge we chase a simulated adversary up the Pyramid of Pain until they
finally back down. Following the Pyramid of Pain's ascending priority of indicators, our
objective is to increase the simulated adversaries' cost of operations and chase them
away for good. Each level of the pyramid allows us to detect and prevent various
indicators of attack. [^1]

What is the first flag you receive after successfully detecting sample1.exe?
-----------------------------------------------------------------------------------------
After starting the target machine, we navigate to the provided link and discover an
interface with a mail application, malware sandbox, firewall manager, dns filter and
sigma rule builder. The first email describes the penetration test, we are about to
perform. Upon clicking on the attached `sample1.exe` executable, we are redirected to the
*Malware Sandbox* where we can submit the file for analysis on a *Windows 10x64 v1803*
system. The analysis results in suspicious activity to connect to an unusual port and
usage of Metasploit, leading to the assumption that this sample is a Trojan. Next, we
can copy the SHA256 value and paste it in the search bar of the *Detect Hashes* tab.
After entering the hash value for the malware sample and selecting the hash algorithm
SHA256, we have successfully added the potentially malicious file to the blocklist.
This has prevented `sample1.exe` from executing in the future by detecting its unique
hash value and we can check our mail for the flag and next steps.

What is the second flag you receive after successfully detecting sample2.exe?
-----------------------------------------------------------------------------------------
The new email informs us that solely relying on hashes for detection mechanisms is not
always enough as an adversary simply has to change a single bit in the file, and the
detection rule will fail. Again, we upload the `sample2.exe` in the *Malware Sandbox*,
but this time we investigate the network activity. In here, we find out that the malware
sample establishes connection to the *Autonomous System Number* (ASN) "Intrabuzz Hosting
Limited". Therefore, we want to prevent this HTTP request and copy the IP address to then
paste into the firewall rule destination IP. The firewall rule we want to create is going
to *deny* any outgoing, i.e. *egress*, traffic from *any* source IP to the malicious
destination IP address from the sample analysis. After having done this, we have set a
firewall rule that prevents `sample2.exe` from connecting to the penetration tester's
*command-and-control* (C2) server.

What is the third flag you receive after successfully detecting sample3.exe?
-----------------------------------------------------------------------------------------
The new mail in our inbox informs us that we successfully found the IP address to which
the malware sample was connected to. Now, we begin by scanning the new malware sample
`sample3.exe` in our malware sandbox. In the DNS requests, we find a suspicious domain
besides the `services[.]microsoft[.]com` that we copy for the DNS filter tab of
PicoSecure. While creating a new DNS rule, we also need to specify the rule name and a
matching category that the sample might belong to. Herefore, we simply select the
*malware* category as the trojan we investigated earlier does not have any other visible
use-case. Thus, we get the third flag in a new email.

What is the fourth flag you receive after successfully detecting sample4.exe?
-----------------------------------------------------------------------------------------
This time, we are informed, blocking hashes, IPs, or domains won't help us. Rather, we
want to detect what artifacts or changes the `sample4.exe` leaves on the victim's host
system. There are three modification events in the *Registry Activity* of the malware
analysis. The first one is performed by the `sample4.exe` process, whereas the other two
are performed by the `explorer.exe` and `notepad.exe`. We are obviously interested in the
modification, that the malware sample performs. It writes the value 1 to the following
key to disable real time monitoring:
`HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows Defender\Real-Time Protection`

In the *Sigma Rule Builder*, we can now create a new sigma rule to focus on *Sysmon Event
Logs* to monitor the malicious system activity. Therefore, we target one that detects
changes to registry keys or values, and select the *Registry Modifications* step. Now, we
input the target registry key from above and the name `DisableRealtimeMonitoring`. Note,
that the targeted registry value is 1 and the *ATT&CK ID* can be classified as `TA0005`,
i.e. Defense Evasion. The final sigma rule validation, can be seen as below and we are
prompted with the fourth flag and an `outgoing_connections.log` in a new email.

```
title:           Modification of Windows Defender Real-Time Protection
id:              windows_registry_defender_disable_realtime
description:     Detects modifications or creations of the Windows Defender Real-Time
                 Protection DisableRealtimeMonitoring registry value.
references:      https://attack.mitre.org/tactics/TA0005/
tags:            attack.ta0005, sysmon
object_name:     HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows Defender\Real-Time Protection
new_value:       DisableRealtimeMonitoring = 1
false_positives: Legitimate changes to Windows Defender settings.
level:           high
```

What is the fifth flag you receive after successfully detecting sample5.exe?
-----------------------------------------------------------------------------------------
The last step in the pyramid left us with logging information of the outgoing network
from the last 12 hours on the victim machine. One consistency, we can see, is that in a
thirty-minute interval there are data transfers from the source to the destination IP
address `51[.]102[.]10[.]19` of consistent 97 bytes, as highlighted in the following:
```
2023-08-15 09:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 09:23:45 | Source: 10.10.15.12 | Destination: 43.10.65.115 | Port: 443 | Size: 21541 bytes
2023-08-15 09:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 10:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 10:14:21 | Source: 10.10.15.12 | Destination: 87.32.56.124 | Port: 80  | Size: 1204 bytes
2023-08-15 10:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 11:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 11:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 11:45:09 | Source: 10.10.15.12 | Destination: 145.78.90.33 | Port: 443 | Size: 805 bytes
2023-08-15 12:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 12:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 13:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 13:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 13:32:17 | Source: 10.10.15.12 | Destination: 72.15.61.98  | Port: 443 | Size: 26084 bytes
2023-08-15 14:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 14:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 14:55:33 | Source: 10.10.15.12 | Destination: 208.45.72.16 | Port: 443 | Size: 45091 bytes
2023-08-15 15:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 15:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 15:40:10 | Source: 10.10.15.12 | Destination: 101.55.20.79 | Port: 443 | Size: 95021 bytes
2023-08-15 16:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 16:18:55 | Source: 10.10.15.12 | Destination: 194.92.18.10 | Port: 80  | Size: 8004 bytes
2023-08-15 16:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 17:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 17:09:30 | Source: 10.10.15.12 | Destination: 77.23.66.214 | Port: 443 | Size: 9584 bytes
2023-08-15 17:27:42 | Source: 10.10.15.12 | Destination: 156.29.88.77 | Port: 443 | Size: 10293 bytes
2023-08-15 17:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 18:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 18:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 19:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 19:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 20:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 20:30:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
2023-08-15 21:00:00 | Source: 10.10.15.12 | Destination: 51.102.10.19 | Port: 443 | Size: 97 bytes <-
```
Apart from that, we can not immediately recognize any suspicious behavior, so we proceed
to copy the source and destination address and move to the *Firewall Manager*. In here,
we can create a new IP firewall rule, but are informed that we'll have to "use something
different than firewall rules for this sample". Instead, we thus go to the *Sigma Rule
Builder* and create a rule that focuses on *Sysmon Event Logs*, specifically targeted at
*Network Connections*. This rule will detect network connections made from a host machine
with specific conditions, such as remote IP, port, size of the connection and how often
it occurs. At first, we enter values for the *Remote IP*, *Remote Port*, *Size* and
*Frequency*. But then we are informed, that the attacker has evolved. So, we do not
incorporate the IP address or port and just provide the size of 97 bytes every 30 minutes
which equals to 1800 seconds for any remote IP or port. Note, that the *ATT&CK ID* should
be classified to be *Command and Control (TA0011)* since this kind of traffic likely is
a consistent communication with the attacker's C2 server. After deploying this Sigma rule
we have annoyed Sphinx some more and received a flag.

What is the final flag you receive from Sphinx?
-----------------------------------------------------------------------------------------
In the new approach proposed by Sphinx, they attached the recorded command logs from all
previous samples to understand better what actions are performed on victims upon remote
access for subsequent information extraction.
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
Again, we want to build a sigma rule to detect the behavioural technique created by the
malware sample. Judging from the output of commands, we suspect the malware to copy its
output of command into a temporary logging file located at `%temp%\exfiltr8.log`. So, it
only makes sense to detect when this log file is created or modified. For that, we select
the *Sysmon Event Logs* and then *File Creation and Modification*. The file path is the
temporary folder `%temp%` (note, that our Sigma rule accepts `%APPDATA%`) and the file
name is `exfiltr8.log`. Further, the *ATT&CK ID* is classified to be *Collection (TA0009)*
in this case. Finally, this results in the last flag from Sphinx as they end the
penetration test now.

[^1]: https://tryhackme.com/room/summit
