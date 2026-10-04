---
status: done
created: 2026-05-13
updated: 2026-05-13
date: 2026-05-13
platform: tryhackme
room: AI Forensics
slug: ai-forensics-public
path: notes/80-blue-team/ai-forensics-public.md
topic: 80-blue-team
domain: [dfir, ai-security, forensics]
skills: [detection, phishing-analysis, timestamps, evidence-logging, risk-management]
artifacts: [concept-notes, lab-notes, room-notes]
type: resource-note
---

# AI Forensics

## Summary

* AI can materially improve **DFIR throughput** by helping with anomaly detection, phishing triage, file classification, and large-scale timeline reconstruction.
* In forensics, the right posture is **AI as investigator augmentation**, not investigator replacement.
* The major technical strengths highlighted in this room are **pattern recognition**, **parallelized large-scale data processing**, **classification**, and **correlation across multiple evidence sources**.
* The major practical weaknesses are **non-determinism**, **evaluation trade-offs** such as precision vs recall, and the classic **garbage in, garbage out** problem.
* The biggest legal and ethical constraints are **explainability**, **bias and fairness**, **chain of custody / auditability**, and **privacy-preserving evidence handling**.
* The RobbCo practical is useful because it shows the realistic division of labour: **ML surfaces suspicious artefacts, human analysis validates them and reconstructs the attack chain**.

```mermaid
flowchart LR
    A[Large forensic data] --> B[ML-assisted triage]
    B --> C[Flagged anomalies]
    C --> D[Human validation]
    D --> E[Timeline reconstruction]
    E --> F[Defensible findings]
```

---

## 1. What AI Adds to DFIR

### 1.1 Data processing at scale

DFIR investigations routinely involve log volumes, document sets, chat exports, mailboxes, file trees, and endpoint artefacts that are expensive to process manually.

AI helps most when the workload is:

* repetitive
* pattern-heavy
* high-volume
* time-sensitive

### 1.2 Pattern recognition and anomaly detection

The room's key point is simple: AI can identify behavioural deviations that may be difficult for a human to spot consistently at scale.

That includes:

* unusual login times
* impossible travel / impossible logins
* abnormal file paths or file features
* suspicious language in messages
* cross-source event patterns

### 1.3 Scalability

Modern DFIR is no longer confined to one endpoint and a handful of logs. AI becomes attractive because it can help scale triage and correlation across distributed environments without requiring a linear increase in analyst effort.

---

## 2. AI Use Cases in DFIR

### 2.1 Image and video forensics

The room highlights **CNNs** as a natural fit for image and video analysis because they learn spatial patterns well.

Practical areas include:

* image forgery detection
* ELA-assisted tamper classification
* deepfake detection
* GAN-driven adversarial improvement of detectors

### 2.2 Communication analysis

Natural language models can help with:

* phishing classification
* risky-language detection
* social-media or chat analysis
* sentiment analysis
* prioritisation of communications for human review

### 2.3 Timeline reconstruction and user behaviour

AI is especially useful for correlating:

* logs
* filesystem timestamps
* network records
* alerts from multiple tools

This makes it suitable for **timeline reconstruction**, **event clustering**, and **behavioural anomaly detection**.

### 2.4 Malware and file analysis

The room also frames AI as useful for:

* malicious vs benign file classification
* static feature-based triage
* dynamic analysis of runtime behaviour
* API-call-sequence driven behavioural classification

---

## 3. Limits That Matter

### 3.1 Probabilistic vs deterministic systems

A core lesson here is that AI systems are often **probabilistic** rather than deterministic.

That matters in forensics because investigators need:

* repeatability
* defensibility
* consistency under scrutiny

The danger is that the same evidence or prompt setup may produce different outputs across runs, which is awkward in evaluative or evidentiary contexts.

### 3.2 Accuracy is not enough

The room correctly emphasizes that forensic AI should not be judged by raw accuracy alone.

The more relevant evaluation frame is usually:

* **precision**: when the model flags something, how often is it actually correct?
* **recall**: how many of the true positives are being caught?
* **accuracy**: what proportion of total predictions are right overall?

In imbalanced forensic datasets, a model can look numerically good while being operationally weak.

### 3.3 Garbage in, garbage out

AI systems inherit the quality limits of their training data, labels, and input features.

For DFIR, this means:

* biased or incomplete training data can mislead the analyst
* weak labels can create bad investigation priors
* noisy evidence pipelines can produce confident but wrong AI outputs

---

## 4. Legal and Ethical Constraints

### 4.1 Explainability and transparency

If an AI system flags something as suspicious, a courtroom or opposing counsel may reasonably ask: **why?**

That is where black-box models become problematic.

Forensic evidence needs to be:

* explainable enough to defend
* reviewable by humans
* challengeable by the opposing side
* supported by expert validation

### 4.2 Bias and fairness

Bias in forensic AI is not only a model-quality problem. It is a justice problem.

Examples include:

* deprioritising certain languages or dialects
* misidentifying demographic groups at different rates
* skewing which artefacts get elevated to analyst attention first

### 4.3 Chain of custody and accountability

If AI participates in evidence triage, transformation, or summarisation, the process still needs:

* traceability
* auditability
* preservation of intermediate states when legally relevant
* clearly assigned accountability

Opaque cloud workflows can conflict with that requirement.

### 4.4 Privacy and data protection

Forensic evidence frequently contains highly sensitive personal and corporate data.

The room correctly points to privacy-preserving approaches such as:

* secure offline processing
* controlled / on-prem environments
* federated learning where appropriate

---

## 5. The RobbCo Practical Case

This lab is best read as a **human-in-the-loop DFIR case study**.

### 5.1 Initial AI signals

Two AI-assisted scripts provide the initial direction:

* a log classifier flags suspicious SSH events in `auth.log`
* a file anomaly script flags suspicious files across key directories

This is the right operational use of AI in DFIR: **surface leads, not final verdicts**.

### 5.2 Reconstructed attack chain

The practical case can be reconstructed as follows:

1. **Initial access** via phishing email targeting `j.morgan`
2. Malicious `.ods` invoice document opened
3. Macro harvests local recon data and attempts exfiltration
4. Attacker logs in as `j.morgan`
5. Additional tooling is dropped for remote access
6. Privilege escalation occurs by abusing legitimate permissions
7. Persistence is disguised as a benign system utility
8. Proprietary source code is staged, archived, encoded, and prepared for theft

### 5.3 Why this lab is useful

The room intentionally includes one important twist: the ML model flags both genuinely malicious artefacts and some **non-malicious but sensitive source files**. That is a realistic lesson. Suspicious does not always mean malicious.

---

## 6. Public-Safe Practical Answers

### 6.1 Stable room answers

| Question | Answer |
| --- | --- |
| What ability of AI helps by recognising patterns investigators might miss? | **anomaly detection / pattern recognition at scale** |
| Which metric tells you how often positive flags were actually correct? | **precision** |
| What term describes same-input / different-output behaviour across runs? | **non-determinism** |
| What neural network type is commonly used in image/video forensics? | **CNN** |
| What analysis measures emotional tone in messages? | **sentiment analysis** |
| What data is correlated to reconstruct an incident timeline? | **time-sequenced data such as logs, filesystem timestamps, and network records** |
| What analysis observes how a program behaves, e.g. via API calls? | **dynamic analysis** |
| What U.S. admissibility test is referenced for expert/scientific evidence? | **Daubert test** |
| What term describes hard-to-interpret AI models? | **black boxes** |
| What law-enforcement technology is cited as showing racial bias? | **facial recognition** |
| What privacy-preserving technique avoids centralizing sensitive training data? | **federated learning** |

### 6.2 Practical case answers

| Question | Answer |
| --- | --- |
| At what time does the attacker successfully log in as `j.morgan`? | **03:01:02** |
| What attack method was used to gain initial access? | **phishing email with a malicious `.ods` invoice attachment / macro lure** |
| What is the attacker's email address? | **`akeane@poseidonenergy.net`** |
| What command was run as `j.morgan` to gain access to `r.house`? | **`sudo nano /home/r.house/.ssh/authorized_keys`** |
| What is the full path of the archive used to steal RobbCo's source code? | **`/dev/shm/.core_dump_2025.tgz.enc`** |

---

## 7. Pattern Cards

### Pattern Card 1: AI as Triage, Human as Verdict

**Failure mode**
The team treats AI output as conclusive evidence.

**Lesson**
In DFIR, AI should usually narrow the search space, not close the case on its own.

### Pattern Card 2: High Precision vs High Recall Trade-off

**Failure mode**
A model is tuned too conservatively and misses attacker artefacts, or too aggressively and floods analysts with false positives.

**Lesson**
Metrics must be interpreted operationally, not cosmetically.

### Pattern Card 3: Useful False Positives

**Failure mode**
The model flags important-but-not-malicious files.

**Lesson**
Even an incorrect maliciousness label can still point investigators toward the attacker's objective.

### Pattern Card 4: Opaque Automation in an Evidentiary Context

**Failure mode**
An AI-generated finding cannot be explained, audited, or reproduced.

**Lesson**
That may weaken admissibility even if the model was directionally right.

### Pattern Card 5: Privacy Shortcut, Evidentiary Risk

**Failure mode**
Sensitive evidence is pushed into uncontrolled external AI services.

**Lesson**
Convenience can collide with privacy law, chain of custody, and admissibility.

---

## 8. Practical DFIR Takeaways

* AI is strongest in DFIR when the task is **large-scale triage or correlation**, not when the task requires final legal judgment.
* A useful AI-forensics workflow is: **detect -> shortlist -> validate -> reconstruct -> defend**.
* Explainability matters more in DFIR than in many ordinary business uses of AI.
* Chain-of-custody expectations do not disappear just because an ML model was involved.
* When AI flags something, the next question is never only is it malicious but also what does this reveal about attacker intent.

---

## 9. CN-EN Glossary

| English | 中文 |
| --- | --- |
| Digital Forensics / DFIR | 数字取证 / DFIR |
| Anomaly Detection | 异常检测 |
| Timeline Reconstruction | 时间线重建 |
| Pattern Recognition | 模式识别 |
| Precision | 精确率 |
| Recall | 召回率 |
| Accuracy | 准确率 |
| Non-determinism | 非确定性 |
| Explainability | 可解释性 |
| Chain of Custody | 证据保管链 |
| Federated Learning | 联邦学习 |
| Sentiment Analysis | 情感分析 |
| Dynamic Analysis | 动态分析 |
| Black Box Model | 黑盒模型 |

---

## 10. Further Reading

* scikit-learn documentation
* NIST AI Risk Management Framework
* legal references on the Daubert standard and expert testimony
* privacy-preserving federated learning references

---

## 11. Related Patterns

* [Human Verification Boundary](../../patterns/ai/human-verification-boundary.md)
