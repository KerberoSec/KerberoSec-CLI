# Advanced

Knobs you usually want defaults for. Read when the defaults don’t hold.

## `--config PATH`

Load settings from a different JSON file than `~/.binarypilot/cli-config.json`. Useful for CI (per-runner ephemerals) or running multiple identities on one box.

## `--max-turns N`

Ceiling per agent. Default `500`. Root agent gets the same cap: a run wide enough can hit it on either side. Increase for hard challenges in `deep` mode; decrease for budget sanity.

## `--max-budget USD`

LLM cost ceiling for the whole run. Graduated wrap-up warnings fire to all agents as it’s approached; the run closes cleanly at the limit.

## `--scope-mode {auto,diff,full}` + `--diff-base COMMIT`

Only meaningful for `--target` (pentest) flows, not `--challenge`. Auto-scopes code reviews to the diff when running in CI/PR contexts; explicit `--diff-base` pins the merge-base. Skip if you only use CTF mode.

## Agent tuning

- `BINARYPILOT_REASONING_EFFORT`: think depth; affects solve style (high → careful verify).
- `BINARYPILOT_FORCE_REQUIRED_TOOL_CHOICE=1`: force structured tool choice even for providers that normally support `auto`. Can reduce weird output on weaker models.
- `BINARYPILOT_PROMPT_CACHE=0`: disable prompt caching for one-shot providers.
- `LLM_TIMEOUT=300`: per-call timeout in seconds; raise for very slow models.

## Sandbox controls

- `BINARYPILOT_IMAGE`: override the sandbox image tag. Defaults to `ghcr.io/0xida/binarypilot-sandbox:1.2.0`.
- `BINARYPILOT_RUNTIME_BACKEND`: sandbox backend (default `docker`). One backend supported right now; setting anything else errors out.

## Resume robustness

- `--resume` re-binds to the prior run's directory. Chat state, todos, notes, the writeups, and the agent tree snapshot all reload from disk.
- Resume conflicts are guarded: you cannot pass `--target`/`--challenge` at the same time; the run’s target list comes from the snapshot.

## Run output layout

```
binarypilot_runs/<run-name>/
├── run.json                 run record + identifiers
├── solve_report.md          consolidated narrative (finish_solve artifact)
├── solves.json              indexed solve artifacts
├── writeups/<id>-<slug>.md  one markdown writeup per confirmed solve
├── vulnerabilities.json     strix-style vuln findings (used for web-CTF where applicable)
├── findings.sarif           CI-integrable severity findings
├── transcript.json          full agent transcript
└── agents/                  per-agent state + history
```
