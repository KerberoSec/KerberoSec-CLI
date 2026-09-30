# CLI reference

```
binarypilot [FLAGS]
```

## CTF resolution (the primary entrypoint)

| Flag | Meaning |
|------|---------|
| `--challenge NAME_OR_URL` | CTF challenge to solve. URL: platform auto-inferred. Name: needs `--platform`. |
| `--platform {flagyard,htb}` | Required when `--challenge` is a name. |

URL shapes:
- `https://ctf.flagyard.com/labs/<lab_id>`: lab overview
- `https://ctf.flagyard.com/labs/<lab_id>/challenges/<challenge_id>`
- `https://app.hackthebox.com/challenges/<id>`
- `https://app.hackthebox.com/machines/<name_or_id>`
- `https://app.hackthebox.com/sherlocks/<id>`

Names use the platform's search API. **Exact match or loud failure**: never silently picks a near-match. Examples:

```bash
binarypilot --challenge "Lame" --platform htb
binarypilot --challenge "Web 01" --platform flagyard
binarypilot --challenge https://app.hackthebox.com/challenges/15
```

Constraints: `--challenge` is exclusive with `--target`, `--target-list`, `--resume`.

## Generic CTF mode

| Flag | Meaning |
|------|---------|
| `--instruction "..."` | Challenge objective, constraints, credentials, and expected flag format. |
| `--instruction-file PATH` | Read the generic CTF instruction from a file. |

Examples:

```bash
binarypilot \
  --target http://challenge.example:8080 \
  --instruction "Find and verify the flag. Expected format: CTF{...}."

binarypilot \
  --target ./challenge-files \
  --instruction-file ./solve-plan.md
```

Generic mode does not use HTB/FlagYard challenge metadata or submission APIs.

## Behavior control

| Flag | Meaning | Default |
|------|---------|---------|
| `-n`, `--non-interactive` | No TUI, exits on completion | interactive TUI |
| `-m`, `--scan-mode {quick,standard,deep}` | Solve intensity (how aggressive the agent tree is) | `deep` |
| `--instruction "..."` | One-line steering hint to the root agent |: |
| `--instruction-file PATH` | Steering from a file |: |
| `--max-turns N` | Per-agent turn ceiling | 500 |
| `--max-budget USD` | LLM cost ceiling across the run |: |
| `--resume RUN_NAME` | Resume a prior `binarypilot` run |: |
| `--scope-mode {auto,diff,full}` | Code-target scope mode (only for `--target`) | `auto` |
| `--diff-base COMMIT` | Baseline for diff scope |: |
| `--config PATH` | Alternative to `~/.binarypilot/cli-config.json` |: |
| `--update` | Self-update via PyPI |: |
| `-v`, `--version` | Print version |: |

## Legacy pentest flow (upstream strix behavior, kept)

`--target`, `--target-list`, `--scope-mode`, `--diff-base` accept URLs, git repos, local paths: same as strix. Documented here because the flags coexist with CTF mode; details in strix's docs until this fork supersedes them.

## Interactive TUI

The default `--challenge` flow runs inside a TUI: live agent graph, per-agent transcripts, tool-call browser, interactive input (`respond_to_user`). `-n` drops it for CI usage: logs to stdout, exits non-zero on failure.
