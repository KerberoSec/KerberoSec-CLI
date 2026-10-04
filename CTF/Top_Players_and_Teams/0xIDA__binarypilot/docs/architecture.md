# Architecture

```
┌── your shell: binarypilot --challenge ...
│
├── interface/main.py        CLI: validates args, resolves challenge via core/resolver.py
│   └── targets[] entry      {"type":"ctf_challenge", "details": {platform, lab_id, challenge_id, ...}}
│
├── core/runner.py           run_binarypilot_scan(scan_config, scan_id, image, ...)
│   ├── session_manager.py   sandbox (Docker) + env (FLAGYARD_*/HTB_TOKEN) + bind-mounts
│   ├── caido_bootstrap.py   MITM proxy up inside sandbox
│   └── inputs.py            build_root_task() → "CTF Challenges: - flagyard challenge ..." line
│
├── agents/factory.py        build_binarypilot_agent()
│   ├── prompts/system_prompt.jinja   CTF loop + platform rules
│   ├── base tools (notes, todos, think, web_search, load_skill, ...)
│   ├── register_agent_tools(...)     flagyard_* (8), htb_* (8)   ← REST, not MCP
│   ├── report_solve                  ← accepted-solve persistence
│   └── finish_scan / finish_solve    ← lifecycle
│
├── skills/<category>/<name>.md       playbooks loaded via load_skill
│   ctf/{crypto,pwn,rev,web,forensics,osint,misc}.md        ← 7 base
│   ctf/crypto-{rsa,classic,modern,prng,advanced-math,ecc,exotic,zkp,historical}.md
│   ctf/pwn-{basics,format-string,rop,rop-advanced,heap,sandbox,kernel,kernel-bypass,
│            kernel-techniques,advanced-exploits,advanced-exploits-2}.md + heap-advanced
│   ctf/reverse-{anti-analysis,dynamic,languages,patterns,patterns-ctf,patterns-ctf-2,platforms}.md
│   ctf/web-{auth-access,auth-infra,client-side,server-side,server-side-advanced,
│             server-deser,server-exec,node-prototype,web3}.md + wasm
│   ctf/forensics-{stego,stego-advanced,disk,disk-memory,disk-recovery,linux,windows,
│                  network,network-advanced,signals,3d-printing}.md
│   ctf/{osint-geolocation,osint-social,osint-web}.md
│   ctf/{misc-bashjails,misc-pyjails,misc-dns,misc-encodings,misc-games-vms,
│          misc-games-vms-2,misc-rf-sdr}.md
│   ctf/{android,malware-analysis,malware-c2-protocols,malware-pe-dotnet,malware-scripts,
│          recon,exploit}.md
│   + kept: tooling/* (nmap, sqlmap, ffuf, katana, agent_browser, python, semgrep, ...), protocols/*, reconnaissance/*
│
└── report/state.py
    ├── solves.json → writeups/<id>-<challenge>.md   (CTF solve artifacts)
    └── run.json    → findings.sarif, vulnerabilities.json, solve_report.md
```

## Agent tree

```
root (orchestrator)
├── Recon Agent             (map challenge, enumerate surfaces)
├── Static Analysis Agent   (attachments, decompile, disassemble)
├── Web Solver              (if web)
├── Crypto Solver           (if crypto)
├── Pwn Solver              (if binary)
├── Rev Solver              (if reverse)
├── Forensics Solver        (if forensics)
├── OSINT Solver            (if osint)
└── Verification Agent      (re-derive flag before submit)
```

The root reads `system_prompt.jinja` (CTF rules + orchestration) + one of `skills/scan_modes/{quick,standard,deep}.md` + `coordination/root_agent.md`. Children get the prompt + their specialist skills (1-3).

## The solve trail

1. Root `resolve`s the challenge (from the CLI or via platform search) → `targets[]`.
2. Root spawns a Recon/Static subagent; they call `flagyard_download_files`/`htb_download_challenge` if attachments exist.
3. Specialized solver subagents run; each candidate flag triggers a verification agent.
4. Verified flag → platform submit tool returns `{isSuccess: true}`.
5. Submitting agent (root or solver, per its instructions) calls `report_solve(title, challenge, platform, flag, writeup, poc?, ...)` → writeup lands in `binarypilot_runs/<run>/writeups/<id>-<slug>.md`.
6. Root calls `finish_solve(...)` → reuse of `finish_scan` for the consolidated report + `run.json`.

## Where to look if something's wrong

| Symptom | File |
|---|---|
| Challenge not found / ambiguous | `binarypilot/core/resolver.py` |
| Tool "no configuration" errors | `binarypilot/config/settings.py` (`PlatformSettings`) |
| Env vars missing in sandbox | `binarypilot/runtime/session_manager.py` (`load_settings().platforms.sandbox_env()`) |
| Writeup not on disk | `binarypilot/report/state.py` + `binarypilot/report/writer.py` |
| Agent never calls platform submit | `binarypilot/agents/prompts/system_prompt.jinja` (FLAG REPORTING) |
| Wrong sandbox image | `binarypilot/config/settings.py` (`RuntimeSettings.image`) + `containers/Dockerfile` |
