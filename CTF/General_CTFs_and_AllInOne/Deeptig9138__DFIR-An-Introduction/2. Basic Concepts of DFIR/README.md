# DFIR: Introduction and Basic Concepts 🕵️‍♂️💻
In this task, we will introduce **DFIR** (Digital Forensics and Incident Response) and explore some fundamental concepts that are essential in the DFIR process.

![process](https://media.licdn.com/dms/image/v2/D4D12AQEWJwdSIMuliQ/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1721309992216?e=2147483647&v=beta&t=iZXovlxKXaVQx9oTnhVFHGs2eTnf3fra675IMuKwheQ)

---

## Artifacts 🧩
Artifacts are pieces of evidence that point to an activity performed on a system. When conducting DFIR, artifacts are collected to support a hypothesis or claim about an attacker's activity. For example, if we claim that an attacker used Windows registry keys to maintain persistence on a system, we can use the registry key to support this claim. The mentioned registry key would be considered an artifact.

Artifact collection is a critical part of the DFIR process, and artifacts can be collected from several sources:
- Endpoint or Server's file system 🖥️
- Memory 🧠
- Network activity 🌐

Windows systems are commonly used for endpoints and server use-cases, such as Active Directory Domain Controllers or MS Exchange email servers. Linux systems, on the other hand, are typically used as servers, hosting services like web servers or database servers.

---

## Evidence Preservation 🔒

Maintaining the integrity of collected evidence is crucial in DFIR. The industry follows best practices to ensure that evidence is not contaminated during analysis. 

**Best Practices:**
1. **Write Protection**: The evidence should be collected and write-protected to prevent alteration. 📑
2. **Analysis**: A copy of the write-protected evidence is used for analysis. If the copy gets corrupted, we can always return to the original evidence for a new copy. 🔄

This approach ensures that the original evidence remains intact and uncontaminated during analysis.

---

## Chain of Custody 🔗

The chain of custody is a vital process that ensures the integrity of the collected evidence. Once evidence is collected, it must remain in secure custody to avoid contamination. If the evidence is handled by unauthorized individuals, it compromises the integrity of the evidence, making it unreliable for investigation.

**Example**: If a hard drive image is transferred from the person who collected it to the person who will analyze it, it should never be handled by someone unqualified. If an unauthorized person handles it, there is no guarantee that the evidence has not been contaminated during their interaction with it.

---

## Order of Volatility 🔄

Digital evidence is often volatile, meaning it can be lost forever if not captured in time. For example, data stored in a system's memory (RAM) is lost when the system shuts down. On the other hand, data stored on a hard drive is persistent and remains intact even if the system is powered off.

**Volatile Evidence Hierarchy**:
1. **RAM**: Most volatile: data is lost when the system powers off. 💨
2. **Hard Drive**: Less volatile: data is preserved even without power. 💾

When performing DFIR, it is important to understand the order of volatility and prioritize evidence collection accordingly. For example, we must capture data from RAM before capturing data from the hard drive, as RAM data is more likely to be lost.

---

## Timeline Creation 🗓️

After collecting artifacts and ensuring their integrity, the next step is to organize and present the findings. A **timeline of events** helps to lay out all activities in chronological order. This process, known as timeline creation, provides perspective to the investigation, allowing for efficient and accurate analysis.

The timeline creates a narrative of events, making it easier to understand how the incident unfolded. By combining information from various sources, we can construct a detailed story of the attacker's actions.

![timeline creation](https://i0.wp.com/dfirmadness.com/wp-content/uploads/2021/04/Super_Timeline_Title-1.png?resize=1200%2C749&ssl=1)
