# Contributing

Welcome. BinaryPilot is a laser-focused tool: contributions keep it that way.

## Dev setup

```bash
git clone https://github.com/0xIDA/binarypilot.git
cd binarypilot
uv sync                        # installs dev extras
uv run pre-commit install
```

Dependencies managed by `uv`. `make setup-dev` is an alias for the same steps.

## Code quality

```bash
make format lint type-check security   # or `make check-all` for everything
```

- ruff: format + lint
- mypy/Pyright: strict
- bandit: static security
- pytest: `tests/`

## Skills

Skills are markdown playbooks at `binarypilot/skills/<category>/<name>.md`. Format mirrors the existing vendored ones: frontmatter `{name, description}`, then actionable commands and code snippets. No GUI-only tools (no Ghidra/IDA workflows).

## Pull requests

- One scoped change per PR.
- Ruff/format/lint/type-check pass.
- Tests for new code (assert-style minimal tests).
- Brief PR description: what changed and why. PR template is minimal on purpose.

## Testing a change

```bash
uv run pytest tests -q
uv run binarypilot --challenge https://ctf.flagyard.com/labs/12/challenges/34 -n
```

The full-suite test is known to carry a pre-existing upstream flake in `tests/test_execution.py::test_finish_scan_bypasses_active_agent_guard_after_reserve`. Everything else must pass.

## Commit style

```
Component: short imperative summary

Optional body. Wrap at 80. One topic per commit.
```

Current convention on `main`:

- `Phase N[ab]: ...` for major milestones
- `Verify: ...` for verification-state markers
- `Docs: ...`, `Bug fix: ...`, `Refactor: ...` for deltas between phases

## Version bumps and the sandbox image

The runtime defaults `image` to `ghcr.io/0xida/binarypilot-sandbox:<installed-version>`
(see `binarypilot/config/settings.py`). That means **every `version` bump in
`pyproject.toml` needs a matching image push** before users see it:

```bash
docker login ghcr.io -u 0xIDA --password-stdin < <(gh auth token)
docker build -f containers/Dockerfile -t ghcr.io/0xida/binarypilot-sandbox:<X.Y.Z> .
docker push ghcr.io/0xida/binarypilot-sandbox:<X.Y.Z>
```

If `<X.Y.Z>` isn't on the registry, users on the fresh install/upgrade path
hit `failed to resolve reference` (1.6.4 lesson: image was bumped for the
version-coupling change but not pushed until later, breaking first-run).
