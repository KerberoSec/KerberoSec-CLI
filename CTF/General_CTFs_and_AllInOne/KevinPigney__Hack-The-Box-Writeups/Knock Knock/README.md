### Introduction

This write-up documents my investigation of the **Knock Knock** Sherlock challenge on Hack The Box. In addition to answering the challenge questions, I used this investigation as practice for building a clean DFIR narrative from just a .pcap file.

Rather than treating the case as a simple answer guide, my reports focus on how I approach the investigation, what artifacts I review, how I correlate the attacker’s actions across FTP, SSH, HTTP, GitHub, and recovered file contents, and how I reconstruct the attack chain.

The investigation centered on a Forela development server that was accidentally exposed to the internet. Based on the network evidence, the attacker did not appear to need a traditional exploit. Instead, they discovered exposed services, successfully authenticated over FTP with weak credentials, recovered sensitive configuration data, used that data to access a hidden internal FTP service, pivoted through leaked GitHub repository history, and eventually caused the victim server to download a ransomware payload.

### Objective

My primary objective in this investigation was to determine:
- Which services were externally reachable
- How the attacker obtained valid credentials
- How the hidden internal FTP service was accessed
- What sensitive files were retrieved from the server
- Whether additional credentials were exposed/leaked through recovered files or GitHub history
- How the attacker established SSH access
- Whether ransomware staging or payload download activity occurred
- What evidence supports each phase of the attack chain

### Tools Used

These are the tools I found useful in this investigation:
- Wireshark
- NetworkMiner
- VirusTotal
- Git
- VS Code
- 7-Zip

<br>

# Knock Knock Sherlock: DFIR Write-up

**Hack The Box Initial Information:**

A critical Forela Dev server was targeted by a threat group. The Dev server was accidentally left open to the internet which it was not supposed to be. The senior dev Abdullah told the IT team that the server was fully hardened and it's still difficult to comprehend how the attack took place and how the attacker got access in the first place. Forela recently started its business expansion in Pakistan and Abdullah was the one IN charge of all infrastructure deployment and management. The Security Team need to contain and remediate the threat as soon as possible as any more damage can be devastating for the company, especially at the crucial stage of expanding in other region. Thankfully a packet capture tool was running in the subnet which was set up a few months ago. A packet capture is provided to you around the time of the incident (1-2) days margin because we don't know exactly when the attacker gained access. As our forensics analyst, you have been provided the packet capture to assess how the attacker gained access.

<br>

**Executive Summary**

Based on the available packet capture and recovered file contents, the attacker first performed a broad TCP SYN scan against the victim server `172.31.39[.]46` from `3.109.209[.]43`. Several services responded as open, including FTP, SSH, MySQL, Redis, and InfluxDB.

After identifying FTP on port `21`, the attacker conducted a password spraying attack against multiple user accounts. The account `tony.shephard` successfully authenticated over FTP using the password `Summer2023!` at `2023-03-21 10:50:20.870888Z`.

Once authenticated, the attacker enumerated the FTP server and retrieved a file named `.backup` at `10:52:03`. That file was significant because it exposed both configuration details and credentials. Most importantly, it contained a port knocking sequence of `29999`, `50234`, and `45087`, which allowed the attacker to open access to a hidden internal FTP service on port `24456`.

After performing the port knocking sequence at `10:58:50`, the attacker accessed the hidden critical service at approximately `11:00:01` and retrieved multiple sensitive files between `11:02:07` and `11:05:58`. These files included `.archived.sql`, `Tasks to get Done.docx`, `reminder.txt`, `.reminder`, and `/etc/passwd`.

The recovered `.reminder` file pointed toward possible sensitive data in the Forela GitHub repository. I pivoted to the repository, reviewed `internal-dev.yaml`, and then checked previous commits. A prior version of the file exposed SSH credentials for the `cyberjunkie` account. Since `/etc/passwd` showed that `cyberjunkie` had `/bin/bash` configured as its shell, the account was capable of interactive login.

The attacker later established an SSH connection at `11:25:42`, likely using the exposed `cyberjunkie` credentials. Finally, at `11:42:34`, the victim server made an outbound HTTP request to `13.233.179[.]35` using `Wget/1.21.2` to download `/PKCampaign/Targets/Forela/Ransomware2_server.zip`. After exporting the ZIP and reviewing the compressed README, I identified the ransomware as part of the GonnaCry family.

Overall, the evidence supports a compromise chain driven by exposed internet-facing services, weak credentials, sensitive configuration leakage, port knocking configuration exposure, credential reuse or credential disclosure, and ransomware payload retrieval.

<br>

**Timeline of Key Events**

| Timestamp | Event | Source Artifact | Interpretation |
| --- | --- | --- | --- |
| `2023-03-21 10:42:23` | `3.109.209[.]43` began sending TCP SYN requests to the victim | PCAP / Wireshark | Nmap-like port scan against exposed server |
| `2023-03-21 10:42:23+` | Ports `21`, `22`, `3306`, `6379`, and `8086` responded as open | PCAP / NetworkMiner | Exposed services available to the attacker |
| `2023-03-21 10:50:20.870888Z` | Attacker successfully logged in over FTP as `tony.shephard` | FTP control traffic | Password spraying succeeded |
| `2023-03-21 10:51:04.431834Z` | Attacker logged in again over FTP | FTP control traffic | Continued FTP enumeration |
| `2023-03-21 10:52:03` | Attacker downloaded `.backup` | FTP control/data traffic | Backup file exposed credentials and port knocking configuration |
| `2023-03-21 10:58:50` | Attacker performed port knocking on `29999`, `50234`, and `45087` | PCAP / TCP traffic | Knock sequence used to open hidden service |
| `2023-03-21 11:00:01` | Hidden internal service on port `24456` became accessible | PCAP / TCP traffic | Port knocking successfully allowed access |
| `2023-03-21 11:02:07 - 11:05:58` | Attacker retrieved multiple sensitive files | FTP control and passive data streams | Sensitive data collection and exfiltration over FTP |
| `2023-03-21 11:25:42` | SSH connection established from attacker to victim | PCAP / SSH traffic | Likely interactive access using leaked `cyberjunkie` credentials |
| `2023-03-21 11:42:34` | Victim requested `Ransomware2_server.zip` from `13.233.179[.]35` using Wget | HTTP stream | Ransomware payload retrieval observed |

<br>

**Initial Packet Capture Review**

To begin my investigation, I opened the provided packet capture in Wireshark since the scenario did not contain any host disk images or endpoint telemetry. This meant that the network traffic was going to have be the primary source of evidence for reconstructing what occurred on this server.

The first thing I wanted to identify was whether the victim server was externally exposed and if there was any obvious signs of reconnaissance activity occurring before authentication or file transfer activity.

Key hosts identified:
- Victim: `172.31.39[.]46`
- Attacker: `3.109.209[.]43`
- Ransomware staging host: `13.233.179[.]35`

The packet capture showed the victim server receiving repeated TCP SYN requests from `3.109.209[.]43` beginning at `2023-03-21 10:42:23`. The SYN requests were sent against many ports in numerical order, which resembled automated port scanning behavior, likely from a tool such as Nmap.

At this stage, the evidence suggested the attacker first discovered the server through external reconnaissance rather than by exploiting a known vulnerability immediately.

<br>

**Port Scan and Exposed Services**

After identifying the scan behavior, I used NetworkMiner to review which ports the attacker might have identified as open. This helped me determine which services were externally reachable and therefore a part of the attack surface.

Open ports observed:
- `21` - FTP
- `22` - SSH
- `3306` - MySQL
- `6379` - Redis
- `8086` - InfluxDB

This was significant because several of these services should generally not be exposed directly to the internet without strict access control. FTP stood out immediately because it is commonly targeted for credential attacks and may expose sensitive files if permissions or credentials are weak. My next step was checking if there was any evidence of suspicious activity related to the known attacker IP attempts over any of these ports, and identify the initial access vector of this attack.

<br>

**FTP Password Spraying and Successful Login**

After confirming that FTP was exposed on port `21`, shortly after the port scanning was over, there was lots visible FTP traffic coming from `3.109.209[.]43` indicating the attacker was targeting FTP and attempting to authenticate.

The attacker conducted a password spraying attack against the following accounts:
- `alonzo.spire`
- `tony.shephard`
- `lin.bayley`

The spray was successful against `tony.shephard` at `2023-03-21 10:50:20.870888Z` using the password: `Summer2023!`

This was the first confirmed point of initial access. The attacker did not need to exploit the FTP service itself; they were able to authenticate with valid credentials. The fact that there was multiple authentication requests at the same time for several different accounts using the same small list of seasonal passwords made the activity consistent with password spraying behavior, where an attacker tries a small number of common passwords across multiple accounts to avoid lockouts.

<br>

**Backup File Discovery and Configuration Leakage**

After the successful FTP login, the attacker logged in again at `10:51:04.431834Z` and continued enumerating the FTP server.

At `10:52:03`, the attacker downloaded a file named: `.backup`

This file was critical to the investigation because it contained configuration data and exposed credentials for another backup server. The most important section exposed the configuration for an internal FTP service protected by port knocking:

This `.backup` file explained how the attacker was able to move from regular FTP access on port `21` to a hidden service on port `24456`. The file essentially gave the attacker the exact port knocking sequence required to modify the firewall rule and allow their external source IP to access the protected service.

<br>

**Port Knocking and Hidden FTP Access**

After recovering the `.backup` file, I reviewed the packet capture for evidence that the attacker actually used the exposed port knocking sequence.

At `10:58:50`, the attacker sent SYN packets to the following ports in sequence: `29999` -> `50234` -> `45087`.

This matched the sequence found in `.backup`. Shortly afterward, at approximately `11:00:01`, the attacker accessed the hidden internal service on port `24456`. This correlation was important because it showed that `.backup` was not simply an exposed sensitive file; it was actively used by the attacker to unlock another service. The sequence of events was:

1. FTP login as `tony.shephard`
2. Download `.backup`
3. Read exposed port knocking sequence
4. Send SYN packets to `29999`, `50234`, and `45087`
5. Gain access to hidden FTP service on `24456`

At this point, the attacker had escalated from basic FTP access to a more sensitive internal file service.

<br>

**Sensitive File Retrieval Over Hidden FTP**

Once the attacker gained access to the hidden service on port `24456`, they began retrieving multiple files from the victim server between `11:02:07` and `11:05:58`.

Files retrieved included:
- `.archived.sql`
- `Tasks to get Done.docx`
- `reminder.txt`
- `.reminder`
- `/etc/passwd`

This activity represents direct data exposure. The attacker was not just browsing the service; they were retrieving files that contained operational details, credentials, user information, and internal notes.

The `/etc/passwd` file was especially useful from an investigative perspective because it showed which Linux accounts existed on the host and which accounts had interactive shells. Notably, the `cyberjunkie` account had `/bin/bash` configured as its shell, which meant the account could potentially support interactive SSH access further down the attack chain if valid credentials were to be recovered.

<br>

**Recovering File Contents from Passive FTP Streams**

To recover the contents of the files retrieved over FTP, I first located the relevant FTP control stream. One example was: `tcp.stream eq 77913`

The control stream showed FTP commands such as `EPSV` and `RETR`, but the actual file contents were not stored in that control stream. Since FTP passive mode uses separate data connections, I had to pivot from the `RETR` command to the associated passive FTP data stream.

For example, when the attacker requested `.reminder`, the control stream showed:

```text
RETR .reminder
attacker port 38032 → victim FTP port 24456
```

A couple of packets later, I identified the related passive FTP data connection:

```text
victim passive FTP port 44249 → attacker port 49306
```

Following the associated TCP stream revealed the contents of `.reminder` in plaintext:

```text
tcp.stream eq 77983
```

This became the repeatable workflow for recovering each file:

1. Find the FTP control stream
2. Identify the `RETR` command for the file being retrieved
3. Locate the related passive FTP data connection
4. Follow the passive TCP stream
5. Export or read the file contents

The key takeaway was that `RETR` showed which file was requested, but the actual file contents were in the separate passive FTP data stream, not the FTP control stream.

<br>

**Recovered File Content Review**

After recovering the files from the passive FTP streams, I reviewed them to determine what sensitive information the attacker may have obtained.

The `.archived.sql` file contained a MySQL dump for a database named: `AWS_SECRETS`

The `reminder.txt` file contained internal notes about Forela’s expansion into Pakistan, operational deadlines, and references to Lahore. While this was not necessarily a credential file, it provided business context and internal operational information that could help an attacker understand the environment.

The `.reminder` file directly influenced my next pivot. Since the attacker had access to this file, it was reasonable to investigate whether the Forela GitHub repository contained additional exposed secrets.:

For `Tasks to get Done.docx`, the FTP stream was not readable as plaintext because `.docx` files are binary Office documents. I changed Wireshark’s stream display to raw output, saved the stream as a `.docx` file, and opened it in Word. The document contained an “Urgent Tasks” chart with internal deadlines, including:

<br>

**GitHub Repository Pivot**

After reviewing `.reminder`, I pivoted to Forela’s GitHub repository to determine whether sensitive data had actually been exposed there.

The file that stood out was:

```text
https://github.com/forela-finance/forela-dev/blob/main/internal-dev.yaml
```

At first, the current version of `internal-dev.yaml` did not show obvious plaintext credentials. However, because `.reminder` specifically mentioned cleaning up the GitHub repository, I did not stop at the current file contents. I cloned the repository so I could review prior commits locally:

Running `git log` revealed a commit with the message:

```text
Updated the script to be more secure. Earlier configuration was insecure
```

That commit message was important because it suggested the current version may have been sanitized, while the previous version could still contain the sensitive data that had been removed.

Relevant commits observed:
- `ab04702b3269f016def0521a734380fb12596994`
- `ffee1d9c3150b182c4d029d272745e308a8537a6`

I then checked out an earlier version of the repository to inspect the previous contents of `internal-dev.yaml`.

<br>

**Exposed Cyberjunkie SSH Credentials**

After checking out an earlier version of the repository, I opened the older `internal-dev.yaml` file in VS Code.

The earlier file exposed SSH credentials for the `cyberjunkie` account:

```yaml
ssh_user: cyberjunkie
ssh_password: YHUIhnollouhdnoamjndlyvb1398782bapd
```

This finding was especially important when correlated with `/etc/passwd`, which showed:

```text
cyberjunkie:x:1003:1003:,,,:/home/cyberjunkie:/bin/bash
```

The `/bin/bash` shell indicated that `cyberjunkie` was an interactive account. This made the recovered GitHub credential immediately useful for SSH access.

At `11:25:42`, the packet capture showed the attacker establishing an SSH connection to the victim server. Based on the timing and the recovered repository credentials, the SSH login was likely performed using the exposed `cyberjunkie` credentials. This was a key example of why reviewing historical Git commits matters. Even when secrets are removed from the current version of a repository, they may remain recoverable from commit history unless the history is rewritten and the credentials are rotated.

<br>

**Ransomware Payload Download**

After the SSH connection, I continued reviewing outbound network activity from the victim server to determine what the attacker did next.

At `11:42:34`, the victim machine `172.31.39[.]46` established an outbound HTTP connection to: `13.233.179[.]35`

The HTTP stream showed a GET request for:

```text
/PKCampaign/Targets/Forela/Ransomware2_server.zip
```

The request used the following user agent:

This was obviously suspicious because the victim server was pulling a ZIP archive from an external host after the attacker had already established SSH access, the filename also strongly suggested a ransomware payload.

I exported `Ransomware2_server.zip` from the capture and reviewed the compressed contents. The ZIP contained a `README.md` file identifying the project as part of the GonnaCry ransomware family.

Based on the available evidence, ransomware payload retrieval was confirmed. The packet capture supported download activity, but the capture did not include direct evidence of encryption execution or file impact on the victim host. Therefore, I assessed ransomware staging/download as confirmed, while ransomware execution or encryption impact would require additional host artifacts or logs to validate.

<br>

**Final Assessment**

Based on the available artifacts, the investigation supports the following conclusions:
- The victim server `172.31.39[.]46` was exposed to the internet.
- The attacker `3.109.209[.]43` performed Nmap-like TCP SYN scanning at `10:42:23`.
- The server exposed several services, including FTP, SSH, MySQL, Redis, and InfluxDB.
- The attacker performed password spraying against multiple FTP accounts.
- The attacker successfully authenticated as `tony.shephard` over FTP using `Summer2023!`.
- The attacker downloaded `.backup`, which exposed credentials and the port knocking sequence for a hidden service.
- The attacker used the exposed port knocking sequence `29999`, `50234`, `45087` to access FTP on port `24456`.
- The attacker retrieved multiple sensitive files from the hidden FTP service.
- Recovered files exposed internal data, database secrets, Linux user information, and a lead pointing to GitHub.
- GitHub repository history exposed SSH credentials for the `cyberjunkie` account.
- `/etc/passwd` showed that `cyberjunkie` had `/bin/bash`, making the account suitable for interactive login.
- The attacker established an SSH connection at `11:25:42`, likely using the recovered `cyberjunkie` credentials.
- The victim later downloaded `Ransomware2_server.zip` from `13.233.179[.]35` using Wget.
- The ZIP contents identified the ransomware family as GonnaCry.

Overall, the evidence supports a compromise chain beginning with exposed services and weak FTP credentials, followed by configuration leaks, hidden service access through port knocking, sensitive file retrieval, exposed GitHub credentials, SSH access, and ransomware payload download.

<br>

**Attack Chain Summary**

1. Attacker scans `172.31.39[.]46` from `3.109.209[.]43`
2. Open services are identified: `21`, `22`, `3306`, `6379`, and `8086`
3. Attacker conducts FTP password spraying against multiple accounts
4. `tony.shephard` successfully authenticates over FTP with `Summer2023!`
5. Attacker retrieves `.backup`
6. `.backup` exposes credentials and the port knocking sequence
7. Attacker knocks ports `29999`, `50234`, and `45087`
8. Hidden FTP service on port `24456` becomes accessible
9. Attacker retrieves sensitive files from the hidden service
10. `.reminder` points to sensitive data in the GitHub repository
11. Repository history reveals `cyberjunkie` SSH credentials
12. `/etc/passwd` confirms `cyberjunkie` has an interactive shell
13. Attacker establishes SSH access at `11:25:42`
14. Victim downloads `Ransomware2_server.zip` from `13.233.179[.]35`
15. Extracted README identifies the ransomware family as GonnaCry

<br>

**Indicators of Compromise**

Network Indicators:
- Victim IP: `172.31.39[.]46`
- Attacker IP: `3.109.209[.]43`
- Ransomware staging IP: `13.233.179[.]35`
- Ransomware URL path: `/PKCampaign/Targets/Forela/Ransomware2_server.zip`
- HTTP User-Agent: `Wget/1.21.2`

Open / Accessed Ports:
- `21` - FTP
- `22` - SSH
- `3306` - MySQL
- `6379` - Redis
- `8086` - InfluxDB
- `24456` - Hidden FTP service opened after port knocking

Port Knocking Sequence:
- `29999`
- `50234`
- `45087`

Accounts Observed:
- `alonzo.spire`
- `tony.shephard`
- `lin.bayley`
- `abdullah.yasin`
- `cyberjunkie`

Exposed Credentials:
- `tony.shephard` password used in spray: `Summer2023!`
- Backup credential: `abdullah.yasin:XhlhGame_90HJLDASxfd&hoooad`
- GitHub history credential: `cyberjunkie:YHUIhnollouhdnoamjndlyvb1398782bapd`

Files / Artifacts:
- `.backup`
- `.archived.sql`
- `Tasks to get Done.docx`
- `reminder.txt`
- `.reminder`
- `/etc/passwd`
- `internal-dev.yaml`
- `Ransomware2_server.zip`
- `README.md` inside ransomware ZIP

Git Indicators:
- Repository: `forela-finance/forela-dev`
- File: `internal-dev.yaml`
- Commit: `ab04702b3269f016def0521a734380fb12596994`
- Commit: `ffee1d9c3150b182c4d029d272745e308a8537a6`

<br>

**MITRE ATT&CK Mapping**

| Tactic | Technique | Evidence |
| --- | --- | --- |
| Reconnaissance | Active Scanning: `T1595` | Nmap-like SYN scan from `3.109.209[.]43` |
| Discovery | Network Service Discovery: `T1046` | Identification of open ports `21`, `22`, `3306`, `6379`, and `8086` |
| Credential Access | Password Spraying: `T1110.003` | FTP authentication attempts against `alonzo.spire`, `tony.shephard`, and `lin.bayley` |
| Initial Access | Valid Accounts: `T1078` | Successful FTP login as `tony.shephard` |
| Credential Access | Unsecured Credentials: Credentials in Files: `T1552.001` | Credentials recovered from `.backup` and historical `internal-dev.yaml` |
| Collection | Data from Local System: `T1005` | Retrieval of `.archived.sql`, `Tasks to get Done.docx`, `.reminder`, `reminder.txt`, and `/etc/passwd` |
| Exfiltration | Exfiltration Over Unencrypted Non-C2 Protocol: `T1048.003` | Sensitive files transferred from the server to the attacker over FTP |
| Lateral / Remote Access | Remote Services: SSH: `T1021.004` | SSH session established after `cyberjunkie` credentials were recovered |
| Command and Control / Tool Transfer | Ingress Tool Transfer: `T1105` | Victim downloaded `Ransomware2_server.zip` using Wget |
| Impact | Data Encrypted for Impact: `T1486` | Ransomware family identified as GonnaCry, though encryption execution was not confirmed from the notes alone |

<br>

**Recommended Next Steps**

If this were a live incident, recommended next steps would include:

Containment:
- Immediately isolate `172.31.39[.]46` from the network
- Block attacker IP `3.109.209[.]43`
- Block ransomware staging IP `13.233.179[.]35`
- Disable exposed FTP and SSH access from the internet
- Restrict access to MySQL, Redis, and InfluxDB to trusted internal hosts only

Credential and Secret Remediation:
- Reset passwords for `tony.shephard`, `abdullah.yasin`, `cyberjunkie`, and any other users exposed in retrieved files
- Rotate any secrets found in `.backup`, `.archived.sql`, and `internal-dev.yaml`
- Treat all credentials in Git history as compromised
- Review GitHub repository history for additional leaked secrets
- Remove exposed secrets from Git history using an appropriate history rewrite process

Eradication and Recovery:
- Search the host for `Ransomware2_server.zip` and any extracted payloads
- Review process execution and shell history to determine whether the ransomware executed
- Rebuild the server from a trusted image if compromise is confirmed
- Restore files from known-good backups if encryption or tampering occurred
- Review SSH authorized keys, cron jobs, systemd services, and shell startup files for persistence

Scoping:
- Search network logs for additional connections to `3.109.209[.]43` and `13.233.179[.]35`
- Identify any other hosts that accessed the exposed FTP service
- Review authentication logs for `cyberjunkie`, `tony.shephard`, and `abdullah.yasin`
- Check whether credentials from `.archived.sql` were reused elsewhere
- Review GitHub access logs and commit history for other accidental disclosures

Detection Engineering:
- Alert on internet-facing FTP authentication failures followed by success
- Detect repeated login attempts using one password across multiple accounts
- Alert on port knocking-like SYN sequences to unusual ports
- Monitor for outbound Wget downloads of archive files from untrusted IP addresses
- Alert on sensitive file retrieval over FTP, especially `/etc/passwd`, `.sql`, `.backup`, and hidden files

<br>

**Lessons Learned**

Key takeaways from this investigation:
- Exposed services can create a compromise path even without a software exploit.
- Password spraying remains effective when users rely on predictable seasonal passwords.
- Backup and configuration files can be more damaging than they initially appear because they often contain operational secrets.
- Port knocking does not protect a service if the knock sequence is stored in a file accessible to an attacker.
- FTP passive mode requires investigators to follow the separate data stream, not just the control stream, to recover transferred file contents.
- Git commit history can preserve secrets even after they are removed from the current repository version.
- A ransomware payload download does not automatically prove encryption occurred; execution and impact should be validated with host artifacts when available.

Things I would like to improve in my next investigation:
- Build a more complete packet-level timeline while reviewing each protocol stream.
- Track FTP control streams and passive data streams in a dedicated table.
- Record exact packet numbers for every recovered file transfer.
- Separate confirmed evidence from likely inference even more clearly.
- Capture hashes of exported files when possible to support repeatable analysis.

<br>

**Useful Commands & Workflow**

Git commands:

```bash
git clone <repository>
git log
git checkout <commit>
```

FTP recovery workflow:

```text
1. Locate FTP control stream
2. Identify RETR command
3. Locate related passive FTP data connection
4. Follow TCP stream
5. Export stream as raw data when recovering binary files like .docx
```
