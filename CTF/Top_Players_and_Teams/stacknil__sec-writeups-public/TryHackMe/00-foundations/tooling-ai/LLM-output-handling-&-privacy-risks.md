---
type: resource-note
status: done
created: 2026-03-11
updated: 2026-03-11
tags: [security-writeup, tryhackme, llm-security, privacy]
source: TryHackMe: LLM Output Handling and Privacy Risks
platform: tryhackme
room: LLM Output Handling and Privacy Risks
slug: llm-output-handling-and-privacy-risks
path: TryHackMe/00-foundations/tooling-ai/LLM-output-handling-&-privacy-risks.md
topic: 00-foundations
domain: [foundations, web]
skills: [input-validation, xss, auth-session, threat-modeling]
artifacts: [concept-notes, pattern-card]
sanitized: true
---

# AI/ML Security Threats + LLM Output Handling & Privacy Risks

> Scope: Intro-level notes for blue-team / appsec work on AI-enabled systems, with emphasis on **LLM output as an attack surface**.

---

## Summary

### Layer cake (taxonomy)

* **AI (Artificial Intelligence / 人工智能)**: umbrella goal: systems that perform tasks that *look like* human cognition.
* **ML (Machine Learning / 机器学习)**: learns patterns from data (not hard-coded rules).
* **DL (Deep Learning / 深度学习)**: ML using multi-layer neural networks; scales with data + compute.
* **GenAI (Generative AI / 生成式AI)**: generates content (text/image/audio/code).
* **LLMs (Large Language Models / 大语言模型)**: GenAI for language; typically transformer-based.

### Why security people care

LLMs shift the trust boundary:

* In classic web apps, you distrust **inputs**.
* In LLM apps, you must distrust **inputs and outputs** (because output is user-influenced and may be executed/rendered).

---

## Key Concepts

### 2) ML lifecycle (where risks appear)

A practical cycle (iterative, not linear):

1. **Define problem**
2. **Data collection**
3. **Data cleaning**
4. **Feature engineering**
5. **Algorithm selection + model**
6. **Training + evaluation**
7. **Deployment**
8. **Monitoring** → drift / attacks → retrain

Security mapping (where to place controls):

* Data stages → poisoning, privacy, provenance
* Training stage → leakage via memorization, insecure fine-tuning pipelines
* Deployment stage → API abuse, model extraction, prompt injection
* Monitoring stage → drift, abuse detection, anomalous outputs

---

### 3) Threat landscape: two buckets

#### A) “AI-model-native” vulnerabilities (new attack surface)

Common examples you’ll see in LLM security discussions:

* **Prompt Injection**: attacker tries to override instructions, jailbreak policies, or manipulate tools.
* **Data Poisoning**: attacker contaminates training/fine-tuning/RAG corpora to bias outputs.
* **Model Theft / Extraction**: attacker clones behavior via excessive querying or steals weights.
* **Privacy Leakage**: model reveals secrets, PII, or internal prompts/context.
* **Model Drift**: performance shifts because reality/data changes; can be exploited to evade detection.

#### B) “Enhanced classic attacks” (old attacks, more scalable)

* **Phishing**: better language, personalization, multilingual fluency.
* **Malware/code generation**: faster iteration, polymorphism assistance.
* **Deepfakes**: stronger social engineering via voice/video impersonation.

---

### 4) Output risks: the core idea

#### Principle: Treat model output as **untrusted data**

LLM output can:

* be **rendered** (HTML/markdown/links)
* be **interpreted** (templates)
* be **executed** (shell/SQL/code)
* trigger **automations** (tickets, CI/CD, SOAR, email)

If your system assumes “the model is safe,” you’ve created a new injection surface.

---

### 5) Improper Output Handling (LLM05)

#### Typical failure modes

* **Frontend rendering**: output inserted into DOM without escaping (e.g., via HTML rendering).
* **Server-side templates**: output placed into template context; template syntax becomes code.
* **Automation**: output becomes commands/queries and is executed.

#### Why it’s easy to miss

* People trust “internal assistants.”
* Output feels like content, not code.
* The attacker’s control is indirect: they shape output via prompts.

#### What “good” looks like

* Output encoding/escaping by default.
* Strict allowlists for formats (e.g., only plaintext/limited markdown).
* Tool calls are structured (JSON schema) and validated before execution.
* Human-in-the-loop for high-impact actions.

---

### 6) Sensitive Information Disclosure (LLM02)

#### Main leak pathways

* **Training-data memorization**: rare but high impact.
* **Context bleed**: secrets injected at runtime (system prompt, RAG, tools) appear in answers.
* **Conversation history leaks**: multi-tenant or poor session isolation.
* **System prompt exposure**: attacker coaxes hidden instructions.

#### Key misconception

> “The model won’t reveal secrets unless told to.”

Models don’t *understand* sensitivity; they pattern-match. If secrets exist in context, leakage is always possible.

---

### 7) Practical lab takeaway (safe summary)

Two classic failure patterns:

1. **Model-generated HTML/JS** rendered as active content → browser-side injection.
2. **Model-generated shell commands** executed by an automation feature → server-side command execution.

The exploit chain is conceptually:

```text
User prompt → model output (malicious) → downstream interpreter (browser/template/shell) → impact
```

The “root bug” is not the model: it’s the system’s **trust boundary**.

---

### 8) Defensive AI: where LLMs help blue teams

LLMs can increase defensive capacity when used safely:

* **Log triage**: explain events, cluster anomalies, propose hypotheses.
* **Detection engineering**: draft rules, regex, Sigma/KQL/Splunk queries (must be reviewed).
* **Threat hunting ideation**: generate scenario candidates.
* **Summarization**: compress long incident reports and correlate themes.

Caveat: the model is a *copilot*, not an *autopilot*.

---

### 9) Mitigation playbook (actionable)

#### Output safety controls (LLM05)

* **Render safely**

  * Default to `textContent` / safe markdown renderer.
  * Apply HTML sanitization (allowlist tags/attrs) if HTML is required.
  * Enforce **CSP (Content Security Policy)** to reduce XSS blast radius.
* **Execute safely**

  * Never execute raw model text as commands.
  * Use structured tool calling: `{"action": "list_files", "path": "/app"}`.
  * Validate arguments; enforce policy rules; run in sandbox.
  * Require approval for destructive/high-privilege actions.

#### Data privacy controls (LLM02)

* **Minimize data in context** (least privilege for prompts + RAG).
* **Secrets hygiene**

  * No secrets in prompts.
  * Use short-lived tokens + scoped credentials.
  * Redact sensitive fields before sending to LLM.
* **Isolation**

  * Strict session boundaries.
  * Tenant-aware retrieval.
* **Monitoring**

  * Detect sensitive patterns in outputs (keys, tokens, PII markers).
  * Rate-limit suspicious queries; log with care.

#### Model governance

* Document threats and controls (threat modeling).
* Use adversarial testing (red teaming) before deployment.
* Monitor drift, bias, and abuse.

---

### 10) Quick checklists

#### Builder checklist (LLM app)

* [ ] Output encoded/escaped by default
* [ ] Sanitization/allowlist for rich formats
* [ ] Structured tool calls; no raw execution
* [ ] Secrets never placed in prompts
* [ ] Session isolation + access control
* [ ] Abuse monitoring + rate limiting
* [ ] Incident response plan includes LLM failure modes

#### Tester checklist (LLM appsec)

* [ ] Can output become active HTML/JS/templates?
* [ ] Can output reach shells/SQL/CI/CD?
* [ ] Can I elicit internal URLs, prompts, keys?
* [ ] Is tenant separation real or cosmetic?
* [ ] Are tool calls validated or “trust the model”?

---

## Glossary (CN quick map)

* **Trust boundary（信任边界）**: where untrusted data enters a privileged system.
* **Output encoding（输出编码/转义）**: treat text as text, not executable markup.
* **Sanitization（净化/白名单过滤）**: remove dangerous constructs from rich content.
* **SSTI（服务器端模板注入）**: template syntax executed on server.
* **DOM XSS（基于DOM的XSS）**: client-side injection via DOM sinks.
* **RAG（检索增强生成）**: retrieval + generation pipeline.
* **Model extraction（模型抽取/盗用）**: cloning behavior via queries.
* **Model drift（模型漂移）**: performance shifts due to data/environment change.

---

## Further reading (start here)

* OWASP: Top 10 for LLM / GenAI risks (project pages)
* MITRE ATLAS: AI adversary tactics & techniques
* IBM: Cost of a Data Breach (AI/automation impact)
