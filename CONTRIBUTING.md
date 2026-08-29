# Contributing to KerberoSec

We are thrilled you are interested in contributing to KerberoSec. Whether you are fixing a bug, adding a feature, or improving our docs, every contribution makes KerberoSec smarter! To keep our community vibrant and welcoming, all members must adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## Reporting Bugs or Issues

Bug reports help make KerberoSec better for everyone! Before creating a new issue, please [search existing ones](https://github.com/KerberoSec/KerberoSec-CLI/issues) to avoid duplicates. When you are ready to report a bug, head over to our [issues page](https://github.com/KerberoSec/KerberoSec-CLI/issues/new/choose) where you will find a template to help you with filling out the relevant information.

> **Important:** If you discover a security vulnerability, please use the [GitHub Security Advisory tool](https://github.com/KerberoSec/KerberoSec-CLI/security/advisories/new) or contact us directly at arungaming1973@gmail.com to report it privately.

## Before Contributing

All contributions should begin with a GitHub Issue, unless the change is for small bug fixes, typo corrections, minor wording improvements, or simple type fixes that do not change functionality.

**For features and major contributions**:
- First check the [Feature Requests discussions board](https://github.com/KerberoSec/KerberoSec-CLI/discussions) for similar ideas
- If your idea is new, create a new feature request or issue
- Wait for feedback from core maintainers before starting large implementations
- Once aligned, submit a focused Pull Request

## Deciding What to Work On

Looking for a good first contribution? Check out issues labeled ["good first issue"](https://github.com/KerberoSec/KerberoSec-CLI/labels/good%20first%20issue) or ["help wanted"](https://github.com/KerberoSec/KerberoSec-CLI/labels/help%20wanted). These are specifically curated for new contributors.

We also welcome contributions to our documentation! Whether it is fixing typos, improving existing guides, or creating new architectural walkthroughs, we would love to build a community-driven repository of resources.

## Development Setup

### 1. Prerequisites
- **Bun Runtime** (v1.1.0 or newer): [bun.sh](https://bun.sh)
- **Node.js** (v20+ for compatibility utilities)
- **Git**

### 2. Local Repository Setup
```bash
# Clone the repository
git clone https://github.com/KerberoSec/KerberoSec-CLI.git
cd KerberoSec-CLI

# Install monorepo dependencies
bun install
```

### 3. Building the Core SDK and CLI
```bash
# Compile all core SDK packages (@kerberosec/shared, @kerberosec/core, @kerberosec/llms, @kerberosec/agents, @kerberosec/ui)
bun run build:sdk

# Compile the KerberoSec CLI binary
bun -F @kerberosec/cli build
```

### 4. Running the CLI in Development Mode
```bash
# Run CLI directly via Bun
bun run apps/cli/src/index.ts

# Or test in single prompt mode
bun run apps/cli/src/index.ts "explain this repository"
```

### 5. Running the VS Code Extension
If you are developing the VS Code extension:
1. Navigate to `cd apps/vscode`
2. Run `bun run install:all`
3. Press `F5` in VS Code to launch the extension development host

## Writing and Submitting Code

1. **Keep Pull Requests Focused**
   - Limit PRs to a single feature or bug fix.
   - Break large refactors into logical commits that can be reviewed independently.

2. **Code Quality and Formatting**
   - Run Biome checks before committing:
     ```bash
     bun biome check apps/cli/src/
     ```
   - Auto-format code if needed:
     ```bash
     bun biome format --write apps/cli/src/
     ```

3. **Testing**
   - Run the automated unit test suite across the monorepo:
     ```bash
     bun test
     ```
   - Ensure all unit and integration tests pass before opening a PR.

4. **Commit Guidelines**
   - Use conventional commit messages (e.g., `feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
   - Reference related issue numbers in commit descriptions (e.g., `fixes #12`).

5. **Pull Request Description**
   - Clearly describe the purpose of the change.
   - Include reproduction or verification steps.
   - Attach screenshots or recordings for any UI changes.

## Contribution Agreement

By submitting a pull request, you agree that your contributions will be licensed under the project's [Apache 2.0 License](LICENSE).

