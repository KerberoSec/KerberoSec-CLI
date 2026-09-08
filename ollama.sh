#!/usr/bin/env bash

# ==============================================================================
# KerberoSec CLI - Autonomous Ollama Performance & Model Matrix Optimizer
# ==============================================================================
# Author: Arun Kumar (https://github.com/KerberoSec)
# Repository: https://github.com/KerberoSec/KerberoSec-CLI
#
# PURPOSE & ARCHITECTURE OVERVIEW:
# Comprehensive cross-platform hardware detection and configuration optimizer
# for local Ollama runtimes. Autonomously calibrates:
#   * Up to 100% GPU Layer Offloading (NVIDIA CUDA, Apple Metal, AMD ROCm, Intel Arc)
#   * Physical CPU core binding and OpenMP/MKL thread scheduling
#   * Flash Attention v2 (with microarchitecture compatibility gating)
#   * Q4_0 KV-Cache quantization
#   * Dynamic context window allocation matched to hardware VRAM/RAM capacity
#   * Safe model tuning preserving base templates and tool-calling capabilities
#   * Zero destructive purges: protects all existing user models
#
# Supported Platforms & Operating Systems:
#   - Linux: Debian, Ubuntu, Kali, Parrot, Mint, Arch, Manjaro, Fedora, RHEL,
#            CentOS, Rocky, Alma, openSUSE, Alpine, Gentoo, Void, NixOS, WSL2
#   - macOS: Apple Silicon (M1/M2/M3/M4, Pro, Max, Ultra) & Intel x86_64
#   - Windows: Windows Terminal, PowerShell, MSYS2, Git Bash, WSL2
#   - Single Board Computers & ARM64: Raspberry Pi 4/5, Jetson Nano/Orin, Orange Pi
# ==============================================================================

set -e

# Temporary workspace cleanup on exit or interrupt
TMP_DIR=""
cleanup() {
    if [ -n "$TMP_DIR" ] && [ -d "$TMP_DIR" ]; then
        rm -rf "$TMP_DIR" 2>/dev/null || true
    fi
}
trap cleanup EXIT INT TERM

for arg in "$@"; do
    case "$arg" in
        --help|-h)
            echo "KerberoSec Autonomous Ollama Performance & Model Matrix Optimizer"
            echo "Usage: ./ollama.sh [options]"
            echo ""
            echo "Options:"
            echo "  --help, -h       Display this help message and exit"
            echo "  --dry-run        Inspect hardware and display tuning matrix without applying changes"
            exit 0
            ;;
        --dry-run)
            DRY_RUN=true
            ;;
    esac
done
DRY_RUN="${DRY_RUN:-false}"

# Terminal styling & color palette
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║          KerberoSec Autonomous Ollama GPU & Model Matrix Optimizer           ║"
echo "║      Universal Platform & Hardware Tuning Engine (All Systems & Laptops)     ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ==============================================================================
# SECTION 0: CROSS-PLATFORM OS DETECTION, PREREQUISITES & RUNTIME SETUP
# ==============================================================================
echo -e "${BLUE}${BOLD}[1/6] Detecting Platform, Operating System & Package Manager...${NC}"

OS_NAME="$(uname -s 2>/dev/null || echo "Unknown")"
OS_ARCH="$(uname -m 2>/dev/null || echo "Unknown")"
DISTRO_NAME="Generic"
PKG_MANAGER="none"
IS_WSL=false

SUDO_CMD=""
if [ "$EUID" -ne 0 ] && command -v sudo &>/dev/null; then
    SUDO_CMD="sudo"
fi

CAN_SUDO=false
if [ "$EUID" -eq 0 ]; then
    CAN_SUDO=true
elif command -v sudo &>/dev/null && sudo -n true 2>/dev/null; then
    CAN_SUDO=true
fi

case "$OS_NAME" in
    Linux*)
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO_NAME="${NAME:-Linux}"
        fi

        # Check for Windows Subsystem for Linux (WSL / WSL2)
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
        PKG_MANAGER="brew"
        ;;
    CYGWIN*|MINGW*|MSYS*|Windows_NT*)
        DISTRO_NAME="Windows ($OS_NAME)"
        if command -v winget &>/dev/null; then PKG_MANAGER="winget";
        elif command -v choco &>/dev/null; then PKG_MANAGER="choco";
        elif command -v scoop &>/dev/null; then PKG_MANAGER="scoop";
        fi
        ;;
    FreeBSD*|OpenBSD*|NetBSD*)
        DISTRO_NAME="BSD ($OS_NAME)"
        if command -v pkg &>/dev/null; then PKG_MANAGER="pkg"; fi
        ;;
    *)
        DISTRO_NAME="$OS_NAME ($OS_ARCH)"
        ;;
esac

echo -e "  * Platform:          ${WHITE}${DISTRO_NAME}${NC} (${OS_ARCH})"
echo -e "  * Package Manager:   ${CYAN}${PKG_MANAGER}${NC}"

# Check base tools: curl, jq, procps, pciutils
OLLAMA_PREREQS=()
for t in curl jq; do
    if ! command -v "$t" &>/dev/null; then
        OLLAMA_PREREQS+=("$t")
    fi
done
if ! command -v ps &>/dev/null; then
    OLLAMA_PREREQS+=("procps")
fi
if [ "$OS_NAME" = "Linux" ] && ! command -v lspci &>/dev/null; then
    OLLAMA_PREREQS+=("pciutils")
fi

if [ ${#OLLAMA_PREREQS[@]} -gt 0 ] && [ "$DRY_RUN" = false ]; then
    echo -e "  * Installing missing utilities: ${OLLAMA_PREREQS[*]}..."
    case "$PKG_MANAGER" in
        apt)
            export DEBIAN_FRONTEND=noninteractive
            $SUDO_CMD apt-get update -y -qq 2>/dev/null || true
            $SUDO_CMD apt-get install -y -qq curl jq procps pciutils 2>/dev/null || true
            ;;
        pacman)
            $SUDO_CMD pacman -Sy --noconfirm --needed curl jq procps-ng pciutils 2>/dev/null || true
            ;;
        dnf|yum)
            $SUDO_CMD "$PKG_MANAGER" install -y curl jq procps-ng pciutils 2>/dev/null || true
            ;;
        zypper)
            $SUDO_CMD zypper --non-interactive install curl jq procps pciutils 2>/dev/null || true
            ;;
        apk)
            $SUDO_CMD apk add --no-cache curl jq procps pciutils 2>/dev/null || true
            ;;
        brew)
            brew install curl jq 2>/dev/null || true
            ;;
    esac
fi

# Ensure Ollama binary is on PATH
export PATH="/usr/local/bin:/usr/bin:$HOME/.local/bin:$PATH"

if ! command -v ollama &>/dev/null; then
    if [ "$DRY_RUN" = true ]; then
        echo -e "  * ${YELLOW}[Dry-Run]${NC} Ollama not installed. Would install Ollama runtime."
    else
        echo -e "  * Ollama not found. Installing official Ollama runtime for ${DISTRO_NAME}..."
        case "$OS_NAME" in
            Linux*)
                curl -fsSL https://ollama.com/install.sh | sh || true
                ;;
            Darwin*)
                if command -v brew &>/dev/null; then
                    brew install ollama || true
                else
                    curl -fsSL https://ollama.com/download/Ollama-darwin.zip -o /tmp/Ollama-darwin.zip || true
                    unzip -q /tmp/Ollama-darwin.zip -d /Applications 2>/dev/null || true
                fi
                ;;
            CYGWIN*|MINGW*|MSYS*|Windows_NT*)
                if command -v winget &>/dev/null; then
                    winget install -e --id Ollama.Ollama --accept-source-agreements --accept-package-agreements || true
                elif command -v choco &>/dev/null; then
                    choco install -y ollama || true
                fi
                ;;
        esac
        export PATH="/usr/local/bin:/usr/bin:$HOME/.local/bin:$PATH"
    fi
fi

if ! command -v ollama &>/dev/null && [ "$DRY_RUN" = false ]; then
    echo -e "  * ${YELLOW}[Notice] Ollama binary is not currently installed or in PATH.${NC}"
    echo -e "  * Skipping local model calibration. KerberoSec CLI is fully installed and ready for cloud providers."
    exit 0
fi

# ==============================================================================
# SECTION 1: DEEP HARDWARE TOPOLOGY, ACCELERATOR & MEMORY PROBING
# ==============================================================================
echo -e "\n${BLUE}${BOLD}[2/6] Probing System Hardware, GPU Cores & Memory Bandwidth...${NC}"

# 1. CPU Core Topology & Architecture
TOTAL_LOGICAL_CORES=4
PHYSICAL_CORES=4

if [ "$OS_NAME" = "Darwin" ]; then
    TOTAL_LOGICAL_CORES=$(sysctl -n hw.logicalcpu 2>/dev/null || echo "4")
    PHYSICAL_CORES=$(sysctl -n hw.physicalcpu 2>/dev/null || echo "$TOTAL_LOGICAL_CORES")
elif command -v lscpu &>/dev/null; then
    TOTAL_LOGICAL_CORES=$(nproc 2>/dev/null || echo "4")
    PHYSICAL_CORES=$(lscpu -p 2>/dev/null | grep -E -v '^#' | sort -u -t, -k 2,2 | wc -l 2>/dev/null || echo "$TOTAL_LOGICAL_CORES")
else
    TOTAL_LOGICAL_CORES=$(nproc 2>/dev/null || echo "4")
    PHYSICAL_CORES="$TOTAL_LOGICAL_CORES"
fi

PHYSICAL_CORES=$(echo "$PHYSICAL_CORES" | tr -cd '0-9')
TOTAL_LOGICAL_CORES=$(echo "$TOTAL_LOGICAL_CORES" | tr -cd '0-9')
PHYSICAL_CORES=${PHYSICAL_CORES:-4}
TOTAL_LOGICAL_CORES=${TOTAL_LOGICAL_CORES:-4}
if [ "$PHYSICAL_CORES" -le 0 ]; then PHYSICAL_CORES=4; fi
if [ "$TOTAL_LOGICAL_CORES" -le 0 ]; then TOTAL_LOGICAL_CORES=4; fi

echo -e "  * CPU Architecture:  ${WHITE}${PHYSICAL_CORES} Physical Cores${NC} (${TOTAL_LOGICAL_CORES} Logical Threads)"

# 2. Host System RAM
TOTAL_RAM_MB=8192
if [ "$OS_NAME" = "Darwin" ]; then
    BYTES=$(sysctl -n hw.memsize 2>/dev/null || echo "8589934592")
    TOTAL_RAM_MB=$((BYTES / 1024 / 1024))
elif command -v free &>/dev/null; then
    TOTAL_RAM_MB=$(free -m 2>/dev/null | awk '/^Mem:/{print $2}' || echo "8192")
elif [ -f /proc/meminfo ]; then
    TOTAL_RAM_MB=$(grep MemTotal /proc/meminfo 2>/dev/null | awk '{print int($2/1024)}' || echo "8192")
fi

TOTAL_RAM_MB=$(echo "$TOTAL_RAM_MB" | tr -cd '0-9')
TOTAL_RAM_MB=${TOTAL_RAM_MB:-8192}
if [ "$TOTAL_RAM_MB" -le 0 ]; then TOTAL_RAM_MB=8192; fi
TOTAL_RAM_GB=$(awk "BEGIN {printf \"%.1f\", $TOTAL_RAM_MB/1024}")
echo -e "  * System Host RAM:   ${WHITE}${TOTAL_RAM_MB} MB (${TOTAL_RAM_GB} GB)${NC}"

# 3. Hardware Accelerators Probing (NVIDIA CUDA, Apple Metal, AMD ROCm, Intel Arc)
HAS_NVIDIA=false
HAS_AMD=false
HAS_APPLE=false
HAS_INTEL_ARC=false
FLASH_ATTN_CAPABLE=false
GPU_NAME="Integrated CPU / System Memory"
VRAM_MB=0
CUDA_COMPUTE_CAP=""

# Probe NVIDIA CUDA (check standard and WSL paths)
NVIDIA_SMI=""
for cand in "nvidia-smi" "/usr/lib/wsl/lib/nvidia-smi" "/usr/bin/nvidia-smi" "/usr/local/cuda/bin/nvidia-smi" "/mnt/c/Windows/System32/nvidia-smi.exe"; do
    if command -v "$cand" &>/dev/null; then
        NVIDIA_SMI="$cand"
        break
    fi
done

if [ -n "$NVIDIA_SMI" ]; then
    NVIDIA_INFO=$($NVIDIA_SMI --query-gpu=name,memory.total,compute_cap --format=csv,noheader,nounits 2>/dev/null | head -n 1 || true)
    if [ -n "$NVIDIA_INFO" ]; then
        GPU_NAME=$(echo "$NVIDIA_INFO" | cut -d',' -f1 | xargs)
        RAW_VRAM=$(echo "$NVIDIA_INFO" | cut -d',' -f2 | tr -cd '0-9')
        VRAM_MB=${RAW_VRAM:-0}
        CUDA_COMPUTE_CAP=$(echo "$NVIDIA_INFO" | cut -d',' -f3 | xargs || true)
        HAS_NVIDIA=true
        CUDA_VER=$($NVIDIA_SMI 2>/dev/null | grep -o "CUDA Version: [0-9.]*" | head -n 1 || echo "CUDA Active")

        # Flash Attention v2 requires Turing (7.5), Ampere (8.0/8.6), Ada (8.9), or Hopper/Blackwell (9.0+)
        # On older Pascal (6.x) or Maxwell (5.x) GPUs (e.g. GTX 1050/1060, MX150/MX250), FA2 is disabled to prevent CUDA errors
        COMPUTE_NUM=$(echo "$CUDA_COMPUTE_CAP" | tr -d '.')
        if [ -n "$COMPUTE_NUM" ] && [ "$COMPUTE_NUM" -ge 75 ]; then
            FLASH_ATTN_CAPABLE=true
        fi

        echo -e "  * GPU Accelerator:   ${GREEN}${GPU_NAME}${NC} (VRAM: ${GREEN}${VRAM_MB} MB${NC}, ${CYAN}${CUDA_VER}${NC})"
    fi
elif command -v lspci &>/dev/null; then
    NVIDIA_PCI=$(lspci 2>/dev/null | grep -iE "vga|3d|display" | grep -i "NVIDIA" || true)
    if [ -n "$NVIDIA_PCI" ]; then
        HAS_NVIDIA=true
        GPU_NAME=$(echo "$NVIDIA_PCI" | head -n 1 | sed -E 's/^[0-9a-fA-F:.]+\s+[^:]+:\s*//')
        CUDA_VER="NVIDIA PCI (Driver Setup Required)"
        echo -e "  * GPU Accelerator:   ${GREEN}${GPU_NAME}${NC} (${CYAN}${CUDA_VER}${NC})"
    fi
fi

# Probe Apple Silicon Metal (M1, M2, M3, M4)
if [ "$HAS_NVIDIA" = false ] && [ "$OS_NAME" = "Darwin" ]; then
    CHIP_INFO=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "")
    if echo "$CHIP_INFO" | grep -qi "Apple"; then
        HAS_APPLE=true
        FLASH_ATTN_CAPABLE=true
        GPU_NAME="Apple Metal Unified Memory (${CHIP_INFO})"
        # Apple Silicon Metal can allocate up to 75% of unified memory for GPU VRAM
        VRAM_MB=$((TOTAL_RAM_MB * 75 / 100))
        echo -e "  * GPU Accelerator:   ${GREEN}${GPU_NAME}${NC} (Effective Unified VRAM: ${GREEN}${VRAM_MB} MB${NC})"
    fi
fi

# Probe AMD ROCm & AMD Radeon / APU Laptops
if [ "$HAS_NVIDIA" = false ] && [ "$HAS_APPLE" = false ]; then
    if command -v rocm-smi &>/dev/null; then
        HAS_AMD=true
        FLASH_ATTN_CAPABLE=true
        GPU_NAME="AMD ROCm GPU"
        ROCM_VRAM=$(rocm-smi --showmeminfo vram 2>/dev/null | awk '/VRAM Total Memory/{print $5}' | tr -cd '0-9' | head -n 1 || echo "")
        if [ -n "$ROCM_VRAM" ] && [ "$ROCM_VRAM" -gt 0 ]; then
            VRAM_MB=$((ROCM_VRAM / 1024 / 1024))
        fi
        echo -e "  * GPU Accelerator:   ${GREEN}${GPU_NAME}${NC} (ROCm VRAM: ${GREEN}${VRAM_MB} MB${NC})"
    elif command -v lspci &>/dev/null; then
        AMD_PCI=$(lspci 2>/dev/null | grep -iE "vga|3d|display" | grep -iE "AMD|Advanced Micro Devices|ATI|Radeon" || true)
        if [ -n "$AMD_PCI" ]; then
            HAS_AMD=true
            GPU_NAME=$(echo "$AMD_PCI" | head -n 1 | sed -E 's/^[0-9a-fA-F:.]+\s+[^:]+:\s*//')
            if [ -f /sys/class/drm/card0/device/mem_info_vram_total ]; then
                RAW_AMD_BYTES=$(cat /sys/class/drm/card0/device/mem_info_vram_total 2>/dev/null || echo "0")
                if [ "$RAW_AMD_BYTES" -gt 0 ] 2>/dev/null; then
                    VRAM_MB=$((RAW_AMD_BYTES / 1024 / 1024))
                fi
            elif [ -f /sys/class/drm/card1/device/mem_info_vram_total ]; then
                RAW_AMD_BYTES=$(cat /sys/class/drm/card1/device/mem_info_vram_total 2>/dev/null || echo "0")
                if [ "$RAW_AMD_BYTES" -gt 0 ] 2>/dev/null; then
                    VRAM_MB=$((RAW_AMD_BYTES / 1024 / 1024))
                fi
            fi

            if echo "$GPU_NAME" | grep -qiE "Radeon 680M|Radeon 780M|Radeon 890M|Vega|Integrated|APU|Barcelo|Rembrandt|Phoenix|Hawk"; then
                if [ "$VRAM_MB" -le 512 ]; then
                    VRAM_MB=$((TOTAL_RAM_MB / 4))
                    if [ "$VRAM_MB" -gt 4096 ]; then VRAM_MB=4096; fi
                fi
                echo -e "  * GPU Accelerator:   ${GREEN}${GPU_NAME}${NC} (AMD APU / Integrated VRAM: ~${GREEN}${VRAM_MB} MB${NC})"
            else
                if [ "$VRAM_MB" -eq 0 ]; then VRAM_MB=8192; fi
                echo -e "  * GPU Accelerator:   ${GREEN}${GPU_NAME}${NC} (AMD Radeon VRAM: ${GREEN}${VRAM_MB} MB${NC})"
            fi
        fi
    fi
fi

# Probe Intel Arc & Intel Core Ultra
if [ "$HAS_NVIDIA" = false ] && [ "$HAS_APPLE" = false ] && [ "$HAS_AMD" = false ]; then
    if command -v lspci &>/dev/null; then
        INTEL_GPU=$(lspci 2>/dev/null | grep -iE "vga|3d|display" | grep -i "Intel" || true)
        if echo "$INTEL_GPU" | grep -qiE "Arc|Meteor|Lunar|Xe"; then
            HAS_INTEL_ARC=true
            GPU_NAME="Intel Arc / Xe Graphics"
            echo -e "  * GPU Accelerator:   ${GREEN}${GPU_NAME}${NC} (OneAPI / Level Zero Compatible)"
        fi
    fi
fi

if [ "$HAS_NVIDIA" = false ] && [ "$HAS_APPLE" = false ] && [ "$HAS_AMD" = false ] && [ "$HAS_INTEL_ARC" = false ]; then
    echo -e "  * GPU Accelerator:   ${YELLOW}No dedicated GPU detected. Activating multi-threaded CPU acceleration.${NC}"
fi

# ==============================================================================
# SECTION 2: EXHAUSTIVE 12-TIER HARDWARE & CONTEXT BUDGET MATRIX
# ==============================================================================
echo -e "\n${BLUE}${BOLD}[3/6] Mapping Hardware Tier & Maximum Context Budget...${NC}"

# Detect if current model baseline already exists locally
MINIMUM_BASELINE_MODEL="qwen2.5-coder:1.5b"
if command -v ollama &>/dev/null && ollama list 2>/dev/null | grep -q "qwen3:1.7b"; then
    MINIMUM_BASELINE_MODEL="qwen3:1.7b"
fi

if [ "$HAS_NVIDIA" = true ] || [ "$HAS_APPLE" = true ] || [ "$HAS_AMD" = true ]; then
    if [ "$VRAM_MB" -ge 30000 ]; then
        # Tier 1: 32GB+ VRAM or 64GB+ Apple Silicon (RTX 4090, RTX 3090 dual, A100, M-Max/Ultra)
        RECOMMENDED_DEFAULT="qwen2.5-coder:32b"
        GLOBAL_MAX_CTX=131072
        NUM_BATCH=512
        TIER_LABEL="Tier 1 (32GB+ VRAM: 32B-70B Flagship Models, 128k Context)"
    elif [ "$VRAM_MB" -ge 22000 ]; then
        # Tier 2: 24GB VRAM or 36GB-48GB Apple Silicon (RTX 3090, RTX 4090, M2/M3/M4 Pro/Max)
        RECOMMENDED_DEFAULT="qwen2.5-coder:32b"
        GLOBAL_MAX_CTX=65536
        NUM_BATCH=512
        TIER_LABEL="Tier 2 (24GB VRAM: 32B Models, 64k Context)"
    elif [ "$VRAM_MB" -ge 14000 ]; then
        # Tier 3: 16GB VRAM or 24GB Apple Silicon (RTX 4080, RTX 4070 Ti Super, RX 7800 XT)
        RECOMMENDED_DEFAULT="qwen2.5-coder:14b"
        GLOBAL_MAX_CTX=65536
        NUM_BATCH=512
        TIER_LABEL="Tier 3 (16GB VRAM: 14B Models, 64k Context)"
    elif [ "$VRAM_MB" -ge 10000 ]; then
        # Tier 4: 12GB VRAM or 18GB Apple Silicon (RTX 4070 Desktop/Laptop, RTX 3060 12GB)
        RECOMMENDED_DEFAULT="qwen2.5-coder:14b"
        GLOBAL_MAX_CTX=32768
        NUM_BATCH=512
        TIER_LABEL="Tier 4 (12GB VRAM: 14B/7B Models, 32k Context)"
    elif [ "$VRAM_MB" -ge 7000 ]; then
        # Tier 5: 8GB VRAM or 16GB Apple Silicon (RTX 4060 Laptop, RTX 3070 Laptop, M-series 16GB)
        RECOMMENDED_DEFAULT="qwen2.5-coder:7b"
        GLOBAL_MAX_CTX=32768
        NUM_BATCH=512
        TIER_LABEL="Tier 5 (8GB VRAM: 7B Models, 32k Context)"
    elif [ "$VRAM_MB" -ge 5000 ]; then
        # Tier 6: 6GB VRAM Laptops (RTX 3060 Laptop, RTX 2060 Laptop, GTX 1660 Ti)
        RECOMMENDED_DEFAULT="qwen2.5-coder:7b"
        GLOBAL_MAX_CTX=16384
        NUM_BATCH=512
        TIER_LABEL="Tier 6 (6GB VRAM: 7B/3B Models, 16k Context)"
    elif [ "$VRAM_MB" -ge 3500 ]; then
        # Tier 7: 4GB VRAM Laptops (RTX 3050 Laptop, GTX 1650, 8GB Apple Silicon)
        RECOMMENDED_DEFAULT="qwen2.5-coder:3b"
        GLOBAL_MAX_CTX=8192
        NUM_BATCH=256
        TIER_LABEL="Tier 7 (4GB VRAM: 3B/1.5B Models, 8k Context)"
    else
        # Tier 8: 2GB VRAM Laptops (GeForce MX150, MX250, MX350, GTX 960M, GTX 1050 2GB)
        RECOMMENDED_DEFAULT="$MINIMUM_BASELINE_MODEL"
        GLOBAL_MAX_CTX=4096
        NUM_BATCH=128
        TIER_LABEL="Tier 8 (2GB VRAM: 1.5B/1.7B Baseline, 4k Context for 100% GPU Offload)"
    fi
else
    # CPU Execution Tiers scaled by Host System RAM
    if [ "$TOTAL_RAM_MB" -ge 32000 ]; then
        # Tier 9: CPU Workstation (32GB+ Host RAM)
        RECOMMENDED_DEFAULT="qwen2.5-coder:14b"
        GLOBAL_MAX_CTX=16384
        NUM_BATCH=256
        TIER_LABEL="Tier 9 (CPU Workstation: 32GB+ RAM, 14B/7B Model, 16k Context)"
    elif [ "$TOTAL_RAM_MB" -ge 15000 ]; then
        # Tier 10: Standard Office / Dev Laptop (16GB RAM)
        RECOMMENDED_DEFAULT="qwen2.5-coder:7b"
        GLOBAL_MAX_CTX=8192
        NUM_BATCH=256
        TIER_LABEL="Tier 10 (CPU Laptop: 16GB RAM, 7B/1.5B Model, 8k Context)"
    elif [ "$TOTAL_RAM_MB" -ge 7000 ]; then
        # Tier 11: Budget PC / Laptop (8GB RAM)
        RECOMMENDED_DEFAULT="$MINIMUM_BASELINE_MODEL"
        GLOBAL_MAX_CTX=4096
        NUM_BATCH=128
        TIER_LABEL="Tier 11 (CPU Everyday: 8GB RAM, 1.5B Baseline, 4k Context)"
    else
        # Tier 12: Low-Spec Systems & SBCs (<8GB RAM, Raspberry Pi, Jetson)
        RECOMMENDED_DEFAULT="$MINIMUM_BASELINE_MODEL"
        GLOBAL_MAX_CTX=2048
        NUM_BATCH=128
        TIER_LABEL="Tier 12 (Low-Spec / SBC: <8GB RAM, 1.5B/0.5B Model, 2k Context)"
    fi
fi

echo -e "  * Hardware Profile:  ${MAGENTA}${TIER_LABEL}${NC}"
echo -e "  * Scaled Default:    ${GREEN}${RECOMMENDED_DEFAULT}${NC}"
echo -e "  * Baseline Minimum:  ${GREEN}${MINIMUM_BASELINE_MODEL}${NC}"
echo -e "  * Calibrated Context:${GREEN}${GLOBAL_MAX_CTX} tokens${NC}"
echo -e "  * Evaluation Batch:  ${GREEN}${NUM_BATCH}${NC}"

# Persist hardware-calibrated context for KerberoSec CLI
mkdir -p "$HOME/.kerberosec" 2>/dev/null || true
echo "$GLOBAL_MAX_CTX" > "$HOME/.kerberosec/ollama_num_ctx" 2>/dev/null || true

# ==============================================================================
# SECTION 3: SYSTEM KERNEL, SERVICE & DAEMON ACCELERATION
# ==============================================================================
echo -e "\n${BLUE}${BOLD}[4/6] Configuring System Environment & Service Acceleration...${NC}"

# Set Flash Attention and KV Cache according to hardware compatibility
# llama-server requires flash_attn for KV cache quantization (q4_0).
# If flash attention is not supported (CPU or older GPUs), setting OLLAMA_KV_CACHE_TYPE=q4_0
# causes "llama_init_from_model: V cache quantization requires flash_attn" and crashes.
if [ "$FLASH_ATTN_CAPABLE" = true ]; then
    FLASH_ATTN_VAL=1
    export OLLAMA_FLASH_ATTENTION=1
    export OLLAMA_KV_CACHE_TYPE=q4_0
    KV_CACHE_SHELL_EXPORT="export OLLAMA_KV_CACHE_TYPE=q4_0"
    KV_CACHE_SYSTEMD_LINE="Environment=\"OLLAMA_KV_CACHE_TYPE=q4_0\""
else
    FLASH_ATTN_VAL=0
    export OLLAMA_FLASH_ATTENTION=0
    unset OLLAMA_KV_CACHE_TYPE 2>/dev/null || true
    KV_CACHE_SHELL_EXPORT="# OLLAMA_KV_CACHE_TYPE unset (requires flash_attn)"
    KV_CACHE_SYSTEMD_LINE="# OLLAMA_KV_CACHE_TYPE omitted (requires flash_attn)"
fi

export OLLAMA_NUM_PARALLEL=1
export OLLAMA_KEEP_ALIVE=24h
export OLLAMA_GPU_OVERHEAD=0
export OLLAMA_HOST="${OLLAMA_HOST:-127.0.0.1:11434}"
export OLLAMA_ORIGINS="*"
export OLLAMA_NUM_CTX=${GLOBAL_MAX_CTX}
export OMP_NUM_THREADS=${PHYSICAL_CORES}
export MKL_NUM_THREADS=${PHYSICAL_CORES}

if [ "$HAS_NVIDIA" = true ]; then
    export CUDA_VISIBLE_DEVICES="${CUDA_VISIBLE_DEVICES:-0}"
    export CUDA_LAUNCH_BLOCKING=0
    export CUDA_DEVICE_ORDER=PCI_BUS_ID
fi

if [ "$HAS_AMD" = true ]; then
    export HSA_OVERRIDE_GFX_VERSION="${HSA_OVERRIDE_GFX_VERSION:-10.3.0}"
fi

# Persist environment variables in user shell profiles
persist_shell_env() {
    local target_rc="$1"
    if [ -f "$target_rc" ] && [ -w "$target_rc" ]; then
        # If flash attention is not supported, clean up any previous buggy q4_0 exports
        if [ "$FLASH_ATTN_CAPABLE" = false ]; then
            sed -i '/OLLAMA_KV_CACHE_TYPE/d' "$target_rc" 2>/dev/null || true
        fi
        if ! grep -q "OLLAMA_FLASH_ATTENTION" "$target_rc" 2>/dev/null; then
            cat << ENV_BLOCK >> "$target_rc"

# --- KerberoSec Ollama Hardware Acceleration ---
export OLLAMA_FLASH_ATTENTION=${FLASH_ATTN_VAL}
${KV_CACHE_SHELL_EXPORT}
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_KEEP_ALIVE=24h
export OLLAMA_GPU_OVERHEAD=0
export OLLAMA_HOST="${OLLAMA_HOST:-127.0.0.1:11434}"
export OLLAMA_ORIGINS="*"
export OLLAMA_NUM_CTX=${GLOBAL_MAX_CTX}
export OMP_NUM_THREADS=${PHYSICAL_CORES}
export MKL_NUM_THREADS=${PHYSICAL_CORES}
# -----------------------------------------------
ENV_BLOCK
            echo -e "  * Persisted environment exports to ${CYAN}${target_rc}${NC}"
        fi
    fi
}

persist_shell_env "$HOME/.bashrc"
persist_shell_env "$HOME/.zshrc"
persist_shell_env "$HOME/.profile"

# Configure Linux systemd override if active
SERVICE_DROPIN_DIR="/etc/systemd/system/ollama.service.d"
if [ -d "/etc/systemd/system" ] && command -v systemctl &>/dev/null && [ "$CAN_SUDO" = true ] && [ "$DRY_RUN" = false ]; then
    $SUDO_CMD mkdir -p "$SERVICE_DROPIN_DIR" 2>/dev/null || true
    $SUDO_CMD tee "$SERVICE_DROPIN_DIR/override.conf" >/dev/null << SERVICE_EOF
[Service]
Environment="OLLAMA_FLASH_ATTENTION=${FLASH_ATTN_VAL}"
${KV_CACHE_SYSTEMD_LINE}
Environment="OLLAMA_NUM_PARALLEL=1"
Environment="OLLAMA_KEEP_ALIVE=24h"
Environment="OLLAMA_GPU_OVERHEAD=0"
Environment="OLLAMA_HOST=127.0.0.1:11434"
Environment="OLLAMA_ORIGINS=*"
Environment="OLLAMA_NUM_CTX=${GLOBAL_MAX_CTX}"
Environment="OMP_NUM_THREADS=${PHYSICAL_CORES}"
Environment="MKL_NUM_THREADS=${PHYSICAL_CORES}"
SERVICE_EOF
    $SUDO_CMD systemctl daemon-reload 2>/dev/null || true
    $SUDO_CMD systemctl restart ollama 2>/dev/null || true
    echo -e "  * ${GREEN}[OK]${NC} Configured systemd override with hardware acceleration."
    sleep 2
fi

# Ensure Ollama server is responding
check_server_ready() {
    curl -s --connect-timeout 2 "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1
}

if ! check_server_ready && [ "$DRY_RUN" = false ]; then
    echo -e "  * Starting Ollama service/daemon..."
    if command -v systemctl &>/dev/null && [ "$CAN_SUDO" = true ]; then
        $SUDO_CMD systemctl start ollama 2>/dev/null || true
    fi

    # Give systemd up to 5 seconds to bind before attempting manual nohup
    ATTEMPTS=0
    while ! check_server_ready && [ $ATTEMPTS -lt 5 ]; do
        sleep 1
        ATTEMPTS=$((ATTEMPTS + 1))
    done

    if ! check_server_ready; then
        nohup ollama serve >/dev/null 2>&1 &
    fi

    ATTEMPTS=0
    MAX_ATTEMPTS=15
    while ! check_server_ready && [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
        sleep 1
        ATTEMPTS=$((ATTEMPTS + 1))
    done

    if check_server_ready; then
        echo -e "  * ${GREEN}[OK]${NC} Ollama daemon is active and responding."
    else
        echo -e "  * ${YELLOW}[!]${NC} Ollama server did not respond within ${MAX_ATTEMPTS}s. Continuing..."
    fi
else
    echo -e "  * ${GREEN}[OK]${NC} Ollama daemon is active and responding."
fi

# ==============================================================================
# SECTION 4: SAFE SCAN & MODEL PARAMETER TUNING (ALL PLATFORMS)
# ==============================================================================
echo -e "\n${BLUE}${BOLD}[5/6] Scanning and Optimizing Installed Models in Ollama...${NC}"

INSTALLED_MODELS=$(ollama list 2>/dev/null | awk 'NR>1 && $1 !~ /^(NAME|ID)/ {print $1}' | grep -v '^$' || true)

# Pull recommended model if no models are installed
if [ -z "$INSTALLED_MODELS" ] && [ "$DRY_RUN" = false ]; then
    echo -e "  * No models found in Ollama. Pulling recommended model: ${CYAN}${RECOMMENDED_DEFAULT}${NC}..."
    if ! ollama pull "$RECOMMENDED_DEFAULT"; then
        echo -e "  * ${YELLOW}[!] Could not pull ${RECOMMENDED_DEFAULT}. Pulling baseline fallback: ${MINIMUM_BASELINE_MODEL}${NC}..."
        ollama pull "$MINIMUM_BASELINE_MODEL" || true
    fi
    INSTALLED_MODELS=$(ollama list 2>/dev/null | awk 'NR>1 && $1 !~ /^(NAME|ID)/ {print $1}' | grep -v '^$' || true)
fi

echo -e "  * Found model(s) to optimize:"
for m in $INSTALLED_MODELS; do
    echo -e "    • ${CYAN}${m}${NC}"
done
echo ""

if [ "$DRY_RUN" = false ]; then
    TMP_DIR=$(mktemp -d /tmp/kerberosec-ollama.XXXXXX 2>/dev/null || mktemp -d)

    for MODEL_NAME in $INSTALLED_MODELS; do
        echo -e "  * [Tuning] ${BOLD}${WHITE}${MODEL_NAME}${NC}..."
        MODEL_LOWER=$(echo "$MODEL_NAME" | tr '[:upper:]' '[:lower:]')

        # Compute model-specific context window respecting hardware headroom
        MODEL_CTX=$GLOBAL_MAX_CTX

        if [ "$HAS_NVIDIA" = true ] && [ "$VRAM_MB" -lt 3500 ]; then
            # 2GB GPUs (MX150/MX250/MX350/GTX 1050 2GB): cap at 4096 to prevent CPU thrashing
            MODEL_CTX=4096
        elif [[ "$MODEL_LOWER" =~ "1.5b" ]] || [[ "$MODEL_LOWER" =~ "1.7b" ]] || [[ "$MODEL_LOWER" =~ "0.5b" ]]; then
            if [ "$VRAM_MB" -ge 4000 ]; then
                MODEL_CTX=16384
            else
                MODEL_CTX=4096
            fi
        elif [[ "$MODEL_LOWER" =~ "3b" ]] || [[ "$MODEL_LOWER" =~ "4b" ]] || [[ "$MODEL_LOWER" =~ "3.8b" ]]; then
            if [ "$VRAM_MB" -ge 6000 ]; then
                MODEL_CTX=32768
            elif [ "$VRAM_MB" -ge 3500 ]; then
                MODEL_CTX=8192
            else
                MODEL_CTX=4096
            fi
        elif [[ "$MODEL_LOWER" =~ "7b" ]] || [[ "$MODEL_LOWER" =~ "8b" ]] || [[ "$MODEL_LOWER" =~ "9b" ]]; then
            if [ "$VRAM_MB" -ge 12000 ]; then
                MODEL_CTX=65536
            elif [ "$VRAM_MB" -ge 7000 ]; then
                MODEL_CTX=32768
            elif [ "$VRAM_MB" -ge 5000 ]; then
                MODEL_CTX=16384
            else
                MODEL_CTX=8192
            fi
        elif [[ "$MODEL_LOWER" =~ "14b" ]] || [[ "$MODEL_LOWER" =~ "12b" ]] || [[ "$MODEL_LOWER" =~ "13b" ]] || [[ "$MODEL_LOWER" =~ "16b" ]]; then
            if [ "$VRAM_MB" -ge 20000 ]; then
                MODEL_CTX=65536
            elif [ "$VRAM_MB" -ge 10000 ]; then
                MODEL_CTX=32768
            else
                MODEL_CTX=16384
            fi
        elif [[ "$MODEL_LOWER" =~ "32b" ]] || [[ "$MODEL_LOWER" =~ "34b" ]] || [[ "$MODEL_LOWER" =~ "70b" ]] || [[ "$MODEL_LOWER" =~ "72b" ]]; then
            if [ "$VRAM_MB" -ge 30000 ]; then
                MODEL_CTX=131072
            elif [ "$VRAM_MB" -ge 22000 ]; then
                MODEL_CTX=65536
            else
                MODEL_CTX=32768
            fi
        fi

        # Determine GPU offload layer count based on hardware capability
        GPU_LAYERS=0
        if [ "$HAS_NVIDIA" = true ] || [ "$HAS_AMD" = true ] || [ "$HAS_APPLE" = true ]; then
            GPU_LAYERS=999
        fi

        # Scale predict tokens to prevent context window saturation
        PREDICT_TOKENS=4096
        if [ "$MODEL_CTX" -le 4096 ]; then
            PREDICT_TOKENS=2048
        fi

        # Unload active instance before rebuilding
        curl -s http://127.0.0.1:11434/api/generate -d "{\"model\": \"${MODEL_NAME}\", \"keep_alive\": 0}" >/dev/null 2>&1 || true

        # Generate tuning Modelfile
        # Note: We tune runtime hardware parameters (layers, context, threads, batch)
        # without baking a static SYSTEM prompt or clobbering the base model's native template.
        # This allows KerberoSec CLI to inject its full dynamic system prompt and tool definitions at runtime.
        TMP_MODELFILE="$TMP_DIR/Modelfile.${MODEL_NAME//[:\/]/_}"

        cat << MODEL_CONF_EOF > "$TMP_MODELFILE"
FROM ${MODEL_NAME}

# Maximum Hardware Acceleration & Thread Scheduling
PARAMETER num_gpu ${GPU_LAYERS}
PARAMETER num_ctx ${MODEL_CTX}
PARAMETER num_thread ${PHYSICAL_CORES}
PARAMETER num_batch ${NUM_BATCH}

# High-Precision Coding & Tool Execution
PARAMETER temperature 0.1
PARAMETER top_p 0.85
PARAMETER top_k 20
PARAMETER num_predict ${PREDICT_TOKENS}
MODEL_CONF_EOF

        # Apply configuration to model in Ollama
        CREATE_OUTPUT=$(ollama create "$MODEL_NAME" -f "$TMP_MODELFILE" 2>&1 || true)
        if echo "$CREATE_OUTPUT" | grep -qi "error"; then
            echo -e "    ${YELLOW}⚠ Could not rebuild ${MODEL_NAME}: ${CREATE_OUTPUT}${NC}"
            continue
        fi

        OFFLOAD_LABEL="CPU Multi-Thread"
        if [ "$GPU_LAYERS" -gt 0 ]; then
            OFFLOAD_LABEL="100% GPU Offload"
        fi
        echo -e "    ${GREEN}✓${NC} Applied: ${GREEN}${OFFLOAD_LABEL}${NC} | Context: ${GREEN}${MODEL_CTX} tokens${NC} | Threads: ${GREEN}${PHYSICAL_CORES}${NC} | Batch: ${GREEN}${NUM_BATCH}${NC}"
    done
fi

# ==============================================================================
# SECTION 5: PRE-WARMING & VERIFICATION
# ==============================================================================
echo -e "\n${BLUE}${BOLD}[6/6] Pre-Warming Primary Model into Memory/VRAM...${NC}"

PRIMARY_ACTIVE=$(echo "$INSTALLED_MODELS" | grep -E "qwen3|qwen2.5|deepseek|llama3" | head -n 1 || echo "$INSTALLED_MODELS" | head -n 1)

if [ -n "$PRIMARY_ACTIVE" ] && [ "$DRY_RUN" = false ]; then
    echo -e "  * Pinning ${CYAN}${PRIMARY_ACTIVE}${NC} into memory (${GLOBAL_MAX_CTX} context, 24h keep-alive)..."
    # Unload any previously loaded oversized context instance
    curl -s http://127.0.0.1:11434/api/generate -d "{\"model\": \"${PRIMARY_ACTIVE}\", \"keep_alive\": 0}" >/dev/null 2>&1 || true
    sleep 1
    PREWARM_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 60 http://127.0.0.1:11434/api/generate -d "{\"model\": \"${PRIMARY_ACTIVE}\", \"keep_alive\": \"24h\", \"options\": {\"num_ctx\": ${GLOBAL_MAX_CTX}}}" 2>/dev/null || echo "000")
    if [ "$PREWARM_HTTP" = "200" ]; then
        echo -e "    ${GREEN}✓${NC} Model pre-warmed successfully (0ms latency ready)."
    else
        echo -e "    ${YELLOW}ℹ${NC} Pre-warm request dispatched."
    fi
fi

# ==============================================================================
# SUMMARY & COMPLETION
# ==============================================================================
echo -e "\n${GREEN}${BOLD}╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║          Ollama GPU Acceleration & Model Optimization Complete!              ║"
echo -e "╚══════════════════════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${BOLD}Currently Installed & Tuned Models:${NC}"
ollama list 2>/dev/null || true

echo -e "\n${BOLD}How to Run KerberoSec with Ollama:${NC}"
if [ -n "$PRIMARY_ACTIVE" ]; then
    echo -e "  * Direct command:   ${GREEN}kerberosec -P ollama -m ${PRIMARY_ACTIVE} \"explain my project\"${NC}"
fi
echo -e "  * Interactive TUI:  ${GREEN}kerberosec${NC} (select Provider: Ollama)"
echo ""
