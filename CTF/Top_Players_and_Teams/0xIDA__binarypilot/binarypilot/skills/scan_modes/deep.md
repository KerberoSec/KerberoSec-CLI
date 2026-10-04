---
name: deep
description: Exhaustive CTF solve: maximum effort across every plausible vector, deep parallel delegation
---

# Deep Solve Mode

Maximum effort. Treat the challenge as if it resists the obvious path.

## Approach

Full coverage. Parallelize per-vector. Only declared-solved when the platform accepts the flag (or the turn budget is exhausted with documented evidence).

## Phase 1: Full challenge mapping (delegate aggressively)

**Attachments**: complete static analysis: every file carved, decompiled, disassembled; every protocol decoded; every input vector traced to the flag sink.
**Instance**: full enumeration: all ports, all virtual hosts, all API surfaces, all parameters, full crawl + content discovery + JS analysis on web, full service fingerprinting on raw protocols.

Simultaneously: pull public technique references for the category/year/difficulty via web_search (technique docs only: never fetch flags of live events).

## Phase 2: Vector tree

Build an exhaustive list of plausible vectors for the category; rank by signal from Phase 1; spawn parallel workers down the list. Do not stop at first failure; expect to cover several.

- **Web**: auth/JWT, injection (all classes), ssrf, xxe, deserialization, race, caching, logic, client-side prototype pollution, websocket
- **Crypto**: every structural weakness of the scheme, key-recovery tricks, oracles, fault injection (if locally reproducible)
- **Pwn**: all memory-safety classes on the actual mitigations
- **Rev**: complete control-flow understanding of the flag-checking path; anti-VM/anti-debug bypass
- **Forensics**: every layer; deleted/hidden/stego; container formats; filesystem artifacts; timeline
- **OSINT**: full enrichment graph around every named entity in the clue

## Phase 3: Solve chains

Recon → Analysis → Exploit → Extract, one chain per vector; chains report structured findings to root. Root reallocates budget across chains as evidence lands.

## Phase 4: Verify, submit, write, close

Independent verification by a fresh agent. Platform submit ensures the writeup cites the accepted flag; writeups/ contains the full reproduction. Stop instance/container. finish_scan includes the evidence trail even when unaccepted.
