# Changelog

All notable changes to BinaryPilot, sorted newest-first. The format is loose
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) aligned with Semantic
Versioning: fixes go under Fixed, new behavior under Added, prompts/skills
work under their own headings.

## [Unreleased]

### Changed
- Machine spawn/reset aligned with field-verified HTB API behavior (captured from the web UI): `htb_spawn_machine` / `htb_reset_machine` poll `GET /v5/virtual_machine/active` for the assigned 10.x IP: the same endpoint the site uses (`info.ip` is null while `isSpawning` is true), and surface `expires_at` (instance lifetime; reset refreshes it). Spawn warns when a different machine is already active (one active machine per user). `htb_get_machine_info` accepts the name slug as well as the numeric id (`/machine/profile/Cohort` works), and its docstring flags `isSingleFlag`: single-flag machines have no root.txt; prompts/skill updated to check it before hunting the root flag.

### Added
- Full HTB machine (box) solving via the sandbox VPN. `htb_stop_machine` (`POST /vm/terminate`, v5) and `htb_reset_machine` (`POST /vm/reset`, v5, re-polls the 10.x IP) join the machine toolset; `HTB_VPN_OVPN` is now a first-class `PlatformSettings` field (settable via env or `~/.binarypilot/cli-config.json`; the docker runtime reads live env first, then settings). Machine-by-URL specs now resolve their slug to the numeric `machine_id` + canonical name host-side (numeric slugs pass through; no fuzzy fallback: failing loudly beats spawning the wrong box). New `ctf/machine-solving` skill (two-pass nmap, service enum, Linux/Windows privesc checklists, dual-flag discipline); machine targets get a mandated 8-phase task line (spawn → enum → foothold → user.txt → submit → privesc → root.txt → submit → stop).
- `report_solve` gains `kind` (`challenge`|`machine`) and `flag_type` (`user`|`root`) so machine solves are labeled end-to-end (solves.json entries + writeup headers). Omitted fields keep the old shape: challenge solves are unchanged.

### Fixed
- Machine flag validation rejected every real machine flag: `user.txt`/`root.txt` on regular HTB machines are bare 32-hex MD5-style hashes, but `htb_submit_machine_flag` required the `HTB{` prefix, so legitimate flags died locally before the API call. The submit tool now accepts both shapes (bare 32-hex and `HTB{...}` for products like starting-point) and strips whitespace before submitting.

### Prompts & skills
- FLAG FORMAT section now distinguishes machine flags from challenge flags; "only one flag per challenge" corrected (machines yield user + root); MACHINE ACCESS procedure extended to the full foothold→privesc→dual-submission flow incl. stop/reset; `ctf-solver-methods` nmap anti-pattern scoped to challenge instances only (machines require full enumeration).

### Docs
- `docs/integrations.md` HTB VPN section rewritten to the real model (profile mounted read-only into the sandbox, in-container openvpn autostart, per-product profiles): it previously described the pre-1.5.0 host-attached-VPN model. `docs/platforms.md` machine tool list completed (`htb_get_machine_info`, `htb_spawn_machine`, `htb_stop_machine`, `htb_reset_machine`) and machine flag format documented. README env block + `.env.example` mention `HTB_VPN_OVPN`.

## [1.6.7]: 2026-08-07

### Fixed
- Scan crashes with an opaque docker 409 + `agents.sandbox.errors.ExecTransportError` when the sandbox container isn't running by the time Caido bootstrap execs into it (race: container exited or never started, docker-py raises 409 Conflict `container ... is not running`). The Caido readiness loop used to die on the first attempt and surface that raw SDK+docker stack to the CLI. Now `_login_as_guest` catches the transport error, recognizes the dead-container state via the exception chain, raises a clear `RuntimeError`, and `session_manager.create_or_reuse` tears down the half-created container before re-raising so no stopped container leaks into the next scan. Regression coverage in `tests/test_caido_bootstrap.py`.

## [1.6.6]: 2026-08-06

### Added
- `docs/contributing.md`: explicit "every version bump needs a matching image push" section (`ghcr.io/0xida/binarypilot-sandbox:<version>`), with the build+push commands and the failure mode users hit if skipped. Captures the 1.6.4/1.6.5 first-run breakage lesson.

## [1.6.5]: 2026-08-06

### Changed
- README refresh: LLM example `gpt-5.4` → `gpt-5.6`; the stale `sandbox:1.2.0` references replaced with the version-coupled wording (image tag tracks the installed CLI version since 1.6.4); "100+ playbooks" → "75 skills" (actual count); Pwn category now mentions sogen for Windows PE emulation; dropped the upstream strix-era "Existing pentest-mode compatibility" example that no longer maps to anything this CLI does.

## [1.6.4]: 2026-08-06

### Fixed
- Stale sandbox image tag mismatch (`first-run 404 on ghcr.io/.../binarypilot-sandbox:1.2.0`). Two layers: runtime default was hard-coded `1.2.0` in `binarypilot/config/settings.py` and the installer hard-coded `1.5.0` in `scripts/install.sh`: if the installer pulled a newer tag than the runtime asked for, `docker.images.pull` happily fetched it but then `inspect_image` 404'd because the runtime's tag wasn't actually local. Now: runtime derives its default image tag from `importlib.metadata.version("binarypilot-agent")` (falls back to `1.5.0` only on editable installs without metadata), and the installer reads `binarypilot --version` after pipx-installs and resolves the matching image tag from it. Package version and image tag are now structurally tied.

## [1.6.3]: 2026-08-06

### Added
- New CTF skill `pwn-windows-emulation.md`: sogen (momo5502): Windows/Linux userland emulator run at CPU+syscall level, real system DLLs, snapshot/restore, hooks on memory/instruction/syscall, GDB-protocol attach (anti-debug can't see it). Covers when to reach for sogen (Windows PE, anti-debug, deterministic replay) vs. when to stay on pwntools (`pwn.md`); one-time root.zip caching to `/opt/sogen-root`; minimal `create_application` snippet; snapshot example; explicit PyPI-wheel compatibility caveat (cp39-only, sandbox runs 3.13 → install on a python3.9 OR build from source).

## [1.6.2]: 2026-08-06

### Added
- `workers/installer/wrangler.toml`: bound zone + route (`idor.lol/*`) in code so `wrangler deploy` idempotently re-attaches it.
- `.gitignore`: `.wrangler/` (wrangler's local cache + state).

## [1.6.1]: 2026-08-06

### Added
- `workers/installer/`: Cloudflare Worker that serves `scripts/install.sh` at `idor.lol/` (fetched live from GitHub raw with a 60s edge cache: pushes to main propagate). Deploy + route-binding steps in `workers/installer/DEPLOY.md`.

## [1.6.0]: 2026-08-06

### Changed
- Installer URL: `curl -sSL https://idor.lol | bash` (was the long `raw.githubusercontent.com/...scripts/install.sh` path). README + in-script comment. Domain is Cloudflare-fronted and serves the install.sh at the root.

## [1.5.9]: 2026-08-06

### Fixed
- **Findings tab was always empty.** Root cause: the viewer polled `/api/vulnerabilities`, which answered from `vulnerabilities.json`: a pentest-era file the CTF workflow never writes. CTF solves go through `report_solve` → `solves.json` + `writeups/<id>.md`, so the tab had nothing to show. Added `read_findings(run_dir)` in `binarypilot/interface/viewer/transcript.py`: returns `vulnerabilities.json` when present (pentest runs untouched), otherwise maps each `solves.json` record into a vulnerability-shaped dict so the existing Findings list + detail card render it unchanged. Each solve contributes: `id` / `title` / `severity: "low"` (CTF has no severity palette; the TS fold would land them there anyway) / `target: challenge name` / `technical_analysis: writeup` / `poc_script_code: poc` / `poc_description: "Solver (<lang>)"` / extra `platform` and `flag` fields the JSON client tolerates. `severity_counts` and `read_vulnerabilities` call sites in `server.py` swapped to the new function.

## [1.5.8]: 2026-08-06

### Removed
- Viewer: the entire email-verification tier is gone (no OTP round-trip, no relay call, no `is_verified()` gate anywhere). Affects:
  - Server: dropped `/api/auth/{otp/start,otp/verify,forget,status}`, `/api/report/send`, `/api/feedback`, and the `_EMAIL_EVENTS` telemetry allowlist (no longer produced). `binarypilot/interface/viewer/auth.py` deleted (its only consumer was `server.py`).
  - Frontend: `EmailReportView`, `EmailVerifyInline`, `FeedbackView` deleted; `AuthStatus` / `OtpStartResult` / `OtpVerifyResult` / `SendReportResult` types and `fetchAuthStatus` / `otpStart` / `otpVerify` / `forgetAuth` / `sendReport` / `submitFeedback` clients removed from `serverSource.ts`.
  - Sidebar: "Feedback & support" nav item removed (no relay to send to); "Forget this email" footer menu removed (no linked-email state to clear); `verified`/`email`/`onForget` props dropped.
  - App: `View` union no longer includes `"email" | "feedback"`; `auth`/`refreshAuth`/`goEmail`/`openEmailFromOverview`/`onPastRunsVerified`/`onForget` all gone; the small-screen top-bar logo is no longer a cloud CTA.
- Run history and cross-run data endpoints (`/api/runs`, `/api/run`, `/api/vulnerabilities`, `/api/report`, `/api/transcript`) now gate only on the local process's session cookie: no email verification. Keeps the `--host` exposure protection (a network peer without the cookie still gets 403); drops the marketing gating the user is not paying attention to.

### Changed
- "Export report" on the Overview tab now downloads the PDF straight from `/api/report.pdf?run=<name>` via `GET` (new `DownloadReportCta`, anchored to the new `reportPdfUrl` helper). The PDF ships unencrypted: the previous password ceremony only existed to protect bytes in transit to the email relay, and a local download doesn't need it. The "run not finished" guard (`409`) is unchanged: partial-run exports still blocked.

## [1.5.7]: 2026-08-06

### Changed
- TUI branding: green (#22c55e/#4ade80/#16a34a) → cyan (#22d3ee/#0891b2/#0e7490/#155e75/#a5f3fc). Covers the splash banner + panel border + `b0f.ru` URL + "Welcome to BinaryPilot" highlight, the `_build_welcome_text` brand mention, the `_sweep_colors` dot animation gradient, the "Viewer running" indicator dot, the `FIELD_STYLE` in VulnerabilityDetail + reporting/finish renderers, the agent-message heading/bullet/hr/bold/italic strip accents, and the `$` shell prompt. Severity palette (critical/high/medium/low/info) and semantic success/failure pairs (red ✗ vs green ✓) untouched: green still means "OK" universally.
- TUI splash banner: replaced the CP437 box-drawing "BINARYPILOT" (could render as fallback glyphs in the upper-left when the terminal's CP437/MU glyph coverage is thin) with pyfiglet's `smslant` cut: pure ASCII (slashes, underscores, pipes), renders identically on every terminal and stays legible at small widths.
- `finish_renderer`: stale strix copy "Penetration test completed" → "Run completed".

## [1.5.6]: 2026-08-06

### Added
- Viewer: sidebar/CTA copy now reads CTF-shaped: "Pentest Overview" → "CTF Overview", "Issues" → "Findings", run-mode label + untitled fallback retargeted ("Pentest mode" → "Run mode", "Untitled pentest" → "Untitled run", "Switch pentest" → "Switch run", empty-state text + agent-graph fallback updated).
- Writeups (system prompt + `report_solve` docstring): professional structure: challenge header → TL;DR → methodology → recon & analysis → step-by-step solve with the exact commands/scripts inline → PoC block → flag → mitigation/takeaway. `poc` + `poc_language` are now mandatory (script is the deliverable, no abstract "I wrote a solver").

### Removed
- Viewer: dropped the marketing upsell surfaces that don't apply to local runs: "PR Security Reviews", "Integrations", "Members" sidebar items, the "Run in the cloud" topbar button, the "Run this pentest with more depth" card on the Agents tab, the "Attack surface monitoring" card on the empty-findings state, and the `ProCta` + `UpgradeModal` components.
- Viewer: sidebar's cloud CTA in the header (logo + account-switcher chevron pointing at `app.binarypilot.ai`); the Local badge stays so the viewer still announces itself.
- Viewer: sidebar "Export report" nav item: the email flow is still reachable from the Overview tab (solves the "show past session without sending email" requirement: history browsing has always been local, no outbound call).

## [1.5.5]: 2026-08-06

### Added
- Installer UX (`scripts/install.sh`): ASCII banner + tagline, `[N/5]` step framing, braille spinner on long ops (`pip install pipx`, `pipx install`, `docker pull`), boxed "ready" panel on completion. TTY-only when `NO_COLOR` unset and TERM != dumb: plain logging falls through in CI/pipes. Cursor hidden during spinners, restored on trap.

### Fixed
- Sandbox image tag in installer: `1.2.0` → `1.5.0` (matches the `VPN: auto-start entrypoint` image the rest of the repo references).
- `stop_spin`/`cleanup` returning non-zero under `set -e` when called bare (last command was a failed `[ -n ]` test): install aborted at the config step with no message.

### Removed
- (none)

## [1.5.4]: 2026-08-05

### Added
- Two new HTB platform tools: `htb_get_machine_info(machine_id)` (machine profile + IP if spawned) and `htb_spawn_machine(machine_id, wait_seconds=30)` (spawns the VM and polls for the assigned 10.x IP). Both registered in the agent factory.
- Image entrypoint wrapper `containers/binarypilot-entrypoint.sh`: when `BINARYPILOT_VPN_PROFILE` is set (or `/vpn/*.ovpn` is mounted), the sandbox auto-starts `openvpn --config` in daemon mode and waits up to 30s for `tun0` to come up before handing off to the base entrypoint. No-op when unset.
- All HTB VPN products recognized by `_format_ctf_challenge_line` (machines, starting-point, sherlocks, fortresses, seasonal); each gets the correct VPN path hint in the root-task message.
- `system_prompt.jinja` MACHINE ACCESS rewritten as an ordered 6-step procedure: (1) resolve kind, (2) refuse on missing profile, (3) one-shot `ip a | grep tun` check, (4) `htb_spawn_machine` BEFORE any nmap, (5) `ping -c2 <10.x>` gate before enum, (6) `htb_submit_machine_flag` at the end. Explicit anti-patterns called out (no curling api endpoints, no container spawns for kind=machine, no repeated VPN probing).

### Fixed
- `_apply_vpn_support` no longer emits `vpn.binarypilot.internal -> <profile-stem>` into `extra_hosts`. The stem is the profile filename (`release_arena_eu-release-1`), not an IP, and docker rejects add-host entries with non-IP values: every `HTB_VPN_OVPN` user hit `docker.errors.APIError: 400 ... invalid IP address in add-host` at container create time. The hostname alias served no purpose; mounts + env + /dev/net/tun + NET_ADMIN are all the VPN stack needs. (`tests/test_docker_client_vpn.py` covers all four wiring branches.)
- `_apply_vpn_support` binds `/dev/net/tun` and adds `NET_ADMIN` (required for openvpn+tun setup inside the container); previously only the read-only profile mount and env var were wired.
- Stale hard-refusal language in the system prompt + root-task line: replaced with the VPN-wired-vs-not-wired dual state (the 1.5.0 prompt still said "NOT YET SUPPORTED" after OpenVPN shipped).
- Agent was stalling 30-60s+ on "Starting agent..." for trivial offline crypto. Cause: system prompt mandated "AGENT SPECIALIZATION MANDATORY" with no carve-out for single-file one-shot solves: the root always spawned a "Crypto Solver" subagent even for an RSA dp/dq crack that the crypto skill + sympy could nail inline. Added "SOLVE INLINE WHEN TRIVIAL" rule ahead of specialization, and rewrote the root-task phase list to make instance-start conditional ("IF one exists: files-only offline challenges skip") and inline-solve explicit ("spawn ONLY for multi-stage work, remote recon, or genuinely foreign tool scope").

## [1.5.2]: 2026-08-05

### Fixed
- `_apply_vpn_support` no longer emits `vpn.binarypilot.internal -> <profile-stem>` into `extra_hosts`. The stem is the profile filename (`release_arena_eu-release-1`), not an IP, and docker rejects add-host entries with non-IP values. (`tests/test_docker_client_vpn.py`.)

## [1.5.1]: 2026-08-05

### Added
- Image entrypoint wrapper `containers/binarypilot-entrypoint.sh`.
- `_apply_vpn_support` `/dev/net/tun` + `NET_ADMIN` wiring.
- HTB VPN product kind-awareness in `_format_ctf_challenge_line`.

### Fixed
- Stale "not yet supported" prompt language for machines.

## [1.5.0]: 2026-08-04

### Added
- OpenVPN client layer in the sandbox image (`openvpn` + `iproute2`). Image tag bumped to `ghcr.io/0xida/binarypilot-sandbox:1.5.0`.
- `_apply_vpn_support` in `binarypilot/runtime/docker_client.py`: when the host exports `HTB_VPN_OVPN`, the profile is bind-mounted read-only at `/vpn/<name>.ovpn` and `BINARYPILOT_VPN_PROFILE` is set inside the sandbox. No-op when the env var is unset.

### Fixed
- Tool-call loop stalls: `wait_for_agents` default timeout 300s → 120s (parents wake sooner when subagents park) (`bcaee23`).
- HTB machine targets: dropped the "machines require OpenVPN: not yet supported" hard refusal. Root-task line + system prompt now say "if `BINARYPILOT_VPN_PROFILE` is present the entrypoint wires the tunnel; machines reachable", and machines still decline gracefully when the env is absent.

## [1.0.0]: 2026-08-04

### Fixed
- HTB machine targets (`kind=machine` from `--challenge <machine>` or search) now refuse politely instead of burning turns trying to run: the sandbox has no OpenVPN client. Root-task line + inline prompt both prep machines-need-VPN as the answer. Challenge containers via `htb_spawn_challenge_container` / `flagyard_start_instance` are unchanged (`MACHINE ACCESS` rule added to system prompt).
