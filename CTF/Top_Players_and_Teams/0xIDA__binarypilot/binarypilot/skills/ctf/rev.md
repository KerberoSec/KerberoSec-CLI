---
name: rev
description: Reverse engineering: binaries, bytecode, APKs, firmware, anti-analysis, keygens
---

# Reverse Engineering CTF

Understand the flag-check logic, then extract what it accepts. Static first, dynamic when static is blocked.

## Triage

- `file`, `checksec`, `strings -a -n4` (also `strings -el` for UTF-16).
- Identify obfuscation early: packed (UPX, Themida, VMProtect), anti-debug (`ptrace`), anti-VM, junk code, string encryption.
- Look at entry: `readelf -h`, `nm -C main`, `rabin2 -I`, disassembly of `main` / the function strings point at.

## Static

- Ghidra/IDA if available; otherwise radare2: `r2 -A ./bin`, `aaa`, `afl`, `s main`, `pdf`, `VV`.
- objdump: `objdump -d -M intel` for x86/x64; `objdump -b binary -m arm -D` for raw blobs.
- Java: `jadx-gui`/`javap -c` for APK/JAR; `dex2jar` as needed.
- .NET: `ilspycmd` / dnSpy-style; check `file` output first.
- Python: `pyinstxtractor` for PyInstaller, `uncompyle6`/`decompyle3` for .pyc (match Python version).
- WASM: `wasm-decompile` / `wasm2wat`.

## Dynamic

- Run under gdb; break at string comparisons / XOR loops; `x/s` the buffers.
- `ltrace` for library calls (strcmp, memcmp, crypto functions); `strace` for syscalls (ptrace checks).
- `qemu-user-static` + `gdb-multiarch` for foreign arches (ARM/MIPS).
- Anti-debug bypass: patch `ptrace` call to return 0, or break after the check.

## Common validation patterns

- Single-byte XOR with a fixed key: brute force 0..255 and look for printable output.
- Multi-byte XOR with a "magic" constant: recover the key from known prefix (flag format known: `FlagY{` / `HTB{`).
- Table lookups / bit rotations: reverse the transformation in Python.
- Custom VM: map opcodes from the dispatcher; emulate, or patch-and-dump.
- Constraints on input length + charset: encode in z3 and solve for any valid input.

## Mobile / firmware

- APK: `apktool d`, `dex2jar`, inspect `AndroidManifest.xml`, native `.so` via r2.
- Firmware: `binwalk -e`, filesystem extraction, look for init.d / config keys / default creds.

## Keygens / licenses

- Model the check in z3, or manually invert arithmetic; confirm the produced key validates under the actual binary (run it; do not claim from theory).

## Deep dives (load on demand)

`reverse-anti-analysis` (ptrace/timing/SIGILL bypass), `reverse-dynamic` (frida/angr/qiling), `reverse-languages` (py-bytecode, .NET, Ruby, Perl...), `reverse-patterns`, `reverse-patterns-ctf`, `reverse-patterns-ctf-2`, `reverse-platforms` (Mach-O/iOS/IoT), `android` (APK/jadx/apktool/smali). Tooling is CLI-only here: r2/radare2, gdb+pwndbg/gef, angr, frida: no Ghidra/IDA (GUI).

## Flag discipline

Extract the exact string the binary expects: often printed on correct input, sometimes embedded xor'ed in rodata, sometimes built at runtime. Regex-check against the platform format before submission.
