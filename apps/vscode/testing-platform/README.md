# KerberoSec Testing Platform

A CLI testing framework for the KerberoSec Core extension, providing gRPC-based integration clients and utilities for automated scenarios.

## Overview

The platform enables end-to-end validation of KerberoSec's core functionality through:

- **gRPC Adapters** – clients for KerberoSec’s gRPC services  
- **Test Harness** – runner, utilities, and type definitions  
- **Spec Files** – JSON instructions for automated test cases  

## Structure

```
testing-platform/
├── adapters/           # gRPC communication adapters
│   ├── grpcAdapter.ts     # Main gRPC adapter implementation
├── harness/            # Test execution framework
│   ├── runner.ts          # Main test runner
│   ├── types.ts           # Type definitions
│   └── utils.ts           # Utility functions
```

## Prerequisites

- **Node.js** ≥ 18 (the runtime) and **bun** (package manager + task runner)  
- **Protocol Buffers** (used for gRPC)  

Generate proto files in the **root KerberoSec project**:

```bash
bun run protos
```

## Setup

From the root of the KerberoSec project:

```bash
bun run install:all
bun run protos
```

Then install and build the testing platform:

```bash
cd testing-platform
bun install
bun run build
```

## Running Spec File Tests

Before running specs, make sure the standalone KerberoSec Core gRPC server (that runs mocks and host gRPC as well) is running:

```bash
bun run test:sca-server
```

Then finally you can run the cli as:

```bash
bun run start:dev <spec-file-or-folder>
```bash
