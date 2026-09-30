# 🛡️ MSFVenom Payload Engineering & Defense Evasion
## Module 8: Trojans and Remote Access Payloads

[![Framework: Metasploit](https://img.shields.io/badge/Framework-Metasploit-orange)](https://www.metasploit.com/)
[![Tool: MSFVenom](https://img.shields.io/badge/Tool-MSFVenom-red)](#)
[![Target: Windows | Linux](https://img.shields.io/badge/Target-Windows%20|%20Linux-blue)](#)

## 📖 Project Overview
This project focuses on the generation, customization, and deployment of remote access trojans (RATs) using **MSFVenom**. The laboratory exercises demonstrate the ability to engineer payloads for multiple platforms, manipulate file metadata to bypass signature-based detection, and manage active sessions across diverse network environments.

---

## 📄 Laboratory Documentation
The full technical report, including all terminal outputs, annotated screenshots of successful sessions, and step-by-step answers, is available here:

👉 **View MSFVenom Lab Report**

---

## 🛠️ Technical Methodology

### 1. Payload Configuration & Options Analysis
I conducted an in-depth analysis of payload settings using the `msfvenom --list-options` command to ensure correct stager configuration.
* **Bind TCP Stagers:** Identified `RHOST` as the critical parameter for setting the target's address in `windows/meterpreter/bind_tcp`.
* **Reverse TCP Stagers:** Identified `LHOST` as the required parameter for the listening address in `windows/meterpreter/reverse_tcp`.
* **Standardization:** Verified default ports for encrypted traffic, such as port **8443** for `windows/meterpreter/reverse_https` payloads.

### 2. Defense Evasion via Metadata Manipulation
To increase the success rate of payload delivery, I utilized metadata manipulation techniques to improve the social engineering aspect of the files.
* **Metadata Forgery:** Masked malicious executables as legitimate software by altering file properties. For example, a meterpreter payload was modified to display as the **ApacheBench command line utility** (Original filename: `ab.exe`).
* **Tooling:** Demonstrated how utilities like **ExifTool** can be paired with MSFVenom to spoof product names, versions, and copyright information (e.g., "Apache HTTP Server 2.2.14").

### 3. Multi-Platform Payload Generation
I engineered payloads for both Windows and Linux environments, selecting the appropriate architecture and output formats for each.
* **Linux Exploitation:** Generated x86 Linux payloads in the **ELF** format.
    * **Technical Metric:** A `linux/x86/meterpreter/reverse_tcp` payload was successfully compiled with a raw size of **123 bytes** and a final file size of **207 bytes**.
* **Windows Exploitation:** Created `windows/shell_reverse_tcp` executables and utilized **Netcat (nc)** as a lightweight listener to capture incoming reverse connections.

### 4. Post-Exploitation & Session Management
Once a breach was established, I performed various post-exploitation tasks to demonstrate full system control.
* **Session Verification:** Used the `sessions` command within `msfconsole` to verify session types and connection origins.
* **System Enumeration:** Executed `systeminfo` through a Netcat session to identify the victim's OS details (e.g., **Microsoft Windows 10 Enterprise Evaluation**).
* **Process Forensics:** Utilized the `ps` and `getpid` commands within Meterpreter to identify active process IDs and ensure stealthy execution within the victim environment.

---

## 📂 Repository Contents
* **`reports/`**: The annotated PDF documenting the MSFVenom lab questions and answers.

## ⚠️ Disclaimer
This assessment was performed in a controlled, authorized laboratory environment (Cyberium Arena) for educational purposes. Unauthorized use of these tools against systems without prior consent is strictly prohibited and illegal.
