
# Cyber Kill Chain

The #CyberKillChain will help you understand and protect against:

- ransomware
- security breaches
- APTs
- assess your network & system by ID missing security controls, close gaps

knowing the cyber kills chain you will be able to recognize the intrusion attempts and understand the intruder's goals & objectives

### attack phases:
- Reconnaissance
- Weaponization
- Delivery
- Exploitation
- Installation
- Command & Control
- Actions on Objectives

## Reconnaissance

Reconnaissance is discovering and collecting information on the system and the victim. The reconnaissance phase is the planning phase for the adversaries.

OSINT
- The attacker needs to study the victim by collecting every available piece of information
- Email harvesting = the process of obtaining email addresses from public, paid, or free services. use emails to do phishing attack/ social engineering
- https://github.com/laramies/theHarvester
- https://hunter.io/
- https://osintframework.com/
- social media = linkedin, facebook, twitter, instagram

## Weaponization

- attack makes a `'weaponizer'` malware exploit to deliver payload custom malware
- malware = software to damage, disrupt, gain unauth access
- exploit = program that takes advantage of vulnerability/ flaw in app/ system
- payload = malicious code attacker runs on system
- attacker got a payload from dark web, now
- creates infected Microsoft Office document that has the malicious macro or Visual Basic for Apps scripts
- attacker creates a malicious payload or a worm implant on a USB drive then distributes them publicly
- attacker would choose Command & Control techniques for executing the commands on victim's machine or deliver more payloads
- Command & Control technique/method: https://attack.mitre.org/tactics/TA0011/
- attacker selects a backdoor implant

## Delivery

attacker decides to choose the method for transmitting the payload or the malware

- `phishing email` = craft a malicious email that would target either a specific person (`spearphishing `attack) or multiple people in the company that has the malware
- distribute USB drives in public
- `watering hole attack` = targeted attack designed to aim at a specific group of people by compromising the website they are usually visiting and then redirecting them to the malicious website of an attacker's choice. attacker would encourage the victims to visit the website by sending "harmless" emails pointing out the malicious URL to make the attack work more efficiently. After visiting the website, the victim would unintentionally download malware or a malicious application to their computer. This type of attack is called a drive-by download. {An example can be a malicious pop-up asking to download a fake Browser extension.}

## Exploitation

attacker made 2 phishing emails:
1. phishing link to fake Office 365 login page
2. macro attachment that runs ransomware when victim opens it

After gaining access to the system, the malicious actor could exploit software, system, or server-based vulnerabilities to escalate the privileges

the zero-day exploit or a zero-day vulnerability is an unknown exploit in the wild that exposes a vulnerability in software or hardware and can create complicated problems well before anyone realizes something is wrong. A zero-day exploit leaves NO opportunity for detection at the beginning.

## Installation

the backdoor lets an attacker bypass security measures and hide the access. A backdoor is also known as an access point.

access denied if:
- gets detected, initial access removed
- system gets patched

A persistent backdoor will let the attacker access the system he compromised in the past.

persistence via:
- install a webshell on webserver written in ASP, PHP or JSP (.php, .asp, .jsp) make detection hard
- install a backdoor on victim machine using Meterpreter
- create / modify Windows services to execute malicious scripts/ payloads. `sc.exe` lets you start stop query delete any windows service, use the name of a legit service to hide their malicious code
- adding the entry to the 'run keys' for malicious payload in the registry/start up folder which runs code whenever user logs in regardless of user account logged in

## Command and Control

After getting persistence and executing the malware on the victim's machine

- attacker opens up the C2 (Command and Control) channel through the malware to remotely control and manipulate the victim
- C2 Beaconing as a type of malicious communication between a C&C server and malware on the infected host.

The compromised endpoint would communicate with an external server set up by an attacker to establish a command & control channel. after a connection is made, the attacker has full control of victims machine

- traditionally Internet Relay Chat (IRC) was used
- protocols on HTTP port 80, 443 blends the malicious traffic with legit traffic
- infected machine makes a constant DNS requests to a DNS server that belongs to attacker (DNS tunneling)

#### actions on objectives

After going through six phases of the attack, "Megatron" can finally achieve his goals

- Collect the credentials from users.
- Perform privilege escalation (gaining elevated access like domain administrator access from a workstation by exploiting the misconfiguration).
- Internal reconnaissance (for example, an attacker gets to interact with internal software to find its vulnerabilities).
- Lateral movement through the company's environment.
- Collect and exfiltrate sensitive data.
- Deleting the backups and shadow copies. Shadow Copy is a Microsoft technology that can create backup copies, snapshots of computer files, or volumes.
- Overwrite or corrupt data.

#### Lab practice

cyber attack data breach nov 27 2013, 40m credit cards, target paid $18.5 m
steps in lab:
1. exploit public-facing application
2. data from local system
3. powershell
4. dynamic linker hijacking
5. spearphishing attachment

#flag  `THM{7HR347_1N73L_12_4w35om3}`

#### Reference

- https://medium.com/@haircutfish/tryhackme-cyber-kill-chain-room-a0ebcff024a9

