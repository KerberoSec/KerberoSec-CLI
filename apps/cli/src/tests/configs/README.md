# Test Fixture Configs

Each subdirectory here is a **KerberoSec config directory** used by one or more test suites.
Tests point to a config via `kerberosecEnv("<name>")` in `tests/e2e/cli/helpers/env.ts`.

## Available fixtures

| Directory | Purpose |
|-----------|---------|
| `default/` | Minimal config used for local/non-live CLI TUI tests. |
| `unauthenticated/` | Explicitly empty config (no provider or API keys). |

## Adding a new fixture

1. Create `configs/<name>/data/globalState.json` with the desired state.
2. Create `configs/<name>/data/settings/kerberosec_mcp_settings.json` (can be `{ "mcpServers": {} }`).
3. Reference it in tests with `kerberosecEnv("<name>")`.

## Secrets

API keys and secrets should never be committed.
If you create authenticated fixtures locally, keep `data/secrets.json` untracked or fill it with mock data
