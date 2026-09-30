---
title: "AI Security Moves to Runtime Control"
date: 2026-06-20
tags: [ai, cybersecurity, ai-agents, identity-security, vulnerability-management]
summary: "The latest AI and cybersecurity news points to one practical theme: defenders have to govern what agents, users, devices, and exposed services can actually do at runtime."
author: "Saimese"
---

AI security is getting less abstract and more operational. The question is no longer just whether models can be tricked, jailbroken, or misused. The better question is what happens after a system has access.

That is the thread connecting the strongest developments heading into June 20. Google DeepMind is framing internal AI agents as systems that need containment and monitoring. Identity teams are being pushed to treat enterprise AI agents like first-class actors, not invisible extensions of a user account. CISA is warning Fortinet customers to respond to the FortiBleed credential leak as an active access risk. Splunk customers are facing a short patch window after exploitation of a Secure Gateway flaw. And law enforcement disruption of the SocGholish malware network is another reminder that commodity access infrastructure still matters.

DeepMind's AI Control Roadmap is the cleanest signal. The company describes increasingly capable agents as useful but imperfect systems that may need layered safeguards inside real production environments. That means conventional security controls, model alignment work, prompt-injection resistance, supervision, monitoring, and blocking mechanisms. The interesting part is the assumption underneath: even a helpful agent should not be trusted simply because it was designed to help.

That moves AI safety closer to cybersecurity practice. Security teams already assume employees can be phished, endpoints can be compromised, and service accounts can drift into excessive privilege. Agentic AI belongs in that same model. If an agent can write code, query business systems, update tickets, trigger cloud workflows, or touch customer data, then it needs ownership, scoped permissions, logs, review, and a way to stop bad behavior quickly.

The identity side of that problem is getting sharper. A BleepingComputer-sponsored piece from Token Security argued that AI agents are becoming a new identity layer across the enterprise. The examples are familiar now: agents connected to Salesforce, Snowflake, GitHub, Jira, production databases, cloud environments, and internal workflow tools. Sometimes they act for a person, sometimes autonomously, and sometimes in a blurry middle ground where accountability gets messy.

That is not just an AI governance issue. It is an IAM issue. A bad prompt, compromised session, malicious plugin, or careless integration can become a path to data exposure or lateral movement if the agent has broad credentials. The practical fix starts with inventory: who owns the agent, who can invoke it, what credentials it uses, what systems it can reach, and whether those permissions match its actual purpose.

FortiBleed shows the same access problem from the edge. CISA urged organizations to secure Fortinet devices after reports that credentials tied to roughly 74,000 Fortinet firewalls and VPN gateways had been exposed. The agency's recommendations are not glamorous: terminate active sessions, reset VPN and administrative passwords, enforce phishing-resistant MFA, review logs, restrict management interfaces, and remove unauthorized accounts. They are exactly the right moves when edge credentials may already be in criminal hands.

The Splunk advisory adds urgency to the patch side. Splunk disclosed a high-severity Secure Gateway remote code execution vulnerability, CVE-2026-20251, caused by unsafe deserialization of KV Store data through the `jsonpickle` Python library. BleepingComputer reported that CISA added the flaw to its Known Exploited Vulnerabilities catalog and set a June 21 deadline for federal agencies. Splunk's fix is straightforward: upgrade affected Enterprise, Cloud Platform, and Secure Gateway versions, or disable the Secure Gateway app where it is not needed.

Finally, The Record reported that an international law enforcement operation disrupted a SocGholish malware network tied to Russia's Evil Corp ecosystem, taking down more than 100 servers and cleaning nearly 15,000 hacked websites. That matters because the AI era has not replaced ordinary cybercrime infrastructure. Malware delivery, stolen credentials, exposed management planes, and delayed patching still create the access that attackers need.

The takeaway for defenders is blunt: runtime control is becoming the center of AI security. Treat agents like identities. Treat edge credentials like emergency keys. Treat vulnerable gateways as business risks, not backlog items. Treat law enforcement wins as useful disruption, not a reason to relax.

AI may change the speed of the attack path, but the path still runs through access, permissions, exposed services, and response time.

## Sources

- https://deepmind.google/blog/securing-the-future-of-ai-agents/
- https://www.bleepingcomputer.com/news/security/every-ai-agent-is-an-identity-most-organizations-dont-treat-them-that-way/
- https://www.bleepingcomputer.com/news/security/cisa-warns-fortinet-users-to-secure-devices-after-fortibleed-leak/
- https://advisory.splunk.com/advisories/SVD-2026-0601
- https://www.bleepingcomputer.com/news/security/cisa-splunk-enterprise-flaw-actively-exploited-patch-by-sunday/
- https://therecord.media/socgholish-botnet-disrupted
