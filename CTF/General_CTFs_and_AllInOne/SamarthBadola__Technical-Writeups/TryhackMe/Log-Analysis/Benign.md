# TryHackMe: Benign

**Platform:** [TryHackMe](https://tryhackme.com/room/benign)
**Difficulty:** Medium
**Category:** Threat Hunting / SIEM / Log Analysis
**Time to Complete:** ~45-50 minutes (estimated: 150 minutes)
**Tools Used:** Splunk Enterprise, Google Search

---

## The Scene

The IDS just fired. Somewhere in the HR department, a host has been compromised: process execution logs suggest network enumeration tools and scheduled task utilities were run by someone who had no business running them. The forensics team managed to pull Event ID 4688 logs before the trail went cold, and those logs are now sitting in Splunk under `index=win_eventlogs`.

The network is divided into three departments:

| Department | Users |
|------------|-------|
| IT | James, Moin, Katrina |
| HR | Haroon, Chris, Diana |
| Marketing | Bell, Amelia, Deepak |

This matters. Every suspicious query you run will be measured against who *should* be doing what, and in which department.

---

## Establishing the Timeline

Before any real analysis begins, the room asks how many logs were ingested from March 2022. This is a scoping question: it sets the time window for everything that follows.

In Splunk, apply a date filter for March 2022 against the `win_eventlogs` index. The count returned is your answer, and more importantly, it tells Splunk where to focus for every subsequent query.

**Answer: 13,959 logs**

---

## Q2: The Imposter Account

With the time window set, the hunt for anomalies begins. The `All Fields` panel in Splunk is the right starting point: click it, then search for `UserName`. The field breakdown shows four distinct values across the event logs.

The distribution immediately tells a story:

![Splunk UserName field breakdown showing Moin, Katrina, James, and haroon](https://github.com/SamarthBadola/Technical-Writeups/blob/8e7f5dbb0728926040233ad3fca99bd8a88502d9/Assets/Benign/username.png)

Three users carry event volumes in the double digits. One user, `haroon`, shows a single event at 0.685%. A user generating exactly one process creation event across an entire month's worth of logs is worth examining, but the more interesting finding comes elsewhere.

The marketing department lists a user named **Amelia**. The logs contain a username **amel1a**: the letter `l` replaced with the number `1`. This is a classic account spoofing technique: pick a name that exists in the environment, substitute a visually similar character, and count on tired eyes to miss it.

Splunk's **Rare Values** report surfaces it directly.

**Imposter account: `amel1a`**

---

## Q3: Scheduled Tasks in the HR Department

Scheduled tasks in Windows are created and managed through `schtasks.exe`. An HR user running it has no obvious business justification: that process belongs to IT administration workflows, and its presence under an HR account warrants investigation.

```splunk
index="win_eventlogs" ProcessName="*schtasks.exe"
```

The `UserName` field in the results shows four accounts. Three of them are IT department users, consistent with normal administrative activity. The fourth is an HR account, and that inconsistency is the answer.

**HR user running scheduled tasks: `Haroon`**

---

## Q4 and Q5: The LOLBIN Download

LOLBIN stands for Living Off the Land Binary: a legitimate Windows system process repurposed for malicious activity. Attackers favour these because they are already present on the system, trusted by security controls, and leave a smaller footprint than dropping a custom tool.

A Google search confirms the standard Windows binaries capable of downloading files from the internet: `certutil.exe`, `powershell.exe`, `cmd.exe`, `mshta.exe` and `rundll32.exe` among others. The query below searches for the most commonly abused:

```splunk
index="win_eventlogs" ProcessName="*certutil.exe" OR ProcessName="*powershell.exe" OR ProcessName="*cmd.exe" UserName=haroon
```

![Splunk search results showing one event for haroon using certutil.exe](https://github.com/SamarthBadola/Technical-Writeups/blob/8e7f5dbb0728926040233ad3fca99bd8a88502d9/Assets/Benign/certutil.png)

One event returns. The process is `certutil.exe`, a certificate utility that doubles as a file downloader when passed the `-urlcache -split -f` flags. The username is `haroon`, placing this squarely in the HR department on a machine that should never be running certificate utilities against external URLs.

**HR user who executed the LOLBIN: `Haroon`**
**LOLBIN used: `certutil.exe`**

> **Worth noting:** This query only covers three candidate binaries. A more thorough hunt would also check `mshta.exe` and `rundll32.exe`. In this room, `certutil.exe` is the answer, but in a real investigation, the narrower query could miss something.

---

## Q6 through Q10: Reading the Log

Once the certutil event is identified, the remaining five questions all live inside that single log entry. Click through to expand it in Splunk.

**Q6: Date of execution:**
The event timestamp reads **2022-03-04**.

**Q7: Third-party file-sharing site:**
The command line field in the log entry shows `certutil.exe` pulling a file from `controlc.com`, a paste-bin style file-sharing platform. The full URL is visible in the process command arguments.

**Q8: File saved on the host:**
The command line also shows the output flag, revealing the filename written to disk: `benign.exe`... dressed up to look harmless, as the room title quietly suggests.

**Q9: The flag:**
Open the URL from the log in a browser. It leads to a ControlC paste page named `flag.txt`.

![ControlC pastebin showing flag.txt](https://github.com/SamarthBadola/Technical-Writeups/blob/8e7f5dbb0728926040233ad3fca99bd8a88502d9/Assets/Benign/controlc.png)

The page contains the THM flag pattern. Copy it as your answer.

**Q10: Full URL:**
The URL opened in Q9 is the answer. It was already sitting in the log: reading it carefully the first time would have answered Q7, Q8, Q9 and Q10 in a single pass.

---

## The Full Picture

Here is what the logs describe: `haroon`, an HR department user with no administrative remit, executed `certutil.exe` on 4 March 2022 to pull a file from a public paste site and write it to disk. Separately, `schtasks.exe` was run under the same account: likely to establish persistence by scheduling the downloaded payload to execute on a timer. The account `amel1a` operating alongside these events suggests either a second compromised machine or a deliberate obfuscation attempt using a spoofed identity.

The attack chain is short but complete: initial access, persistence via scheduled task, payload delivery via LOLBIN, and a C2 file dropped to disk. All of it visible in process creation logs, if you know which processes to query.

---

## Key Takeaways

**Event ID 4688 is one of the most underrated log sources in Windows environments.** Process creation events capture the executable name, the user who ran it, and the full command line: which is often where the malicious intent is written in plain text.

**Field value distribution in Splunk is a fast anomaly detector.** When one username appears once across thousands of events, the statistical outlier is the story. Rare Values is not just a curiosity: it is a hunt technique.

**Filtering by username after identifying the suspect process is more surgical than the reverse.** Starting with `ProcessName="*certutil.exe"` across all users gives you noise. Adding `UserName=haroon` after you already know the suspect gives you one event and a complete answer.

**LOLBINs are dangerous precisely because they are expected.** `certutil.exe` running on an IT machine during patch management is invisible. `certutil.exe` running on an HR machine at 10:38 AM is an incident.

**One log entry can answer five questions.** The habit of reading an event field by field: timestamp, process name, command line arguments, output path: is faster than running five separate queries.

---

## Answers Summary

| # | Question | Answer |
|---|----------|--------|
| 1 | Logs ingested from March 2022 | `13,959` |
| 2 | Imposter account | `amel1a` |
| 3 | HR user running scheduled tasks | `Haroon` |
| 4 | HR user who executed a LOLBIN | `Haroon` |
| 5 | LOLBIN used to download payload | `certutil.exe` |
| 6 | Date of binary execution | `2022-03-04` |
| 7 | Third-party site accessed | `controlc.com` |
| 8 | File saved from C2 server | `benign.exe` |
| 9 | Malicious pattern in downloaded file | *[redacted per TryHackMe guidelines]* |
| 10 | Full URL connected to | *[redacted per TryHackMe guidelines]* |

---

*Writeup by Samarth Badola: [TryHackMe Profile](https://tryhackme.com/p/samarthbadola)*
*Room: [Benign](https://tryhackme.com/room/benign) (Premium)*
