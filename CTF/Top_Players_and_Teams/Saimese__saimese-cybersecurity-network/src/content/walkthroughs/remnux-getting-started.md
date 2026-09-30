---
title: "TryHackMe: REMnux: Getting Started"
date: 2026-01-28
tags: [cyber-security-101, tryhackme, walkthrough,]
difficulty: Easy
description: "Learn how you can use the tools inside the REMnux VM."
---

## Answers

What Python tool analyzes OLE2 files, commonly called Structured Storage or Compound File Binary Format? 

**oledump.py**

What tool parameter we used in this task allows you to select a particular data stream of the file we are using it with?

**-s**

During our analysis, we were able to decode a PowerShell script. What command is commonly used for downloading files from the internet? 

**Invoke-WebRequest**

What file was being downloaded using the PowerShell script? 

**Doc-3737122pdf.exe**

During our analysis of the PowerShell script, we noted that a file would be downloaded. Where will the file being downloaded be stored? 

**$TempFile**

Using the tool, scan another file named possible_malicious.docx located in the /home/ubuntu/Desktop/tasks/agenttesla/ directory. How many data streams were presented for this file? 

**16**

Using the tool, scan another file named possible_malicious.docx located in the /home/ubuntu/Desktop/tasks/agenttesla/ directory. At what data stream number does the tool indicate a macro present? 

**8**

Download and scan the file named flag.txt from the terminal using the command sudo wget https://MACHINE_IP/flag.txt --no-check-certificate. What is the flag? 

**Tryhackme{remnux_edition}**

After stopping the inetsim, read the generated report. Based on the report, what URL Method was used to get the file flag.txt? 

**GET**

What plugin lists processes in a tree based on their parent process ID? 

**PsTree**

What plugin is used to list all currently active processes in the machine? 

**PsList**

What Linux utility tool can extract the ASCII, 16-bit little-endian, and 16-bit big-endian strings? 

**strings**

By running vol3 with the Malfind parameter, what is the first (1st) process identified suspected of having an injected code? 

**csrss.exe**

Continuing from the previous question (Question 4), what is the second (2nd) process identified suspected of having an injected code? 

**winlogon.exe**

By running vol3 with the DllList parameter, what is the file path or directory of the binary @WanaDecryptor@.exe? 

**C:\Intel\ivecuqmanpnirkt615**

## Things You Should Know

**REMnux** is a Linux-based virtual machine designed for **malware analysis, digital forensics, and reverse engineering**. This room introduces how to use several built-in tools to safely analyze suspicious files, simulate network behavior, and preprocess memory evidence.

---

### 1. Purpose of REMnux

REMnux provides a **safe, isolated environment** filled with pre-installed forensic and malware-analysis tools. It is mainly used for:

* Static file analysis
* Dynamic/network behavior observation
* Memory forensics
* Evidence preprocessing

---

### 2. File Analysis: `oledump.py`

#### What is oledump.py?

* A **Python tool** used to inspect **OLE2 / Structured Storage files** (e.g., Word, Excel, PowerPoint).
* Helps detect **embedded macros**, scripts, and suspicious streams.

#### Key Concepts

* **Data Streams**: internal sections of a document.
* **Capital “M”** in output → indicates a **Macro** is present.
* Useful parameters:

  * `-s` → select a specific data stream.
  * `--vbadecompress` → decompress VBA macros into readable form.

#### Typical Workflow

1. Scan the file to list streams.
2. Identify macro streams.
3. Decompress macros.
4. Decode obfuscated scripts (often with **CyberChef**).
5. Look for suspicious actions such as:

   * PowerShell execution
   * File downloads
   * Hidden windows
   * Executable launches

#### Common Malware Behavior Observed

* PowerShell runs hidden.
* Execution policy bypassed.
* File downloaded from the internet.
* File saved to a temporary location.
* Executable launched automatically.

---

### 3. Fake Network Simulation: **INetSim**

#### Purpose

**INetSim (Internet Services Simulation Suite)** simulates real internet services so malware can “think” it is communicating with the internet without exposing the analyst to danger.

#### What It Simulates

* HTTP / HTTPS
* FTP
* DNS
* SMTP / POP3
* Other network services

#### Key Steps

1. Configure INetSim with the VM’s IP.
2. Start INetSim.
3. Use another machine (AttackBox) to connect.
4. Download “fake” payloads using browser or CLI (`wget`).
5. Observe behavior and logs.

#### Benefits

* Safe dynamic malware testing.
* Captures **connection logs**.
* Shows URLs, methods (GET/POST), and files requested.
* Allows analysts to study **command-and-control style behavior** safely.

---

### 4. Memory Investigation: **Volatility 3**

#### Purpose

**Volatility** is a powerful memory forensics framework used to analyze RAM images. In REMnux, it is used to **extract artifacts** and **preprocess evidence**.

#### Important Plugins

| Plugin       | Purpose                                  |
| ------------ | ---------------------------------------- |
| **PsTree**   | Shows process hierarchy (parent/child)   |
| **PsList**   | Lists active processes                   |
| **CmdLine**  | Displays command-line arguments          |
| **FileScan** | Finds file objects in memory             |
| **DllList**  | Lists loaded DLL modules                 |
| **PsScan**   | Scans for hidden or terminated processes |
| **Malfind**  | Detects potential code injection         |

#### Evidence Preprocessing

Instead of manually running each plugin, analysts can:

* Use **loop scripts** to run plugins in bulk.
* Output results into **text files** for later review.
* Speeds up investigations and enables searching/filtering later.

---

### 5. Strings Utility

The Linux **`strings`** command extracts readable text from memory images.

#### Modes Used

* **ASCII extraction**
* **16-bit Little Endian**
* **16-bit Big Endian**

This helps reveal:

* File paths
* URLs
* Commands
* Malware names
* Hidden artifacts

---

### Core Skills Learned

* Detecting and decoding **malicious macros**.
* Understanding **PowerShell-based malware behavior**.
* Simulating networks safely using **INetSim**.
* Capturing and interpreting **network logs**.
* Performing **memory forensics** with Volatility.
* **Preprocessing evidence** for faster investigations.
* Extracting hidden text data using **strings**.

---

### Overall Takeaway

The REMnux room teaches how to **analyze suspicious files, observe malware behavior safely, and preprocess forensic evidence efficiently**. It introduces essential defensive security skills used in **malware analysis, incident response, and digital forensics**, giving learners a practical foundation in real-world cybersecurity investigation workflows.
