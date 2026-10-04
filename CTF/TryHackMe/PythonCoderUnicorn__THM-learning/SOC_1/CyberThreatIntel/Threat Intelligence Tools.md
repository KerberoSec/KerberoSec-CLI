
- https://tryhackme.com/room/threatinteltools

#SecurityOperations #ThreatIntel 

- urlscan.io

## Abuse.ch

a research project hosted by the Institute for Cybersecurity and Engineering at the Bern University of Applied Sciences in Switzerland. It was developed to identify and track malware and botnets through several operational platforms developed under the project. These platforms are:

- **Malware Bazaar:**  A resource for sharing malware samples.
- **Feodo Tracker:**  A resource used to track botnet command and control (C2) infrastructure linked with Emotet, Dridex and TrickBot.
- **SSL Blacklist:**  A resource for collecting and providing a blocklist for malicious SSL certificates and JA3/JA3s fingerprints.
- **URL Haus:**  A resource for sharing malware distribution sites.
- **Threat Fox:**  A resource for sharing indicators of compromise (IOCs).

MALWARE BAZAAR
- malware samples database 
- malware hunting samples

URL HAUS
- malicious URLs database, hashes and filetypes

THREAT FOX
- indicators of malware in JSON and CSV format

- https://threatfox.abuse.ch/
- https://urlhaus.abuse.ch/
- https://sslbl.abuse.ch/
- https://feodotracker.abuse.ch/
- https://bazaar.abuse.ch/

```
Search through the ThreatFox database using the syntax ioc:<ip here> and you will find the malware alias name.

The IOC 212.192.246.30:5555 is identified under which malware alias name on ThreatFox?

ioc: 212.192.246.30
Malware = Katana (Mirai)

  
Which malware is associated with the JA3 Fingerprint 51c64c77e60f3980eea90869b68c58a8 on SSL Blacklist?

Malware = Dridex

  
From the statistics page on URLHaus, what malware-hosting network has the ASN number AS14061 ?

digitalocean-ASN

  
Which country is the botnet IP address 178.134.47.166 associated with according to FeodoTracker?

GE = georgia

```

## PhishTool

Start Machine

[PhishTool](https://www.phishtool.com/) seeks to elevate the perception of phishing as a severe form of attack and provide a responsive means of email security. Through email analysis, security analysts can uncover email IOCs, prevent breaches and provide forensic reports that could be used in phishing containment and training engagements.
- community edition
- enterprise edition
- email analysis , get metadata from phishing emails with explanations of actions
- OSINT intel and the TTPs used to evade security controls
- classification and reporting

You are a SOC Analyst and have been tasked to analyse a suspicious email, **Email1.eml**. To solve the task, open the email using **Thunderbird** on the attached VM, analyse it and answer the questions below.

```
cd ~/Desktop/Emails/
nano Email1.eml

What social media platform is the attacker trying to pose as in the email?

linkedin

What is the senders email address?

darkabutla@sc500.whpservers.com

What is the recipient's email address?

cabbagecare@hotsmail.com

What is the Originating IP address? Defang the IP address.

204[.]93[.]183[.]11

  
How many hops did the email go through to get to the recipient?

count the Received from
4

```

## Cisco Talos intel

Cisco Talos encompasses six key teams:

- **Threat Intelligence & Interdiction:** Quick correlation and tracking of threats provide a means to turn simple IOCs into context-rich intel.
- **Detection Research:** Vulnerability and malware analysis is performed to create rules and content for threat detection.
- **Engineering & Development:** Provides the maintenance support for the inspection engines and keeps them up-to-date to identify and triage emerging threats.
- **Vulnerability Research & Discovery:** Working with service and software vendors to develop repeatable means of identifying and reporting security vulnerabilities.
- **Communities:** Maintains the image of the team and the open-source solutions.
- **Global Outreach:** Disseminates intelligence to customers and the security community through publications.

dashboard = world map
vulnerability info
reputation center
email & spam data

```
cd ~/Desktop/Emails
nano Email1.eml

  
What is the listed domain of the IP address from the previous task?

whois 204.93.183.11 = scnet.net

  
What is the customer name of the IP address?

complete web reviews

```

## Scenario 1 & 2

**Scenario***: You are a SOC Analyst. Several suspicious emails have been forwarded to you from other coworkers. You must obtain details from each email to triage the incidents reported.   

**Task**: Use the tools and knowledge discussed throughout this room (or use your resources) to help you analyze **Email2.eml** found on the VM attached to **Task 5** and use the information to answer the questions.

```
Email2.eml

  
According to Email2.eml, what is the recipient's email address?

chris.lyons@supercarcenterdetroit.com

From Talos Intelligence, the attached file can also be identified by the Detection Alias that starts with an H...

HIDDENEXT/Worm.Gen

--------
Email3.eml

  
What is the name of the attachment on Email3.eml?

Sales_Receipt5606.xls

  
What malware family is associated with the attachment on Email3.eml?

dridex

```

- https://medium.com/@exploit_daily/tryhackme-threat-intelligence-tools-515036c96dbe

- https://medium.com/@WriteupsTHM_HTB_CTF/threat-intelligence-tools-b81e5782576b

