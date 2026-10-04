---
name: pwn-windows-emulation
description: Windows/Linux userland emulation via sogen (momo5502). Run real PE binaries under deterministic CPU-level emulation: hook memory, instructions, syscalls; attach GDB without anti-debug detection. Use for Windows PE reversing, anti-debug binaries, packed/protected targets, or any PE sample on the Linux sandbox.
---

# Windows Emulation: sogen

Reach for this when:

- Target is a **Windows PE** (CTF "Misc"/"Reversing" dropping `.exe`/`.dll`) and you can't run it locally.
- Binary has **anti-debug** checks that trip on Linux-DEBUG or ptrace: sogen runs at the CPU/syscall level, debugger attaches over the GDB protocol *outside* the emulated process: anti-debug can't see it.
- You need **deterministic replays** (multi-run instruction traces, snapshot/restore) for path-sensitive reversing (packers, VM-based protectors).

If the target is a plain ELF + known-mitigation, stick to `pwn.md` + pwntools: don't mutate into sogen just because.

## Install + first run

> **Compatibility caveat.** sogen's PyPI package (`pip install sogen`) ships
> prebuilt wheels for **cp39 only** (plus an sdist that needs a C++20
> toolchain to build). The sandbox's `/app/.venv/bin/python3` is 3.13, so a
> bare `pip install sogen` **will not work**. Two working paths:
>
>: Bring a Python 3.9 in the sandbox (via `uv` or system package), then
>   `/path/to/py3.9 -m pip install sogen`.
>: Build from source: `git clone --recurse-submodules
>   https://github.com/momo5502/sogen.git && cmake --preset=vs2022` per upstream.
>   Needs ~10 GB disk and a full C++ toolchain; only worth it if the workflow
>   genuinely needs repeated runs.
>
> If neither is palatable, fall back to plain `pwn.md` workflow: most CTF PE
> challenges don't actually need emulation.

```bash
# One-time venv prep, on a CP39 interpreter only (see caveat above):
/path/to/py3.9 -m pip install --quiet sogen

# Emulation root = the real Windows system DLLs snapshot (~800 MB).
# Cache it outside /workspace so it survives the run's bind-mount layout.
if [ ! -d /opt/sogen-root/ntdll ]; then
  curl -fsSL https://sogen.dev/root.zip -o /tmp/root.zip
  unzip -q /tmp/root.zip -d /opt/sogen-root
  rm /tmp/root.zip
fi
```

Then a minimal session from `/app/.venv/bin/python3`:

```python
import sogen

emu = sogen.windows.create_application(
    "c:/work/challenge.exe",
    emulation_root="/opt/sogen-root",
)

# Optional: break at main entry point when it loads.
def on_module_load(mod):
    if mod.name.lower().endswith("challenge.exe"):
        emu.hooks.memory_execution_at(
            mod.entry_point,
            lambda addr: print(f"entry @ 0x{addr:x}"),
        )
emu.callbacks.on_module_load = on_module_load

emu.start()
print("exit:", emu.process.exit_status)
```

For deeper hooks (`memory_write`, `syscall`, `instruction`, snapshots) and CLI mode (`analyzer.exe`), follow the upstream wiki: https://github.com/momo5502/sogen/wiki: don't reinvent their API here.

## Attach a real debugger

sogen speaks the GDB protocol; start the analyzer with the `-p <port>` flag and point any GDB client at it:

```
target remote :9999
```

gef/pwndbg work unchanged. This is the recommended workflow when you need interactive single-step through PE code, since the in-process Python API doesn't natively pause.

## Snapshot / restore

Fastest for fuzzing a parser or re-trying an input with slight tweaks:

```python
snap = emu.snapshot()
# run fuzz iteration...
emu.restore(snap)   # full determinism; hooks/bindings survive
```

## Workflow pattern for a packed/anti-debug PE

1. `checksec` / `diec` / DetectItEasy to confirm packing + entropy.
2. Run once under sogen, watch module loads (`on_module_load`): the OEP is usually the last push + tail-jump from the packer's stub; hook `memory_execution_at` on candidate OEPs from the packer's `.text` range end.
3. On OEP hit, snapshot; then dump the `.text` region to disk (`emu.memory.read(...)`) for static analysis in Ghidra/r2.
4. Patch anti-debug branches at the emulation level (`emu.memory.write(addr, b"\x90" * n)`): sogen's breakpoints and writes are invisible to the emulated process's `IsDebuggerPresent` / `CheckRemoteDebuggerPresent` / NtQueryInformationProcess probes.

## Do not

- Don't `pip install sogen` into the system python: the venv at `/app/.venv/bin/` is the contract.
- Don't put the `root/` snapshot inside `/workspace` (it pollutes artifacts).
- Don't use when the target will only ever run as a remote service (no binaries provided); sogen shines on artifacts you can load, not HTTP endpoints.
