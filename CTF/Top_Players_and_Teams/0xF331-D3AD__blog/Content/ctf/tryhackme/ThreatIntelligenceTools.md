
# Threat Intelligence Tools

## *UrlScan.io*

Search for it in the image above the questions

- What is TryHackMe's Cisco Umbrella Rank?

> 345612

- How many domains did UrlScan.io identify?

> 13

- What is the main domain registrar listed?

> NAMECHEAP INC

- What is the main IP address identified?

> 2606:4700:10: ac43:1b0a

---

## *Abuse.ch*

- The IOC 212.192.246.30:5555 is linked to which malware on ThreatFox?

The search term is ***ioc:212.192.246.30:5555***. Then click on the "Mirai" label
and look for the alias name.

> Katana

- Which malware is associated with the JA3 Fingerprint 51c64c77e60f3980eea90869b68c58a8 on SSL Blacklist?

> Dridex

- From the statistics page on URLHaus, what malware-hosting network has the ASN number AS14061? 

```bash
$ whois AS14061
```

> DIGITALOCEAN-ASN

- Which country is the botnet IP address 178.134.47.166 associated with according to FeodoTracker?

> Georgia

---

## *PhishTool*

- What organisation is the attacker trying to pose as in the email?

> LinkedIn

- What is the senders email address?

> darkabutla@sc500.whpservers.com

- What is the recipient's email address?

> cabbagecare@hotsmail.com

- What is the Originating IP address? Defang the IP address.

> 204[.]93[.]183[.]11

- How many hops did the email go through to get to the recipient?

> 4

---

## *Cisco Talos Intelligence*

- What is the listed domain of the IP address from the previous task?

> scnet.net

- What is the customer name of the IP address?

Checkout the whois info

> Complete Web Reviews

---

## *Scenario 1*

- According to Email2.eml, what is the recipient's email address?

> chris.lyons@supercarcenterdetroit.com

- From Talos Intelligence, the attached file can also be identified by the Detection Alias that starts with an H...

> HIDDENEXT/Worm.Gen

---

## *Scenario 2*

- What is the name of the attachment on Email3.eml?

> Sales_Receipt 5606.xls

- What malware family is associated with the attachment on Email3.eml?

Read carefully the "Detected aliases"

> Dridex
