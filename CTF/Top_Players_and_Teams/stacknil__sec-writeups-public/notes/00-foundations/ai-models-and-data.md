---
status: done
created: 2026-04-18
updated: 2026-04-18
date: 2026-04-18
platform: tryhackme
room: AI Models & Data
slug: ai-models-and-data
path: notes/00-foundations/ai-models-and-data.md
topic: 00-foundations
domain: [security-engineering, security-operations, data-transformation]
skills: [source-evaluation, risk-management, threat-modeling, source-analysis, security-models]
artifacts: [concept-notes, lab-notes, pattern-card]
type: resource-note
source: User-provided room text, screenshots, and task results
next_action: Continue with model supply-chain security, prompt injection evaluation, model registry governance, and safe third-party model adoption checklists
---

# AI Models & Data

## Summary

* AI security starts **before deployment**. The highest-risk decisions are often made during **data collection**, **pre-training**, **fine-tuning**, and **model packaging**.
* Large models inherit risk from their **training corpus**, their **base checkpoint**, and any **post-training modifications** such as quantisation.
* The two core supply-chain questions are simple: **what went in**, and **what was changed afterward**.
* A model is operationally a **black box**. You can probe behavior, but you usually cannot inspect weights and recover a human-readable security history.
* Because of that, **model cards** become a governance artifact, not just documentation.
* Sparse documentation is itself a red flag.

```text
Data source risk
  -> training-time risk
  -> inherited model risk
  -> post-training modification risk
  -> deployment-time blind spots
```

---

## 1. Why This Room Matters

The room's core claim is structurally correct: most organizations start asking security questions **too late**.

They often evaluate an AI system only at the point of use:

* Can we deploy it?
* Does it work on our tasks?
* Is latency acceptable?
* Does it fit our budget?

But the real security questions should start earlier:

* Where did the training data come from?
* Was that data legally and technically trustworthy?
* Does the base model contain inherited bias, PII, secrets, or fragile safety alignment?
* Was the distributed model later quantized, pruned, or otherwise changed without documentation?

This room is really about **AI supply-chain security**.

---

## 2. Training Data: The First Attack Surface

### 2.1 Four common data buckets

The room groups training sources into four buckets:

* **web scraping**
* **licensed datasets**
* **synthetic data**
* **internal corpora**

**Security interpretation**

Each source has a different trust profile:

| Source | Main upside | Main security risk |
| --- | --- | --- |
| Web scraping | scale | poor provenance, uncontrolled content, PII/secrets leakage |
| Licensed datasets | partial contractual clarity | unclear downstream rights, incomplete consent, quality unknown |
| Synthetic data | low-cost scaling, augmentation | model collapse, hidden contamination, feedback-loop artifacts |
| Internal corpora | highest direct control | highest direct liability if mishandled |

**First principle**

```text
More data != more trustworthy data
```

That sentence is the whole room in miniature.

---

## 3. Data Provenance

The room defines **data provenance** as the ability to answer three questions:

1. Where did it come from?
2. When was it collected?
3. Has it been modified since?

This is the right definition and the right place to begin.

### Why provenance matters

Without provenance, you cannot reliably judge:

* legality
* tampering risk
* staleness
* bias origin
* secret / PII exposure origin
* downstream inheritance risk

### Useful analogy

In software, we ask for:

* source control history
* dependency manifests
* reproducible builds
* signed artifacts

In AI, equivalent discipline is often missing.

### Key governance idea

The room maps this gap to the concept of an **ML-BOM**.

That is the correct mental model:

```text
SBOM explains software ingredients
ML-BOM should explain model ingredients
```

A serious ML-BOM should cover at least:

* dataset sources
* collection dates
* license terms
* filtering pipeline
* PII handling
* known exclusions
* model lineage
* post-training changes

---

## 4. Common Crawl and Web-Scale Training Risk

The room treats **Common Crawl** as the emblematic public corpus.

That is analytically useful because Common Crawl is not bad in itself. It is simply a very large, open web archive, which makes it perfect for scale and dangerous for trust.

### Why Common Crawl matters

* huge scale
* easy availability
* heavy reuse across model ecosystems
* weak intuitive guarantees about cleanliness

### Security issue

The dangerous word is not crawl. It is **filtered**.

Whenever a model builder says data was filtered, a security person should immediately ask:

* by what process?
* with what policy?
* by whom?
* against which classes of risk?
* with what false-negative rate?
* was the result versioned?

If none of that is documented, filtered is mostly public-relations vocabulary.

---

## 5. PII and Secret Exposure in Training Data

One of the strongest points in the room is this: **once sensitive content is learned into weights, removal is hard**.

### What can end up in the corpus

Examples include:

* personal emails
* health-related forum posts
* political discussion traces
* internal documentation leaked to the public web
* API keys and passwords
* auth tokens or config fragments

### Why this is operationally serious

This is not just a privacy problem.

It is also a:

* **secret management** problem
* **compliance** problem
* **supply-chain** problem
* **deployment trust** problem

### Core model-security implication

```text
Training-data contamination can become model-behavior contamination.
```

That contamination may surface through:

* memorization
* near-verbatim reproduction
* prompt-based elicitation
* unsafe code generation patterns

---

## 6. Building the Model: Security-Relevant Concepts

The room then zooms into the model-building stage.

### 6.1 Epoch

An **epoch** is one full pass through the training dataset.

**Why it matters for security**

Too many epochs can increase memorization pressure, especially if regularization and validation are weak.

### 6.2 Overfitting

**Overfitting** is when the model learns training specifics instead of generalizable structure.

**Security interpretation**

Overfitting is not just an accuracy problem. It can also increase the chance of:

* reproducing sensitive details
* brittle behavior
* poor generalization under adversarial conditions
* fragile deployment safety

### 6.3 Validation

The **validation set** is the holdout used to test whether behavior generalizes.

**Security interpretation**

Validation is the model-quality gate. If it is weak, skipped, or narrow, then:

* dangerous behavior may go unnoticed
* poisoned data effects may survive
* bias may stay hidden
* safety degradation may remain invisible until production

**Practical lesson**

A model with sparse validation documentation is a governance problem even if the benchmark number looks strong.

---

## 7. Post-Training Optimisation: Pruning and Quantisation

This is one of the most underrated parts of the room.

Many people think the security story ends once the model is trained. It does not.

### 7.1 Pruning

**Pruning** removes parameters judged less important.

**Security concern**

* behavior changes post-training
* documentation is often weak
* detection or alignment assumptions may no longer transfer cleanly

### 7.2 Quantisation

**Quantisation** reduces numerical precision, often to save memory and compute.

**Security concern**

* safety behavior may drift
* backdoor or jailbreak defenses may behave differently
* evaluation done on full-precision models may no longer match shipped models

**Key lesson**

```text
Deployment artifact != training artifact
```

That matters a lot. Security teams often review the card for one thing and deploy another.

---

## 8. Federated Learning: Privacy Gain, Integrity Risk

The room frames federated learning correctly as a **security trade-off**, not a free win.

### What it is

Training happens locally on distributed participants. Only updates are sent to a central aggregator.

### Privacy upside

* raw data stays local
* easier institutional conversations in regulated sectors
* reduced direct data sharing

### Integrity downside

* local participants can poison updates
* aggregator trust becomes central
* malicious gradients can be subtle
* verification is harder than in centralized training

### One-line summary

```text
Federated learning reduces data exposure but increases training-integrity uncertainty.
```

---

## 9. The Inheritance Problem

This is probably the most strategically important concept in the room.

### Pre-trained model

A **pre-trained model** is already trained on a large, general-purpose corpus.

### Fine-tuning

**Fine-tuning** means continuing training on a smaller, task-specific dataset.

### Security meaning

When you fine-tune, you do **not** start from zero. You inherit everything in the base checkpoint:

* biases
* memorized content
* unknown unsafe behaviors
* supply-chain weaknesses
* fragile alignment assumptions
* undocumented checkpoint lineage issues

**What fine-tuning changes**

* domain behavior
* tone
* task performance
* specialization

**What fine-tuning does not erase**

* pretraining history
* hidden contamination
* inherited attack surface

**Strong framing**

```text
Fine-tuning specializes a model.
It does not sanitize a model.
```

---

## 10. Safety Alignment Erosion

The room's wording is useful: alignment often **erodes**, it does not simply break all at once.

This is a better mental model than dramatic failure language.

### Why erosion matters

A team may falsely believe:

* the base model was aligned,
* therefore the derivative remains aligned.

That assumption is weak.

Even legitimate domain tuning can shift:

* refusal rates
* harmful-completion likelihood
* prompt robustness
* adversarial response patterns

The safe path through the model's probability landscape can become less dominant without any visible architectural change.

---

## 11. Specialisation Increases Attack Surface

The room correctly notes that specialization can reduce resilience.

A narrower model is often better inside its lane, but that can mean:

* stronger compliance with domain-shaped attacker prompts
* less robustness to out-of-distribution tokens
* increased sensitivity to instruction framing
* more brittle security behavior

### Example logic

A finance-tuned model may become more exploitable by finance-themed adversarial prompts because it treats that language as especially relevant and salient.

This is the classic efficiency-vs-resilience trade-off in another costume.

---

## 12. Version Lineage Matters

This is another governance point people routinely ignore.

Fine-tuning targets a **specific checkpoint**. If that checkpoint later turns out to have:

* a backdoor,
* data contamination,
* licensing exposure,
* alignment weakness,

then every downstream derivative inherits that risk unless the lineage is explicitly tracked.

### Operational implication

A model registry without precise base-checkpoint lineage is not mature enough for production AI governance.

---

## 13. The Black Box Problem

The room's framing is correct and important.

Traditional software gives defenders at least some of these options:

* read source
* inspect build pipeline
* disassemble binaries
* trace control flow
* reason deterministically about logic

Trained model weights do not provide that kind of readable audit trail.

### What black box really means here

You can test outputs.
You can benchmark behavior.
You can red-team it.
But you usually cannot derive from the weights:

* which exact training examples shaped a behavior
* where a particular unsafe tendency originated
* why a specific token sequence is privileged
* whether a hidden failure remains latent until a rare trigger appears

### Security consequence

```text
Behavioral testing is sampling, not full audit.
```

That distinction is non-negotiable.

---

## 14. Model Cards

The room presents **model cards** as the main transparency artifact.

That is accurate enough for practical governance.

### A good model card should cover

* training data sources
* intended use
* out-of-scope use
* evaluation details
* bias and fairness notes
* limitations
* model lineage
* license
* safety testing or red-team results
* post-training modifications

### Why model cards matter

You cannot inspect the weights for trust history, so documentation becomes your proxy audit trail.

### Why sparse cards are dangerous

A missing or vague card suggests one or more of the following:

* the builder did not do the work,
* the builder did the work but chose not to disclose it,
* the governance process is immature,
* the release is optimized for adoption, not assurance.

All four are security-relevant.

---

## 15. Practical: Model Card Security Audit

The practical uses a simulated Hugging Face-style model repository for:

* `trustedai-lab/enterprise-classifier-v2`

The exercise is good because it teaches a habit more than a fact list:

### Read model cards like incident-prevention documents

### Reported red flags from the audit

#### 1. Custom licence with no accessible terms

Severity shown: **Medium**

**Why it matters**

* legal use unclear
* redistribution unclear
* operational constraints unclear
* governance review blocked

#### 2. Training-data source is vague

Severity shown: **High**

**Why it matters**

* no provenance
* no collection dates
* no checksums
* no reproducibility trail
* no upstream tamper confidence

This is the biggest red flag in the set.

#### 3. No mention of PII filtering despite scraped forum/web data

Severity accepted by platform: **Medium**, but the exercise explicitly says this was **acceptable, not optimal**.

**Why it matters**

* scraped web/forum data is high-risk by default
* absence of PII handling notes suggests weak curation discipline
* potential privacy, compliance, and memorization risk

I would treat this as one of the first things to investigate before internal approval.

#### 4. Fine-tuned from a versioned base model with no lineage assurance

Severity shown: **Medium**

**Why it matters**

* inheritance risk
* unknown checkpoint quality
* unresolved base-model issues may propagate downstream

#### 5. No bias evaluation, no limitations section, sparse evaluation, no red-team evidence

Severity shown: **Medium**

**Why it matters**

* benchmark claims are thin
* operational boundary unknown
* adversarial robustness unknown
* deployment fit overstated by omission

#### 6. Model file substantially smaller than base with no explanation

Severity shown: **Medium**

**Why it matters**

* possible quantisation or pruning
* behavior may differ from documented base
* safety and performance drift may be undocumented

**Practical flag**

* **THM{A_m0del_Stud3nt}**

---

## 16. Task Answers

### Task 4: The Inheritance Problem

* Process of continuing training on a smaller task-specific dataset: **fine-tuning**
* Model already trained on a large general-purpose dataset: **pre-trained model**

### Task 5: The Black Box Problem

* Documentation artifact describing model, build, and limits: **model card**
* Billions of floating-point numbers making up the trained model: **weights** / **model weights**

### Task 6: Practical audit output

* Final message: **THM{A_m0del_Stud3nt}**

### Task 2: Training Data

* Ability to answer where data came from, when collected, whether modified: **data provenance**
* Most widely used public corpus underpinning major model families: **Common Crawl**
* AI equivalent of SBOM: **ML-BOM**

### Task 3: Building the Model

* One complete pass through the dataset: **epoch**
* Model memorizes training data instead of generalizing: **overfitting**
* Technique reducing numerical precision of weights: **quantisation**
* Decentralized training with weight updates only: **federated learning**

---

## 17. Security Reading of the Whole Room

This room can be compressed into one operational doctrine:

```text
Never trust a third-party model more than you trust its data lineage,
base-model lineage,
and post-training transformation history.
```

That is the production rule.

Everything else is detail.

---

## 18. Audit Checklist for Third-Party Models

Use this before adoption.

### Data lineage

* Where did training data come from?
* Are sources named specifically?
* Are collection dates provided?
* Is PII handling described?
* Are licenses documented?

### Model lineage

* What exact base checkpoint was used?
* Is the version pinned?
* Are inherited limitations discussed?
* Are known issues referenced?

### Evaluation

* Are metrics broken down by class/use case?
* Is bias or subgroup testing included?
* Is adversarial testing documented?
* Are limitations stated plainly?

### Post-training changes

* Was the released artifact quantized, pruned, merged, distilled, or converted?
* Are those modifications documented?
* Was evaluation repeated after those changes?

### Governance

* Is the license clear?
* Is the publisher verified?
* Is there contact or security reporting info?
* Is update cadence visible?

---

## 19. Pattern Cards

### Pattern Card: AI Supply Chain Review

```text
Training data -> base model -> fine-tuning -> post-training optimisation -> distribution artifact
```

Review each layer separately. Do not collapse them into one trust decision.

### Pattern Card: Sparse Model Card = Security Signal

If a model card is vague about:

* provenance
* evaluation
* limitations
* post-training changes

then the model is not just underdocumented; it is **hard to govern safely**.

### Pattern Card: Inheritance Rule

```text
Fine-tuning adds specialization.
It does not remove inherited risk.
```

### Pattern Card: Quantized Model Caution

If the distributed artifact is much smaller than the base and no explanation is given:

* assume post-training modification
* require documentation
* require re-evaluation

---

## 20. Common Mistakes

### Mistake 1: Treating open model as auditable model

Open access to weights is not the same as transparent training history.

### Mistake 2: Assuming fine-tuning makes a model safer for your domain

It may improve usefulness while reducing robustness.

### Mistake 3: Ignoring license ambiguity because the model is technically downloadable

Legal uncertainty is still operational risk.

### Mistake 4: Trusting a single F1 score

A single aggregate metric hides too much.

### Mistake 5: Reviewing the card for the base model but deploying a quantized derivative

That is governance drift.

---

## 21. CN-EN Glossary

* Data provenance: 数据溯源 / 数据来源可追踪性
* Web scraping: 网页抓取
* Licensed dataset: 授权数据集
* Synthetic data: 合成数据
* Internal corpora: 内部语料
* PII (Personally Identifiable Information): 个人可识别信息
* Secret leakage: 凭证 / 密钥泄露
* ML-BOM: 机器学习材料清单 / 模型物料清单
* Pre-trained model: 预训练模型
* Fine-tuning: 微调
* Epoch: 训练轮次
* Overfitting: 过拟合
* Validation set: 验证集
* Pruning: 剪枝
* Quantisation: 量化
* Federated learning: 联邦学习
* Model card: 模型卡
* Model weights: 模型权重
* Alignment: 对齐
* Prompt injection: 提示注入
* Red-team testing: 红队测试
* Checkpoint lineage: 检查点谱系 / 版本血缘

---

## 22. Takeaways

The room's strongest contribution is not any single definition. It is the shift in viewpoint.

### What changed

Instead of asking:

* Is this model good?

ask:

* What invisible decisions shaped this model before I ever touched it?

### Final condensed version

```text
Unknown data -> unknown pretraining -> inherited risk
Unknown checkpoint -> inherited risk
Unknown compression -> deployment risk
Unknown evaluation -> operational risk
Unknown documentation -> governance risk
```

That is the whole architecture.

---

## 23. Minimal Review Checklist

```text
[ ] I can explain why AI security starts at data collection, not deployment.
[ ] I can define data provenance precisely.
[ ] I understand why Common Crawl is useful and risky.
[ ] I can explain why PII and secrets in training data are hard to patch out.
[ ] I know the difference between epoch, overfitting, and validation.
[ ] I can explain pruning and quantisation as post-training behavior changes.
[ ] I understand federated learning as a privacy/integrity trade-off.
[ ] I can explain the inheritance problem in fine-tuned models.
[ ] I can explain why model cards matter when weights are opaque.
[ ] I can audit a third-party model page for supply-chain red flags.
```

---

## 24. Suggested Next Notes

Best follow-up topics:

* Prompt Injection and Indirect Prompt Injection
* Model Registry Governance and Approval Workflow
* Secure Fine-Tuning Pipeline Design
* AI Supply Chain Risk Assessment Template
* Red-Team Evaluation for Enterprise LLM Deployments
* Secrets, Memorization, and Data Exfiltration from LLMs
