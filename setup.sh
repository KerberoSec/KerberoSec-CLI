#!/usr/bin/env bash

# KerberoSec CLI Automated Setup and Installer Script
# Author Arun Kumar (https://github.com/KerberoSec)

set -e

# Colors for terminal styling
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "=================================================================="
echo "          KerberoSec CLI Automated System Setup                   "
echo "=================================================================="
echo -e "${NC}"

# Detect repository directory
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo -e "${BLUE}Project Directory:${NC} ${REPO_DIR}"

# ------------------------------------------------------------------------------
# 1. Detect OS and Package Manager
# ------------------------------------------------------------------------------
OS="$(uname -s)"
echo -e "${BLUE}Detecting Operating System...${NC} $OS"

install_system_deps() {
    echo -e "\n${YELLOW}Checking and installing system packages (curl, git, build tools)...${NC}"
    if [ "$OS" = "Linux" ]; then
        if command -v apt-get &>/dev/null; then
            echo -e "${CYAN}Updating APT and installing dependencies...${NC}"
            sudo apt-get update -y
            sudo apt-get install -y curl git build-essential procps
        elif command -v dnf &>/dev/null; then
            echo -e "${CYAN}Installing dependencies with DNF...${NC}"
            sudo dnf install -y curl git gcc gcc-c++ make procps-ng
        elif command -v pacman &>/dev/null; then
            echo -e "${CYAN}Installing dependencies with Pacman...${NC}"
            sudo pacman -Sy --noconfirm curl git base-devel procps-ng
        else
            echo -e "${YELLOW}Unknown Linux package manager. Please ensure curl, git, and build tools are installed.${NC}"
        fi
    elif [ "$OS" = "Darwin" ]; then
        if ! command -v brew &>/dev/null; then
            echo -e "${CYAN}Homebrew not found. Installing Homebrew...${NC}"
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        echo -e "${CYAN}Installing dependencies via Homebrew...${NC}"
        brew install git curl
    fi
}

# Run system dependency installation if git or curl is missing
if ! command -v git &>/dev/null || ! command -v curl &>/dev/null; then
    install_system_deps
else
    echo -e "${GREEN}[OK] System essentials (git, curl) already present.${NC}"
fi

# ------------------------------------------------------------------------------
# 2. Check and Install Bun Runtime
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}Checking Bun JavaScript and TypeScript Runtime...${NC}"
if ! command -v bun &>/dev/null && [ ! -f "$HOME/.bun/bin/bun" ]; then
    echo -e "${CYAN}Bun not found. Installing Bun...${NC}"
    curl -fsSL https://bun.sh/install | bash
fi

export PATH="$HOME/.bun/bin:$PATH"

if command -v bun &>/dev/null; then
    echo -e "${GREEN}[OK] Bun installed:${NC} $(bun --version)"
else
    echo -e "${RED}[ERROR] Failed to locate Bun. Please check your installation.${NC}"
    exit 1
fi

# ------------------------------------------------------------------------------
# 3. Check and (Optionally) Install Ollama for Local Models
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}Checking Ollama (Local AI Model Engine)...${NC}"
if ! command -v ollama &>/dev/null; then
    echo -e "${CYAN}Ollama is not installed. Would you like to install it for offline AI models? [Y/n]${NC}"
    read -r -p "> " install_ollama
    install_ollama=${install_ollama:-Y}
    if [[ "$install_ollama" =~ ^[Yy]$ ]]; then
        echo -e "${CYAN}Installing Ollama...${NC}"
        curl -fsSL https://ollama.com/install.sh | sh
    fi
fi

if command -v ollama &>/dev/null; then
    echo -e "${GREEN}[OK] Ollama is installed.${NC}"
    # Check if a coding model exists
    if ! ollama list 2>/dev/null | grep -q "qwen2.5-coder"; then
        echo -e "${CYAN}Pulling recommended model qwen2.5-coder:1.5b...${NC}"
        ollama pull qwen2.5-coder:1.5b || true
    fi
fi

# ------------------------------------------------------------------------------
# 4. Install Monorepo Dependencies & Compile SDK + CLI
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}Installing project dependencies...${NC}"
cd "$REPO_DIR"
bun install

echo -e "\n${YELLOW}Building KerberoSec Core SDK...${NC}"
bun run build:sdk

echo -e "\n${YELLOW}Building KerberoSec CLI bundle...${NC}"
bun -F @kerberosec/cli build

# ------------------------------------------------------------------------------
# 5. Set up Global Executable (`kerberosec`)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}Configuring global kerberosec command...${NC}"
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

WRAPPER_PATH="$BIN_DIR/kerberosec"
cat << WRAPPER_EOF > "$WRAPPER_PATH"
#!/usr/bin/env bash
export PATH="\$HOME/.bun/bin:\$PATH"
exec bun run "$REPO_DIR/apps/cli/src/index.ts" "\$@"
WRAPPER_EOF

chmod +x "$WRAPPER_PATH"

# Ensure PATH is added to user's shell rc
ensure_path() {
    local rc_file="$1"
    if [ -f "$rc_file" ]; then
        if ! grep -q "$BIN_DIR" "$rc_file"; then
            echo -e "\n# KerberoSec CLI PATH" >> "$rc_file"
            echo "export PATH=\"\$HOME/.bun/bin:$BIN_DIR:\$PATH\"" >> "$rc_file"
            echo -e "${CYAN}Added PATH export to ${rc_file}${NC}"
        fi
    fi
}

ensure_path "$HOME/.bashrc"
ensure_path "$HOME/.zshrc"

export PATH="$HOME/.bun/bin:$BIN_DIR:$PATH"

# ------------------------------------------------------------------------------
# 6. Verification & Done
# ------------------------------------------------------------------------------
echo -e "\n${GREEN}${BOLD}=================================================================="
echo "          KerberoSec CLI is Successfully Installed!               "
echo "==================================================================${NC}"
echo -e "\n${BOLD}Quick Start:${NC}"
echo -e "  1. Reload your shell:     ${CYAN}source ~/.bashrc${NC} (or ${CYAN}source ~/.zshrc${NC})"
echo -e "  2. Launch Interactive TUI: ${GREEN}kerberosec${NC}"
echo -e "  3. Single Prompt Mode:     ${GREEN}kerberosec \"explain my project\"${NC}"
echo ""
echo -e "${BOLD}Key Shortcuts:${NC}"
echo -e "  * /logout          - Sign out and return to onboarding"
echo -e "  * /model           - Switch LLM providers and models"
echo -e "  * Tab              - Switch between Plan and Act modes"
echo -e "  * Ctrl + C (x2)    - Cleanly exit CLI"
echo ""
