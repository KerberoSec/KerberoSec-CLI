---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, careers, cyber]
source: TryHackMe: Careers in Cyber
platform: tryhackme
room: Careers in Cyber
slug: careers-in-cyber
path: TryHackMe/00-foundations/intro-cybersecurity/careers-in-cyber.md
topic: 00-foundations
domain: [foundations]
skills: []
artifacts: [concept-notes]
sanitized: true
---

# Careers in Cyber

- **Type:** Concept / career mapping  
- **Focus:** Security roles & typical responsibilities  
- **Source context:** TryHackMe “Careers in Cyber” room

---

## Summary

Key points from the room:

- **High pay**: security roles tend to have strong starting salaries.  
- **Exciting work**: ranges from legally hacking systems to defending against real attacks.  
- **High demand**: millions of open positions globally; the skills gap is real.

Cyber security is not a single job. It is an ecosystem of roles that roughly sit on a spectrum:

> Monitoring & defence ↔ Investigation & response ↔ Engineering & building ↔ Offence & simulation

This note summarises the main roles presented in the room and how they connect.

---

## Key Concepts

### 2. Core Defensive & Monitoring Roles

#### 2.1 Security Analyst

**Goal:** Maintain and continuously assess the security posture of an organisation.

Typical responsibilities:

- Work with stakeholders across the company to understand security requirements.  
- Analyse logs, alerts, and network behaviour to identify risks and trends.  
- Produce ongoing reports on the safety of networks and systems.  
- Propose and help design security plans based on new tools, attacks, and threats.

Role keywords:

- Monitoring, log analysis, reporting.  
- Often entry-level / SOC Level 1 starting point.  
- Needs broad knowledge, good communication, and pattern recognition.

**Suggested learning paths (THM style):**

- Pre Security  
- Cyber Security 101  
- SOC Level 1

---

#### 2.2 Security Engineer

**Goal:** Design, build, and maintain the technical defences.

Typical responsibilities:

- Test and evaluate security measures in software and infrastructure.  
- Deploy and monitor security controls (firewalls, WAF, EDR, logging pipelines, etc.).  
- Identify and implement systems needed for “defensible” architecture.  
- Work closely with analysts and incident responders to turn findings into better tooling.

Role keywords:

- Architecture, implementation, automation.  
- Needs solid engineering skills (networking, Linux, scripting, sometimes cloud).

**Suggested learning paths:**

- SOC Level 1 (for visibility into operations).  
- Jr Penetration Tester & Offensive Pentesting (understand attacker techniques).

---

#### 2.3 Incident Responder

**Goal:** Handle attacks while they are happening and minimise damage.

Typical responsibilities:

- Develop and maintain incident response (IR) plans and playbooks.  
- Detect, triage, and contain active security incidents.  
- Track key metrics:  
  - **MTTD**: Mean Time To Detect  
  - **MTTA**: Mean Time To Acknowledge  
  - **MTTR**: Mean Time To Recover  
- Coordinate with other teams; document and share lessons learned.

Role keywords:

- High pressure, real-time decision making.  
- Needs strong technical fundamentals + calm under stress.  
- Bridges blue team operations, management, and sometimes legal/compliance.

**Suggested learning paths:**

- SOC Level 1

---

### 3. Investigation & Analysis Roles

#### 3.1 Digital Forensics Examiner

**Goal:** Use digital evidence to understand what really happened.

Two main contexts:

- **Law enforcement / criminal cases**: collect and analyse evidence to charge the guilty and protect the innocent.  
- **Corporate / internal investigations**: investigate policy violations, insider threats, and incidents.

Typical responsibilities:

- Collect digital evidence while following legal and procedural requirements (chain of custody).  
- Analyse disks, logs, memory images, and other artefacts.  
- Document findings and produce reports that can stand up in court or internal reviews.

Role keywords:

- Forensics, evidence, timelines.  
- Requires patience, rigour, and comfort with both technical detail and formal reporting.

---

#### 3.2 Malware Analyst

**Goal:** Understand how malicious software works and how to detect/stop it.

Sometimes called **reverse engineer**.

Typical responsibilities:

- **Static analysis:** reverse-engineering binaries (without executing them) to see structure and behaviour.  
- **Dynamic analysis:** run samples in a controlled environment (sandbox/VM) and observe actions.  
- Document functionality, persistence mechanisms, C2 behaviour, and indicators of compromise (IOCs).

Role keywords:

- Assembly, C/C++, reverse engineering tools (IDA, Ghidra, etc.).  
- Needs strong low-level programming background and attention to detail.

---

### 4. Offensive & Adversarial Roles

#### 4.1 Penetration Tester

**Goal:** Legally attack systems to find vulnerabilities before criminals do.

Also known as **pentester** or **ethical hacker**.

Typical responsibilities:

- Test computer systems, networks, and web applications for weaknesses.  
- Perform security assessments and audits, analyse policies and configurations.  
- Exploit discovered vulnerabilities in a controlled way to demonstrate impact.  
- Write reports with clear risk explanations and remediation advice.

Role keywords:

- Reconnaissance, exploitation, reporting.  
- Needs creativity, solid understanding of networks and web, good communication.

**Suggested learning paths:**

- Jr Penetration Tester  
- Offensive Pentesting

---

#### 4.2 Red Teamer

**Goal:** Emulate real-world threat actors to test detection and response capabilities.

Compared to a pentester:

- Pentest: find as many vulnerabilities as possible across systems.  
- Red team: run **goal-driven campaigns** (e.g. “steal HR data”) and test how well the organisation detects and responds.

Typical responsibilities:

- Imitate adversary TTPs (tactics, techniques, procedures).  
- Maintain stealth, persistence, and access over weeks.  
- Measure how quickly and effectively the blue team reacts.  
- Produce detailed assessment reports with actionable improvements.

Role keywords:

- Adversary emulation, OPSEC, long-running operations.  
- Best suited for organisations with mature security programmes.

**Suggested learning paths:**

- Jr Penetration Tester  
- Offensive Pentesting  
- Red Teamer

---

### 5. How These Roles Connect (Mental Map)

You can think of an organisation’s security function as a loop:

1. **Pentesters / Red Teamers**  
   - Find and simulate real attacks, reveal weaknesses.

2. **Security Analysts & SOC**  
   - Monitor, detect, and raise alerts when something suspicious happens.

3. **Incident Responders & Forensics**  
   - Investigate and contain incidents; understand the full story.

4. **Security Engineers & Malware Analysts**  
   - Build and tune tools, rules, and detections using insights from incidents and threats.

This loop repeats. Mature teams treat every incident or assessment as **input to improve the next round**.

For a personal career path, common entry points are:

- SOC / Security Analyst  
- Jr Penetration Tester  
- General IT + self-study, then specialise.

---

### 6. Personal Notes / Planning Hooks

Some questions to help align this with my own path:

- Which side feels more natural to me right now?  
  - Monitoring & analysis (SOC / IR)?  
  - Deep technical engineering (malware, security engineer)?  
  - Offensive / red team mindset?

- Which skills am I already building (e.g. THM labs, HTB, coding, networking), and which roles do they map to?

- What would be a realistic **first role** (e.g. SOC L1, Jr Pentester) and what TryHackMe learning paths directly support that?

---

### 7. Glossary (EN: ZH)

- **Security Analyst**: 安全分析师  
- **Security Engineer**: 安全工程师  
- **Incident Responder**: 事件响应人员  
- **Digital Forensics Examiner**: 数字取证分析师  
- **Malware Analyst / Reverse Engineer**: 恶意软件分析师 / 逆向工程师  
- **Penetration Tester (Pentester)**: 渗透测试工程师 / 道德黑客  
- **Red Teamer**: 红队成员  
- **SOC (Security Operations Centre)**: 安全运营中心  
- **MTTD (Mean Time To Detect)**: 平均检测时间  
- **MTTA (Mean Time To Acknowledge)**: 平均响应确认时间  
- **MTTR (Mean Time To Recover)**: 平均恢复时间  
- **Access control**: 访问控制  
- **Threat intelligence**: 威胁情报  
- **Incident response plan / playbook**: 事件响应计划 / 剧本  
- **Security posture**: 安全态势 / 安全状况  
- **Security controls**: 安全控制措施
