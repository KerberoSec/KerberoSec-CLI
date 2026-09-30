# Well Well Well

| Field | Details |
|-------|---------|
| **Challenge** | Well Well Well |
| **Platform** | themctf.com |
| **Category** | Forensics / Malware Analysis |
| **Flag** | `THEM?!CTF{y3h..INSINAn1mie2;/:j92019p:SAD912j3op:dlamdo0912-41[4jmpAif10pri1;r12r1rh8012r}` |

---

## Overview

A disk image is provided containing a compromised Linux filesystem. The goal is to trace a supply-chain attack embedded in a Node.js project: a malicious local npm package hiding inside a legitimate-looking dependency tree, exfiltrating environment secrets and installing a git hook for persistent credential harvesting.

---

## Reconnaissance

### Filesystem Layout

Mounting the disk image exposes a standard Linux directory tree:

```
/etc/
/tmp/
/home/
/var/
```

The interesting lead is in `/home/ztz/dev/site`: a Node.js API gateway project.

---

## Step 1: Dependency Audit

### package.json

Inspecting `package.json` reveals a dependency named `fast-http-client`. Nothing alarming on the surface.

### package-lock.json

`package-lock.json` tells a different story. Instead of resolving `fast-http-client` from the npm registry, it points to a **local `.tgz` file**. This is the first red flag: legitimate packages resolve to `https://registry.npmjs.org/`.

### node_modules/fast-http-client/index.js

The package itself is a stub. It exports nothing meaningful and is never imported anywhere in the project codebase. Its only purpose is to pull in its own dependency: **`acme-util`**, also resolved from a local `.tgz`.

---

## Step 2: Inside acme-util

### index.js: Decoy Layer

`acme-util/index.js` exports what appear to be crypto helpers:

```js
exports.sha256 = (s) => "sha256:" + s;  // does nothing real
exports.md5    = (s) => "md5:" + s;     // does nothing real
```

These functions simply prepend the algorithm name as a string prefix. They are pure decoys: designed to look plausible in a code review while doing no actual cryptography.

### 13fa9e8fd23400de798f72da608a8dbf.js: The Actual Malware

Buried alongside `index.js` is a file named with an MD5 hash: designed to blend in and avoid attention. This is the malicious payload.

**Malware flow:**

```
Read .env
  → Encrypt values (AES-256-CBC → hex)
  → POST to C2: 192.168.18.144:1337/collect

Download /post-commit.sh from C2
  → Write to .git/hooks/post-commit
  → chmod +x
```

**C2 address obfuscation:**
- Host IP is stored reversed in the source as `"441.81.861.291"`
- Port is derived: `668381 XOR 669668 = 1337`

---

## Step 3: The Post-Commit Hook

The downloaded `post-commit.sh` is base64-encoded and split across 30 shell variables to hinder static analysis. Once reassembled and installed as `.git/hooks/post-commit`, it fires on every `git commit` and performs the following:

1. Collect repository URL, changed file paths and their full contents, author identity, and branch name
2. Encrypt the bundle: AES-256-CBC → base64
3. Exfiltrate via `curl POST` to `192.168.18.144:1337/sync`

This gives the attacker a continuous stream of source code and secrets from every future commit.

---

## Dead Ends

Two rabbit holes worth noting:

- **Empty SQLite database**: `api-gateway.db` is present but completely empty; migrations were never run, nothing to extract
- **PDF/ZIP polyglot in node_modules**: a file that doubles as both a PDF and a ZIP archive, containing a `hint/hint.txt` entry that crashes on extraction; fabricated CRC, no recoverable content: a red herring

---

## Challenge Answers

| # | Question | Answer |
|---|----------|--------|
| Q1 | Malicious package name | `acme-util` |
| Q2 | File executed during install | `/home/ztz/dev/site/node_modules/acme-util/13fa9e8fd23400de798f72da608a8dbf.js` |
| Q3 | Persistence mechanism path | `/home/ztz/dev/site/.git/hooks/post-commit` |
| Q4 | C2 host:port | `192.168.18.144:1337` |
| Q5 | Dropper AES key:IV | `2b997a77b33d893acba0c60e609ff7bf:138e100e33926c9a` |
| Q6 | Encryption algorithm | `aes-cbc` |
| Q7 | Hook AES key:IV | `0123456789abcdef0123456789abcdef:abcdef0123456789` |

---

## Attack Chain

```
Disk image
  └─ /home/ztz/dev/site/
       ├─ package.json           → lists "fast-http-client"
       ├─ package-lock.json      → resolves to local .tgz (not npm registry)
       └─ node_modules/
            └─ fast-http-client/
                 └─ index.js     → stub; pulls in "acme-util" (also local .tgz)
                      └─ acme-util/
                           ├─ index.js                              → decoy crypto helpers
                           └─ 13fa9e8fd23400de798f72da608a8dbf.js  → MALWARE
                                ├─ reads .env → AES encrypt → POST /collect
                                └─ downloads post-commit.sh → .git/hooks/post-commit
                                     └─ every git commit → encrypt repo data → POST /sync
```

---

## Techniques Used

| # | Technique | Detail |
|---|-----------|--------|
| 1 | Supply-chain substitution | Legitimate package name (`fast-http-client`) replaced with local malicious `.tgz` |
| 2 | Nested dependency hiding | Malware one level deeper in `acme-util`, not in the direct dependency |
| 3 | Decoy module | `index.js` exports fake-but-plausible crypto helpers to pass casual review |
| 4 | Hash-named payload | Malware file named with MD5 hash to avoid pattern-based detection |
| 5 | C2 address obfuscation | IP stored reversed; port derived via XOR |
| 6 | Git hook persistence | `post-commit` hook survives reboots; triggers silently on developer workflow |
| 7 | Payload obfuscation | Hook script base64-encoded, split across 30 variables |

---

## Flag

```
THEM?!CTF{y3h..INSINAn1mie2;/:j92019p:SAD912j3op:dlamdo0912-41[4jmpAif10pri1;r12r1rh8012r}
```
