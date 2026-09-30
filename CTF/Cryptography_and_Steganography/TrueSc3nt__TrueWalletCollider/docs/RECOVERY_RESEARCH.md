# Recovery Research: TrueWalletCollider Forensic Suite / Recovery Lab

Authorized **owner recovery / cryptanalysis R&D** toolkit for Bitcoin Core `wallet.dat`.  
This document summarizes what was implanted, what works, and dead ends we do **not** claim.

**Operator manuals:** [USER_GUIDE.md](USER_GUIDE.md) · [QUICKSTART.md](QUICKSTART.md) · [../README.md](../README.md)

## Honest scope

| Path | Feasibility | Notes |
|------|-------------|--------|
| Passphrase / KDF (method 0) | **Primary** | Salt + `nDeriveIterations` + encrypted mkey; dictionary / recall / mask |
| Dual-verify | **Required** | PKCS alone insufficient; PKCS(ckey) + EC pubkey match when possible |
| Partial AES key | **GPU sweet spot** | Known prefix/suffix/nibbles constrain search; not full 2^256 |
| Raw full AES-256 | **Research only** | Space remains 2^256: rate ≠ break of unknown master keys |
| Physical / cold-boot | **Import pane** | User-supplied candidate keys / dumps; no silent RAM scrapers |
| Hibernation images | **Guidance only** | Authorized forensic images; no automated stealer |

OpenCL: **future**. CUDA is first-class today.

## Implanted features

1. **Passphrase / KDF**: Extract salt + iterations + encrypted master; `EVP_BytesToKey(SHA-512)` method 0; GUI single / dictionary / simple mask; recall token wizard; Hashcat `$bitcoin$…` (`-m 11300`) + John-compatible export; optional `hashcat.exe` spawn if on PATH.
2. **Dual verifier**: On passphrase and AES hits: decrypt ckey with IV=`dsha256(pubkey)`, PKCS check, then micro-ecc secp256k1 pubkey match; write `FOUND_WALLET.txt`.
3. **Structured recall UI**: Known words, separators, prefixes/suffixes, years, keyboard walks, case/leet mutants → candidate list → KDF cracker; H/s + rough ETA.
4. **BDB salvage**: Carve mkey/ckey/pubkey patterns from damaged dumps; ranked ckeys; heatmap; TXT/JSON report.
5. **AES Partial**: `MODE_PARTIAL` CUDA kernel (prefix + suffix counter); GUI + TrueMkeyCollider `--partial HEX`.
6. **Iteration triage**: Show iters; folder scan sorts low-iter first.
7. **Multi-ckey decrypt**: After master recovered, decrypt all ckeys, consistency report, export WIFs.
8. **Version archaeology**: Flag unencrypted `key` records, multi-mkey, plaintext scraps, low-iter.
9. **Recovery Lab GUI**: Tabs: Extract | Salvage | Passphrase Lab | AES Partial | Hashcat Bridge | Results (+ CUDA / Console / Lab Docs).
10. **Experiment harness**: `--experiment dual_fp|passphrase|secp|hashcat_fmt`.

## Dead ends avoided

- **No claim** of P/E-hash or algebraic break of AES-256 for unknown wallets.
- **No malware**: no silent RAM scrapers, stealers, or covert exfiltration.
- **No identity** as a Hashcat/John clone: those remain optional **interop**.
- **No full Halderman cold-boot repair** in-engine: accept candidate 32-byte keys and verify against mkey/ckey instead.
- Competitor tool names are **not** the product identity.

## Secure-erase checklist (after recovery)

1. Confirm funds moved / wallet re-secured under new passphrase.
2. Wipe `FOUND_WALLET.txt`, `key_found.txt`, hash export files (GUI Results → secure erase zeros files).
3. Clear clipboard; close Recovery Lab.
4. Securely erase temporary wordlists / candidate lists on disk.
5. If forensic images were mounted, follow your org’s evidence handling policy.

## Physical / hibernation note

For authorized owner forensics: acquire disk or hibernation images with proper legal authority, carve offline, then **import** candidate keys or wallet fragments into Salvage / AES Partial panes. This lab does not automate memory scraping.

## How to open Recovery Lab

```bat
cd %USERPROFILE%\Desktop\TrueWalletCollider
TrueWalletCollider.exe
```

CLI smokes:

```bat
TrueWalletCollider.exe --selftest
TrueWalletCollider.exe --experiment passphrase
TrueWalletCollider.exe --export-hashcat samples\wallet.dat
TrueWalletCollider.exe --partial-help
```
