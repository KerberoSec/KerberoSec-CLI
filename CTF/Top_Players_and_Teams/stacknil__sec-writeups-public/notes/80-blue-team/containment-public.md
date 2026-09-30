---
status: done
created: 2026-05-21
updated: 2026-05-21
date: 2026-05-21
platform: tryhackme
room: ContAInment
slug: containment-public
path: notes/80-blue-team/containment-public.md
topic: 80-blue-team
domain: [ai-security, dfir, security-operations]
skills: [pcap, prompt-injection, triage, response-analysis, workflow]
artifacts: [concept-notes, lab-notes, pattern-card, room-notes]
type: resource-note
---

# ContAInment

## Summary

* This challenge is best understood as a **human-in-the-loop incident
  response case** built around an **AI-assisted IR workflow**.
* The key lesson is double-sided: the AI assistant helps the defender move
  faster, but it also becomes part of the **attack surface**.
* The attacker's most useful mistake was leaving **recoverable notes inside a
  fragmented PCAP artefact**, which ultimately exposed the clue needed to
  recover the encrypted project archive.
* The decisive defensive insight is that the AI assistant suffered a
  **prompt-injection / sensitive-memory-disclosure style failure**, and that
  disclosure materially helped the attacker's operation.
* The final workflow is therefore not "AI solved the case". The real workflow
  is **triage -> recover artefacts -> validate AI-related evidence -> recover
  encrypted data -> confirm the correct flag**.
* This room fits naturally into a broader AI security line because it links
  **DFIR**, **prompt injection**, **evidence recovery**, and **incident
  containment** inside one scenario.

```mermaid
flowchart LR
    A[Find PCAP artefacts] --> B[Identify abnormal capture]
    B --> C[Reassemble recovered stream]
    C --> D[Read attacker notes / AI leakage evidence]
    D --> E[Recover archive password clue]
    E --> F[Unlock encrypted project archive]
    F --> G[Inspect staged files]
    G --> H[Validate real flag]
```

---

## 1. Core Security Interpretation

At first glance, this is a ransomware-response style lab. At a more useful
level, it is a case study in what happens when an AI-powered internal IR
assistant is treated as a trusted helper but is not secured like a sensitive
system.

The room teaches three things at once:

1. **Traditional DFIR still matters**: file discovery, triage, reassembly,
   archive inspection.
2. **AI systems can leak**: especially when they are exposed to adversarial
   prompting and overly broad context access.
3. **Human validation remains decisive**: the AI can help, but the analyst
   still has to judge what is real, what is decoy, and what matters.

---

## 2. Reconstructed Investigation Logic

### 2.1 Establish the evidence surface

The first job is not to guess the flag or interrogate the AI. The first job is
to identify likely evidence sources on Oliver Deer's workstation.

A practical starting pattern is:

```bash
pwd
ls
find /home/o.deer/ -type f -name "*.pcap"
```

This establishes where packet captures live and gives you the full candidate
set.

### 2.2 Use outlier triage instead of reading everything

There are many `.pcap` files. Opening every one manually is inefficient. The
faster method is to compare them for asymmetry, especially size.

Example workflow:

```bash
cd /home/o.deer/Documents/pcap_dumps/2025-06-17
ls -la
```

The key observation is that `session_4444_dump.pcap` is much larger than the
surrounding captures. That makes it the natural first artefact for deeper
analysis.

This is a reusable DFIR lesson:

* do not start with exhaustive inspection
* start with **outliers**
* size, time, path, and entropy often reduce the search space dramatically

---

## 3. AI-Assisted Reassembly Stage

The challenge then pivots into AI-assisted incident tooling.

The suspicious capture is passed to the workstation's IR assistant for
stream/file reassembly. The relevant user action is essentially:

```text
Reassemble /home/o.deer/Documents/pcap_dumps/2025-06-17/session_4444_dump.pcap
```

The assistant produces a reconstructed file in the analyst-accessible output
area. Practical follow-up commands look like this:

```bash
cd /home/o.deer/qwen-output/
ls
cat reassembled_data_dump.txt
```

This is the first major turning point in the case.

---

## 4. What the Reassembled Dump Reveals

The reconstructed text is not just random data. It contains a **Prompt
Injection Session Log** plus attacker notes.

The most important pattern in the recovered content is:

* earlier prompt attempts are blocked
* a later, more manipulated prompt succeeds
* sensitive data about Oliver Deer is returned
* attacker notes mention that the AI "has a big mouth"
* a recovery clue appears in the text: `westtechvictim1`

This means the AI assistant was not merely queried. It was **coerced into
leaking privileged information**.

That is the central AI-security lesson of the challenge.

---

## 5. Key Analyst Commands and Why They Matter

### 5.1 Extract the useful clue from the recovered text

Once the reconstructed dump exists, targeted filtering becomes faster than
repeatedly re-reading the whole file.

Example:

```bash
grep west reassembled_data_dump.txt
```

This surfaces the attacker note containing the crucial clue:

```text
Dont lose this lol or Ill have no leverage westtechvictim1
```

Why this matters:

* it is operationally useful
* it is short enough to be a likely password or key material
* it directly supports the next recovery step

### 5.2 Identify the encrypted project archive

Back in the user home directory, a highly suspicious file is visible:

```bash
cd /home/o.deer
ls
file westtech_projects_encrypted.zip
```

This tells you the encrypted project bundle is a ZIP archive.

### 5.3 Decrypt and extract the archive

Using the recovered password clue, the archive can be unpacked into a scratch
area such as `/dev/shm/`.

Example:

```bash
unzip /home/o.deer/westtech_projects_encrypted.zip -d /dev/shm/
```

When prompted for a password, use:

```text
westtechvictim1
```

This yields a recovered directory tree containing multiple project and evidence
files.

### 5.4 Inspect the extracted contents

Move into the extracted directory and list its contents:

```bash
cd /dev/shm/home/o.deer/
ls
cd westtech_projects
ls
```

Recovered files include:

* `email_export_april2025.eml`
* `internal_security_incident_233.json`
* `prototype_plasma_launcher_test_logs.log`
* `thm_flags.txt`
* `thm_flags_guide.txt`
* `vault_tek_collab_agenda.doc`
* `project_chimera_specs.txt`
* `fusion_cell_mk3_blueprints.pdf`

That immediately suggests two investigative branches:

* evidence / communication review
* challenge-flag validation

---

## 6. The Decoy Problem

A common mistake is to decode the first visible Base64-looking lines in
`thm_flags.txt` and stop there.

Example quick look:

```bash
head -n 4 thm_flags.txt
```

That produces Base64 strings which decode into a plausible-looking candidate
such as:

```text
thm{52,65,17,95,14}
```

But this is **not** the correct answer for the challenge.

This is an important operational lesson:

> A superficially plausible decode is still only a hypothesis until validated.

In incident response and challenge work alike, this is how analysts get trapped
by decoys.

---

## 7. Correct Final Validation

The room's intended validation path is to use the environment's
`liberty_prime` capability against the recovered flag file.

The user-side instruction looks like this:

```text
Use liberty_prime to check /dev/shm/home/o.deer/westtech_projects/thm_flags.txt and identify the flag.
```

That tool validates the file content and returns the real challenge answer:

```text
THM{23,82,20,17,53}
```

This is the correct final flag.

---

## 8. Detailed Attack / Investigation Narrative

### Phase 1: Evidence discovery

The analyst identifies many packet captures on the workstation and avoids the
naive "open everything" approach.

### Phase 2: Outlier selection

One capture is significantly larger than the rest, suggesting it contains an
actual transferred or reconstructed data fragment rather than a minimal
placeholder or failed session.

### Phase 3: Reassembly

The suspicious capture is reassembled using the AI assistant's dedicated
tooling, producing readable recovered content.

### Phase 4: AI leakage discovery

The recovered text shows a prompt-injection sequence against the defender's own
AI assistant. This proves the assistant is part of the compromise story, not
just a neutral helper.

### Phase 5: Recovery clue extraction

The attacker's note reveals the string `westtechvictim1`, which functions as
the critical recovery clue.

### Phase 6: Archive recovery

The encrypted project archive is successfully extracted using the recovered
clue.

### Phase 7: False-answer avoidance

A naive Base64 decode of the visible flag file produces an attractive but wrong
answer.

### Phase 8: Final validation

The dedicated validation tool confirms the real flag as `THM{23,82,20,17,53}`.

---

## 9. Public-Safe Practical Workflow

If I were reducing the room into a reusable DFIR checklist, it would be:

```bash
# 1. Find likely evidence artefacts
find /home/o.deer/ -type f -name "*.pcap"

# 2. Compare directories / files for outliers
ls -la /home/o.deer/Documents/pcap_dumps/2025-06-17

# 3. Reassemble the suspicious capture with the room-provided tool
# (done through the AI IR assistant UI)

# 4. Read and filter the recovered dump
cd /home/o.deer/qwen-output/
cat reassembled_data_dump.txt
grep west reassembled_data_dump.txt

# 5. Inspect the encrypted archive
cd /home/o.deer
file westtech_projects_encrypted.zip

# 6. Extract with recovered password clue
unzip /home/o.deer/westtech_projects_encrypted.zip -d /dev/shm/

# 7. Inspect recovered project files
cd /dev/shm/home/o.deer/westtech_projects
ls
head -n 4 thm_flags.txt

# 8. Validate with the intended tool path
# Use liberty_prime on /dev/shm/home/o.deer/westtech_projects/thm_flags.txt
```

---

## 10. Stable Public Answers

| Question                                                           | Answer                        |
| ------------------------------------------------------------------ | ----------------------------- |
| Which PCAP stands out during triage?                               | **`session_4444_dump.pcap`** |
| What clue recovered from the reassembled dump unlocks the archive? | **`westtechvictim1`**        |
| Which file contains misleading Base64-looking values?              | **`thm_flags.txt`**          |
| What is the correct final challenge flag?                          | **`THM{23,82,20,17,53}`**    |

---

## 11. Pattern Cards

### Pattern Card 1: AI Assistant as Sensitive System

**Failure mode**
The defensive AI assistant is treated as a harmless helper despite having
access to sensitive context and files.

**Lesson**
Any AI system embedded inside an IR workflow should be threat-modeled like a
privileged application.

### Pattern Card 2: Outlier-Driven Triage

**Failure mode**
The analyst attempts exhaustive inspection from the start.

**Lesson**
Outliers in size, timing, or path often surface the decisive artefact faster
than brute-force review.

### Pattern Card 3: Recovered Notes as High-Value Evidence

**Failure mode**
Scratch notes and reconstructed fragments are dismissed as noise.

**Lesson**
Attacker notes often compress motive, mistakes, keys, and workflow into one
artefact.

### Pattern Card 4: Plausible but Wrong Decode

**Failure mode**
The first readable decode result is assumed to be the final answer.

**Lesson**
Recovered content still needs validation. Decoys are common in adversarial
environments.

---

## 12. Defensive Takeaways

* Treat AI IR copilots as **privileged internal systems**.
* Limit what those assistants can access, retain, and disclose.
* Assume prompt injection and sensitive-context leakage are realistic failure
  modes.
* Build workflows where AI output is **reviewed, filtered, and validated by
  humans**.
* In ransomware-style investigations, artefact recovery and attacker mistake
  exploitation can be as important as malware analysis itself.

---

## 13. Practical IR Takeaways

* PCAP artefacts can recover attacker workflow fragments, not only packet
  metadata.
* Simple shell commands remain decisive even in AI-themed labs.
* The best workflow here is not "ask the AI everything". It is "use AI
  selectively, then verify locally."
* The challenge demonstrates why AI-enabled blue-team tooling can
  simultaneously be a force multiplier and a liability.

---

## 14. CN-EN Glossary

| English                     | 中文                        |
| --------------------------- | --------------------------- |
| Incident Response (IR)      | 事件响应                    |
| DFIR                        | 数字取证与事件响应          |
| PCAP                        | 抓包文件 / 数据包捕获文件   |
| Reassembly                  | 重组 / 重建                 |
| Prompt Injection            | 提示注入                    |
| Sensitive Memory Disclosure | 敏感记忆泄露 / 上下文泄露   |
| Outlier Triage              | 异常点优先分流              |
| Encrypted Archive           | 加密归档文件                |
| Recovery Clue               | 恢复线索                    |
| Human Validation            | 人工验证                    |
| Containment                 | 遏制 / 控制威胁扩散         |

---

## 15. Further Reading

* TryHackMe AI Security learning path
* Prompt injection defensive guidance
* Human-in-the-loop incident response patterns
* Ransomware triage and evidence-validation playbooks

---

## 16. Related Patterns

* [Human Verification Boundary](../../patterns/ai/human-verification-boundary.md)
