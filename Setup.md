# 🚀 KerberoSec CLI Setup Guide

This guide walks you through setting up and running **KerberoSec CLI** on a completely new laptop or fresh operating system (Linux, macOS, or Windows WSL2).

---

## ⚡ 1-Step Quick Installation (Recommended)

If you have cloned or copied the repository, you can set up everything automatically by running:

```bash
chmod +x setup.sh
./setup.sh
```

The script automatically:
1. Installs system build tools & dependencies (`git`, `curl`, `build-essential`).
2. Installs and configures the **Bun** runtime.
3. (Optional) Prompts to install **Ollama** and pulls the coding model.
4. Installs all project packages and builds both the SDK & CLI bundle.
5. Configures the global `kerberosec` command in your `$PATH`.

---

## 📋 Prerequisites & Manual Setup Instructions

- **Supported Operating Systems**: Linux (Ubuntu, Kali, Debian, Arch, Fedora), macOS (Apple Silicon & Intel), Windows 10/11 (via WSL2).
- **Hardware**: Any modern 64-bit CPU, minimum 4 GB RAM (8 GB+ recommended).

---

## 🛠️ Step 1: Install Git, Curl, and Bun

### 1. Install Git and Curl
- **Debian / Ubuntu / Kali**:
  ```bash
  sudo apt update && sudo apt install -y git curl build-essential
  ```
- **macOS**:
  ```bash
  brew install git curl
  ```
- **Fedora / RHEL**:
  ```bash
  sudo dnf install -y git curl
  ```

### 2. Install Bun (High-Performance JS/TS Runtime)
```bash
curl -fsSL https://bun.sh/install | bash
```

Reload your shell environment so `bun` is available in your PATH:
```bash
source ~/.bashrc   # or source ~/.zshrc
```

Verify Bun installation:
```bash
bun --version
```

---

## 📦 Step 2: Clone or Copy the Repository

### Clone via Git:
```bash
git clone https://github.com/KerberoSec/KerberoSec-CLI.git
cd KerberoSec-CLI
```
*(Or copy the `KerberoSec-CLI` folder to your target laptop and navigate into it).*

---

## ⚙️ Step 3: Install Dependencies & Build CLI

Install all monorepo dependencies and compile the CLI package:

```bash
# 1. Install dependencies
bun install

# 2. Build the CLI package bundle
bun -F @kerberosec/cli build
```

---

## 🌐 Step 4: Make `kerberosec` Globally Executable

To run `kerberosec` from any terminal directory:

1. Ensure the user binary directory exists:
   ```bash
   mkdir -p ~/.local/bin
   ```

2. Create an executable wrapper script:
   ```bash
   cat << 'WRAPPER_EOF' > ~/.local/bin/kerberosec
   #!/usr/bin/env bash
   export PATH="$HOME/.bun/bin:$PATH"
   exec bun run /FULL_PATH_TO/KerberoSec-CLI/apps/cli/src/index.ts "$@"
   WRAPPER_EOF
   ```
   > 💡 **Note**: Replace `/FULL_PATH_TO/KerberoSec-CLI` with the actual path to your repository (e.g., `/home/username/Desktop/KerberoSec-CLI` or `$(pwd)`).

3. Make the wrapper executable:
   ```bash
   chmod +x ~/.local/bin/kerberosec
   ```

4. Ensure `~/.local/bin` is in your `$PATH` (add to `~/.bashrc` or `~/.zshrc` if not present):
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   ```

5. Verify:
   ```bash
   kerberosec --version
   ```

---

## 🤖 Step 5: (Optional) Set Up Local Models with Ollama

If you want to use local/offline models without API costs:

### 1. Install Ollama
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Download Recommended Coding Models
- **Lightweight / Laptop CPU**:
  ```bash
  ollama pull qwen2.5-coder:1.5b
  # or ultra-lightweight:
  ollama pull qwen2.5-coder:0.5b
  ```
- **Powerful / Dedicated GPU (6GB+ VRAM)**:
  ```bash
  ollama pull qwen2.5-coder:7b
  ```

*KerberoSec CLI will automatically detect Ollama and start the background server if it isn't running.*

---

## 🚀 Step 6: Launch & Use KerberoSec

### 1. Interactive Terminal UI Mode:
```bash
kerberosec
```

### 2. Single-Prompt / Headless Mode:
```bash
kerberosec "explain the architecture of this repository"
kerberosec "find and fix bugs in src/utils"
```

---

## ⌨️ Essential Keyboard Shortcuts & Commands

| Command / Shortcut | Description |
| :--- | :--- |
| **`/logout`** | Sign out of the current account and return to login screen |
| **`/model`** | Switch AI provider and model |
| **`/mcp`** | Manage Model Context Protocol (MCP) servers |
| **`/clear`** | Clear active conversation history |
| **<kbd>Ctrl</kbd>+<kbd>P</kbd>** | Open Command Palette |
| **<kbd>Tab</kbd>** | Toggle between **Plan** and **Act** modes |
| **<kbd>Ctrl</kbd>+<kbd>C</kbd> (x2)** | Double-tap to exit the CLI cleanly |

---

## 🔍 Troubleshooting

- **`command not found: kerberosec`**:
  Make sure `~/.local/bin` and `~/.bun/bin` are exported in your `~/.bashrc` or `~/.zshrc`:
  ```bash
  export PATH="$HOME/.bun/bin:$HOME/.local/bin:$PATH"
  ```
- **Model response hanging on CPU**:
  If using Ollama on CPU, initial prompt evaluation may take 30-60 seconds for large codebases. For instant sub-second responses, switch to cloud providers (Gemini, Groq, OpenAI, Anthropic) via `/model` or <kbd>Ctrl</kbd>+<kbd>P</kbd>.
