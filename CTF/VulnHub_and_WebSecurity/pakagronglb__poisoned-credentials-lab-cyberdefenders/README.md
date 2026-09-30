# PoisonedCredentials Lab: LLMNR/NBT-NS Poisoning (CyberDefenders)

This repository contains a **complete, analyst-grade walkthrough** of the **PoisonedCredentials** lab from [CyberDefenders], focusing on **LLMNR/NBT-NS poisoning** and network forensic analysis using **Wireshark**.

> **Analyst:** Pakagrong Lebel  
> **Lab:** PoisonedCredentials (CyberDefenders)  
> **Project-ID:** CBDF-004  
> **Date:** 24 December 2025

---

## 🧪 Lab Overview

The PoisonedCredentials scenario simulates a **realistic internal network attack** where an adversary abuses legacy Windows name resolution protocols to:

- Poison **LLMNR** and **NBT-NS** responses  
- Capture **user credentials** over the network  
- Use those credentials to access **critical infrastructure** (e.g., an accounting/domain controller system)

The lab is built entirely around **packet-level evidence**: you are given a network capture and must reconstruct the attack using Wireshark.

---

## 🎯 Objectives

This lab and walkthrough are designed to strengthen your skills in:

1. **Protocol Vulnerability Understanding**  
   - How **LLMNR** and **NBT-NS** work  
   - Why they remain exploitable in modern Windows environments  

2. **Attack Recognition**  
   - Identifying indicators of **LLMNR/NBT-NS poisoning** in PCAPs  
   - Recognizing malicious name resolution patterns  

3. **Forensic Network Analysis (Wireshark)**  
   - Filtering for relevant traffic (LLMNR, NBT-NS, SMB)  
   - Tracing attack flows from initial error to final compromise  
   - Building a clear, evidence-backed incident timeline  

4. **Incident Scope Determination**  
   - Identifying all **affected hosts**  
   - Pinpointing **compromised accounts** and **target systems**  

5. **Threat Actor Identification**  
   - Locating the **rogue/attacker host**  
   - Understanding attacker tooling and behaviour (e.g., Responder-like activity)  

6. **Real-World Applicability**  
   - Mapping lab findings to **SOC workflows**, **blue team investigations**, and **incident response** playbooks  

---

## 🔍 Scenario Summary

A seemingly benign user action triggers the entire incident:

1. A workstation user mistypes a resource name (e.g. `FILESHAARE` instead of `FILESHARE`).
2. DNS fails to resolve the name, so Windows falls back to **LLMNR**, then potentially **NBT-NS**.
3. An attacker on the same network segment responds **faster than legitimate servers**, poisoning the victim’s cache.
4. The victim host trusts the attacker’s response and initiates **SMB authentication** to the rogue machine.
5. The attacker captures valid credentials and uses them to access a critical system (e.g. `AccountingPC`).

The walkthrough documents how to prove each of these steps using Wireshark.

---

## 🧾 Key Investigation Questions (with Outcomes)

The lab is structured around targeted questions. In the walkthrough, each answer is backed by:

- Screenshots (packet details, filters, protocol views)  
- Step-by-step **Wireshark** methodology  
- “Why this matters” analysis from a defender’s perspective  

### Q1: Mistyped Query

> **Question:** What was the mistyped query from the machine `192.168.232.162`?  
> **Answer:** `FILESHAARE`  

**Focus:**  
- Filtering LLMNR traffic  
- Identifying initial user error  
- Understanding how human mistakes can create attack surface

---

### Q2: Rogue Machine

> **Question:** What is the IP address of the rogue machine?  
> **Answer:** `192.168.232.215`  

**Focus:**  
- LLMNR/NBT-NS response analysis  
- Identifying spoofed responses  
- Distinguishing legitimate vs rogue responders

---

### Q3: Second Affected Host

> **Question:** What is the IP address of the second machine that received poisoned responses?  
> **Answer:** `192.168.232.176`  

**Focus:**  
- Scope expansion: multiple affected hosts  
- Recognizing that the attack is broader than a single victim  
- Mapping which systems trust the rogue host

---

### Q4: Compromised Account

> **Question:** What is the username of the compromised account?  
> **Answer:** `janesmith`  

**Focus:**  
- SMB / SMBv2 session setup analysis  
- Extracting usernames from authentication exchanges  
- Tracing credential exposure and potential misuse

---

### Q5: Target System

> **Question:** What is the hostname of the machine the attacker accessed via SMB?  
> **Answer:** `AccountingPC`  

**Focus:**  
- Following captured credentials to their usage  
- Identifying **critical infrastructure** targeted by the attacker  
- Understanding the jump from credential harvesting to privilege escalation / domain-level risk  

---

## 📊 Key Findings (High-Level)

The walkthrough consolidates the investigation into a set of concise findings, including:

- **Trigger:** User typo (`FILESHAARE`) led to LLMNR broadcasts  
- **Attacker Presence:** Rogue host at `192.168.232.215` actively poisoning name resolution  
- **Multiple Victims:** At least two workstations affected (`192.168.232.162`, `192.168.232.176`)  
- **Compromise:** User `janesmith` had credentials captured and relayed  
- **Impact:** Unauthorized SMB access to `AccountingPC`: with potential for **domain-level compromise**

Each finding is tied directly to captured network evidence and is framed with **risk implications** (Medium/High/Critical).

---

## 🛡️ Recommendations & Mitigations (From the Walkthrough)

The report concludes with both **immediate containment actions** and **long-term hardening measures**, including:

### Immediate Actions

- Isolate rogue host `192.168.232.215`  
- Isolate affected workstations from critical infrastructure  
- Force password reset and session invalidation for `janesmith`  
- Intensify monitoring on `AccountingPC` (and any domain controllers)  
- Preserve forensic evidence (PCAPs, logs, disk images)

### Long-Term Hardening

- **Disable LLMNR** via Group Policy  
- **Disable NBT-NS** wherever legacy support is not required  
- Strengthen **DNS** and consider **DNSSEC**  
- Implement **network segmentation** and **NAC**  
- Enforce **SMB signing** to disrupt relay attacks  
- Roll out **MFA**, **Credential Guard**, and strong password policies  
- Enhance **SIEM**, **EDR**, and protocol-level monitoring  
- Improve **user training**, naming standards, and incident reporting culture  
- Update **security policies** and **incident response playbooks** to explicitly cover LLMNR/NBT-NS poisoning

---

## 📂 Repository Contents

- `PoisonedCredentials-Lab_-LLMNR-CyberDefenders.pdf`: Full lab walkthrough and report, including:
  - Executive summary  
  - Incident overview  
  - Technical background (LLMNR/NBT-NS internals)  
  - Detailed Wireshark-driven analysis  
  - Answered lab questions with evidence  
  - Key findings table  
  - Recommendations and mitigations  
  - Conclusion and lessons learned  

> All analysis is written in a **report-style format** suitable for:
>: Blue team documentation  
>: Training and mentoring junior analysts  
>: Portfolio evidence for SOC / DFIR / security analyst roles  

---

## 🧠 Who Is This For?

This lab and walkthrough are particularly useful if you are:

- Preparing for **CompTIA Security+**, **Blue Team**, or **SOC analyst** roles  
- Transitioning into **cybersecurity** from IT support/helpdesk  
- Building a **portfolio** of hands-on, evidence-based security investigations  
- Practicing **network forensics** and **packet analysis** in realistic scenarios  

---

## ✅ How to Use This Walkthrough

1. Open the PDF and read the **Executive Summary** to understand the scenario.
2. Load the original lab PCAP (from CyberDefenders) into **Wireshark**.
3. Follow the walkthrough step-by-step:
   - Reproduce each filter  
   - Validate each finding with your own analysis  
4. Use the **methodology sections** as a template for your own future reports.
5. Adapt the structure for other network labs or real incidents in your environment.

---

## 🔗 Credits

- **Lab Creator:** CyberDefenders  
- **Walkthrough Author:** Pakagrong Lebel  
- **Publisher:** The White Hat Lab (© 2025: All Rights Reserved)

If you find this useful, consider ⭐ starring the repository and sharing it with others preparing for blue team / incident response roles.

---
