# `apps/examples/vscode` (`@kerberosec/vscode`)

VS Code extension that opens a chat webview and runs KerberoSec sessions over the RPC runtime.

## What it does

- Opens a webview panel via `KerberoSec: Open Chat in Editor`.
- Ensures a compatible owner-scoped RPC sidecar by running `kerberosec rpc ensure --json`.
- Starts/sends/aborts chat turns using RPC runtime methods (`StartRuntimeSession`, `SendRuntimeSession`, `AbortRuntimeSession`).
- Streams runtime events into the webview for incremental assistant output.

## Requirements

- `kerberosec` must already be installed and available on `PATH`.
- A provider/model should be configured in KerberoSec provider settings.

## Development

```bash
# Build extension bundle
bun -F @kerberosec/vscode build

# Typecheck
bun -F @kerberosec/vscode typecheck
```

To run locally in VS Code:

1. Build the extension: `bun -F @kerberosec/vscode build`.
2. Open `apps/examples/vscode` in VS Code.
3. Press `F5` to launch the Extension Development Host.
4. Run command `KerberoSec: Open Chat in Editor`.
