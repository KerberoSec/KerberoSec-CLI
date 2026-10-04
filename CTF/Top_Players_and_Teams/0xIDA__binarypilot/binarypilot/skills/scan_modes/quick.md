---
name: quick
description: Fast CTF solve: single-agent, minimal delegation, first obvious vectors
---

# Quick Solve Mode

Speed over coverage. Single solving agent; delegate only when the challenge structurally demands parallelism.

## Approach

Identify the category and points from challenge info; pick the single most likely vector; drive it to a flag or a hard blocker. Skip deep recon on solved paths.

## Phase 1: Understand

- Fetch challenge info: category, points, difficulty, description, files, instance
- If a challenge file/archive exists: one static pass (file, strings, binwalk/decompile-as-needed)
- If a live instance exists: one recon pass (map host:port, service, obvious entry points)

## Phase 2: Solve

Pick by category:

- **Web**: single most likely class (idor > sqli > auth bypass > ssrf); one fuzz pass, then exploit
- **Crypto**: identify the primitive from the description/attachments; one targeted solver script
- **Pwn**: one checksec + one disassembly pass; one exploit primitive
- **Rev**: strings → disassemble hot function; one decompilation target
- **Forensics**: magic check → binwalk/foremost → one artifact analysis pass
- **OSINT/Misc**: targeted enrichment around the clue; one strong lead

## Phase 3: Close

Reconstruct the exact flag (format-check against the platform). Submit via the platform tool. Write `writeups/<challenge>.md` with the minimal reproduction. Stop the instance/container.
