# How to use hackingtool

Step-by-step walkthroughs of the console. Every step below is something you type
and something you get back: no prior knowledge of the codebase needed.

> **Authorized targets only.** Everything here assumes you own the target or hold
> written permission to test it. hackingtool never runs a step without asking you
> first, and never invents results.

- [1. First run](#1-first-run)
- [2. Learn the grammar in 60 seconds](#2-learn-the-grammar-in-60-seconds)
- [3. Open and install a tool](#3-open-and-install-a-tool)
- [4. Find a tool that isn't in the catalog (`/find`)](#4-find-a-tool-that-isnt-in-the-catalog-find)
- [5. Plan and run an objective (`/goal`)](#5-plan-and-run-an-objective-goal)
- [6. Connect a model (`/config`)](#6-connect-a-model-config)
- [7. Add a GitHub token for `/find` (`/config github`)](#7-add-a-github-token-for-find-config-github)
- [8. Run tools in background panes](#8-run-tools-in-background-panes)
- [9. Headless mode: engagements, pipelines, reports](#9-headless-mode-engagements-pipelines-reports)

---

## 1. First run

1. Install it (see the [README](../README.md#installation)). From a checkout, the
   quickest path that puts `hackingtool` on your PATH is:

   ```bash
   git clone https://github.com/Z4nzu/hackingtool.git
   cd hackingtool
   pipx install .
   ```

2. Launch it:

   ```bash
   hackingtool
   ```

3. On the first launch hackingtool creates its home directory: nothing is
   written outside it:

   | Path | What it is |
   |---|---|
   | `~/.hackingtool/config.json` | your settings (defaults on first run) |
   | `~/.hackingtool/.env` | commented secrets template, `chmod 600`: no active secret in it |
   | `~/.hackingtool/tools/` | where tools you install are cloned/built |
   | `~/.hackingtool/history` | your `↑`/`↓` command history |

4. You land on the banner + prompt. The header line tells you what you have:
   OS, IP, and `22 categories · 217 active · 59 archived` (that count includes
   the built-in Update/Uninstall menu; the tool catalog itself is
   [21 categories / 215 tools](TOOLS.md)).

5. Type `/help` for the command card, and `q` (or `/quit`, `Ctrl-D`) to leave.

If your terminal isn't interactive, or `prompt_toolkit` isn't available, you get
the classic numbered menu instead: same features, numbers instead of commands.
Force it any time with `hackingtool --classic`.

---

## 2. Learn the grammar in 60 seconds

There are exactly three things you can type:

| You type | It means | Example |
|---|---|---|
| `/…` | a command you run | `/search subdomain` |
| `@…` | a thing you name | `@nmap`, `@tag:osint` |
| anything else | plain-English "what I want to do" | `crack a wifi handshake` |

Try these in order:

1. `/tags`: prints every tag with its tool count (63 tags in use).
2. `@tag:osint`: lists the tools carrying that tag, then lets you pick one by
   number.
3. `@nmap`: opens a tool straight away (matching is case-insensitive with a
   fuzzy fallback, so `@nmpa` still finds it).
4. `/search wordlist`: keyword search over names, descriptions and tags.
5. `crack a wifi handshake`: no slash, no at-sign: the recommender reads your
   words and shows matching tools.

Tab completes commands, tool names and tags. `↑`/`↓` walk your history.
`Ctrl-C` clears the current line; `Ctrl-D` exits.

---

## 3. Open and install a tool

1. Open it: `@nuclei` (or `/run nuclei`).
2. You get the tool's card: description, project link, and, where curated: a
   usage cheatsheet of real commands for common tasks.
3. Choose from the numbered menu:
   - `1` install the tool
   - `2` run it
   - `c` (or `cmd`) ask for the exact command for a goal, when the tool has a
     usage cheatsheet: it answers from the curated cheatsheet first, and only
     asks a model if nothing matches. Nothing is executed; you get a command to
     read and copy.
   - `98` open the project page
   - `99` back
4. Inside a category listing, `97` installs every not-yet-installed tool in that
   category and `98` opens the archived tools of that category (if it has any).

If a tool is already on your PATH from your distro (`apt`, `brew`, Kali's
metapackages), hackingtool reuses that binary instead of re-cloning it.

---

## 4. Find a tool that isn't in the catalog (`/find`)

`/find` answers "what should I use for X?": first from the 215 curated tools,
then from the GitHub search API, ranked with a reason for each hit. It is
**suggest-only**: it never clones, installs or runs anything, and it makes **zero
model calls**.

1. Ask in plain English:

   ```
   /find hidden directories on a website
   ```

2. You get two blocks:

   - **In your toolbox (vetted)**: matching tools already in the catalog.
   - **Found on GitHub: NOT vetted by us**: up to 5 maintained repos with
     stars, license, a one-line description, the reason each ranked
     (`16446★ · trusted author (ships in our catalog) · active · matches: fuzzer, web`)
     and a `git clone …` line to copy. Read the repo before you run it: that
     warning is there because nobody has vetted these for you.

3. To keep one, press `a` at the prompt, then the result number:

   ```
   [a] add one to your toolbox · [Enter] done: a
   which? 1-5: 2
   Added.  /Users/you/.hackingtool/found.yaml
   ```

4. What that writes: an entry in **`~/.hackingtool/found.yaml`** under a
   `Discovered tools` category: title, tags, description, project URL. It
   deliberately stores **no install or run command**, so a discovered entry can
   never execute anything; it is a bookmark that shows up in your menu and in
   `/search` on the next launch.

5. Out-of-scope asks are refused *before* any network call, with an authorized
   alternative where one exists:

   ```
   /find build a wifi jammer
   Out of scope: Jamming is a denial-of-service attack and is out of scope. For
   authorized work, wifi AUDITING tools test your own/scoped networks:
   aircrack-ng, hcxtools, wifite (offline WPA/WPA2 handshake cracking).
   ```

   Defensive and DFIR phrasing ("detect a SYN flood", "hunt for…", "triage AV
   false positives") is never refused.

Without a token you get 10 searches per minute from GitHub. See
[step 7](#7-add-a-github-token-for-find-config-github) to raise that to 30.

---

## 5. Plan and run an objective (`/goal`)

`/goal` turns one objective into a short, ordered plan of real commands, then
runs the steps **you** approve, one at a time.

1. State the objective:

   ```
   /goal find live subdomains of example.com
   ```

2. hackingtool plans (one model call, made against a vetted operator
   methodology) and prints the plan: each step's tool, the exact argv it would
   run, why it's there, and, for tools you don't have: an install hint.

3. Confirm authorization. Nothing runs before you answer `y`:

   ```
   ⚠  This goal will run tools against:  example.com
      Confirm you are AUTHORIZED to test this target? [y/N]
   ```

4. Approve step by step:

   ```
   ─ step 1/4 ─ subfinder -d example.com -silent
     [y] run  [s] skip  [e] edit  [q] abort  ›
   ```

   - `y` runs it (list-form, never through a shell) and prints the output when it
     finishes: steps run in the goal's workspace directory, with a 30-minute cap
   - `s` skips it
   - `e` lets you edit the command first: the edited command is what gets run
     *and* what gets logged
   - `q` aborts the rest

   Steps whose tool isn't installed are skipped automatically and reported at
   the end, with the install hint from the plan.

5. Everything lands in a timestamped workspace:

   ```
   ~/.hackingtool/goals/2026-07-26T18-40-12-123456/
   ├── plan.json          the drafted plan
   ├── run.log            UTC-stamped: authorization, per-step decision, outcome
   └── step-1-subfinder.txt   raw output of each step you ran
   ```

Two guarantees worth knowing: the model is called **once**, for planning only,
and tool output is **never** fed back to it, so nothing a target prints can
steer the next step. And a step is only ever a list of arguments, never a shell
string.

No model configured? `/goal` says so and falls back to plain tool
recommendations for the same objective.

---

## 6. Connect a model (`/config`)

The AI layer is opt-in and bring-your-own-key. Without it everything still works:
recommendations fall back to a keyword matcher, `/find` never needed a model, and
commands come from the curated cheatsheets.

**Option A: a hosted OpenAI-compatible endpoint**

1. Open the settings editor:

   ```
   /config
   ```

   `↑`/`↓` move, `←`/`→` change a value (saved immediately), `Enter` edits a
   free-text row, `t` tests the connection, `Esc` closes.

2. Set `ai_base_url` (e.g. `https://api.openai.com/v1`) and `ai_model`.
3. Select the `ai_key` row, press `Enter`, paste your key. It is masked while
   typing and written to `~/.hackingtool/.env` (mode 600): **never** to
   `config.json`, never printed back.
4. Test it:

   ```
   /config test
   ✓ AI connection OK  <your-model> replied 'connected'
   ```

**Option B: a local model with Ollama**

1. Install and start [Ollama](https://ollama.com), then `ollama pull llama3`.
2. Leave `ai_base_url` empty and set `ai_model` to the model you pulled.
3. `/config test` to confirm.

Any key can also be set in one line, e.g. `/config theme cyan`,
`/config show_archived true`, `/config background_runner off`. Environment
variables (`HACKINGTOOL_AI_BASE_URL`, `HACKINGTOOL_AI_MODEL`,
`HACKINGTOOL_AI_KEY`, `HACKINGTOOL_AI_PROVIDER`) always win over `config.json`.

---

## 7. Add a GitHub token for `/find` (`/config github`)

Optional. It buys one thing: GitHub's search rate limit goes from **10 to 30
requests per minute**. The token needs **no scopes and no permissions at all**: never grant it any.

1. Check your current state:

   ```
   /config github
   ○ GitHub  no token configured: unauthenticated search is 10 req/min
   ```

   hackingtool then prints the exact steps. They are:

2. GitHub → your profile picture → **Settings**
3. Left sidebar → **Developer settings**
4. **Personal access tokens → Fine-grained tokens → Generate new token**
5. Name it (e.g. `hackingtool-find`) and pick an expiration.
6. Resource owner: yourself. Repository access: **leave the default: do NOT
   select any repositories.**
7. Permissions: **select none at all.** (GitHub: *"Tokens always include
   read-only access to all public repositories on GitHub."*)
8. Generate the token and copy it.
9. Add it to `~/.hackingtool/.env` (the file is already `chmod 600`):

   ```
   HACKINGTOOL_GITHUB_TOKEN=ghp_your-token-here
   ```

10. Verify:

    ```
    /config github
    ✓ GitHub token OK  token OK: search limit 30 req/min
    ```

Classic tokens work too: **Developer settings → Tokens (classic) → Generate new
token → tick NO scopes at all.** `GITHUB_TOKEN` / `GH_TOKEN` from your
environment are picked up as well. The token is never echoed back and is only
ever sent to `api.github.com`.

---

## 8. Run tools in background panes

Long scans shouldn't block your console. If **tmux** is installed, hackingtool
keeps one detached session called `hackingtool` and gives each background job its
own labeled window.

1. Add ` &` to a `/run`:

   ```
   /run nmap -sV -oA scan 10.0.0.5 &
   ▶ started 'nmap' in background: /attach to view
   ```

   A bare `/run nmap &` opens a shell already `cd`'d into the tool's directory,
   with the tool's first cheatsheet command typed in as a comment.

2. See what's running: the status line under the prompt shows `▶ N running`, and:

   ```
   /panes          (alias /jobs)
     nmap (window 0)
   ```

3. Watch one: `/attach`: this hands your terminal to tmux. Press `Ctrl-b` then
   `d` to detach and come back to the console.
4. Stop one, or all: `/kill nmap` · `/kill all`.

No tmux? Nothing breaks: hackingtool says so and opens the tool inline instead.
Turn backgrounding off entirely with `/config background_runner off`.

---

## 9. Headless mode: engagements, pipelines, reports

The same catalog drives a non-interactive orchestrator, for CI or a scripted
engagement. Findings are normalized into one `findings.json` you can grep, diff
or feed into other tooling.

```bash
# create/extend an engagement and run the default recon pipeline against it
hackingtool --engagement acme --targets example.com --pipeline recon

# a file of targets, one per line
hackingtool --engagement acme --targets ./scope.txt --pipeline recon

# (re)generate the deterministic Markdown report
hackingtool --engagement acme --report

# opt-in AI passes over the REAL findings only
hackingtool --engagement acme --ai-summary
hackingtool --engagement acme --ai-report     # writes report.draft.md
```

`--engagement` is required in headless mode. Out-of-scope targets are flagged and
logged before anything runs. `--ai-summary` and `--ai-report` only ever
summarize findings that exist: the deterministic `report.md` is never
overwritten by the AI draft.

---

## Where things live

| Path | Contents |
|---|---|
| `~/.hackingtool/config.json` | settings (`/config`) |
| `~/.hackingtool/.env` | API key + GitHub token, mode 600 |
| `~/.hackingtool/found.yaml` | tools you kept from `/find` |
| `~/.hackingtool/goals/<utc-timestamp>/` | `/goal` plan, run log, step output |
| `~/.hackingtool/tools/` | installed tools |
| `~/.hackingtool/hackingtool.log` | command/audit log |
| `~/.hackingtool/history` | prompt history |

Related reading: [full tool catalog](TOOLS.md) ·
[operator playbook](../src/hackingtool/skill/OPERATOR.md) (also `/skill`) ·
[SECURITY.md](../SECURITY.md) · [CONTRIBUTING.md](../CONTRIBUTING.md)
