# 📚 BinaryPilot Skills

## 🎯 Overview

Skills are specialized knowledge packages that enhance BinaryPilot agents with deep expertise in specific vulnerability types, technologies, and testing methodologies. Each skill provides advanced techniques, practical examples, and validation methods that go beyond baseline security knowledge.

---

## 🏗️ Architecture

### How Skills Work

When an agent is created, it can load up to 5 specialized skills relevant to the specific subtask and context at hand:

```python
# Agent creation with specialized skills
create_agent(
    task="Test authentication mechanisms in API",
    name="Auth Specialist",
    skills="authentication_jwt,business_logic"
)
```

The skills are dynamically injected into the agent's system prompt, allowing it to operate with deep expertise tailored to the specific vulnerability types or technologies required for the task at hand.

---

## 📁 Skill Categories

| Category | Purpose |
|----------|---------|
| **`/ctf`** | CTF playbooks: `crypto`, `pwn`, `rev`, `web`, `forensics`, `osint`, `misc`, `machine-solving` (HTB boxes: VPN-gated 10.x targets, user.txt/root.txt dual-flag flow) |
| **`/vulnerabilities`** | Web-attack references kept for web-CTF: SQLi, XSS, SSTI, SSRF, XXE, RCE, deserialization, JWT, smuggling, file uploads, business logic, path traversal, race conditions, BFLA, LLM prompt injection, header injection |
| **`/protocols`** | Protocol-specific patterns (GraphQL, OAuth) |
| **`/tooling`** | Command-line playbooks for sandbox tools (agent_browser, ffuf, httpx, katana, naabu, nmap, nuclei, python, semgrep, sqlmap, subfinder) |
| **`/reconnaissance`** | Asset discovery and enumeration |
| **`/scan_modes`** | Solve modes (quick / standard / deep): internal, auto-loaded |
| **`/coordination`** | Root-agent orchestration playbook: internal |
| **`/custom`** | Other specialized workflows (e.g. `source_aware_sast`) |

When a CTF class proves it needs a dedicated playbook we add it under `/ctf` only; dropped upstream categories (cloud, frameworks, technologies) return only if a real CTF class demands them.

Notable source-aware skills:
- `source_aware_whitebox` (coordination): white-box orchestration playbook
- `source_aware_sast` (custom): semgrep/AST/secrets/supply-chain static triage workflow
- `dependency_cve_scanning` (custom): trivy-based SCA workflow for reporting known dependency CVEs via `create_dependency_report`

---

## 🎨 Creating New Skills

### What Should a Skill Contain?

A good skill is a structured knowledge package that typically includes:

- **Advanced techniques**: Non-obvious methods specific to the task and domain
- **Practical examples**: Working payloads, commands, or test cases with variations
- **Validation methods**: How to confirm findings and avoid false positives
- **Context-specific insights**: Environment and version nuances, configuration-dependent behavior, and edge cases
- **YAML frontmatter**: `name` and `description` fields for skill metadata

Skills focus on deep, specialized knowledge to significantly enhance agent capabilities. They are dynamically injected into agent context when needed.

---

## 🤝 Contributing

Community contributions are more than welcome: contribute new skills via [pull requests](https://github.com/usebinarypilot/binarypilot/pulls) or [GitHub issues](https://github.com/usebinarypilot/binarypilot/issues) to help expand the collection and improve extensibility for BinaryPilot agents.

---

> [!NOTE]
> **Work in Progress**: We're actively expanding the skills collection with specialized techniques and new categories.
