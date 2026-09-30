<div align="center">

*[Image: HackingTool]*

### AI-guided, all-in-one toolkit for authorized security testing

**215 curated tools across 21 categories**: recon, OSINT, web, wireless, phishing,
forensics, post-exploitation and more: with an **AI layer that turns plain English
into the right tool and the exact command**.

**Built for** penetration testers · red teamers · blue-team/SOC and DFIR analysts ·
OSINT researchers · bug-bounty hunters · CTF players · security researchers and
students: all working **legally, on systems they own or are authorised to test**.

<a href="https://trendshift.io/repositories/869" target="_blank" rel="noopener noreferrer"><img src="https://trendshift.io/api/badge/repositories/869" alt="Z4nzu/hackingtool | Trendshift" width="250" height="55"/></a> <a href="https://trendshift.io/repositories/869" target="_blank" rel="noopener noreferrer"><img src="https://trendshift.io/api/badge/trendshift/repositories/869/daily?language=Python" alt="Z4nzu/hackingtool | Trendshift daily" width="250" height="55"/></a> <a href="https://trendshift.io/repositories/869" target="_blank" rel="noopener noreferrer"><img src="https://trendshift.io/api/badge/trendshift/repositories/869/weekly" alt="Z4nzu/hackingtool | Trendshift weekly" width="250" height="55"/></a>

<br/><br/>

[![License](https://img.shields.io/github/license/Z4nzu/hackingtool?style=flat-square&labelColor=0D1117&color=7B61FF)](LICENSE) [![Python](https://img.shields.io/badge/Python-3.10+-0D1117?style=flat-square&labelColor=0D1117&logo=python&logoColor=7B61FF)](https://www.python.org/) [![Stars](https://img.shields.io/github/stars/Z4nzu/hackingtool?style=flat-square&labelColor=0D1117&color=7B61FF)](https://github.com/Z4nzu/hackingtool/stargazers) [![Forks](https://img.shields.io/github/forks/Z4nzu/hackingtool?style=flat-square&labelColor=0D1117&color=7B61FF)](https://github.com/Z4nzu/hackingtool/network/members) [![Issues](https://img.shields.io/github/issues/Z4nzu/hackingtool?style=flat-square&labelColor=0D1117&color=7B61FF)](https://github.com/Z4nzu/hackingtool/issues) [![Last Commit](https://img.shields.io/github/last-commit/Z4nzu/hackingtool?style=flat-square&labelColor=0D1117&color=7B61FF)](https://github.com/Z4nzu/hackingtool/commits/master) [![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-DB61A2?style=flat-square&labelColor=0D1117&logo=githubsponsors&logoColor=DB61A2)](#support--sponsor)

<br/>

![](https://img.shields.io/badge/21_Categories-7B61FF?style=for-the-badge&labelColor=0D1117) &nbsp;![](https://img.shields.io/badge/215_Tools-7B61FF?style=for-the-badge&labelColor=0D1117) &nbsp;![](https://img.shields.io/badge/63_Tags-7B61FF?style=for-the-badge&labelColor=0D1117) &nbsp;![](https://img.shields.io/badge/AI--Guided-7B61FF?style=for-the-badge&labelColor=0D1117&logo=openai&logoColor=white) &nbsp;![](https://img.shields.io/badge/Linux_%7C_Kali_%7C_Parrot_%7C_macOS-7B61FF?style=for-the-badge&labelColor=0D1117&logo=linux&logoColor=white)

<br/>

<a href="#installation"><img src="https://img.shields.io/badge/Install_Now-7B61FF?style=for-the-badge&logo=rocket&logoColor=white" alt="Install Now"></a>&nbsp; <a href="docs/HOW-TO-USE.md"><img src="https://img.shields.io/badge/How_to_Use-30363D?style=for-the-badge&logo=gnometerminal&logoColor=white" alt="How to Use"></a>&nbsp; <a href="docs/TOOLS.md"><img src="https://img.shields.io/badge/Tool_Catalog-30363D?style=for-the-badge&logo=github&logoColor=white" alt="Tool Catalog"></a>&nbsp; <a href="#support--sponsor"><img src="https://img.shields.io/badge/%E2%9D%A4_Sponsor-DB61A2?style=for-the-badge&logo=githubsponsors&logoColor=white" alt="Sponsor"></a>

</div>

---

## Contents

- [Why hackingtool](#why-hackingtool)
- [Tool Categories](#tool-categories)
- [Installation](#installation)
  - [From source with pipx (recommended)](#from-source-with-pipx-recommended)
  - [For development](#for-development)
  - [Docker](#docker)
  - [Optional runtimes](#optional-runtimes)
- [Quick Commands](#quick-commands)
  - [Command reference](#command-reference)
- [Features](#features)
  - [🔎 `/find`: a tool for a need you don't have yet](#-find--a-tool-for-a-need-you-dont-have-yet)
  - [🎯 `/goal`: plan an objective, run it one step at a time](#-goal--plan-an-objective-run-it-one-step-at-a-time)
  - [🧠 Recommendations: say what you want in plain English](#-recommendations--say-what-you-want-in-plain-english)
  - [🏷 Tags and search](#-tags-and-search)
  - [▶ Background panes (tmux)](#-background-panes-tmux)
  - [⚙ Settings and the AI layer](#-settings-and-the-ai-layer)
  - [📋 Headless engagements](#-headless-engagements)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Support & Sponsor](#support--sponsor)
- [Social](#social)

---

## Why hackingtool

- **🧠 AI-guided workflow**: describe what you want ("find subdomains of example.com")
  and it maps your intent to the right tools, hands you the exact documented command,
  plans an objective step by step, then summarizes findings and drafts an engagement
  report. Bring your own key or run a local model: nothing auto-executes and nothing
  is fabricated.
- **🗂 215 curated tools, one console**: install and run across 21 categories without
  hunting down Git repos; a fixed tag taxonomy (63 tags in use) makes every tool
  discoverable.
- **🔎 It knows what it doesn't have**: `/find` searches your catalog first, then the
  GitHub API, and shows real maintained projects with the reason each was ranked.
- **🛡 Safe by default**: standard installs, **no `curl | bash`**, downloads pinned +
  SHA-256 verified, list-form `subprocess`, no forced `sudo`, and
  [signed releases with an SBOM](SECURITY.md#verifying-a-release).
- **🎯 For the whole spectrum**: red team, blue team, OSINT, bug bounty, CTF/THM,
  forensics/IR: all on **authorized targets only**.

<div align="center">
*[Image: hackingtool console: banner with live system readout and the / command palette]*
<br/>
<sub>The console on launch: live system readout, and <code>/</code> opens the command palette.</sub>
</div>

---

## Tool Categories

**215 tools across 21 categories**: the full list, with links and tags, is in
**[docs/TOOLS.md](docs/TOOLS.md)**.

<div align="center">

| # | Category | Tools | | # | Category | Tools |
|:---:|---|:---:|---|:---:|---|:---:|
| 1 | 🛡 [Anonymously Hiding Tools](docs/TOOLS.md#-anonymously-hiding-tools) | 5 | | 12 | 🔁 [Reverse engineering tools](docs/TOOLS.md#-reverse-engineering-tools) | 10 |
| 2 | 🔍 [Information gathering tools](docs/TOOLS.md#-information-gathering-tools) | 26 | | 13 | ⚡ [DDOS Attack Tools](docs/TOOLS.md#-ddos-attack-tools) | 7 |
| 3 | 📚 [Wordlist Generator](docs/TOOLS.md#-wordlist-generator) | 8 | | 14 | 🖥 [Remote Administrator Tools (RAT)](docs/TOOLS.md#-remote-administrator-tools-rat) | 4 |
| 4 | 📡 [Wireless attack tools](docs/TOOLS.md#-wireless-attack-tools) | 17 | | 15 | 🧪 [XSS Attack Tools](docs/TOOLS.md#-xss-attack-tools) | 6 |
| 5 | 💉 [SQL Injection Tools](docs/TOOLS.md#-sql-injection-tools) | 7 | | 16 | 🖼 [Steganography Tools](docs/TOOLS.md#-steganography-tools) | 10 |
| 6 | 🎣 [Phishing attack tools](docs/TOOLS.md#-phishing-attack-tools) | 13 | | 17 | 🏢 [Active Directory Tools](docs/TOOLS.md#-active-directory-tools) | 10 |
| 7 | 🌐 [Web Attack tools](docs/TOOLS.md#-web-attack-tools) | 23 | | 18 | ☁ [Cloud Security Tools](docs/TOOLS.md#-cloud-security-tools) | 7 |
| 8 | 🔧 [Post exploitation tools](docs/TOOLS.md#-post-exploitation-tools) | 15 | | 19 | 📱 [Mobile Security Tools](docs/TOOLS.md#-mobile-security-tools) | 6 |
| 9 | 🕵 [Forensic tools](docs/TOOLS.md#-forensic-tools) | 12 | | 20 | ✨ [Other tools](docs/TOOLS.md#-other-tools) | 10 |
| 10 | 📦 [Payload creation tools](docs/TOOLS.md#-payload-creation-tools) | 6 | | 21 | 🔑 [Password / Hash Cracking](docs/TOOLS.md#-password--hash-cracking) | 7 |
| 11 | 🧰 [Exploit framework](docs/TOOLS.md#-exploit-framework) | 6 | | | | |

</div>

<sub>59 further entries are archived (unmaintained or dead upstream) and hidden unless
you set `show_archived true` via `/config`. The in-app header counts 22 categories /
217 tools because it also counts the built-in Update / Uninstall menu.</sub>

---

## Installation

Requires **Python 3.10+** on **Linux or macOS** (Kali, Parrot, Debian/Ubuntu, Arch,
…). Windows is not supported: the app tells you so and exits. No `curl | bash`:
every path below is a standard, verifiable install.

### From source with pipx (recommended)

[pipx](https://pipx.pypa.io) installs hackingtool into its own isolated environment
and puts the `hackingtool` command on your PATH, so you can launch it from any
directory.

```bash
# 1: get the code
git clone https://github.com/Z4nzu/hackingtool.git
cd hackingtool

# 2: install it onto your PATH (isolated venv, no system Python touched)
pipx install .

# 3: run it from anywhere
hackingtool
```

No pipx yet?

```bash
# macOS
brew install pipx && pipx ensurepath

# Debian / Ubuntu / Kali
sudo apt install pipx && pipx ensurepath
```

Open a new shell after `pipx ensurepath` so the PATH change takes effect.
To update later: `git pull && pipx install . --force`. To remove it:
`pipx uninstall hackingtool`.

<details>
<summary>Alternative: <code>uv tool install .</code> (same result, uses uv instead of pipx)</summary>

```bash
git clone https://github.com/Z4nzu/hackingtool.git
cd hackingtool
uv tool install .        # installs the `hackingtool` executable on your PATH
hackingtool
```
</details>

<details>
<summary>Alternative: plain venv + pip (no PATH changes)</summary>

```bash
git clone https://github.com/Z4nzu/hackingtool.git
cd hackingtool
python3 -m venv .venv && . .venv/bin/activate
pip install .            # or: pip install -e .   for an editable dev install
hackingtool
```

The command is only on your PATH while that venv is activated.
</details>

### For development

[uv](https://docs.astral.sh/uv/) creates the virtualenv and installs everything from
`pyproject.toml` / `uv.lock` in one step:

```bash
git clone https://github.com/Z4nzu/hackingtool.git
cd hackingtool
uv sync
uv run hackingtool
```

No uv yet? `pipx install uv` (or see the
[uv install docs](https://docs.astral.sh/uv/getting-started/installation/)).

**Contributing?** `make setup` wires the pre-push hook and `make check` runs the full
gate (lint + tests + catalog validation). See [CONTRIBUTING.md](CONTRIBUTING.md).

### Docker

Pull and run the published image:

```bash
docker run -it --rm hardikzinzu/hackingtool:latest
```

Or build it locally from a checkout:

```bash
git clone https://github.com/Z4nzu/hackingtool.git && cd hackingtool
docker build -t hackingtool .
docker run -it --rm hackingtool
```

<!-- Hidden until these distribution channels are live. Restore when the package
     is published to PyPI and the .deb is attached to a release.

### pipx / pip from PyPI

```bash
pipx install hackingtool
hackingtool
```

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install hackingtool
hackingtool
```

### Debian / Ubuntu / Kali (.deb)

Grab the `.deb` from the [latest release](https://github.com/Z4nzu/hackingtool/releases/latest):

```bash
sudo apt install ./hackingtool_*.deb
hackingtool
```
-->

### Optional runtimes

Some individual tools need a language runtime to install/run; the core app doesn't.

| Dependency | Version | Needed for |
|---|---|---|
| Go | 1.21+ | nuclei, ffuf, amass, httpx, katana, dalfox, gobuster, subfinder |
| Ruby | any | haiti, evil-winrm |
| tmux | any | background panes (`/run … &`, `/panes`, `/attach`) |
| Docker | any | Mythic, MobSF (optional) |

---

## Quick Commands

Launch `hackingtool` and type. There are only three kinds of input:

| You type | It means | Example |
|---|---|---|
| `/…` | a command you run | `/search subdomain` |
| `@…` | a thing you name | `@nmap`, `@tag:osint` |
| anything else | plain English "what I want to do" | `crack a wifi handshake` |

<div align="center">
*[Image: typing @ in the hackingtool console completes tool names]*
<br/>
<sub><code>@</code> completes tool names: <code>@tag:</code> completes tags, <code>/</code> completes commands.</sub>
</div>

### Command reference

| Command | Aliases | What it does |
|---|---|---|
| `/run <tool> [args] [&]` | `/open` | open a tool's menu; with a trailing `&` it runs in a background tmux pane instead (that's where `args` are used) |
| `/search <keyword>` | | search tools by name, description or tag |
| `/tags` | | list every tag with its tool count |
| `/ai <goal>` | `/recommend`, `/r` | recommend tools for a goal |
| `/goal <objective>` | | AI-plan an objective and run it step by step, with per-step confirmation |
| `/find <need>` | `/discover` | find tools for a need: your catalog first, then GitHub (suggest-only) |
| `/panes` | `/jobs` | list background panes |
| `/attach` | | attach to the background session (`Ctrl-b` `d` to return) |
| `/kill <label\|all>` | | kill one background pane, or all of them |
| `/config [key value]` | | view/change settings; `/config test` checks the AI connection, `/config github` checks the GitHub token |
| `/skill` | | show the operator playbook |
| `/update` · `/uninstall` | `/remove` | update system packages or hackingtool · remove hackingtool and its tools |
| `/clear` | `/cls` | clear the screen |
| `/back` | `/b` | leave the current tool and go back |
| `/help` | `/?`, `/h` | quick reference card |
| `/quit` | `/q`, `/exit` | exit (also `q`, `Ctrl-C`, `Ctrl-D`) |
| `@<tool>` | | open a tool (case-insensitive, fuzzy fallback) |
| `@tag:<tag>` | | list and pick from the tools carrying that tag |

Inside a category: `1: N` pick a tool · `97` install everything not yet installed ·
`98` archived tools · `99` back.
Inside a tool: `1` install · `2` run · `c` ask for the exact command for your goal ·
`98` project page · `99` back.

<div align="center">
*[Image: hackingtool /help quick reference card]*
<br/>
<sub><code>/help</code>: the same card, in the app.</sub>
</div>

On a non-interactive terminal (or without `prompt_toolkit`) hackingtool falls back to
the classic numbered menu, where `/` or `s` searches, `t` filters by tag, `r` or `a`
recommends, `?` helps and `q` quits. Force it with `hackingtool --classic`.

> **New here?** [docs/HOW-TO-USE.md](docs/HOW-TO-USE.md) walks through each of these
> start to finish with numbered steps.

---

## Features

### 🔎 `/find`: a tool for a need you don't have yet

Searches the 215 curated tools first, then the GitHub search API, and ranks the
results explainably. **Suggest-only**: it never clones, installs or runs anything, and it makes **zero model calls**.

```
/find crack a wpa handshake

In your toolbox (vetted)
  • aircrack-ng (WiFi security suite)
  • Kismet (wireless detector / WIDS)
  • Reaver (WPS PIN attack)
  • WiGLE (wardriving map & API)
  • hashcat example hashes (WPA mode 22000)

Found on GitHub: NOT vetted by us

  wifiphisher/wifiphisher  14713★  GPL-3.0
    The Rogue Access Point Framework
    14713★ · trusted author (ships in our catalog) · active · matches: security, wifi
    git clone https://github.com/wifiphisher/wifiphisher
  …
```

Press `a` to keep a result: it is saved to `~/.hackingtool/found.yaml` as a
"Discovered tools" entry: title, tags, description, link, and **no install or run
command**, so a discovered entry can never execute anything. It shows up in your menu
and in `/search` next launch.

Out-of-scope asks (jamming, DoS, mass-targeting, malware) are refused **before any
network call**, with an authorized alternative where one exists. Defensive/DFIR
phrasing is never refused.

Works anonymously at 10 GitHub searches/minute; a **no-scope, no-permission** token
raises that to 30: see
[`/config github`](docs/HOW-TO-USE.md#7-add-a-github-token-for-find-config-github).

### 🎯 `/goal`: plan an objective, run it one step at a time

```
/goal find live subdomains of example.com
```

hackingtool drafts a short plan of real commands (with the reason for each step and
an install hint for tools you don't have), asks you to confirm you are **authorized**
to test the target, then walks the steps: `[y]` run · `[s]` skip · `[e]` edit ·
`[q]` abort. Every step runs list-form: never through a shell, and each goal gets a
timestamped workspace under `~/.hackingtool/goals/` holding `plan.json`, a
UTC-stamped `run.log`, and the raw output of each step.

The model is called **once**, for planning; tool output is never fed back to it. With
no model configured, `/goal` degrades to tool recommendations for the same objective.

### 🧠 Recommendations: say what you want in plain English

Bare text (or `/ai`) maps intent to tools. The model may only return tags from the
fixed taxonomy, and the catalog resolves tags → tools, so a tool can never be
invented; with no model reachable a stdlib keyword matcher answers instead.

<div align="center">
*[Image: hackingtool /ai: pick a common task or describe your own]*
<br/>
<sub><code>/ai</code>: pick one of the common tasks, or type the job in your own words.</sub>
</div>

### 🏷 Tags and search

`/tags` prints every tag in use with its live tool count; `@tag:<name>` opens the
tools carrying it; `/search <keyword>` matches names, descriptions and tags.

<div align="center">
*[Image: hackingtool /tags: every tag with its tool count]*
<br/>
<sub><code>/tags</code>: 63 tags in use, with the number of tools behind each.</sub>
</div>

### ▶ Background panes (tmux)

Long scans shouldn't block your console. With tmux installed, `/run <tool> … &` opens
a labeled window in one detached `hackingtool` session:

```
/run nmap -sV -oA scan 10.0.0.5 &
▶ started 'nmap' in background: /attach to view
```

`/panes` lists them, `/attach` watches one (`Ctrl-b` `d` to come back), `/kill <label>`
or `/kill all` stops them, and the status line under the prompt shows `▶ N running`.
No tmux? It says so and opens the tool inline instead; disable it entirely with
`/config background_runner off`.

### ⚙ Settings and the AI layer

`/config` opens a full-screen settings editor (`↑↓` move, `←→` change, `Enter` edit,
`t` test the connection, `Esc` close); `/config <key> <value>` sets one key from the
prompt. Settings live in `~/.hackingtool/config.json`.

The AI layer is **opt-in and bring-your-own-key**: an OpenAI-compatible endpoint when
`ai_base_url` + an API key are set, else a local [Ollama](https://ollama.com), else
nothing: every feature degrades to a deterministic offline behaviour instead of
guessing. Your API key is written only to `~/.hackingtool/.env` (mode 600), never to
`config.json`, and never printed back. `/config test` reports the real failure if a
probe fails.

### 📋 Headless engagements

The same catalog drives a non-interactive orchestrator that normalizes tool output
into one `findings.json`:

```bash
hackingtool --engagement acme --targets example.com --pipeline recon
hackingtool --engagement acme --report          # deterministic Markdown report
hackingtool --engagement acme --ai-summary      # opt-in triage of the REAL findings
hackingtool --engagement acme --ai-report       # opt-in narrative draft (report.draft.md)
```

Out-of-scope targets are flagged and logged before anything runs, and the AI passes
only ever summarize findings that exist.

---

## Documentation

| Document | What's in it |
|---|---|
| [How to use hackingtool](docs/HOW-TO-USE.md) | numbered walkthroughs: first run, `/find`, `/goal`, `/config`, background panes, headless mode |
| [Tool catalog](docs/TOOLS.md) | every tool, by category, with links and tags |
| [Operator playbook](src/hackingtool/skill/OPERATOR.md) | the charter and grounding rules the AI layer runs under (also `/skill`) |
| [SECURITY.md](SECURITY.md) | disclosure policy, release verification, threat model |
| [CONTRIBUTING.md](CONTRIBUTING.md) | catalog-first tool additions, the gate your PR must pass |

---

## Contributing

New tools, fixes, and docs are all welcome: for **authorized security testing** only.

> **The easy path:** most tools are just **one YAML entry** in
> `src/hackingtool/catalog/`: no Python needed. Tags come from a fixed taxonomy, so
> your tool is instantly discoverable and searchable.

| I want to… | Do this |
|---|---|
| 💡 Suggest a tool | Open a [Tool Request](.github/ISSUE_TEMPLATE/tool_request.md) issue |
| ➕ Add a tool | Add a catalog entry (or a class for custom install/run logic), then open a PR with the [template](.github/PULL_REQUEST_TEMPLATE.md) |
| 🐛 Report a bug | Open a [Bug report](.github/ISSUE_TEMPLATE/bug_report.md) issue |
| 🔒 Report a vulnerability | **Privately**: do not open a public issue; see [SECURITY.md](SECURITY.md) |

Before opening a PR, run **`make check`** (lint + tests + catalog validation) and use
the title format `[New Tool] Name: Category`. The full guide: security rules and the
one-entry catalog walkthrough: is in **[CONTRIBUTING.md](CONTRIBUTING.md)**.

<sub>📄 [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [Code of Conduct](CODE_OF_CONDUCT.md)</sub>

---

<!-- Star History: enabled later.
     GitHub now restricts anonymous star-history data, so a live chart can't render.
     To enable: open https://star-history.com/#Z4nzu/hackingtool&Date (sign in with a
     GitHub token: it's your repo), download the chart image, save it as
     images/star-history.png, and uncomment the block below.

## Star History

<div align="center">
<a href="https://star-history.com/#Z4nzu/hackingtool&Date">*[Image: HackingTool Star History Chart]*</a>
</div>

---
-->

## Support & Sponsor

hackingtool is free and open-source. If it saves you time on an engagement or helps
you learn, please consider sponsoring: funding goes to tool curation, the AI layer,
and keeping installs safe and current.

<a href="https://github.com/sponsors/Z4nzu"><img src="https://img.shields.io/badge/GitHub_Sponsors-EA4AAA?style=for-the-badge&logo=githubsponsors&logoColor=white" alt="Sponsor on GitHub"></a>&nbsp; <a href="https://buymeacoffee.com/hardikzinzu" target="_blank"><img src="https://img.shields.io/badge/Buy_Me_A_Coffee-1F2328?style=for-the-badge&logo=buymeacoffee&logoColor=FFDD00" alt="Buy Me A Coffee"></a>

⭐ Starring the repo is free and helps others discover the project.

## Social

[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/_Zinzu07) [![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Z4nzu/)

> **For authorized security testing only.**
> Thanks to all original authors of the tools included in hackingtool.

Your favourite tool is not listed? [Suggest it here](https://github.com/Z4nzu/hackingtool/issues/new?template=tool_request.md)
