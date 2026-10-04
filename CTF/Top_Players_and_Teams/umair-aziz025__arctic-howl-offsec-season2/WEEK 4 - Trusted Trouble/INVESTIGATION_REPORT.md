<div align="center">*[Image: Week 4: Trusted Trouble]*</div>

---

# Week 4: Trusted Trouble
## OffSec Arctic Howl CTF: MegacorpOne Insider Threat

---

## About the Event

**Arctic Howl: The Cascade Expanse**

The Cascade Expanse is no longer ruled by instinct alone. Ashka, an Arctic Wolf, was among the greatest cybersecurity hunters the Expanse had ever known: defending the Tundra Realm through instinct, reading subtle signals, sensing danger, and striking before threats could surface. When unusual activity rippled through the Tundra data center, Ashka moved to investigate but the adversary was already there. Two steps ahead. From the shadows, Ashka was struck down and taken. When the alarms faded, she was gone.

Her disappearance marked the beginning of a far greater threat. Throughout this Gauntlet season, challengers face an evolving adversary in a frozen cybersecurity battleground. Across increasingly difficult labs, competitors must adapt, learn, and outthink threats designed to punish stagnation and reward growth. As the season unfolds, challengers uncover the truth behind a missing guardian, a calculating adversary, and a chilling experiment that seeks to reshape instinct itself: blurring the line between hunter and machine.

**Only those who adapt will survive. Only those who endure will uncover the truth. And only the strongest will reach the heart of the storm.**

Welcome to Arctic Howl.

---

## Challenge Overview

**Scenario:** Megacorp One discovered insider-style leakage after onboarding new employees. Nothing looked obviously broken on endpoints, but suspicious activity appeared in MAIL and multiple CLIENT packet captures.

**Objective:** Reconstruct who leaked data, where it was sent, and exactly what sensitive content was exfiltrated.

**Deliverables:** Answer all 8 forensic questions with evidence-backed conclusions.

**Evidence Artifacts (high-level):**
- MAIL captures (SMTP workflow reconstruction)
- CLIENT captures (endpoint traffic reconstruction)
- Derived investigation summaries (SMTP recon + outlier event log)
- Extracted multipart HTTP upload payload bytes (content-level proof)

---

## Methodology (Step by Step)

### Step 0: Raw inputs only

Initial evidence set:
- `MAIL` captures
- `CLIENT5` captures
- `CLIENT10` captures
- `CLIENT12` captures
- `CLIENT13` captures

Count check command:
```powershell
Get-ChildItem '<CASE_ROOT>' -Directory |
  Where-Object { $_.Name -in @('MAIL','CLIENT5','CLIENT10','CLIENT12','CLIENT13') } |
  ForEach-Object { '{0}: {1}' -f $_.Name, (Get-ChildItem $_.FullName -File -Filter *.pcap* | Measure-Object).Count }
```

Relevant output:
```text
CLIENT10: 32
CLIENT12: 32
CLIENT13: 32
CLIENT5: 32
MAIL: 56
```

### Step 1: SMTP extraction and hiring timeline reconstruction

Command pattern used:
```powershell
tshark -r '<MAIL_CAPTURE>' -Y "imf" -T fields -E separator='|' \
  -e frame.number -e ip.src -e ip.dst -e tcp.stream \
  -e imf.from -e imf.to -e imf.subject -e imf.message_id -e imf.content.type
```

Applicant counting logic command:
```powershell
tshark -r '<MAIL_CAPTURE>' -Y "smtp.req.parameter contains \"apply@megacorpone.com\"" -T fields -e smtp.req.parameter
```

Relevant output:
```text
MAIL FROM:<...>
RCPT TO:<apply@megacorpone.com>
...
(de-duplicated unique applicants = 9)
```

### Step 2: SMTP body evidence (VPN context + insider public IP)

Command pattern used:
```powershell
tshark -r '<MAIL_CAPTURE>' -q -z 'follow,tcp,ascii,<STREAM_ID>'
```

Relevant output:
```text
X-Forwarded-For: 203.98.112.47
No issues with my VPN, attached is a screenshot of the connection
It seems my issues with the VPN pack have been resolved, thank you!
```

### Step 3: HTTP POST staging reconstruction

Command pattern used:
```powershell
tshark -r '<CLIENT_CAPTURE>' -Y "http.request.method==\"POST\" and ip.addr==10.10.0.254" -T fields -e tcp.stream
tshark -r '<CLIENT_CAPTURE>' -q -z 'follow,tcp,ascii,<POST_STREAM>'
```

Relevant output:
```text
Content-Type: multipart/form-data
Content-Disposition: form-data; name="notes"
Content-Disposition: form-data; name="notes"
Don't forget P@$$w0rd!
```

### Step 4: Payload-type validation and data recovery

Command pattern used:
```powershell
Format-Hex -Path '<EXTRACTED_PAYLOAD>' | Select-Object -First 2
sqlite3 '<DECRYPTED_DATABASE>' "pragma table_info(users);"
sqlite3 '<DECRYPTED_DATABASE>' "select * from users;"
```

Relevant output:
```text
00000000   37 7A BC AF 27 1C 00 04 ...
0|name|varchar(255)|0||0
1|password|varchar(255)|0||0
Robin Schwartz|5up3r5Tr0NgP@$$w0rd!
```

### Step 5: Evidence-to-conclusion chain

1. MAIL protocol fields established total applicants and acceptance continuity.
2. SMTP message bodies provided VPN-status statements and insider-linked public-IP metadata.
3. CLIENT HTTP streams showed staged multipart upload behavior.
4. Upload text clue + binary signature confirmed encrypted archive handling.
5. Decrypted database output confirmed exact sensitive credential theft.
6. Cross-correlation of identity + behavior + payload led to insider attribution.

---

## Challenge Questions & Analysis-Backed Answers

### Question 1: Total applicants
**Q:** How many people applied to work at MegacorpOne?

**Answer:**
```text
9
```

**Analysis:**
- I treated each application as a complete protocol event, not just a line match.
- The event definition was: `MAIL FROM` + `RCPT TO:<apply@megacorpone.com>` + DATA, all within a valid SMTP transaction.
- This avoids inflated counts from retries, incomplete sessions, and repeated packets.
- After extracting all senders and de-duplicating by identity, the stable total was 9.
- A second pass confirmed each counted sender had an actual application flow, not noise traffic.

**Key Indicators:**
- Repeated `MAIL FROM:<...@email.com>` -> `RCPT TO:<apply@megacorpone.com>` chains in MAIL captures.
- De-duplicated applicant sender set size = 9.

---

### Question 2: Accepted applicants
**Q:** Out of total applicants, whose application was accepted?

**Answer:**
```text
fernanda.ribeiro, samuel.adu, min-jun.park
```

**Analysis:**
- I did not treat a reply from HR as proof of acceptance by itself.
- Instead, acceptance required identity continuity across phases: applicant identity, corporate identity, and onboarding participation.
- The decisive evidence is appearance in the onboarding exchange where hostnames and VPN details are requested and returned.
- Only three identities satisfy all continuity checks without contradiction: fernanda.ribeiro, samuel.adu, min-jun.park.

**Key Indicators:**
- Recruitment-to-onboarding identity continuity.
- Corporate-address participation in operational onboarding thread.

---

### Question 3: Hiring manager identity
**Q:** What is the name of the hiring manager responsible for approving applications?

**Answer:**
```text
tatiana.petrov
```

**Analysis:**
- I mapped communication roles instead of counting message frequency.
- The hiring manager should appear as the control point that both closes recruitment loop and initiates onboarding actions.
- One internal sender repeatedly performs both tasks and receives new-hire operational replies.
- That role-consistent sender is Tatiana Petrov.

**Key Indicators:**
- Single internal sender initiating onboarding and receiving the corresponding operational responses.

---

### Question 4: Employee with VPN issues
**Q:** Which of the employees had issues with the company VPN?

**Answer:**
```text
fernanda.ribeiro
```

**Analysis:**
- I handled VPN attribution as a text-evidence conflict-resolution step.
- First, all onboarding replies containing VPN-related wording were extracted.
- Then statements were split into positive issue signals ("issues", "resolved") versus negative signals ("no issues").
- Only one employee explicitly reports prior VPN trouble and later resolution.
- A separate employee explicitly denies VPN problems, which strengthens the exclusion.

**Key Indicators:**
- Positive VPN-trouble statement linked to Fernanda.
- Negative VPN-trouble statement linked to another employee.

---

### Question 5: Employees violating company policy
**Q:** Identify the employee(s) that were violating company policy.

**Answer:**
```text
min-jun.park, samuel.adu
```

**Analysis:**
- I used a two-axis behavior model for policy violation decisions.
- Axis 1: policy-sensitive access behavior during onboarding period.
- Axis 2: suspicious data-handling behavior through staged internal upload workflow.
- A user was marked as violating policy only when identity linkage and behavior linkage existed together.
- After correlation, two employees remained consistently in the violation set: min-jun.park and samuel.adu.

**Key Indicators:**
- Policy-sensitive access events aligned with insider timeline.
- Identity-linked suspicious upload workflow.

---

### Question 6: Public exfiltration IP
**Q:** What is the public IP address that the insider threat is connecting to in order to exfiltrate data?

**Answer:**
```text
203.98.112.47
```

**Analysis:**
- I treated public-IP attribution as weak until identity correlation was confirmed.
- Application-layer metadata exposed a forwarded source value tied to the same identity that later appears in suspicious internal activity.
- The recovered value `203.98.112.47` appears as direct header evidence.
- This value is additionally consistent with repeated encrypted-tunnel communication involving the same external IP, increasing confidence.

**Key Indicators:**
- Header evidence: `X-Forwarded-For: 203.98.112.47`.
- Corroborating network presence of the same external IP in secure-tunnel traffic.

---

### Question 7: What was exfiltrated (include sensitive data)
**Q:** Identify what the insider threat was exfiltrating. Include the sensitive data.

**Answer:**
```text
SQLite database containing credentials: Robin Schwartz / 5up3r5Tr0NgP@$$w0rd!
```

**Analysis:**
- I validated exfiltration in three passes: transport behavior, content truth, then business impact.
- Transport pass showed repeated multipart POST uploads to an internal staging endpoint.
- Content-truth pass used hex signature validation and proved archive content via `37 7A BC AF 27 1C`, rejecting misleading plain-text appearance.
- Correlation pass linked a separate plaintext clue: `Don't forget P@$$w0rd!`.
- Decrypting the archive and querying the recovered database confirmed actual sensitive material, not speculative leakage.
- Final recovered sensitive credential: Robin Schwartz / 5up3r5Tr0NgP@$$w0rd!.

**Key Indicators:**
- Multipart POST staging workflow with non-routine payloads.
- Archive signature: `37 7A BC AF 27 1C`.
- Password clue and decrypted database row containing credential pair.

---

### Question 8: Insider identity
**Q:** Which employee was the insider threat?

**Answer:**
```text
samuel.adu
```

**Analysis:**
- I used full-chain consistency instead of one-indicator attribution.
- Candidate identities were filtered through four checkpoints:
  1) hiring/onboarding identity continuity,
  2) policy-violation behavior,
  3) proximity to suspicious staging uploads,
  4) alignment with insider external-IP evidence.
- samuel.adu is the only identity that satisfies all checkpoints without contradiction.
- This makes the attribution robust even if one weak indicator is removed.

**Key Indicators:**
- Cross-correlation across identity timeline, policy behavior, network metadata, and recovered payload content.

---

## Deep Technical Notes

## Why Question 7 requires content reconstruction (not metadata only)

A destination IP or protocol alone does not prove what was stolen. In this case:
- the upload *looked* like a text note, but the content signature proved it was an encrypted 7-Zip archive,
- the password was leaked in a separate upload,
- and the sensitive value only becomes visible after decryption + database inspection.

Only content-level reconstruction yielded a defensible answer.

## Why the two-note dependency mattered

The archive password was leaked operationally in a separate upload. Without correlating both uploads, decryption would fail and the sensitive data could not be confirmed.

---

## Repro Checklist (Validation)

- [x] MAIL applicant workflow reconstructed
- [x] Accepted candidates and hiring manager validated
- [x] VPN issue attribution validated
- [x] Policy-violation identities correlated
- [x] Exfil public IP validated (`203.98.112.47`)
- [x] Internal upload chain extracted (multipart note uploads)
- [x] 7z payload reconstructed and decrypted
- [x] SQLite credentials recovered from the decrypted database
- [x] Insider identity finalized (`samuel.adu`)

---

## Key Techniques & Observations

1. **Large-dataset reduction is mandatory:** triage-first workflow prevented wasting time across 184 captures.
2. **SMTP + endpoint correlation is decisive:** neither side alone provided full insider attribution.
3. **Multipart body extraction is critical:** HTTP metadata did not reveal real exfil content.
4. **Adversary masking was shallow at byte level:** renamed extension but intact archive magic bytes.
5. **Credential recovery required chain reasoning:** password hint + encrypted archive payload + database parsing.

---

## Lessons Learned

1. Insider investigations require identity, transport, and payload correlation together.
2. Surface-label assumptions are unreliable during exfil analysis.
3. Password hints can appear in separate low-signal artifacts and must be timeline-linked.
4. Strong final answers in CTF IR tasks are artifact-driven and reproducible.

### Defensive Takeaways

1. Flag internal HTTP file-upload services receiving unexplained note/archive uploads.
2. Detect label/content mismatches (declared text content carrying archive signatures).
3. Correlate onboarding-related social engineering requests with later data movement.
4. Alert on unusual encrypted-tunnel relationships to untrusted public infrastructure.
5. Enforce DLP checks on structured secret material (credential DBs) in outbound flows.

---

## Track Conclusion

<div align="center">*[Image: Week 4 Track Conclusion]*</div>

> The orchestration has fallen.  
> As control loops collapsed, Ashka broke the link and shattered the orchestration core.

The Snowcapped Yeti lost operational control, and the experiment was contained before it could consume both Ashka and the Cascade Expanse.

**Ashka survived changed, but no longer controlled, and now stands watch at the AI frontier.**

_Beyond the logs:_ the conflict shifted from hunting attackers to preempting machine-born threats.

---

*Writeup completed: March 25, 2026*  
*Event: OffSec Arctic Howl: Tundra Realm*  
*Challenge: Week 4: Trusted Trouble*  
*Score: 8/8 questions correct*
