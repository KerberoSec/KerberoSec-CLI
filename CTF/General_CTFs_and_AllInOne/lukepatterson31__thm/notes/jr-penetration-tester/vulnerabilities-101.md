# Vulnerabilities 101

### Introduction to Vulnerabilities

| Vulnerability | Description |
|---------------|-------------|
| OS |  Vulnerabilities found within OSs and often result in privesc |
| (Mis)Configuration-based | Vulnerabilities from a misconfigured application or service, e.g. a website exposing customer details |
| Weak or Default Credentials | Default credentials or no enforcing of strong passwords |
| Application Logic | Poorly designed applications e.g authentication mechanisms |
| Human-Factor | Vulnerabilities that leverage human behaviour e.g phishing |

### Scoring Vulnerabilities: CVSS & VPR

**Common Vulnerability Scoring System**

Awards points based on its features, availability and reproducibility.

1. How easy is it to exploit the vulnerability?
2. Do exploits exist for this?
3. How does this vulnerability interfere with the CIA triad?

[CVSS Calculator](https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator)

Qualitative Severity Rating Scale

| Rating   | Score      |
|----------|------------|
| None     | 0          |
| Low      | 0.1: 3.9  |
| Medium   | 4.0: 6.9  |
| High     | 7.0: 8.9  |
| Critical | 9.0: 10.0 |

Advantages of CVSS:

- CVSS een around for a long time
- CVSS is popular in organisations
- CVSS is a free framework and recommended by organisations such as NIST

Disadvantages of CVSS

- CVSS was never designed to help prioritise vulnerabilities, just to assign a value of 
severity
- CVSS heavily assesses vulnerabilities on an exploit being available. However only 20% of 
all vulnerabilities have an exploit available
- Vulnerabilities rarely change scoring after assessment despite the fact that new 
developments such as exploits may be found

**Vulnerability Priority Rating**

Risk-driven framework, vulnerabilities are given a score with a heavy focus on the risk it 
poses to the organisation itself rather than other factors like impact.

Scoring Range

| Rating   | Score      |
|----------|------------|
| Low      | 0: 3.9    |
| Medium   | 4.0: 6.9  |
| High     | 7.0: 8.9  |
| Critical | 9.0: 10.0 |

Advantages of VPR:

- VPR is a modern framework that is real-world
- VPR considers over 150 factors when calculating risk
- VPR is risk-driven and used by organisations to help prioritise patching vulnerabilities
- Scorings are not final and are very dynamic, meaning the priority a vulnerability should 
be given can change as it ages

Disadvantages of VPR:

- VPR is not open source like other vulnerability management frameworks
- VPR can only be adopted apart of a commercial platform
- VPR does not consider the CIA triad to the extent that CVSS does; meaning that risk to the 
confidentiality, integrity and availability of data does not play a large factor in scoring 
vulnerabilities when using VPR

### Vulnerability Databases

[National Vulnerability Database: NVD](https://nvd.nist.gov/vuln/full-listing)
[Exploit-DB](http://exploit-db.com/)

**NVD**

`CVE-YEAR-IDNUMBER`

**Exploit-DB**

Find PoC's for exploits
