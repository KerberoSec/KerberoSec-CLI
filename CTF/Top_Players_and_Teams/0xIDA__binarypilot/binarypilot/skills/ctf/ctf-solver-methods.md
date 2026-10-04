---
description: Universal method for solving CTF challenges across every platform: how binarypilot steps through any challenge without falling into per-category rituals
metadata:
  shortcodename: ctf-solver-methods
---

Solve ANY CTF challenge through this loop, in this order, and escalate scope only when the category's tools exhaust.

1. **Read the full evidence**. Everything on the platform page (description, tags, category, solves, length hints) plus every attachment is metadata in the solve; never treat attachments as "downloaded, copy something, try it". List every file before extracting. `file` every entry; understand the container.
2. **Triage the category from evidence, not flag**. The platform category tag is the *hint*; your first job is to verify it. If the binary looks like a scripted challenge (Python / node / lua), call it that. If the Web challenge ships a `.tar.gz`, it's a reverse+pwn hybrid.
3. **Start from the artifact, never from the live instance**. Only connect to the live instance after you've seen the code/binary/filter. Dynamically catalog *what's there*: how the program starts, what state it initializes, where input feeds, where output leaks.
4. **Othen than rare artifacts (text-encoded list)**: skip brute probes. If you don't know what you're looking for, running the scanner is turning a tens-seconds task into minutes.
5. **Map constraints**: input size, structure, lifespan of state, concurrency assumptions, auth requirements, timeouts, sidechannels. Build a *matrix of accepted inputs* from static reading before touching the live surface.
6. **Form one hypothesis, test exactly once**. The gap between candidates is what your context window tracks. Re-run only after generating a fresh hypothesis; never "try again with a different seed" without a named reason.
7. **Record arguments, outputs, and the reason a branch was taken**. Every turn ends with a one-liner: `[what] -> [why]`. Specifically do NOT allow "trying different things" as a branch reason.
8. **Defer exhaustive enumeration**. Enumerate what's必要的 (chars, entries, tokens) only if the attack surface requires (e.g., LCG-cracking, brute-force parameters), not as a reflex.
9. **Back away from dead ends within 3 attempted refinements**. If after three hypothesis-refinements the gap isn't changing, it's not an angle problem; it's a misread constraint. Reread the platform description for the undocumented one.
10. **Stop on genuine solve signals** (verified flag, verified RCE, verified leak matching Hints/captured); do NOT chase a perfect chain vs. a cumbersome alternative the solve already proved.

Concrete application per category:

- **Web**: read source → identify exact vuln from code → construct payload → one request at live instance. Never `docker-compose up`, `flask run`, `php -S`, `node server.js`.
- **Pwn**: `file` + `checksec` → `rabin2 -I` → symbol map → heap map → disassemble the exact primitive (`UAF`, `double_free`, `off-by-one`) → reproduce locally → exact remote kick.
- **Reverse**: `rabin2 -zI` → strings → objdump entry points → find flag-check → reimplement key/check in python → feed input.
- **Crypto**: notebook-style notebook step: list parameters → identify category (small-e, common modulus, LCG, IV reuse, key reuse, malleable digit system) → build solver in Python → verify on a sample of the ciphertext before submit.
- **Forensics**: `file` every artifact → `binwalk` → `foremost` → meta-extraction of hidden / extended attrs → strings on embedded objects. Never grep through `strings` on a 1GB artifact without first knowing its container.
- **Misc/OSINT**: pivot chain-of-evidence; each hop cites `source -> extracted evidence -> next pivot`. No check-by-luck.

**Anti-patterns (explicit)**: launching a fuzzer with a "try common payloads" attitude; fuzzing Directory parameters by brute force on web challenges; hosting the challenge source locally to fuzz inputs; running nmap / vuln scanners on a **challenge instance** (challenge containers expose exactly one service: machines are the opposite: see the `machine-solving` skill, which REQUIRES full nmap enumeration); submitting flags on suspicion rather than verification.