# Model connectors

Flagwatch does not require a model. The deterministic parser handles clear rule language first. A configured model can fill in cited public event details or rules that the parser cannot classify.

## Supported providers

| Provider value | Protocol | Typical endpoint |
| --- | --- | --- |
| `openai` | OpenAI-compatible chat completions with JSON Schema | `https://api.openai.com/v1` |
| `azure_openai` | OpenAI-compatible chat completions with `api-key` authentication | Your Azure OpenAI or Foundry endpoint |
| `anthropic` | Anthropic Messages API | `https://api.anthropic.com` |
| `deepseek` | OpenAI-compatible chat completions with JSON object output | `https://api.deepseek.com` |
| `litellm` | OpenAI-compatible LiteLLM proxy | `http://litellm:4000` |
| `local` | OpenAI-compatible local server | The server's local `/v1` base URL |

The model name is never hard-coded into event logic. Change these settings to replace DeepSeek with OpenAI, Anthropic, Azure OpenAI, LiteLLM, Ollama through an OpenAI-compatible gateway, vLLM, or another compatible local service:

```text
FLAGWATCH_AI_ENABLED=true
FLAGWATCH_AI_PROVIDER=openai
FLAGWATCH_AI_ENDPOINT=https://api.openai.com/v1
FLAGWATCH_AI_MODEL=gpt-5-mini
FLAGWATCH_AI_API_KEY=<secret>
```

For Anthropic, set `FLAGWATCH_AI_PROVIDER=anthropic`, the Messages API base URL, and an Anthropic model name. For an unauthenticated local endpoint, leave `FLAGWATCH_AI_API_KEY` empty.

## LiteLLM sidecar

The optional Docker profile runs LiteLLM beside Flagwatch. Put the upstream model, URL, and secret in `.env`:

```text
FLAGWATCH_AI_ENABLED=true
FLAGWATCH_AI_PROVIDER=litellm
FLAGWATCH_AI_ENDPOINT=http://litellm:4000
FLAGWATCH_AI_MODEL=flagwatch-model
FLAGWATCH_AI_API_KEY=<same value as LITELLM_MASTER_KEY>

LITELLM_MASTER_KEY=<proxy key>
FLAGWATCH_LITELLM_UPSTREAM_MODEL=<LiteLLM model identifier>
FLAGWATCH_LITELLM_UPSTREAM_URL=<optional upstream base URL>
FLAGWATCH_LITELLM_UPSTREAM_KEY=<upstream secret>
```

Then start the profile:

```sh
docker compose --profile litellm up -d --build
```

[`docker/litellm.example.yaml`](../docker/litellm.example.yaml) maps the stable `flagwatch-model` alias to that upstream. The application stays unchanged when the upstream model changes.

## PydanticAI

PydanticAI is a separate Python agent framework. Flagwatch does not use it and does not need it. Flagwatch uses ordinary Pydantic models to validate configuration and model JSON against strict schemas. The model receives bounded public text, has no tools, cannot browse on its own, and cannot cause writes or Discord actions.

## Evidence gate

Model output is advisory until it passes all checks:

- Each claim must match the expected JSON schema.
- Each exact evidence quote must appear on the declared fetched page.
- The source URL must be one Flagwatch actually read.
- Conflicting or stale evidence cannot trigger an alert.
- Model text is normalized before it reaches a public artifact.

Unsupported claims are discarded rather than guessed into the calendar.
