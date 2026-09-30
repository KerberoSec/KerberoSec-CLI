# <div align="center">[`Pyramid Of Pain`](https://tryhackme.com/room/pyramidofpainax)</div>
<div align="center">
 <img src="https://github.com/user-attachments/assets/cff52ec1-5850-4471-8ea8-424fc44effe3" height="250"></img>
</div>

---
|Terminology|Definition|
|:---------:|----------|
|`C2`       |Command and Control (C2) Infrastructure are a set of programs used to communicate with a victim machine. This is comparable to a reverse shell, but is generally more advanced and often communicate via common network protocols, like HTTP, HTTPS and DNS.|
|`CTI`      |Cyber Threat Intelligence is evidence-based knowledge about adversaries, including their indicators, tactics, motivations, and actionable advice against them.|
|`DNS`      |Domain Name System (DNS) is the protocol responsible for resolving hostnames, such as tryhackme.com, to their respective IP addresses.|
|`Firewall` |A security tool, hardware or software that is used to filter network traffic by stopping unauthorized incoming and outgoing traffic.|
|`FTP`      |File Transfer Protocol (FTP) is a protocol designed to help the efficient transfer of files between different and even non-compatible systems. It supports two modes for file transfer: binary and ASCII (text).|
|`HTTP`     |Hypertext Transfer Protocol (HTTP) is the protocol that specifies how a web browser and a web server communicate. Your web browser requests content from the TryHackMe web server using the HTTP protocol as you go through this room.|
|`IDS`      |Intrusion Detection System (IDS) is a system that detects unauthorised network and system intrusions. Examples include detecting unauthorised devices connected to the local network and unauthorised users accessing a system or modifying a file.|
|`IOC`      |Indicator of Compromise is a forensic artifact observed on a network or in an operating system that, with high confidence, indicates a computer intrusion.|
|`Phishing` |When emails are sent to a target(s) purporting to be from a trusted entity to lure individuals into providing sensitive information.|
|`SOC`      |Security Operations Center (SOC) is a team of IT security professionals tasked with monitoring, preventing , detecting , investigating, and responding to threats within a company’s network and systems.|

---
## `Hash Values (Trivial)`

As per Microsoft, the hash value is a numeric value of a fixed length that uniquely identifies data. A hash value is the result of a hashing algorithm.

**Most Common Hash Algorithms:**
* **MD5 (Message Digest):** was designed by Ron Rivest in 1992 and is a widely used cryptographic hash function with a 128-bit hash value. MD5 hashes are **NOT** considered cryptographically secure.
* **SHA-1 (Secure Hash Algorithm 1):** was invented by United States National Security Agency in 1995. When data is fed to SHA-1 Hashing Algorithm, SHA-1 takes an input and produces a 160-bit hash value string as a 40 digit hexadecimal number. NIST deprecated the use of SHA-1 in 2011 and banned its use for digital signatures at the end of 2013 based on it being susceptible to brute-force attacks.
* **SHA-2 (Secure Hash Algorithm 2):** was designed by The National Institute of Standards and Technology (NIST) and the National Security Agency (NSA) in 2001 to replace SHA-1. SHA-2 has many variants, and arguably the most common is SHA-256. The SHA-256 algorithm returns a hash value of 256-bits as a 64 digit hexadecimal number.

A hash is not considered to be cryptographically secure if two files have the same hash value or digest.

---

<b>*Q1: Analyse the report associated with the hash "b8ef959a9176aef07fdca8705254a163b50b49a17217a4ff0107487f59d4a35d" here. What is the filename of the sample?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Sales_Receipt 5606.xls</code>
</details>

---
## `IP Address (Easy)`

From a defense standpoint, knowledge of the IP addresses an adversary uses can be valuable. A common defense tactic is to block, drop, or deny inbound requests from IP addresses on your parameter or external firewall. This tactic is often not bulletproof as it’s trivial for an experienced adversary to recover simply by using a new public IP address.

**Fast Flux:** is a DNS technique used by botnets to hide phishing, web proxying, malware delivery, and malware communication activities behind compromised  hosts acting as proxies.

---

<b>*Q1: Read the following report to answer this question. What is the first IP address the malicious process (PID 1632) attempts to communicate with*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>50.87.136.52</code>
</details>

<b>*Q2: Read the following report to answer this question. What is the first domain name the malicious process ((PID 1632) attempts to communicate with?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>craftingalegacy.com</code>
</details>

---
## `Domain Names (Simple)`

**Punycode:** is a way of converting words that cannot be written in ASCII, into a Unicode ASCII encoding.

 A **URL Shortener** is a tool that creates a short and unique URL that will redirect to the specific website specified during the initial step of setting up the URL Shortener link.

 ---

<b>*Q1: Go to this report on app.any.run and provide the first suspicious domain request you are seeing, you will be using this report to answer the remaining questions of this task.*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>craftingalegacy.com</code>
</details>

<b>*Q2: What term refers to an address used to access websites?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Domain Name</code>
</details>

<b>*Q3: What type of attack uses Unicode characters in the domain name to imitate the a known domain?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Punycode Attack</code>
</details>

<b>*Q4: Provide the redirected website for the shortened URL using a preview: https://tinyurl.com/bw7t8p4u*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>https://tryhackme.com/</code>
</details>

---
## `Host Artifacts (Annoying)`

**Host artifacts** are the traces or observables that attackers leave on the system, such as registry values, suspicious process execution, attack patterns or IOCs (Indicators of Compromise), files dropped by malicious applications, or anything exclusive to the current threat.

---

<b>*Q1: A process named regidle.exe makes a POST request to an IP address based in the United States (US) on port 8080. What is the IP address?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>96.126.101.6</code>
</details>

<b>*Q2: The actor drops a malicious executable (EXE). What is the name of this executable?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>G_jugk.exe</code>
</details>

<b>*Q3: Look at this report by Virustotal. How many vendors determine this host to be malicious?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>9</code>
</details>

---
## `Network Artifacts (Annoying)`

A **network artifact** can be a user-agent string, C2 information, or URI patterns followed by the HTTP POST requests.

---

<b>*Q1: What browser uses the User-Agent string shown in the screenshot above?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Internet Explorer</code>
</details>

<b>*Q2: How many POST requests are in the screenshot from the pcap file?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>6</code>
</details>

---
## `Tools (Challenging)`

Attackers would use the utilities to create malicious macro documents (maldocs) for spearphishing attempts, a backdoor that can be used to establish C2 (Command and Control Infrastructure), any custom .EXE, and .DLL files, payloads, or password crackers.

Antivirus signatures, detection rules, and YARA rules can be great weapons for you to use against attackers at this stage.

Fuzzy hashing is also a strong weapon against the attacker's tools. Fuzzy hashing helps you to perform similarity analysis: match two files with minor differences based on the fuzzy hash values. 

---

<b>*Q1: Provide the method used to determine similarity between the files*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Fuzzy Hashing</code>
</details>

<b>*Q2: Provide the alternative name for fuzzy hashes without the abbreviation*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Context Triggered Piecewise Hashes</code>
</details>

---
## `TTPs (Tough)`

**TTPs** stands for Tactics, Techniques & Procedures. This includes the whole MITRE ATT&CK Matrix, which means all the steps taken by an adversary to achieve their goal, starting from phishing attempts to persistence and data exfiltration.

---

<b>*Q1: Navigate to ATT&CK Matrix webpage. How many techniques fall under the Exfiltration category?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>9</code>
</details>

<b>*Q2: Chimera is a China-based hacking group that has been active since 2018. What is the name of the commercial, remote access tool they use for C2 beacons and data exfiltration?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>Cobalt Strike</code>
</details>

---
## `Practical: The Pyramid of Pain`

<b>*Q1: Complete the static site. What is the flag?*</b>

<details>
  <summary><i>Click to reveal the answer</i></summary>
  <code>THM{PYRAMIDS_COMPLETE}</code>
</details>
