# <Room Name>

**Platform:** TryHackMe
**Difficulty:** <Easy / Medium / Hard>
**Category:** <Web / Boot2Root / Forensics / etc.>
**Tags:** <technique 1>, <technique 2>, <technique 3>

> *"<optional flavour quote from the room>"*

<One or two sentences describing the overall chain.>

> **Note:** Flag values are redacted (`THM{REDACTED}`). This writeup documents the full methodology so you can reproduce each step on your own instance. If you're actively working this room, try it independently before reading on.

---

## Summary

| Stage | Vulnerability | Result |
|-------|--------------|--------|
| Initial access | <vuln> | <foothold> |
| User flag | <vuln> | <user shell> |
| Lateral / privesc | <vuln> | <higher priv> |
| Root | <vuln> | <root> |

---

## 1. Reconnaissance

### Port scan

```
nmap -p- --min-rate 1000 -T4 <TARGET> -oN nmap-allports.txt
nmap -sC -sV -p <ports> <TARGET> -oN nmap-services.txt
```

<Results and what they tell us.>

### Content discovery

```
<gobuster / feroxbuster / etc.>
```

<Notable findings.>

---

## 2. Initial Access

<The first vulnerability. Show the request/command, the result, and, importantly: *why* it works.>

---

## 3. User Flag

<How RCE / foothold was achieved. Retrieve the flag; redact the value.>

```
THM{REDACTED}
```

**User flag:** `THM{REDACTED}`: run the command above on your own instance to retrieve it.

---

## 4. Lateral Movement / Privilege Escalation

<Enumeration that revealed the next step, then the technique used. Explain the mechanism.>

---

## 5. Root

<Final escalation.>

```
THM{REDACTED}
```

**Root flag:** `THM{REDACTED}`: run the command above on your own instance to retrieve it.

---

## Attack Chain

```
Unauth  →  <step>  →  <foothold>
        →  <step>  →  <user>   [user flag]
        →  <step>  →  <priv>
        →  <step>  →  root      [root flag]
```

---

## Defensive Takeaways (Blue Team)

<For each stage, what artifact it leaves and how it would be detected.>

- **<technique>**: <detection signal / log source / rule idea>
- **<technique>**: <detection signal>

---

## Remediation

| Finding | Fix |
|---------|-----|
| <vuln> | <fix> |
| <vuln> | <fix> |
