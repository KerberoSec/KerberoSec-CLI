#!/usr/bin/env bash

# ==============================================================================
# KerberoSec CLI — Complete Automated System Setup & Optimizer
# ==============================================================================
# Author: Arun Kumar (https://github.com/KerberoSec)
# Repository: https://github.com/KerberoSec/KerberoSec-CLI
#
# PURPOSE:
# Performs complete bootstrap of the KerberoSec monorepo:
#   1. System packages & build prerequisites (curl, git, build-essential)
#   2. Bun JavaScript/TypeScript high-performance runtime
#   3. Autonomous Ollama hardware accelerator & model matrix optimization
#   4. Monorepo dependency resolution & compilation (Core SDK + CLI binary)
#   5. Global executable setup (`kerberosec`) in user PATH
# ==============================================================================

set -e

# Colors for terminal styling
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║          KerberoSec CLI — Automated System Installer & Optimizer             ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Detect repository directory
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo -e "  * ${BLUE}Repository Root:${NC} ${WHITE}${REPO_DIR}${NC}"

# ------------------------------------------------------------------------------
# 1. Detect OS and Package Manager
# ------------------------------------------------------------------------------
OS="$(uname -s)"
echo -e "\n${BLUE}${BOLD}[1/5] Detecting Operating System & Prerequisites...${NC}"
echo -e "  * Operating System: ${GREEN}${OS}${NC}"

install_system_deps() {
    echo -e "  * Installing system packages (curl, git, build tools)..."
    if [ "$OS" = "Linux" ]; then
        if command -v apt-get &>/dev/null; then
            echo -e "    Updating APT repositories..."
            sudo apt-get update -y
            sudo apt-get install -y curl git build-essential procps
        elif command -v dnf &>/dev/null; then
            echo -e "    Installing dependencies with DNF..."
            sudo dnf install -y curl git gcc gcc-c++ make procps-ng
        elif command -v pacman &>/dev/null; then
            echo -e "    Installing dependencies with Pacman..."
            sudo pacman -Sy --noconfirm curl git base-devel procps-ng
        else
            echo -e "    ${YELLOW}Unknown Linux package manager. Please ensure curl, git, and build tools are installed.${NC}"
        fi
    elif [ "$OS" = "Darwin" ]; then
        if ! command -v brew &>/dev/null; then
            echo -e "    Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        echo -e "    Installing dependencies via Homebrew..."
        brew install git curl
    fi
}

if ! command -v git &>/dev/null || ! command -v curl &>/dev/null; then
    install_system_deps
else
    echo -e "  * ${GREEN}[OK]${NC} System essentials (git, curl) are present."
fi

# ------------------------------------------------------------------------------
# 2. Check and Install Bun Runtime
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}${BOLD}[2/5] Checking Bun JavaScript & TypeScript Runtime...${NC}"
if ! command -v bun &>/dev/null && [ ! -f "$HOME/.bun/bin/bun" ]; then
    echo -e "  * Downloading and installing Bun runtime..."
    curl -fsSL https://bun.sh/install | bash
fi

export PATH="$HOME/.bun/bin:$PATH"

if command -v bun &>/dev/null; then
    echo -e "  * ${GREEN}[OK]${NC} Bun installed: ${WHITE}$(bun --version)${NC}"
else
    echo -e "  * ${RED}[ERROR]${NC} Failed to locate Bun. Please check your installation."
    exit 1
fi

# ------------------------------------------------------------------------------
# 3. Setup, Optimize, and Tune Ollama with Maximum GPU Performance
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}${BOLD}[3/5] Running Autonomous Ollama GPU & Model Matrix Optimizer...${NC}"
echo -e "  * Supported Model Families: ${CYAN}Qwen 3.5${NC}, ${CYAN}Qwen 2.5-Coder${NC}, ${CYAN}Llama 3.5/3.3${NC}, ${CYAN}DeepSeek R1/V2${NC}, ${CYAN}Codestral${NC}"
echo -e "  * Baseline Minimum Model:   ${GREEN}qwen3:1.7b${NC} (or higher scaled by GPU VRAM)"
if [ -f "$REPO_DIR/ollama.sh" ]; then
    chmod +x "$REPO_DIR/ollama.sh"
    bash "$REPO_DIR/ollama.sh"
fi

# ------------------------------------------------------------------------------
# 4. Install Monorepo Dependencies & Compile SDK + CLI
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}${BOLD}[4/5] Building KerberoSec Monorepo (SDK & CLI Bundles)...${NC}"
cd "$REPO_DIR"

echo -e "  * Resolving workspace dependencies with Bun..."
bun install

echo -e "  * Compiling KerberoSec SDK packages..."
bun run build:sdk

echo -e "  * Compiling KerberoSec CLI binary..."
bun -F @kerberosec/cli build

# ------------------------------------------------------------------------------
# 5. Set up Global Executable (`kerberosec`)
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}${BOLD}[5/5] Configuring Global Executable in PATH...${NC}"
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

WRAPPER_PATH="$BIN_DIR/kerberosec"
cat << WRAPPER_EOF > "$WRAPPER_PATH"
#!/usr/bin/env bash
export PATH="\$HOME/.bun/bin:\$PATH"
exec bun run "$REPO_DIR/apps/cli/src/index.ts" "\$@"
WRAPPER_EOF

chmod +x "$WRAPPER_PATH"

ensure_path() {
    local rc_file="$1"
    if [ -f "$rc_file" ]; then
        if ! grep -q "$BIN_DIR" "$rc_file"; then
            echo -e "\n# KerberoSec CLI PATH" >> "$rc_file"
            echo "export PATH=\"\$HOME/.bun/bin:$BIN_DIR:\$PATH\"" >> "$rc_file"
            echo -e "  * Added PATH export to ${CYAN}${rc_file}${NC}"
        fi
    fi
}

ensure_path "$HOME/.bashrc"
ensure_path "$HOME/.zshrc"

export PATH="$HOME/.bun/bin:$BIN_DIR:$PATH"

# ------------------------------------------------------------------------------
# 6. Verification & Done
# ------------------------------------------------------------------------------
echo -e "\n${GREEN}${BOLD}╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║          KerberoSec CLI is Successfully Installed & Ready!                   ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo -e "\n${BOLD}Quick Start:${NC}"
echo -e "  1. Reload your shell:     ${CYAN}source ~/.bashrc${NC} (or ${CYAN}source ~/.zshrc${NC})"
echo -e "  2. Launch Interactive TUI: ${GREEN}kerberosec${NC}"
echo -e "  3. Single Prompt Mode:     ${GREEN}kerberosec \"explain my project\"${NC}"
echo ""
echo -e "${BOLD}Key Shortcuts in TUI:${NC}"
echo -e "  * ${CYAN}/model${NC}           - Switch LLM providers and models (Ollama, Claude, DeepSeek, OpenAI)"
echo -e "  * ${CYAN}/settings${NC}        - Open configuration panel"
echo -e "  * ${CYAN}Tab${NC}              - Toggle between Plan Mode and Act Mode"
echo -e "  * ${CYAN}PageUp / PageDown${NC}- Scroll transcript (3x high-speed scroll)"
echo -e "  * ${CYAN}Ctrl + C (x2)${NC}    - Cleanly exit CLI"
echo ""
