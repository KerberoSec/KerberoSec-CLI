# TryHackMe: Invite Only

**Platform:** [TryHackMe](https://tryhackme.com/room/invite-only)
**Difficulty:** Easy
**Category:** OSINT & Threat Intelligence
**Time to Complete:** ~20 minutes
**Tools Used:** TryDetectThis2.0, Google Search

---

## The Scene

You are an SOC analyst at TrySecureMe, a managed server provider. It is early morning. An L1 analyst has just escalated two suspicious findings and now it is your job to turn raw indicators into usable threat intelligence before the L3 analyst needs a full picture.

Two things land on your desk:

- A flagged IP: `101[.]99[.]76[.]120`
- A flagged SHA256 hash: `5d0509f68a9b7c415a726be75a078180e3f02e59866f193b0a99eee8e39c874f`

Your weapon of choice: TryDetectThis2.0, the team's freshly acquired threat intel platform. It looks suspiciously like VirusTotal. That is because it basically is.

---

## Reconnaissance: The Hash

The first five questions all trace back to the SHA256 hash, so that is where the investigation begins.

Paste the hash into TryDetectThis2.0 and you are immediately greeted with three panels: vendor detection count, file metadata, and general information. The file metadata panel gives you the first two answers without any effort at all.

**Q1: What is the name of the file?**
The metadata panel reads `syshelpers.exe`.

**Q2: What is the file type?**
`Win32 EXE`

Nothing alarming yet. Just a Windows executable with a name designed to look like a system utility. Classic.

---

## Following the Chain: Execution Parents and Dropped Files

Now things get interesting. Navigate to the **Relations** tab and scroll down. There is a clear section listing execution parents and dropped files, and it tells a story.

**Q3: What are the execution parents?**
Two names appear, listed chronologically: `361GJX7J` and `installer.exe`. Note both hashes here because the next question depends on one of them.

The first parent, `361GJX7J`, is a file name. The second, `installer.exe`, is the actual downloader that spawned our flagged hash. The installer is the one worth pursuing.

**Q4: What is the name of the file being dropped?**
Still in the Relations tab: `Aclient.exe`. Note its hash too.

---

## Pivoting on installer.exe

Question 5 asks you to research the **second hash from Q3**: that is the hash associated with `installer.exe`. Copy it, run a fresh search in TryDetectThis2.0, then open the Relations tab again.

The dropped files list appears. The first three malicious entries are immediately visible at the top. The fourth: `runsys.vbs`: requires a scroll down to find. Easy to miss if you stop too early.

**Q5: List the four malicious dropped files in order:**
`searchhost.exe`, `syshelpers.exe`, `nat.vbs`, `runsys.vbs`

Two executables and two Visual Basic scripts. The VBS files are persistence mechanisms: one schedules a recurring task, the other silently re-executes `syshelpers.exe` every five minutes. The attackers built in a 15-minute minimum delay before any payload runs, which is a sandbox evasion trick. Most automated analysis environments give up long before that.

---

## The IP: A Wrong Turn, Then a Right One

Switch focus to the flagged IP: `101[.]99[.]76[.]120`.

First step: remove the defanging brackets so the platform actually recognises it as an IP address. Search `101.99.76.120`.

The Details and Vendors tabs do not immediately surface a malware family name. This is the point in the investigation where most analysts pause. The answer is not where you expect it.

Open the **Community** tab.

There, in the analyst comments, someone has referenced an article tied to this IP. The metadata on that comment links the IP directly to **AsyncRAT**, the Remote Access Trojan used as the campaign's persistence and remote control payload.

**Q6: What is the malware family?**
`AsyncRAT`

The community tab earns its place here.

---

## Finding the Original Report

The Community tab referenced an article. Copy the article title and run a Google search.

The report surfaces immediately: a Check Point Research publication from June 2025.

**Q7: What is the title of the original report?**
*From Trust to Threat: Hijacked Discord Invites Used for Multi-Stage Malware Delivery*

Read: [https://research.checkpoint.com/2025/from-trust-to-threat-hijacked-discord-invites-used-for-multi-stage-malware-delivery/](https://research.checkpoint.com/2025/from-trust-to-threat-hijacked-discord-invites-used-for-multi-stage-malware-delivery/)

The remaining three questions live inside this report.

---

## Inside the Report: Three Answers, Three Searches

With the report open, `Ctrl+F` is all you need.

**Q8: Which tool did the attackers use to steal cookies from Chrome?**
Search: `steal cookies`

Chrome introduced Application-Bound Encryption in 2024 to block exactly this kind of attack. The threat actors adapted. They incorporated **ChromeKatz**, an open-source tool that bypasses Chrome's encryption by reading cookies directly from browser memory rather than the SQLite database on disk.

**Q9: Which phishing technique did the attackers use?**
Search: `phishing tech`

The answer is **ClickFix**. The site shows a fake CAPTCHA that appears broken, tells the user to manually "verify" by opening the Windows Run dialog and pasting a command from their clipboard, then pressing Enter. The command is a malicious PowerShell payload that had been silently copied to the clipboard the moment the page loaded. No file download prompt. No obvious red flag. Just a clipboard and a keyboard shortcut.

**Q10: What platform was used to redirect users to malicious servers?**
This one is in the report title itself: **Discord**.

Specifically, attackers exploited a quirk in Discord's invite system. Expired or deleted invite codes can be re-registered as vanity URLs by any server with a Level 3 Boost. Legitimate invite links shared months ago on community pages or social media now quietly redirect trusting users to attacker-controlled Discord servers.

---

## The Full Attack Chain (Brief)

For context, here is how the campaign works end to end:

1. A user follows an old Discord invite link, now hijacked by attackers.
2. They land on a fake Discord server where a bot named "Safeguard" prompts verification.
3. Verification redirects to a phishing site using the ClickFix technique, secretly copying a PowerShell command to the clipboard.
4. The user pastes and runs the command via Win+R.
5. PowerShell downloads `installer.exe` from GitHub.
6. `installer.exe` drops `nat.vbs`, `runsys.vbs`, `searchhost.exe`, and `syshelpers.exe`.
7. `syshelpers.exe` re-runs every five minutes via a scheduled task, ensuring persistence.
8. Final payloads delivered: **AsyncRAT** for remote access and **Skuld Stealer** for credential and crypto wallet theft, with ChromeKatz handling Chrome cookie extraction.

The entire chain routes through trusted services: GitHub, Bitbucket, Pastebin, and Discord itself. From a network monitoring perspective, the traffic looks unremarkable.

---

## Key Takeaways

**Defang your indicators before submitting them to a search platform.** `101[.]99[.]76[.]120` will not resolve. `101.99.76.120` will.

**The Community tab is underrated.** Vendor detections tell you a file is bad. Community comments often tell you what it is and where it came from.

**ClickFix is genuinely effective.** It removes the most visible warning sign in social engineering: the file download prompt. The user never downloads anything. They just type.

**Ctrl+F is a threat analyst's best friend.** Three questions answered in under two minutes.

---

## Answers Summary

| # | Question | Answer |
|---|----------|--------|
| 1 | File name for flagged hash | `syshelpers.exe` |
| 2 | File type for flagged hash | `Win32 EXE` |
| 3 | Execution parents (chronological) | `361GJX7J`, `installer.exe` |
| 4 | File being dropped | `Aclient.exe` |
| 5 | Four malicious dropped files (in order) | `searchhost.exe`, `syshelpers.exe`, `nat.vbs`, `runsys.vbs` |
| 6 | Malware family linked to flagged IP | `AsyncRAT` |
| 7 | Original report title | *From Trust to Threat: Hijacked Discord Invites Used for Multi-Stage Malware Delivery* |
| 8 | Tool used to steal Chrome cookies | `ChromeKatz` |
| 9 | Phishing technique used | `ClickFix` |
| 10 | Platform used to redirect users | `Discord` |

---

*Writeup by Samarth Badola: [TryHackMe Profile](https://tryhackme.com/p/samarthbadola)*
*Room: [Invite Only](https://tryhackme.com/room/invite-only) (Premium)*
