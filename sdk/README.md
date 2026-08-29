<p align="center">
  <img src="https://github.com/user-attachments/assets/a05da977-2cb7-498a-88ca-20f24c9562e1" width="100%" />
</p>

<div align="center">
<table>
<tbody>
<td align="center">
<a href="https://discord.gg/kerberosec" target="_blank"><strong>Discord</strong></a>
</td>
<td align="center">
<a href="https://www.reddit.com/r/kerberosec/" target="_blank"><strong>r/kerberosec</strong></a>
</td>
<td align="center">
<a href="https://github.com/kerberosec/kerberosec/discussions/categories/feature-requests?discussions_q=is%3Aopen+category%3A%22Feature+Requests%22+sort%3Atop" target="_blank"><strong>Feature Requests</strong></a>
</td>
</tbody>
</table>
</div>

The KerberoSec SDK is a TypeScript framework for building AI agents that can edit files, run shell commands, browse the web, call APIs, and use any custom tool you give them. It's the same engine that powers [KerberoSec](https://github.com/KerberoSec/KerberoSec-CLI), packaged as a library you can embed in your own applications.

```typescript
import { Agent } from "@kerberosec/sdk"

const agent = new Agent({
  providerId: "kerberosec",
  modelId: "openai/gpt-5.5",
  systemPrompt: "You are a helpful coding assistant.",
  tools: [],
})

const result = await agent.run("Create a REST API with Express and TypeScript")
console.log(result.text)
```

That's it. The agent streams its response, calls tools if you give it any, and returns when the task is done.

## Install

```bash
npm install @kerberosec/sdk
```

## SDK Skill

If you use a coding agent (Claude Code, Codex, KerberoSec, etc.), install the [KerberoSec SDK skill](https://github.com/kerberosec/sdk-skill) to give your agent context on the SDK's APIs and best practices to help you build with the KerberoSec SDK.

```bash
npx skills add kerberosec/sdk-skill
```

Prompt it to scaffold agents, create custom tools, wire up plugins, configure providers, and more.

## What You Can Build

Coding agents, Slack bots, scheduled automations, code review pipelines, multi-agent teams, IDE integrations -- anything that benefits from an LLM that can take actions, not just generate text.

```typescript
// Slack bot: each thread gets its own agent with conversation memory
const agents = new Map<string, Agent>()

async function handleMessage(threadId: string, message: string) {
  let agent = agents.get(threadId)
  if (!agent) {
    agent = new Agent({
      providerId: "gemini",
      modelId: "gemini-3.1-pro-preview",
      systemPrompt: "You are a concise Slack assistant.",
      tools: [],
    })
    agents.set(threadId, agent)
  }

  const result = agent.hasRun
    ? await agent.continue(message)
    : await agent.run(message)

  return result.text
}
```

Explore full working examples in [`examples/`](examples) and app examples in [`apps/examples/`](apps/examples):

| Example | Description |
|---------|-------------|
| [Plugins](examples/plugins) | Custom tools with workspace-aware context, lifecycle hooks, and branch-level safety policies |
| [Subagent Orchestration](examples/plugins/agents-squad) | Spawn and manage background agents with presets, skills, and cross-agent handoffs |
| [Hooks](examples/hooks) | File-based and runtime hooks for logging, review gates, context injection, and lifecycle automation |
| [Cron Automations](examples/cron) | Recurring and event-driven automation specs for scheduled quality checks and PR workflows |
| [Desktop App](apps/examples/desktop-app) | Tauri desktop shell with a Bun sidecar backend and Next.js UI |
| [VS Code Extension App](apps/examples/vscode) | VS Code extension example that runs KerberoSec sessions over the RPC runtime |

## Custom Tools

Tools are how agents interact with the world. Define a tool with a name, a description the model reads, a JSON Schema for inputs, and a function that does the work:

```typescript
import { createTool } from "@kerberosec/sdk"

const deploy = createTool({
  name: "deploy",
  description: "Deploy the app to staging or production.",
  inputSchema: {
    type: "object",
    properties: {
      environment: { type: "string", enum: ["staging", "production"] },
    },
    required: ["environment"],
  },
  execute: async (input) => {
    const result = await runDeployment(input.environment)
    return { url: result.url, status: "success" }
  },
})

const agent = new Agent({
  providerId: "moonshot",
  modelId: "kimi-k2.5",
  systemPrompt: "You are a deployment assistant.",
  tools: [deploy],
})
```

The agent decides when to call the tool based on the description. It sees the result and incorporates it into its response.

## Streaming Events

Every event during execution is observable in real time:

```typescript
const agent = new Agent({
  providerId: "anthropic",
  modelId: "claude-opus-4-7",
  systemPrompt: "You are a helpful assistant.",
  tools: [myTool],
  onEvent: (event) => {
    switch (event.type) {
      case "content_update":
        if (event.contentType === "text") process.stdout.write(event.text)
        break
      case "content_start":
        if (event.contentType === "tool") console.log(`\n[${event.toolName}]`)
        break
      case "usage":
        console.log(`\ntokens: ${event.inputTokens} in, ${event.outputTokens} out`)
        break
    }
  },
})
```

## Plugins

Package reusable capabilities as extensions. An extension can register tools, observe lifecycle events, and modify agent behavior:

```typescript
const metrics: AgentPlugin = {
  name: "metrics",
  manifest: { capabilities: ["tools", "hooks"] },

  setup(api) {
    api.registerTool(myCustomTool)
  },

  hooks: {
    beforeRun() {
      console.time("agent")
    },

    beforeTool({ toolCall }) {
      console.log(`tool: ${toolCall.toolName}`)
    },

    afterRun({ result }) {
      console.timeEnd("agent")
      console.log(`${result.iterations} iterations, ${result.usage.outputTokens} tokens`)
    },
  },
}
```

## KerberoSecCore: Full Runtime

When you need session persistence, built-in tools, config discovery, and multi-process support, use `KerberoSecCore`:

```typescript
import { KerberoSecCore } from "@kerberosec/sdk"

const kerberosec = await KerberoSecCore.create({ clientName: "my-app" })

const session = await kerberosec.start({
  prompt: "Set up CI with GitHub Actions",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    apiKey: process.env.ANTHROPIC_API_KEY,
    cwd: "/path/to/project",
    enableTools: true,
  },
})

console.log(session.result?.text)
```

If both `cwd` and `workspaceRoot` are omitted, the execution host places the
session in the shared chat workspace at
`<kerberosec-data-dir>/workspaces/chat` (by default
`~/.kerberosec/data/workspaces/chat`), seeded with an `AGENTS.md` rules file that
tells the agent to treat the session as a chat and only create a named
project folder when the user asks for one.
The paths in `session.manifest` are the authoritative resolved workspace paths.

`KerberoSecCore` gives the agent built-in tools (`bash`, `editor`, `read_files`, `apply_patch`, `search`, `fetch_web`), persists sessions to SQLite, discovers config from `.kerberosec/` directories, and optionally connects to an RPC sidecar for scheduled agents and cross-process session management.

## Packages

The SDK is a layered stack. Use as much or as little as you need:

| Package | What it does |
|---------|-------------|
| `@kerberosec/sdk` | Everything you need -- install this one |
| `@kerberosec/core` | Sessions, persistence, built-in tools, config discovery, RPC |
| `@kerberosec/agents` | Stateless agent loop with tool execution and streaming |
| `@kerberosec/llms` | LLM provider gateway (Anthropic, OpenAI, Google, Bedrock, Mistral, and more) |
| `@kerberosec/shared` | Types, tool creation helpers, hook engine |

`@kerberosec/sdk` is an alias for `@kerberosec/core` that re-exports from all packages, so a single install gives you the full API. The individual packages are available if you want a minimal dependency footprint.

## CLI

The KerberoSec CLI gives you terminal access to the full SDK:

```bash
# Interactive agent
kerberosec

# Single prompt
kerberosec "Refactor the auth module to use JWT"

# Schedule an agent to run daily
kerberosec schedule create "PR summary" --cron "0 9 * * MON-FRI" --prompt "Summarize open PRs"

# Connect a Telegram bot created with @BotFather
kerberosec connect telegram -k "$TELEGRAM_BOT_TOKEN"
# Then send /help or /start to the bot in Telegram
```

For Telegram-specific connector behavior, see [`apps/cli/src/connectors/adapters/telegram.md`](./apps/cli/src/connectors/adapters/telegram.md).

## Providers

Works with every major LLM provider out of the box:

| Provider | Models |
|----------|--------|
| Anthropic | Claude Opus 4.7, Sonnet 4.6, Haiku 4.5 |
| OpenAI | GPT-5.5, GPT-5.3 Codex |
| Google | Gemini 3.1 Pro Preview, Gemini 3 Flash Preview |
| AWS Bedrock | Claude, Llama |
| Mistral | Mistral Large, Codestral |
| Any OpenAI-compatible | vLLM, Together, Fireworks, Groq, etc. |

## Documentation

Full documentation and examples are available in our [GitHub repository](https://github.com/KerberoSec/KerberoSec-CLI):

- [CLI Reference](apps/cli/README.md) -- interactive TUI, one-shot mode, and command-line flags
- [SDK Architecture](sdk/README.md) -- agents, sessions, tools, events, extensions, and hooks
- [Examples](sdk/examples) -- plugins, subagents, cron routines, and desktop integrations

## Contributing

To contribute to the project, start with our [Contributing Guide](../CONTRIBUTING.md) to learn the basics. You can also visit our [GitHub repository](https://github.com/KerberoSec/KerberoSec-CLI) to open issues, contribute PRs, or participate in discussions!

## License

[Apache 2.0 © 2026 Arun Kumar (KerberoSec)](../LICENSE)
