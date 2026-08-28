# ==============================================================================
#  KerberoSec CLI - Docker Container Environment
#  Author: Arun Kumar (https://github.com/KerberoSec)
# ==============================================================================

FROM oven/bun:debian AS base

# Install system dependencies (git, curl, build essentials, procps)
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    git \
    curl \
    build-essential \
    procps \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root workspace configurations
COPY package.json bun.lock tsconfig.json tsconfig.base.json biome.json ./

# Copy monorepo packages and applications
COPY sdk/ ./sdk/
COPY apps/ ./apps/
COPY .agents/ ./.agents/
COPY .kerberosec/ ./.kerberosec/

# Install monorepo dependencies and compile SDK + CLI
RUN bun install
RUN bun run build:sdk
RUN bun -F @kerberosec/cli build

# Create workspace directory for user mounts
WORKDIR /workspace

# Set entrypoint to KerberoSec CLI
ENTRYPOINT ["bun", "run", "/app/apps/cli/src/index.ts"]
CMD []
