---
title: "TryHackMe: Metasploit: Introduction"
date: 2026-01-28
tags: [cyber-security-101, tryhackme, walkthrough,]
difficulty: Easy
description: "An introduction to the main components of the Metasploit Framework."
---

## Answers

What is the name of the code taking advantage of a flaw on the target system?

**Exploit**

What is the name of the code that runs on the target system to achieve the attacker's goal?

**Payload**

What are self-contained payloads called?

**Singles**

Is "windows/x64/pingback_reverse_tcp" among singles or staged payload?

**Singles**

How would you search for a module related to Apache?

**search apache**

Who provided the auxiliary/scanner/ssh/ssh_login module?

**todb**

How would you set the LPORT value to 6666?

**set LPORT 6666**

How would you set the global value for RHOSTS  to 10.10.19.23 ?

**setg RHOSTS 10.10.19.23**

What command would you use to clear a set payload?

**unset PAYLOAD**

What command do you use to proceed with the exploitation phase?

**exploit**

## Things You Should Know

**Metasploit Framework** is a penetration-testing platform used to discover, test, and validate security vulnerabilities. Its main interface is **msfconsole**, a command-line environment where you search for modules, configure options, run exploits, and manage connections to target systems.

---

### Core Concepts

* **Vulnerability**: a weakness or flaw in a system.
* **Exploit**: code that takes advantage of that weakness.
* **Payload**: code executed on the target after exploitation (e.g., opening a shell or running commands).
* **Session**: an active connection between attacker and target after successful exploitation.

---

### Main Module Types

* **Auxiliary:** Scanning, brute-forcing, fuzzing, and information gathering.
* **Exploits:** Code that abuses vulnerabilities on specific platforms (Windows, Linux, etc.).
* **Payloads:** What runs on the target.

  * **Singles:** Self-contained.
  * **Stagers/Stages:** Small loader + larger downloaded component.
  * **Adapters:** Wrap payloads (e.g., PowerShell).
* **Encoders:** Obfuscate payloads to try to avoid signature detection.
* **Evasion:** More direct attempts to bypass security defenses.
* **NOPs:** “No operation” padding for payload alignment.
* **Post:** Actions after access (enumeration, privilege checks, credential gathering).

---

### msfconsole Basics

Launch with:

```
msfconsole
```

Common capabilities:

* Works like a limited Linux shell (`ls`, `ping`, `clear`).
* `help` and `history` for guidance.
* **Tab completion** for faster typing.
* **Context system:** selecting a module with `use` changes the prompt and settings apply only to that module unless set globally.

---

### Important Commands

* **Search modules:**

  ```
  search apache
  search type:auxiliary telnet
  ```
* **Select module:**

  ```
  use exploit/windows/smb/ms17_010_eternalblue
  ```
* **View options:**

  ```
  show options
  show payloads
  ```
* **Set parameters:**

  ```
  set RHOSTS 10.10.x.x
  set LPORT 4444
  ```
* **Global parameters:**

  ```
  setg RHOSTS 10.10.x.x
  unsetg RHOSTS
  ```
* **Clear values:**

  ```
  unset PAYLOAD
  unset all
  ```
* **Module info:**

  ```
  info
  ```
* **Run module:**

  ```
  exploit   or   run
  exploit -z   (background session)
  ```
* **Check vulnerability only (if supported):**

  ```
  check
  ```

---

### Prompts You May See

* **System shell:** normal OS terminal.
* **`msf6 >`**: main Metasploit console.
* **Module context:** `msf6 exploit(...) >`
* **`meterpreter >`**: advanced interactive payload.
* **Target shell:** commands run directly on the compromised system.

---

### Sessions Management

* List sessions:

  ```
  sessions
  ```
* Interact with one:

  ```
  sessions -i 1
  ```
* Background a session:

  ```
  background   or   CTRL+Z
  ```

---

### Typical Workflow

**Search → Use module → Show options → Set RHOSTS/LHOST/LPORT → Exploit/Run → Manage sessions → Post-exploitation.**

In short, Metasploit is a modular, command-driven framework that organizes vulnerability testing into clear steps: **find, configure, exploit, and maintain access.**
