# TryHackMe: Boogeyman 3

**Platform:** [TryHackMe](https://tryhackme.com/room/boogeyman3)
**Difficulty:** Medium
**Category:** Log Analysis / Threat Hunting
**Time to Complete:** ~60 minutes
**Tools Used:** Elastic Stack (Kibana / ELK), Google Search

---

## The Scene

Quick Logistics LLC thought they had seen the last of the Boogeyman. They hired a managed security provider. They tightened their defences. And then the Boogeyman waited: patient, quiet, already inside.

The attack started with a phishing email sent to the CEO, Evan Hutchinson. The attachment looked like a financial summary PDF. Evan was sceptical enough to notice something felt off, but opened it anyway. Nothing appeared to happen. He reported it to the security team.

Something had happened.

The security team confirmed the incident occurred between August 29 and August 30, 2023. All logs are ingested into Elastic Stack under the `winlogbeat-*` index. The task: trace every step the attacker took, from the moment Evan clicked that attachment to the moment ransomware hit the network.

---

## Setting the Stage

Before any query is written, the time window in Kibana gets set to August 29, 2023 @ 00:00:00 through August 30, 2023 @ 23:59:00. Every search in this investigation runs within that boundary. Scoping the timeline first is not a formality: it cuts noise and keeps the results honest.

---

## Phase 1: Initial Compromise

### Q1: PID of the Stage 1 Payload

The ISO file delivered to Evan's machine contains `ProjectFinancialSummary_Q3.pdf.hta`: an HTML Application masquerading as a PDF. The double extension is the disguise: to an inattentive user glancing at a filename, it reads as a PDF. The `.hta` extension at the end is what Windows actually executes.

Searching for `.hta` directly in Kibana returned no results: likely a field indexing quirk in this particular dataset. The workaround was to search for `html` instead, which returned five hits. One of them contained `ProjectFinancialSummary_Q3.pdf.hta` in the process command line, confirming the initial payload execution.

![Kibana expanded document view showing the stage 1 payload log entry](https://github.com/SamarthBadola/Technical-Writeups/blob/41afbb3d3ac0f270befbcdb612156663ca03e970/Assets/Boogeyman-3/Q1.png)

Expanding that log and adding `process.pid` as a display field surfaces the PID directly.

**Stage 1 payload PID:** *(expand the `.hta` log entry in Kibana and read the `process.pid` field directly)*

---

### Q2: Stage 1 Implanting a File to Another Location

With the initial log identified, Kibana's **View Surrounding Documents** feature becomes the primary investigation tool for the next several questions. This function shows logs immediately before and after a given event: in a threat hunt, it reconstructs the attacker's activity timeline without requiring a new query for every step.

Scrolling through the surrounding documents, one log shows the stage 1 payload copying a file to a different path on the machine. The full command line of that process is the answer.

The surrounding documents approach matters here because the logs do not broadcast their importance. There is no label saying "this is the implant command." Reading them in sequence: understanding that each process spawned by the stage 1 payload is one step further down the attack chain: is what surfaces the answer. The mindset shifts from "search for something suspicious" to "read what this process did next."

**Stage 1 implant command:** *(visible in the surrounding documents of the initial payload log)*

---

### Q3: Execution of the Implanted File

View Surrounding Documents had already revealed the implant in Q2. For Q3, a more targeted approach worked better: filtering by `process.parent.pid: 6392`: the PID of the process that executed the stage 1 payload: to find every child process it spawned.

```kql
process.parent.pid: 6392
```

Five hits returned, clustered in the early hours of August 30.

![Kibana showing process.parent.pid 6392 returning 5 hits](https://github.com/SamarthBadola/Technical-Writeups/blob/41afbb3d3ac0f270befbcdb612156663ca03e970/Assets/Boogeyman-3/Q3.png)

Reading through those five child processes in chronological order, one command line shows the implanted file being executed from its new location. The two-step pattern: implant to a quieter path, then execute from there: is deliberate. Detection rules commonly watch download directories like `Downloads` or `Desktop` for execution events. Running the payload from an unexpected location sidesteps those rules.

**Implanted file execution command:** *(visible in the process.parent.pid: 6392 results)*

---

### Q4: Scheduled Task for Persistence

Persistence mechanisms are almost always created immediately after initial execution, while the attacker still has an active session and before any detection response interrupts access. Scrolling further through the surrounding documents reveals a process command line containing `schtasks`, the Windows scheduled task utility.

Reading the command line carefully surfaces the task name.

**Scheduled task name: `review`**

---

## Phase 2: C2 Communication

### Q5: C2 IP and Port

Finding the C2 connection required a different approach. Rather than hunting by process name, the search shifted to network connection events: Event ID 3 logs filtered for `destination.ip: exists` alongside `process.name: powershell.exe`.

![Kibana showing powershell.exe network connections to 165.232.170.151 on port 80](https://github.com/SamarthBadola/Technical-Writeups/blob/41afbb3d3ac0f270befbcdb612156663ca03e970/Assets/Boogeyman-3/Q5.png)

The results show `powershell.exe` making repeated outbound connections to the same IP on the same port at consistent intervals: the hallmark of a C2 beacon. A single connection to an unknown IP is noise. The same IP appearing across multiple events at regular timing is a pattern, and patterns in network logs are what C2 traffic leaves behind.

**C2 address: `165.232.170.151:80`**

---

## Phase 3: Privilege Escalation

### Q6: UAC Bypass Process

UAC (User Account Control) is Windows' mechanism for preventing unauthorised elevation. A UAC bypass lets an attacker execute commands at high privilege without triggering the consent prompt that would normally require user approval. The question is: which process did the attacker use to achieve it?

The reasoning here started with what we already knew: the persistence mechanism was `review.dat`. Any process that the attacker used to escalate privilege would most likely be a child of that same mechanism, since that is the foothold they were operating from.

The KQL query:

```kql
process.parent.command_line:*review.dat*
```

With `process.command_line: exists` added as a filter and `process.name` and `process.command_line` set as display fields, the results showed several child processes spawned by `review.dat`.

![Kibana showing fodhelper.exe and whoami.exe as child processes of review.dat](https://github.com/SamarthBadola/Technical-Writeups/blob/41afbb3d3ac0f270befbcdb612156663ca03e970/Assets/Boogeyman-3/Q6.png)

`fodhelper.exe` appeared alongside `whoami.exe /groups`. A quick search confirmed that `fodhelper.exe` is a well-documented UAC bypass binary: it is a legitimate Windows feature installer that can be abused to launch processes at high integrity without triggering a UAC prompt. The `whoami /groups` execution immediately after is the attacker confirming they successfully elevated.

**UAC bypass process: `fodhelper.exe`**

---

## Phase 4: Credential Dumping

### Q7: GitHub Link for the Credential Dumping Tool

The logs from the `review.dat` child process search: if scrolled through rather than closed after finding `fodhelper.exe`: contain another entry: a PowerShell command downloading a tool from GitHub. The attacker pulled `mimikatz` directly from a public repository.

A targeted KQL search for `github` in the command line confirms it and surfaces the full download URL.

**GitHub link:** *(visible in the review.dat child process logs)*

---

### Q8: Credentials from the First Machine

Searching for `process.name: mimikatz.exe` within the time window returns 20 hits across the investigation period.

![Kibana showing 20 mimikatz.exe hits with lsadump: dcsync command visible](https://github.com/SamarthBadola/Technical-Writeups/blob/41afbb3d3ac0f270befbcdb612156663ca03e970/Assets/Boogeyman-3/Q8.png)

Reading through the command lines shows `mimikatz` being run with `sekurlsa::logonpasswords`: the module that extracts plaintext credentials and NTLM hashes from LSASS memory. One of the resulting log entries contains a username and an NTLM hash pair recovered from the machine.

**Credential pair: `allan.smith:<NTLM hash>`** *(full hash visible in the mimikatz logs)*

---

## Phase 5: Lateral Movement

### Q9: File Accessed from a Remote Share

This question required retracing steps rather than writing a new query. The reasoning was: after dumping credentials, the attacker would use their new session to explore. The initial payload had already spawned a PowerShell terminal: going back to that process and checking its PID (6160) gave a pivot point.

Filtering by `process.parent.pid: 6160` exposed all processes that PowerShell terminal spawned.

![Kibana showing parent PID 6160 search results with IT_Automation.ps1 visible](https://github.com/SamarthBadola/Technical-Writeups/blob/41afbb3d3ac0f270befbcdb612156663ca03e970/Assets/Boogeyman-3/Q9.png)

One log stood out: a command reading the contents of `IT_Automation.ps1` from a network share path. That is the file the attacker accessed.

**File accessed: `IT_Automation.ps1`**

---

### Q10: New Credentials from the Remote File

The log directly above the `IT_Automation.ps1` access in the PID 6160 results contained a PowerShell command constructing a `PSCredential` object with a plaintext username and password for `allan.smith`. The attacker read the automation script, found hardcoded credentials inside it, and immediately used them.

Hardcoded credentials in IT automation scripts are a known risk in enterprise environments for exactly this reason: they are readable by anyone who can access the file share, and they often carry elevated permissions because the scripts need to run without interactive prompts.

**New credentials: `allan.smith:Tr!ckyP@ssw0rd987`**

---

### Q11: Hostname of the Attacker's Lab Machine

The same credential construction log contains a `-ComputerName` parameter. That value is the hostname of the machine the attacker used for lateral movement.

**Attacker lab machine hostname:** *(visible in the PSCredential command log)*

---

### Q12: Parent Process on the Second Compromised Machine

Filtering by `user.name: allan.smith` with `process.command_line: exists` added as a display filter, and sorting logs by timestamp ascending to follow the timeline chronologically, a suspicious process appeared shortly after the credential use: `wsmprovhost.exe`.

![Kibana showing allan.smith filter with wsmprovhost.exe visible in results](https://github.com/SamarthBadola/Technical-Writeups/blob/41afbb3d3ac0f270befbcdb612156663ca03e970/Assets/Boogeyman-3/Q12.png)

`wsmprovhost.exe` is the Windows Remote Management provider host: it handles WinRM sessions. Its appearance under `allan.smith` at this point in the timeline marks the moment the attacker's lateral movement succeeded and a remote session was established on the second machine.

**Parent process on second machine: `wsmprovhost.exe`**

---

### Q13: Credentials Dumped on the Second Machine

With the `allan.smith` filter still active, scrolling through the chronological logs surfaces another `mimikatz.exe` execution.

![Kibana showing mimikatz sekurlsa: pth with NTLM hash for administrator](https://github.com/SamarthBadola/Technical-Writeups/blob/41afbb3d3ac0f270befbcdb612156663ca03e970/Assets/Boogeyman-3/Q13.png)

The attacker used `sekurlsa::pth` (pass-the-hash) with a new set of credentials extracted from the second machine.

**Second machine credential pair: `administrator:<NTLM hash>`** *(full hash visible in the log)*

---

## Phase 6: Domain Controller Compromise

### Q14: DCSync Account Beyond Administrator

Adding `agent.hostname: DC01` and `process.name: mimikatz.exe` as filters narrows the results to two events on the domain controller itself.

![Kibana showing 2 mimikatz hits on DC01 with lsadump: dcsync for backupda](https://github.com/SamarthBadola/Technical-Writeups/blob/41afbb3d3ac0f270befbcdb612156663ca03e970/Assets/Boogeyman-3/Q14.png)

One event shows `lsadump::dcsync /domain:quicklogistics.org /user:administrator`. The second shows the same module run against a different account.

A DCSync attack impersonates a domain controller's replication process to request password hashes for any account in the domain: no malware needs to touch LSASS directly. Finding it used against a non-administrator account signals the attacker was building redundant access: if the administrator account gets locked, the backup account keeps the door open.

**Second account dumped via DCSync: `backupda`**

---

## Phase 7: Ransomware Delivery

### Q15: Ransomware Download Link

This answer surfaced before the question was reached. While working through the `allan.smith` filter earlier: with logs sorted by latest timestamp to get a broad view of activity: a process called `ransomboogey.exe` appeared at the bottom of the results. The name was unusual enough to note immediately, even without a specific question attached to it.

![Kibana showing ransomboogey.exe being downloaded via PowerShell Invoke-WebRequest](https://github.com/SamarthBadola/Technical-Writeups/blob/41afbb3d3ac0f270befbcdb612156663ca03e970/Assets/Boogeyman-3/Q15_P1.png)
![ransomboogey file link](https://github.com/SamarthBadola/Technical-Writeups/blob/41afbb3d3ac0f270befbcdb612156663ca03e970/Assets/Boogeyman-3/Q15_P2.png)

The log showed a PowerShell `Invoke-WebRequest` command pulling the file from an external URL and writing it to `C:\Users\evan.hutchinson\ransomboogey.exe`. The download link was already in the log.

This is worth naming explicitly as an analyst habit: when you see something suspicious that does not answer a current question, write it down anyway. The timeline between spotting `ransomboogey.exe` and needing to answer this question was over thirty minutes of investigation. Having the note meant the answer was already in hand.

**Ransomware download link:** `http://ff.sillytechninja.io/ransomboogey.exe`

---

## The Full Attack Chain

| Time (Aug 30, 2023) | Action |
|---|---|
| 23:51 (Aug 29) | ISO delivered; `ProjectFinancialSummary_Q3.pdf.hta` executed on Evan's machine |
| 23:54 | Stage 1 payload implants file; `review.dat` scheduled task created for persistence |
| 00:19 | PowerShell terminal spawned; `IT_Automation.ps1` accessed from network share |
| 01:31 | `mimikatz` downloaded from GitHub; `sekurlsa::logonpasswords` dumps WKSTN credentials |
| 01:47 | `sekurlsa::pth` used with dumped hash; lateral movement to second machine |
| 01:48 | `lsadump::dcsync` run on DC01; `administrator` and `backupda` hashes extracted |
| 02:01 | `ransomboogey.exe` downloaded and staged on Evan's machine |
| 02:13 | Ransomware executed |

The entire operation ran in under three hours from initial execution to ransomware deployment.

---

## Key Takeaways

**"View Surrounding Documents" in Kibana is a threat hunt accelerator.** A single confirmed malicious log becomes an anchor. The surrounding events tell you what came before it and what it triggered: often answering three or four questions without writing a new query.

**Sorting by timestamp ascending is underrated.** Logs arrive in Kibana sorted newest-first by default. For timeline reconstruction, flipping to oldest-first means the attack sequence reads left to right rather than backwards. The difference in clarity is significant over a long investigation.

**Note everything suspicious even when it does not answer a current question.** `ransomboogey.exe` appeared during a search for lateral movement activity. It did not answer anything at that point. Forty minutes later it answered the final question. A log you dismiss as irrelevant now has a habit of becoming the most important piece later.

**Process parent-child relationships are the map of an attack.** Every question in this room that stumped me temporarily was solved by asking: what spawned this process, and what did this process spawn? Following that chain from the initial `.hta` payload through `review.dat` to `fodhelper.exe` to `mimikatz.exe` is the entire attack laid flat.

**Credential reuse in automation scripts is a real attack path.** The attacker did not crack `allan.smith`'s password through brute force. They read it from an IT automation script sitting on a network share. The most technically sophisticated attack chain in this room was unlocked by something as mundane as a hardcoded password in a `.ps1` file.

---

## Answers Summary

| # | Question | Answer |
|---|---|---|
| 1 | PID of the stage 1 payload process | *(visible in the `.hta` log entry: `process.pid` field)* |
| 2 | Full command line of the file implant | *(visible in surrounding documents of the HTA log)* |
| 3 | Full command line of the implanted file execution | *(visible in surrounding documents)* |
| 4 | Name of the scheduled task | `review` |
| 5 | C2 IP and port | `165.232.170.151:80` |
| 6 | UAC bypass process | `fodhelper.exe` |
| 7 | GitHub link for credential dumping tool | *(visible in review.dat child process logs)* |
| 8 | Username and hash from first machine | `allan.smith:<NTLM hash>` |
| 9 | File accessed from remote share | `IT_Automation.ps1` |
| 10 | Credentials from the remote file | `allan.smith:Tr!ckyP@ssw0rd987` |
| 11 | Hostname of attacker's lab machine | *(visible in PSCredential command log)* |
| 12 | Parent process on second machine | `wsmprovhost.exe` |
| 13 | Credentials dumped on second machine | `administrator:<NTLM hash>` |
| 14 | DCSync account beyond administrator | `backupda` |
| 15 | Ransomware download link | `http://ff.sillytechninja.io/ransomboogey.exe` |

*Full hashes and command-line values are redacted per TryHackMe writeup guidelines. Following this investigation in Kibana will surface all complete values.*

---

*Writeup by Samarth Badola: [TryHackMe Profile](https://tryhackme.com/p/samarthbadola)*
*Room: [Boogeyman 3](https://tryhackme.com/room/boogeyman3) (Premium)*
*This writeup marks the completion of the [SOC Level 1](https://tryhackme.com/path-action/soclevel1/join) learning path.*
