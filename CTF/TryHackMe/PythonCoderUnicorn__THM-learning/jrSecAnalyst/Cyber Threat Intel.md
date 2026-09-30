
# Cyber Threat Intelligence

Cyber Threat Intelligence (CTI) can be defined as evidence-based knowledge about adversaries, including their indicators, tactics, motivations, and actionable advice against them. These can be utilized to protect critical assets and inform cyber security teams and management business decisions.

- data = info = intelligence
- data (IP address)
- info (data points)
- intelligence (correlation of data & info => patterns)

The primary goal of CTI is to understand the relationship between your operational environment and your adversary and how to defend your environment against any attacks

- Who’s attacking you?
- What are their motivations?
- What are their capabilities?
- What artefacts and indicators of compromise (IOCs) should you look out for?

Internal:
- Corporate security events such as vulnerability assessments and incident response reports.
- Cyber awareness training reports.
- System logs and events.

Community:
- Open web forums.
- Dark web communities for cybercriminals.

External
- Threat intel feeds (Commercial & Open-source)
- Online marketplaces.
- Public sources include _government data, publications, social media, financial and industrial assessments_.

## Threat Intelligence Classifications

- `Strategic Intel`: High-level intel that looks into the organization’s threat landscape and maps out the risk areas based on trends, patterns and emerging threats that may impact business decisions.

- `Technical Intel`: Looks into evidence and artefacts of attack used by an adversary. Incident Response teams can use this intel to create a baseline attack surface to analyze and develop defence mechanisms.

- `Tactical Intel`: Assesses adversaries’ tactics, techniques, and procedures (TTPs). This intel can strengthen security controls and address vulnerabilities through real-time investigations.

- `Operational Intel`: Looks into an adversary’s specific motives and intent to perform an attack. Security teams may use this intel to understand the critical assets available in the organization (people, processes and technologies) that may be targeted.

### Direction

Every threat intel program requires to have objectives and goals defined, involving identifying the following parameters:
- Information assets and business processes that require defending.
- Potential impact to be experienced on losing the assets or through process interruptions.
- Sources of data and intel to be used towards protection.
- Tools and resources that are required to defend the assets.

This phase also allows security analysts to pose questions related to investigating incidents.

- data collection 
- data processing
- data analysis = define attack plan, patterns
- data dissemination = share intelligence of TTP and IOCs

## Framework

- ATT&CK framework
- [Trusted Automated Exchange of Intelligence Information (TAXII™)](https://oasis-open.github.io/cti-documentation/taxii/intro)
- [Structured Threat Information Expression (STIX™) ](https://oasis-open.github.io/cti-documentation/stix/intro)
- 

### Diamond Model

- Adversary: The focus here is on the threat actor behind an attack and allows analysts to identify the motive behind the attack.

	Adversary Operator = “hacker”
    Adversary Customer = benefit from the activity conducted in the intrusion, person or group

- Victim: The opposite end of adversary looks at an individual, group or organization affected by an attack.

	Victim Personae are the people and organizations being targeted and whose assets are being attacked and exploited.

- Infrastructure: The adversaries' tools, systems, and software to conduct their attack are the main focus. Additionally, the victim's systems would be crucial to providing information about the compromise.

	infrastructure = IP addresses, domain names, email addresses, or even a malicious USB device
	
	Type 1 Infrastructure = infrastructure controlled or owned by the adversary.

    Type 2 Infrastructure = controlled by an intermediary. Sometimes the intermediary might or might not be aware of it. purpose of obfuscating the source and attribution of the activity (malware staging servers, malicious domain names, compromised email accounts, etc.)

- Capabilities: The focus here is on the adversary's approach to reaching its goal. This looks at the means of exploitation and the TTPs implemented across the attack timeline.

	adversary’s tactics, techniques, and procedures (TTPs).
	Adversary Arsenal is a set of capabilities that belong to an adversary

## event meta features

Six possible meta-features can be added to the Diamond Model.

Meta-features are not required, but they can add some valuable information or intelligence to the Diamond Model.
- timestamp = date & time of the event, help determine the patterns and group malicious activity
- phase = phases of intrusion, attack, breach "every malicious activity contains 2+ phases which must be successfully executed in succession to achieve the desired result". malicious activities do not occur as single events but sequences

The phases can be:
1. Reconnaissance
2. Weaponization
3. Delivery
4. Exploitation
5. Installation
6. Command & Control
7. Actions on Objective

- result = results and post-conditions of an adversary’s operations will not always be known, It is crucial to capture the results and post-conditions of an adversary's operations. 
- The event results can be labelled as "success," "failure," or "unknown." or CIA (confidentiality, integrity, and availability) triad
- direction = describe host-based and network-based events and represents the direction of the intrusion attack.

### Intrusion Analysis 

defines seven potential values for this meta-feature:

- Victim-to-Infrastructure, Infrastructure-to-Victim, Infrastructure-to-Infrastructure, Adversary-to-Infrastructure, Infrastructure-to-Adversary, Bidirectional or Unknown.
- methodology = general classification of intrusion, for example, phishing, DDoS, breach, port scan, etc
- resources = every intrusion event needs 1+ external resources to be satisfied to succeed.

```
1. software (e.g., operating systems, virtualization software, or Metasploit framework)

2. knowledge (e.g., how to use Metasploit to execute the attack and run the exploit)

3. information (e.g., a username/password to masquerade)

4. hardware (e.g., servers, workstations, routers)

5. funds (e.g., money to purchase domains)

6. facilities (e.g., electricity or shelter)

7. access (e.g., a network path from the source host to the victim and vice versa, network access from (ISP))
```

### social-political component

The social-political component describes the needs and intent of the adversary

- financial gain, gaining acceptance in the hacker community, hacktivism, or espionage.
- victim provides a “product”, for example, computing resources & bandwidth as a zombie in a botnet for crypto mining

### technology component

- The capability and infrastructure describe how the adversary operates and communicates.
- A scenario can be a watering-hole attack which is a methodology where the adversary compromises legitimate websites that they believe their targeted victims will visit.

Junior Security Analysts play a crucial role, triaging on the ongoing alerts by exploring and understanding how a certain attack works and preventing bad things from happening if they can

- how
- when
- why

#flag `THM{UNTIL-WE-MEET-AGAIN}`

# MITRE

MITRE researches in many areas, outside of cybersecurity
- `APT` = Advanced Persistent Threat. (threat group | nation-state group) that attacks orgs and countries
- [Mandiant APTs](https://www.mandiant.com/resources/insights/apt-groups)
  - `TTP`=  Tactics (attackers goal / objective), Techniques (the how), and Procedures (the techniques)

there are 14 categories. Each category contains the techniques an adversary could use to perform the tactic. The categories cover the seven-stage Cyber Attack Lifecycle
- [Phishing techniques](https://attack.mitre.org/techniques/T1566/)
- CAR [Cyber Analytics Repository {MITRE}](https://car.mitre.org/analytics/CAR-2020-09-001/)
- [MITRE analytics](https://car.mitre.org/analytics/)

MITRE Engage is considered an Adversary Engagement Approach. This is accomplished by the implementation of Cyber Denial and Cyber Deception.
- https://engage.mitre.org/starter-kit/
- [practical guide to adversary engagement](https://engage.mitre.org/wp-content/uploads/2022/04/EngageHandbook-v1.0.pdf)
- [MITRE Matrix](https://engage.mitre.org/matrix/)
- [MITRE Defend](https://d3fend.mitre.org/)

## attack emulation plans

MITRE formed an organization named The Center of Threat-Informed Defence (CTID).
- [Medium: Emulation Plan](https://medium.com/mitre-engenuity/introducing-the-all-new-adversary-emulation-plan-library-234b1d543f6b)
- [APT3: Emulation plan](https://attack.mitre.org/resources/adversary-emulation-plans/)
- [GitHub: Emulation Library](https://github.com/center-for-threat-informed-defense/adversary_emulation_library)
- [GitHub emulation library](https://github.com/center-for-threat-informed-defense/adversary_emulation_library/tree/master/apt29)

  

## reference

- https://www.pyaeheinnkyaw.tech/tryhackme-mitre-room-writeup/

