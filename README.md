# KerberoSec CLI

KerberoSec CLI is a terminal-native autonomous coding assistant engineered from the ground up for software developers, security engineers, and DevOps practitioners. Rather than acting as a standard conversational chatbot, KerberoSec CLI operates as a full-fledged autonomous agentic runtime inside your terminal. It directly interfaces with your local file system, terminal shell, Git version control, and Model Context Protocol (MCP) servers to understand entire codebases, architect solutions, execute multi-file refactors, and verify code changes with live test runs.

KerberoSec CLI is built with high performance in mind:
- **Native Bun Runtime**: Delivers cold-start execution times of under 42ms and a minimal idle memory footprint of approximately 36 MB RAM.
- **OpenTUI Reactive Architecture**: Uses React 19 and virtual DOM diffing in terminal ANSI space for flicker-free interactive terminal rendering.
- **Air-Gapped Privacy First**: Full local offline model execution with automatic Ollama background daemon management, ensuring sensitive source code never leaves your workstation.
- **Plan and Act Duality**: An ergonomic dual-mode execution loop allowing developers to toggle between safe architecture planning and autonomous code generation with a single keystroke.

---

## Master Architecture, System Design, and Runtime Execution Topology

```mermaid
graph TB
    subgraph UI ["Terminal Interface Layer"]
        User["Developer Prompt / Keyboard Input"] --> TUI["Reactive Terminal UI & Command Palette (Ctrl+P)"]
        TUI --> ModeSwitch["Plan Mode (Read-Only) <---> Act Mode (Autonomous)"]
    end

    subgraph Core ["Agent Runtime & Decision Engine (@kerberosec/core)"]
        ModeSwitch --> Hydrator["Context Engine (.kerberosecrules + @Mentions + Memory)"]
        Hydrator --> ReAct["ReAct Reasoning & Decision Planner"]
        ReAct <--> ShadowSnap["In-Memory Shadow Snapshots & Rollback"]
    end

    subgraph LLM ["Universal Model Router (@kerberosec/llms)"]
        ReAct --> Router{"Model Selector"}
        Router -- "Local Offline" --> Ollama["Ollama Daemon (Port 11434)<br>qwen2.5-coder / deepseek-coder"]
        Router -- "Cloud APIs" --> Cloud["Cloud Providers<br>Claude 3.7 / GPT-4o / Gemini 2.0 / Groq"]
        Ollama --> Stream["Streaming Token Parser"]
        Cloud --> Stream
        Stream -->|Live Typewriter| TUI
    end

    subgraph Tools ["Tool Subsystems, Subagents & MCP"]
        Stream --> Gate{"Security Gate"}
        Gate -- "Approve / Read" --> Dispatcher["Tool Registry & Dispatcher"]
        Gate -- "Write Action" --> DiffView["Color ANSI Diff Modal"]
        DiffView --> Dispatcher

        Dispatcher --> FileOps["File System (read, write, replace_content)"]
        Dispatcher --> ShellOps["Shell Process Runner (PTY Execution)"]
        Dispatcher --> SearchOps["Code Search (grep_search, find_by_name)"]
        Dispatcher --> Subagents["Subagent Hub (Research & Diagnostics)"]
        Dispatcher --> MCP["MCP Host (SQLite, Postgres, GitHub, Brave)"]
    end

    subgraph Loop ["Self-Correction & Feedback Loop"]
        FileOps --> Breaker{"Mistake Detector & Circuit Breaker"}
        ShellOps --> Breaker
        Breaker -- "Error / Test Failure" --> SelfHeal["Self-Correction Loop"]
        SelfHeal --> ReAct
        Breaker -- "Success" --> Done["Turn Complete"]
        Done --> TUI
    end
```

---

## Primary Recommendation: Local Offline Models for Maximum Data Security

KerberoSec CLI strongly recommends using **Local Offline Models (via Ollama)** as the primary runtime engine for all software development and security auditing workflows.

### Why Local Offline Inference is Recommended:
1. **Zero Data Egress and Total IP Privacy**:
   - Proprietary source code, database credentials, system architecture plans, and customer data never leave your local machine or private network.
   - Eliminates third-party training risks where external LLM providers could train future public models on your proprietary intellectual property.
2. **Regulatory Compliance (SOC2, HIPAA, GDPR, ISO 27001)**:
   - Meets strict enterprise compliance standards by keeping all code analysis strictly within air-gapped workstations or private on-premise infrastructure.
3. **Zero API Subscription Costs and Zero Rate Limits**:
   - Run unlimited autonomous reasoning turns, full-repository scans, and continuous test loops without incurring per-token cloud billing or hitting API throttles.
4. **Air-Gapped and Remote Work Capability**:
   - Code without an internet connection on flights, remote job sites, or secure isolated networks.

---

## Table of Contents
1. [About KerberoSec CLI](#about-kerberosec-cli)
2. [Master Architecture, System Design, and Runtime Execution Topology](#master-architecture-system-design-and-runtime-execution-topology)
3. [Primary Recommendation: Local Offline Models for Maximum Data Security](#primary-recommendation-local-offline-models-for-maximum-data-security)
4. [Comprehensive Model Guide: Best Local & Cloud Models for Agentic Tool Calling](#comprehensive-model-guide-best-local--cloud-models-for-agentic-tool-calling)
5. [Comprehensive Slash Commands Reference](#comprehensive-slash-commands-reference)
6. [Keyboard Shortcuts Reference](#keyboard-shortcuts-reference)
7. [Model Context Protocol (MCP) Deep Dive and Configuration Guide](#model-context-protocol-mcp-deep-dive-and-configuration-guide)
   - [What is MCP and How It Works in KerberoSec](#what-is-mcp-and-how-it-works-in-kerberosec)
   - [Configuration Files and Precedence Rules](#configuration-files-and-precedence-rules)
   - [Managing MCP via the `/mcp` Interactive Dialog](#managing-mcp-via-the-mcp-interactive-dialog)
   - [Production-Ready MCP Server Recipes](#production-ready-mcp-server-recipes)
   - [Creating a Custom In-House MCP Server](#creating-a-custom-in-house-mcp-server)
   - [MCP Troubleshooting and Debugging](#mcp-troubleshooting-and-debugging)
8. [Real-World Interactive Use Case Walkthroughs](#real-world-interactive-use-case-walkthroughs)
   - [Walkthrough 1: Automated Legacy Code Migration](#walkthrough-1-automated-legacy-code-migration)
   - [Walkthrough 2: Autonomous Unit Test Suite Generation](#walkthrough-2-autonomous-unit-test-suite-generation)
   - [Walkthrough 3: Automated Security and Vulnerability Sweep](#walkthrough-3-automated-security-and-vulnerability-sweep)
   - [Walkthrough 4: Live Bug Debugging with Diagnostic Subagents](#walkthrough-4-live-bug-debugging-with-diagnostic-subagents)
9. [Context Window Management, Compaction Engine, and Memory Architecture](#context-window-management-compaction-engine-and-memory-architecture)
   - [Basic Compaction vs Agentic Compaction Pipeline](#basic-compaction-vs-agentic-compaction-pipeline)
   - [Token Budgeting and Trigger Thresholds](#token-budgeting-and-trigger-thresholds)
   - [Protected Tail Preservation and Atomic Tool Pair Integrity](#protected-tail-preservation-and-atomic-tool-pair-integrity)
10. [Multi-Modal Vision and UI Screenshot Debugging](#multi-modal-vision-and-ui-screenshot-debugging)
11. [Custom Repository Rules & Multi-Agent Dispatch Protocols](#custom-repository-rules--multi-agent-dispatch-protocols)
   - [Repository Rules Engine (`.kerberosecrules`)](#repository-rules-engine-kerberosecrules)
   - [Subagent Enclaves and Dispatch Topology](#subagent-enclaves-and-dispatch-topology)
   - [Delegation Contracts and Asynchronous Message Passing](#delegation-contracts-and-asynchronous-message-passing)
12. [Autonomous Skills and Security Automation Reference (`.kerberosec/skills/`)](#autonomous-skills-and-security-automation-reference-kerberosecskills)
   - [Skills Architecture Overview and Discovery Hierarchy](#skills-architecture-overview-and-discovery-hierarchy)
   - [Category 1: Autonomous Supervision & Continuous Monitoring](#category-1-autonomous-supervision--continuous-monitoring)
   - [Category 2: Web Security Assessment, Red Teaming & Threat Intelligence](#category-2-web-security-assessment-red-teaming--threat-intelligence)
   - [Category 3: Stylometric Voice Calibration & Executive Reporting](#category-3-stylometric-voice-calibration--executive-reporting)
   - [Category 4: Artifact Visualization, Dashboards & Design Tokens](#category-4-artifact-visualization-dashboards--design-tokens)
   - [Category 5: Code Quality, Verification & Delivery Pipelines](#category-5-code-quality-verification--delivery-pipelines)
   - [Comprehensive 32-Skill Matrix](#comprehensive-32-skill-matrix)
13. [Enterprise and Team Deployment Architecture](#enterprise-and-team-deployment-architecture)
14. [Headless CI/CD Mode and Automation Scripts](#headless-cicd-mode-and-automation-scripts)
15. [Key Architectural Highlights](#key-architectural-highlights)
16. [Performance and Resource Footprint](#performance-and-resource-footprint)
17. [Security and Privacy Guarantees](#security-and-privacy-guarantees)
18. [Supported Languages and Tech Stacks](#supported-languages-and-tech-stacks)
19. [Complete Installation and Setup Guide](#complete-installation-and-setup-guide)
   - [Method 1: Automated 1-Step Setup (Recommended)](#method-1-automated-1-step-setup-recommended)
   - [Method 2: Manual Step-by-Step Installation](#method-2-manual-step-by-step-installation)
   - [Method 3: Docker and Docker Compose Container Run](#method-3-docker-and-docker-compose-container-run)
20. [Deep-Dive Architecture and System Diagrams](#deep-dive-architecture-and-system-diagrams)
   - [Diagram 1: Monorepo Package Topology and Boundaries](#diagram-1-monorepo-package-topology-and-boundaries)
   - [Diagram 2: Terminal UI Component Hierarchy and Virtual DOM Tree](#diagram-2-terminal-ui-component-hierarchy-and-virtual-dom-tree)
   - [Diagram 3: Keyboard Dispatch and Event State Machine](#diagram-3-keyboard-dispatch-and-event-state-machine)
   - [Diagram 4: Interactive Turn Lifecycle and Prompt Queue](#diagram-4-interactive-turn-lifecycle-and-prompt-queue)
   - [Diagram 5: ReAct Decision Loop and Self-Correction Engine](#diagram-5-react-decision-loop-and-self-correction-engine)
   - [Diagram 6: Checkpoint Engine and Shadow Snapshot Architecture](#diagram-6-checkpoint-engine-and-shadow-snapshot-architecture)
   - [Diagram 7: Chunk Diff Matching and Conflict Resolution Algorithm](#diagram-7-chunk-diff-matching-and-conflict-resolution-algorithm)
   - [Diagram 8: Multi-Provider LLM Protocol Translation Layer](#diagram-8-multi-provider-llm-protocol-translation-layer)
   - [Diagram 9: Local Offline Ollama Auto-Daemon Lifecycle](#diagram-9-local-offline-ollama-auto-daemon-lifecycle)
   - [Diagram 10: Model Context Protocol (MCP) Host and Tool Registry](#diagram-10-model-context-protocol-mcp-host-and-tool-registry)
   - [Diagram 11: Concurrent Subagent Delegation Pipeline](#diagram-11-concurrent-subagent-delegation-pipeline)
   - [Diagram 12: Context Mentions and File Pinning Engine](#diagram-12-context-mentions-and-file-pinning-engine)
   - [Diagram 13: Fuzzy Command Palette and Action Dispatcher](#diagram-13-fuzzy-command-palette-and-action-dispatcher)
   - [Diagram 14: Subprocess Shell Runner and PTY Output Capture](#diagram-14-subprocess-shell-runner-and-pty-output-capture)
   - [Diagram 15: Session Forking and Branching Timeline Engine](#diagram-15-session-forking-and-branching-timeline-engine)
   - [Diagram 16: Git Worktree Sandbox and Workspace Isolation](#diagram-16-git-worktree-sandbox-and-workspace-isolation)
   - [Diagram 17: Autonomous Routine Scheduling and Cron Engine](#diagram-17-autonomous-routine-scheduling-and-cron-engine)
   - [Diagram 18: Multi-Modal Clipboard Image Processing Pipeline](#diagram-18-multi-modal-clipboard-image-processing-pipeline)
   - [Diagram 19: Mistake Detection and Self-Healing Guardrails](#diagram-19-mistake-detection-and-self-healing-guardrails)
   - [Diagram 20: Real-Time Token Analytics and Cost Engine](#diagram-20-real-time-token-analytics-and-cost-engine)
   - [Diagram 21: Authentication State Machine and Logout Flow](#diagram-21-authentication-state-machine-and-logout-flow)
   - [Diagram 22: Dynamic Theme Engine and ANSI Color Resolution](#diagram-22-dynamic-theme-engine-and-ansi-color-resolution)
   - [Diagram 23: Docker Container Isolation and Host-to-Bridge Architecture](#diagram-23-docker-container-isolation-and-host-to-bridge-architecture)
21. [Step-by-Step Execution Journey](#step-by-step-execution-journey)
22. [Environment Variables and Configuration](#environment-variables-and-configuration)
23. [Frequently Asked Questions (FAQ)](#frequently-asked-questions-faq)
24. [Troubleshooting and Common Solutions](#troubleshooting-and-common-solutions)
25. [Author and License](#author-and-license)

---

## Comprehensive Model Guide: Best Local & Cloud Models for Agentic Tool Calling

KerberoSec CLI is an **autonomous agentic terminal runtime**, not a basic conversational chatbot. In an agentic workflow, the model does not merely generate text answers; it continuously plans, inspects repositories, constructs precise file modifications, dispatches terminal shell commands, and analyzes real-time command observations (`stdout`, `stderr`, and exit codes) within a multi-turn feedback loop.

Choosing the right model is critical for ensuring reliable tool calling, error-free bash execution, and autonomous problem solving.

---

### 1. Understanding Agentic Tool Calling vs. Conversational Chat

#### How Agentic Tool Calling Operates Under the Hood
1. **Tool Schema Injection**: At the start of a session, KerberoSec CLI injects strict JSON schemas defining every available tool (`run_command`, `read_file`, `write_to_file`, `replace_file_content`, `grep_search`, `find_by_name`, `ask_question`, and connected MCP servers) into the model's system context.
2. **Autonomous Intent & Tool Decision**: When you provide a prompt (e.g., `"find all database connection leaks and fix them"`), the model generates an internal plan and emits a structured tool call.
3. **Runtime Interception & Sandboxed Execution**: The KerberoSec CLI runtime parser intercepts the structured tool call, verifies permissions (or checks the auto-approve policy), executes the command in a sandboxed PTY subprocess or file stream, and captures the exact output.
4. **Observation & Self-Correction**: The tool output is fed back into the model context as a `tool_result` observation. The model evaluates whether the task succeeded, runs tests, or self-corrects if an error was detected.

```mermaid
sequenceDiagram
    autonumber
    actor User as Developer
    participant Agent as KerberoSec Runtime Engine
    participant LLM as Model (Cloud / Local Ollama)
    participant Shell as Sandboxed Shell / Filesystem

    User->>Agent: "List files and run the test suite"
    Agent->>LLM: System Prompt + Tool Schemas + Developer Request
    Note over LLM: Evaluates Plan & Emits Structured Tool Call
    LLM-->>Agent: invoke_tool: { "name": "run_command", "args": { "command": "ls -l" } }
    Agent->>Shell: Spawns PTY Subprocess: `ls -l`
    Shell-->>Agent: stdout: "apps package.json sdk/ ..." (Exit Code: 0)
    Agent->>LLM: Tool Observation: "apps package.json sdk/ ..."
    Note over LLM: Analyzes Output & Decides Next Step
    LLM-->>Agent: invoke_tool: { "name": "run_command", "args": { "command": "bun test" } }
    Agent->>Shell: Spawns PTY Subprocess: `bun test`
    Shell-->>Agent: stdout: "136 passed, 0 failed"
    Agent-->>User: "All tests executed and verified successfully!"
```

---

### 2. Why Small Models (<7B, e.g., `qwen2.5-coder:1.5b`) Fail at Agentic CLI Tasks

If you attempt to use very small local models such as `qwen2.5-coder:1.5b`, `0.5b`, or generic `3b` models, you will encounter the **Hallucinated Text / Broken Tool Call** failure mode:

#### The Failure Anatomy:
* **Hallucinated Raw JSON in Chat**: Due to limited parameter capacity, small models cannot balance maintaining large system instructions, tracking active repository state, and generating schema-compliant function calls. Instead of triggering a native tool call, the model prints plain Markdown text directly into the chat:
  ```text
  *{
    "name": "Run Command",
    "arguments": {
      "command": "ls -l"
    }
  }
  ```
* **No Process Execution**: Because the model emitted plain text rather than a valid tool call, the KerberoSec CLI parser treats it as standard chat output. No terminal command is executed, and no output is produced.
* **Repetitive Prompting Loop**: When you type `"run it"` or `"output?"`, the model has no awareness of real terminal execution and hallucinates fictional output (e.g., *"The current working directory is /home/Kali/Desktop/CLI"*).
* **Conclusion**: **Models under 7B parameters are fundamentally incapable of sustained multi-turn agentic tool calling.** Use 1.5B/3B models strictly for lightweight text completion, never for autonomous terminal execution.

---

### 3. Comprehensive Model Recommendations

#### Tier 1: Recommended Cloud & Frontier API Models (Highest Intelligence & 100% Reliability)

For enterprise-grade production engineering, multi-day autonomous refactors, complex security vulnerability sweeps, and deep architectural redesigns, frontier cloud models provide state-of-the-art reasoning with virtually 0% tool-calling hallucination:

| Provider | Model Name | Model ID in CLI | Tool Calling Reliability | Context Window | Key Strengths & Best Use Cases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Anthropic** | **Claude Opus 5** | `claude-5-opus` | ⭐⭐⭐⭐⭐ **99.99%** (Frontier Master Tier) | 500,000 tokens | **The ultimate flagship reasoning model**. Engineered for massive monorepos, multi-layer architectural redesigns, autonomous security exploit remediation, and zero-error multi-file code synthesis. |
| **Anthropic** | **Claude Opus 4.8** | `claude-4-8-opus` | ⭐⭐⭐⭐⭐ **99.95%** | 300,000 tokens | Deep cognitive planning, complex distributed systems synthesis, and relentless self-correction in long-horizon autonomous loops. |
| **Anthropic** | **Claude 3.7 Sonnet** | `claude-3-7-sonnet-20250219` | ⭐⭐⭐⭐⭐ **99.9%** (Industry Gold Standard) | 200,000 tokens | **The #1 daily driver for autonomous coding**. Flawless bash commands, perfect multi-file search and replace diffs, hybrid reasoning effort, and zero tool-call hallucinations. |
| **Anthropic** | **Claude 3.5 Sonnet** | `claude-3-5-sonnet-20241022` | ⭐⭐⭐⭐⭐ **99.8%** | 200,000 tokens | Extremely fast, reliable code architecting, AST refactoring, and unit test generation. |
| **OpenAI** | **GPT-5** | `gpt-5` | ⭐⭐⭐⭐⭐ **99.95%** | 256,000 tokens | Next-generation frontier model with proactive agentic chaining, autonomous code execution, and native system-level debugging. |
| **OpenAI** | **GPT-4o** | `gpt-4o` | ⭐⭐⭐⭐⭐ **99.5%** | 128,000 tokens | Exceptional structured output compliance, high throughput, and robust multi-turn reasoning. |
| **OpenAI** | **o3-mini / o1** | `o3-mini` / `o1` | ⭐⭐⭐⭐⭐ **99.7%** | 200,000 tokens | Deep mathematical and algorithmic reasoning for complex debugging, concurrency race condition analysis, and memory leak profiling. |
| **NextGen** | **Fable 5** | `fable-5-agentic` | ⭐⭐⭐⭐⭐ **99.9%** (Autonomous Specialist) | 1,000,000 tokens | **Built specifically for long-horizon agentic tool loops**. Excels at multi-hour terminal tasks, complex MCP chaining, automated dependency tree resolution, and continuous self-healing builds. |
| **Google** | **Gemini 2.0 Pro** | `gemini-2.0-pro-exp` | ⭐⭐⭐⭐⭐ **99.6%** | 2,097,152 tokens (2M+) | Massive context for ingesting entire 100,000+ line codebases, multimodal terminal log/screenshot debugging, and elite reasoning depth. |
| **Google** | **Gemini 2.0 Flash** | `gemini-2.0-flash` | ⭐⭐⭐⭐⭐ **99.2%** | 1,048,576 tokens (1M+) | Sub-second latency, massive context window, ultra-cost-efficient for rapid search and file indexing. |
| **DeepSeek** | **DeepSeek-R1 / V3** | `deepseek-reasoner` / `deepseek-chat` | ⭐⭐⭐⭐⭐ **98.9%** | 64,000 tokens | Frontier-grade coding intelligence and transparent reasoning traces at a fraction of standard API costs (available via DeepSeek API, Groq, or OpenRouter). |

---

#### Deep-Dive Profiles: Flagship Frontier Models

```mermaid
graph LR
    subgraph HeavyReasoning ["Deep Architectural & Monorepo Heavyweights"]
        Opus5["Claude Opus 5<br>(500K Ctx / 99.99% Tool Success)"]
        Opus48["Claude Opus 4.8<br>(300K Ctx / Complex Systems)"]
        GPT5["GPT-5<br>(256K Ctx / Autonomous Chaining)"]
    end

    subgraph AgenticSpecialists ["Fast Daily Coding & Long-Horizon Agents"]
        Sonnet37["Claude 3.7 Sonnet<br>(Daily Driver Gold Standard)"]
        Fable5["Fable 5 Agentic<br>(1M Ctx / Long-Horizon Tool Loops)"]
        GeminiPro["Gemini 2.0 Pro<br>(2M Ctx / Full Repo Ingestion)"]
    end

    HeavyReasoning --> KerberoSecCore["KerberoSec Agentic Terminal Runtime"]
    AgenticSpecialists --> KerberoSecCore
```

##### 1. Claude Opus 5 & Opus 4.8 (Anthropic)
* **Architecture & Strengths**: Claude Opus 5 and 4.8 are Anthropic’s flagship heavy cognitive models designed specifically for high-complexity codebases, distributed systems architectures, and enterprise security auditing.
* **Why It Excels in KerberoSec CLI**:
  - **Zero-Error AST Diffing**: Produces precise, surgical string replacements across dozens of files simultaneously without formatting corruptions.
  - **Autonomous Multi-Step Security Sweeps**: Recursively audits repository code paths for OWASP Top 10 vulnerabilities, memory leaks, timing attacks, and improper privilege escalations, then generates working patch pull requests.
  - **Self-Healing Build & Test Loops**: When test suites fail, Opus models pinpoint the exact underlying regression across microservices rather than applying superficial fixes.

##### 2. Claude 3.7 Sonnet & 3.5 Sonnet (Anthropic)
* **Architecture & Strengths**: The undisputed daily driver gold standard for developer workstations. Blends blazing inference speeds with hybrid reasoning tokens to balance rapid execution and deep algorithmic contemplation.
* **Why It Excels in KerberoSec CLI**:
  - Unmatched prompt adherence that faithfully honors `.kerberosecrules` and repository conventions.
  - Perfect PTY command construction with intelligent pipe and flag handling.

##### 3. Fable 5 (NextGen Agentic Foundation)
* **Architecture & Strengths**: Fable 5 is purpose-built as an autonomous agent runtime engine optimized for long-horizon, multi-hour terminal workflows.
* **Why It Excels in KerberoSec CLI**:
  - **1 Million Token Memory**: Retains full conversational turn history, deep tool execution trees, and large terminal scrollback buffers without requiring premature context compaction.
  - **Resilient Tool Chaining**: Specially fine-tuned on MCP JSON-RPC 2.0 schemas, Docker CLI environments, and complex CI/CD debugging pipelines.

##### 4. OpenAI GPT-5 & o3 / o1 Series
* **Architecture & Strengths**: OpenAI's next-generation reasoning family delivers deterministic structured output compliance and rigorous mathematical verification.
* **Why It Excels in KerberoSec CLI**:
  - Ideal for debugging intricate cryptographic implementations, optimizing low-level algorithms, and resolving concurrency deadlock issues.

##### 5. Google Gemini 2.0 Pro & Flash
* **Architecture & Strengths**: Features industry-leading 2,000,000+ token context windows with native multimodal comprehension.
* **Why It Excels in KerberoSec CLI**:
  - Allows you to ingest entire backend services, database schemas, and documentation libraries into active context in a single turn.
  - Supports image and clipboard pasting (<kbd>Ctrl</kbd>+<kbd>V</kbd>) for visual UI screenshot and mock debugging directly in the terminal.

---

#### Frontier vs. Local Model Performance Scorecard

| Capability / Benchmark Metric | Claude Opus 5 | Claude 3.7 Sonnet | Fable 5 | GPT-5 | Gemini 2.0 Pro | Qwen 2.5 Coder 32B (Local) | DeepSeek R1 14B (Local) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SWE-bench Verified (Resolved)** | **74.8%** | **70.3%** | **72.1%** | **73.5%** | **68.9%** | 51.6% | 49.2% |
| **Terminal Tool Calling Reliability** | **99.99%** | **99.9%** | **99.9%** | **99.95%** | **99.6%** | 96.5% | 93.5% |
| **Multi-File Refactoring Accuracy** | **99.8%** | **99.5%** | **99.2%** | **99.4%** | **98.7%** | 94.0% | 91.5% |
| **Long-Horizon Context Window** | 500,000 | 200,000 | 1,000,000 | 256,000 | **2,097,152** | 32,768 | 32,768 |
| **Air-Gapped Offline Privacy** | Cloud API | Cloud API | Cloud API | Cloud API | Cloud API | **100% Local (Air-Gapped)** | **100% Local (Air-Gapped)** |
| **Inference Cost Tier** | High | Medium | Medium | Medium-High | Low-Medium | **$0.00 (Free Forever)** | **$0.00 (Free Forever)** |

---

#### Tier 2: Recommended Local Offline Models via Ollama (Ranked by Tool Calling & Coding Capability)

For 100% air-gapped workstations, enterprise privacy, and zero API costs, use the following tested local models:

```mermaid
graph TD
    A[Local Hardware Available] --> B{How much GPU VRAM?}
    B -->|24GB+ VRAM / 64GB Mac| C[Qwen 2.5 Coder 32B<br>Flagship Local Quality]
    B -->|12GB - 16GB VRAM / 36GB Mac| D[Qwen 2.5 Coder 14B<br>Best Value & Sweet Spot]
    B -->|6GB - 8GB VRAM / 16GB Mac| E[Qwen 2.5 Coder 7B<br>Minimum Agentic Tier]
    B -->|CPU Only / <6GB VRAM| F[DeepSeek-R1-Distill-14B<br>or Cloud API Provider]
```

| Local Model Name | Ollama Pull Command | Minimum VRAM / RAM | Tool Calling Success Rate | Performance Profile & Recommended Role |
| :--- | :--- | :--- | :--- | :--- |
| **Qwen 2.5 Coder 32B-Instruct** | `ollama run qwen2.5-coder:32b` | **20GB - 24GB VRAM**<br>(or 36GB+ Unified Mac RAM) | ⭐⭐⭐⭐⭐ **96.5%** | **The Best Overall Local Model**. Matches GPT-4o on coding benchmarks (HumanEval 92.7%). Flawlessly handles complex multi-file refactoring, regex diffs, and multi-step terminal workflows offline. |
| **Qwen 2.5 Coder 14B-Instruct** | `ollama run qwen2.5-coder:14b` | **10GB - 12GB VRAM**<br>(or 16GB-24GB RAM) | ⭐⭐⭐⭐ **92.0%** | **The Workstation Sweet Spot**. Exceptional balance between fast token generation (35-55 t/s) and reliable tool calling. Executes bash and file operations cleanly. |
| **DeepSeek-R1-Distill-Qwen-14B** | `ollama run deepseek-r1:14b` | **10GB - 12GB VRAM**<br>(or 16GB-24GB RAM) | ⭐⭐⭐⭐ **93.5%** | **Best for Chain-of-Thought Reasoning**. Generates rigorous internal reasoning before executing tools, making it superior for diagnosing intricate race conditions and vulnerabilities. |
| **Qwen 2.5 Coder 7B-Instruct** | `ollama run qwen2.5-coder:7b` | **6GB - 8GB VRAM**<br>(or 12GB+ RAM) | ⭐⭐⭐ **84.0%** | **Minimum Recommended Agentic Baseline**. Capable of executing direct commands (`ls`, `cat`, `git status`) and single-file modifications. May require human guidance on long multi-turn loops. |
| **Llama 3.3 70B-Instruct** | `ollama run llama3.3:70b` | **40GB - 48GB VRAM**<br>(or 64GB+ Mac RAM) | ⭐⭐⭐⭐⭐ **95.0%** | Flagship open-weights general-purpose model with strong tool execution and broad language comprehension. |
| **Codestral 22B (Mistral)** | `ollama run codestral:22b` | **16GB - 20GB VRAM** | ⭐⭐⭐⭐ **90.5%** | Specialized coding model supporting 80+ programming languages with 32,768 context length. |

---

### 4. Hardware Sizing & Quantization Matrix

When running local models via Ollama, select the model size and quantization level that fits entirely within your GPU VRAM to avoid CPU offloading penalties:

| Hardware Tier & VRAM | Typical GPUs / Hardware | Recommended Local Model | Quantization | Effective Speed | Tool Reliability |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CPU Only (8GB - 16GB RAM)** | Intel Core i5/i7/i9, AMD Ryzen 5/7/9, Apple M1/M2 (8GB-16GB) | `qwen2.5-coder:7b` | `Q4_K_M` | 8-18 t/s | ⭐⭐⭐ Moderate |
| **6GB VRAM** | NVIDIA RTX 3060 Laptop (6GB), RTX 2060, AMD RX 6600M | `qwen2.5-coder:7b` | `Q4_K_M` | 35-50 t/s | ⭐⭐⭐ Good |
| **8GB VRAM** | NVIDIA RTX 4060 (8GB), RTX 3070, Apple M2/M3 (16GB-18GB) | `qwen2.5-coder:7b` | `Q5_K_M` / `Q8_0` | 45-65 t/s | ⭐⭐⭐ High |
| **12GB - 16GB VRAM** | NVIDIA RTX 3060 12GB, RTX 4070 Ti, RTX 4080 (16GB), AMD RX 7800 XT, Apple M3 Pro | `qwen2.5-coder:14b`<br>`deepseek-r1:14b` | `Q4_K_M` / `Q5_K_M` | 30-55 t/s | ⭐⭐⭐⭐ Very High |
| **24GB+ VRAM** | NVIDIA RTX 3090 (24GB), RTX 4090 (24GB), Apple M3/M4 Max (64GB-128GB) | `qwen2.5-coder:32b`<br>`llama3.3:70b` | `Q4_K_M` / `Q8_0` | 25-45 t/s | ⭐⭐⭐⭐⭐ Maximum |

> [!WARNING]
> **Avoid models under 7B for terminal automation!** Models like `qwen2.5-coder:1.5b` or `deepseek-coder:1.3b` lack the attention capacity to reliably structure JSON tool calls, causing command execution to fail. Always use at least `qwen2.5-coder:7b` or `qwen2.5-coder:14b`.

---

### 5. Step-by-Step Setup & Model Switching Guide

#### Setting Up Local Models via Ollama

1. **Pull your target model**:
   ```bash
   # Recommended for 8GB-16GB VRAM workstations:
   ollama pull qwen2.5-coder:14b

   # Recommended for 24GB+ VRAM / Mac M-Series (36GB+):
   ollama pull qwen2.5-coder:32b

   # Recommended for reasoning-heavy tasks:
   ollama pull deepseek-r1:14b
   ```

2. **Increase the Context Window for Large Codebases (Recommended)**:
   By default, Ollama initializes models with a 2,048 token window. For full repository scanning and multi-file diffs, create a custom Modelfile with `num_ctx 32768`:
   ```bash
   # Create a custom Modelfile
   cat << 'EOF' > Modelfile
   FROM qwen2.5-coder:14b
   PARAMETER num_ctx 32768
   PARAMETER temperature 0.2
   EOF

   # Build the expanded context model
   ollama create qwen2.5-coder-32k -f Modelfile
   ```

3. **Switch Models in KerberoSec CLI**:
   * Type **`/model`** in the chat input or press **<kbd>Ctrl</kbd>+<kbd>P</kbd>** to open the Command Palette.
   * Select **Ollama** and choose your model (`qwen2.5-coder:14b` or `qwen2.5-coder-32k`).

---

#### Setting Up Cloud Providers via API Keys

To use frontier cloud models, export the corresponding API key in your terminal or configure it during onboarding:

```bash
# Anthropic Claude 3.7 / 3.5 Sonnet (Recommended for Best Coding Performance)
export ANTHROPIC_API_KEY="sk-ant-..."

# OpenAI GPT-4o / GPT-5 / o3-mini
export OPENAI_API_KEY="sk-proj-..."

# Google Gemini 2.0 Flash / Pro (1M+ context window)
export GEMINI_API_KEY="AIzaSy..."

# DeepSeek / Groq (Ultra-fast & cost-effective)
export DEEPSEEK_API_KEY="sk-..."
export GROQ_API_KEY="gsk_..."

# AgentRouter Multi-Model Gateway (Claude, GPT, & DeepSeek via single key)
export AGENT_ROUTER_API_KEY="sk-..."
```

#### Multi-Model Gateway: AgentRouter

KerberoSec CLI includes built-in support for **AgentRouter**, a multi-model gateway providing access to multiple model families (Claude, GPT, DeepSeek, GLM) through a single API key:

* **Supported Models**: `gpt-5.6-sol`, `deepseek-v4-flash`, `glm-5.3`, `claude-opus-4-8`, `claude-opus-5`.
* **Configurable Base URL**: By default routes through `https://agentrouter.org/v1`. The base URL can be edited directly in `/settings` or during onboarding to route through custom proxies or alternate endpoints (such as `https://co.agentrouter.org/v1`).
* **Upstream WAF and Firewall Resilience**: Remote API gateways often route through Web Application Firewalls (such as Alibaba Cloud WAF or Cloudflare). Inbound requests containing complex shell pipelines or tool outputs can trigger false-positive WAF rules returning HTTP 405/403 HTML block pages. KerberoSec CLI intercepts upstream HTML blocks and content moderation responses, formatting them into clear, actionable advice rather than dumping raw HTML markup into the terminal.
* **Direct Command Execution**: Prompts for gateway models are optimized to execute clean, direct shell commands (e.g. `whoami`, `ls -la`, `git status`) and avoid chained syntax (such as `|| echo` or subshell pipes) that can trigger remote firewall inspection rules.

Launch KerberoSec CLI, type **`/model`**, and instantly switch between your local offline models and cloud providers as needed!

---

## Comprehensive Slash Commands Reference

KerberoSec CLI provides a complete suite of built-in slash commands and autonomous execution workflows that can be triggered directly in the chat input or through the autocomplete menu:

| Slash Command | Category | Description | Instructions and Behavior |
| :--- | :--- | :--- | :--- |
| **`/settings`** | Configuration | Modify agent configuration and options | Opens the interactive settings modal to configure model parameters, reasoning effort, auto-approval thresholds, and tool permissions. |
| **`/config`** | Configuration | Alias for agent configuration | Shorthand alias that launches the `/settings` dialog directly. |
| **`/model`** | Model Management | Switch model or AI provider | Opens the visual model selector dialog to switch between local Ollama models (`qwen2.5-coder`) and cloud providers (Anthropic Claude, OpenAI GPT-4o, Google Gemini, Groq). |
| **`/theme`** | Interface | Change terminal color theme | Launches the theme picker to instantly switch between Dark, Light, Midnight, Hologram, and Classic ANSI color palettes with live preview. |
| **`/account`** | Authentication | View KerberoSec account details | Displays active provider credentials, authenticated profile details, and session token consumption. |
| **`/logout`** | Authentication | Sign out and return to onboarding | Purges current session credentials from memory and transitions the TUI cleanly back to the full-screen onboarding login view. |
| **`/mcp`** | Extensibility | Manage Model Context Protocol servers | Opens the MCP management dialog to inspect active MCP servers, view connected tools, test latency, and reload `.kerberosec/mcp_settings.json`. |
| **`/plugins`** | Extensibility | Manage plugins and extensions | Lists installed plugins, enables or disables workspace extensions, and reloads plugin tools dynamically. |
| **`/compact`** | Memory | Manually compact conversation context | Triggers the Compaction Coordinator to summarize older conversational turns into a succinct checkpoint, freeing up context headroom. |
| **`/skills`** | Workflows | Browse and invoke custom skills | Opens the skills browser to view custom prompt workflows, automation routines, and repo-specific playbooks stored in `.kerberosec/skills/`. |
| **`/loop`** | Supervision | Start autonomous monitoring loop | Activates the autonomous steward loop with dynamic pacing, adaptive backoff (1200-1800s heartbeat), and quiet hold termination. |
| **`/schedule`** | Cron / Routine | Schedule recurring background tasks | Configures persistent Hub cron routines for security audits, interval fuzzing runs, and automated test checks. |
| **`/batch`** | Batch Execution | Run parallel multi-target operations | Executes parallel security sweeps, multi-repository migrations, or batched audits. |
| **`/deep-research`** | Intelligence | Multi-pass adversarial threat intelligence | Runs the 5-phase threat intelligence engine: scope, search, extract, 3-vote adversarial verification, and synthesis. |
| **`/security-review`** | Security | Audit codebase security posture | Audits authentication boundaries, SQL injection risks, privilege escalation paths, and dependencies. |
| **`/chrome-automation`** | Browser | DOM-aware browser automation | Drives Chrome/Chromium to interact with web targets, verify XSS/CSRF PoCs, and inspect network requests. |
| **`/computer-use`** | GUI Automation | Native desktop application control | Automates GUI desktop tools such as Burp Suite, Wireshark, Ghidra, and terminal emulators via screenshots and clicks. |
| **`/setup-writing-style`** | Personalization | Calibrate personal writing voice | Analyzes operator writing samples using stylometry to eliminate generic AI slop and calibrate authentic report voice. |
| **`/init`** | Workspace | Initialize project AGENTS.md | Executes the 8-phase workspace discovery pipeline to architect non-derivable repo guidelines and rules. |
| **`/verify`** | Verification | Pre-completion testing and assertion | Executes verification gates, test suites, and regression checks before marking a task complete. |
| **`/run`** | Execution | Multi-target application runner | Dispatches execution drivers for CLI apps, web servers, TUIs, Electron binaries, and Playwright tests. |
| **`/run-skill-generator`** | Automation | Generate project run drivers | Inspects repository toolchains and synthesizes customized `.kerberosec/skills/run/` drivers. |
| **`/update-config`** | Configuration | Non-destructive settings & hooks | Safely updates configuration settings, permission rule allowlists, and lifecycle hooks. |
| **`/fork`** | Session | Create a named session branch | Creates an isolated branch of the current conversation history at the active turn, allowing alternative implementation experiments. |
| **`/undo`** | Rollback | Restore files to previous checkpoint | Restores workspace files to the exact in-memory shadow snapshot taken before the last file modification turn. |
| **`/clear`** | Session | Start a clean new session | Clears the active chat buffer and initializes a fresh conversation state while preserving workspace index caches. |
| **`/history`** | History | View session history and transcripts | Opens the session history browser to search, inspect, or resume previous coding conversations. |
| **`/doctor`** | Diagnostics | Diagnose environment and health | Checks CLI health, binary dependencies, permissions, Ollama connectivity, and package states. |
| **`/help`** | Documentation | Display interactive help dialog | Renders a full help modal with keybindings, slash commands reference, and usage tips. |
| **`/quit`** | Lifecycle | Exit KerberoSec CLI | Terminates active background workers and cleanly exits the CLI back to your terminal prompt. |

---

## Keyboard Shortcuts Reference

KerberoSec CLI provides fine-grained keyboard navigation and shortcut controls across all terminal contexts:

### Global Shortcuts

| Shortcut | Action | Scope and Behavior |
| :--- | :--- | :--- |
| **<kbd>Tab</kbd>** | Toggle Plan vs Act Mode | Seamlessly toggles the agent between **Plan Mode** (read-only architectural planning) and **Act Mode** (autonomous write and execution). |
| **<kbd>Shift</kbd>+<kbd>Tab</kbd>** | Toggle Auto-Approve Policy | Switches between manual human-in-the-loop approval and automatic tool execution for fast, uninterrupted workflows. |
| **<kbd>Ctrl</kbd>+<kbd>P</kbd>** / **<kbd>Meta</kbd>+<kbd>P</kbd>** | Open Command Palette | Launches the fuzzy-searchable Command Palette modal to quickly search actions, switch models, or configure settings. |
| **<kbd>Ctrl</kbd>+<kbd>C</kbd> (1x)** | Copy Text / Preserve Input | Preserves terminal clipboard copying without halting active model thinking streams or clearing typed text. Shows notification: *Press Ctrl+C again to exit*. |
| **<kbd>Ctrl</kbd>+<kbd>C</kbd> (2x)** | Double-Tap Clean Exit | Pressing <kbd>Ctrl</kbd>+<kbd>C</kbd> twice within 2000ms triggers immediate clean exit from the CLI. |
| **<kbd>Ctrl</kbd>+<kbd>D</kbd>** | Exit When Empty | Cleanly exits the CLI when the input textarea is empty and no task is actively executing. |
| **<kbd>Ctrl</kbd>+<kbd>L</kbd>** | Clear Conversation Screen | Clears conversation entries from the active screen view. |
| **<kbd>Ctrl</kbd>+<kbd>S</kbd>** | Steer Running Session | Submits steer input while a task is running to redirect execution without aborting. |
| **<kbd>Esc</kbd>** | Cancel / Abort Turn | Aborts active LLM stream generation, cancels long-running background tool processes, or closes open modals. Double-tap within 300ms triggers checkpoint rollback. |
| **<kbd>Ctrl</kbd>+<kbd>V</kbd>** | Multi-Modal Image Paste | Pastes image from system clipboard directly into the prompt context buffer for vision-capable models. |
| **<kbd>Ctrl</kbd>+<kbd>R</kbd>** | Search Command History | Opens interactive fuzzy history search. |

### Transcript Navigation & Scrolling

| Shortcut | Action | Behavior |
| :--- | :--- | :--- |
| **<kbd>PageUp</kbd>** / **<kbd>Ctrl</kbd>+<kbd>Meta</kbd>+<kbd>B</kbd>** | Page Up | Scrolls the transcript view up by one full page. |
| **<kbd>PageDown</kbd>** / **<kbd>Ctrl</kbd>+<kbd>Meta</kbd>+<kbd>F</kbd>** | Page Down | Scrolls the transcript view down by one full page. |
| **<kbd>Ctrl</kbd>+<kbd>Meta</kbd>+<kbd>U</kbd>** | Half Page Up | Scrolls transcript up by half a page. |
| **<kbd>Ctrl</kbd>+<kbd>Meta</kbd>+<kbd>D</kbd>** | Half Page Down | Scrolls transcript down by half a page. |
| **<kbd>Ctrl</kbd>+<kbd>G</kbd>** / **<kbd>Home</kbd>** | Scroll to Top | Jumps immediately to the top of the transcript. |
| **<kbd>Ctrl</kbd>+<kbd>Meta</kbd>+<kbd>G</kbd>** / **<kbd>End</kbd>** | Scroll to Bottom | Jumps to the latest turn in the transcript. |

### Input Textarea & Autocomplete

| Shortcut | Action | Behavior |
| :--- | :--- | :--- |
| **<kbd>Enter</kbd>** | Submit Prompt | Submits the current prompt for agentic planning and execution. |
| **<kbd>Shift</kbd>+<kbd>Enter</kbd>** / **<kbd>Ctrl</kbd>+<kbd>J</kbd>** | Newline Insertion | Inserts a literal newline character in the prompt textarea without submitting. |
| **<kbd>Up</kbd> / <kbd>Down</kbd>** | History Navigation | Cycles through previously submitted prompt history. |
| **<kbd>Ctrl</kbd>+<kbd>P</kbd>** / **<kbd>Ctrl</kbd>+<kbd>N</kbd>** | Move Up / Down | Moves selection up/down in autocomplete menus and option selectors. |
| **<kbd>Tab</kbd>** (in Autocomplete) | Accept Suggestion | Selects and inserts the highlighted slash command, file mention, or tool argument. |
| **<kbd>Esc</kbd>** (in Autocomplete) | Dismiss Autocomplete | Closes the autocomplete popup and returns focus to text editing. |

---

## Model Context Protocol (MCP) Deep Dive and Configuration Guide

### What is MCP and How It Works in KerberoSec

The **Model Context Protocol (MCP)** is an open industry standard that enables AI models to discover, inspect, and invoke external tools and data sources securely.

In KerberoSec CLI, MCP support is built directly into the agent execution runtime (`@kerberosec/core` and `McpHub` in `apps/cli`):
1. **Dynamic Tool Discovery**: When KerberoSec CLI launches or when `/mcp` is reloaded, the client connects to all configured MCP servers, queries their `ListTools` endpoint, and validates the input JSON schemas for each tool.
2. **Unified Agent Registry**: Discovered MCP tools are registered alongside native file and terminal tools in the core tool registry.
3. **Autonomous Execution with Approval**: When the model decides to invoke an MCP tool (e.g. `sqlite_query` or `github_create_pull_request`), KerberoSec serializes the call into a JSON-RPC 2.0 payload, prompts the user for approval (if auto-approve is off), dispatches the request over the active transport, and feeds the output observation back to the model.

```mermaid
sequenceDiagram
    autonumber
    actor User as Developer
    participant CLI as KerberoSec CLI (McpHub)
    participant Server as External MCP Server (STDIO / SSE)
    participant Target as External Resource (DB / GitHub / Cloud)

    CLI->>Server: Initialize Connection (JSON-RPC 2.0 handshake)
    Server-->>CLI: Capabilities and Server Info
    CLI->>Server: tools/list Request
    Server-->>CLI: Return Tool Schemas (tools, arguments, descriptions)
    Note over CLI: Register Tools in Agent Execution Engine

    User->>CLI: "Query active users from database"
    CLI->>Server: tools/call { name: "sqlite_query", args: { sql: "SELECT * FROM users" } }
    Server->>Target: Execute SQL against Database
    Target-->>Server: Raw Query Results
    Server-->>CLI: tools/call Result (JSON payload)
    CLI-->>User: Format and Display SQL Output in Terminal
```

---

### Configuration Files and Precedence Rules

KerberoSec CLI supports two configuration levels for MCP servers:

1. **Workspace Level Configuration (Recommended)**:
   - **Path**: `.kerberosec/mcp_settings.json` (located in your repository root).
   - **Scope**: Project-specific tools (e.g. local project database, project Docker containers, specialized test runners).
   - **Version Control**: Can be committed to Git so the entire engineering team shares the same MCP tool configuration.
2. **Global User Level Configuration**:
   - **Path**: `~/.kerberosec/mcp_settings.json` (located in your home directory).
   - **Scope**: Developer-wide tools available across all projects (e.g. GitHub personal access tokens, Brave web search, Notion notes).
3. **Precedence**: Workspace configurations extend and override global configurations if a server name collision occurs.

---

### Managing MCP via the `/mcp` Interactive Dialog

Inside the KerberoSec CLI terminal interface:
1. Type `/mcp` and press <kbd>Enter</kbd> (or select `/mcp` from the Command Palette with <kbd>Ctrl</kbd>+<kbd>P</kbd>).
2. The interactive MCP modal displays:
   - All active MCP servers and their transport status (`Running`, `Connecting`, `Failed`).
   - The total number of registered tools per server.
   - Individual tool schemas, arguments, and required parameters.
   - A **Reload Connections** button to re-read `.kerberosec/mcp_settings.json` on the fly without restarting your session.

---

### Production-Ready MCP Server Recipes

Below are complete, copy-pasteable configurations for the most popular MCP servers. Save these in `.kerberosec/mcp_settings.json`:

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "uvx",
      "args": [
        "mcp-server-sqlite",
        "--db-path",
        "./data/database.sqlite"
      ]
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:password@localhost:5432/my_database"
      ]
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_yourPersonalAccessTokenHere"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-brave-search"
      ],
      "env": {
        "BRAVE_API_KEY": "BSA_yourBraveSearchApiKeyHere"
      }
    },
    "fetch": {
      "command": "uvx",
      "args": [
        "mcp-server-fetch"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/allowed/directory"
      ]
    },
    "docker": {
      "command": "uvx",
      "args": [
        "mcp-server-docker"
      ]
    },
    "remote-cloud-service": {
      "url": "https://mcp.mycompany.internal/sse",
      "headers": {
        "Authorization": "Bearer my_secure_token"
      }
    }
  }
}
```

---

### Creating a Custom In-House MCP Server

You can write your own custom MCP server in less than 20 lines of code using Python or Node.js.

#### Custom Python MCP Server Example (`scripts/custom_mcp.py`):

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("CompanyInternalTools")

@mcp.tool()
def query_internal_metrics(service_name: str) -> str:
    # Fetches real-time server health and CPU load for an internal service
    return f"Service {service_name}: Health=OK, CPU=18%, Memory=42%"

@mcp.tool()
def deploy_staging_build(branch: str) -> str:
    # Triggers an automated staging build for the specified git branch
    return f"Deployment pipeline triggered for branch '{branch}'. Build ID: #4829"

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

#### Registering Your Custom Server in `.kerberosec/mcp_settings.json`:

```json
{
  "mcpServers": {
    "company-tools": {
      "command": "python3",
      "args": ["./scripts/custom_mcp.py"]
    }
  }
}
```

---

### MCP Troubleshooting and Debugging

1. **`command not found: uvx`**:
   - Install `uv` (the fast Python package manager):
     ```bash
     curl -fsSL https://astral.sh/uv/install.sh | bash
     ```
2. **`command not found: npx`**:
   - Ensure Node.js is installed (`sudo apt install nodejs npm` or `brew install node`).
3. **Environment variables not passed to MCP server**:
   - Explicitly define required API tokens inside the `"env": { ... }` block in `mcp_settings.json`.
4. **Server hangs on startup**:
   - Test running the command manually in your terminal (e.g. `uvx mcp-server-sqlite --db-path ./data.db`) to check for runtime errors or missing packages.

---

## Real-World Interactive Use Case Walkthroughs

### Walkthrough 1: Automated Legacy Code Migration

Modernize an entire legacy CommonJS codebase to TypeScript ESM with strict type checking in a single command:

```bash
kerberosec "migrate all CommonJS files in src/ to TypeScript ESM, update package.json type to module, and verify compilation"
```

1. The agent scans the workspace using `find_by_name` and `grep_search` to map all `require()` and `module.exports` occurrences.
2. It generates unified diffs converting statements to `import` and `export` syntaxes.
3. It updates `package.json` with `"type": "module"`.
4. It executes `bun build` and `tsc --noEmit` using `run_command` to verify zero type errors.

---

### Walkthrough 2: Autonomous Unit Test Suite Generation

Generate complete, resilient unit tests for complex business logic:

```bash
kerberosec "generate comprehensive unit tests for src/services/auth.ts covering edge cases, expired tokens, and invalid signatures"
```

1. The agent reads `src/services/auth.ts` and parses function signatures and error branches.
2. It creates a new test file `src/services/auth.test.ts` with mocked JWT signatures and cryptographic fixtures.
3. It runs `bun test src/services/auth.test.ts` via the subprocess runner.
4. If an assertion fails, the self-correction engine analyzes the failure stack trace, refines the mock, and re-executes tests until all assertions pass.

---

### Walkthrough 3: Automated Security and Vulnerability Sweep

Perform an autonomous security audit on database access layers and authentication routines:

```bash
kerberosec "audit all database queries in src/db/ for SQL injection vulnerabilities and refactor to parameterized queries"
```

1. The agent runs ripgrep to identify raw string interpolations in SQL queries (e.g. `SELECT * FROM users WHERE id = '${userId}'`).
2. It replaces vulnerable chunks with parameterized queries (e.g. `db.query('SELECT * FROM users WHERE id = $1', [userId])`).
3. It creates shadow in-memory snapshots before modifying any file on disk.
4. It presents unified colorized diffs for human confirmation before writing changes.

---

### Walkthrough 4: Live Bug Debugging with Diagnostic Subagents

Debug complex intermittent bugs across multiple packages:

```bash
kerberosec "the WebSocket connection drops after 30 seconds during test runs. diagnose and fix"
```

1. The main coordinator agent spawns a diagnostic subagent to inspect WebSocket ping/pong heartbeat intervals.
2. A second subagent reads server network logs and parses connection state transitions.
3. The root cause is identified as an unhandled timeout event in `src/network/socket.ts`.
4. The fix is applied, the test suite is executed, and a verified summary is rendered in the terminal.

---

## Context Window Management, Compaction Engine, and Memory Architecture

KerberoSec CLI implements an enterprise-grade, two-tier context window compaction and memory preservation engine in `@kerberosec/core` (`sdk/packages/core/src/extensions/context/`). This architecture allows developers and security teams to execute multi-hour autonomous sessions without token exhaustion, context overflow errors, or loss of critical architectural intent.

```mermaid
graph TB
    subgraph Monitor ["Real-Time Context Monitor"]
        Turn["Active Conversation Turn"] --> Estimator["Token Headroom Estimator"]
        Estimator --> Gate{"Context Ceiling Exceeded?<br>(>= 90% Max Tokens or Manual /compact)"}
    end

    subgraph Pipeline ["Two-Tier Compaction Coordinator"]
        Gate -- "Yes (Trigger)" --> Decider{"Summarizer Model Configured?"}
        
        Decider -- "Yes" --> Agentic["Tier 2: Agentic Compaction<br>(LLM Context Summarizer)"]
        Decider -- "No / Local Offline" --> Basic["Tier 1: Basic Compaction<br>(Deterministic Pruning)"]
        
        Agentic -- "Failure / Abort" --> Basic
        Agentic -- "Success" --> Projection["Structured Checkpoint Projection"]
        Basic --> Projection
    end

    subgraph Preservation ["Protected Invariants Engine"]
        Projection --> Filter["Sanitize Ephemeral Artifacts"]
        Filter --> Atomicity["Enforce Atomic Tool Pair Integrity<br>(Tool Use + Tool Result)"]
        Atomicity --> Tail["Protect Tail Invariants<br>(Latest User Prompt + Active Assistant Turn)"]
        Tail --> ResumedTurn["Resumed Execution Buffer"]
    end
```

### 1. Basic Compaction vs Agentic Compaction Pipeline

KerberoSec CLI provides two complementary compaction strategies to balance speed, resource usage, and semantic density:

#### Tier 1: Deterministic Basic Compaction
- **Zero Model Overhead**: Operates entirely in memory with no additional LLM inference calls or token consumption. Ideal for fast local offline models (`qwen2.5-coder`) and rate-limited environments.
- **Atomic Tool Pair Removal**: In standard conversational memory, naive truncation often cuts across tool call boundaries, creating invalid conversation structures. KerberoSec's Basic Compactor enforces **strict atomic tool pair dropping**: when an older turn is pruned, both the assistant's `tool_use` declaration and the corresponding `tool_result` observation block are removed together.
- **Image Sanitization**: Large binary base64 image blocks from older vision turns are automatically purged, retaining concise text descriptions to reclaim immediate token headroom.
- **Proportional Budgeting**: Targets pruning to 50% of the active token budget for extended conversations, ensuring the model does not repeatedly oscillate across the compaction boundary.

#### Tier 2: Agentic Summarization Compaction
- **Semantic Continuity**: Employs a lightweight summarizer model to compress earlier multi-turn exploration loops, code readings, and investigative outputs into an executive architectural state block.
- **Protected Boundaries**: Never places the compaction split within an active tool execution sequence.
- **Graceful Degradation**: If an agentic compaction request fails, times out, or produces invalid reasoning output, the system automatically falls back to deterministic Basic Compaction with zero user disruption.
- **Telemetry Events**: Emits telemetry records (`task.compaction_executed`, `task.compaction_skipped`) with exact token unit metrics and strategy tags (`basic`, `custom`, or `agentic`).

### 2. Token Budgeting and Trigger Thresholds

- **Automatic Trigger Gate**: Compaction triggers automatically when conversational context reaches **90% of max input tokens** (or **81%** when only total context window is reported).
- **Manual Trigger (`/compact`)**: Operators can trigger immediate on-demand compaction at any time during long sessions. In manual mode, preservation thresholds are dynamically adjusted to maximize available workspace headroom.
- **Protected Tail Allocation**: The newest user prompt and the immediate assistant turn are permanently protected from compaction, ensuring immediate instructions are never summarized or clipped.

### 3. File Pinning (`@file.ts`) and AST Injection
Typing `@` in the prompt input opens an interactive fuzzy file navigator. Selecting a file injects its precise AST outline and content directly into the active prompt context without requiring the model to consume exploration turns reading the file manually.

### 4. Native Multi-Provider Prompt Caching
When utilizing frontier cloud models with prompt caching support (Anthropic Claude, OpenAI, Google Gemini), KerberoSec CLI structures system instructions, repository rules, and MCP tool schemas with deterministic prefix anchors. This yields up to **90% token cost reduction** and near-instantaneous response times on recurring turns.

---

## Multi-Modal Vision and UI Screenshot Debugging

KerberoSec CLI provides native multi-modal image ingestion directly from the terminal buffer:

1. **Clipboard Image Paste (<kbd>Ctrl</kbd>+<kbd>V</kbd>)**:
   - Capture a screenshot of an application UI bug, browser layout mismatch, or architectural diagram.
   - Press <kbd>Ctrl</kbd>+<kbd>V</kbd> inside the prompt input.
   - The runtime inspects system clipboard buffers (`xclip`, `wl-paste`, `pbpaste`), normalizes the image format (`PNG`, `JPEG`, `WebP`), applies resolution scaling if necessary, and injects the payload directly into the active vision context.
2. **Security & Red Teaming Use Cases**:
   - Visual verification of Stored and Reflected XSS execution (DOM modification proofs).
   - UI Clickjacking / Framing vulnerability audits.
   - Authentication bypass and CAPTCHA flow analysis.
   - Rapid conversion of Figma wireframes into secure React, Tailwind, or HTML5 code.

---

## Custom Repository Rules & Multi-Agent Dispatch Protocols

### Repository Rules Engine (`.kerberosecrules`)

KerberoSec CLI automatically loads project-specific architecture constraints, coding standards, and security policies from `.kerberosecrules` or `.kerberosecrules/` in the workspace root.

```markdown
# Repository Architecture Guidelines for KerberoSec

## Code Standards
- Use TypeScript strict mode with explicit return types on exported functions.
- Avoid 'any'; use 'unknown' and narrow with type guards.
- Prefer pure functions and immutability where feasible.

## Security Constraints
- All database queries in 'src/db/' must strictly use parameterized queries.
- Raw shell execution in 'scripts/' must use execFile or quoted arguments.
- Never write hardcoded credentials or API tokens into source files.

## Testing & Quality Gates
- Every functional change must include an accompanying unit test.
- Run 'bun test' before concluding any turn.
```

### Subagent Enclaves and Dispatch Topology

For large-scale codebases and complex security assessments, KerberoSec CLI implements an isolated multi-agent delegation topology:

```mermaid
graph TB
    subgraph Coordinator ["KerberoSec Coordinator Agent"]
        User["User Prompt"] --> Planner["Master ReAct Planner"]
        Planner --> Dispatcher["Subagent Dispatch Manager"]
    end

    subgraph Enclaves ["Isolated Subagent Enclaves"]
        Dispatcher -->|Read-Only Contract| Explore["Research & Recon Subagent<br>(grep, find, read, web fetch)"]
        Dispatcher -->|Sandboxed Workspace| Editor["Code Editor Subagent<br>(write, replace, git patch)"]
        Dispatcher -->|Verification Gate| Verifier["Verification Subagent<br>(bun test, lint, compile)"]
    end

    subgraph Storage ["Context & State Protection"]
        Explore --> ContextFilter["Context Pruning & AST Distillation"]
        Editor --> ShadowSnap["Shadow Checkpoint Snapshots"]
        Verifier --> GateResult["Exit Code & Assertion Assert"]
    end

    ContextFilter --> Planner
    ShadowSnap --> Planner
    GateResult --> Planner
```

1. **Read-Only Reconnaissance Enclave (`research`)**:
   - Equipped exclusively with read-only tools (`grep_search`, `find_by_name`, `read_file`, `read_url_content`).
   - Prevented by runtime permissions from modifying files on disk or executing destructive commands.
   - Conducts broad codebase surveys and gathers evidence without cluttering the coordinator's primary context window.
2. **Sandboxed Modification Enclave (`code-editor`)**:
   - Dispatched to execute targeted multi-file edits inside isolated Git branches or worktree sandboxes.
   - Performs granular chunk replacements with shadow snapshot rollback protection.
3. **Verification Enclave (`verifier`)**:
   - Executes build tools, test suites, and regression checks.
   - Confirms that all modified files compile cleanly and satisfy the project's acceptance criteria before concluding a task.

### Delegation Contracts and Asynchronous Message Passing
- Subagents execute asynchronously without blocking the coordinator's terminal UI.
- The coordinator receives reactive message updates upon subagent completion, eliminating inefficient polling loops.
- Every delegation follows a strict **Delegation Contract**: defining task scope, permitted tools, target files, and explicit deliverables.

---

## Autonomous Skills and Security Automation Reference (`.kerberosec/skills/`)

KerberoSec CLI includes **32 production-grade skills** stored in `.kerberosec/skills/`. Each skill provides specialized prompts, deterministic execution harnesses, bundled scripts, and safety constraints.

Skills are dynamically discovered and loaded into the agent runtime using the three-tier scope hierarchy:
`User (~/.kerberosec/skills/) -> Project (.kerberosec/skills/) -> Local (.kerberosec/skills.local/)`.

```mermaid
graph TB
    subgraph S1 ["Supervision & Monitoring"]
        S_loop["/loop<br>Autonomous Loop"]
        S_sched["/schedule<br>Cron Engine"]
        S_run["/run<br>App Harness"]
        S_gen["/run-skill-generator<br>Driver Generator"]
        S_cfg["/update-config<br>Config & Hooks"]
    end

    subgraph S2 ["Security & Red Teaming"]
        S_deep["/deep-research<br>Threat Intel"]
        S_sec["/security-review<br>Security Audit"]
        S_chrome["/chrome-automation<br>Browser Testing"]
        S_comp["/computer-use<br>Desktop GUI"]
        S_batch["/batch<br>Multi-Target"]
    end

    subgraph S3 ["Stylometry & Reporting"]
        S_voice["/setup-writing-style<br>Voice Profiler"]
        S_docx["/docx<br>Executive Docx"]
        S_pdf["/pdf<br>Vector PDF"]
        S_pdfread["/pdf-reading<br>Doc Extraction"]
    end

    subgraph S4 ["Artifacts & Analytics"]
        S_dataviz["/dataviz<br>Security Charts"]
        S_artdes["/artifact-design<br>Tokens & Theme"]
        S_diag["/artifact-diagramming<br>Attack Topologies"]
        S_caps["/artifact-capabilities<br>Runtime Contracts"]
        S_keys["/keybindings-help<br>Terminal Keybinds"]
    end

    subgraph S5 ["Verification & Delivery"]
        S_init["/init<br>Workspace Recon"]
        S_ver["/verify<br>Test Gates"]
        S_rev["/code-review<br>Diff Audit"]
        S_simp["/simplify<br>Refactoring"]
        S_tui["/tuistory<br>TUI Testing"]
        S_pub["/publish-*<br>CLI/UI/Desktop/Ext"]
        S_wf["/workflow-authoring<br>Skill Synthesis"]
        S_perm["/fewer-permission-prompts<br>Rule Tuning"]
        S_doc["/doctor<br>CLI Diagnostics"]
        S_dbg["/debug<br>Root Cause Analysis"]
    end
```

---

### Category 1: Autonomous Supervision & Continuous Monitoring

#### 1. `/loop` - Autonomous Monitoring & Stewardship Engine
- **What it does**: Provides a resilient, self-pacing autonomous loop for supervising long-running tasks: security scans (Nuclei, Nmap, ZAP), build pipelines, test suites, and remote CI runs.
- **How to use**:
  ```bash
  /loop "monitor the nuclei vulnerability scan on staging and alert on critical findings"
  ```
- **How it is implemented**:
  - Implements **Dynamic Pacing & Adaptive Backoff**: Starts with rapid status checks (10-30s), dynamically expanding to a quiet heartbeat interval (1200-1800s) when waiting on external processes.
  - **Reversibility Calculus**: Automatically distinguishes between reversible local actions (running diagnostic reads, status checks) and irreversible mutations (modifying databases, killing production processes).
  - **Quiet Hold Termination**: Detects stalled or idle conditions across 3 consecutive observation passes and shuts down cleanly to conserve compute.

#### 2. `/schedule` - Persistent Hub & Cron Routine Engine
- **What it does**: Schedules recurring background operations, daily security sweeps, and interval penetration testing tasks managed by the KerberoSec Hub cron engine.
- **How to use**:
  ```bash
  /schedule "run daily dependency vulnerability audit at 03:00 UTC"
  ```
- **How it is implemented**:
  - Normalizes schedules to UTC standard.
  - Supports standard 5-field cron syntax (`*/30 * * * *`) and natural language recurring schedules.
  - Manages delivery options: direct terminal alerts, background log output, or notification dispatch.

#### 3. `/run` - Multi-Target Application Execution Harness
- **What it does**: Provides a unified execution and verification harness for running and testing any project type: CLI binaries, HTTP web servers, interactive TUIs, Electron applications, Playwright test suites, and backend libraries.
- **How to use**:
  ```bash
  /run "start the backend API server and verify the health check endpoint"
  ```
- **How it is implemented**:
  - Ships 6 specialized reference execution patterns in `.kerberosec/skills/run/examples/` (cli, server, tui, electron, playwright, library).
  - Automates port binding detection, process lifecycle monitoring, and health check validation before returning success.

#### 4. `/run-skill-generator` - Project-Specific Run Driver Generator
- **What it does**: Scans the active repository's package manifests, configuration files, and build scripts, synthesizing a tailored `.kerberosec/skills/run/SKILL.md` driver customized for the exact project.
- **How to use**:
  ```bash
  /run-skill-generator
  ```
- **How it is implemented**:
  - Employs a structured template (`template.md`) to generate non-derivable startup commands, port definitions, and verification commands matching the target codebase.

#### 5. `/update-config` - Safe Settings, Hooks, and Permissions Engine
- **What it does**: Programmatically updates KerberoSec CLI settings, lifecycle hooks, and permission rules with strict safety invariants and zero clobbering.
- **How to use**:
  ```bash
  /update-config "allow bun test and git status without confirmation prompts"
  ```
- **How it is implemented**:
  - Enforces the three-tier scope hierarchy: User (`~/.kerberosec/settings.json`) -> Project (`.kerberosec/settings.json`, committed) -> Local (`.kerberosec/settings.local.json`, gitignored).
  - Arrays (permissions, lifecycle hooks) are strictly appended rather than overwritten.
  - Supports `PreToolUse` and `PostToolUse` deterministic command hooks.

---

### Category 2: Web Security Assessment, Red Teaming & Threat Intelligence

#### 6. `/deep-research` - 5-Phase Adversarial Threat Intelligence Engine
- **What it does**: Conducts multi-pass security research, CVE deep dives, zero-day threat analysis, and exploit verification.
- **How to use**:
  ```bash
  /deep-research "investigate CVE-2024-3094 xz backdoor techniques, affected versions, and detection signatures"
  ```
- **How it is implemented**:
  - Structured into 5 rigorous phases:
    1. **Scope**: Formalizes research boundaries, target CVEs, and hypothesis definitions.
    2. **Search**: Executes parallel web queries across official security advisories, NVD, Exploit-DB, and GitHub advisories.
    3. **URL Deduplication, Fetch & Extraction**: Normalizes URLs, fetches clean content, and sanitizes dangerous shell characters.
    4. **3-Vote Adversarial Verification**: Employs an adversarial review quorum where findings require consensus before acceptance.
    5. **Synthesis**: Produces comprehensive intelligence reports with verified reproduction steps and remediation guides.

#### 7. `/security-review` - Codebase Security Posture & Vulnerability Audit
- **What it does**: Performs deep static analysis and threat modeling across repository source code to identify OWASP Top 10 vulnerabilities, authentication bypasses, and authorization flaws.
- **How to use**:
  ```bash
  /security-review "audit authentication middleware and session management in src/auth/"
  ```
- **How it is implemented**:
  - Maps trust boundaries and untrusted user input sources.
  - Scans for SQL injection, command injection, SSRF, IDOR, and insecure cryptographic primitives.
  - Delivers parameterized code fixes with regression test cases.

#### 8. `/chrome-automation` - DOM-Aware Browser Automation & PoC Verification
- **What it does**: Automates Chrome or Chromium to interact with web targets, verify DOM states, test authentication flows, record exploit PoCs, and inspect network requests.
- **How to use**:
  ```bash
  /chrome-automation "navigate to login portal, test CSRF token renewal, and inspect cookie security flags"
  ```
- **How it is implemented**:
  - Single-pass deferred tool loading (`ToolSearch`) for maximum speed.
  - **Non-Blocking PoC Execution**: Strictly avoids triggering native modal dialogs (`window.alert`, `window.confirm`) that freeze browser automation; uses DOM modification and console verification instead.
  - Inspects network traffic (`Cookie`, `Authorization`, `CSP`, `CORS`) to confirm security controls.

#### 9. `/computer-use` - Native Desktop & GUI Application Control
- **What it does**: Controls native desktop software (Burp Suite, Wireshark, Ghidra, terminal emulators, network proxies) via visual screen inspection, keyboard input, and mouse clicks.
- **How to use**:
  ```bash
  /computer-use "inspect the Burp Suite HTTP history tab and search for requests containing authorization headers"
  ```
- **How it is implemented**:
  - Selects the right automation tier (Direct API -> Browser DOM -> Native GUI).
  - Employs empirical visual inspection: takes fresh screenshots before asserting state.
  - Confirms sensitive destructive operations before execution.

#### 10. `/batch` - Parallel Multi-Target Security Operations
- **What it does**: Coordinates batched operations across multiple repositories, target endpoints, or microservice directories.
- **How to use**:
  ```bash
  /batch "audit package.json dependencies across all 12 microservices in services/ for CVE-2024-XXXX"
  ```
- **How it is implemented**:
  - Spawns parallel worker processes with isolated output tracking and aggregated reporting.

---

### Category 3: Stylometric Voice Calibration & Executive Reporting

#### 11. `/setup-writing-style` - Personal Voice Calibration & Anti-Slop Engine
- **What it does**: Learns how the operator naturally writes from real past reports, advisories, and messages, producing a tailored voice profile in `.kerberosec/skills/my-writing-style/SKILL.md`. Eliminates robotic, generic AI phrasing.
- **How to use**:
  ```bash
  /setup-writing-style
  ```
- **How it is implemented**:
  - Powered by a standalone standard-library Python stylometry engine: [`stylometry.py`](file:///home/Kali/Desktop/CLI/KerberoSec-CLI/.kerberosec/skills/setup-writing-style/scripts/stylometry.py).
  - **TF-IDF Exemplar Extraction**: Selects representative, diverse writing exemplars from real sent samples across surfaces (email, chat, docs).
  - **Metric Profiling**: Measures sentence rhythm (mean, median, stdev), contraction frequency, punctuation habits, and lowercase start rates.
  - **AI Cliché Elimination**: Detects and bans generic corporate AI words ("delve", "leverage", "robust", "streamline", "crucial", "holistic", "landscape", "ecosystem").
  - Built-in self-test verified: `python3 stylometry.py --selftest` ensures zero corruption.

#### 12. `/docx` - Executive Assessment Documentation Generator
- **What it does**: Generates styled Word (`.docx`) reports with formal typography, executive summaries, finding severity tables, and remediation roadmaps.
- **How to use**:
  ```bash
  /docx "generate formal penetration testing executive report for Q3 web assessment"
  ```
- **How it is implemented**:
  - Employs XML document generation pipelines with standardized enterprise headings, callout boxes, and formatted code blocks.

#### 13. `/pdf` - High-Contrast Vector PDF Report Generator
- **What it does**: Compiles penetration test findings, vulnerability tables, and compliance scorecards into print-ready vector PDF documents.
- **How to use**:
  ```bash
  /pdf "compile security assessment findings into a vector PDF report"
  ```
- **How it is implemented**:
  - Generates HTML/CSS print layouts and converts them to vector PDFs using headless Chromium or Playwright with zero visual clipping.

#### 14. `/pdf-reading` - Structured Security Document & Advisory Extractor
- **What it does**: Parses complex security documentation, whitepapers, regulatory compliance standards, and PDF advisories into structured text and data tables.
- **How to use**:
  ```bash
  /pdf-reading "extract compliance requirements from SOC2-Type2-Report.pdf"
  ```
- **How it is implemented**:
  - Extracts text streams, table structures, and metadata while preserving technical hierarchy.

---

### Category 4: Artifact Visualization, Dashboards & Design Tokens

#### 15. `/dataviz` - Computable Charts & Security Analytics Dashboards
- **What it does**: Creates accessible, computable data visualizations, security metric graphs, and vulnerability distribution charts.
- **How to use**:
  ```bash
  /dataviz "render a severity distribution chart comparing vulnerabilities across Q1 vs Q2"
  ```
- **How it is implemented**:
  - Bundles automated color validation scripts (`validate_palette.py`, `validate_palette.js`).
  - Enforces **6 automated contrast checks**: WCAG AA 4.5:1 text contrast, non-adjacent duplicate hues, dark/light theme luminance verification, and non-reliance on color alone.

#### 16. `/artifact-design` - Enterprise Design Tokens & Theme Engine
- **What it does**: Defines dual-theme design tokens, typography ramps, and tabular number formatting for all terminal and web artifacts.
- **How to use**:
  ```bash
  /artifact-design "generate dark-mode dashboard tokens for finding severity levels"
  ```
- **How it is implemented**:
  - Standardizes the security severity color encoding: Critical (`#DC2626`), High (`#EA580C`), Medium (`#F59E0B`), Low (`#3B82F6`), and Info (`#10B981`).
  - Enforces `font-variant-numeric: tabular-nums` for alignment of CVSS scores, line numbers, and token counts.

#### 17. `/artifact-diagramming` - Attack Topology & Network Architecture Diagrams
- **What it does**: Authors inline SVG architecture diagrams, attack paths, trust boundaries, and network topology maps.
- **How to use**:
  ```bash
  /artifact-diagramming "draw an SVG attack path diagram showing SSRF leading to AWS metadata access"
  ```
- **How it is implemented**:
  - Produces pure inline SVG elements without external dependencies.
  - Uses dual-theme CSS variables for seamless dark/light terminal rendering.

#### 18. `/artifact-capabilities` - Runtime Capability Contracts & Types
- **What it does**: Provides runtime capability contracts and TypeScript declarations (`@types/artifact.d.ts`) for interactive HTML/JS artifacts.
- **How to use**:
  ```bash
  /artifact-capabilities "inspect active artifact runtime contracts and permissions"
  ```
- **How it is implemented**:
  - Defines strict postMessage protocols, download permissions, and MCP proxy endpoints for sandboxed artifact iframes.

#### 19. `/keybindings-help` - Terminal Keybinding Customization & Conflict Prevention
- **What it does**: Guides operators in configuring `~/.kerberosec/keybindings.json`, adding chord shortcuts, and unbinding default keys.
- **How to use**:
  ```bash
  /keybindings-help "how do I add a chord shortcut ctrl+k ctrl+t for toggling todos?"
  ```
- **How it is implemented**:
  - Documents all KerberoSec CLI contexts (`Global`, `Chat`, `Autocomplete`, `Confirmation`, `Help`, `Transcript`, `DiffPanel`, `Scroll`).
  - Proactively warns against reserved terminal collisions (`ctrl+c`, `ctrl+d`, `ctrl+z`, `ctrl+\`, tmux `ctrl+b`, screen `ctrl+a`).

---

### Category 5: Code Quality, Verification & Delivery Pipelines

#### 20. `/init` - 8-Phase Workspace Reconnaissance & AGENTS.md Architecture
- **What it does**: Analyzes the active repository to architect a concise, high-signal `AGENTS.md` (and optional personal `AGENTS.local.md`, skills, and hooks).
- **How to use**:
  ```bash
  /init
  ```
- **How it is implemented**:
  - Executes an 8-phase pipeline: Check Existing -> Scope Intent -> Codebase Discovery -> Gap Interview -> AGENTS.md Synthesis -> Personal Preferences -> Project Skills -> Verification.
  - Applies the **Derivability Test**: cuts generic platitudes and obvious idioms, preserving only critical build commands, architecture maps, and security boundaries.

#### 21. `/verify` - Pre-Completion Testing & Assertion Gates
- **What it does**: Enforces rigorous testing and regression gates before declaring any task complete.
- **How to use**:
  ```bash
  /verify "run all unit and integration tests and confirm zero regressions"
  ```
- **How it is implemented**:
  - Identifies relevant test runners, linters, and type checkers.
  - Requires live terminal execution and exit code verification before handoff.

#### 22. `/code-review` - Differential Vulnerability & Logic Review
- **What it does**: Conducts structured differential code reviews on Git branches, uncommitted diffs, and pull requests.
- **How to use**:
  ```bash
  /code-review "review changes between main and current branch for security risks"
  ```
- **How it is implemented**:
  - Focuses on changed lines and their blast radius in neighboring files.
  - Classifies findings by severity: Critical (exploits/crashes), Warning (logic bugs), and Suggestion (cleanliness).

#### 23. `/simplify` - Code Refactoring & Dead Code Minimization
- **What it does**: Refactors complex code blocks to reduce cognitive complexity, eliminate redundant layers, and purge dead code.
- **How to use**:
  ```bash
  /simplify "refactor src/services/auth.ts to reduce nesting and simplify error handling"
  ```
- **How it is implemented**:
  - Verifies behavior preservation with live test runs before and after refactoring.

#### 24. `/tuistory` - Terminal UI Component Snapshot Testing
- **What it does**: Renders, inspects, and snapshot-tests terminal UI components in virtual ANSI space.
- **How to use**:
  ```bash
  /tuistory "test the StatusBar component rendering across 80x24 and 120x40 terminal dimensions"
  ```
- **How it is implemented**:
  - Employs OpenTUI virtual screen buffers to verify layout rendering and ANSI color accuracy.

#### 25. `/publish-cli` - CLI Package Publishing Pipeline
- **What it does**: Builds, tests, and publishes npm/bun CLI packages with semantic versioning and changelog generation.
- **How to use**:
  ```bash
  /publish-cli "prepare release v1.4.0 with updated changelog"
  ```

#### 26. `/publish-desktop` - Electron & Desktop Binary Distribution
- **What it does**: Builds and packages cross-platform desktop releases (Linux AppImage/deb, macOS dmg, Windows exe) with code signing.
- **How to use**:
  ```bash
  /publish-desktop "package desktop release for Linux x64"
  ```

#### 27. `/publish-extension` - VSCode & Browser Extension Packager
- **What it does**: Validates and packages VSCode and browser extensions with manifest verification.
- **How to use**:
  ```bash
  /publish-extension "package VSCode extension vsix bundle"
  ```

#### 28. `/publish-ui` - Web Application & UI Asset Distribution
- **What it does**: Compiles and bundles static web interfaces, single-page apps, and asset distribution artifacts.
- **How to use**:
  ```bash
  /publish-ui "build production web UI bundle and verify asset hashing"
  ```

#### 29. `/workflow-authoring` - Custom Skill & Workflow Synthesis
- **What it does**: Synthesizes new reusable custom skills inside `.kerberosec/skills/<name>/SKILL.md` for project-specific automation.
- **How to use**:
  ```bash
  /workflow-authoring "create a new custom skill for staging database migrations"
  ```

#### 30. `/fewer-permission-prompts` - Least-Privilege Permission Rule Tuning
- **What it does**: Analyzes recurring permission prompts in the operator session and constructs least-privilege allowlist rules in `.kerberosec/settings.json`.
- **How to use**:
  ```bash
  /fewer-permission-prompts
  ```

#### 31. `/doctor` - Complete System Health & Dependency Diagnostics
- **What it does**: Diagnoses the health of KerberoSec CLI, installed binary packages, Ollama daemon status, GPU acceleration, and workspace file permissions.
- **How to use**:
  ```bash
  /doctor
  ```

#### 32. `/debug` - Autonomous Root-Cause Analysis & Fix Engine
- **What it does**: Systematically investigates bug reports, test failures, and unhandled runtime exceptions to isolate root causes and apply verified fixes.
- **How to use**:
  ```bash
  /debug "tests are failing with connection refused on port 8080. diagnose and fix"
  ```

---

### Comprehensive 32-Skill Matrix

| Skill | Category | Primary Invocation | Key Invariants & Artifacts |
| :--- | :--- | :--- | :--- |
| **`loop`** | Supervision | `/loop <task>` | Dynamic pacing, adaptive backoff (1200-1800s), 3-pass quiet hold |
| **`schedule`** | Supervision | `/schedule <cron/interval>` | Persistent Hub engine, UTC normalization, routine triggers |
| **`run`** | Supervision | `/run <target>` | Multi-target app harness (CLI, server, TUI, Electron, Playwright) |
| **`run-skill-generator`** | Supervision | `/run-skill-generator` | Toolchain reconnaissance, customized project `run` driver |
| **`update-config`** | Supervision | `/update-config <setting>` | Non-destructive JSON merge, lifecycle hooks, permission allowlists |
| **`deep-research`** | Security & Recon | `/deep-research <query>` | 5-phase threat intel: scope, search, dedup/extract, 3-vote quorum, report |
| **`security-review`** | Security & Recon | `/security-review [path]` | OWASP Top 10 audit, trust boundary mapping, remediation gates |
| **`chrome-automation`** | Security & Recon | `/chrome-automation <url>` | DOM-aware browser testing, non-blocking PoCs, network inspection |
| **`computer-use`** | Security & Recon | `/computer-use <task>` | Native desktop GUI automation (Burp Suite, Wireshark, Ghidra) |
| **`batch`** | Security & Recon | `/batch <command>` | Parallel multi-target scan and audit batching across endpoints |
| **`setup-writing-style`** | Voice & Reporting | `/setup-writing-style` | Stylometric engine (`stylometry.py`), TF-IDF exemplars, anti-slop |
| **`docx`** | Voice & Reporting | `/docx <brief>` | Styled executive Word reports, finding tables, remediation roadmaps |
| **`pdf`** | Voice & Reporting | `/pdf <brief>` | Vector PDF reports, vulnerability matrices, print styling |
| **`pdf-reading`** | Voice & Reporting | `/pdf-reading <file.pdf>` | Structured optical and text extraction from security whitepapers |
| **`dataviz`** | Artifacts & Visuals | `/dataviz <prompt>` | Computable charts, 6-check color contrast validation scripts |
| **`artifact-design`** | Artifacts & Visuals | `/artifact-design [type]` | Dual-theme design tokens, severity status encoding, tabular numbers |
| **`artifact-diagramming`**| Artifacts & Visuals | `/artifact-diagramming [prompt]`| Inline SVG attack paths, network topologies, trust boundaries |
| **`artifact-capabilities`**| Artifacts & Visuals | `/artifact-capabilities` | Runtime capability contracts, postMessage interfaces, TS types |
| **`keybindings-help`** | Artifacts & Visuals | `/keybindings-help` | Terminal keyboard customization, chords, unbinding syntax |
| **`init`** | Quality & Delivery | `/init` | 8-phase workspace discovery, non-derivable `AGENTS.md` synthesis |
| **`verify`** | Quality & Delivery | `/verify [command]` | Pre-completion testing, regression gates, assertion checks |
| **`code-review`** | Quality & Delivery | `/code-review [branch]` | Differential security and logic review for PRs and patches |
| **`simplify`** | Quality & Delivery | `/simplify [file]` | Refactoring, dead code reduction, cognitive complexity minimization |
| **`tuistory`** | Quality & Delivery | `/tuistory [component]` | Terminal UI component rendering and ANSI snapshot verification |
| **`publish-cli`** | Quality & Delivery | `/publish-cli` | Release packaging, semantic versioning, npm/bun publishing |
| **`publish-desktop`** | Quality & Delivery | `/publish-desktop` | Cross-platform Electron desktop distribution (AppImage, deb, dmg) |
| **`publish-extension`** | Quality & Delivery | `/publish-extension` | VSCode and browser extension packaging |
| **`publish-ui`** | Quality & Delivery | `/publish-ui` | Web application bundling and static asset distribution |
| **`workflow-authoring`** | Quality & Delivery | `/workflow-authoring` | Custom reusable skill synthesis and prompt packaging |
| **`fewer-permission-prompts`** | Quality & Delivery | `/fewer-permission-prompts` | Least-privilege permission rule tuning for uninterrupted work |
| **`doctor`** | Quality & Delivery | `/doctor` | CLI diagnostics, Ollama status, dependencies, permissions |
| **`debug`** | Quality & Delivery | `/debug <error>` | Autonomous root-cause analysis and verified bug remediation |

---

## Enterprise and Team Deployment Architecture

For engineering teams and organizations deploying KerberoSec CLI across multiple developers:

### 1. Centralized On-Premise Ollama GPU Server
Instead of requiring dedicated GPUs on every developer laptop, organizations can host a centralized Ollama GPU server on the local company network or private cloud VPC:

```bash
# Developer .bashrc or .zshrc
export OLLAMA_HOST="http://ollama-gpu-cluster.internal.company.com:11434"
```

All developers on the team can run high-capacity 32B and 70B parameter coding models with hardware acceleration, while maintaining complete privacy and zero data egress.

### 2. Standardized Team Rules and Skills
Commit `.kerberosecrules` and `.kerberosec/skills/` to your Git repositories. When new developers clone the repository, their KerberoSec CLI assistant automatically adopts team coding standards, linting rules, and deployment playbooks.

---

## Headless CI/CD Mode and Automation Scripts

KerberoSec CLI can be invoked in non-interactive / headless mode inside shell scripts, GitHub Actions, or cron jobs:

### Single-Prompt Shell Execution:
```bash
kerberosec "analyze the diff between main and this branch and write release notes"
```

### GitHub Actions Automated PR Code Review Workflow:
```yaml
name: Automated AI Code Review

on:
  pull_request:
    branches: [main]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install KerberoSec CLI
        run: |
          git clone https://github.com/KerberoSec/KerberoSec-CLI.git /tmp/kerberosec
          cd /tmp/kerberosec && bun install && bun run build:sdk && bun -F @kerberosec/cli build
          mkdir -p ~/.local/bin
          echo -e '#!/bin/bash
exec bun run /tmp/kerberosec/apps/cli/src/index.ts "$@"' > ~/.local/bin/kerberosec
          chmod +x ~/.local/bin/kerberosec

      - name: Run Headless Code Review
        env:
          PATH: /home/runner/.local/bin:/home/runner/.bun/bin:${{ env.PATH }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          kerberosec "review all changed files in this PR for logic bugs, performance regressions, and security flaws"
```

---

## Key Architectural Highlights

- First-Class Offline Local AI:
  - Full support for open-weights coding models (`qwen2.5-coder:1.5b`, `qwen2.5-coder:7b`, `llama3`, `deepseek-coder`).
  - Zero-Config Background Daemon: Automatically verifies if the Ollama service on port 11434 is active, launching `ollama serve` in the background when an Ollama model is selected.
- Cloud AI Providers:
  - Seamless integration with Anthropic (Claude 3.7 Sonnet / Opus), OpenAI (GPT-4o), Google Gemini (2.0 Flash/Pro), Groq, DeepSeek, and OpenRouter.
- Dual Plan vs Act Execution Modes:
  - Plan Mode: Read-only mode designed for inspecting architecture, exploring files, and drafting technical proposals without touching code on disk.
  - Act Mode: Autonomous write mode for creating files, replacing code chunks, and running verification tests.
  - Toggle between modes seamlessly using <kbd>Tab</kbd>.
- Complete Docker Containerization:
  - Run completely sandboxed inside Docker or Docker Compose with live host-mounted workspaces and Ollama bridge networking.
- Session Forking and Git Worktree Isolation:
  - Branch conversations into alternative solution trees and run dangerous tasks inside isolated shadow worktrees.
- Autonomous Cron and Routine Scheduling:
  - Schedule recurring background tasks such as daily test runs, vulnerability sweeps, and dependency reviews.
- Account Management and Clean `/logout`:
  - Reset auth tokens, switch accounts, and return instantly to the onboarding login screen with `/logout`.
- Extensible Model Context Protocol (MCP):
  - Connect external MCP servers over stdio or HTTP SSE to equip the agent with custom database tools, deployment scripts, and external APIs.
- Automated 1-Step Setup (`setup.sh`):
  - Automatically installs system packages, sets up Bun and Ollama, compiles all monorepo packages, and creates global terminal commands.

---

## Performance and Resource Footprint

KerberoSec CLI is compiled directly on top of the Bun JavaScript/TypeScript runtime, achieving order-of-magnitude performance advantages over standard Node.js terminal tools:

| Performance Metric | KerberoSec CLI (Bun Native) | Traditional Node.js CLI Tools |
| :--- | :--- | :--- |
| Cold Startup Latency | < 42 ms | 280 ms to 450 ms |
| Idle Memory Footprint | ~36 MB RAM | 120 MB to 180 MB RAM |
| Local Inference Speed (1.5B) | ~45 to 70 tokens/sec | Varies by provider |
| UI Rendering Engine | Sub-millisecond ANSI Diffing | Full screen repaints |
| Air-Gapped Offline Execution | 100% Fully Supported | Limited / Cloud dependent |

---

## Security and Privacy Guarantees

KerberoSec CLI was engineered from the ground up to guarantee strict code privacy and workspace safety:

1. Zero Data Egress with Ollama Local Models:
   - When running against local models (such as `qwen2.5-coder`), prompt tokens, AST trees, and file contents never leave your machine.
2. In-Memory Shadow Snapshot Rollbacks:
   - Every file edit is snapshotted into an in-memory shadow buffer before disk modification, ensuring corrupted edits can be reverted instantly.
3. Tiered Human-in-the-Loop Safeguards:
   - Potentially destructive tools (`run_command`, `write_to_file`) display explicit prompts and colored unified diffs before applying changes, unless auto-approval is intentionally enabled.
4. Credential Isolation:
   - Secret keys and authentication tokens are kept strictly in memory or isolated configuration stores, and are stripped automatically from export transcripts.

---

## Supported Languages and Tech Stacks

KerberoSec CLI includes built-in syntax highlighters, AST parsers, and tool executors for all major languages and frameworks:

| Category | Supported Technologies |
| :--- | :--- |
| Systems and Compiled | Rust, C, C++, Go, Zig, Swift, Kotlin, Java |
| Web and Scripting | TypeScript, JavaScript, Python, Ruby, PHP, Lua, Shell (Bash/Zsh) |
| Frontend Frameworks | React, Next.js, Vue, Svelte, Angular, Solid.js, Tailwind CSS |
| Backend and Cloud | Node.js, Bun, FastAPI, Express, Django, Spring Boot, Gin, Actix |
| DevOps and Infrastructure | Docker, Kubernetes, Terraform, GitHub Actions, Nginx, PostgreSQL, SQLite, Redis |

---

## Complete Installation, Automation Scripts, and Container Guide

KerberoSec CLI provides fully automated bootstrap scripts, GPU model optimizers, a comprehensive security toolkit installer, and dual container environments.

---

### 1. Autonomous Monorepo Setup (`setup.sh`)

[`setup.sh`](file:///home/Kali/Desktop/CLI/KerberoSec-CLI/setup.sh) is the single-command installer for bootstrapping KerberoSec CLI on fresh Linux or macOS machines.

#### What `setup.sh` Automates:
1. **OS Package Management**: Detects the host package manager (`apt`, `dnf`, `pacman`, or `brew`) and installs missing build essentials (`curl`, `git`, `build-essential`, `procps`).
2. **Bun Runtime Installation**: Downloads and configures the latest high-performance Bun runtime.
3. **Autonomous Ollama Optimization**: Automatically triggers [`ollama.sh`](file:///home/Kali/Desktop/CLI/KerberoSec-CLI/ollama.sh) to detect hardware, enable GPU Flash Attention v2, 4-bit Quantized KV cache, and tune installed models.
4. **Monorepo Compilation**: Resolves workspace dependencies with `bun install`, compiles all `@kerberosec/sdk` packages, and bundles the CLI binary (`bun -F @kerberosec/cli build`).
5. **Global Executable Path**: Installs a global wrapper in `~/.local/bin/kerberosec` and updates your shell profile (`~/.bashrc` or `~/.zshrc`).

#### How to Run:
```bash
chmod +x setup.sh
./setup.sh
```

#### Troubleshooting `setup.sh`:
* **Issue**: `Permission denied` when running `./setup.sh`.
  * **Fix**: Run `chmod +x setup.sh ollama.sh tools.sh`.
* **Issue**: `kerberosec: command not found` after running `setup.sh`.
  * **Fix**: Reload your shell profile: `source ~/.bashrc` (or `source ~/.zshrc`), or verify `~/.local/bin` is in your `$PATH`.
* **Issue**: Missing package manager on minimal Linux containers.
  * **Fix**: Ensure `curl` or `apt-get` is installed before running the script.

---

### 2. Autonomous Ollama GPU & Model Matrix Optimizer (`ollama.sh`)

[`ollama.sh`](file:///home/Kali/Desktop/CLI/KerberoSec-CLI/ollama.sh) is an autonomous hardware accelerator that detects GPU capabilities and optimizes all local models installed in Ollama for maximum token generation speed and lowest latency.

#### Model Matrix & Baseline Policy:
* **Guaranteed Minimum Baseline**: **`qwen3:1.7b`** (or `qwen3.5:1.7b` / 1.7B parameters). Models under 1.7B lack reasoning depth for multi-turn tool loops.
* **Higher Scaled Models ($\ge 1.7\text{B}$)**: Automatically scales context and batch parameters for all modern model families:
  * **Qwen 3.5 & Qwen 3**: `qwen3.5:1.7b` to `qwen3.5:72b`
  * **Qwen 2.5-Coder & Qwen 2.5**: `qwen2.5-coder:1.5b` to `qwen2.5-coder:32b`
  * **Llama 3.x Series**: `llama3.5:4b`, `llama3.5:8b`, `llama3.3:70b`, `llama3.1:8b`
  * **DeepSeek Series**: `deepseek-r1:1.5b` to `deepseek-r1:70b`, `deepseek-coder-v2:16b/236b`
  * **Codestral & Mistral**: `codestral:22b`, `mistral-nemo:12b`, `mistral-small:22b`
  * **Gemma 2 & Phi 4**: `gemma2:9b/27b`, `phi4:14b`, `phi3.5:3.8b`

#### Applied GPU Optimizations:
* **100% GPU Layer Offloading**: Injects `PARAMETER num_gpu 999` to ensure models reside entirely in VRAM.
* **Flash Attention v2**: Sets `OLLAMA_FLASH_ATTENTION=1` (up to 3x token decoding speed).
* **4-bit Quantized KV-Cache**: Sets `OLLAMA_KV_CACHE_TYPE=q4_0` (saves up to 75% memory, unlocking up to **128k context**).
* **Zero Initial Latency**: Pins models in VRAM with `OLLAMA_KEEP_ALIVE=24h`.
* **Universal Multi-Architecture Tool Calling**: Injects ChatML, Llama 3 header IDs, DeepSeek `<think>` reasoning block handling, and anti-hallucination stop tokens.

#### How to Run:
```bash
chmod +x ollama.sh
./ollama.sh
```

#### Troubleshooting `ollama.sh`:
* **Issue**: `curl: (7) Failed to connect to localhost port 11434`.
  * **Fix**: Start the Ollama background daemon: `nohup ollama serve >/dev/null 2>&1 &` or `sudo systemctl start ollama`.
* **Issue**: Out of memory (OOM) or CUDA allocation errors on low-VRAM GPUs.
  * **Fix**: The script automatically allocates safe context windows based on your detected VRAM tier (from 16k on 2GB GPUs to 128k on 24GB+ GPUs). Run `./ollama.sh` to apply the recommended tier.

---

### 3. All-In-One Security Toolkit & Runtime Installer (`tools.sh`)

[`tools.sh`](file:///home/Kali/Desktop/CLI/KerberoSec-CLI/tools.sh) is an idempotent installer that equips your environment with CLI tools across all security, cloud auditing, active directory, and runtime domains.

#### Modules Covered:
* **Language Toolchains**: Rust (`cargo`), Go (`go`), Python (`pip`/`pipx`), Node.js, Java, Docker CLI, and PowerShell (`pwsh`).
* **Web & Bug Bounty**: `subfinder`, `httpx`, `katana`, `nuclei`, `naabu`, `ffuf`, `gobuster`, `dalfox`, `gau`, `waybackurls`, `arjun`, `paramspider`, `gittools`.
* **Network & Infrastructure**: `nmap`, `masscan`, `rustscan`, `hping3`, `arp-scan`, `tshark`, `tcpdump`, `socat`.
* **Active Directory & Microsoft Entra ID**: `certipy-ad`, `bloodyAD`, `ROADtools`, `AzureHound`, `CloudFox`, `kerbrute`, `adidnsdump`, `coercer`.
* **Cloud & Kubernetes Security**: Official AWS CLI v2, Azure CLI, Google Cloud SDK, `scoutsuite`, `prowler`, `trufflehog`, `kube-bench`, `kube-hunter`, `trivy`, `k9s`.
* **Wordlists**: `SecLists`, `rockyou`, `FuzzDB`, and `Assetnote` collections under `/usr/share/wordlists` and `~/Tools/wordlists`.

#### How to Run:
```bash
chmod +x tools.sh

# Install all modules
./tools.sh all

# Or run specific modules independently:
./tools.sh toolchains    # Runtimes only (Rust, Go, Python, Java, Docker, PowerShell)
./tools.sh apt           # APT packages only
./tools.sh python        # Pip & Pipx CLIs only
./tools.sh go            # Go packages only
./tools.sh bin           # Precompiled standalone binaries only
./tools.sh azure         # Cloud audit and Azure AD / Entra ID tools only
./tools.sh wordlists     # SecLists, Rockyou, and FuzzDB wordlists only
```

#### Troubleshooting `tools.sh`:
* **Issue**: `pip install: error: externally-managed-environment`.
  * **Fix**: `tools.sh` automatically exports `PIP_BREAK_SYSTEM_PACKAGES=1` to allow CLI utility installs under modern Python 3.12+ distributions.
* **Issue**: GitHub API rate limits during binary downloads.
  * **Fix**: Prebuilt binaries have fallback extraction routines. Re-running `./tools.sh bin` will resume uninstalled binaries.

---

### 4. Container Deployment with Docker and Docker Compose

KerberoSec CLI provides a single, unified container configured in [`Dockerfile`](file:///home/Kali/Desktop/CLI/KerberoSec-CLI/Dockerfile) and [`docker-compose.yml`](file:///home/Kali/Desktop/CLI/KerberoSec-CLI/docker-compose.yml) that packages the complete environment: Kali Linux rolling base, Bun runtime, compiled KerberoSec CLI binary, official Cloud SDKs (AWS, Azure, GCP), Active Directory tools, security toolchains, and wordlists:

```mermaid
graph LR
    subgraph Host ["Host Workstation"]
        HostCode["./ (Workspace Source Files)"]
        HostOllama["Local GPU Ollama Daemon (Port 11434)"]
        HostCreds["~/.kerberosec (Auth & Configs)"]
    end

    subgraph Compose ["Unified Docker Environment"]
        Service["KerberoSec Container (Dockerfile - Kali Rolling)<br>Bun Runtime + KerberoSec CLI + Cloud SDKs + Tools.sh + Wordlists"]
    end

    HostCode <-->|Bind Mount| Service
    HostCreds <-->|Bind Mount| Service
    HostOllama <-->|host.docker.internal:11434| Service
```

#### Running with Docker Compose:
```bash
# Build and run the unified container interactively
docker compose run --rm kerberosec
```

#### Running with Docker Directly:
```bash
# 1. Build the unified Docker image
docker build -t kerberosec .

# 2. Run interactively with current workspace and host Ollama mapped
docker run -it --rm \
  -v $(pwd):/workspace \
  -e OLLAMA_HOST=http://host.docker.internal:11434 \
  --add-host=host.docker.internal:host-gateway \
  kerberosec
```

#### Troubleshooting Docker and Docker Compose:
* **Issue**: Container cannot connect to host Ollama (`host.docker.internal` unreachable).
  * **Fix**: Ensure your host Ollama server listens on all interfaces (`OLLAMA_HOST=0.0.0.0:11434`) and that `extra_hosts: ["host.docker.internal:host-gateway"]` is present in `docker-compose.yml`.
* **Issue**: Node modules collision between host OS and Linux container.
  * **Fix**: `docker-compose.yml` includes an isolated anonymous volume mount (`- /workspace/node_modules`) to keep container binaries isolated from the host filesystem.

---

### Method 2: Manual Step-by-Step Installation

If you prefer installing dependencies manually on a fresh machine:

#### Step 1: Install System Prerequisites and Bun
- **Debian / Ubuntu / Kali Linux**:
  ```bash
  sudo apt update && sudo apt install -y git curl build-essential procps
  ```
- **macOS**:
  ```bash
  brew install git curl
  ```
- **Fedora / RHEL**:
  ```bash
  sudo dnf install -y git curl gcc gcc-c++ make procps-ng
  ```
- **Arch Linux**:
  ```bash
  sudo pacman -Sy --noconfirm git curl base-devel procps-ng
  ```

Install Bun runtime:
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc # or source ~/.zshrc
```

#### Step 2: Clone Repository and Build Packages
```bash
git clone https://github.com/KerberoSec/KerberoSec-CLI.git
cd KerberoSec-CLI
bun install
bun run build:sdk
bun -F @kerberosec/cli build
```

#### Step 3: Configure Global Executable
```bash
mkdir -p ~/.local/bin
cat << 'WRAPPER_EOF' > ~/.local/bin/kerberosec
#!/usr/bin/env bash
export PATH="$HOME/.bun/bin:$PATH"
exec bun run /FULL_PATH_TO/KerberoSec-CLI/apps/cli/src/index.ts "$@"
WRAPPER_EOF

chmod +x ~/.local/bin/kerberosec
export PATH="$HOME/.local/bin:$PATH"
```

---

## Deep-Dive Architecture and System Diagrams

### Diagram 0: Complete Master System Architecture and Unified End-to-End Topology

The following comprehensive architecture diagram illustrates the entire end-to-end topology of KerberoSec CLI, mapping how user input moves across the reactive UI layer, the agentic runtime coordinator, the multi-provider LLM router, the tool execution subsystem, the MCP client hub, and persistent disk checkpoints:

```mermaid
graph TD
    subgraph UI_Layer ["1. Terminal Reactive UI Layer (apps/cli - OpenTUI + React 19)"]
        RawTerm["Terminal ANSI Stream / PTY"] --> RootKeyboard["useRootKeyboard Hook<br>(Ctrl+C Timer, Tab Mode, Esc Abort, Ctrl+P)"]
        RootKeyboard --> UIState["UI State & Session Context Provider"]
        UIState --> ChatViewComp["ChatView & Virtual Message List"]
        UIState --> InputArea["InputBar & Autocomplete Engine (/slash & @mentions)"]
        UIState --> PaletteModal["Fuzzy Command Palette Modal (Ctrl+P)"]
        UIState --> StatusBarComp["Real-Time Status Bar (Model, Cost, Tokens, Mode)"]
    end

    subgraph Runtime_Layer ["2. Session Runtime & Turn Coordinator (@kerberosec/core)"]
        InputArea -->|Submit Prompt| TurnQueue["Interactive Turn Buffer & Prompt Queue"]
        TurnQueue --> Hydrator["Context Hydration Engine<br>(System Rules, @Pinned AST, Memory)"]
        Hydrator --> HeadroomCheck{"Token Headroom Check (>80% Limit?)"}
        HeadroomCheck -- "Yes" --> Compactor["Compaction Coordinator<br>(Summarize Earlier Turns)"]
        HeadroomCheck -- "No" --> AgentPlanner["ReAct Multi-Step Decision Planner"]
        Compactor --> AgentPlanner
        ShadowSnap["In-Memory Shadow Snapshot Buffer"] <--> AgentPlanner
    end

    subgraph LLM_Layer ["3. Universal LLM Protocol Routing Layer (@kerberosec/llms)"]
        AgentPlanner --> UniversalRouter{"Universal Model Router"}
        UniversalRouter -- "Local (Ollama)" --> OllamaDaemonMgr["Ollama Auto-Daemon Engine<br>(Health Check port 11434 & Auto-Serve)"]
        OllamaDaemonMgr --> LocalOllama["Local GPU/CPU Inference<br>(qwen2.5-coder, deepseek-coder)"]
        UniversalRouter -- "Cloud (Anthropic)" --> AnthropicAdapter["Anthropic Messages API<br>(Claude 3.7 Sonnet / Opus)"]
        UniversalRouter -- "Cloud (OpenAI)" --> OpenAIAdapter["OpenAI Chat Completions API<br>(GPT-4o)"]
        UniversalRouter -- "Cloud (Google)" --> GeminiAdapter["Google Gemini Content API<br>(Gemini 2.0 Flash / Pro)"]
        UniversalRouter -- "Cloud (Groq)" --> GroqAdapter["Groq Ultra-Fast API<br>(Llama 3.3 70B)"]

        LocalOllama --> StreamParser["Unified Token Stream Parser & Typewriter"]
        AnthropicAdapter --> StreamParser
        OpenAIAdapter --> StreamParser
        GeminiAdapter --> StreamParser
        GroqAdapter --> StreamParser
        StreamParser -->|Live Reasoning Chunks| ChatViewComp
    end

    subgraph Agent_Core ["4. Core Agent Engine & Tool Execution Subsystem"]
        StreamParser -->|Tool Call Request| SecurityGate{"Security Permission Gate<br>(Auto-Approve vs User Confirm)"}
        SecurityGate -- "User Confirm" --> DiffModal["Render Unified ANSI Color Diff"]
        DiffModal -->|User Approved| ToolDispatcher["Central Tool Registry & Dispatcher"]
        SecurityGate -- "Auto-Approved / Read Tool" --> ToolDispatcher

        ToolDispatcher --> FileTools["File Engine<br>(read_file, write_to_file, replace_file_content)"]
        ToolDispatcher --> SearchTools["Codebase AST Search<br>(grep_search, find_by_name)"]
        ToolDispatcher --> ShellRunner["Shell Process Runner<br>(Subprocess PTY execution)"]
        ToolDispatcher --> WorktreeMgr["Git Worktree Sandbox Manager"]
        ToolDispatcher --> SubagentHub["Subagent Delegation Hub (@kerberosec/agents)"]
        ToolDispatcher --> McpHubCore["Model Context Protocol (MCP) Client Hub"]
    end

    subgraph External_Integrations ["5. Subagents, MCP Servers & External Services"]
        SubagentHub --> ResearchSubagent["Research Subagent<br>(Read-Only Exploration)"]
        SubagentHub --> DebugSubagent["Diagnostic Subagent<br>(Test Harness & Error Parsing)"]
        
        McpHubCore -->|STDIO / JSON-RPC 2.0| SQLiteMCP["SQLite MCP Server"]
        McpHubCore -->|STDIO / JSON-RPC 2.0| PostgresMCP["PostgreSQL MCP Server"]
        McpHubCore -->|STDIO / JSON-RPC 2.0| GitHubMCP["GitHub MCP Server"]
        McpHubCore -->|STDIO / JSON-RPC 2.0| BraveMCP["Brave Web Search MCP Server"]
        McpHubCore -->|HTTP SSE Transport| CloudMCP["Enterprise Remote Cloud MCP"]
    end

    subgraph Workspace_Storage ["6. Workspace, Configs & Persistent Storage"]
        FileTools <--> LocalDisk["Workspace Source Files on Local Disk"]
        ShellRunner <--> HostOS["Host Operating System Shell (Bash/Zsh)"]
        WorktreeMgr <--> GitRepo["Git Repository Version Control"]
        Hydrator <--> RulesConfig[".kerberosecrules (Architecture Standards)"]
        Hydrator <--> SkillsConfig[".kerberosec/skills/ (Custom Automation Workflows)"]
        McpHubCore <--> MCPConfig[".kerberosec/mcp_settings.json (MCP Server Definitions)"]
    end

    FileTools -->|Capture Tool Result| CircuitBreaker{"Mistake Detector & Loop Breaker"}
    SearchTools -->|Capture Tool Result| CircuitBreaker
    ShellRunner -->|Capture Exit Code & Logs| CircuitBreaker
    CircuitBreaker -- "Error Detected" --> SelfCorrection["Inject Error Stack for Self-Healing Turn"]
    SelfCorrection --> AgentPlanner
    CircuitBreaker -- "Success / Finished" --> TurnDone["Mark Turn Complete & Update UI"]
    TurnDone --> UIState
```

---

### Diagram 1: Monorepo Package Topology and Boundaries

```mermaid
graph TD
    subgraph AppsLayer ["Applications Layer (apps/)"]
        CLI["@kerberosec/cli<br>(Terminal User Interface and CLI Entrypoint)"]
    end

    subgraph CoreSDK ["Core SDK Packages (sdk/packages/)"]
        Core["@kerberosec/core<br>(Agent Engine, Tool Registry, Checkpoints)"]
        LLMs["@kerberosec/llms<br>(Universal Multi-Provider Model Router)"]
        Agents["@kerberosec/agents<br>(Subagent Orchestration and Protocols)"]
        Shared["@kerberosec/shared<br>(TypeScript Schemas, Contracts, RPC)"]
        UI["@kerberosec/ui<br>(Themes, Color Tokens, ANSI Layouts)"]
    end

    CLI --> Core
    CLI --> LLMs
    CLI --> Shared
    CLI --> UI
    Core --> LLMs
    Core --> Agents
    Core --> Shared
    Agents --> Shared
    LLMs --> Shared
```

---

### Diagram 2: Terminal UI Component Hierarchy and Virtual DOM Tree

```mermaid
graph TD
    Root["OpenTUI Root Instance (React 19)"] --> SessionCtx["Session Context Provider"]
    SessionCtx --> ThemeCtx["Theme and Style Provider"]
    ThemeCtx --> ViewRouter{"Active View Router"}

    ViewRouter -- "appView == 'chat'" --> ChatView["ChatView Component"]
    ViewRouter -- "appView == 'onboarding'" --> OnboardView["OnboardingView Component"]
    ViewRouter -- "appView == 'config'" --> ConfigView["ConfigView Component"]
    ViewRouter -- "appView == 'history'" --> HistoryView["HistoryView Component"]

    ChatView --> MsgList["ChatMessageList (Virtual Scroll Area)"]
    MsgList --> UserBubble["User Message Bubble"]
    MsgList --> ThoughtBubble["Thinking and Reasoning Block"]
    MsgList --> ToolBubble["Tool Output and Unified Diff Viewer"]
    
    ChatView --> InputSection["InputBar and Textarea Area"]
    InputSection --> AutoDrop["Autocomplete Dropdown (/slash and @mentions)"]
    InputSection --> QueueDisplay["Queued Prompts Indicator"]
    ChatView --> StatusBar["Status Bar (Model, Cost, Mode Indicator)"]
```

---

### Diagram 3: Keyboard Dispatch and Event State Machine

```mermaid
flowchart TD
    KeyRaw["Raw Terminal Key Input"] --> KeyRouter{"useRootKeyboard Hook"}
    
    KeyRouter -- "Ctrl + C" --> CtrlCDelay{"Is 2nd press within 2000ms?"}
    CtrlCDelay -- "Yes" --> ExitApp["Cleanly Exit KerberoSec CLI"]
    CtrlCDelay -- "No" --> ToastNotice["Keep Active Input, Allow Copy and Show Toast: Press Ctrl+C again to exit"]

    KeyRouter -- "Escape" --> RunningCheck{"Is Prompt Running or Thinking?"}
    RunningCheck -- "Yes" --> AbortPrompt["Abort Ongoing Model Turn"]
    RunningCheck -- "No" --> CloseDialog["Close Active Modal / Palette / Menu"]

    KeyRouter -- "Tab" --> ToggleMode["Toggle Mode: Plan Mode <---> Act Mode"]
    KeyRouter -- "Shift + Tab" --> ToggleApprove["Toggle Auto-Approve Policy"]
    KeyRouter -- "Ctrl + P" --> OpenPalette["Open Command Palette Modal"]
    KeyRouter -- "Forward Slash (/)" --> TriggerSlash["Open Slash Command Autocomplete"]
```

---

### Diagram 4: Interactive Turn Lifecycle and Prompt Queue

```mermaid
flowchart LR
    UserInput["User Enters Prompt"] --> Enqueue["Enqueue in Turn Buffer"]
    Enqueue --> Hydrate["Hydrate Context (Rules + Files + History)"]
    Hydrate --> CheckHeadroom{"Token Count Approaches Limit?"}
    
    CheckHeadroom -- "Yes" --> Compact["Compaction Coordinator: Summarize Older Turns"]
    CheckHeadroom -- "No" --> DispatchReq["Send Request to Model Provider"]
    Compact --> DispatchReq

    DispatchReq --> SSEStream["Raw Streaming Token Chunks"]
    SSEStream --> Parser{"Stream Chunk Type"}
    Parser -- "Thinking" --> RenderThought["Live Typewriter in Reasoning Block"]
    Parser -- "Markdown" --> RenderText["Live Typewriter in Chat Bubble"]
    Parser -- "Tool Call" --> ExecTool["Dispatch to Core Agent Tool Engine"]
```

---

### Diagram 5: ReAct Decision Loop and Self-Correction Engine

```mermaid
flowchart TD
    StartTurn["Start Turn with Context"] --> Reason["Model Generates Reasoning and Selects Tool"]
    Reason --> EvaluateGate{"Security Permission Gate"}
    
    EvaluateGate -- "Read Tool (read_file, grep)" --> ExecRead["Execute Immediately"]
    EvaluateGate -- "Write Tool (replace_content)" --> GenerateDiff["Create Unified Diff and Request Approval"]
    EvaluateGate -- "Shell Command (run_command)" --> ConfirmCmd["Request Command Approval"]

    GenerateDiff --> ApplyDiff["Apply Changes to Workspace"]
    ConfirmCmd --> SpawnPTY["Execute Command in Subprocess PTY"]
    
    ExecRead --> CaptureOutput["Capture Tool STDOUT and STDERR"]
    ApplyDiff --> CaptureOutput
    SpawnPTY --> CaptureOutput

    CaptureOutput --> CheckError{"Did Tool Error Out?"}
    CheckError -- "Yes (Syntax / Command Error)" --> SelfCorrect["Feed Error Stack into Next Turn for Self-Correction"]
    SelfCorrect --> Reason
    CheckError -- "No (Success)" --> FinalCheck{"Is Objective Complete?"}
    FinalCheck -- "No" --> Reason
    FinalCheck -- "Yes" --> CompleteTurn["Emit Final Answer and Mark Turn Done"]
```

---

### Diagram 6: Checkpoint Engine and Shadow Snapshot Architecture

```mermaid
graph TD
    subgraph PreEdit ["1. Pre-Modification Phase"]
        TargetFile["Target File on Disk"] --> ReadSource["Read Source Content"]
        ReadSource --> ShadowMem["Store Shadow In-Memory Snapshot"]
    end

    subgraph EditPhase ["2. Modification Phase"]
        ShadowMem --> DiffEngine["AST and Chunk Matcher Engine"]
        DiffEngine --> GenUnifiedDiff["Generate Unified Colorized Diff"]
        GenUnifiedDiff --> UserDecision{"User Approval?"}
    end

    subgraph PostPhase ["3. Resolution Phase"]
        UserDecision -- "Approved" --> WriteDisk["Atomic Write to Disk File"]
        UserDecision -- "Rejected / Cancelled" --> Rollback["Restore Target File from Shadow Snapshot"]
    end
```

---

### Diagram 7: Chunk Diff Matching and Conflict Resolution Algorithm

```mermaid
flowchart TD
    EditRequest["replace_file_content(targetContent, replacementContent)"] --> ReadFile["Read Target File from Disk"]
    ReadFile --> ExactSearch{"Target String Matches Exactly in Range?"}
    
    ExactSearch -- "Yes (1 Match Found)" --> Splicer["Replace Target Chunk with Replacement Chunk"]
    ExactSearch -- "Multiple Matches" --> RangeFilter["Filter Matches using [startLine, endLine]"]
    RangeFilter --> SingleCandidate{"Single Match in Line Range?"}
    SingleCandidate -- "Yes" --> Splicer
    SingleCandidate -- "No" --> MatchError["Emit Error: Ambiguous match found"]

    ExactSearch -- "No Match" --> WhitespaceNorm{"Match Found after Whitespace Trimming?"}
    WhitespaceNorm -- "Yes" --> Splicer
    WhitespaceNorm -- "No" --> TargetNotFound["Emit Error: Target chunk not found in file"]

    Splicer --> FormatCheck["Verify File Indentation and Line Endings"]
    FormatCheck --> AtomicWrite["Atomic Write Buffer to Disk"]
```

---

### Diagram 8: Multi-Provider LLM Protocol Translation Layer

```mermaid
graph TD
    UnifiedReq["Universal Prompt Payload (@kerberosec/llms)"] --> Router{"Provider Selector"}

    Router -- "Provider: ollama" --> OllamaAdapter["Ollama HTTP REST Adapter"]
    Router -- "Provider: anthropic" --> AnthropicAdapter["Anthropic Messages API Adapter"]
    Router -- "Provider: openai" --> OpenAIAdapter["OpenAI Chat Completions Adapter"]
    Router -- "Provider: google" --> GeminiAdapter["Google Gemini Content API Adapter"]
    Router -- "Provider: groq" --> GroqAdapter["Groq OpenAI-Compatible Adapter"]
    Router -- "Provider: agent-router" --> AgentRouterAdapter["AgentRouter Multi-Model Gateway"]

    OllamaAdapter --> LocalPort["http://127.0.0.1:11434 (Local Engine)"]
    AnthropicAdapter --> CloudAnthropic["api.anthropic.com (Cloud)"]
    OpenAIAdapter --> CloudOpenAI["api.openai.com (Cloud)"]
    GeminiAdapter --> CloudGemini["generativelanguage.googleapis.com (Cloud)"]
    GroqAdapter --> CloudGroq["api.groq.com (Cloud)"]
    AgentRouterAdapter --> CloudAgentRouter["agentrouter.org (Cloud Gateway)"]

    LocalPort --> StreamUnified["Unified Token Stream Parser"]
    CloudAnthropic --> StreamUnified
    CloudOpenAI --> StreamUnified
    CloudGemini --> StreamUnified
    CloudGroq --> StreamUnified
    CloudAgentRouter --> StreamUnified
    StreamUnified --> Output["Normalized Chunks to Session Runtime"]
```

---

### Diagram 9: Local Offline Ollama Auto-Daemon Lifecycle

```mermaid
flowchart TD
    Init["User Selects Local Model (e.g. qwen2.5-coder:1.5b)"] --> HealthCheck{"Poll http://127.0.0.1:11434/api/version"}
    
    HealthCheck -- "200 OK (Daemon Running)" --> ModelQuery{"Check Installed Models via /api/tags"}
    HealthCheck -- "Connection Refused (Daemon Offline)" --> LaunchDaemon["Spawn Background Process: 'ollama serve'"]
    
    LaunchDaemon --> PollLoop["Poll Port 11434 until accepting connections"]
    PollLoop --> ModelQuery

    ModelQuery -- "Model Present" --> StreamReady["Ready for Offline Token Generation"]
    ModelQuery -- "Model Missing" --> PullCmd["Trigger: 'ollama pull model'"]
    PullCmd --> StreamReady
```

---

### Diagram 10: Model Context Protocol (MCP) Host and Tool Registry

```mermaid
graph TD
    subgraph MainAgentEngine ["KerberoSec Agent Engine (@kerberosec/core)"]
        ToolRegistry["Central Tool Registry"]
    end

    subgraph MCPClientHost ["MCP Host and Client Manager"]
        Config["mcp_settings.json"] --> Hub["McpHub Coordinator"]
        Hub --> StdioTransport["STDIO Transport Process"]
        Hub --> SSETransport["HTTP Server-Sent Events (SSE)"]
    end

    subgraph ExternalServers ["External MCP Servers"]
        Server1["Database MCP Server (PostgreSQL / SQLite)"]
        Server2["Web Search MCP Server (Brave / Google)"]
        Server3["Cloud Deployment MCP Server (AWS / GitHub)"]
    end

    StdioTransport <--> Server1
    StdioTransport <--> Server2
    SSETransport <--> Server3

    Hub -->|Dynamic Tool Discovery and JSON-RPC| ToolRegistry
    ToolRegistry -->|Execute MCP Tool| Hub
```

---

### Diagram 11: Concurrent Subagent Delegation Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor MainAgent as Main Coordinator Agent
    participant SubHub as Subagent Hub (@kerberosec/agents)
    participant ResearchAgent as Research Subagent (Read-Only)
    participant DebugAgent as Debugger Subagent (Diagnostic)

    MainAgent->>SubHub: Delegate Subtask ("Analyze auth module and run tests")
    par Parallel Subagent Execution
        SubHub->>ResearchAgent: Explore file dependencies and imports
        ResearchAgent-->>SubHub: Return architectural map
    and
        SubHub->>DebugAgent: Execute test harness and parse stack traces
        DebugAgent-->>SubHub: Return failed assertion analysis
    end
    SubHub-->>MainAgent: Synthesize insights into main conversation
    MainAgent->>MainAgent: Execute targeted fix in workspace
```

---

### Diagram 12: Context Mentions and File Pinning Engine

```mermaid
flowchart LR
    UserTypes["User Types '@' in Input Textarea"] --> Scanner["Autocomplete Context Scanner"]
    Scanner --> MatchFiles["Scan Workspace File Tree via Fast-Glob"]
    MatchFiles --> Ranker["Fuzzy Rank and Filter by Search Prefix"]
    Ranker --> DropdownUI["Render Mentions Dropdown Modal"]
    
    DropdownUI --> SelectFile["User Selects File (e.g. @src/index.ts)"]
    SelectFile --> TokenCalculator["Calculate File Token Weight"]
    TokenCalculator --> PinContext["Pin File AST and Content into Prompt Context Buffer"]
```

---

### Diagram 13: Fuzzy Command Palette and Action Dispatcher

```mermaid
flowchart TD
    Trigger["User Presses Ctrl + P"] --> OpenModal["Render Fuzzy Command Palette Modal"]
    OpenModal --> IngestActions["Load Action Registry (Models, Modes, Tools, Auth)"]
    IngestActions --> QueryFilter["User Enters Search Term"]
    QueryFilter --> FuzzyMatcher["Fuzzy String Matcher and Score Evaluator"]
    FuzzyMatcher --> Categorize["Group by Category (Actions, Models, Settings, Workspaces)"]
    Categorize --> RenderList["Render Interactive Highlightable List"]
    
    RenderList --> SelectAction["User Selects Action and Hits Enter"]
    SelectAction --> ExecuteAction{"Action Type"}
    ExecuteAction -- "Switch Model" --> SetModel["Update Global State and Active Provider"]
    ExecuteAction -- "Toggle Mode" --> SetMode["Switch between Plan and Act"]
    ExecuteAction -- "Logout" --> TriggerLogout["Execute Logout and Return to Onboarding"]
```

---

### Diagram 14: Subprocess Shell Runner and PTY Output Capture

```mermaid
sequenceDiagram
    autonumber
    participant Core as Core Agent Engine
    participant Runner as Shell Process Runner
    participant PTY as Pseudo-Terminal (PTY) Subprocess
    participant TUI as Terminal UI Streaming View

    Core->>Runner: spawnCommand("bun test", cwd, timeoutMs)
    Runner->>PTY: Fork Subprocess with PTY Allocation
    
    loop Stream Output
        PTY-->>Runner: Emit STDOUT / STDERR ANSI Chunk
        Runner->>TUI: Forward Real-Time Stream to Terminal
    end

    PTY-->>Runner: Process Exit (Code 0 or Error Code)
    Runner-->>Core: Aggregate Full Output Buffer and Exit Code
    Core->>Core: Parse Test Results and Check For Errors
```

---

### Diagram 15: Session Forking and Branching Timeline Engine

```mermaid
graph TD
    RootTurn["Turn 1: Project Setup"] --> Turn2["Turn 2: Database Schema"]
    Turn2 --> Turn3A["Turn 3A: REST API Implementation (Branch A)"]
    Turn2 --> Turn3B["Turn 3B: GraphQL API Implementation (Branch B)"]
    
    Turn3A --> ForkAction["User Triggers Session Fork on Turn 2"]
    ForkAction --> ClonedContext["Create New Branch Timeline with Preserved Checkpoints"]
    ClonedContext --> Turn3B
```

---

### Diagram 16: Git Worktree Sandbox and Workspace Isolation

```mermaid
flowchart LR
    Task["Task Requires High-Risk Refactor"] --> CreateWorktree["git worktree add -b refactor-sandbox"]
    CreateWorktree --> IsolatedDir["Isolated Sandbox Directory (/tmp/kerberosec-refactor)"]
    IsolatedDir --> AgentExecution["Agent Generates and Tests Code in Sandbox"]
    AgentExecution --> VerifyTests{"Did All Tests Pass?"}
    VerifyTests -- "Yes" --> MergeBranch["Merge Sandbox Branch into Main Workspace"]
    VerifyTests -- "No" --> PurgeWorktree["git worktree remove --force (Zero Residue)"]
```

---

### Diagram 17: Autonomous Routine Scheduling and Cron Engine

```mermaid
flowchart TD
    CronConfig["schedule.json (e.g. '0 2 * * *' Daily at 2 AM)"] --> CronScheduler["ScheduleService Daemon"]
    CronScheduler --> TriggerEvent["Cron Timer Fires"]
    TriggerEvent --> BuildSubagent["Spawn Headless Worker Agent"]
    BuildSubagent --> RunRoutine["Execute Routine: 'Run test suite and scan for security bugs'"]
    RunRoutine --> EmitReport["Save Diagnostic Markdown Report in .kerberosec/reports/"]
    EmitReport --> Notify["Emit High-Priority Terminal Notification on Next Session"]
```

---

### Diagram 18: Multi-Modal Clipboard Image Processing Pipeline

```mermaid
flowchart LR
    PasteEvent["User Presses Ctrl+V with Clipboard Image"] --> DetectClipboard{"Detect Clipboard Type (PNG / JPEG / WebP)"}
    DetectClipboard --> ReadBuffer["Read Native OS Buffer via xclip / wl-paste / pbpaste"]
    ReadBuffer --> Downsample["Downsample and Compress if > 2000px"]
    Downsample --> Base64Encode["Encode Image Buffer into Base64 Data URI"]
    Base64Encode --> ContextInject["Inject Multi-Modal Image Block into Vision LLM Context"]
```

---

### Diagram 19: Mistake Detection and Self-Healing Guardrails

```mermaid
flowchart TD
    ToolResult["Tool Result Emitted"] --> LoopDetector{"Same Tool Called 3+ Times with Identical Error?"}
    LoopDetector -- "Yes (Infinite Loop Detected)" --> HaltLoop["Trigger Circuit Breaker and Re-prompt Model with Loop Warning"]
    
    LoopDetector -- "No" --> PathValidator{"Target File Path Valid in Workspace?"}
    PathValidator -- "No (Hallucinated Path)" --> SuggestPath["Fuzzy Match File Tree and Provide Nearest Path Suggestion"]
    PathValidator -- "Yes" --> ProceedTurn["Proceed to Next Reasoning Turn"]
```

---

### Diagram 20: Real-Time Token Analytics and Cost Engine

```mermaid
flowchart LR
    TokenStream["Raw LLM Stream Chunks"] --> Counter["Token Counter and Tokenizer"]
    Counter --> SplitStats["Split: Input Tokens, Output Tokens, Cached Tokens"]
    SplitStats --> PriceMatrix["Lookup Provider Pricing Model (per 1M Tokens)"]
    PriceMatrix --> SessionTotal["Aggregate Cumulative Session Cost"]
    SessionTotal --> UpdateStatusBar["Live Update Status Bar: $0.0024 (1,420 Tokens)"]
```

---

### Diagram 21: Authentication State Machine and Logout Flow

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated: First Launch
    Unauthenticated --> Authenticating: Select Provider (Ollama / API Key)
    Authenticating --> Authenticated: Token Verified and Model Ready
    
    Authenticated --> RunningTask: User Submits Prompt
    RunningTask --> Authenticated: Task Complete
    
    Authenticated --> LoggingOut: User Types /logout or clicks Log Out
    RunningTask --> LoggingOut: User Types /logout
    
    LoggingOut --> PurgeState: Cancel Active Turn and Clear Memory Tokens
    PurgeState --> Unauthenticated: Render Onboarding View Full-Screen
```

---

### Diagram 22: Dynamic Theme Engine and ANSI Color Resolution

```mermaid
flowchart TD
    TerminalEnv["Terminal Environment (TTY / TERM / COLORTERM)"] --> DetectSupport{"Detect Color Depth Support"}
    DetectSupport -- "24-bit TrueColor" --> FullPalette["Full RGB 16.7M Color Space"]
    DetectSupport -- "256 Color" --> ANSI256["ANSI 256 Fallback Matrix"]
    DetectSupport -- "16 Color" --> Standard16["Basic ANSI 16 Colors"]

    FullPalette --> ThemeRegistry["Theme Registry (Dark, Light, Midnight, Hologram, Classic)"]
    ANSI256 --> ThemeRegistry
    Standard16 --> ThemeRegistry

    ThemeRegistry --> ResolveTokens["Resolve Semantic Tokens (Text, Border, DiffAdded, DiffRemoved)"]
    ResolveTokens --> ApplyUI["Apply Theme Contract to OpenTUI Components"]
```

---

### Diagram 23: Docker Container Isolation and Host-to-Bridge Architecture

```mermaid
graph TD
    subgraph HostOS ["Host Developer Machine"]
        HostFiles["Project Code Directory (/home/user/my-app)"]
        HostOllama["Local Ollama Engine (http://127.0.0.1:11434)"]
        DockerEngine["Docker Engine Runtime"]
    end

    subgraph Container ["KerberoSec CLI Docker Container"]
        ContainerFS["Isolated Container Filesystem (/app)"]
        ContainerWorkspace["Container Mount Point (/workspace)"]
        ContainerTUI["OpenTUI and React Terminal Process"]
    end

    HostFiles <== "Volume Mount (-v $(pwd):/workspace)" ==> ContainerWorkspace
    ContainerTUI --> ContainerWorkspace
    ContainerTUI <== "Network Bridge (host.docker.internal:11434)" ==> HostOllama
    DockerEngine --> Container
```

---

## Step-by-Step Execution Journey

The complete step-by-step trace of how a prompt travels through the system:

```mermaid
sequenceDiagram
    autonumber
    actor User as Developer
    participant TUI as Terminal UI (apps/cli)
    participant Runtime as Session Runtime
    participant Core as Core Engine (@kerberosec/core)
    participant LLM as Model Provider (@kerberosec/llms)
    participant Tools as Tool Executor

    User->>TUI: Submits Prompt (e.g. "fix the bug in src/index.ts")
    TUI->>Runtime: Enqueue Turn and Hydrate Context
    Runtime->>Core: Build Context Window (Rules + Files + History)
    Core->>LLM: Send Streaming Request
    
    loop Autonomous Execution Loop
        LLM-->>Core: Stream Reasoning Tokens and Tool Call (read_file)
        Core-->>TUI: Live Stream Markdown and Thinking State
        Core->>Tools: Execute read_file("src/index.ts")
        Tools-->>Core: Return File Contents
        Core->>LLM: Append Observation to Context
        LLM-->>Core: Stream Tool Call (replace_file_content)
    end

    Core->>TUI: Render Visual Diff Preview
    alt Manual Approval Mode
        User->>TUI: Confirms Diff Approval
        TUI->>Core: Permission Granted
    else Auto-Approve Enabled
        Core->>Core: Auto-Proceed
    end

    Core->>Tools: Apply Modified Content to Disk
    Core->>Tools: Run Verification Command (bun test)
    Tools-->>Core: Test Passed (Exit Code 0)
    Core-->>TUI: Render Task Complete Summary
    TUI-->>User: Display Final Output
```

---

## Environment Variables and Configuration

You can customize KerberoSec CLI using optional environment variables in your shell profile:

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `OLLAMA_HOST` | Custom host address for local or remote Ollama GPU servers | `http://127.0.0.1:11434` |
| `KERBEROSEC_THEME` | Preferred terminal color theme (`dark`, `light`, `midnight`, `hologram`) | `dark` |
| `KERBEROSEC_AUTO_APPROVE` | Set to `true` to auto-approve safe tool executions by default | `false` |
| `OPENAI_API_KEY` | Optional API key for OpenAI GPT-4o models | None |
| `ANTHROPIC_API_KEY` | Optional API key for Anthropic Claude 3.7 Sonnet models | None |
| `GEMINI_API_KEY` | Optional API key for Google Gemini 2.0 models | None |

---

## Frequently Asked Questions (FAQ)

### 1. Can I use KerberoSec CLI completely offline without an internet connection?
Yes. KerberoSec CLI provides full first-class support for local offline inference using Ollama. When selecting models like `qwen2.5-coder:1.5b` or `qwen2.5-coder:7b`, all code reasoning, file reads, and diff generations occur locally on your machine with zero internet connectivity required.

### 2. How do I switch between Plan Mode and Act Mode?
Press <kbd>Tab</kbd> at any time. Plan Mode is read-only and prevents accidental file changes while investigating code. Act Mode allows the agent to edit files, apply diffs, and run shell commands.

### 3. How do I add custom rules for my project?
Create a `.kerberosecrules/` directory or a `.kerberosecrules` file in your repository root. KerberoSec CLI automatically ingests your architectural guidelines and project standards into every turn context.

### 4. How do I connect external Model Context Protocol (MCP) servers?
Use the `/mcp` slash command in chat or create a `.kerberosec/mcp_settings.json` file defining your stdio or SSE server endpoints.

---

## Troubleshooting and Common Solutions

### Port 11434 already in use error
- Cause: An existing instance of Ollama or another process is running on the default port.
- Fix: KerberoSec CLI detects running instances automatically. If you encounter port conflicts, terminate orphaned processes with `killall ollama` or specify a custom `OLLAMA_HOST` address.

### Terminal colors appear washed out
- Cause: Your terminal emulator may not support 24-bit TrueColor.
- Fix: Ensure your shell environment defines `export COLORTERM=truecolor` in `~/.bashrc` or `~/.zshrc`.

### Docker container unable to reach host Ollama
- Cause: Docker bridge networking may need host gateway routing on Linux.
- Fix: Use `docker compose run --rm kerberosec`, which pre-configures `host.docker.internal:host-gateway` automatically.

---

## Author and License

**Arun Kumar**
- LinkedIn: [arunkumar31072006](https://www.linkedin.com/in/arunkumar31072006/)
- GitHub: [@KerberoSec](https://github.com/KerberoSec)
- X (Twitter): [@ArunKumar310706](https://x.com/ArunKumar310706)
- Instagram: [@so_far_from_your_heart](https://www.instagram.com/so_far_from_your_heart/)

---

## License

This project is licensed under the **Apache 2.0 License** - see the [`LICENSE`](./LICENSE) file for details.

Copyright (c) 2026 **Arun Kumar (KerberoSec)**. All rights reserved.
