# KerberoSecCore Gotchas

## Always Call dispose()

`KerberoSecCore` holds resources (file watchers, database connections, hub connections). Failing to call `dispose()` can leave orphan processes and file locks.

```typescript
const kerberosec = await KerberoSecCore.create({ clientName: "my-app" })
try {
  // ... use kerberosec
} finally {
  await kerberosec.dispose()
}
```

## Node.js 22 Required

KerberoSecCore and `@kerberosec/core` require Node.js 22 or later. If you're on an older version, you'll get runtime errors. Check with `node --version`.

## Session Config vs Global Config

Tool policies can be set at two levels:
- Global: in `KerberoSecCore.create({ toolPolicies })` -- applies to all sessions
- Per-session: in `kerberosec.start({ toolPolicies })` -- overrides global for that session

Per-session policies take precedence.

## enableTools Must Be Explicit

Built-in tools (bash, editor, read_files, etc.) are not available unless you set `enableTools: true` in the session config:

```typescript
await kerberosec.start({
  prompt: "Read package.json",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    enableTools: true,  // required for built-in tools
  },
})
```

Without this, the agent only has access to custom tools you provide via `config.tools`.

## cwd Matters for Built-in Tools

Built-in tools like `bash`, `editor`, and `read_files` operate relative to `config.cwd`. If not set, they use the process working directory. Always set it explicitly for predictable behavior:

```typescript
config: {
  cwd: "/absolute/path/to/project",
  // ...
}
```

## Hub Startup Latency

With `backendMode: "auto"`, the first session may be slow if a hub daemon needs to be spawned. For immediate responsiveness:
- Use `backendMode: "local"` for in-process execution (fastest startup)
- Pre-warm the hub with `kerberosec hub ensure` CLI command
- Accept the one-time startup cost and let subsequent sessions reuse the hub

## Session Storage Location

Sessions are stored at `~/.kerberosec/data/sessions/`. This includes:
- `sessions.db` - SQLite database with session metadata
- `[session-id].json` - Individual message history files

If you're running in a container or ephemeral environment, these paths may not persist across restarts.

## requestToolApproval Blocks Execution

When a tool policy has `autoApprove: false` and you provide a `requestToolApproval` callback, the agent loop blocks until your callback resolves. If your callback never resolves (e.g., waiting for user input that never comes), the session hangs.

For automated pipelines, either:
- Set all tools to `autoApprove: true`
- Implement a timeout in your approval callback

## Plugin Discovery Paths

KerberoSecCore discovers plugins from:
- Global: `~/.kerberosec/plugins/`
- Workspace: `.kerberosec/plugins/`

For SDK consumers, pass plugins via `extensions: [plugin]` or `pluginPaths: ["./path"]` in the session config.

If a plugin isn't loading, verify:
- The file is in one of the discovery directories, or passed via `extensions`/`pluginPaths`
- The file exports a default plugin object with a non-empty `manifest.capabilities` array
- Every `api.register*` call in `setup()` has a matching capability declared
- If `hooks` is present on the plugin, `"hooks"` is in `capabilities`

## extensionContext.workspace Is Required for Plugins

If your plugins use `ctx.workspaceInfo` (e.g., to resolve workspace paths), you must set `extensionContext.workspace` in the session config. Without it, `ctx.workspaceInfo` is undefined:

```typescript
await kerberosec.start({
  config: {
    extensions: [myPlugin],
    extensionContext: {
      workspace: { rootPath: process.cwd(), cwd: process.cwd() },
    },
  },
})
```

The CLI sets this automatically, but SDK consumers must set it explicitly.

## send() Requires an Active Session

`kerberosec.send()` only works on sessions that are still active. If a session has already completed, `send()` may return `undefined` or fail. Check session status with `kerberosec.get(sessionId)` first.

## Result May Be Undefined

`session.result` can be `undefined` if the session was started but hasn't completed yet (e.g., in a non-blocking hub mode). Check for this:

```typescript
const session = await kerberosec.start({ ... })
if (session.result) {
  console.log(session.result.text)
} else {
  console.log("Session started but not yet complete")
}
```

## Compaction and Long Sessions

For long-running sessions, message history grows and eventually exceeds the model's context window. KerberoSecCore handles this via compaction, which summarizes older messages. Configure it via `compactionConfig`:

```typescript
config: {
  compactionConfig: {
    strategy: "summarize",
    // ...
  },
}
```

The default strategy works for most cases, but extremely long sessions may benefit from tuning.

## See Also

- `api.md` - Full API reference
- `patterns.md` - Common patterns
- `../agent/gotchas.md` - Agent-level gotchas
- `../tools/REFERENCE.md` - Tool troubleshooting
- `../providers/REFERENCE.md` - Provider troubleshooting
