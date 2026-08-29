# ==============================================================================
# KerberoSec All-in-One CLI & Security Toolkit Container
# Base: Kali Linux Rolling (Debian-based => APT, Bun, Cloud SDKs, Wordlists)
# ==============================================================================

FROM kalilinux/kali-rolling

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
ENV PYTHONUNBUFFERED=1
ENV PIP_BREAK_SYSTEM_PACKAGES=1

# Layer 1: System essentials, Kali security tools, and wordlists
RUN apt-get update && apt-get install -y \
    kali-linux-headless \
    kali-tools-information-gathering \
    kali-tools-vulnerability \
    kali-tools-web \
    kali-tools-exploitation \
    kali-tools-social-engineering \
    kali-tools-password-recovery \
    kali-tools-forensics \
    kali-tools-sniffing-spoofing \
    kali-tools-post-exploitation \
    kali-tools-reverse-engineering \
    kali-tools-fuzzing \
    kali-tools-crypto-stego \
    kali-tools-wireless \
    wordlists \
    seclists \
    curl git build-essential procps ca-certificates unzip tar jq python3 python3-pip python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Layer 2: Install official Cloud SDKs (AWS, Azure, GCP)
# 1. AWS CLI v2
RUN curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip" && \
    unzip -q /tmp/awscliv2.zip -d /tmp && \
    /tmp/aws/install && \
    rm -rf /tmp/aws /tmp/awscliv2.zip

# 2. Azure CLI
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | bash && \
    rm -rf /var/lib/apt/lists/*

# 3. Google Cloud SDK
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] http://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
    curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg && \
    apt-get update && apt-get install -y google-cloud-cli && \
    rm -rf /var/lib/apt/lists/*

# Layer 3: Install Bun JavaScript / TypeScript runtime
ENV BUN_INSTALL=/root/.bun
ENV PATH="${BUN_INSTALL}/bin:/root/.local/bin:/root/go/bin:/root/.cargo/bin:/root/.foundry/bin:/root/Tools/bin:${PATH}"
RUN curl -fsSL https://bun.sh/install | bash

# Layer 4: Run comprehensive security tools installer (tools.sh)
COPY tools.sh /opt/tools.sh
RUN chmod +x /opt/tools.sh && mkdir -p /root/Tools && cp /opt/tools.sh /root/Tools/tools.sh && bash /opt/tools.sh all

# Layer 5: Workspace and CLI Monorepo Build
WORKDIR /workspace
COPY . /workspace

# Set execution permissions and compile KerberoSec monorepo
RUN chmod +x /workspace/setup.sh /workspace/ollama.sh /workspace/tools.sh && \
    bun install && \
    bun run build:sdk && \
    bun -F @kerberosec/cli build && \
    mkdir -p /root/.local/bin && \
    printf '#!/usr/bin/env bash\nexport PATH="$HOME/.bun/bin:$PATH"\nexec bun run /workspace/apps/cli/src/index.ts "$@"\n' > /usr/local/bin/kerberosec && \
    chmod +x /usr/local/bin/kerberosec

# Environment configurations
ENV TOOLS_DIR=/root/Tools
ENV WORDLISTS=/usr/share/seclists

# Cleanup build caches
RUN rm -rf /var/lib/apt/lists/* /root/.cache /tmp/* /var/tmp/* && apt-get autoclean 2>/dev/null || true

# Interactive CLI launch by default
CMD ["bun", "run", "apps/cli/src/index.ts"]