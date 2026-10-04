# LLM providers

BinaryPilot uses [LiteLLM](https://docs.litellm.ai/) under the hood; every litellm-supported provider works.

## Set the model

```bash
export BINARYPILOT_LLM="openai/gpt-5.4"     # or "anthropic/claude-sonnet-4-6", "vertex_ai/gemini-3-pro-preview", "litellm/<route>", "ollama/<model>", etc.
```

`BINARYPILOT_LLM` accepts whatever LiteLLM accepts, including prefixed routes (`litellm/<model>`, `bedrock/<model>`, `azure/<deployment>`) and chatgpt subscription routes via `binarypilot auth`.

## Set the key

| Provider | Env var |
|---|---|
| OpenAI | `LLM_API_KEY` (or `OPENAI_API_KEY`) |
| Anthropic | `LLM_API_KEY` (or `ANTHROPIC_API_KEY`) |
| Vertex AI | `GOOGLE_APPLICATION_CREDENTIALS` |
| Azure OpenAI | `AZURE_API_KEY` + `AZURE_API_BASE` + `AZURE_API_VERSION` |
| Bedrock | AWS creds via env or shared config |
| Perplexity (web research tool) | `PERPLEXITY_API_KEY` |
| Local model (Ollama, LMStudio, vLLM) | `LLM_API_BASE=http://localhost:11434` + whatever your server wants |

## ChatGPT subscription

Instead of an API key, proxy through your ChatGPT account:

```bash
binarypilot auth login chatgpt
export BINARYPILOT_LLM="chatgpt/gpt-5.4"
binarypilot --challenge "Lame" --platform htb
binarypilot auth status
binarypilot auth logout
```

## Reasoning effort

```bash
export LLM_REASONING_EFFORT="high"   # none|minimal|low|medium|high|xhigh|max
```

Default `high`. `quick` scans use `medium`.

## Recommended models for CTF solving

| Use | Model |
|---|---|
| Default / writes | `openai/gpt-5.4` |
| Deep analysis and careful report writing | `anthropic/claude-sonnet-4-6` |
| Long-context target analysis | `vertex_ai/gemini-3-pro-preview` |
| Free/local | `ollama/<model>` with enough context |

## Model quality knobs

| Env | Default | What it does |
|---|---|---|
| `BINARYPILOT_REASONING_EFFORT` | `high` | LiteLLM `reasoning_effort` pass-through where supported |
| `LLM_TIMEOUT` | `300` | Per-call HTTP timeout in seconds |
| `LLM_DISABLE_STREAMING` | unset | `1` to disable streaming (needed for some cheap providers) |
| `LLM_EXTRA_HEADERS` | unset | JSON map of extra HTTP headers, e.g. `{"x-api-key2":"..."}` |

## Limits worth knowing

- Context window: tracked automatically, wrapped at `--max-turns` / `--max-budget` boundaries.
- Persistence between runs: run-specific. Cross-run hints with `--instruction "<context>"`.
- The `dedupe` LLM (used for vuln-report dedup during CTF flows when applicable) inherits its own overrides via `BINARYPILOT_DEDUPE_MODEL`, `DEDUPE_LLM_API_KEY`, `DEDUPE_LLM_API_BASE`.
