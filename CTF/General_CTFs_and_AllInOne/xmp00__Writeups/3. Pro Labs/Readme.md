# HTB Pro Labs & Mini Pro Labs

This roadmap presents a community-validated, sequenced approach to completing all currently available Hack The Box Pro Labs and Mini Pro Labs. The ordering is not arbitrary: it reflects a deliberate pedagogical architecture that mirrors how offensive security skills compound in practice: foundational enumeration and pivoting methodology first, then single-domain Active Directory exploitation, then multi-domain trust abuse, then evasion and persistence, and finally the most hardened and research-intensive environments. Each lab builds on the technical and mental models established by the labs before it, reducing the frustration that comes from tackling complexity before the necessary context exists.

The sequence is tightly aligned with the HTB Academy Penetration Tester Job Role Path, which provides the structured theory and guided exercises that make the unguided lab environments productive rather than overwhelming. Where official HTB Academy × Labs relations exist, they are reflected in the preparation matrix below. The goal throughout is measurable, cumulative red-team growth: not completion for its own sake, but genuine depth that translates to real-world penetration testing and red-team engagements.

---

## Recommended Progression Order

1. Dante (Full Pro: Beginner)
2. P.O.O (Mini Pro: Beginner)
3. Zephyr (Full Pro: Intermediate)
4. Xen (Mini Pro: Intermediate)
5. Shinra (Full Pro: Intermediate)
6. Wutai (Full Pro: Intermediate)
7. Ifrit (Full Pro: Intermediate)
8. FullHouse (Mini Pro: Intermediate)
9. Unintended (Mini Pro: Intermediate)
10. Offshore (Full Pro: Intermediate)
11. Wanderer (Full Pro: Intermediate)
12. Alchemy (Full Pro: Intermediate)
13. RastaLabs (Full Pro: Intermediate)
14. Trusted (Mini Pro: Advanced)
15. Reflection (Mini Pro: Advanced)
16. Intercept (Mini Pro: Advanced)
17. Control (Mini Pro: Advanced)
18. Push (Mini Pro: Advanced)
19. Sidecar (Mini Pro: Advanced)
20. Tengu (Mini Pro: Advanced)
21. Kaiju (Mini Pro: Advanced)
22. Tea (Mini Pro: Advanced)
23. Klendathu (Mini Pro: Advanced)
24. Heron (Mini Pro: Advanced)
25. Mythical (Mini Pro: Advanced)
26. Puppet (Mini Pro: Advanced)
27. Solar (Mini Pro: Advanced)
28. Hades (Mini Pro: Advanced)
29. RPG (Mini Pro: Advanced)
30. Odyssey (Mini Pro: Advanced)
31. Ascension (Mini Pro: Advanced)
32. Cybernetics (Full Pro: Advanced)
33. APTLabs (Full Pro: Expert)

---

## Why This Order?

The sequencing follows a clear and deliberate skill-progression model, organized into five conceptual tiers.

The earliest labs: Dante and P.O.O: anchor the entire roadmap. Dante is the canonical starting point for a reason: it exercises fundamental methodology, multi-host pivoting, basic buffer overflow concepts, and introductory Active Directory interaction across a varied network topology. P.O.O reinforces that foundation in a compressed, time-efficient format. Together, they establish the enumeration discipline and network-thinking that every subsequent lab depends on.

The next tier: Zephyr, Xen, and the Shinra/Wutai/Ifrit cluster: transitions into single and multi-host Active Directory environments. Zephyr introduces core AD attack primitives: Kerberoasting, delegation abuse, and domain enumeration at scale. Xen provides a focused, smaller-scope reinforcement of those same skills. Shinra, Wutai, and Ifrit add realistic enterprise complexity, including endpoint detection considerations and lateral movement across segmented networks. FullHouse and Unintended round out this tier by presenting misconfiguration-chaining scenarios that reward creative tooling decisions.

Offshore marks the beginning of the multi-domain tier and represents a significant difficulty step. It is widely regarded as one of the most instructive labs in the entire Pro Lab catalogue precisely because it forces the practitioner to reason about domain trust relationships, cross-forest attack paths, and DMZ traversal simultaneously. Wanderer and Alchemy extend this complexity: Wanderer through its broad scope and DFIR-adjacent elements, Alchemy through its inclusion of OT and ICS-style network architecture. RastaLabs closes the Intermediate tier as its most demanding entry, requiring functional AV and EDR evasion in a time-pressured environment that closely simulates a real red-team engagement.

The Advanced Mini Pro Labs that follow: from Trusted through Ascension: are best approached after RastaLabs rather than interspersed throughout the roadmap. By this point, the practitioner has sufficient breadth to engage each focused scenario on its own terms: zero-credential-start environments, ADCS exploitation chains, ClickOnce delivery, and other narrowly-scoped but technically deep challenges. The Mini Pro format at this tier functions as a precision sharpener rather than a broad exercise.

Cybernetics and APTLabs occupy a category of their own. Cybernetics presents a fully hardened hybrid Active Directory environment where standard tooling frequently fails and persistence requires careful planning. APTLabs is the most demanding lab on the platform by a considerable margin: it is designed to simulate a long-form APT-style engagement with no CVE dependency, requiring original research, disciplined operational security, and sustained focus over weeks or months. Both labs demand the complete accumulated skill set of every lab that precedes them.

---

## Estimated Time, Key Skills & HTB Academy Preparation Matrix

| Lab Name | Type | Estimated Time | Key Skills Practiced | Recommended HTB Academy Preparation |
|---|---|---|---|---|
| Dante | Full Pro | 25-40 hours | Network methodology, multi-host pivoting, basic buffer overflows, introductory Active Directory | Penetration Tester Job Role Path (first half); Linux Fundamentals; Windows Fundamentals; Introduction to Web Applications; Pivoting, Tunneling & Port Forwarding |
| P.O.O | Mini Pro | 6-10 hours | Rapid enumeration, basic exploitation, methodology reinforcement | Penetration Tester Job Role Path (first half); Network Enumeration with Nmap; Footprinting |
| Zephyr | Full Pro | 35-50 hours | Core AD attacks, Kerberoasting, delegation abuse, BloodHound enumeration | Active Directory Enumeration & Attacks; Kerberos Attacks; Using BloodHound |
| Xen | Mini Pro | 10-15 hours | Single-domain AD exploitation, credential abuse | Active Directory Enumeration & Attacks |
| Shinra | Full Pro | 30-45 hours | Enterprise AD, endpoint detection awareness, lateral movement | Active Directory Enumeration & Attacks; Windows Lateral Movement; Password Attacks |
| Wutai | Full Pro | 30-45 hours | Realistic enterprise AD, multi-host lateral movement, credential chaining | Windows Lateral Movement; Active Directory Enumeration & Attacks; Pivoting, Tunneling & Port Forwarding |
| Ifrit | Full Pro | 30-45 hours | EDR awareness, AD exploitation, realistic enterprise misconfigurations | Active Directory Enumeration & Attacks; Windows Privilege Escalation; Evasion techniques |
| FullHouse | Mini Pro | 8-14 hours | Misconfiguration chaining, tooling decisions | Relevant sections from the Penetration Tester Job Role Path; Active Directory Enumeration & Attacks |
| Unintended | Mini Pro | 8-14 hours | Unintended attack path identification, creative enumeration | Penetration Tester Job Role Path; Web Attacks; Active Directory Enumeration & Attacks |
| Offshore | Full Pro | 50-70 hours | Multi-domain trust abuse, DMZ pivoting, cross-forest attack paths, BloodHound at scale | Full Penetration Tester Job Role Path; Active Directory Enumeration & Attacks; Pivoting, Tunneling & Port Forwarding; Using BloodHound |
| Wanderer | Full Pro | 40-55 hours | Broad-scope enumeration, DFIR-adjacent awareness, privilege escalation versatility | Linux Privilege Escalation; Windows Privilege Escalation; Pivoting, Tunneling & Port Forwarding |
| Alchemy | Full Pro | 45-60 hours | OT/ICS network architecture, AD exploitation in non-standard environments | Active Directory Enumeration & Attacks; Industrial Control Systems awareness; Pivoting, Tunneling & Port Forwarding |
| RastaLabs | Full Pro | 60-80 hours | AV/EDR evasion, full red-team simulation, persistence, real-time pressure | Full Penetration Tester Job Role Path; Antivirus Evasion; Active Directory Enumeration & Attacks; Windows Lateral Movement |
| Trusted | Mini Pro | 8-20 hours | Zero-credential enumeration, trust relationship exploitation | Active Directory Enumeration & Attacks; Using BloodHound |
| Reflection | Mini Pro | 8-20 hours | Credential reflection, relay attacks, NTLM abuse | Active Directory Enumeration & Attacks; Password Attacks |
| Intercept | Mini Pro | 8-20 hours | Network interception, credential capture, relay chain construction | Password Attacks; Active Directory Enumeration & Attacks |
| Control | Mini Pro | 8-20 hours | Controlled-environment exploitation, privilege path enumeration | Windows Privilege Escalation; Active Directory Enumeration & Attacks |
| Push | Mini Pro | 8-20 hours | Delivery mechanisms, phishing-adjacent techniques, initial access | Phishing; Active Directory Enumeration & Attacks |
| Sidecar | Mini Pro | 8-20 hours | Container and sidecar process abuse, lateral movement in orchestrated environments | Linux Privilege Escalation; Active Directory Enumeration & Attacks |
| Tengu | Mini Pro | 8-20 hours | Advanced AD chaining, ADCS abuse, certificate-based authentication attacks | Active Directory Certificate Services (ADCS) module; Active Directory Enumeration & Attacks |
| Kaiju | Mini Pro | 8-20 hours | Large-scale AD enumeration, attack path optimization | Active Directory Enumeration & Attacks; Using BloodHound |
| Tea | Mini Pro | 8-20 hours | Targeted exploitation, focused attack chain construction | Penetration Tester Job Role Path; Active Directory Enumeration & Attacks |
| Klendathu | Mini Pro | 8-20 hours | Multi-stage attack chains, creative privilege escalation | Windows Privilege Escalation; Active Directory Enumeration & Attacks |
| Heron | Mini Pro | 8-20 hours | Evasion-aware exploitation, detection-conscious lateral movement | Antivirus Evasion; Active Directory Enumeration & Attacks; Windows Lateral Movement |
| Mythical | Mini Pro | 8-20 hours | Advanced persistence, post-exploitation tradecraft | Active Directory Enumeration & Attacks; Windows Lateral Movement |
| Puppet | Mini Pro | 8-20 hours | Configuration management exploitation, infrastructure abuse | Linux Privilege Escalation; Active Directory Enumeration & Attacks |
| Solar | Mini Pro | 8-20 hours | Log4Shell-adjacent and service exploitation, post-access pivoting | Penetration Tester Job Role Path; Pivoting, Tunneling & Port Forwarding |
| Hades | Mini Pro | 8-20 hours | Hardened-environment exploitation, advanced enumeration under restrictions | Full Penetration Tester Job Role Path; Windows Privilege Escalation |
| RPG | Mini Pro | 8-20 hours | Role-based access abuse, targeted privilege escalation | Active Directory Enumeration & Attacks; Windows Privilege Escalation |
| Odyssey | Mini Pro | 8-20 hours | Extended attack chain navigation, multi-stage pivoting | Pivoting, Tunneling & Port Forwarding; Active Directory Enumeration & Attacks |
| Ascension | Mini Pro | 8-20 hours | Advanced privilege escalation, final-stage attack completion | Full Penetration Tester Job Role Path; Windows Privilege Escalation |
| Cybernetics | Full Pro | 70-100 hours | Fully hardened hybrid AD, advanced persistence, detection-resilient tooling | Complete Penetration Tester Job Role Path; Antivirus Evasion; Active Directory Enumeration & Attacks; Windows Lateral Movement |
| APTLabs | Full Pro | 100-200+ hours | No-CVE APT simulation, original research, sustained operational security, long-form engagement management | All Penetration Tester Job Role Path modules; Advanced Active Directory; research-driven study beyond structured Academy content |

The official HTB Academy × Labs integration page at [https://academy.hackthebox.com/academy-lab-relations](https://academy.hackthebox.com/academy-lab-relations) explicitly identifies Dante, Offshore, and P.O.O as primary CPTS preparation vehicles. The majority of the remaining Pro Labs build directly on the same Penetration Tester Job Role Path. Reaching 100% completion on that path before engaging the later intermediate and advanced labs is strongly advisable.

---

## Additional Guidance for Success

**Track progress systematically.** Maintain a simple Markdown file or spreadsheet with one row per lab, recording the completion date, flags obtained, time invested, and one concrete technical takeaway. This habit creates accountability, surfaces knowledge gaps early, and produces a detailed personal record that supports future reporting and interview preparation.

**Write a short professional report after every Full Pro Lab.** Treat each Full Pro Lab as a simulated engagement. After completion, draft a brief engagement-style report: scope summary, attack chain narrative, key findings with MITRE ATT&CK references, and remediation recommendations. This builds a tangible portfolio, reinforces retention far more effectively than notes alone, and directly exercises the reporting skills that professional penetration testers use daily.

**Respect rest periods between high-intensity labs.** After completing RastaLabs: and after any lab that required sustained effort over multiple weeks: take three to five days away from active lab work. Knowledge consolidation is not passive; the brain actively integrates complex material during rest. Returning to the next lab with a clear context window consistently produces better outcomes than grinding continuously.

**Use Academy modules as preparation, not rescue.** The most effective approach is to complete the relevant Academy modules before entering a lab, not to reach for them only when stuck. Review the preparation column in the matrix above before starting each lab and ensure the corresponding material has been studied. This is especially important for Offshore, RastaLabs, Cybernetics, and APTLabs, where arriving underprepared leads to disproportionate frustration.

**Review community writeups after completion, not before.** After solving a lab independently: or after a reasonable, sustained attempt: review two or three community writeups to discover cleaner attack paths, alternative tooling choices, or techniques that were not considered. This post-solve review is one of the highest-value learning activities available and consistently reveals approaches that improve efficiency and creativity in future engagements.

**Approach APTLabs as a long-term research project.** APTLabs is not a lab in the conventional sense. It rewards practitioners who approach it with a research mindset: careful documentation of every discovered service and trust relationship, disciplined operational security throughout, and a willingness to spend significant time on enumeration before committing to an attack path. Setting a consistent daily or weekly time block: rather than ad hoc sessions: produces materially better outcomes over the duration of the engagement.

**Maintain a personal technique library.** Across 33 labs, a large number of attack primitives, tooling patterns, and enumeration strategies will be encountered. Maintaining a personal reference document: organized by technique category rather than by lab: creates a reusable knowledge base that accelerates future labs and real-world engagements. Entries should include the exact command syntax used, the context in which it was effective, and any relevant evasion or detection considerations.

---

*This roadmap reflects community consensus and official HTB Academy mappings as of April 2026. Lab availability and difficulty ratings are subject to change as HTB updates its platform. Review the official HTB Lab catalogue periodically for additions or reclassifications.*
