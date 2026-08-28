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
4. [Hardware Guide: Best Local Ollama Models per GPU and VRAM](#hardware-guide-best-local-ollama-models-per-gpu-and-vram)
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
9. [Context Window Management and Token Optimization](#context-window-management-and-token-optimization)
10. [Multi-Modal Vision and UI Screenshot Debugging](#multi-modal-vision-and-ui-screenshot-debugging)
11. [Custom Repository Rules Engine (`.kerberosecrules`)](#custom-repository-rules-engine-kerberosecrules)
12. [Custom Skills and Workflow Automation (`.kerberosec/skills/`)](#custom-skills-and-workflow-automation-kerberosecskills)
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

## Hardware Guide: Best Local Ollama Models per GPU and VRAM

KerberoSec CLI is optimized to run on all hardware configurations ranging from thin-and-light laptop CPUs to dedicated multi-GPU workstations. The table below outlines the optimal local Ollama coding models for your specific graphics hardware:

| Hardware Tier & VRAM | Target GPUs & Laptop Models | Recommended Ollama Model | Download Command | Performance & Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **CPU Only (4GB - 8GB RAM)** | Intel Core i3/i5/i7, AMD Ryzen 3/5/7, Apple M1/M2 (8GB RAM), Dell XPS, ThinkPad | `qwen2.5-coder:1.5b`<br>`qwen2.5-coder:0.5b` | `ollama pull qwen2.5-coder:1.5b` | Fast token generation on CPU (~25-45 t/s), extremely low RAM usage (~1.2GB). Ideal for laptops without discrete GPUs. |
| **4GB VRAM** | NVIDIA RTX 3050 (4GB), GTX 1650, GTX 1650 Ti, AMD Radeon RX 6500M / RX 5500M | `qwen2.5-coder:1.5b`<br>`deepseek-coder:1.3b` | `ollama pull qwen2.5-coder:1.5b` | Fits 100% inside 4GB GPU VRAM. Sub-second response times, 50-80 tokens/sec. Excellent for single-file edits and scripts. |
| **6GB VRAM** | NVIDIA RTX 3060 Laptop (6GB), RTX 3050 (6GB), RTX 2060, AMD Radeon RX 6600M (6GB) | `qwen2.5-coder:7b` (Q4_K_M)<br>`starcoder2:7b` | `ollama pull qwen2.5-coder:7b` | **Best value tier**. Runs complete 7B parameter reasoning directly in VRAM (~4.4GB VRAM footprint). High coding accuracy and fast execution (~35-50 t/s). |
| **8GB VRAM** | NVIDIA RTX 4060 (8GB), RTX 3070 (8GB), RTX 4070 Laptop (8GB), AMD Radeon RX 7600 / RX 6600 (8GB), Apple M2/M3 (16GB-18GB) | `qwen2.5-coder:7b`<br>`deepseek-coder:6.7b`<br>`codellama:7b-instruct` | `ollama pull qwen2.5-coder:7b` | Full 8K-16K context window acceleration without CPU spillover. Blazing fast code generation (45-65 t/s). Handles multi-file refactoring with ease. |
| **12GB - 16GB VRAM** | NVIDIA RTX 3060 (12GB Desktop), RTX 4070 Ti, RTX 4080 (16GB), AMD Radeon RX 6700 XT / 7800 XT (16GB), Apple M2/M3/M4 Pro (18GB-36GB) | `qwen2.5-coder:14b`<br>`codestral:22b` (Q4_K_M)<br>`deepseek-coder-v2:16b` | `ollama pull qwen2.5-coder:14b` | Advanced multi-file reasoning, complex algorithmic problem solving, and architecture design (~30-55 t/s). |
| **24GB+ VRAM** | NVIDIA RTX 3090 (24GB), RTX 4090 (24GB), AMD Radeon RX 7900 XTX (24GB), Apple M2/M3/M4 Max (64GB-128GB Unified Memory) | `qwen2.5-coder:32b`<br>`codestral:22b` (FP16)<br>`deepseek-coder-v2:236b` (Q4) | `ollama pull qwen2.5-coder:32b` | Flagship open-weights coding capability matching GPT-4o intelligence level, running 100% locally and completely offline. |

---

## Comprehensive Slash Commands Reference

KerberoSec CLI provides a complete suite of built-in slash commands that can be triggered directly in the chat input or through the autocomplete menu:

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
| **`/fork`** | Session | Create a named session branch | Creates an isolated branch of the current conversation history at the active turn, allowing alternative implementation experiments without losing prior state. |
| **`/undo`** | Rollback | Restore files to previous checkpoint | Restores workspace files to the exact in-memory shadow snapshot taken before the last file modification turn. |
| **`/clear`** | Session | Start a clean new session | Clears the active chat buffer and initializes a fresh conversation state while preserving workspace index caches. |
| **`/history`** | History | View session history and transcripts | Opens the session history browser to search, inspect, or resume previous coding conversations. |
| **`/help`** | Documentation | Display interactive help dialog | Renders a full help modal with keybindings, slash commands reference, and usage tips. |
| **`/quit`** | Lifecycle | Exit KerberoSec CLI | Terminates active background workers and cleanly exits the CLI back to your terminal prompt. |

---

## Keyboard Shortcuts Reference

| Shortcut | Action | Scope and Behavior |
| :--- | :--- | :--- |
| **<kbd>Tab</kbd>** | Toggle Plan vs Act Mode | Seamlessly toggles the agent between **Plan Mode** (read-only architectural planning) and **Act Mode** (autonomous write and execution). |
| **<kbd>Shift</kbd>+<kbd>Tab</kbd>** | Toggle Auto-Approve Policy | Switches between manual human-in-the-loop approval and automatic tool execution for fast, uninterrupted workflows. |
| **<kbd>Ctrl</kbd>+<kbd>P</kbd>** | Open Command Palette | Launches the fuzzy-searchable Command Palette modal to quickly search actions, switch models, or configure settings. |
| **<kbd>Ctrl</kbd>+<kbd>C</kbd> (1x)** | Copy Text / Preserve Input | Preserves terminal clipboard copying without halting active model thinking streams or clearing typed text. Shows notification: *Press Ctrl+C again to exit*. |
| **<kbd>Ctrl</kbd>+<kbd>C</kbd> (2x)** | Double-Tap Clean Exit | Pressing <kbd>Ctrl</kbd>+<kbd>C</kbd> twice within 2000ms triggers immediate clean exit from the CLI. |
| **<kbd>Esc</kbd>** | Cancel / Abort Turn | Aborts active LLM stream generation, cancels long-running background tool processes, or closes open modals. |
| **<kbd>Up</kbd> / <kbd>Down</kbd>** | Input History Navigation | Cycles through previously submitted prompt history in the input textarea. |
| **<kbd>Ctrl</kbd>+<kbd>V</kbd>** | Multi-Modal Image Paste | Pastes image from system clipboard directly into the prompt context buffer for vision-capable models. |

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

## Context Window Management and Token Optimization

KerberoSec CLI implements intelligent context window optimization to reduce token overhead, minimize latency, and prevent context exhaustion:

### 1. File Pinning (`@file.ts`)
Typing `@` in the prompt textarea opens an interactive fuzzy file scanner. Selecting a file injects only the essential AST outline and file content into the active turn buffer, avoiding unnecessary workspace bloat.

### 2. Autonomous Context Compaction (`/compact`)
When conversation history approaches 80% of the active model context headroom:
- The Compaction Coordinator summarizes earlier turns into structured checkpoint summaries.
- Ephemeral tool outputs and test logs are compressed into single-line status records.
- Critical architectural decisions and unresolved goals are preserved intact.

### 3. Native Prompt Caching
When using cloud models with prompt caching support (Anthropic Claude, OpenAI GPT-4o), KerberoSec CLI structures context blocks with fixed prefix anchors, reducing token input costs by up to 90% and accelerating turn responses.

---

## Multi-Modal Vision and UI Screenshot Debugging

KerberoSec CLI supports multi-modal vision inputs directly inside the terminal:

1. **Clipboard Image Paste (<kbd>Ctrl</kbd>+<kbd>V</kbd>)**:
   - Take a screenshot of a UI bug, design mockup, or database schema diagram.
   - Press <kbd>Ctrl</kbd>+<kbd>V</kbd> inside the prompt input.
   - KerberoSec CLI detects the image format (`PNG`, `JPEG`, `WebP`), reads the buffer via native clipboard utilities (`xclip`, `wl-paste`, `pbpaste`), downsamples the image if necessary, and injects the base64 data URI into the vision model payload.
2. **Use Cases**:
   - Converting UI mockups into Tailwind CSS and React components.
   - Debugging broken layout alignments from browser screenshots.
   - Analyzing architectural diagram images and translating them into code schemas.

---

## Custom Repository Rules Engine (`.kerberosecrules`)

KerberoSec CLI automatically loads project-specific architecture rules, coding standards, and security constraints from a `.kerberosecrules` file or `.kerberosecrules/` directory located in your repository root.

### Example `.kerberosecrules` Configuration

```markdown
# Repository Guidelines for KerberoSec

## Coding Standards
- Use TypeScript strict mode with explicit return types on exported functions.
- Do not use 'any'; use 'unknown' and narrow with type guards.
- Prefer immutability and pure functions where possible.

## Testing Rules
- Every new function in 'src/utils/' must have an accompanying '.test.ts' file.
- Run tests using 'bun test' before concluding any turn.

## Architecture Boundaries
- The UI layer ('src/tui/') must never import directly from database packages.
- Always use the Checkpoint Engine before modifying configuration files.
```

---

## Custom Skills and Workflow Automation (`.kerberosec/skills/`)

Skills extend KerberoSec CLI with domain-specific workflows, custom prompts, and structured tool procedures. Each skill is stored in `.kerberosec/skills/<skill-name>/SKILL.md` and can be invoked using `/skills` or typing `/<skill-name>`.

### Example Skill: `security-audit/SKILL.md`

```markdown
---
name: security-audit
description: Scans the codebase for hardcoded secrets, SQL injection, and insecure dependencies
---

When invoked, perform the following security audit steps:
1. Scan all files in 'src/' for hardcoded API keys, JWT secrets, or passwords using ripgrep.
2. Verify all database queries use parameterized SQL inputs.
3. Check dependencies in 'package.json' for deprecated or vulnerable packages.
4. Generate a concise diagnostic markdown table with recommendations.
```

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

## Complete Installation and Setup Guide

### Method 1: Automated 1-Step Setup (Recommended)

If you have cloned or copied the repository to any fresh machine (Linux, macOS, or Windows WSL2), run the automated setup script:

```bash
git clone https://github.com/KerberoSec/KerberoSec-CLI.git
cd KerberoSec-CLI

chmod +x setup.sh
./setup.sh
```

The script automatically performs all configuration steps:
1. Detects your operating system (Debian, Ubuntu, Kali, Fedora, Arch, macOS).
2. Installs missing build packages (`git`, `curl`, `build-essential`).
3. Installs and configures the **Bun** runtime.
4. (Optional) Prompts to install **Ollama** and pulls the recommended coding model (`qwen2.5-coder:1.5b`).
5. Installs monorepo dependencies and compiles both the SDK and CLI bundles.
6. Configures the global `kerberosec` executable wrapper in `~/.local/bin` and exports PATH to your shell profile.

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

Verify Bun:
```bash
bun --version
```

#### Step 2: Clone Repository and Install Dependencies

```bash
git clone https://github.com/KerberoSec/KerberoSec-CLI.git
cd KerberoSec-CLI
bun install
```

#### Step 3: Compile SDK and CLI Bundle

```bash
# Build core SDK packages
bun run build:sdk

# Build the CLI production bundle
bun -F @kerberosec/cli build
```

#### Step 4: Configure Global Executable

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
*(Replace `/FULL_PATH_TO/KerberoSec-CLI` with your actual repository path).*

#### Step 5: (Optional) Set Up Local Models with Ollama

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull recommended model
ollama pull qwen2.5-coder:1.5b
```

---

### Method 3: Docker and Docker Compose Container Run

If you prefer running KerberoSec CLI inside an isolated container:

#### Option A: Using Docker Compose
```bash
# Run interactively with live workspace mounting
docker compose run --rm kerberosec
```

#### Option B: Using Docker Directly
```bash
# 1. Build the Docker image
docker build -t kerberosec-cli .

# 2. Run interactively with current directory mounted
docker run -it --rm   -v $(pwd):/workspace   -e OLLAMA_HOST=http://host.docker.internal:11434   kerberosec-cli
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

    OllamaAdapter --> LocalPort["http://127.0.0.1:11434 (Local Engine)"]
    AnthropicAdapter --> CloudAnthropic["api.anthropic.com (Cloud)"]
    OpenAIAdapter --> CloudOpenAI["api.openai.com (Cloud)"]
    GeminiAdapter --> CloudGemini["generativelanguage.googleapis.com (Cloud)"]
    GroqAdapter --> CloudGroq["api.groq.com (Cloud)"]

    LocalPort --> StreamUnified["Unified Token Stream Parser"]
    CloudAnthropic --> StreamUnified
    CloudOpenAI --> StreamUnified
    CloudGemini --> StreamUnified
    CloudGroq --> StreamUnified
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
