
- https://tryhackme.com/room/opencti

#ThreatIntel #SecurityOperations 

Cyber Threat Intelligence is typically a managerial mystery to handle, with organisations battling with how to input, digest, analyse and present threat data in a way that will make sense.

[OpenCTI](https://github.com/OpenCTI-Platform/opencti) is another open-sourced platform designed to provide organisations with the means to manage CTI through the storage, analysis, visualisation and presentation of threat campaigns, malware and IOCs.

OpenCTI Data Model

Structured Threat Info Expression (STIX2) is serialized and standardized language format used in threat intel exchange 

```
start machine
http://10.10.94.120:8080

info@tryhack.io
TryHackMe1234

4H RAT = putter panda

Arsenal > Attack patterns > search Command-Line Interface 
16 results
T0807 
kill chain phase = execution-ics

Activities > Observations (for indicators)

```

dashboard 2

```
Arsenal > search: Cobalt Strike

Knowledge > (side bar) Intrusion Sets > filter by Confidence 'Good'

CopyKittens, FIN7

author= the mitre corporation

```

investigative scenario 

As a SOC analyst, you have been tasked with investigations on malware and APT groups rampaging through the world. Your assignment is to look into the **CaddyWiper** malware and **APT37** group. Gather information from OpenCTI to answer the following questions.

```
  
What is the earliest date recorded related to CaddyWiper?  Format: YYYY/MM/DD

2022/03/15

attack technique 

knowledge > Attack patterns > execution

native api

how many malware relations linked

native api > knowledge tab = 113

Which 3 tools were used by the Attack Technique in 2016? (Ans: Tool1, Tool2, Tool3)

bloodhound, empire, shimratreporter

What country is APT37 associated with?

threats > intrusion sets > apt37 = north korea

  
Which Attack techniques are used by the group for initial access? (Ans: Technique1, Technique2)

initial access:
T1189,T1566

```

