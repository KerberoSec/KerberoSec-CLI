---
title: "AI Finds Bugs Faster Than Teams Can Patch Them"
date: 2026-05-23
tags: [ai, cybersecurity, vulnerability-management, devsecops, software-supply-chain]
summary: "Anthropic, OpenAI, Drupal, and Ubiquiti all pointed to the same hard truth over the last day: AI is accelerating software work and vulnerability discovery faster than most organizations can verify, patch, and govern the resulting risk." 
author: "Saimese"
---

The clearest AI-and-cybersecurity story from the last 24 hours is not a flashy model benchmark. It is a workflow problem. AI systems are getting better at discovering flaws, writing code, and moving work across the software lifecycle, while defenders are still constrained by the slower human steps of verification, remediation, and governance.

Anthropic said the quiet part out loud in its May 22 update on Project Glasswing. The company said it and roughly 50 partners have already used Claude Mythos Preview to find more than 10,000 high- or critical-severity vulnerabilities across software that underpins large parts of the internet. That is an extraordinary number on its own, but the more important point was Anthropic’s framing: software security used to be bottlenecked by finding bugs, and now it is bottlenecked by proving they are real, disclosing them responsibly, and getting them patched. In other words, AI is not just making attackers or defenders faster in the abstract. It is moving the choke point.

OpenAI’s May 22 enterprise coding update landed on the same theme from a different angle. The company argued that software development is becoming more agentic, with developers delegating larger tasks to Codex inside governed environments. What matters for security teams is not the marketing label. It is the control model. OpenAI highlighted approval gates, role-based access control, sandboxing, and auditable governance as the enterprise features that now matter most. That is a useful tell. The industry is no longer debating whether AI can generate code. It is debating how to let AI operate inside production workflows without losing visibility or control.

That matters because the traditional patch queue is already under pressure. Drupal updated its advisory for CVE-2026-9082 on May 22 to say exploit attempts are now being detected in the wild. The vulnerability is a highly critical SQL injection flaw in Drupal core that affects PostgreSQL-backed sites and can be exploited by anonymous users. The technical specifics are serious enough, but the timing is the bigger lesson. The advisory was published on May 20, and active exploit attempts were being acknowledged by May 22. That is the kind of compression security leaders keep warning about: the gap between disclosure and abuse is getting uncomfortably small.

Ubiquiti’s Security Advisory Bulletin 064 tells a similar story at the infrastructure layer. The bulletin, published May 21 and still rippling through the ecosystem on May 22, disclosed multiple UniFi OS flaws, including critical issues tracked as CVE-2026-34908, CVE-2026-34909, and CVE-2026-34910 with CVSS 10.0 severity. These affect a wide spread of gateway, recorder, and appliance products. This is the kind of update that turns routine fleet management into a race condition. If AI-assisted discovery keeps increasing the volume of serious findings, every organization with distributed hardware and software estates will feel that pressure more often.

Put together, these developments show where 2026 is heading. AI is speeding up both software creation and vulnerability discovery, but the real battleground is the layer in between: review, validation, approval, patching, and governance. The organizations that hold up best will not be the ones with the most AI announcements. They will be the ones that can absorb faster discovery without letting their security process fall behind it.

## Sources

- https://www.anthropic.com/research/glasswing-initial-update
- https://openai.com/index/gartner-2026-agentic-coding-leader/
- https://www.drupal.org/sa-core-2026-004
- https://community.ui.com/releases/Security-Advisory-Bulletin-064-064/84811c09-4cf4-42ab-bd61-cc994445963b
