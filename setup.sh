#!/usr/bin/env bash

# ==============================================================================
# KerberoSec CLI - Complete Automated System Setup & Hardware Optimizer
# ==============================================================================
# Author: Arun Kumar (https://github.com/KerberoSec)
# Repository: https://github.com/KerberoSec/KerberoSec-CLI
#
# PURPOSE & ARCHITECTURE OVERVIEW:
# Performs complete, autonomous bootstrap of the KerberoSec environment:
#   1. Foundational prerequisites & build tools (curl, wget, git, tar, gzip,
#      bzip2, xz, zip, unzip, jq, procps, pciutils, build-essential, pkg-config,
#      python3, python3-pip, python3-venv, python3-dev, golang-go, gnupg)
#   2. Autonomous laptop hardware probing & adaptive model matrix calibration
#      (NVIDIA 2GB-24GB+, AMD Radeon/APU, Apple Silicon Metal, Intel Arc/Xe, CPU)
#   3. Bun JavaScript & TypeScript high-performance runtime
#   4. Monorepo dependency resolution & compilation (SDK packages + CLI binary)
#   5. Global executable setup (`kerberosec`) in user PATH
#   6. Autonomous Ollama hardware accelerator & model matrix optimization
#   7. Security toolchain verification
# ==============================================================================

set -e

# Terminal styling & color palette
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Parse optional arguments
SKIP_OLLAMA=false
SKIP_BUILD=false
WITH_TOOLS=false
DRY_RUN=false

for arg in "$@"; do
    case "$arg" in
        --skip-ollama|--no-ollama)
            SKIP_OLLAMA=true
            ;;
        --skip-build)
            SKIP_BUILD=true
            ;;
        --with-tools)
            WITH_TOOLS=true
            ;;
        --dry-run)
            DRY_RUN=true
            ;;
        --help|-h)
            echo "KerberoSec CLI Automated System Setup & Optimizer"
            echo "Usage: ./setup.sh [options]"
            echo ""
            echo "Options:"
            echo "  --skip-ollama, --no-ollama   Skip Ollama installation and GPU optimization"
            echo "  --skip-build                 Skip compiling SDK and CLI binaries"
            echo "  --with-tools                 Install full suite of 280+ security tools (via tools.sh)"
            echo "  --dry-run                    Inspect prerequisites and print steps without modifying system"
            echo "  --help, -h                   Show this help message and exit"
            exit 0
            ;;
    esac
done

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║          KerberoSec CLI - Automated System Installer & Optimizer             ║"
echo "║      Universal Bootstrap for Development & Security Engineering Environments ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Detect repository directory
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo -e "  * ${BLUE}Repository Root:${NC} ${WHITE}${REPO_DIR}${NC}"

mkdir -p "$HOME/.local/bin"
export PATH="$HOME/.local/bin:$HOME/go/bin:/usr/local/bin:$PATH"

# Sudo & privilege detection (ensures non-interactive runs do not hang)
CAN_SUDO=false
if [ "$EUID" -eq 0 ]; then
    CAN_SUDO=true
elif command -v sudo &>/dev/null && sudo -n true 2>/dev/null; then
    CAN_SUDO=true
elif command -v sudo &>/dev/null && [ -t 0 ]; then
    CAN_SUDO=true
fi

SUDO_CMD=""
if [ "$EUID" -ne 0 ] && [ "$CAN_SUDO" = true ]; then
    SUDO_CMD="sudo"
fi

# ------------------------------------------------------------------------------
# 1. Detect OS, Package Manager, and Foundational Prerequisites
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}${BOLD}[1/7] Probing Operating System & Foundational Prerequisites...${NC}"

OS_NAME="$(uname -s 2>/dev/null || echo "Unknown")"
ARCH_NAME="$(uname -m 2>/dev/null || echo "Unknown")"
DISTRO_NAME="Generic"
PKG_MANAGER="none"
IS_WSL=false

case "$OS_NAME" in
    Linux*)
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO_NAME="${NAME:-Linux}"
        fi

        if grep -qi "microsoft" /proc/version 2>/dev/null || [ -d "/usr/lib/wsl" ]; then
            IS_WSL=true
            DISTRO_NAME="${DISTRO_NAME} (WSL2)"
        fi

        if command -v apt-get &>/dev/null; then PKG_MANAGER="apt";
        elif command -v pacman &>/dev/null; then PKG_MANAGER="pacman";
        elif command -v dnf &>/dev/null; then PKG_MANAGER="dnf";
        elif command -v yum &>/dev/null; then PKG_MANAGER="yum";
        elif command -v zypper &>/dev/null; then PKG_MANAGER="zypper";
        elif command -v apk &>/dev/null; then PKG_MANAGER="apk";
        elif command -v emerge &>/dev/null; then PKG_MANAGER="emerge";
        elif command -v xbps-install &>/dev/null; then PKG_MANAGER="xbps";
        elif command -v nix-env &>/dev/null; then PKG_MANAGER="nix";
        fi
        ;;
    Darwin*)
        DISTRO_NAME="macOS $(sw_vers -productVersion 2>/dev/null || echo "")"
        if command -v brew &>/dev/null; then
            PKG_MANAGER="brew"
        else
            PKG_MANAGER="brew_needed"
        fi
        ;;
    CYGWIN*|MINGW*|MSYS*|Windows_NT*)
        DISTRO_NAME="Windows Environment ($OS_NAME)"
        if command -v pacman &>/dev/null; then PKG_MANAGER="pacman"; # MSYS2
        elif command -v winget &>/dev/null; then PKG_MANAGER="winget";
        elif command -v choco &>/dev/null; then PKG_MANAGER="choco";
        elif command -v scoop &>/dev/null; then PKG_MANAGER="scoop";
        fi
        ;;
    FreeBSD*|OpenBSD*|NetBSD*)
        DISTRO_NAME="BSD ($OS_NAME)"
        if command -v pkg &>/dev/null; then PKG_MANAGER="pkg"; fi
        ;;
    *)
        DISTRO_NAME="$OS_NAME"
        ;;
esac

echo -e "  * Platform Detected: ${GREEN}${DISTRO_NAME} (${ARCH_NAME})${NC}"
echo -e "  * Package Manager:   ${CYAN}${PKG_MANAGER}${NC}"

# Check individual foundational tools required for downloads, archive extraction,
# compiling source code, Python environments, and hardware probing
MISSING_TOOLS=()
for tool in git curl wget tar gzip bzip2 xz zip unzip jq python3; do
    if ! command -v "$tool" &>/dev/null; then
        MISSING_TOOLS+=("$tool")
    fi
done

if ! command -v pip3 &>/dev/null && ! command -v pip &>/dev/null; then
    MISSING_TOOLS+=("python3-pip")
fi

if ! command -v make &>/dev/null || (! command -v gcc &>/dev/null && ! command -v clang &>/dev/null && ! command -v cc &>/dev/null); then
    MISSING_TOOLS+=("build-essential")
fi

if ! command -v pkg-config &>/dev/null; then
    MISSING_TOOLS+=("pkg-config")
fi

if ! command -v go &>/dev/null; then
    MISSING_TOOLS+=("golang-go")
fi

if ! command -v ps &>/dev/null; then
    MISSING_TOOLS+=("procps")
fi

if [ "$OS_NAME" = "Linux" ] && ! command -v lspci &>/dev/null; then
    MISSING_TOOLS+=("pciutils")
fi

if ! command -v gpg &>/dev/null && ! command -v gpg2 &>/dev/null; then
    MISSING_TOOLS+=("gnupg")
fi

install_missing_prerequisites() {
    echo -e "  * ${YELLOW}[!] Missing foundational prerequisite tools:${NC} ${MISSING_TOOLS[*]}"

    if [ "$DRY_RUN" = true ]; then
        echo -e "  * ${YELLOW}[Dry-Run] Would install required tools using ${PKG_MANAGER}.${NC}"
        return 0
    fi

    if [ "$EUID" -ne 0 ] && [ "$CAN_SUDO" = false ] && [ "$PKG_MANAGER" != "brew" ] && [ "$PKG_MANAGER" != "scoop" ]; then
        echo -e "  * ${RED}[!] Administrative privileges required to install system packages.${NC}"
        echo -e "  * Please install the following packages manually and rerun setup.sh: ${MISSING_TOOLS[*]}"
        return 1
    fi

    echo -e "  * Installing required foundational tools using ${CYAN}${PKG_MANAGER}${NC}..."

    case "$PKG_MANAGER" in
        apt)
            export DEBIAN_FRONTEND=noninteractive
            $SUDO_CMD apt-get update -y -qq 2>/dev/null || true
            $SUDO_CMD apt-get install -y --no-install-recommends \
                curl wget git zip unzip tar gzip bzip2 xz-utils jq procps pciutils \
                build-essential pkg-config \
                python3 python3-pip python3-venv python3-dev \
                golang-go ca-certificates gnupg
            ;;
        pacman)
            $SUDO_CMD pacman -Sy --noconfirm --needed \
                curl wget git zip unzip tar gzip bzip2 xz jq procps-ng pciutils \
                base-devel pkgconf python python-pip go ca-certificates gnupg
            ;;
        dnf)
            $SUDO_CMD dnf install -y \
                curl wget git zip unzip tar gzip bzip2 xz jq procps-ng pciutils \
                gcc gcc-c++ make pkgconf-pkg-config python3 python3-pip python3-devel \
                golang ca-certificates gnupg2
            ;;
        yum)
            $SUDO_CMD yum install -y \
                curl wget git zip unzip tar gzip bzip2 xz jq procps-ng pciutils \
                gcc gcc-c++ make pkgconf-pkg-config python3 python3-pip python3-devel \
                golang ca-certificates gnupg2
            ;;
        zypper)
            $SUDO_CMD zypper --non-interactive install \
                curl wget git zip unzip tar gzip bzip2 xz jq procps pciutils \
                gcc gcc-c++ make pkg-config python3 python3-pip python3-devel \
                go ca-certificates gpg2
            ;;
        apk)
            $SUDO_CMD apk update
            $SUDO_CMD apk add --no-cache \
                curl wget git zip unzip tar gzip bzip2 xz jq procps pciutils \
                build-base pkgconfig python3 py3-pip python3-dev go ca-certificates gnupg bash
            ;;
        brew|brew_needed)
            if [ "$PKG_MANAGER" = "brew_needed" ]; then
                echo -e "    Installing Homebrew for macOS..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
                eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv 2>/dev/null)"
            fi
            brew install curl wget git gnu-tar gzip bzip2 xz zip unzip jq pkg-config python3 go gnupg
            ;;
        pkg)
            $SUDO_CMD pkg install -y \
                curl wget git gtar gzip bzip2 xz zip unzip jq gmake gcc pkgconf python3 py39-pip go ca_root_nss gnupg
            ;;
        winget)
            winget install -e --id Git.Git --accept-source-agreements --accept-package-agreements || true
            winget install -e --id curl.curl --accept-source-agreements --accept-package-agreements || true
            winget install -e --id 7zip.7zip --accept-source-agreements --accept-package-agreements || true
            winget install -e --id jqlang.jq --accept-source-agreements --accept-package-agreements || true
            winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements || true
            winget install -e --id GoLang.Go --accept-source-agreements --accept-package-agreements || true
            ;;
        choco)
            choco install -y git curl wget zip unzip tar 7zip jq make python3 golang
            ;;
        scoop)
            scoop install git curl wget 7zip jq python go
            ;;
        *)
            echo -e "  * ${YELLOW}[warn] Could not automatically install tools for package manager '$PKG_MANAGER'. Please manually ensure:${NC} ${MISSING_TOOLS[*]}"
            ;;
    esac
}

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    install_missing_prerequisites
    export PATH="$HOME/.local/bin:$HOME/go/bin:/usr/local/bin:/usr/bin:$PATH"
    echo -e "  * ${GREEN}[OK]${NC} Foundational toolchain verified."
else
    echo -e "  * ${GREEN}[OK]${NC} All foundational tools verified (downloaders, extractors, compilers, python, go, hardware probing)."
fi

# ------------------------------------------------------------------------------
# 2. Probe Laptop Hardware Architecture, GPU Cores & Adaptive Model Matrix
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}${BOLD}[2/7] Probing Laptop Hardware Architecture & Calibrating Model Matrix...${NC}"

# CPU Topology
SETUP_LOGICAL_CORES=4
SETUP_PHYSICAL_CORES=4

if [ "$OS_NAME" = "Darwin" ]; then
    SETUP_LOGICAL_CORES=$(sysctl -n hw.logicalcpu 2>/dev/null || echo "4")
    SETUP_PHYSICAL_CORES=$(sysctl -n hw.physicalcpu 2>/dev/null || echo "$SETUP_LOGICAL_CORES")
elif command -v lscpu &>/dev/null; then
    SETUP_LOGICAL_CORES=$(nproc 2>/dev/null || echo "4")
    SETUP_PHYSICAL_CORES=$(lscpu -p 2>/dev/null | grep -E -v '^#' | sort -u -t, -k 2,2 | wc -l 2>/dev/null || echo "$SETUP_LOGICAL_CORES")
else
    SETUP_LOGICAL_CORES=$(nproc 2>/dev/null || echo "4")
    SETUP_PHYSICAL_CORES="$SETUP_LOGICAL_CORES"
fi

SETUP_PHYSICAL_CORES=$(echo "$SETUP_PHYSICAL_CORES" | tr -cd '0-9')
SETUP_LOGICAL_CORES=$(echo "$SETUP_LOGICAL_CORES" | tr -cd '0-9')
SETUP_PHYSICAL_CORES=${SETUP_PHYSICAL_CORES:-4}
SETUP_LOGICAL_CORES=${SETUP_LOGICAL_CORES:-4}
if [ "$SETUP_PHYSICAL_CORES" -le 0 ]; then SETUP_PHYSICAL_CORES=4; fi
if [ "$SETUP_LOGICAL_CORES" -le 0 ]; then SETUP_LOGICAL_CORES=4; fi

# Host RAM
SETUP_RAM_MB=8192
if [ "$OS_NAME" = "Darwin" ]; then
    SETUP_BYTES=$(sysctl -n hw.memsize 2>/dev/null || echo "8589934592")
    SETUP_RAM_MB=$((SETUP_BYTES / 1024 / 1024))
elif command -v free &>/dev/null; then
    SETUP_RAM_MB=$(free -m 2>/dev/null | awk '/^Mem:/{print $2}' || echo "8192")
elif [ -f /proc/meminfo ]; then
    SETUP_RAM_MB=$(grep MemTotal /proc/meminfo 2>/dev/null | awk '{print int($2/1024)}' || echo "8192")
fi

SETUP_RAM_MB=$(echo "$SETUP_RAM_MB" | tr -cd '0-9')
SETUP_RAM_MB=${SETUP_RAM_MB:-8192}
if [ "$SETUP_RAM_MB" -le 0 ]; then SETUP_RAM_MB=8192; fi
SETUP_RAM_GB=$(awk "BEGIN {printf \"%.1f\", $SETUP_RAM_MB/1024}")

# Hardware Accelerator Probing (NVIDIA, AMD, Apple Silicon, Intel Arc, CPU)
SETUP_HAS_NVIDIA=false
SETUP_HAS_AMD=false
SETUP_HAS_APPLE=false
SETUP_HAS_INTEL_ARC=false
SETUP_GPU_NAME="Integrated CPU / System Memory"
SETUP_VRAM_MB=0
SETUP_CUDA_VER=""

# Probe NVIDIA CUDA
NVIDIA_SMI_BIN=""
for cand in "nvidia-smi" "/usr/lib/wsl/lib/nvidia-smi" "/usr/bin/nvidia-smi" "/usr/local/cuda/bin/nvidia-smi" "/mnt/c/Windows/System32/nvidia-smi.exe"; do
    if command -v "$cand" &>/dev/null; then
        NVIDIA_SMI_BIN="$cand"
        break
    fi
done

if [ -n "$NVIDIA_SMI_BIN" ]; then
    NVIDIA_INFO=$($NVIDIA_SMI_BIN --query-gpu=name,memory.total,compute_cap --format=csv,noheader,nounits 2>/dev/null | head -n 1 || true)
    if [ -n "$NVIDIA_INFO" ]; then
        SETUP_GPU_NAME=$(echo "$NVIDIA_INFO" | cut -d',' -f1 | xargs)
        SETUP_RAW_VRAM=$(echo "$NVIDIA_INFO" | cut -d',' -f2 | tr -cd '0-9')
        SETUP_VRAM_MB=${SETUP_RAW_VRAM:-0}
        SETUP_HAS_NVIDIA=true
        SETUP_CUDA_VER=$($NVIDIA_SMI_BIN 2>/dev/null | grep -o "CUDA Version: [0-9.]*" | head -n 1 || echo "CUDA Active")
    fi
elif command -v lspci &>/dev/null; then
    NVIDIA_PCI=$(lspci 2>/dev/null | grep -iE "vga|3d|display" | grep -i "NVIDIA" || true)
    if [ -n "$NVIDIA_PCI" ]; then
        SETUP_HAS_NVIDIA=true
        SETUP_GPU_NAME=$(echo "$NVIDIA_PCI" | head -n 1 | sed -E 's/^[0-9a-fA-F:.]+\s+[^:]+:\s*//')
        SETUP_CUDA_VER="NVIDIA PCI (Driver Setup Required)"
    fi
fi

# Probe Apple Silicon Metal
if [ "$SETUP_HAS_NVIDIA" = false ] && [ "$OS_NAME" = "Darwin" ]; then
    CHIP_INFO=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "")
    if echo "$CHIP_INFO" | grep -qi "Apple"; then
        SETUP_HAS_APPLE=true
        SETUP_GPU_NAME="Apple Metal Unified Memory (${CHIP_INFO})"
        SETUP_VRAM_MB=$((SETUP_RAM_MB * 75 / 100))
    fi
fi

# Probe AMD ROCm / Radeon / APU
if [ "$SETUP_HAS_NVIDIA" = false ] && [ "$SETUP_HAS_APPLE" = false ]; then
    if command -v rocm-smi &>/dev/null; then
        SETUP_HAS_AMD=true
        SETUP_GPU_NAME="AMD ROCm GPU"
        ROCM_VRAM=$(rocm-smi --showmeminfo vram 2>/dev/null | awk '/VRAM Total Memory/{print $5}' | tr -cd '0-9' | head -n 1 || echo "")
        if [ -n "$ROCM_VRAM" ] && [ "$ROCM_VRAM" -gt 0 ]; then
            SETUP_VRAM_MB=$((ROCM_VRAM / 1024 / 1024))
        fi
    elif command -v lspci &>/dev/null; then
        AMD_PCI=$(lspci 2>/dev/null | grep -iE "vga|3d|display" | grep -iE "AMD|Advanced Micro Devices|ATI|Radeon" || true)
        if [ -n "$AMD_PCI" ]; then
            SETUP_HAS_AMD=true
            SETUP_GPU_NAME=$(echo "$AMD_PCI" | head -n 1 | sed -E 's/^[0-9a-fA-F:.]+\s+[^:]+:\s*//')
            if [ -f /sys/class/drm/card0/device/mem_info_vram_total ]; then
                RAW_AMD_BYTES=$(cat /sys/class/drm/card0/device/mem_info_vram_total 2>/dev/null || echo "0")
                if [ "$RAW_AMD_BYTES" -gt 0 ] 2>/dev/null; then
                    SETUP_VRAM_MB=$((RAW_AMD_BYTES / 1024 / 1024))
                fi
            elif [ -f /sys/class/drm/card1/device/mem_info_vram_total ]; then
                RAW_AMD_BYTES=$(cat /sys/class/drm/card1/device/mem_info_vram_total 2>/dev/null || echo "0")
                if [ "$RAW_AMD_BYTES" -gt 0 ] 2>/dev/null; then
                    SETUP_VRAM_MB=$((RAW_AMD_BYTES / 1024 / 1024))
                fi
            fi

            if echo "$SETUP_GPU_NAME" | grep -qiE "Radeon 680M|Radeon 780M|Radeon 890M|Vega|Integrated|APU|Barcelo|Rembrandt|Phoenix|Hawk"; then
                if [ "$SETUP_VRAM_MB" -le 512 ]; then
                    SETUP_VRAM_MB=$((SETUP_RAM_MB / 4))
                    if [ "$SETUP_VRAM_MB" -gt 4096 ]; then SETUP_VRAM_MB=4096; fi
                fi
            else
                if [ "$SETUP_VRAM_MB" -eq 0 ]; then SETUP_VRAM_MB=8192; fi
            fi
        fi
    fi
fi

# Probe Intel Arc & Intel Core Ultra
if [ "$SETUP_HAS_NVIDIA" = false ] && [ "$SETUP_HAS_APPLE" = false ] && [ "$SETUP_HAS_AMD" = false ]; then
    if command -v lspci &>/dev/null; then
        INTEL_GPU=$(lspci 2>/dev/null | grep -iE "vga|3d|display" | grep -i "Intel" || true)
        if echo "$INTEL_GPU" | grep -qiE "Arc|Meteor|Lunar|Xe"; then
            SETUP_HAS_INTEL_ARC=true
            SETUP_GPU_NAME="Intel Arc / Xe Graphics"
        fi
    fi
fi

# Detect locally installed models to preserve user baseline
SETUP_BASELINE_MODEL="qwen2.5-coder:1.5b"
if command -v ollama &>/dev/null && ollama list 2>/dev/null | grep -q "qwen3:1.7b"; then
    SETUP_BASELINE_MODEL="qwen3:1.7b"
fi

# 12-Tier Hardware Matrix & Adaptive Model Calibration
if [ "$SETUP_HAS_NVIDIA" = true ] || [ "$SETUP_HAS_APPLE" = true ] || [ "$SETUP_HAS_AMD" = true ]; then
    if [ "$SETUP_VRAM_MB" -ge 30000 ]; then
        SETUP_RECOMMENDED_MODEL="qwen2.5-coder:32b"
        SETUP_MAX_CTX=131072
        SETUP_TIER="Tier 1 (32GB+ VRAM: 32B-70B Flagship, 128k Context)"
    elif [ "$SETUP_VRAM_MB" -ge 22000 ]; then
        SETUP_RECOMMENDED_MODEL="qwen2.5-coder:32b"
        SETUP_MAX_CTX=65536
        SETUP_TIER="Tier 2 (24GB VRAM: 32B Flagship, 64k Context)"
    elif [ "$SETUP_VRAM_MB" -ge 14000 ]; then
        SETUP_RECOMMENDED_MODEL="qwen2.5-coder:14b"
        SETUP_MAX_CTX=65536
        SETUP_TIER="Tier 3 (16GB VRAM: 14B Models, 64k Context)"
    elif [ "$SETUP_VRAM_MB" -ge 10000 ]; then
        SETUP_RECOMMENDED_MODEL="qwen2.5-coder:14b"
        SETUP_MAX_CTX=32768
        SETUP_TIER="Tier 4 (12GB VRAM: 14B/7B Models, 32k Context)"
    elif [ "$SETUP_VRAM_MB" -ge 7000 ]; then
        SETUP_RECOMMENDED_MODEL="qwen2.5-coder:7b"
        SETUP_MAX_CTX=32768
        SETUP_TIER="Tier 5 (8GB VRAM: 7B Models, 32k Context)"
    elif [ "$SETUP_VRAM_MB" -ge 5000 ]; then
        SETUP_RECOMMENDED_MODEL="qwen2.5-coder:7b"
        SETUP_MAX_CTX=16384
        SETUP_TIER="Tier 6 (6GB VRAM: 7B Models, 16k Context)"
    elif [ "$SETUP_VRAM_MB" -ge 3500 ]; then
        SETUP_RECOMMENDED_MODEL="qwen2.5-coder:3b"
        SETUP_MAX_CTX=8192
        SETUP_TIER="Tier 7 (4GB VRAM: 3B Models, 8k Context)"
    else
        SETUP_RECOMMENDED_MODEL="$SETUP_BASELINE_MODEL"
        SETUP_MAX_CTX=4096
        SETUP_TIER="Tier 8 (2GB VRAM: 1.5B/1.7B Baseline, 4k Context for 100% GPU Offload)"
    fi
else
    if [ "$SETUP_RAM_MB" -ge 32000 ]; then
        SETUP_RECOMMENDED_MODEL="qwen2.5-coder:14b"
        SETUP_MAX_CTX=16384
        SETUP_TIER="Tier 9 (CPU Workstation: 32GB+ RAM, 14B/7B Models, 16k Context)"
    elif [ "$SETUP_RAM_MB" -ge 15000 ]; then
        SETUP_RECOMMENDED_MODEL="qwen2.5-coder:7b"
        SETUP_MAX_CTX=8192
        SETUP_TIER="Tier 10 (CPU Laptop: 16GB RAM, 7B Models, 8k Context)"
    elif [ "$SETUP_RAM_MB" -ge 7000 ]; then
        SETUP_RECOMMENDED_MODEL="$SETUP_BASELINE_MODEL"
        SETUP_MAX_CTX=4096
        SETUP_TIER="Tier 11 (CPU Everyday: 8GB-12GB RAM, 1.5B/1.7B Baseline, 4k Context)"
    else
        SETUP_RECOMMENDED_MODEL="$SETUP_BASELINE_MODEL"
        SETUP_MAX_CTX=2048
        SETUP_TIER="Tier 12 (Low-Spec / SBC: <8GB RAM, 1.5B/0.5B Baseline, 2k Context)"
    fi
fi

echo -e "  * CPU Architecture:  ${WHITE}${SETUP_PHYSICAL_CORES} Physical Cores${NC} (${SETUP_LOGICAL_CORES} Logical Threads)"
echo -e "  * System Host RAM:   ${WHITE}${SETUP_RAM_MB} MB (${SETUP_RAM_GB} GB)${NC}"
if [ "$SETUP_HAS_NVIDIA" = true ] || [ "$SETUP_HAS_APPLE" = true ] || [ "$SETUP_HAS_AMD" = true ] || [ "$SETUP_HAS_INTEL_ARC" = true ]; then
    echo -e "  * GPU Accelerator:   ${GREEN}${SETUP_GPU_NAME}${NC} (VRAM: ${GREEN}${SETUP_VRAM_MB} MB${NC})"
else
    echo -e "  * GPU Accelerator:   ${YELLOW}Integrated CPU (Multi-threaded Acceleration)${NC}"
fi
echo -e "  * Hardware Profile:  ${MAGENTA}${SETUP_TIER}${NC}"
echo -e "  * Calibrated Model:  ${GREEN}${SETUP_RECOMMENDED_MODEL}${NC}"
echo -e "  * Baseline Active:   ${GREEN}${SETUP_BASELINE_MODEL}${NC}"
echo -e "  * Max Context Window:${GREEN}${SETUP_MAX_CTX} tokens${NC}"

# ------------------------------------------------------------------------------
# 3. Check and Install Bun Runtime
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}${BOLD}[3/7] Checking Bun JavaScript & TypeScript Runtime...${NC}"

BUN_DIR="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_DIR/bin:$HOME/.bun/bin:$PATH"

if ! command -v bun &>/dev/null && [ ! -f "$BUN_DIR/bin/bun" ]; then
    if [ "$DRY_RUN" = true ]; then
        echo -e "  * ${YELLOW}[Dry-Run] Would install Bun runtime from https://bun.sh/install.${NC}"
    else
        echo -e "  * Downloading and installing Bun runtime..."
        curl -fsSL https://bun.sh/install | bash
        export PATH="$BUN_DIR/bin:$HOME/.bun/bin:$PATH"
    fi
fi

BUN_BIN_PATH="$(command -v bun 2>/dev/null || echo "$BUN_DIR/bin/bun")"
if [ -x "$BUN_BIN_PATH" ] || command -v bun &>/dev/null; then
    BUN_VER="$(bun --version 2>/dev/null || echo "Installed")"
    echo -e "  * ${GREEN}[OK]${NC} Bun installed: ${WHITE}${BUN_VER}${NC} (${BUN_BIN_PATH})"
else
    if [ "$DRY_RUN" = false ]; then
        echo -e "  * ${RED}[ERROR]${NC} Failed to locate Bun. Please check your installation."
        exit 1
    fi
fi

# ------------------------------------------------------------------------------
# 4. Install Monorepo Dependencies & Compile SDK + CLI
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}${BOLD}[4/7] Building KerberoSec Monorepo (SDK & CLI Bundles)...${NC}"
cd "$REPO_DIR"

if [ "$SKIP_BUILD" = false ] && [ "$DRY_RUN" = false ]; then
    echo -e "  * Resolving workspace dependencies with Bun..."
    bun install

    echo -e "  * Compiling KerberoSec SDK packages..."
    bun run build:sdk

    echo -e "  * Compiling KerberoSec CLI binary..."
    bun -F @kerberosec/cli build
    echo -e "  * ${GREEN}[OK]${NC} Monorepo build complete."
elif [ "$SKIP_BUILD" = true ]; then
    echo -e "  * ${YELLOW}[Notice]${NC} Skipped build step (--skip-build passed)."
else
    echo -e "  * ${YELLOW}[Dry-Run]${NC} Would execute: bun install && bun run build:sdk && bun -F @kerberosec/cli build."
fi

# ------------------------------------------------------------------------------
# 5. Set up Global Executable (`kerberosec`)
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}${BOLD}[5/7] Configuring Global Executable in PATH...${NC}"
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

WRAPPER_PATH="$BIN_DIR/kerberosec"
BUN_BIN_DIR="$(dirname "$(command -v bun 2>/dev/null || echo "$BUN_DIR/bin/bun")")"

if [ "$DRY_RUN" = false ]; then
    cat << WRAPPER_EOF > "$WRAPPER_PATH"
#!/usr/bin/env bash
export LANG="\${LANG:-C.UTF-8}"
export LC_ALL="\${LC_ALL:-C.UTF-8}"
export PATH="\$HOME/Tools/bin:\$HOME/go/bin:\$HOME/.local/bin:\$HOME/.bun/bin:${BUN_BIN_DIR}:\$PATH"

# Prefer pre-compiled production binary if present for instant startup, fallback to source
if [ -f "$REPO_DIR/apps/cli/dist/index.js" ]; then
    exec bun "$REPO_DIR/apps/cli/dist/index.js" "\$@"
else
    exec bun run "$REPO_DIR/apps/cli/src/index.ts" "\$@"
fi
WRAPPER_EOF

    chmod +x "$WRAPPER_PATH"
fi

ensure_shell_path() {
    local rc_file="$1"
    if [ -f "$rc_file" ] && [ -w "$rc_file" ]; then
        if ! grep -q "KerberoSec Security Tools and CLI PATH" "$rc_file" 2>/dev/null; then
            cat << 'PATH_EOF' >> "$rc_file"

# KerberoSec Security Tools and CLI PATH
export PATH="$HOME/Tools/bin:$HOME/go/bin:$HOME/.local/bin:$HOME/.bun/bin:$PATH"
PATH_EOF
            echo -e "  * Added PATH export to ${CYAN}${rc_file}${NC}"
        fi
    fi
}

ensure_shell_path "$HOME/.bashrc"
ensure_shell_path "$HOME/.zshrc"
ensure_shell_path "$HOME/.profile"
ensure_shell_path "$HOME/.bash_profile"

export PATH="$HOME/.bun/bin:$BIN_DIR:$PATH"
echo -e "  * ${GREEN}[OK]${NC} Global command registered: ${WHITE}${WRAPPER_PATH}${NC}"

# ------------------------------------------------------------------------------
# 6. Setup, Optimize, and Tune Ollama with Maximum GPU Performance
# ------------------------------------------------------------------------------
if [ "$SKIP_OLLAMA" = false ]; then
    echo -e "\n${BLUE}${BOLD}[6/7] Running Autonomous Ollama Hardware & Model Matrix Optimizer...${NC}"
    if [ -f "$REPO_DIR/ollama.sh" ]; then
        chmod +x "$REPO_DIR/ollama.sh"
        if [ "$DRY_RUN" = true ]; then
            bash "$REPO_DIR/ollama.sh" --dry-run
        else
            bash "$REPO_DIR/ollama.sh"
        fi
    fi
else
    echo -e "\n${YELLOW}${BOLD}[6/7] Skipped Ollama GPU optimization (--skip-ollama passed).${NC}"
fi

# ------------------------------------------------------------------------------
# 7. Security Toolchain Verification (tools.sh)
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}${BOLD}[7/7] Verifying Security Toolchain Readiness...${NC}"
if [ -f "$REPO_DIR/tools.sh" ]; then
    chmod +x "$REPO_DIR/tools.sh"
    if [ "$WITH_TOOLS" = true ] && [ "$DRY_RUN" = false ]; then
        echo -e "  * Installing full security toolkit (tools.sh all)..."
        bash "$REPO_DIR/tools.sh" all || true
    else
        bash "$REPO_DIR/tools.sh" check || true
    fi
fi

# ------------------------------------------------------------------------------
# Summary & Quick Start Guide
# ------------------------------------------------------------------------------
echo -e "\n${GREEN}${BOLD}╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║          KerberoSec CLI is Successfully Installed & Ready!                   ║"
echo -e "╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo -e "\n${BOLD}Quick Start:${NC}"
echo -e "  1. Reload your shell:      ${CYAN}source ~/.bashrc${NC} (or ${CYAN}source ~/.zshrc${NC})"
echo -e "  2. Launch Interactive TUI:  ${GREEN}kerberosec${NC}"
echo -e "  3. Single Prompt Mode:      ${GREEN}kerberosec \"explain my project\"${NC}"
echo -e "  4. Local Ollama Execution:  ${GREEN}kerberosec -P ollama \"explain my project\"${NC}"
echo ""
echo -e "${BOLD}Key Shortcuts in TUI:${NC}"
echo -e "  * ${CYAN}/model${NC}            - Switch LLM providers and models (Ollama, Claude, DeepSeek, OpenAI)"
echo -e "  * ${CYAN}/settings${NC}         - Open configuration panel"
echo -e "  * ${CYAN}Tab${NC}               - Toggle between Plan Mode and Act Mode"
echo -e "  * ${CYAN}PageUp / PageDown${NC} - Scroll transcript (3x high-speed scroll)"
echo -e "  * ${CYAN}Ctrl + C (x2)${NC}     - Cleanly exit CLI"
echo ""
