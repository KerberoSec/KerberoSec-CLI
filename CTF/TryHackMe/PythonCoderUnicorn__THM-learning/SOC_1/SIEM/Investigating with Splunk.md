
#Subscribers 
https://tryhackme.com/room/investigatingwithsplunk

SOC Analyst **Johny** has observed some anomalous behaviours in the logs of a few windows machines. It looks like the adversary has access to some of these machines and successfully created some backdoor. His manager has asked him to pull those logs from suspected hosts and ingest them into Splunk for quick investigation. Our task as SOC Analyst is to examine the logs and identify the anomalies.

To learn more about Splunk and how to investigate the logs, look at the rooms [splunk101](https://tryhackme.com/room/splunk101) and [splunk201](https://tryhackme.com/room/splunk201).

```
How many events were collected and Ingested in the index **main**?

12256

On one of the infected hosts, the adversary was successful in creating a backdoor user. What is the new username?

A1berto

On the same host, a registry key was also updated regarding the new backdoor user. What is the full path of that registry key?

HKLM\SAM\SAM\Domains\Account\Users\Names\A1berto

Examine the logs and identify the user that the adversary was trying to impersonate.

Alberto

What is the command used to add a backdoor user from a remote computer?

C:\windows\System32\Wbem\WMIC.exe" /node:WORKSTATION6 process call create "net user /add A1berto paw0rd1

How many times was the login attempt from the backdoor user observed during the investigation?

0

What is the name of the infected host on which suspicious Powershell commands were executed?

James.browne

PowerShell logging is enabled on this device. How many events were logged for the malicious PowerShell execution?

79

An encoded Powershell script from the infected host initiated a web request. What is the full URL?

hxxp[://]10[.]10[.]10[.]5/news[.]php

```

https://motasem-notes.net/cyber-incident-investigation-with-splunk-tryhackme-investigating-with-splunk/

![[Pasted image 20250315161811.png]]

270 points

