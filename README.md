<p align="center">
  <img src="assets/icons/icon.png" width="110" alt="KerberoSec Logo" />
</p>

<h1 align="center">KerberoSec CLI</h1>

<p align="center">
  <strong>Next-Generation Autonomous Agentic AI Coding Assistant for your Terminal</strong>
  <br>
  Architected, developed, and maintained by <a href="https://github.com/KerberoSec"><strong>Arun Kumar</strong></a>
</p>

<p align="center">
  <a href="https://github.com/KerberoSec/KerberoSec-CLI/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License"></a>
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/Runtime-Bun-f472b6.svg" alt="Bun"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/Language-TypeScript-3178c6.svg" alt="TypeScript"></a>
  <a href="https://ollama.com"><img src="https://img.shields.io/badge/Local_AI-Ollama_Ready-black.svg" alt="Ollama"></a>
</p>

<div align="center">
  <table>
    <tbody>
      <tr>
        <td align="center"><a href="https://www.linkedin.com/in/arunkumar31072006/" target="_blank"><strong>💼 LinkedIn</strong></a></td>
        <td align="center"><a href="https://github.com/KerberoSec" target="_blank"><strong>🐙 GitHub</strong></a></td>
        <td align="center"><a href="https://x.com/ArunKumar310706" target="_blank"><strong>🐦 X (Twitter)</strong></a></td>
        <td align="center"><a href="https://www.instagram.com/so_far_from_your_heart/" target="_blank"><strong>📷 Instagram</strong></a></td>
        <td align="center"><a href="./Setup.md"><strong>📖 Setup Guide</strong></a></td>
      </tr>
    </tbody>
  </table>
</div>

---

## 🌟 Table of Contents
1. [Overview](#-overview)
2. [Key Highlights](#-key-highlights)
3. [Architecture and System Design](#-architecture-and-system-design)
   - [Monorepo Package Topology](#monorepo-package-topology)
   - [Diagram 1: System Layer Architecture](#diagram-1-system-layer-architecture)
   - [Diagram 2: Terminal UI and Keyboard Event Routing](#diagram-2-terminal-ui-and-keyboard-event-routing)
   - [Diagram 3: Interactive Session Runtime and Compaction Loop](#diagram-3-interactive-session-runtime-and-compaction-loop)
   - [Diagram 4: Core Agent Engine and Checkpoint Security Gate](#diagram-4-core-agent-engine-and-checkpoint-security-gate)
   - [Diagram 5: Offline Ollama Auto-Daemon Lifecycle](#diagram-5-offline-ollama-auto-daemon-lifecycle)
   - [Diagram 6: MCP Integration and Subagent Delegation](#diagram-6-mcp-integration-and-subagent-delegation)
4. [Step-by-Step Execution Journey](#-step-by-step-execution-journey)
5. [Quick Start and Automated Setup](#-quick-start-and-automated-setup)
6. [Commands and Shortcuts Reference](#-commands-and-shortcuts-reference)
7. [Author and License](#-author-and-license)

---

## 🌟 Overview

**KerberoSec CLI** is a professional terminal-native autonomous AI coding agent designed to inspect large codebases, plan multi-step technical architectures, edit files with unified diffs, execute shell commands, run diagnostics, and manage Model Context Protocol (MCP) servers.

Powered by **OpenTUI & React 19**, KerberoSec CLI combines the speed and responsiveness of native terminal tools with the reasoning capabilities of both local offline models (Ollama) and cutting-edge cloud models.

---

## 🚀 Key Highlights

- 🤖 **Offline Local AI (First-Class Ollama Integration)**:
  - Supports `qwen2.5-coder:1.5b`, `qwen2.5-coder:7b`, `llama3`, and `deepseek-coder`.
  - **Auto-Daemon Management**: Automatically detects if the background Ollama server is running on port `11434` and launches `ollama serve` seamlessly when needed.
- ☁️ **Cloud AI Providers**:
  - Out-of-the-box support for Anthropic Claude 3.7 Sonnet, OpenAI GPT-4o, Google Gemini 2.0, Groq, DeepSeek, and OpenRouter.
- ⚡ **Plan vs. Act Dual Execution Modes**:
  - **Plan Mode**: Read-only mode for codebase analysis, architecture planning, and trade-off evaluation without touching files.
  - **Act Mode**: Autonomous write mode for code generation, file replacements, and test execution.
  - Switch modes instantly with <kbd>Tab</kbd>.
- 🔐 **Account Lifecycle and Clean `/logout`**:
  - Wipe cached credentials and return to the interactive login onboarding flow with `/logout`.
- ⌨️ **Ergonomic Keyboard Bindings**:
  - **Single <kbd>Ctrl</kbd>+<kbd>C</kbd>**: Preserved for terminal copying; never kills running prompts.
  - **Double <kbd>Ctrl</kbd>+<kbd>C</kbd> (within 2s)**: Cleanly exits the CLI.
  - **<kbd>Esc</kbd>**: Aborts active reasoning or turn streaming.
  - **<kbd>Ctrl</kbd>+<kbd>P</kbd>**: Opens the fuzzy Command Palette.
- 📦 **1-Step Automated Installer (`setup.sh`)**:
  - Complete automated installer sets up Bun, Ollama, builds packages, and configures global CLI access.

---

## 🏛️ Architecture and System Design

### Monorepo Package Topology

```mermaid
graph LR
    subgraph Applications ["Apps"]
        CLI["@kerberosec/cli<br>(apps/cli)"]
    end

    subgraph SDKPackages ["SDK Packages (sdk/packages/)"]
        Core["@kerberosec/core<br>(Agent Engine & Tools)"]
        LLMs["@kerberosec/llms<br>(Model Provider Routing)"]
        Agents["@kerberosec/agents<br>(Subagent Coordination)"]
        Shared["@kerberosec/shared<br>(Contracts & Schemas)"]
        UI["@kerberosec/ui<br>(Themes & ANSI Tokens)"]
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

### Diagram 1: System Layer Architecture

```mermaid
graph TD
    subgraph ClientLayer ["1. Terminal Presentation Layer (apps/cli)"]
        A["Terminal Window (xterm / Ghostty / iTerm2 / WSL)"] --> B["OpenTUI and React Virtual DOM Engine"]
        B --> C["Keyboard Router (Double Ctrl+C, Tab, Esc)"]
        B --> D["Slash Command Router (/logout, /model, /mcp)"]
        B --> E["Active Views (Chat, Onboarding, Config, History)"]
    end

    subgraph RuntimeLayer ["2. Interactive Session Runtime (apps/cli/src/runtime)"]
        F["InteractiveSessionRuntime"]
        C -->|Prompt / Input| F
        D -->|Action| F
        F --> G["Turn State Tracker"]
        F --> H["Context Hydration & Token Budget Manager"]
        F --> I["Streaming Output Formatter (Markdown / Diffs / ANSI)"]
        I -->|Live UI Updates| E
    end

    subgraph CoreLayer ["3. Core Agent Engine (@kerberosec/core)"]
        J["Agent Execution Engine"]
        F -->|Submit Turn| J
        J --> K["Tool Policy & Permission Gate"]
        J --> L["Checkpoint & Shadow Snapshot Engine"]
    end

    subgraph LLMLayer ["4. Model Router (@kerberosec/llms)"]
        N["Multi-Provider Model Router"]
        J --> N
        N --> O["Local Offline Ollama Engine"]
        N --> P["Cloud Providers (Claude, OpenAI, Gemini, Groq)"]
    end

    subgraph ExecutionLayer ["5. Tool Execution & Subagents"]
        Q["File System (Read, Write, Diff Edit)"]
        R["Shell Terminal Process Runner (PTY)"]
        S["External MCP Client Manager"]
        T["Concurrent Subagent Orchestrator"]
        K --> Q
        K --> R
        K --> S
        K --> T
    end

    O --> J
    P --> J
    Q --> J
    R --> J
    S --> J
    T --> J
    J --> F
```

---

### Diagram 2: Terminal UI and Keyboard Event Routing

```mermaid
flowchart TD
    KeyInput["User Presses Key in Terminal"] --> KeyRouter{"useRootKeyboard Router"}
    
    KeyRouter -- "Ctrl + C" --> CtrlCCheck{"Is Prompt Running or Idle?"}
    CtrlCCheck --> PressTimer{"Pressed 2x within 2 seconds?"}
    PressTimer -- "Yes (2nd press)" --> ExitApp["Cleanly Exit KerberoSec CLI"]
    PressTimer -- "No (1st press)" --> CopyToast["Preserve Clipboard and Display Toast: Press Ctrl+C again to exit"]

    KeyRouter -- "Escape" --> EscapeCheck{"Is Prompt Running?"}
    EscapeCheck -- "Yes" --> AbortStream["Abort Active Stream / Tool Execution"]
    EscapeCheck -- "No" --> CloseModal["Close Open Dialog or Modal"]

    KeyRouter -- "Tab" --> ToggleMode["Toggle Mode: Plan Mode <---> Act Mode"]
    KeyRouter -- "Ctrl + P" --> OpenPalette["Open Fuzzy Command Palette Modal"]
    KeyRouter -- "Slash (/)" --> Autocomplete["Open Slash Commands Autocomplete Menu"]
```

---

### Diagram 3: Interactive Session Runtime and Compaction Loop

```mermaid
flowchart TD
    PromptIn["User Submits Prompt"] --> TurnQueue["Prompt Queue Buffer"]
    TurnQueue --> Hydrate["Hydrate Context: System Prompts + Rules + History"]
    Hydrate --> CheckHeadroom{"Token Count Approaches Context Limit?"}
    
    CheckHeadroom -- "Yes" --> Compaction["Compaction Coordinator: Condense Previous Turns into Summary Checkpoint"]
    CheckHeadroom -- "No" --> StreamReq["Dispatch Prompt to LLM Router"]
    Compaction --> StreamReq
    
    StreamReq --> StreamParser["Real-Time Token Stream Parser"]
    StreamParser --> Splitter{"Detect Chunk Type"}
    Splitter -- "Reasoning" --> ThinkingBlock["Stream into Thinking Block UI"]
    Splitter -- "Markdown Content" --> MarkdownUI["Stream into Chat View UI"]
    Splitter -- "Structured Tool Call" --> ToolDispatcher["Forward to Tool Execution Engine"]
```

---

### Diagram 4: Core Agent Engine and Checkpoint Security Gate

```mermaid
flowchart TD
    ToolCall["Model Emits Tool Invocation"] --> SecurityGate{"Evaluate Security Tier"}
    
    SecurityGate -- "Tier 1: Read-Only (read_file, grep, list_dir)" --> ExecSafe["Execute Instantly (Auto-Approved)"]
    
    SecurityGate -- "Tier 2: File Mutations (write_file, replace_content)" --> Snapshot["Create In-Memory Shadow Snapshot (Checkpoint Engine)"]
    Snapshot --> DiffView["Render Unified Diff Preview in TUI"]
    DiffView --> ApprovalCheck{"Auto-Approve Enabled?"}
    ApprovalCheck -- "Yes" --> ApplyDiff["Apply Changes to Disk"]
    ApprovalCheck -- "No" --> UserPrompt{"User Approves Diff?"}
    UserPrompt -- "Approved" --> ApplyDiff
    UserPrompt -- "Rejected" --> Rollback["Roll Back to In-Memory Snapshot"]

    SecurityGate -- "Tier 3: System Commands (run_command)" --> ConfirmCmd["Prompt User with Command & Working Directory"]
    ConfirmCmd --> SpawnPTY["Spawn Subprocess with PTY Stream"]
```

---

### Diagram 5: Offline Ollama Auto-Daemon Lifecycle

```mermaid
flowchart TD
    SelectOllama["User Selects Local Ollama Model (e.g. qwen2.5-coder:1.5b)"] --> CheckPort{"Is Port 11434 Listening?"}
    
    CheckPort -- "Yes (Server Online)" --> CheckModel{"Is Model Downloaded Locally?"}
    
    CheckPort -- "No (Server Offline)" --> SpawnDaemon["Spawn Background Daemon: 'ollama serve'"]
    SpawnDaemon --> PollDaemon["Poll http://127.0.0.1:11434/api/version"]
    PollDaemon --> CheckModel
    
    CheckModel -- "Yes" --> StreamReady["Ready to Stream Prompts Fully Offline"]
    CheckModel -- "No" --> AutoPull["Auto-Pull Model: 'ollama pull model'"]
    AutoPull --> StreamReady
```

---

### Diagram 6: MCP Integration and Subagent Delegation

```mermaid
graph TD
    subgraph MainAgent ["Main Agent Coordinator (@kerberosec/core)"]
        Planner["ReAct Planning Engine"]
    end

    subgraph MCPHost ["Model Context Protocol (MCP) Client"]
        MCPConfig["mcp_settings.json"]
        MCPClient["JSON-RPC Client (STDIO / SSE Transport)"]
        ExtServers["External MCP Servers (Databases, Cloud APIs, Web Search)"]
    end

    subgraph Subagents ["Concurrent Subagent Engine (@kerberosec/agents)"]
        ResearchAgent["Research Subagent (Codebase Exploration)"]
        DebugAgent["Debugger Subagent (Test Trace Analysis)"]
    end

    Planner -->|Query Custom Tools| MCPClient
    MCPConfig --> MCPClient
    MCPClient --> ExtServers
    ExtServers -->|Tool Results| MCPClient
    MCPClient -->|Observation Payload| Planner

    Planner -->|Delegate Subtask| Subagents
    ResearchAgent -->|Synthesized Insights| Planner
    DebugAgent -->|Diagnostic Report| Planner
```

---

## 🔄 Step-by-Step Execution Journey

Here is the exact step-by-step trace of how a prompt travels through the system:

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
    TUI->>Runtime: Enqueue Turn & Hydrate Context
    Runtime->>Core: Build Context Window (Rules + Files + History)
    Core->>LLM: Send Streaming Request
    
    loop Autonomous Execution Loop
        LLM-->>Core: Stream Reasoning Tokens & Tool Call (read_file)
        Core-->>TUI: Live Stream Markdown & Thinking State
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

## ⚡ Quick Start and Automated Setup

### Method 1: Automated 1-Step Setup (Recommended)

```bash
git clone https://github.com/KerberoSec/KerberoSec-CLI.git
cd KerberoSec-CLI

chmod +x setup.sh
./setup.sh
```

The installer script automatically:
1. Installs system build tools (`git`, `curl`, `build-essential`).
2. Installs and configures the **Bun** runtime.
3. Installs and configures **Ollama** with recommended coding models.
4. Installs monorepo dependencies and compiles the SDK and CLI bundle.
5. Configures the global `kerberosec` executable in your `$PATH`.

---

### Method 2: Manual Installation

```bash
# 1. Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc # or source ~/.zshrc

# 2. Clone repository & install packages
git clone https://github.com/KerberoSec/KerberoSec-CLI.git
cd KerberoSec-CLI
bun install

# 3. Build SDK and CLI
bun run build:sdk
bun -F @kerberosec/cli build

# 4. Link global command
mkdir -p ~/.local/bin
cat << 'EOF' > ~/.local/bin/kerberosec
#!/usr/bin/env bash
export PATH="$HOME/.bun/bin:$PATH"
exec bun run /FULL_PATH_TO/KerberoSec-CLI/apps/cli/src/index.ts "$@"
EOF
chmod +x ~/.local/bin/kerberosec
export PATH="$HOME/.local/bin:$PATH"
```

---

## ⌨️ Commands and Shortcuts Reference

### Slash Commands
| Command | Description |
| :--- | :--- |
| **`/logout`** | Sign out of the active account and return to login onboarding |
| **`/model`** | Open the model selector to switch between local Ollama and cloud providers |
| **`/mcp`** | Manage Model Context Protocol (MCP) servers and tools |
| **`/clear`** | Reset conversation history and start a fresh session |
| **`/help`** | Open the interactive help and documentation dialog |

### Keyboard Shortcuts
| Shortcut | Action |
| :--- | :--- |
| **<kbd>Tab</kbd>** | Toggle between **Plan** and **Act** modes |
| **<kbd>Ctrl</kbd>+<kbd>P</kbd>** | Open the Command Palette |
| **<kbd>Ctrl</kbd>+<kbd>C</kbd> (1x)** | Copy selected text / active input (never halts thinking) |
| **<kbd>Ctrl</kbd>+<kbd>C</kbd> (2x)** | Cleanly exit KerberoSec CLI |
| **<kbd>Esc</kbd>** | Cancel ongoing thinking or prompt execution |
| **<kbd>Shift</kbd>+<kbd>Tab</kbd>** | Toggle auto-approval mode for tool executions |

---

## 👤 Author and Maintainer

**Arun Kumar**
- 💼 **LinkedIn**: [arunkumar31072006](https://www.linkedin.com/in/arunkumar31072006/)
- 🐙 **GitHub**: [@KerberoSec](https://github.com/KerberoSec)
- 🐦 **X / Twitter**: [@ArunKumar310706](https://x.com/ArunKumar310706)
- 📷 **Instagram**: [@so_far_from_your_heart](https://www.instagram.com/so_far_from_your_heart/)

---

## 📄 License

This project is licensed under the **Apache 2.0 License** - see the [`LICENSE`](./LICENSE) file for details.

Copyright © 2026 **Arun Kumar (KerberoSec)**. All rights reserved.
