---
name: misc
description: Misc CTF: esoteric languages, logic puzzles, file-format quirks, sandboxes, jailbreaks, trivia
---

# Misc CTF

The category of last resort. Approach: identify what the challenge actually IS before trying to solve it: misc challenges die to correct identification.

## Identification first

- `file`, `xdd|head`, `strings -a -n4`. Read the description's hints literally.
- Check unusual file signatures: Git bundles, PCAP renamed, malformed PNG, SQLite, docker save tarball, QEMU disk, firwmare dump.
- Language identification for source code: esolang identifiers (brainfuck `>+<+`, Ook, Piet (image), JSFuck `[]()!+`, Malbolge, Whitespace (space/tab/LF only), Shakespeare, Rockstar).

## Esoteric languages

- Run them, don't read them by hand: install interpreters (`apt install beef` for brainfuck, or pip packages).
- Brainfuck: standard BF interpreter; output is usually ASCII.
- Whitespace: `ws` interpreters; visible whitespace appears as nothing in editors: `cat -A` to reveal.
- JSFuck: eval in node.js.
- Malbolge / Shakespeare / Piet: public interpreters exist; download and run.

## Logic / algorithmic puzzles

- Write a solver; don't puzzle it out on paper. z3 when constraints dominate; plain Python with careful parsing when combinatorics dominates.
- Cellular automata (Game of Life variants), graph puzzles, maze solving: model the state; simulate forward; look for cycles.

## Sandboxing / jailbreaks

- Python jail escapes: restricted built-ins via `__builtins__`, audit hooks, restricted modules. Walk: `().__class__.__base__.__subclasses__()` and look for useful classes (FileLoader, catch_warnings, etc.).
- Bash jail escapes: restricted shells: check `$PATH`, allowed commands, BASH_ENV, ENV, `ssh -t`, `git` shell, `ftp`, vim `:!/bin/sh`, less `!sh`, awk `BEGIN{system(...)}`, find `find . -exec /bin/sh \;`.
- Container escapes: mounted proc/sys, docker socket, privileged caps (`capsh --print`), kernel exploits only when explicitly the challenge.

## Common ones

- Git forensics: `git fsck --lost-found`, dangling blob recovery, reflog, deleted branches, `git bundle` of a dead repo.
- Weird encodings: base65536, base91, uuencode variants, emoji encodings; try `ciphey` first; then targeted decoder.
- Compression bombs / polyglots: file that's two types at once (PNG+ZIP): split via binwalk; a .tar inside the IDAT of a PNG.
- Radio/SDR-dumped IQ files: `Universal Radio Hacker` style decoding; in sandbox: soak up the signal via Python.

## Deep dives (load on demand)

`misc-bashjails`, `misc-pyjails`, `misc-dns`, `misc-encodings`, `misc-games-vms`, `misc-games-vms-2` (ML model/LoRA, Flask hooks), `misc-rf-sdr`. Malware-adjacent work: `malware-analysis`, `malware-pe-dotnet`, `malware-scripts`, `malware-c2-protocols`.

## Discipline

Save solver scripts; verify extracted flags via regex before submitting; writeup the chain (what the challenge actually was → how identified → how solved): the identification step IS the writeup.
