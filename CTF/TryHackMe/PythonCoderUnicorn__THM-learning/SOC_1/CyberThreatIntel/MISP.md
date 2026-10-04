- https://tryhackme.com/room/misp

#ThreatIntel #SecurityOperations 

MISP: MALWARE INFORMATION SHARING PLATFORM

open-source threat information platform that facilitates the collection, storage and distribution of threat intelligence and Indicators of Compromise (IOCs) related to malware, cyber attacks, financial fraud or any intelligence within a community of trusted members.

MISP is effectively useful for the following use cases:
- **Malware Reverse Engineering**: Sharing of malware indicators to understand how different malware families function.
- **Security Investigations:** Searching, validating and using indicators in investigating security breaches.
- **Intelligence Analysis:** Gathering information about adversary groups and their capabilities.
- **Law Enforcement:** Using Indicators to support forensic investigations.
- **Risk Analysis:** Researching new threats, their likelihood and occurrences.
- **Fraud Analysis:** Sharing of financial indicators to detect financial fraud

MISP functionalities:
- IOC database
- automatic correlation ID relationships attributes and malware indicators
- data sharing 
- import & export features 
- event graph
- API support 

MISP terms
- **Events:** Collection of contextually linked information.
- **Attributes:** Individual data points associated with an event, such as network or system indicators.
- **Objects:** Custom attribute compositions.
- **Object References:** Relationships between different objects.
- **Sightings:** Time-specific occurrences of a given data point or attribute detected to provide more credibility.
- **Tags:** Labels attached to events/attributes.
- **Taxonomies:** Classification libraries are used to tag, classify and organise information.
- **Galaxies:** Knowledge base items used to label events/attributes.
- **Indicators:** Pieces of information that can detect suspicious or malicious cyber activity.

```
start machine
https://10-10-228-138.p.thmlabs.com/

Username: Analyst@THM.thm
Password: Analyst12345&

Home > Add Event > Distribution (drop down) = 4

organisation admin = role to publish events
```

[CIRCL](https://www.circl.lu/) (Computer Incident Respons Center Luxembourg) published an event associated with PupyRAT infection. Your organisation is on alert for remote access trojans and malware in the wild, and you have been tasked to investigate this event and correlate the details with your SIEM. Use what you have learned from the room to identify the event and complete this task.

```
List Events > filter: pupyrat

ID = 1145

  
The event is associated with the adversary gaining
remote access

  
What IP address has been mapped as the PupyRAT C2 Server

89.107.62.39

  
From the Intrusion Set Galaxy, what attack group is known to use this form of attack?

Tags: magic hound

taxonomy tag level 50
osint

```

