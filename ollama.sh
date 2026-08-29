#!/usr/bin/env bash

# KerberoSec CLI - Autonomous Ollama GPU Optimizer & Model Matrix
# Configures Ollama for maximum GPU acceleration (100% layer offload),
# tunes context size per VRAM tier, and optimizes models for tool calling
# (compatible with KerberoSec, Claude Code, Codex, Cline, etc.).

set -e

# Terminal styling
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "=================================================================="
echo "      KerberoSec Ollama GPU Optimizer & Agent Model Matrix        "
echo "=================================================================="
echo -e "${NC}"

# ==============================================================================
# QWEN 3 SERIES MODEL & CONTEXT MATRIX BY VRAM CAPACITY (Agentic Tool Calling)
# ==============================================================================
#  * 2GB VRAM  (MX150/MX250/GTX 960M):   qwen3:1.7b           (num_ctx: 4096)
#  * 4GB VRAM  (GTX 1650/RTX 3050 4GB):  qwen3:4b             (num_ctx: 8192)
#  * 6GB VRAM  (RTX 2060/GTX 1660 Ti):   qwen3:8b             (num_ctx: 16384)
#  * 8GB VRAM  (RTX 3060 8GB/RTX 4060):  qwen3:8b             (num_ctx: 32768)
#  * 12GB VRAM (RTX 3060 12GB/RTX 4070): qwen3:14b            (num_ctx: 32768)
#  * 16GB VRAM (RTX 4080/V100/T4):       qwen3:14b            (num_ctx: 65536)
#  * 24GB+     (RTX 3090/4090/A5000):    qwen3:32b            (num_ctx: 65536)
#  * 32GB+     (A6000/Dual GPUs):        qwen3:32b            (num_ctx: 131072)
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Hardware Detection & Tier Selection
# ------------------------------------------------------------------------------
echo -e "${BLUE}${BOLD}[1/4] Detecting System Hardware & GPU Tier...${NC}"

PHYSICAL_CORES=$(lscpu -p 2>/dev/null | grep -E -v '^#' | sort -u -t, -k 2,2 | wc -l || nproc 2>/dev/null || echo "4")
PHYSICAL_CORES=${PHYSICAL_CORES:-4}
echo -e "  * CPU Physical Cores: ${GREEN}${PHYSICAL_CORES}${NC}"

HAS_NVIDIA=false
VRAM_MB=0

if command -v nvidia-smi &>/dev/null; then
    NVIDIA_INFO=$(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits 2>/dev/null | head -n 1 || true)
    if [ -n "$NVIDIA_INFO" ]; then
        GPU_NAME=$(echo "$NVIDIA_INFO" | cut -d',' -f1 | xargs)
        VRAM_MB=$(echo "$NVIDIA_INFO" | cut -d',' -f2 | xargs)
        HAS_NVIDIA=true
        echo -e "  * Detected GPU: ${GREEN}${GPU_NAME}${NC} (${VRAM_MB} MB VRAM)"
    fi
fi

if [ "$HAS_NVIDIA" = false ]; then
    echo -e "  * GPU: ${YELLOW}No dedicated NVIDIA GPU found. Using CPU acceleration.${NC}"
fi

# Determine optimal Qwen 3 model and context window by VRAM tier
if [ "$VRAM_MB" -ge 31000 ]; then
    RECOMMENDED_MODEL="qwen3:32b"
    OPTIMAL_CTX=131072
    TIER_DESC="32GB+ VRAM (Qwen 3 32B - Ultra-Scale Reasoning & Full Repo Context)"
elif [ "$VRAM_MB" -ge 23000 ]; then
    RECOMMENDED_MODEL="qwen3:32b"
    OPTIMAL_CTX=65536
    TIER_DESC="24GB VRAM (Qwen 3 32B - Flagship Coding & Tool Calling with 64k Context)"
elif [ "$VRAM_MB" -ge 15000 ]; then
    RECOMMENDED_MODEL="qwen3:14b"
    OPTIMAL_CTX=65536
    TIER_DESC="16GB VRAM (Qwen 3 14B - High-Intelligence Architecture with 64k Context)"
elif [ "$VRAM_MB" -ge 11000 ]; then
    RECOMMENDED_MODEL="qwen3:14b"
    OPTIMAL_CTX=32768
    TIER_DESC="12GB VRAM (Qwen 3 14B - Multi-File Codebase Analysis with 32k Context)"
elif [ "$VRAM_MB" -ge 7500 ]; then
    RECOMMENDED_MODEL="qwen3:8b"
    OPTIMAL_CTX=32768
    TIER_DESC="8GB VRAM (Qwen 3 8B - Benchmark Agent Model with 32k Context)"
elif [ "$VRAM_MB" -ge 5500 ]; then
    RECOMMENDED_MODEL="qwen3:8b"
    OPTIMAL_CTX=16384
    TIER_DESC="6GB VRAM (Qwen 3 8B - Agent Model with 16k Context)"
elif [ "$VRAM_MB" -ge 3500 ]; then
    RECOMMENDED_MODEL="qwen3:4b"
    OPTIMAL_CTX=8192
    TIER_DESC="4GB VRAM (Qwen 3 4B - High-Efficiency Model with 8k Context)"
else
    # 2GB VRAM (MX150, MX250, GTX 960M, etc.) or CPU
    RECOMMENDED_MODEL="qwen3:1.7b"
    OPTIMAL_CTX=4096
    TIER_DESC="2GB VRAM (Qwen 3 1.7B - 100% GPU offload with safe VRAM headroom)"
fi

echo -e "  * Hardware Tier: ${MAGENTA}${TIER_DESC}${NC}"
echo -e "  * Recommended Model: ${GREEN}${RECOMMENDED_MODEL}${NC}"
echo -e "  * Tuned Context Window: ${GREEN}${OPTIMAL_CTX} tokens${NC}"

# ------------------------------------------------------------------------------
# 2. Check and Configure Ollama Daemon & Shell Environment
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}${BOLD}[2/4] Configuring Ollama for Maximum GPU Performance...${NC}"

if ! command -v ollama &>/dev/null; then
    echo -e "${YELLOW}Installing Ollama...${NC}"
    curl -fsSL https://ollama.com/install.sh | sh
fi

# 1. User shell environment exports (active session)
export OLLAMA_FLASH_ATTENTION=1
export OLLAMA_KV_CACHE_TYPE=q4_0
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_KEEP_ALIVE=24h
export OLLAMA_GPU_OVERHEAD=0
export CUDA_VISIBLE_DEVICES=0
export CUDA_LAUNCH_BLOCKING=0
export CUDA_DEVICE_ORDER=PCI_BUS_ID

# Persist environment variables in ~/.bashrc if not already present
if ! grep -q "CUDA_LAUNCH_BLOCKING" "$HOME/.bashrc" 2>/dev/null; then
    cat << 'ENV_EOF' >> "$HOME/.bashrc"

# Ollama GPU Acceleration & Maximum Token Speed Defaults
export OLLAMA_FLASH_ATTENTION=1
export OLLAMA_KV_CACHE_TYPE=q4_0
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_KEEP_ALIVE=24h
export OLLAMA_GPU_OVERHEAD=0
export CUDA_VISIBLE_DEVICES=0
export CUDA_LAUNCH_BLOCKING=0
export CUDA_DEVICE_ORDER=PCI_BUS_ID
ENV_EOF
fi

# 2. Systemd service configuration (if sudo is available)
SERVICE_DROPIN_DIR="/etc/systemd/system/ollama.service.d"
if [ -d "/etc/systemd/system" ] && command -v systemctl &>/dev/null; then
    if sudo -n true 2>/dev/null || [ "$EUID" -eq 0 ]; then
        sudo mkdir -p "$SERVICE_DROPIN_DIR"
        sudo cat << SERVICE_EOF > "$SERVICE_DROPIN_DIR/override.conf"
[Service]
Environment="OLLAMA_FLASH_ATTENTION=1"
Environment="OLLAMA_KV_CACHE_TYPE=q4_0"
Environment="OLLAMA_NUM_PARALLEL=1"
Environment="OLLAMA_KEEP_ALIVE=24h"
Environment="OLLAMA_GPU_OVERHEAD=0"
Environment="CUDA_VISIBLE_DEVICES=0"
Environment="CUDA_LAUNCH_BLOCKING=0"
Environment="CUDA_DEVICE_ORDER=PCI_BUS_ID"
SERVICE_EOF
        sudo systemctl daemon-reload 2>/dev/null || true
        sudo systemctl restart ollama 2>/dev/null || true
        echo -e "${GREEN}[OK] Configured systemd daemon with Flash Attention, Q4 KV-Cache & 100% GPU offload.${NC}"
    fi
fi

# Ensure service is running
if ! pgrep -f "ollama serve" >/dev/null && ! pgrep -f "/usr/bin/ollama" >/dev/null; then
    echo -e "${CYAN}Starting Ollama server in background...${NC}"
    nohup ollama serve >/dev/null 2>&1 &
    sleep 3
fi

# ------------------------------------------------------------------------------
# 3. Check / Pull Recommended Model & Optimize for Agentic Tool Calling
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}${BOLD}[3/4] Optimizing Models for Agentic Tool Calling & Coding...${NC}"

INSTALLED_MODELS=$(ollama list 2>/dev/null | awk 'NR>1 {print $1}' | grep -v 'NAME' || true)

# Pull recommended model if not already present
if ! echo "$INSTALLED_MODELS" | grep -q "${RECOMMENDED_MODEL%%:*}"; then
    echo -e "${CYAN}Downloading ${RECOMMENDED_MODEL}...${NC}"
    ollama pull "$RECOMMENDED_MODEL"
    INSTALLED_MODELS=$(ollama list 2>/dev/null | awk 'NR>1 {print $1}' | grep -v 'NAME' || true)
fi

for model_name in $INSTALLED_MODELS; do
    echo -e "  * Tuning ${CYAN}${model_name}${NC} (100% GPU offload, ${OPTIMAL_CTX} ctx, fast batching & tool calling)..."
    
    # Safely release active model locks before re-tagging
    curl -s http://localhost:11434/api/generate -d "{\"model\": \"${model_name}\", \"keep_alive\": 0}" >/dev/null 2>&1 || true
    
    cat << MODEL_EOF > "/tmp/Modelfile.tune"
FROM ${model_name}

# 100% GPU Layer Offloading & Context Budget
PARAMETER num_gpu 99
PARAMETER num_ctx ${OPTIMAL_CTX}
PARAMETER num_thread ${PHYSICAL_CORES}
PARAMETER num_batch 512

# Fast Agent Tool Calling & Coding Parameters
PARAMETER temperature 0.1
PARAMETER top_p 0.85
PARAMETER top_k 20
PARAMETER num_predict 4096
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"
PARAMETER stop "<|im_start|>"

TEMPLATE """{{- range $i, $_ := .Messages }}
{{- $last := eq (len (slice $.Messages $i)) 1 -}}
{{- if eq .Role "user" }}<|im_start|>user
{{ .Content }}<|im_end|>
{{ else if eq .Role "assistant" }}<|im_start|>assistant
{{ if .Thinking }}<think>{{ .Thinking }}</think>
{{ end }}{{ if .Content }}{{ .Content }}
{{- else if .ToolCalls }}<tool_call>
{{ range .ToolCalls }}{"name": "{{ .Function.Name }}", "arguments": {{ .Function.Arguments }}}
{{ end }}</tool_call>
{{- end }}{{ if not $last }}<|im_end|>
{{ end }}
{{- else if eq .Role "tool" }}<|im_start|>user
<tool_response>
{{ .Content }}
</tool_response><|im_end|>
{{ end }}
{{- if and (ne .Role "assistant") $last }}<|im_start|>assistant
{{ end }}
{{- end }}"""

SYSTEM You are KerberoSec AI, an expert cybersecurity and autonomous coding agent. Carefully think through problems, tool parameters, security considerations, and code architecture to provide accurate, high-quality solutions.
MODEL_EOF
    ollama create "$model_name" -f "/tmp/Modelfile.tune" >/dev/null 2>&1 || true
    rm -f "/tmp/Modelfile.tune"
done

# Pre-warm recommended model in VRAM for instant 0ms responses
PRIMARY_MODEL=$(echo "$INSTALLED_MODELS" | grep -E "qwen3|1.7b" | head -n 1 || echo "$INSTALLED_MODELS" | head -n 1)
echo -e "\n${CYAN}Pre-warming ${PRIMARY_MODEL} into GPU VRAM...${NC}"
curl -s --max-time 15 http://localhost:11434/api/generate -d "{\"model\": \"${PRIMARY_MODEL}\", \"keep_alive\": \"24h\", \"stream\": false}" >/dev/null 2>&1 || true

# ------------------------------------------------------------------------------
# 4. Clean Temporary Files
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}${BOLD}[4/4] Cleaning Cache & Temporary Files...${NC}"
rm -f /tmp/Modelfile* /tmp/kerberosec* 2>/dev/null || true

echo -e "\n${GREEN}${BOLD}=================================================================="
echo "          Ollama GPU Optimization Complete!                       "
echo "==================================================================${NC}"
echo -e "\n${BOLD}Current Optimized Models in Ollama:${NC}"
ollama list

echo -e "\n${BOLD}Ready for KerberoSec CLI:${NC}"
echo -e "  * Launch with ${PRIMARY_MODEL}: ${GREEN}kerberosec --provider ollama --model ${PRIMARY_MODEL}${NC}"
echo -e "  * Or run: ${GREEN}kerberosec${NC} (pick Ollama -> ${PRIMARY_MODEL})"
echo ""
