# Challenge Name

**Platform:** Hack The Box / TryHackMe / PicoCTF / Other  
**Category:** Web / Crypto / Pwn / OSINT / Forensics / Reversing / Misc  
**Difficulty:** Easy / Medium / Hard  
**Date:** YYYY-MM-DD  
**Tags:** `tag1` `tag2` `tag3`

## TL;DR

One short paragraph describing the core idea of the challenge, the main vulnerability or trick, and the final path to the flag.

## Challenge Overview

Explain what the challenge gave you at the start:

- target IP, URL, binary, archive, image, or description
- visible functionality
- constraints or unusual details
- first assumptions

## Methodology

Describe your plan before showing commands. This helps readers understand your decision-making.

Example:

```text
The application looked static at first, so I checked for hidden paths before trying
payloads. My goal was to find either an admin panel, an upload endpoint, or leaked
source files.
```

## Recon

### Initial Enumeration

```bash
# example
nmap -sC -sV -oN nmap/initial 10.10.10.X
```

**Why this step:** explain why this command or technique was useful.

**Interesting results:**

- result 1
- result 2

### Deeper Enumeration

```bash
# example
ffuf -u http://10.10.10.X/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt
```

**What changed after this:** explain how the results affected your next move.

## Vulnerability Discovery

Describe the clue that pointed to the vulnerability.

Questions to answer:

- What behavior looked suspicious?
- What hypothesis did you test?
- What failed?
- What finally confirmed the vulnerability?

## Exploitation

Explain the exploit path step by step.

```bash
# commands used
```

```python
# exploit or helper script if needed
```

**Why it works:** connect the exploit to the underlying security issue.

**Result:** describe what you gained: flag, shell, credentials, token, source code, etc.

## Privilege Escalation

Skip this section if the challenge does not involve a shell or privesc.

### Local Enumeration

```bash
whoami
id
sudo -l
find / -perm -4000 -type f 2>/dev/null
```

**What stood out:** explain the suspicious permission, binary, credential, cron job, or config file.

### Privesc Path

```bash
# commands used
```

**Why it works:** explain the misconfiguration or vulnerability.

## Flag

```text
Flag: REDACTED
```

Do not publish active platform flags unless the platform rules allow it. Prefer redacted flags for Hack The Box and TryHackMe.

## Key Takeaways

- **What I learned:** ...
- **What was tricky:** ...
- **What I would try faster next time:** ...

## References

- [Relevant technique or documentation](#)
- [Tool documentation](#)
- [Related learning resource](#)
