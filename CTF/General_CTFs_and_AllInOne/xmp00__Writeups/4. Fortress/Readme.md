# HTB Fortresses

HTB Fortresses occupy a unique position in the Hack The Box ecosystem. Unlike standard machines or Pro Labs, Fortresses are large-scale, multi-flag environments co-created with real-world industry partners: security consultancies, cloud providers, and research firms: each of whom has embedded their own domain expertise, internal tooling philosophy, and professional challenge design into the lab. Every Fortress is a direct expression of how a particular team approaches offensive security in production environments, which gives them a texture and authenticity that purpose-built CTF challenges rarely achieve. Completing a Fortress is not just a technical exercise; it is an exposure to the way professionals at Akerva, AWS, Synacktiv, and others actually think about attack surface, exploitation chains, and adversary simulation.

A structured progression order matters here for practical reasons. The Fortresses vary significantly in the technical prerequisites they assume, the breadth of skill they exercise, and the mindset shifts they demand. Beginning with a cloud-native or AppSec-heavy environment before solidifying foundational web exploitation and network enumeration habits leads to unnecessary frustration and shallow learning. The order below moves from the most broadly accessible environments: those that reward strong fundamentals: through increasingly specialized domains, culminating in the cloud exploitation and advanced AppSec scenarios that assume the practitioner can pivot comfortably across web, infrastructure, and platform-level attack surfaces. This sequencing mirrors the natural skill progression of a working penetration tester preparing for real-world red team engagements.

---

## Recommended Progression Order

1. Jet
2. Akerva
3. Context
4. Faraday
5. Synacktiv (Dojo)
6. AWS

---

## Why This Order?

The six Fortresses currently available on HTB span three broad skill domains: general enterprise penetration testing, specialized web and application security, and cloud-native exploitation. The recommended order respects these domains while ensuring that the practitioner arrives at each Fortress with the technical context to extract maximum value from it.

Jet serves as the natural entry point. It is a general-purpose enterprise simulation that exercises a wide range of foundational skills: network enumeration, web application exploitation, DNS abuse, authentication bypass, binary interaction, and privilege escalation: across multiple services and flags. The environment is self-contained and rewards methodical enumeration, making it an effective calibration exercise before moving to partner-built environments with higher specificity.

Akerva follows because it sharpens a capability that Jet introduces but does not fully demand: the ability to research and exploit specific vulnerabilities independently, including CVE-based vectors and custom scripting. Akerva, created by a French penetration testing firm with a deep research practice, rewards practitioners who combine enumeration discipline with the capacity to identify and chain real vulnerabilities rather than relying on generic tooling. The transition from Jet to Akerva is a transition from breadth to precision.

Context, created by Context Information Security (part of Accenture Security), broadens the scope again, introducing a more enterprise-style architecture that includes Windows-adjacent attack surfaces and a lateral-movement oriented chain alongside web exploitation. It represents the kind of engagement a consultant at a large firm might encounter: a realistic, multi-vector environment where no single technique carries the practitioner all the way through.

Faraday introduces a distinct mindset requirement that distinguishes it from the preceding three. Created by Faraday Security, the environment is structured around a compromised server whose alarm system has been triggered: the practitioner's task is first to reconstruct what happened (a forensic and analytical challenge) and then to use that understanding to exploit the system themselves. This DFIR-adjacent approach demands comfortable reasoning under incomplete information and a willingness to learn what is needed in context, rather than applying a known playbook. It belongs here rather than earlier because the analytical depth it requires is more accessible to practitioners who have already completed several structured exploitation environments.

Synacktiv's Dojo Fortress is the most technically demanding of the five non-cloud environments. Created by one of Europe's foremost offensive security firms, it combines infrastructure hacking, web exploitation, and AppSec exploitation in ways that demand genuine depth across all three disciplines simultaneously. The vectors are described by Synacktiv themselves as "interesting and unique": a characterization that the community has consistently validated. Placing this fifth ensures the practitioner arrives with both the technical breadth and the lateral thinking developed through the earlier four Fortresses.

The AWS Fortress closes the sequence because it is a domain-specific environment that requires not only web exploitation skills but a working understanding of cloud architecture, AWS IAM, API enumeration, and privilege escalation in cloud-native service contexts. Web exploitation competence is necessary but not sufficient: the practitioner must be able to pivot from identifying a web-layer vulnerability to understanding its implications within an AWS environment and following the privilege chain through cloud-specific services. Approaching this Fortress after the five preceding environments ensures that the web and exploitation fundamentals are solid, leaving cognitive bandwidth for the cloud-specific reasoning that distinguishes this lab from everything before it.

---

## Estimated Time, Key Skills & HTB Academy Preparation Matrix

| # | Fortress Name | Created By | Difficulty | Estimated Time | Key Skills Practiced | Recommended HTB Academy Preparation |
|---|---|---|---|---|---|---|
| 1 | Jet | HTB Community | Intermediate | 6-10 hours | Network enumeration, DNS abuse, web application exploitation, authentication bypass, binary service interaction, Linux privilege escalation | Penetration Tester Job Role Path (first half); Network Enumeration with Nmap; Web Requests; SQL Injection Fundamentals; Linux Privilege Escalation |
| 2 | Akerva | Akerva | Intermediate | 8-14 hours | CVE-based exploitation, web vulnerability research, Python scripting, service enumeration, multi-stage flag chaining | Penetration Tester Job Role Path; Web Attacks; Using Web Proxies; File Inclusion; Attacking Web Applications with Ffuf |
| 3 | Context | Context IS (Accenture Security) | Intermediate | 8-12 hours | Enterprise network enumeration, web exploitation, Windows attack surface, lateral movement fundamentals, multi-vector chaining | Penetration Tester Job Role Path; Active Directory Enumeration & Attacks; Windows Privilege Escalation; Password Attacks |
| 4 | Faraday | Faraday Security | Intermediate-Advanced | 10-18 hours | DFIR-adjacent reasoning, trace analysis, attacker-path reconstruction, adaptive exploitation, problem-solving under incomplete information | Penetration Tester Job Role Path; Web Attacks; Linux Privilege Escalation; Using Web Proxies; File Inclusion |
| 5 | Synacktiv (Dojo) | Synacktiv | Advanced | 14-24 hours | Infrastructure hacking, web exploitation, AppSec exploitation techniques, creative chaining, out-of-the-box enumeration, advanced application security | Full Penetration Tester Job Role Path; Web Attacks; Advanced SQL Injection; Attacking Authentication Mechanisms; Server-Side Attacks |
| 6 | AWS | Amazon Web Services | Advanced | 10-18 hours | Cloud security architecture, OWASP Top 10 in cloud contexts, AWS API enumeration, IAM privilege escalation, S3 misconfiguration abuse, cloud-native lateral movement | Penetration Tester Job Role Path; Web Attacks; Cloud security fundamentals; AWS enumeration techniques (HTB Cloud Track where available) |

Note on difficulty: Fortresses do not carry official difficulty ratings in the same way that HTB machines do. The assessments above reflect community consensus based on player reports, flag counts, and the technical prerequisites documented by each partner organisation. Individual experience will vary depending on prior specialisation: practitioners with strong AppSec backgrounds may find Synacktiv more approachable than indicated, while those without prior cloud exposure may find the AWS Fortress proportionally more demanding.

The official HTB Academy × Labs relations page at [https://academy.hackthebox.com/academy-lab-relations](https://academy.hackthebox.com/academy-lab-relations) should be consulted for the most current module-to-lab mappings. The Penetration Tester Job Role Path is the recommended foundation for all six Fortresses; no individual Fortress should be approached without completing at minimum the web exploitation, network enumeration, and Linux privilege escalation modules from that path.

---

## Additional Guidance for Success

**Complete the Penetration Tester Job Role Path before starting.** Every Fortress assumes functional competence in web exploitation, network enumeration, and Linux privilege escalation as a baseline. The AWS Fortress additionally assumes cloud familiarity. Arriving at any of these environments without that foundation makes the experience significantly less productive: time that could be spent advancing the attack chain is instead spent filling fundamental gaps under pressure.

**Treat each Fortress as a professional engagement, not a CTF.** The multi-flag structure and partner-built design reward a structured, methodical approach far more than a CTF-style flag-hunting mentality. Begin with thorough reconnaissance and document findings systematically before attempting any exploitation. Practitioners who approach Fortresses the way they would approach a real engagement: with a clear methodology, documented attack surface, and deliberate decision-making: consistently report higher flag counts and more durable learning outcomes.

**Write a short professional report after each Fortress.** After completing a Fortress, draft a two to three page engagement-style summary: scope, services identified, vulnerabilities discovered with brief technical descriptions, attack chain narrative, and remediation recommendations. This habit produces a genuine portfolio artefact, reinforces retention of the techniques encountered, and builds the reporting fluency that professional penetration testers exercise on every engagement. A GitHub repository of Fortress reports positions a practitioner's public profile significantly better than flag completions alone.

**Research the creating organisation before starting.** Each Fortress was built by practitioners from a specific firm with a specific methodological culture. Reading one or two public blog posts or conference talks from Akerva, Context IS, Synacktiv, or Faraday before starting the corresponding Fortress provides useful context about the kinds of vectors those teams value and the attack patterns they consider realistic. The AWS Fortress is supported by AWS's own documentation on IAM policies, S3 access controls, and EC2 instance metadata: reviewing that material before starting is directly productive.

**Use the AWS Fortress as a cloud pentesting baseline, not a cloud certification substitute.** The AWS Fortress is an excellent introduction to offensive cloud security, but it represents a curated and bounded scope. Practitioners who complete it and intend to move toward cloud penetration testing professionally should supplement with HTB's dedicated cloud content, the AWS documentation on IAM and STS, and community resources on cloud-specific attack tooling such as Pacu, Prowler, and ScoutSuite.

**Review community writeups after completion, not before.** Each Fortress, once completed, should be followed by a review of two or three community writeups: not to validate your own approach, but to identify alternative paths, cleaner exploitation methods, or techniques that were not considered. The partner-built design of Fortresses frequently means that the intended solution path reflects professional methodology, and discovering it after independent completion deepens understanding more than following it would have.

**Take a deliberate break between Synacktiv and AWS.** The cognitive demands of the Dojo Fortress: particularly the requirement to chain infrastructure, web, and AppSec vectors simultaneously: are significant. A two to three day gap before starting the AWS Fortress allows consolidation and ensures the cloud environment receives fresh, focused attention rather than fatigued pattern-matching.

**Fortresses count toward real-world readiness, not just platform progression.** The skills exercised across the six Fortresses map directly to the competencies tested in professional certifications including OSCP, CPTS, and CBBH. More importantly, the multi-flag, partner-created format exposes practitioners to the way real security teams design challenges: which is itself useful preparation for adversary simulation engagements, red team assessments, and bug bounty programs operating against complex real-world targets.

---

*Fortress availability and partner content are subject to change as HTB updates its platform and adds new industry collaborations. This roadmap reflects the six confirmed Fortresses available as of April 2026. Review the HTB platform directly for any additions or updates to the Fortress catalogue.*
