# Contributing to hackingtool

Thanks for helping. hackingtool serves the whole ethical-hacking spectrum: offensive/red-team, defensive/blue-team, OSINT, bug-bounty, CTF/THM learners,
forensics/IR: all working **legally and with authorization**. Contributions should
help each of those users in their own workflow.

## Ground rules (non-negotiable)

These are enforced in review and, where possible, by CI:

- **Authorized targets only.** No feature assumes access to systems the operator
  doesn't own or isn't explicitly permitted to test.
- **No fabrication.** AI outputs are validated against closed sets; catalog commands
  must be **real, documented invocations**: never invented flags or made-up tools.
- **List-form `subprocess` only.** Never `shell=True` with interpolated input.
- **Pin + verify external downloads.** Fetches are pinned and SHA-256 checked.
  **No `curl | bash`, ever.**
- **No forced `sudo`.** Tools install into `~/.hackingtool/`, not system paths.
- **Linux/macOS first.** Deprioritize Windows-only `.exe` tools.

## Dev setup

```bash
git clone https://github.com/Z4nzu/hackingtool.git
cd hackingtool
make setup            # one-time: point git at .githooks (pre-push runs the gate)
uv run hackingtool    # run from source (uv provides rich/pyyaml/platformdirs)
```

## The gate: run it before every PR

```bash
make check            # ruff (must-fix lint) + pytest + catalog/schema validation
```

This is the exact script CI and the pre-push hook run (`scripts/check.sh`). A PR is
reviewed as a rubber-stamp of a green gate, so **make it green and add a check for
non-trivial logic** (an `assert`-based self-check or a small `test_*.py`).

## Adding a tool

There are two paths. **Prefer the catalog**: it's data-driven and one entry, no code.

### 1. Catalog entry (preferred)

Add or extend a YAML file in `src/hackingtool/catalog/`. You can define a new tool or
**overlay** guidance onto an existing one (matched by exact `title`):

```yaml
overlay:
  - title: "Subfinder (Subdomain Enumeration)"
    tags: [subdomain-enum, recon, osint, dns]   # every tag must be in tags.py TAXONOMY
    usage:
      - ["passive subdomain enum", "subfinder -d <domain>"]
      - ["clean output for pipelines", "subfinder -d <domain> -silent"]
```

- **Tags** must all exist in `src/hackingtool/tags.py` `TAXONOMY`: the single
  discovery vocabulary. Propose a new tag in that file only when a tool needs it.
- **`usage`** is `[description, command]` pairs. Commands must be canonical and
  documented; use placeholders (`<domain>`, `<target>`) for operator-supplied values.
- Surveillance / C2 / keylogger / RAT tools get **tags only: no operational commands.**

The gate validates that catalog tags are in the taxonomy and that overlay titles match
real tools, so a typo fails CI rather than silently no-op'ing.

### 2. Python tool class (legacy path)

For tools that need custom install/run logic, add a class to the right `tools/*.py`
file and follow the [pull-request template](.github/PULL_REQUEST_TEMPLATE.md)
checklist (`TITLE`, `DESCRIPTION`, `INSTALL_COMMANDS`, `RUN_COMMANDS`, `PROJECT_URL`,
`SUPPORTED_OS`, and adding it to the collection's `TOOLS` list). Installers must be
list-form and, for any download, pinned + SHA-256 verified.

## Pull requests

- Branch off `master`; **never commit to `master` directly.**
- Title format: `[New Tool] Name: Category`, `[Fix] …`, or `[Improve] …`
  (see the PR template).
- Describe **what changed** and **what you tested**: every PR carries test notes.
- One logical change per PR.

## Reporting bugs & security issues

- Functional bugs → open an issue with the **Bug report** template.
- Security vulnerabilities → **do not** open a public issue; follow
  [SECURITY.md](SECURITY.md).

By contributing you agree your work is licensed under the project's
[MIT License](LICENSE).
