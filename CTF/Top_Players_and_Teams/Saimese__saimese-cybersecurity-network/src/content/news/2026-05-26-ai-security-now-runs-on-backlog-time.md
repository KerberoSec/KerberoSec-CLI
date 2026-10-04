---
title: "AI Security Now Runs on Backlog Time"
date: 2026-05-26
tags: [ai, cybersecurity, vulnerability-management, software-supply-chain, patch-management]
summary: "The biggest AI-and-cybersecurity story on May 25-26 is not one breakthrough or one breach. It is the growing mismatch between machine-speed discovery and human-speed remediation, visible at the same time in AI-found vulnerabilities, supply-chain compromises, mass exploitation of old bugs, and regulator pressure on banks to patch faster."
author: "Saimese"
---

The clearest AI and cybersecurity signal from the last 24 hours is that defense is no longer mainly limited by finding problems. It is limited by how fast organizations can verify them, prioritize them, and fix them before attackers operationalize the gap.

Anthropic put the bottleneck in plain language in its May 22 update on Project Glasswing, which is still shaping the conversation this week. The company said it and roughly 50 partners have already found more than 10,000 high- or critical-severity vulnerabilities with Claude Mythos Preview, and that software security is now constrained less by discovery than by verification, disclosure, and patching. In the open-source slice alone, Anthropic said Mythos has estimated 6,202 high- or critical-severity flaws across more than 1,000 projects, with maintainers in some cases asking for slower disclosure because they do not have the capacity to absorb the reports. That is the part worth paying attention to: AI is not just surfacing more bugs. It is forcing the ecosystem to admit that remediation capacity is the real chokepoint.

That same pressure showed up in finance on May 25. The Business Times, citing Financial Times reporting, said the European Central Bank is convening lenders to push them to secure IT systems faster because advanced AI models can uncover weaknesses within minutes of a patch release. Frank Elderson’s warning is important because it moves the argument out of security labs and into systemic-risk territory. Once central banks start treating AI-assisted vulnerability discovery as a financial-stability problem, the issue is no longer hypothetical. It becomes operational policy.

Meanwhile, the practical cost of lagging behind patches is easy to see. SecurityWeek reported on May 25 that CVE-2026-26980, an SQL injection flaw in Ghost CMS that was patched in February, has been exploited to compromise more than 700 websites. According to the report, attackers used the bug to steal admin API keys and inject JavaScript loaders for ClickFix attacks, hitting sites tied to major institutions as well as smaller independent publishers. The lesson is ugly but familiar: in an AI-accelerated environment, yesterday’s patch debt becomes today’s distribution layer for fresh malware.

The software supply chain is telling a similar story. Also on May 25, SecurityWeek reported that the Megalodon campaign infected more than 5,500 GitHub repositories through fake automated commits that planted malicious GitHub Actions workflows. Those workflows were built to steal CI secrets, cloud credentials, tokens, SSH keys, and other sensitive material. This matters beyond the raw repo count. It shows how quickly attackers can weaponize trust in automation itself. The more development pipelines rely on bots, workflows, and machine-generated changes, the more defenders need controls that assume automation can be poisoned just as easily as it can be helpful.

Even endpoint defense is not immune. BleepingComputer’s May 25 update on Microsoft Defender zero-days highlighted active exploitation and CISA deadlines for agencies to patch. That is a useful reminder that AI is not replacing old security fundamentals; it is making their timing more brutal. The basics still matter: asset visibility, rapid patching, secret hygiene, workflow review, and strong defaults. They just matter on a much shorter clock.

So the real headline today is not that AI found more bugs, or that one campaign hit thousands of repositories, or that one regulator got nervous. It is that AI security now runs on backlog time. The organizations that win this phase will not be the ones that merely discover the most issues. They will be the ones that can turn discovery into remediation before machine-speed offense turns delay into breach.

## Sources

- https://www.anthropic.com/research/glasswing-initial-update
- https://www.businesstimes.com.sg/companies-markets/banking-finance/ecb-convening-bank-meeting-fix-flaws-exposed-ai-models-report
- https://www.securityweek.com/ghost-cms-vulnerability-exploited-to-hack-over-700-websites/
- https://www.securityweek.com/over-5500-github-repositories-infected-in-megalodon-supply-chain-attack/
- https://www.bleepingcomputer.com/news/security/microsoft-warns-of-new-defender-zero-days-exploited-in-attacks/
