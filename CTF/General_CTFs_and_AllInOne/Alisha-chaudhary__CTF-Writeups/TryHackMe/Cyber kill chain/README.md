# 🔗 Cyber Kill Chain: TryHackMe Writeup

**Room:** [Cyber Kill Chain](https://tryhackme.com/room/cyberkillchainzmt)  
**Platform:** TryHackMe  
**Difficulty:** Easy  
**Category:** Threat Intelligence | Adversary Simulation | SOC Fundamentals  
**Status:** ✅ Completed  
**Frameworks Referenced:** Lockheed Martin Cyber Kill Chain®, MITRE ATT&CK®

---

## 🧠 Why I Did This Room

Understanding *how* an attacker thinks is just as important as knowing how to defend against them. Before I can build effective detection rules or respond to incidents, I need to internalize the attacker's methodology. The Cyber Kill Chain gives me that structured mental model. It's not just a framework to memorize. It's a lens I apply when hunting threats, triaging alerts in a SOC, or reconstructing breach timelines.

This room also connects directly to my work in threat intelligence, where mapping adversary TTPs (Tactics, Techniques, and Procedures) to a structured framework is central to how I analyze campaigns.

---

## 📌 Room Objectives

- Understand each phase of the Cyber Kill Chain and what an adversary is doing at every step
- Learn to recognize attack indicators across different stages
- Apply the framework to a real-world breach scenario (Target, 2013)
- Understand how disrupting the Kill Chain at *any* phase can stop an attack entirely

---

## 🗺️ The Kill Chain: Phase by Phase

### Phase 1: Reconnaissance

*Reconnaissance is the foundation of precision attacks, where intelligence shapes opportunity.*

Reconnaissance is the attacker's intelligence-gathering phase and it's largely invisible to defenders. This is where adversaries figure out *who* to target, *what* systems they're running, and *how* to get in.
Poor recon leads to sloppy attacks where as a well-informed adversaries craft highly targeted, believable payloads that are far harder to detect.

I learned to distinguish between two types:
| Type               | Description                           | Example                                                  |
|--------------------|---------------------------------------|----------------------------------------------------------|
| **Passive Recon**  | No direct interaction with the target | WHOIS lookups, social media scraping, breach data review |
| **Active Recon**   | Direct contact with the target        | Port scanning, banner grabbing, social engineering       |

**Key tools an adversary might use:**
- `theHarvester` - gathers emails, subdomains, IPs, and URLs from public data sources
- `Hunter.io` - finds contact information tied to a specific domain
- ` **OSINT Framework** ` - a web-based interface consolidating OSINT tools across categories

Email harvesting stood out to me as particularly dangerous here. An attacker who collects employee emails can move directly from passive recon into a spearphishing campaign, which is exactly what happened in the Target breach.

> **Q: What is the web-based tool that consolidates OSINT resources?**  
> **A:** `OSINT Framework`

> **Q: What is the process of collecting email addresses from public sources called?**  
> **A:** `Email harvesting`

📸 *Screenshot: OSINT Framework tool interface*  
*[Image: OSINT Framework]*

---

### Phase 2: Weaponization

Once attackers gather sufficient intelligence, they weaponize that information offline, preparing their attack before ever engaging with the victim. This is where malware, exploits, and payloads are crafted or purchased, often from underground markets.

**Key terminology:**

- **Malware**: software designed to damage, disrupt, or gain unauthorized access
- **Exploit**: code that takes advantage of a specific vulnerability
- **Payload**: the malicious code that actually executes on the victim's machine

**Common weaponization tactics:**
- Embedding malicious **macros** (VBA scripts) inside Microsoft Office documents that execute when opened
- Infecting USB drives and distributing them in public spaces
- Configuring Command and Control (C2) infrastructure ahead of the attack
- Crafting convincing phishing templates or fake OAuth consent apps

The macro technique is particularly effective because Office documents feel routine and trusted which is exactly what makes them reliable delivery vehicles.

> **Q: What term refers to automated scripts embedded in Office documents that can be exploited by attackers?**  
> **A:** `Macro`

📸 *Screenshot: Weaponization task completion*  
*[Image: Weaponization]*

---

### Phase 3: Delivery

Delivery is how the weaponized payload reaches the victim. Even the most sophisticated malware is useless until it lands on a target machines so this phase is a critical choke point for defenders.

**Followings are the three primary delivery methods I studied:**

1. **Phishing Email**: A malicious email with a link or attachment. Spear phishing targets specific individuals; broad phishing casts a wider net.
2. **USB Drops**: Physical delivery. An attacker might brand USB drives with a company logo and mail them to employees, betting on curiosity overriding caution.
3. **Watering Hole Attack**: Rather than going to the victim, the attacker compromises a website the target regularly visits. Victims unknowingly download malware through drive-by downloads or malicious pop-ups.

Successful watering hole attacks are built on meticulous research into where a target audience spends time online. Combined with patience, this approach highlights the need for organizations to secure the entire browsing environment, not just email channels.

> **Q: What do you call an attack that targets a specific group by infecting their frequently visited website?**  
> **A:** `Watering hole attack`

📸 *Screenshot: Delivery task completion*  
*[Image: Delivery]*

---

### Phase 4: Exploitation

This is the moment the attacker's code runs. Exploitation leverages a vulnerability to gain initial access on the target system.

**Key exploitation techniques:**
- **Malicious macro execution**: ransomware or a backdoor launches when the victim opens a phishing document
- **Zero-day exploits**: targeting unknown, unpatched flaws; defenders have no signature and no patch to rely on
- **Known CVEs**: exploiting publicly documented vulnerabilities that haven't been patched on the target environment

**Post-exploitation indicators I'd watch for as a SOC analyst:**
- Unexpected process spawns
- Registry changes or new services being created
- Suspicious command-line arguments appearing in logs

Zero-days are a reminder that not every threat arrives with a recognizable fingerprint. Their ability to bypass signature-based controls reinforces why I value behavioral detection and anomaly monitoring in my SIEM work.

> **Q: What is the term for an attack exploiting a software vulnerability unknown to vendors?**  
> **A:** `Zero day`

📸 *Screenshot: Exploitation task completion*  
*[Image: Exploitation]*

---

### Phase 5: Installation

Breaking through the door is not the end goal. In the installation phase, attackers establish persistence by creating mechanisms such as scheduled tasks, startup entries, services, or hidden backdoors that allow them to regain access later.
The objective is to maintain a foothold within the environment, even after the original intrusion vector has been discovered and remediated.

**Persistence mechanisms covered:**

- **Web shells**: malicious scripts (`.php`, `.asp`, `.jsp`) planted on web servers. Their familiar file extensions make them easy to disguise as legitimate files.
- **Backdoors via Meterpreter**: Metasploit's payload that gives an attacker an interactive remote shell
- **Windows Service Manipulation**: creating or modifying services to execute malicious scripts on a schedule (`T1543.003` in MITRE ATT&CK)
- **Registry Run Keys / Startup Folder**: entries that cause the payload to execute every time a user logs in

One technique I found particularly clever: **Timestomping**. This modifies file timestamps (created, modified, accessed) to make malware look like it's been on the system for years directly undermining forensic timeline analysis. It maps to `T1070.006` in ATT&CK.

> **Q: What technique modifies file timestamps to hide malicious files from forensic investigators?**  
> **A:** `Timestomping`

> **Q: What malicious script can be planted on a web server to maintain remote access?**  
> **A:** `Web shell`

📸 *Screenshot: Installation task completion*  
*[Image: Installation]*

---

### Phase 6: Command & Control (C2)

With persistence established, the attacker opens a **C2 channel**: a communication line between the compromised host and their server. This is also called **C2 beaconing** because the infected machine periodically checks in with the attacker.

**Common C2 channels:**

| Channel                       | How It Works                                                           | Why Attackers Use It                                    |
|-------------------------------|------------------------------------------------------------------------|---------------------------------------------------------|
| **HTTP/HTTPS (ports 80/443)** | Malicious traffic blends with normal web traffic                       | Evades basic firewall rules                             |
| **DNS Tunneling**             | Infected host makes constant DNS queries to attacker-controlled domain | DNS is rarely blocked; hides in plain sight             |

DNS tunneling is the one I'd be most alert to in a SOC environment. It's subtle, it hides within traffic that's assumed to be benign, and it's frequently overlooked.
Detecting abnormal DNS query volumes or unusual domain patterns is a key behavioral indicator exactly the kind of thing I'd build SIEM correlation rules around.

> **Q: What is C2 communication where the victim makes regular DNS requests to an attacker-controlled server?**  
> **A:** `DNS Tunneling`

📸 *Screenshot: C2 task completion*  
*[Image: C2]*

---

### Phase 7: Actions on Objectives

This is the point where preparation turns into impact. After investing time in gaining access and maintaining a foothold, the attacker finally executes the mission they set out to accomplish.

**Possible attacker objectives:**
- Credential harvesting
- Privilege escalation (e.g., gaining domain admin access from a standard workstation)
- Internal reconnaissance: probing internal systems for further vulnerabilities
- Lateral movement across the network
- Data exfiltration
- Deleting **Shadow Copies** (Microsoft's backup snapshot technology) to prevent recovery
- Data corruption or destruction

The deletion of Shadow Copies is a signature ransomware tactic. it ensures victims can't restore files without paying. Understanding this helps me prioritize monitoring for `vssadmin delete shadows` in SIEM detection rules.

> **Q: What Microsoft technology creates backup copies or snapshots of files even when they're in use?**  
> **A:** `Shadow copy`

📸 *Screenshot: Actions on Objectives task completion*  
*[Image: Actions on Objectives]*

---

## 🎯 Practical: Target Data Breach (2013) Kill Chain

This was where the framework moved from theory to reality. By analyzing the 2013 Target breach through the Cyber Kill Chain, each phase became tangible. 
The attack exposed approximately 40 million credit and debit card accounts between November 27 and December 15, 2013, and ultimately resulted in $18.5 million in settlements, the largest data breach settlement of its era.

The task gave me six techniques and asked me to place each one in the correct Kill Chain phase. Here's how I worked through it:

---

**My reasoning, phase by phase:**

**Weaponization → (off-scene, before the attack)**  
The attacker built and prepared their tools before ever contacting Target. This phase happens in the background and isn't represented by a single technique in this scenario but it's the foundation everything else rests on.

**Delivery → `spearphishing attachment`**  
This was my starting point. The attacker didn't go directly after Target. They sent a malicious email to a third-party HVAC vendor (Fazio Mechanical) that had network access to Target's systems.
The phishing email was the initial vehicle. Delivery made the most sense here because this is *how the payload arrived*, not how it ran.

**Exploitation → `exploit public-facing application`**  
Once the vendor's credentials were compromised, the attacker used them to find and exploit a vulnerability in Target's externally accessible systems, essentially finding an unlocked door and walking through it.

**Installation → `dynamic linker hijacking`**  
This one tripped me up initially because the term sounds like something from the exploitation phase. But once I understood what it actually does, disguising malware as a legitimate system file so it runs without raising flags. It clearly belongs in Installation.
The goal isn't initial access. it's hiding the malware so it *stays* on the system undetected.

**Execution → `powershell`**  
The attacker used PowerShell, a tool that's natively built into Windows to run commands inside Target's environment. I initially thought this could be Weaponization since the attacker was "using Target's own tools against them," but Weaponization happens *before* the attack, offline. 
PowerShell was pulled the trigger *inside* the system so that's Execution.

**Command & Control → `fallback channels`**  
The attacker maintained a backup communication route in case their primary C2 channel was detected or cut off. This is the attacker's insurance policy. If defenders notice and block the main channel, the fallback keeps them in control.

**Actions on Objectives → `data from local system`**  
This is what the entire attack was building toward, pulling credit and debit card data directly off Target's point-of-sale systems. Everything else was setup for this moment.

---

**Final mapping:**

| Kill Chain Phase       | Technique                           |
|------------------------|-------------------------------------|
| Delivery               | `spearphishing attachment`          |
| Exploitation           | `exploit public-facing application` |
| Installation           | `dynamic linker hijacking`          |
| Execution              | `powershell`                        |
| Command & Control      | `fallback channels`                 |
| Actions on Objectives  | `data from local system`            |

📸 *Screenshot: Completed Target breach Kill Chain on static site*  
*[Image: Target Breach Kill Chain]*

> 🏁 **Flag:** `THM{7HR347_1N73L_12_4w35om3}`

---

## 🔍 Key Takeaways

**1. Break the chain early, break the attack entirely.**  
An attacker needs to complete *all* phases to succeed. Defenders only need to disrupt *one*. This asymmetry is the framework's most powerful insight. it reframes defense as a multi-layered opportunity rather than a single perimeter problem.

**2. Reconnaissance is where intel-driven defense pays off.**  
If I can detect or limit what an attacker learns during recon, I degrade the quality of every subsequent phase. This is why attack surface management and OSINT monitoring on your own organization matters and why it's a core part of my threat intelligence work.

**3. Behavioral detection beats signature detection.**  
Zero-days, timestomping, and DNS tunneling all have one thing in common: they evade signature-based tools. Anomaly detection, SIEM behavioral rules, and proactive threat hunting are the real answers.

**4. The Kill Chain and MITRE ATT&CK are complementary, not competing.**  
The Kill Chain gives me high-level phase mapping. ATT&CK gives me granular technique-level detail. In practice, I use both together Kill Chain to understand *where in the attack* something happened, ATT&CK to understand *exactly how* it happened.

**5. Technique names can be intimidating, the concepts aren't.**  
`Dynamic linker hijacking` sounds complex. "Disguising malware as a legitimate system file" is something anyone can visualize. Getting comfortable translating between formal terminology and plain reasoning is a skill in itself
and one that matters a lot when communicating findings to non-technical stakeholders.

---

## 🛠️ Tools & Techniques Encountered

| Tool / Technique           | Category                 | Purpose                                                 |
|----------------------------|--------------------------|---------------------------------------------------------|
| `theHarvester`             | OSINT / Recon            | Email, subdomain, IP enumeration from public sources    |
| `Hunter.io`                | OSINT / Recon            | Domain-based contact discovery                          |
| OSINT Framework            | OSINT / Recon            | Consolidated OSINT tool directory                       |
| Malicious Macros (VBA)     | Weaponization            | Payload delivery via Office documents                   |
| Meterpreter                | Installation / C2        | Interactive remote shell via Metasploit                 |
| Timestomping (`T1070.006`) | Defense Evasion          | Modifying file timestamps to evade forensic analysis    |
| Web Shell                  | Persistence              | Remote server access via planted script                 |
| DNS Tunneling              | C2                       | Covert communication hidden within DNS traffic          |
| PowerShell                 | Execution                | Native Windows tool used for post-exploitation commands |
| Dynamic Linker Hijacking   | Installation             | Disguising malware as a legitimate system file          |
| Shadow Copy deletion       | Actions on Objectives    | Destroying backup snapshots to prevent recovery         |

---

## 📂 Screenshots

All screenshots are in the [`screenshots/`](./screenshots/) folder, numbered in Kill Chain phase order.

```
screenshots/
├── 01-recon-osint-framework.png
├── 02-weaponization-macro.png
├── 03-delivery-watering-hole.png
├── 04-exploitation-zeroday.png
├── 05-installation-persistence.png
├── 06-c2-dns-tunneling.png
├── 07-actions-shadowcopy.png
└── 08-target-breach-killchain-complete.png
```

---

## 📚 Further Reading

- [Lockheed Martin Cyber Kill Chain®](https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [Microsoft: Web Shell Attacks](https://www.microsoft.com/security/blog/2021/02/11/web-shell-attacks-continue-to-rise/)
- [Varonis: What is OSINT?](https://www.varonis.com/blog/osint)
- [T1543.003: Create or Modify System Process: Windows Service](https://attack.mitre.org/techniques/T1543/003/)
- [T1070.006: Indicator Removal: Timestomp](https://attack.mitre.org/techniques/T1070/006/)

---

*Part of my [TryHackMe Writeups](https://github.com/Alisha-chaudhary/TryHackMe-Writeups) collection. Written for educational purposes.*
