# TryHackMe Room: Search Skills

## Overview

- **Platform:** TryHackMe
- **Room:** Search Skills
- **Difficulty:** Easy
- **Category:** Security Research / OSINT / Threat Intelligence
- **Status:** Completed
- **Environment:** Authorized TryHackMe laboratory
- **Tasks:** 6/6
- **Points:** 40

## Objective

The Search Skills room demonstrates how security professionals can use
publicly available search and research resources to investigate hosts,
malware, vulnerabilities, technical documentation, and security research.

The exercise focuses on developing practical research skills using:

- Shodan-style host and service discovery
- VirusTotal-style malware analysis
- CVE and vulnerability databases
- Linux manual pages
- GitHub security research

The objective is not simply to find information, but to understand how
security analysts can collect, validate, interpret, and safely use publicly
available security information.

## Environment

All activities documented in this report were performed within the
authorized TryHackMe laboratory environment.

The room used simulated security-research resources representing common
industry tools and information sources.

No unauthorized systems were targeted.

Challenge flags, passwords, tokens, private keys, and other sensitive
authentication material are intentionally excluded from this report.

## Initial Observations

The room introduced several complementary security-research workflows.

The initial tasks demonstrated that different information sources answer
different investigative questions:

1. Internet-facing asset and service information
2. Malware file reputation
3. Vulnerability severity and technical details
4. Command-line technical documentation
5. Public security research and proof-of-concept code

A key observation was that effective security research requires both
information retrieval and interpretation. Search results should be validated
and considered in their appropriate security context rather than accepted
without analysis.

## Enumeration

### 1. Internet-Facing Asset Enumeration

The first investigation used a Shodan-style search interface to identify
internet-facing infrastructure associated with the search term `apache`.

The simulated search returned the following relevant information:

- **Target IP:** `185.243.115.47`
- **Location:** Amsterdam, Netherlands
- **ISP:** DigitalOcean, LLC
- **ASN:** AS14061
- **Hostname:** `webserver-tryhackme`
- **Domain:** `tryhackme.thm`
- **Web Server:** Apache/2.4.58 (Ubuntu)
- **PHP Version:** 8.2.10
- **Open Port:** TCP/443
- **HTTP Status:** `200 OK`

The search demonstrated how internet-facing services can expose useful
information about hosts, technologies, and infrastructure.

The domain associated with the simulated host was identified as:

`tryhackme.thm`

#### Security Significance

This type of information can be useful during authorized attack-surface
discovery and defensive asset inventory.

From a SOC perspective, similar data can help security teams identify:

- Internet-facing services
- Unexpected exposed infrastructure
- Technology and software versions
- Potentially outdated services
- Assets that require vulnerability assessment

The information should be treated as reconnaissance data rather than proof
of compromise.

### 2. Malware Intelligence Enumeration

The second investigation used a VirusTotal-style malware analysis interface
to examine the simulated file:

`invoice_payment.exe`

The file received the following simulated reputation result:

- **Detection:** `52 / 72`
- **Classification:** `MALICIOUS`
- **Community Score:** `-15`

Multiple security vendors identified the sample as malicious or associated
with Agent Tesla / information-stealing malware.

Example vendor classifications included:

- Microsoft: Trojan:Win32/AgentTesla.AX!MTB
- Kaspersky: Trojan-Spy.Win32.AgentTesla.gen
- Norton: Infostealer.AgentTesla
- Malwarebytes: Spyware.AgentTesla.Generic
- ESET-NOD32: Win32/Spy.AgentTesla.BK
- Avast: Win32:Spyware-gen [Spy]
- Sophos: Troj/AgentTsl-T
- CrowdStrike Falcon: win/malicious_confidence_100

#### Security Significance

A multi-engine detection result provides strong evidence that a suspicious
file should be treated as potentially malicious.

However, a reputation result should normally be combined with additional
evidence such as:

- File hashes
- Static analysis
- Behavioral analysis
- Network indicators
- Process activity
- Endpoint telemetry
- Email or download source
- Related threat intelligence

In a SOC environment, this type of analysis can support initial malware
triage and incident investigation.

### 3. Vulnerability Enumeration

The third investigation examined the simulated vulnerability record:

`CVE-2026-1337`

The database identified the vulnerability as:

- **Severity:** `CRITICAL`
- **Published:** January 22, 2026
- **Modified:** February 15, 2026
- **CVSS:** `10/10`
- **CWE:** CWE-89: SQL Injection
- **Affected Software:** Apache WebPortal 3.2.0-3.4.5
- **Patched Version:** 3.5.0+

The vulnerability description identified an unauthenticated SQL injection
issue involving the `userId` parameter, with potential for complete database
compromise.

A public proof-of-concept was also indicated in the simulated record.

#### Security Significance

This finding demonstrates why vulnerability databases are important sources
of security intelligence.

A SOC or vulnerability-management team could use this information to:

1. Identify potentially affected assets.
2. Determine whether the affected software is deployed.
3. Assess internet exposure.
4. Review available exploitation intelligence.
5. Prioritize remediation.
6. Verify that patched versions are deployed.

Severity scores should not be considered in isolation. Asset criticality,
exposure, exploitability, business impact, and available mitigations should
also influence prioritization.

### 4. Technical Documentation Enumeration

The fourth investigation demonstrated how Linux manual pages can be used to
retrieve technical documentation during security work.

The relevant manual page was the `nc` command:

```text
nc - arbitrary TCP and UDP connections and listens
```

The manual provided examples of network connections, including a TCP
connection to a specified host and port.

The relevant example was:

```bash
nc host.example.com 42
```

The initial attempt to provide the host and port directly as arguments to
`man` was incorrect.

The correct approach is to first open the manual page:

```bash
man nc
```

and then use the documented command example as required.

#### Security Significance

Technical documentation is an important part of command-line security work.

During SOC investigation, incident response, and troubleshooting, analysts
may need to quickly verify:

- Command syntax
- Available options
- Network behavior
- File-handling capabilities
- Logging or diagnostic options

Using authoritative documentation reduces the risk of relying on incorrect
command syntax or assumptions.

### 5. GitHub Security Research

The final investigation used a GitHub-style code search to research:

`CVE-2026-1337`

The simulated search identified the repository:

`sec-research / CVE-2026-1337-apache-webportal-sqli`

Relevant repository information included:

- **Language:** Python
- **Severity:** CRITICAL
- **Vulnerability:** SQL Injection
- **CWE:** CWE-89
- **Affected Versions:** Apache WebPortal 3.2.0-3.4.5
- **Patched Version:** 3.5.0+
- **Main File:** `exploit.py`

The repository README described the project as a proof-of-concept for the
identified vulnerability and included an example command for authorized
testing.

The repository also included an educational-use disclaimer.

#### Security Significance

Public repositories can provide valuable information for security research,
including:

- Vulnerability analysis
- Proof-of-concept research
- Detection engineering
- Patch validation
- Security-tool development
- Threat intelligence

However, publicly available code should not automatically be considered
trusted.

Security professionals should review source code before executing it and
should use isolated, authorized environments when analyzing potentially
dangerous security tooling.

## Investigation Methodology

The room followed a structured security-research methodology:

1. **Identify the research question**
   - Determine what information is required.

2. **Select an appropriate information source**
   - Use host-search, malware-intelligence, vulnerability, documentation, or
     code-repository resources according to the investigation.

3. **Collect relevant evidence**
   - Record useful technical information without unnecessarily collecting
     sensitive data.

4. **Validate the information**
   - Compare classifications, versions, severity information, and technical
     details where appropriate.

5. **Interpret the security significance**
   - Determine how the information could affect an organization or security
     investigation.

6. **Translate findings into defensive action**
   - Consider detection, monitoring, vulnerability management, remediation,
     or further investigation.

This workflow reflects the broader SOC principle of moving from raw
information to validated security findings and actionable conclusions.

## Commands and Tools

The room demonstrated several research tools and command-line concepts.

### Linux Manual Pages

```bash
man nc
```

The manual page was used to identify the correct syntax and examples for
Netcat.

### Netcat Example

```bash
nc host.example.com 42
```

This example was taken from the documented manual-page example used by the
exercise.

### Search and Intelligence Resources

The room also demonstrated the security-research concepts represented by:

- Shodan-style host discovery
- VirusTotal-style file reputation analysis
- CVE vulnerability databases
- GitHub code and security research

Sensitive values such as passwords, challenge flags, tokens, private keys,
and authentication material are intentionally excluded from this report.

## Findings

### Finding 1: Internet-Facing Service Information

- **Severity:** Informational
- **Evidence:** Simulated Shodan-style search result
- **Observation:** A web-facing host exposed information about its IP address,
  hostname, domain, server software, PHP version, location, and HTTPS service.
- **Analysis:** Publicly exposed service information can help security teams
  understand external attack surface and identify technologies requiring
  further assessment.
- **Security Impact:** Excessive or unexpected exposure can increase the
  reconnaissance value available to attackers.

### Finding 2: Malicious File Detection

- **Severity:** High
- **Evidence:** Simulated VirusTotal-style result for `invoice_payment.exe`
- **Observation:** 52 of 72 security vendors classified the sample as
  malicious.
- **Analysis:** The multi-engine detection result provides strong evidence
  that the file should be treated as potentially malicious and investigated
  further.
- **Security Impact:** Execution of an information-stealing malware sample
  could potentially result in credential theft, data exposure, or additional
  compromise.

### Finding 3: Critical SQL Injection Vulnerability

- **Severity:** Critical
- **Evidence:** Simulated CVE database record for CVE-2026-1337
- **Observation:** The simulated record described an unauthenticated SQL
  injection vulnerability affecting Apache WebPortal versions 3.2.0-3.4.5.
- **Analysis:** The vulnerability could allow unauthorized interaction with
  backend database functionality and potentially lead to significant data
  compromise.
- **Security Impact:** A vulnerable internet-facing application could present
  a severe confidentiality, integrity, and availability risk.

### Finding 4: Public Security Research Code

- **Severity:** Informational
- **Evidence:** Simulated GitHub search result
- **Observation:** Public proof-of-concept code was available for the
  simulated vulnerability.
- **Analysis:** Public PoCs can help defenders understand exploitation
  patterns and develop detection and remediation strategies, but they can
  also be misused.
- **Security Impact:** Security teams should monitor relevant vulnerabilities
  and prioritize patching when reliable exploitation information becomes
  publicly available.

## MITRE ATT&CK Relevance

This room primarily focused on security research, information gathering,
and defensive analysis rather than performing adversary operations.

Therefore, this report does **not** claim that a specific MITRE ATT&CK
technique was directly executed during the room.

Some of the information researched in the exercise can provide contextual
support for ATT&CK-based defensive analysis. For example, vulnerability and
malware intelligence can help analysts understand techniques that may be
relevant to a separate investigation.

The distinction between researching a technique and actually executing that
technique is important when documenting cybersecurity training.

## Defensive / SOC Relevance

The skills demonstrated in this room have direct relevance to SOC and
security-analysis workflows.

### External Attack-Surface Monitoring

Security teams can use internet-facing asset information to identify:

- Exposed services
- Unexpected hosts
- Software versions
- Publicly visible infrastructure
- Potentially vulnerable technologies

### Malware Triage

File-reputation services can assist analysts in determining whether a
suspicious file requires deeper investigation.

A SOC analyst could correlate the file with:

- Endpoint process activity
- User activity
- Network connections
- DNS requests
- File hashes
- Email telemetry
- Authentication events

### Vulnerability Prioritization

CVE research supports vulnerability-management and SOC workflows by helping
analysts understand:

- Affected software
- Severity
- Exploitability
- Public exploitation information
- Available patches
- Potential business impact

### Security Research

Public repositories and proof-of-concept code can help defenders understand
how vulnerabilities may be exploited and what telemetry could indicate
attempted exploitation.

Security teams should analyze such code safely and only test it against
authorized systems.

## Lessons Learned

- Security research tools can provide valuable context for investigating hosts,
  files, vulnerabilities, and public security information.
- Search results should be validated and interpreted carefully rather than
  treated as complete evidence by themselves.
- Malware detections from multiple vendors can provide strong initial triage
  evidence, but deeper analysis may still be required.
- CVE severity should be considered together with asset exposure,
  exploitability, affected versions, and business impact.
- Public proof-of-concept code should be treated as untrusted material and
  examined only in authorized, isolated environments.
- Technical documentation such as Linux manual pages is an important
  resource during security investigations and troubleshooting.

## Security Improvements

Based on the concepts demonstrated in this room, organizations should:

1. Maintain visibility into internet-facing assets and services.
2. Monitor exposed software versions and prioritize vulnerable systems.
3. Use multiple sources of threat intelligence during suspicious-file triage.
4. Maintain effective endpoint, network, DNS, and authentication logging.
5. Establish a vulnerability-management process based on risk and asset
   criticality.
6. Test suspicious security research code only in controlled environments.
7. Keep internet-facing applications patched and securely configured.
8. Use parameterized database queries and secure development practices to
   reduce SQL injection risk.

## Evidence Handling

Evidence collected during the exercise was limited to the authorized
TryHackMe simulation.

Public documentation of this exercise intentionally excludes:

- Passwords
- Challenge flags
- Authentication tokens
- Private keys
- Session credentials
- Other sensitive authentication material

Where screenshots are retained, they should contain only non-sensitive
training evidence and should not expose challenge secrets.

## Evidence

Evidence for this room should demonstrate the research process and relevant
findings without exposing sensitive challenge information.

Recommended evidence includes:

- Screenshot of the simulated host-search result
- Screenshot of the simulated malware-analysis result
- Screenshot of the simulated CVE record
- Screenshot of the `man nc` documentation
- Screenshot of the simulated GitHub research result
- Final TryHackMe completion screen showing the room was completed

Evidence must be reviewed before publication.

Do not include:

- Passwords
- Challenge flags
- Authentication tokens
- Private keys
- Session credentials
- Personal account information
- Other sensitive authentication material

Where sensitive information appears in a screenshot, it should be removed or
redacted before the evidence is added to the public repository.

## Ethical Scope

All activities documented in this report were performed within the authorized
TryHackMe laboratory environment.

The simulated security-research resources were used for educational
purposes.

Information discovered during security research must not be used to target
systems without explicit authorization.

Public proof-of-concept code, vulnerability information, malware samples, and
reconnaissance techniques should only be analyzed or executed in controlled
environments and against systems for which authorization has been provided.

## Conclusion

The Search Skills room provided practical experience with several important
security-research workflows.

The exercise demonstrated how analysts can combine internet-facing asset
information, malware intelligence, vulnerability databases, technical
documentation, and public security research to build a more complete
understanding of a security problem.

The most important lesson was that effective security analysis goes beyond
finding information. Analysts must validate evidence, understand its
limitations, assess security impact, and translate research into appropriate
defensive action.

These skills are directly applicable to SOC operations, threat intelligence,
vulnerability management, incident investigation, security research, and
defensive security monitoring.
