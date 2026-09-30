---
title: "TryHackMe: FlareVM: Arsenal of Tools"
date: 2026-01-28
tags: [cyber-security-101, tryhackme, walkthrough,]
difficulty: Easy
description: "Learn the arsenal of investigative tools in FlareVM."
---

## Answers

Which tool is an Open-source debugger for binaries in x64 and x32 formats? 

**x64dbg**

What tool is designed to analyze and edit Portable Executable (PE) files? 

**CFF Explorer**

Which tool is considered a sophisticated memory editor and process watcher? 

**Process Hacker**

Which tool is used for Disc image acquisition and analysis for forensic use? 

**FTK Imager**

What tool can be used to view and edit a binary file? 

**HxD**

Which tool was formerly known as FireEye Labs Obfuscated String Solver? 

**FLOSS**

Which tool offers in-depth insights into the active processes running on your computer? 

**Process Explorer**

By using the Process Explorer (procexp) tool, under what process can we find smss.exe? 

**System**

Which powerful Windows tool is designed to help you record issues with your system's apps? 

**Procmon**

Which tool can be used for Static analysis or studying executable file properties without running the files? 

**PEStudio**

Using the tool PEStudio to open the file cryptominer.bin in the Desktop\Sample folder, what is the sha256 value of the file? 

**E9627EBAAC562067759681DCEBA8DDE8D83B1D813AF8181948C549E342F67C0E**

Using the tool PEStudio to open the file cryptominer.bin in the Desktop\Sample folder, how many functions does it have? 

**102**

What tool can generate file hashes for integrity verification, authenticate the source of system files, and validate their validity? 

**CFF Explorer**

Using the tool CFF Explorer to open the file possible_medusa.txt in the Desktop\Sample folder, what is the MD5 of the file? 

**646698572AFBBF24F50EC5681FEB2DB7**

Use the CFF Explorer tool to open the file possible_medusa.txt in the Desktop\Sample folder. Then, go to the DOS Header Section. What is the e_magic value of the file? 

**5A4D**

Using PEStudio, open the file windows.exe. What is the entropy value of the file windows.exe? 

**7.999**

Using PEStudio, open the file windows.exe, then go to manifest (administrator section). What is the value under requestedExecutionLevel? 

**requireAdministrator**

Which function allows the process to use the operating system's shell to execute other processes? 

**set_UseShellExecute**

Which API starts with R and indicates that the executable uses cryptographic functions? 

**RijndaelManaged**

What is the Imphash of cobaltstrike.exe? 

**92EEF189FB188C541CBD83AC8BA4ACF5**

What is the defanged IP address to which the process cobaltstrike.exe is connecting? 

**47[.]120[.]46[.]210**

What is the destination port number used by cobaltstrike.exe when connecting to its C2 IP Address? 

**81**

During our analysis, we found a process called cobaltstrike.exe. What is the parent process of cobaltstrike.exe?  

**explorer.exe**

## Things You Should Know
FlareVM, or "Forensics, Logic Analysis, and Reverse Engineering," stands out as a comprehensive and carefully curated collection of specialized tools uniquely designed to meet the specific needs of reverse engineers, malware analysts, incident responders, forensic investigators, and penetration testers. This toolkit, expertly crafted by the FLARE Team at FireEye, is a powerful aid in unravelling digital mysteries, gaining insight into malware behaviour, and delving into the complex details within executables.

### Tools in FlareVM

**Reverse Engineering & Debugging**

Reverse engineering is like solving a puzzle backward: you take a finished product apart to understand how it works. Debugging is identifying errors, understanding why they happen, and correcting the code to prevent them.

**Ghidra**: NSA-developed open-source reverse engineering suite.

**x64dbg**: Open-source debugger for binaries in x64 and x32 formats.

**OllyDbg**: Debugger for reverse engineering at the assembly level.

**Radare2**: A sophisticated open-source platform for reverse engineering.

**Binary Ninja**: A tool for disassembling and decompiling binaries.

**PEiD**: Packer, cryptor, and compiler detection tool.

**Disassemblers & Decompilers**

Disassemblers and Decompilers are crucial tools in malware analysis. They help analysts understand malicious software’s behaviour, logic, and control flow by breaking it into a more understandable format. The tools mentioned below are commonly used in this category.

**CFF Explorer**: A PE editor designed to analyze and edit Portable Executable (PE) files.

**Hopper Disassembler**: A Debugger, disassembler, and decompiler.

**RetDec**: Open-source decompiler for machine code.

**Static & Dynamic Analysis**

Static and dynamic analysis are two crucial methods in cyber security for examining malware. Static analysis involves inspecting the code without executing it, while dynamic analysis involves observing its behaviour as it runs. The tools mentioned below are commonly used in this category.

**Process Hacker**: Sophisticated memory editor and process watcher.

**PEview**: A portable executable (PE) file viewer for analysis.

**Dependency Walker**: A tool for displaying an executable’s DLL dependencies.

**DIE (Detect It Easy)**: A packer, compiler, and cryptor detection tool.

**Forensics & Incident Response**

Digital Forensics involves the collection, analysis, and preservation of digital evidence from various sources like computers, networks, and storage devices. At the same time, Incident Response focuses on the detection, containment, eradication, and recovery from cyberattacks. The tools mentioned below are commonly used in this category.

**Volatility**: RAM dump analysis framework for memory forensics.

**Rekall**: Framework for memory forensics in incident response.

**FTK Imager**: Disc image acquisition and analysis tools for forensic use.

**Network Analysis**

Network Analysis includes different methods and techniques for studying and analysing networks to uncover patterns, optimize performance, and understand the underlying structure and behaviour of the network.

**Wireshark**: Network protocol analyzer for traffic recording and examination.

**Nmap**: A vulnerability detection and network mapping tool.

**Netcat**: Read and write data across network connections with this helpful tool.

**File Analysis**

File Analysis is a technique used to examine files for potential security threats and ensure proper file permissions.

**FileInsight**: A program for looking through and editing binary files.

**Hex Fiend**: Hex editor that is light and quick.

**HxD**: Binary file viewing and editing with a hex editor.

**Scripting & Automation**

Scripting and Automation involve using scripts such as PowerShell and Python to automate repetitive tasks and processes, making them more efficient and less prone to human error.

**Python**: Mainly automation-focused on Python modules and tools.

**PowerShell Empire**: Framework for PowerShell post-exploitation.

**Sysinternals Suite**

The Sysinternals Suite is a collection of advanced system utilities designed to help IT professionals and developers manage, troubleshoot, and diagnose Windows systems.

**Autoruns**: Shows what executables are configured to run during system boot-up.

**Process Explorer**: Provides information about running processes.
Process Monitor -Monitors and logs real-time process/thread activity.
