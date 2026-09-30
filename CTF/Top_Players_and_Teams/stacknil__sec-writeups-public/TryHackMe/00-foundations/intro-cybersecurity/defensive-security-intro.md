---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, defensive-security, soc]
source: TryHackMe: Defensive Security Intro
platform: tryhackme
room: Defensive Security Intro
slug: defensive-security-intro
path: TryHackMe/00-foundations/intro-cybersecurity/defensive-security-intro.md
topic: 00-foundations
domain: [foundations, blueteam]
skills: [triage, logging, ir-basics]
artifacts: [concept-notes, lab-notes]
sanitized: true
---

# Defensive Security Intro

- **Type:** Concept + Guided Lab  
- **Focus:** Defensive Security / Blue Team / SOC / SIEM  
- **Lab context:** Training room with a FakeBank SOC scenario (simulated only)

---

## Summary

Defensive security = all measures an organisation takes to **protect** its networks, systems, and data against attacks.

It is also known as **blue teaming**. Main goals:

- **Before** attacks: reduce risk and harden systems (prevention).  
- **During** attacks: detect and respond quickly (detection & response).  
- **After** attacks: analyse what happened and improve defences (lessons learned & hardening).

Real-world failures lead to:

- Large-scale data breaches (personal data, payment cards, medical records, even DNA).  
- Heavy regulatory fines and lawsuits.  
- Damage to brand and long-term loss of trust.

---

## Key Concepts

### 2. Core Responsibility Areas

#### 2.1 Monitoring & Detection

- Continuously watch network and host activity: logins, HTTP access, system logs, etc.  
- Separate **normal behaviour** from **suspicious behaviour**.  
- Example: logins from a foreign country while the employee is supposed to be in the London office.

#### 2.2 Incident Response (IR)

Once suspicious activity is confirmed, the IR process starts:

1. Identify  
2. Contain  
3. Eradicate  
4. Recover  
5. Review & improve

Goal: limit impact and prevent the same issue from happening again.

#### 2.3 Threat Intelligence

- Collect information about attackers: current exploits, preferred targets, TTPs (tactics, techniques, procedures).  
- Turn this into detection rules and hardening guidance.  
- Aim: move from “reactive” to “proactive” defence.

#### 2.4 Vulnerability Management

- Continuously find and fix weaknesses: outdated software, misconfigurations, weak passwords, exposed services.  
- Use scanners + manual verification.  
- Patch or mitigate before attackers can use them.

---

### 3. Typical Roles in a Defensive Team

**SOC Analyst**  

- Monitors SIEM dashboards and alerts.  
- Triage: decide which events are benign, suspicious, or incidents.  
- Acts as “eyes and ears” on the front line.

**Incident Responder**  

- Investigates and responds to active attacks.  
- Contains attackers in real time, coordinates technical teams.  
- Produces incident reports and lessons-learned documents.  
- In the FakeBank room, this is the person handling the *Web Discovery Attack*.

**Security Engineer**  

- Designs, deploys, and maintains defensive tooling: SIEM, WAF, EDR, log pipelines, sensors.  
- Ensures the team has the right data and reliable alerts.

**Digital Forensics Specialist**  

- Collects and analyses evidence from disks, memory, and logs.  
- Rebuilds the attack timeline and attacker actions.  
- Supports both technical remediation and potential legal action.

---

### 4. Defence in Depth

Organisations rarely rely on a single security control. Instead they build **multiple layers of defence** (defence in depth). If one layer fails, others still provide protection.

Examples:

- **Employee Training**: teach staff to spot phishing, malicious attachments, fake login pages.  
- **Intrusion Detection Systems (IDS)**: act like “digital CCTV”, watch network or host activity and raise alerts.  
- **Firewalls**: work as gatekeepers, deciding which traffic is allowed in or out based on rules.  
- **Security Policies**: enforce correct usage: strong passwords, blocked dangerous sites, least-privilege access.

Key idea: **no single point of failure**.

---

### 5. SOC & SIEM

#### 5.1 Security Operations Centre (SOC)

- Central hub for defensive operations.  
- Usually runs 24/7 with rotating shifts.  
- Typical daily work:
  - Review alerts from security tools.  
  - Investigate anomalies.  
  - Escalate and handle incidents.

#### 5.2 Security Information and Event Management (SIEM)

- Central system that aggregates and normalises logs from:
  - Firewalls, IDS/WAF  
  - Servers and endpoints  
  - Applications and authentication systems  
- Functions:
  - Log collection and storage  
  - Correlation rules (detect suspicious patterns)  
  - Alerting and dashboards

Without a SIEM, a modern SOC is effectively blind.

---

### 6. FakeBank Web Discovery Attack: Practical Summary

**Scenario:** You join FakeBank’s defensive team and use their SIEM to handle a *Web Discovery Attack*.

#### 6.1 Understanding the Alert

From the Event Management view:

- **Type:** Web Discovery Attack (directory enumeration).  
- **Severity:** Medium.  
- **Indicators:**
  - Repeated requests to sensitive paths: `/admin`, `/administrator`, `/wp-admin`, `/login`, etc.  
  - Mostly 404/403 status codes.  
  - Requests come from a single external IP address.

Interpretation:  
Automated directory brute-forcing or reconnaissance, trying to discover admin panels or hidden areas of the website.

#### 6.2 Defensive Actions Taken

In the lab you applied three classic countermeasures:

1. **Block Source IP Address**  
   - Add a firewall/WAF rule to block traffic from the attacking IP (e.g. for 24 hours).  
   - Short-term containment: stops the current scan immediately.

2. **Implement Rate Limiting**  
   - Add request limits for admin endpoints (e.g. 50 requests per 60 seconds).  
   - Slows down brute-force attacks and reduces resource abuse.

3. **Update WAF Rules**  
   - Create or tune WAF rules so similar enumeration patterns are blocked in the future.  
   - Example logic:
     - Many different sensitive paths requested in a short time.  
     - Suspicious User-Agent or tool fingerprints.

#### 6.3 Key Lessons

- “Clicking buttons” is not the goal; understanding **why** each action matters is.  
- IP blocking ≈ emergency brake; rate limiting & WAF tuning ≈ long-term resilience.  
- Every incident should feed into better rules, playbooks, and training.

---

### 7. Checklist: Handling Web Discovery / Directory Enumeration Alerts

When a SIEM raises a directory-enumeration / web-discovery alert:

- [ ] Review SIEM details: source IP, timeframe, URLs, HTTP methods, status codes.  
- [ ] Confirm it is not an approved internal scan or penetration test.  
- [ ] If malicious:
  - [ ] Temporarily block the source IP or network range.  
  - [ ] Enable or tighten rate limiting on sensitive endpoints.  
  - [ ] Update WAF / IDS rules based on the observed pattern.  
- [ ] Document actions in the incident ticket.  
- [ ] Share key findings and improvements with the team.

---

### 8. Glossary (EN: ZH)

- **Defensive security / Blue team**: 防御安全 / 蓝队  
- **Offensive security / Red team**: 攻击安全 / 红队  
- **Incident Response (IR)**: 事件响应  
- **Threat Intelligence**: 威胁情报  
- **Vulnerability Management**: 漏洞管理  
- **Security Operations Centre (SOC)**: 安全运营中心  
- **Security Information and Event Management (SIEM)**: 安全信息与事件管理  
- **Intrusion Detection System (IDS)**: 入侵检测系统  
- **Web application firewall (WAF)**: Web 应用防火墙  
- **Defence in Depth**: 纵深防御  
- **Directory enumeration / Web discovery**: 目录枚举 / Web 发现  
- **Rate limiting**: 速率限制  
- **Privilege escalation (priv esc)**: 权限提升  
- **Digital forensics**: 数字取证
