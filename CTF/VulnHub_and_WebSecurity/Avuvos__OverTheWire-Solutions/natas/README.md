# Natas

Natas is the web security wargame from OverTheWire, teaching server-side security basics.

Each level involves finding a vulnerability in a web application to retrieve the password for the next level. Passwords are stored in environment variables and loaded via the shared session utility.

## Level Overview

| Level | Key Concept |
|-------|-------------|
| [0](level00/)  | View page source |
| [1](level01/)  | View source (right-click disabled) |
| [2](level02/)  | Directory listing / exposed files |
| [3](level03/)  | Robots.txt / hidden directories |
| [4](level04/)  | HTTP Referer header spoofing |
| [5](level05/)  | Cookie manipulation |
| [6](level06/)  | Exposed include files |
| [7](level07/)  | Directory traversal / LFI |
| [8](level08/)  | Reversing encoding operations |
| [9](level09/)  | Command injection |
| [10](level10/) | Command injection via `grep` arguments |
| [11](level11/) | XOR encryption with known plaintext attack |
| [12](level12/) | Unrestricted file upload via client-controlled filename |
| [13](level13/) | File upload validation bypass via image magic bytes |
| [14](level14/) | SQL Injection |
| [15](level15/) | Blind SQL Injection |
| [16](level16/) | Blind Command Injection via command substitution |
| [17](level17/) | Time-based Blind SQL Injection |

## Shared Library (`lib/`)

Common utilities are extracted into `lib/` to avoid duplication across levels:

| Module | Purpose |
|--------|---------|
| `session.py` | Session management and source code utilities |

Passwords are loaded from environment variables (`NATAS0`, `NATAS1`, etc.) via a `.natas.env` file.

## Setup

```bash
cp natas/lib/.natas.env.example natas/lib/.natas.env
```

Then fill in passwords as you solve each level.

## Running the Solvers

```bash
uv run natas/levelXX/solve.py
```

## Official Resources

- [OverTheWire Natas](https://overthewire.org/wargames/natas/)

## Connection Information

Each level is accessed via HTTP at:

```
http://natasX.natas.labs.overthewire.org
```

Authentication uses HTTP Basic Auth with username `natasX` and the corresponding password.
