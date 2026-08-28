# Provider VCR fixtures

These cassettes exercise the real provider adapters in `@kerberosec/llms` without
requiring credentials during normal test runs.

Run playback from `sdk/`:

```sh
bun -F @kerberosec/llms test:vcr
```

Refresh the cassettes from local provider credentials:

```sh
LLMS_PROVIDER_VCR_RECORD=1 bun -F @kerberosec/llms test:vcr
```

Refresh one cassette by provider id or cassette name:

```sh
LLMS_PROVIDER_VCR_RECORD=1 LLMS_PROVIDER_VCR_TARGET=kerberosec bun -F @kerberosec/llms test:vcr
```

Record mode prefers the normal KerberoSec CLI provider settings path. To use another
file, set `LLMS_PROVIDER_VCR_SETTINGS_PATH=/path/to/providers.json`.
`ANTHROPIC_API_KEY` and `KERBEROSEC_API_KEY` can be used without a settings file, but
ChatGPT OAuth needs saved `openai-codex` provider settings. For local KerberoSec API
recording, also set `KERBEROSEC_ENVIRONMENT=local`.

After recording, the test normalizes dynamic response fields such as response
IDs, encrypted reasoning payloads, prompt cache keys, and safety identifiers.
