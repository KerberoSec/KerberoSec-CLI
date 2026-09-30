
#Subscribers 
https://tryhackme.com/room/trooper

A multinational technology company has been the target of several cyber attacks in the past few months. The attackers have been successful in stealing sensitive intellectual property and causing disruptions to the company's operations. A [threat advisory report](https://assets.tryhackme.com/additional/trooper-cti/APT_X_USBFerry.pdf) about similar attacks has been shared, and as a CTI analyst, your task is to identify the Tactics, Techniques, and Procedures (TTPs) being used by the Threat group and gather as much information as possible about their identity and motive. For this task, you will utilize the [OpenCTI](https://tryhackme.com/room/opencti) platform as well as the MITRE ATT&CK navigator, linked to the details below.

### APT Report 

```
# APT X

- What kind of phishing campaign does APT X use as part of their TTPs?

spear phishing emails 

- What is the name of the malware used by APT X?

USBferry 
attack, info steals via USB storage, USB trojan, program database

- What is the malware's STIX ID?

malware--5d0ea014-1ce9-5d5c-bcc7-f625a07907d0

- With the use of a USB, what technique did APT X use for initial access?

replication through removable media 

- What is the identity of APT X?

tropic trooper

- On OpenCTI, how many Attack Pattern techniques are associated with the APT?

counted attacks on MITRE, 39 

- What is the name of the tool linked to the APT?

BITSadmin

- Load up the Navigator. What is the sub-technique used by the APT under Valid Accounts?

local accounts

- Under what Tactics does the technique above fall? Order follows an attack kill chain.

initial access, persistence, defense evasion and provilege escalation

- What technique is the group known for using under the tactic Collection?

automated collection
```

![[Pasted image 20250304090628.png]]

