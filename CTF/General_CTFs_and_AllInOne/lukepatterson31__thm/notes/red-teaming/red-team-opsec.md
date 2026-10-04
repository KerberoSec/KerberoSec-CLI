# Red Team OPSEC

OPSEC: Identify, control, and protect critical information

OPSEC process steps:

1. Identify critical information
2. Analyse threats
3. Analyse vulnerabilities
4. Assess risks
5. Apply appropriate countermeasures

### Critical Information Identification

Any information that might jeopardise your plans if leaked to an adversary

Examples:

- Client information that your team has learned
- Red team information (identities, activities, plans, capabilities, and limitations)
- TTPs used for adversary emulation
- OS, cloud hosting provider, or C2 framework
- Public IPs used by the red team
- Domain names your team has registered
- Hosted websites for adversary emulation

### Threat Analysis

Adapted from the [DoD OPSEC Manual](https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodm/520502m.pdf), threat analysis aims to answer:

1. Who is the adversary?
2. What are the adversary's goals?
3. What TTPs does the adversary use?
4. What critical information has the adversary obtained

A **threat** is an **adversary** with the **intent** and **capabilities** to take action that would 
prevent us from completing our operation

### Vulnerability Analysis

An OPSEC vulnerability exists when an adversary can obtain critical information, analyse the findings, 
and act in a way that would affect your plans

Examples:

Using a single public IP to conduct nmap scans, phishing campaigns and exploitation of targets. If the IP 
is blocked then any subsequent actions will fail

Using an unsecured database to store phishing victims data. If a malicious third party can access the DB 
then we compromise the client instead of helping them

### Risk Assessment

Risk assessment requires learning the possibility of an event taking place along with the expected cost 
of that event. This involves assessing the adversary’s ability to exploit the vulnerabilities.

Once the level of risk is determined, countermeasures can be considered to mitigate that risk. We need to 
consider the following three factors:

1. The efficiency of the countermeasure in reducing the risk
2. The cost of the countermeasure compared to the impact of the vulnerability being exploited.
3. The possibility that the countermeasure can reveal information to the adversary

### Countermeasures

Countermeasures are designed to prevent an adversary from detecting critical information, provide an 
alternative interpretation of critical information or indicators (deception), or deny the adversary’s 
collection system.

