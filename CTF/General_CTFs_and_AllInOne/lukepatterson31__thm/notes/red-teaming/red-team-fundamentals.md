# Red Team Fundamentals

### Vulnerability Assessment and Penetration Tests Limitations

A **Vulnerability Test**'s main objectives are to identify as many vulnerabilities in as many systems in 
the network as possible. The focus is to identify security issues without exploiting them so effective 
security measures can be deployed to protect the network

A **Penetration Test** attempts to exploit any vulnerabilities found and conduct post-exploitation tasks 
on a compromised machine in addition to identifying as many vulnerabilities as possible. While its focus
remains on identifying vulnerabilities and establishing measures to protect the network, it also 
considers the network as a whole ecosystem and how an attacker could profit from interactions between its 
components.

Pen tests are loud
Non-technical attack vectors may be overlooked (phishing, physical intrusion)
Relaxation of security measures (disabling or relaxing security mechanisms to accommodate time restraints)

Penetration tests differ from actual attacks

### Red Team Engagements

Red Team Engagements test the Blue Team's detection and response to a real threat actor. The Red Team 
emulate a real threat actor's TTPs to measure how well the Blue Team responds to them.

**Attack surfaces:**

- Technical infrastructure (emphasis on stealth and evasion)  
- Social Engineering  
- Physical Intrusion (lock picking, RFID cloning, etc.)  

**Types of excercise:**

- Full Engagement (simulate an attacker's full workflow)  
- Assumed Breach (user credentials or workstation access)  
- Table-top Exercise (theoretical scenarios)

### Teams and Functions of an Engagement

Definitions from https://redteam.guide

Teams:

[Blue Cell](https://redteam.guide/docs/definitions/#blue-cell)
[Red Cell](https://redteam.guide/docs/definitions/#red-cell)
[White Cell](https://redteam.guide/docs/definitions/#white-cell)

Roles:
[Red Team Lead](https://redteam.guide/docs/definitions/#red-team-lead)
[Red Team Operator](https://redteam.guide/docs/definitions/#red-team-operator)

### Engagement Structure

Standard Cyber Kill Chains:

- [Lockheed Martin Cyber Kill Chain](https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html)  
- [Unified Kill Chain](https://unifiedkillchain.com/)  
- [Varonis Cyber Kill Chain](https://www.varonis.com/blog/cyber-kill-chain/)  
- [Active Directory Attack Cycle](https://github.com/infosecn1nja/AD-Attack-Defense)  
- [MITRE ATT&CK Framework](https://attack.mitre.org/)  

Lockheed Martin Cyber Kill Chain components:

|Technique | Purpose | Examples |
|----------|---------|----------|
| Reconnaissance | Obtain information on the target | Harvesting emails, OSINT |
| Weaponization | Combine the objective with an exploit. Commonly results in a deliverable payload. |Exploit with backdoor, malicious office document |
| Delivery | How will the weaponized function be delivered to the target | Email, web, USB |
| Exploitation | Exploit the target's system to execute code | MS17-010, Zero-Logon, etc. |
| Installation | Install malware or other tooling | Mimikatz, Rubeus, etc. |
| Command & Control | Control the compromised asset from a remote central controller | Empire, Cobalt Strike, etc. |
| Actions on Objectives | Any end objectives: ransomware, data exfiltration, etc. | Conti, LockBit2.0, etc. |

### Overview of a Red Team Engagement

1. Planning the Engagement: White and red teams define goals that align with business risk scenarios  

2. Intelligence Gathering: The red team gathers as much information as they can about the target

- Technologies in use  
- List of employees  
- Information from social media  
- Photos  
- Any other usable information  

  Threat intelligence sources are used to check for APTs targeting similar companies.  
  They create a plan that includes several TTPs that fit the target and get approval from the white team.  

3. Emulating TTPs: The red team starts the campaign by emulating TTPs of the chosen APT  

4. Reporting and Analysis: After the exercise, the white, red, and blue teams meet and discuss how to improve the security of the target
