# Sandbox image

`ghcr.io/0xida/binarypilot-sandbox:1.2.0`: two layers on top of the upstream `ghcr.io/usestrix/strix-sandbox:1.2.0`:

1. CTF apt + gem packages.
2. Python CTF libraries in the runtime venv (`/app/.venv`).

Everything else: Kali base, certs/CA bootstrap, Caido proxy, Chrome + agent-browser, all web pentest tooling, the `pentester` user, `/workspace` layout, the `docker-entrypoint.sh` bootstrap: inherited untouched.

## What the image carries

| Class | Tools |
|---|---|
| Reverse / Pwn | radare2, gdb-multiarch, qemu-user, qemu-user-static, binwalk, upx-ucl |
| Forensics | foremost, steghide, exiftool, pngcheck, tshark, p7zip-full, unrar-free |
| Crypto / Hashing | john, hashcat, hashid |
| Misc | socat, ruby-full (`zsteg`, `one_gadget` via gem) |
| Python (venv) | pwntools, ropper, ROPgadget, checksec.py, pycryptodome, sympy, z3-solver, r2pipe |
| from strix base | nmap, sqlmap, nuclei, subfinder, naabu, ffuf, katana, agent-browser, caido, semgrep, trufflehog, trivy, jwt_tool, wafw00f, retire, eslint, jshint, ast-grep, js-beautify, tree-sitter, gospider, interactsh-client |

Excluded by design: Ghidra and IDA Pro (GUI-first), apktool/jadx deferred until an APK challenge actually needs them, SageMath (heavy, parse from pip instead when a challenge demands it).

## Build

```bash
docker build -f containers/Dockerfile -t ghcr.io/0xida/binarypilot-sandbox:1.2.0 .
# ~2 minutes when the strix-sandbox base is already cached
```

## Smoke test

```bash
docker run --rm ghcr.io/0xida/binarypilot-sandbox:1.2.0 -c '
for c in r2 rabin2 gdb-multiarch binwalk upx foremost steghide exiftool pngcheck tshark 7z john hashcat hashid socat zsteg one_gadget ruby checksec; do
  command -v $c >/dev/null || { echo MISSING: $c; exit 1; }
done
/app/.venv/bin/python -c "import pwn, Crypto, sympy, z3, r2pipe, checksec"
echo SMOKE_OK'
```

## Publishing

```
docker login ghcr.io -u 0xida -p $GHCR_TOKEN
docker push ghcr.io/0xida/binarypilot-sandbox:1.2.0
```

Registry name must be lowercase (GitHub Packages rule). `/0xida/` is used everywhere in the repo: same spelling as the Dockerfile's `LABEL`.
