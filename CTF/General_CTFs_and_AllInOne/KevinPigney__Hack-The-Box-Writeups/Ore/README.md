### Introduction

This write-up documents my investigation of the **Ore** Sherlock challenge on Hack The Box. This was my first Linux-focused DFIR write-up, so I treated the case as both an investigation and a learning opportunity for becoming more comfortable with Linux artifacts, command-line evidence, and text-based log review.

Unlike my previous write-ups, this report is going to quite light (I have none lol) on screenshots. Most of the useful evidence I came across in this case came from text-based Linux artifacts such as Grafana logs, bash_history, process listings, cron files, and the CatScale collection output. Rather than forcing screenshots of large log files into the report, or a bunch of tiny snippets from .txt files, I focused on documenting the artifact source, relevant findings, and the reasoning behind each finding.

My goal with my write-ups is not just to list the Sherlock answers, but to explain how the compromise unfolded and what I learned from analyzing a Linux host compromise involving Grafana, credential exposure, cron abuse, and cryptomining.

### Objective

My primary objective in this investigation was to determine:
- How the EC2 instance was initially compromised
- Which threat actor IP addresses were involved
- Which account was used to authenticate to the Linux host
- How the attacker staged and executed the cryptominer
- How privilege escalation occurred through a root-executed cron workflow
- Where the miner and configuration file were staged and later moved
- What anti-forensic action was taken against the staging script
- What mining pool and thread configuration were used by `xmrig`
- What Linux artifacts were useful for answering the investigation questions

### Tools Used

These are the tools and techniques I found most useful during my investigation:
- My eyes and brain :D
- VS Code (search)
- PowerShell `Select-String`, `Get-ChildItem` 
    - (grep would've been a more appropiate fit on Linux or WSL, in retrospect, I wish I used Linux for this Sherlock.)
- VirusTotal
- Open-source intelligence for identifying mining infrastructure

<br>

# Ore Sherlock: DFIR Write-up

**Hack The Box Initial Information:**

One of Forela's technical partners was managing AWS infrastructure and deployed an EC2 instance hosting Grafana. Shortly after deployment, the EC2 instance began showing sustained CPU utilization above 98%, associated with a process named `xmrig`.

The organization also provided the following context:

- The public-facing office IP was `86.5.206[.]121`
- Basic vulnerability testing and maintenance were performed after deployment
- The investigation artifacts included Linux host and CatScale collection output

<br>

**Executive Summary**

Based on the available artifacts, the EC2 instance was compromised through the exposed Grafana application. The installed Grafana version was identified as `8.2.0`, which is vulnerable to **CVE-2021-43798**, a path traversal vulnerability affecting Grafana plugin paths.

Grafana logs showed successful path traversal requests against `/public/plugins/alertlist/../../...`, including successful reads of sensitive files such as `/etc/passwd` and Grafana configuration files. The exposed Grafana configuration contained plaintext credentials for the `admin` account. The threat actor then successfully authenticated to the Grafana web panel and, because the same password was reused in the environment, was also able to authenticate to the host operating system using SSH as the local `grafana` user.

After gaining host-level access, the attacker staged a script named `injector.sh` in `/opt/automation`, used native Linux utilities such as `wget` and `curl` to deploy the `xmrig` miner and its configuration file, and abused a root-executed cron workflow involving `/opt/automation/updater.sh`. This allowed the miner to run with root privileges.

The miner was later observed running from the hidden directory `/usr/share/.logstxt/`, using `/usr/share/.logstxt/config.json` as its configuration file. Network evidence showed the miner communicating with infrastructure associated with Monero mining, and the pool was identified as `monero.herominers[.]com`. The attacker also ran `shred -u ./injector.sh`, which prevented recovery of the `injector.sh` script contents from the available artifacts.

Overall, the evidence supports a compromise chain involving Grafana path traversal, credential exposure, credential reuse, Linux host access, payload staging, cron abuse, anti-forensics, and cryptomining impact.

<br>

**Initial Artifact Review**

I began the investigation by reviewing the provided triage notes and CatScale output because the scenario specifically mentioned high CPU usage caused by a process named `xmrig`. This made process listings, command-line artifacts, and network connections immediately important.

The first major process indicator was:

```text
root 1089 1 2829088 9944 ? Ssl 14:32 00:29:28 /usr/share/.logstxt/xmrig -c /usr/share/.logstxt/config.json -- threads=0
```

This indicated that `xmrig` was not only running, but running as `root`. The path `/usr/share/.logstxt/xmrig` also stood out because `.logstxt` is a hidden directory. This suggested the miner had been placed in a location intended to blend in with normal Linux system paths while remaining less visible during casual directory review.

At this point, my investigation had two main questions:

1. How did the attacker gain access to the Grafana EC2 instance?
2. How did the miner end up running as root?

<br>

**Grafana Path Traversal and Initial Access**

Because the compromised EC2 instance hosted Grafana, I reviewed the Grafana logs for authentication events, suspicious requests, and exploitation attempts. The installed Grafana version was identified as `8.2.0`, which is vulnerable to **CVE-2021-43798**.

The Grafana log showed requests to plugin paths containing directory traversal sequences. One of the clearest successful examples was:

```text
t=2022-11-23T10:30:55+0000 method=GET path=/public/plugins/alertlist/../../../../../../../../etc/passwd status=200 remote_addr=95.181.232.32
```

The path traversal pattern appeared again when the attacker targeted Grafana configuration files:

```text
/public/plugins/alertlist/../../../../../../../../usr/share/grafana/conf/defaults.ini
```

The request to `defaults.ini` returned HTTP `200`, which confirmed that the attacker was able to read local files through the Grafana web process.

This behavior is consistent with **CVE-2021-43798**, where vulnerable Grafana plugin paths can be abused to read files from the host filesystem. The successful `200` responses were important because they showed more than scanning or probing; they showed successful file disclosure.

**Assessment:** Initial access occurred through Grafana path traversal using **CVE-2021-43798**.

**Confidence:** High

Reasoning:
- Grafana version `8.2.0` was vulnerable
- The request path matched the known traversal pattern
- Sensitive files were successfully returned with HTTP `200`
- Follow-on activity showed credential use and authenticated access

<br>

**Threat Actor IP Address Review**

One of the harder parts of this case was determining which IP addresses were truly malicious. Not every IP in the logs represented attacker infrastructure. The organization’s office public IP, `86.5.206[.]121`, was explicitly provided as known-good context and had to be separated from attacker-controlled sources.

The IPs assessed as threat actor infrastructure were:

| IP Address | Role | Evidence |
| --- | --- | --- |
| `95.181.232[.]32` | Grafana path traversal source | Successfully accessed `/etc/passwd`, `sample.ini`, and `defaults.ini` through plugin traversal |
| `195.80.150[.]137` | Grafana traversal and authenticated Grafana access | Accessed `/etc/passwd` through traversal, then logged in to Grafana as `admin` |
| `44.204.18[.]94` | Reverse shell / attacker access infrastructure | Observed in `.bash_history` as part of an `nc` reverse shell over port `80` |
| `141.95.126[.]31` | Mining-related network infrastructure | Observed as the remote endpoint for `xmrig` network activity |

The key lesson from this part of the investigation was that IPs should be classified by behavior rather than collected as a raw list. I separated exploit sources, authenticated access sources, reverse shell infrastructure, and mining infrastructure from known-good or internal addresses.

<br>

**Credential Exposure and Grafana Authentication**

After confirming successful file read through Grafana, I reviewed the exposed configuration context. The `defaults.ini` file that the attacker accessed contained plaintext credentials associated with the Grafana `admin` account.

The identified password was: `f0rela96789!`

Shortly after the successful traversal activity, the Grafana log showed a successful login as `admin` followed by an active WebSocket session from `195.80.150[.]137` showing that the attacker moved from an unauthenticated file read to authenticated application access. Likely because the same password was reused in the environment, the TA was also able to authenticate to the Linux host through SSH as the local `grafana` user (my only reasonable explanation).

This was an important reminder that file-read vulnerabilities can become much more severe when configuration files expose reusable credentials.

<br>

**Host Authentication as the Grafana User**

The TA used the `grafana` account to authenticate to the host OS. This was supported by login-related artifacts such as `lastlog.txt` and the activity observed after the Grafana credential exposure.

The compromise chain at this point became:
1. Exploit Grafana path traversal
2. Read sensitive local files
3. Recover plaintext credentials
4. Authenticate to Grafana as `admin`
5. Reuse credentials to access the host OS as `grafana`

The `grafana` user then became the primary account used for post-exploitation activity on the Linux host.

<br>

**Cron Abuse and Privilege Escalation**

After identifying that `xmrig` was running as `root`, I needed to determine how the TA elevated from the `grafana` user context to root-level execution.

The root crontab contained the following entry:

```text
30 8 * * * /opt/automation/updater.sh
```

This means `/opt/automation/updater.sh` was scheduled to run once per day at `08:30 UTC`. Because this entry was located in `/var/spool/cron/crontabs/root`, the script executes with root privileges.

The TA interacted heavily with `/opt/automation/updater.sh`, which appears to have been an administrator-created automation script that the attacker later modified or abused. By modifying a script executed by root, the attacker could cause malicious commands to run with root privileges without needing a traditional kernel exploit.

This explained why the `xmrig` process was eventually observed running as `root`.

<br>

**Payload Staging and Download Activity**

The miner deployment involved multiple native Linux tools. The TA manually used `wget` to retrieve the initial staging script, `injector.sh`. The `injector.sh` script then appears to have used `curl` to download the `xmrig` miner binary and its configuration file.

The high-level staging flow was:
1. TA operates from `/opt/automation`
2. TA downloads `injector.sh` using `wget`
3. `injector.sh` executes and retrieves `xmrig` and `config.json` using `curl`
4. Miner artifacts are staged in `/opt/automation`
5. Miner artifacts are later moved to `/usr/share/.logstxt/`
6. `injector.sh` is securely deleted using `shred`

In my artifact set, the strongest local evidence for `/opt/automation` as the initial staging location came from shell history and the TA’s activity around the modified root-executed automation workflow. A later-reviewed external write-up referenced `system.journal` evidence containing explicit `wget` and `curl` command lines, but the actual `system.journal` file was not present in my extracted artifact set. Collection logs indicated that the journal changed during acquisition, which may explain why that artifact was not available in my local evidence set.

This was one of my most useful lessons from this case: sometimes the ideal artifact is unavailable, and you must reconstruct the activity from surrounding evidence while clearly labeling what is direct evidence versus inference.

<br>

**Miner Execution and Final Location**

The active `xmrig` process was identified as PID `1089`. The process command line showed:

```text
/usr/share/.logstxt/xmrig -c /usr/share/.logstxt/config.json -- threads=0
```

The `/proc` evidence also showed that PID `1089` pointed to the same miner path:

```text
/proc/1089/exe -> /usr/share/.logstxt/xmrig
```

The miner binary hash observed in the notes was `229ffda40e7ccf873501250383b1eb66c70efe76` which returns a 39/64 detection score on VirusTotal.

This confirmed that the miner and configuration file were no longer in their initial staging location. They had been moved to: `/usr/share/.logstxt/xmrig` and `/usr/share/.logstxt/config.json`

The use of `/usr/share/.logstxt/` was suspicious because it combined a legitimate-looking system directory with a hidden child directory. This is consistent with an attempt to conceal the miner from casual filesystem review.

<br>

**Mining Configuration and Network Activity**

The `process-cmdline.txt` artifact showed that `xmrig` was launched with: `-- threads=0`

The `threads=0` value means `xmrig` was configured to automatically determine the number of CPU threads to use rather than manually limiting mining activity to a fixed number of threads. In this case, that aligned with the observed symptom from the scenario: CPU utilization remained above 98%.

Network activity showed the miner communicating with: `141.95.126[.]31:10191`

The mining pool was identified as: `monero.herominers[.]com`

In my available artifact set, the clearest local evidence was the `xmrig` network connection to `141.95.126[.]31`. I used open-source intel to associate that IP with Monero mining infrastructure. A later-reviewed write-up referenced direct artifact evidence showing the pool URL explicitly, but that direct local artifact was not available or not observed in my extracted evidence set.

For the report, I treated the mining pool conclusion as supported by local process/network evidence plus external enrichment rather than pretending I had recovered the original `xmrig` configuration contents directly.

<br>

**Anti-Forensics: injector.sh Removal**

The attacker ran the following command: `shred -u ./injector.sh`

This command explains why `injector.sh` could not be forensically recovered for analysis. The `shred` utility overwrites file contents, and the `-u` option removes the file afterward.

This does not mean every trace of the script disappeared. References to the script may still exist in shell history, journal data, command-line artifacts, or other logs. However, it does explain why the script contents themselves were not recoverable from the provided artifacts.

The presence of this command also helped refine my interpretation of the staging chain. It is more accurate to say that `injector.sh` likely handled the miner deployment logic than to say that `updater.sh` itself directly downloaded every miner artifact. The `updater.sh` file was the root-executed cron target that the TA abused, while `injector.sh` appears to have been the disposable staging script used to retrieve and deploy the miner.

<br>

**Artifact Collection Timing**

One task asked for the exact time SOC artifact collection began. I initially found a CatScale-generated timestamp:

```text
Date : Thu Nov 24 15:01:37 UTC 2022
================================ Console Errors ================================
```

However, this timestamp appears to represent when that specific CatScale output section was generated, not when collection initially began. The earliest evidence of collection beginning was found in `syslog`, where `catscale.sh` execution was recorded at: `2022-11-24 15:01:00 UTC`

This was a useful timestamp hierarchy lesson. When determining when a collection started, a system log entry showing command execution is stronger than a later timestamp inside a generated tool output section.

<br>

**Linux Artifact Lessons from This Case**

This was my first Linux-focused DFIR write-up, and the investigation forced me to rely on different artifacts than I am used to from Windows forensics.

The most useful Linux artifacts and concepts in this case were:

- Grafana application logs for initial access
- `auth`/login-style artifacts for account access
- `.bash_history` for attacker command reconstruction
- `/var/spool/cron/crontabs/root` for root cron persistence and privilege escalation
- Process listings for active malware execution
- `/proc/<pid>/exe` for validating the executable path of a running process
- Network connection artifacts for mining infrastructure
- CatScale output for live-response triage context
- Collection error logs for understanding missing or incomplete artifacts

One important lesson was the difference between the artifact existing on the source system and the artifact being successfully collected. In this case, `system.journal` appeared in collection-related references, but the actual journal file was not available in my extracted artifact set. Because of that, I had to reconstruct some activity from weaker but still useful evidence, such as shell history, process listings, and surrounding command context.

<br>

**Attack Chain Summary**

1. Grafana `8.2.0` was exposed on an AWS EC2 instance
2. The TA exploited CVE-2021-43798 using plugin path traversal
3. The TA successfully read `/etc/passwd` and Grafana configuration files
4. Exposed Grafana configuration revealed the password `f0rela96789!`
5. The TA logged into Grafana as `admin`
6. Reused credentials allowed host OS access as the `grafana` user
7. The TA operated from `/opt/automation`
8. The TA abused the root-executed `/opt/automation/updater.sh` cron workflow
9. The TA downloaded `injector.sh` using `wget`
10. `injector.sh` used `curl` to retrieve `xmrig` and `config.json`
11. Miner files were initially staged in `/opt/automation`
12. Miner files were moved to `/usr/share/.logstxt/`
13. `xmrig` executed as root with `threads=0`
14. `xmrig` communicated with Monero mining infrastructure associated with `monero.herominers[.]com`
15. The TA ran `shred -u ./injector.sh` to prevent recovery of the staging script

<br>

**Indicators of Compromise**

Network Indicators:

- `44.204.18[.]94` - Reverse shell infrastructure observed in `.bash_history`
- `95.181.232[.]32` - Grafana path traversal source
- `195.80.150[.]137` - Grafana traversal and authenticated Grafana access
- `141.95.126[.]31` - Outbound connection to Mining-related network endpoint
- `monero.herominers[.]com` - Mining pool

Host Indicators:

- `/usr/share/.logstxt/xmrig`
- `/usr/share/.logstxt/config.json`
- `/opt/automation/updater.sh`
- `/opt/automation/injector.sh`
- `/var/spool/cron/crontabs/root`

**MITRE ATT&CK Mapping**

| Tactic | Technique | Evidence |
| --- | --- | --- |
| Initial Access | Exploit Public-Facing Application: `T1190` | Grafana CVE-2021-43798 path traversal |
| Credential Access | Unsecured Credentials: Credentials in Files: `T1552.001` | Password recovered from Grafana configuration |
| Initial Access / Persistence | Valid Accounts: `T1078` | Reused credentials allowed access as `grafana` |
| Execution | Command and Scripting Interpreter: Unix Shell: `T1059.004` | Shell commands and script execution from `/opt/automation` |
| Execution / Persistence / Privilege Escalation | Scheduled Task/Job: Cron: `T1053.003` | Root cron job executing `/opt/automation/updater.sh` |
| Defense Evasion | Hide Artifacts: Hidden Files and Directories: `T1564.001` | Miner relocated to `/usr/share/.logstxt/` |
| Defense Evasion | Indicator Removal: File Deletion: `T1070.004` | `shred -u ./injector.sh` |
| Command and Control / Tool Transfer | Ingress Tool Transfer: `T1105` | `wget` and `curl` used to retrieve staging script and miner components |
| Impact | Resource Hijacking: `T1496` | `xmrig` caused sustained high CPU utilization |

<br>

**Recommended Next Steps**

If this were a live incident, recommended next steps would include:

Containment:

- Isolate the affected EC2 instance from the network
- Stop the `xmrig` process
- Block known TA IPs and mining infrastructure
- Temporarily restrict public access to Grafana
- Preserve disk, memory, and cloud logs before rebuilding

Credential and Secret Remediation:

- Rotate the exposed Grafana `admin` password
- Reset the local `grafana` account password
- Audit all locations where `f0rela96789!` may have been reused
- Review SSH keys and authorized key files for unauthorized additions
- Review AWS IAM roles and instance metadata exposure

Eradication and Recovery:

- Remove `/usr/share/.logstxt/xmrig` and `/usr/share/.logstxt/config.json`
- Review and restore `/opt/automation/updater.sh` from a trusted source
- Remove malicious cron modifications
- Patch Grafana to the latest version
- Rebuild the EC2 instance from a trusted image if compromise is confirmed

Scoping:

- Search other Linux hosts for `/usr/share/.logstxt/`
- Search for `xmrig`, `injector.sh`, and similar cron abuse patterns
- Review logs for connections to `95.181.232[.]32`, `195.80.150[.]137`, `44.204.18[.]94`, and `141.95.126[.]31`
- Review Grafana logs for additional traversal attempts
- Review authentication logs for unexpected access to the `grafana` account

Detection Engineering:

- Alert on Grafana requests containing `/public/plugins/` and traversal sequences such as `../`
- Alert on successful HTTP `200` responses for sensitive file paths like `/etc/passwd`
- Alert on `xmrig` process execution
- Alert on hidden directories under system paths such as `/usr/share/.<name>/`
- Alert on root cron jobs executing writable or recently modified scripts
- Alert on use of `shred` against recently downloaded scripts
- Alert on `wget` or `curl` retrieving shell scripts into automation directories

<br>

**Lessons Learned**

Key takeaways from this investigation:

- Linux DFIR relies heavily on text-based artifacts, which makes clean note-taking and artifact paths extremely important.
- Web application logs can be the best starting point when the initial access vector is an exposed application.
- A successful HTTP `200` response to a sensitive file path is much stronger evidence than a failed traversal attempt.
- File-read vulnerabilities become much more damaging when configuration files contain plaintext or reused credentials.
- Cron jobs are a major Linux persistence and privilege escalation target.
- `.bash_history` can be useful, but it should be treated as one artifact among many, not the only source of truth.
- Process listings and `/proc/<pid>/exe` can quickly confirm where a suspicious process is executing from.
- Hidden directories under legitimate system paths should be reviewed carefully.
- Direct evidence and inferred evidence should be labeled separately in the report.
- Missing artifacts are part of real investigations. If `system.journal` is referenced but not collected, the analyst should document the limitation and reconstruct activity from alternate sources.

Things I would improve in my next Linux investigation:

- Build an artifact inventory before deep-diving individual logs
- Check immediately for systemd journal files under `/var/log/journal/` or `/run/log/journal/`
- Use targeted keyword triage earlier to identify high-value artifacts
- Separate exploit, authentication, download, execution, persistence, and cleanup evidence into dedicated notes
- Track confidence levels for each answer earlier in the investigation
- Capture cleaner evidence snippets while solving the case instead of trying to reconstruct them after the fact

<br>

**Useful Commands & Workflow**

Linux journal review, if available:

```bash
journalctl --file ./path/to/system.journal --no-pager | grep -iE "xmrig|injector|cron|wget|curl|sudo|Accepted|Failed|grafana|shred"
```

If `journalctl` is not available or the file cannot be parsed cleanly:

```bash
strings ./path/to/system.journal | grep -iE "xmrig|injector|cron|wget|curl|sudo|Accepted|Failed|grafana|shred"
```

<br>

**Final Assessment**

The evidence supports that the EC2 instance was compromised through Grafana CVE-2021-43798. The attacker used the vulnerability to read local files, exposed credentials from Grafana configuration, authenticated as `admin`, and reused credentials to access the Linux host as the `grafana` user.

After gaining host access, the attacker staged a deployment script in `/opt/automation`, abused the root-executed `/opt/automation/updater.sh` cron workflow, deployed `xmrig`, moved the miner and configuration into `/usr/share/.logstxt/`, and ran the miner as root. The attacker then used `shred -u ./injector.sh` to reduce the likelihood of recovering the staging script.

The primary impact was unauthorized cryptomining, shown by the `xmrig` process running as PID `1089`, communicating with mining infrastructure, and contributing to sustained high CPU usage.

Overall confidence: **High**

The strongest evidence was the successful Grafana traversal activity, exposed credentials, authenticated Grafana access, root cron entry, process command line, miner path, and anti-forensic command. Some specific staging details were reconstructed from available artifacts because the `system.journal` file referenced by other write-ups was not present in my extracted evidence set.
