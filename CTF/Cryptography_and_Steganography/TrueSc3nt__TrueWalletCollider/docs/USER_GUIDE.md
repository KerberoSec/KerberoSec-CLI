# TrueWalletCollider: User Guide

**Made by TrueScent** · https://t.me/TrueScent  
Authorized owner / DFIR recovery only. Windows x64 Forensic Suite.

This guide covers every shipped GUI surface and Outside Box module honestly.

---

## Setup

```bat
cd %USERPROFILE%\Desktop\TrueWalletCollider
setup_forensics.bat
TrueWalletCollider.exe
```

Confirm brand bar: `TrueWalletCollider // Forensic Suite` · Made by TrueScent · SIMD status.  
Bundles + catalog: `TrueWalletCollider.exe --tools-status` · `TrueWalletCollider.exe --catalog-count`.

---

## Universal Tool Bay

Open **Tool Bay** (left tabs).

1. **Catalog**: searchable list of **all** DFIR research tools (100+). Filter by category; each row shows Run/Installed/Missing/Commercial/Idea status + docs notes.
2. **Pipelines**: native MetaMask / Exodus / Electrum / OCR / mbox / dump / extension walker / SQLite / AddressDB / orchestrator.
3. **Integration Hub**: commercial LE + on-chain: detect install or set licensed path; never pirate; see what TWC covers instead.

Full inventory: [DFIR_CATALOG.md](DFIR_CATALOG.md).

---

## Core recovery path

1. **Extract → Open Any Wallet**: drop / open any supported format. Status shows e.g. `Detected: Bitcoin Core SQLite`, `Detected: Ethereum Keystore`, `Detected: Electrum`.
2. **Verify**: REAL / SUSPECT / FAKE / CORRUPT (Core / `$bitcoin$`).
3. **Case**: create case folder; stash artifacts.
4. Attack passphrase / hash:
   - Core: **Passphrase Lab**, Hashcat `-m 11300`, John, BTCRecover, Breaker
   - ETH: Hashcat `15600`/`15700`; Electrum `16600`/`21700`/`21800`; Exodus `28200`; MetaMask `26600`/`26620`
5. Partial AES / Keyhole → **AES Partial** or CUDA Crack (Core AES path).
6. **Results**: dual-verify, decrypt all ckeys, secure erase.
7. **Breaker → TrueReweave**: inventory every record; rematerialize with **new passphrase** + WIF/JSON. **Forbidden:** fake BIP39 rewrite inside Core `wallet.dat`.

### Breaker one-click

On **Breaker & Rebuild**, use **Open wallet.dat & Run Full Breaker**: file dialog → Open Any Wallet → **always rip apart** (carve + inventory) → try **Unlock passphrase** (default example `adam`, editable; Ctrl+V or **Paste**) → on success decrypt all ckeys + TrueReweave rematerialize under **New passphrase for rebuilt wallet** (can mirror unlock) → export WIF/JSON. On fail it still extracts / exports hash and queues native KDF + Hashcat + John with that password as the first candidate (`trying…` in the progress log).

**There is no magic bypass** of wallet.dat AES/mkey encryption without the correct passphrase (or recovered key material). Wrong passphrase cannot unlock original encrypted funds.

### Force Rebuild (Experimental)

Always available **without** unlock on the Breaker tab:

1. Enter or **Generate** a new BIP39 seedphrase + new passphrase (e.g. `adam`).
2. Run **Force Rebuild** → writes `rebuilt_NEW_wallet_EXPORT/` with JSON + WIFs of the **NEW** seed, research mkey blob, xprv/xpub, sample BIP44 addresses.
3. Any **UNENCRYPTED_KEY** found during carve is included (real salvage).
4. Optional **wallet.dat.reweave_new** sidecar beside the original (second confirmation): **never** overwrites the original by default.

**Honest scope:** Force Rebuild does **not** decrypt original encrypted `ckey` blobs and does **not** unlock original funds. It creates a **different** key set from your new seed for research / rematerialization. Correct-passphrase path remains: unlock → decrypt old keys → TrueReweave under a new passphrase.

### Clipboard (Ctrl+V)

All `InputText` fields use Win32 `CF_UNICODETEXT` with a real HWND owner + OpenClipboard retries. Critical fields also have a **Paste** button. Run `TrueWalletCollider.exe --clipboard-selftest` to verify Set/Get round-trip.

### Derivation hints (rematerialize)

BTC `m/44'/0'/0'/0/0` (BIP44), `m/49'/0'/0'/0/0` (BIP49), `m/84'/0'/0'/0/0` (BIP84), `m/86'/0'/0'/0/0` (BIP86); ETH `m/44'/60'/0'/0/0`; SOL `m/44'/501'/0'/0'`.

---

## Outside Box (maximalist)

Open **Outside Box** tab. Subtabs: **Disk** · **Memory** · **Structural** · **Lab Exotic**.

### Disk / filesystem archaeology

| Module | How to use |
|--------|------------|
| **1 VSS harvester** | List Shadows → Harvest (UAC). Copies land under `cases/…/vss/`. Needs admin for copy. |
| **2 Unallocated carve** | Supply a free-space / disk-image dump file. Best-effort salvage + BDB magic (not a full undelete driver). |
| **3 Cloud ghosts** | Pick Dropbox/OneDrive/Desktop root → Find. Catches `wallet.dat*`, conflict, `(1)`, `.tmp`. |
| **4 Portable scan** | Common Bitcoin Core paths + optional USB letters. |

### Memory / session (import-centric)

| Module | How to use |
|--------|------------|
| **5 Unlock kit** | Follow checklist (Task Manager dump / procdump). Import dump: **no silent live RAM**. |
| **6 pagefile/hiberfil** | Point at user-copied `pagefile.sys` / `hiberfil.sys` / memory image → hunt. |
| **7 VRAM** | **Experimental.** Import a raw GPU dump if you have one; expect noise. |
| **9 Crash-dump AES** | Extract 32-byte candidates; dual-verify against loaded wallet. |

### Structural attacks

| Module | How to use |
|--------|------------|
| **8 Multi-mkey** | Extract all mkeys from raw → shared dictionary attack. |
| **10 Descriptor/PSBT** | Carve from loaded raw or any file. |
| **11 Two-Body** | Load a folder of wallets → shared passphrase try. |
| **12 Fat-finger** | Almost-password → adjacency mutants → fills Passphrase Lab candidates. |
| **13 Heir interview** | Names/places/pets/dates/story → candidates. |
| **14 CSV bridge** | Chrome / Bitwarden / KeePass CSV → wordlist (+ writes `csv_wordlist.txt`). |
| **15 Stitch** | Loaded wallet = mkey A; browse B for ckeys; try passphrase. |
| **16 Rebuild** | Use **Breaker & Rebuild → 3 · Rebuild** (same suite). |

### Lab exotic

| Module | How to use |
|--------|------------|
| **17 EM/ChipWhisperer** | **Experimental.** Import CSV ranked guesses or bin 32-byte blocks → try_key. |
| **18 Fault injection** | Paste 64-hex keys → dual-verify. |
| **19 Detector++** | Entropy + consistency score beyond Verify. |
| **20 Network timeline** | Opt-in HTTP (blockchain.info) balance / n_tx / activity proxy. |
| **21 Time-Slice** | Folder of wallets → crack order by age × iterations. |
| **22 Keyhole** | Known AES prefix/suffix → plan; copies prefix into AES Partial. |
| **23 Seed Mirage** | Score carved BIP39 lines vs wallet addresses (honest: Core usually has no seed). |

Inventory CLI: `TrueWalletCollider.exe --outside-box`.

---

## Existing suite (unchanged roles)

| Tab | Role |
|-----|------|
| Salvage | Damaged carve |
| Passphrase Lab | Native KDF batch |
| AES Partial / CUDA Crack | GPU AES research / partial |
| Hashcat / John / BTCRecover | External crackers |
| Tools | BIP39, brainwallet, diff, strings, balance, triage |
| Case | Evidence pack |

---

## CLI cheat sheet

See [README.md](../README.md#cli) for full flags. High-value:

```bat
--outside-box
--vss-list
--portable-scan
--ghost-scan DIR
--scavenge-dump FILE
--timeslice DIR
--csv-bridge FILE
--keyhole PREFIX [SUFFIX]
--verify-plus FILE
```

---

## Honesty limits

- **No bypass** of wallet.dat AES/mkey encryption without the passphrase or recovered key material.
- Force Rebuild (Experimental) creates **new** keys from a new BIP39 seed: it does **not** unlock original encrypted funds.
- No miracle AES-256 full-key break.
- No silent memory malware.
- VSS copy requires elevation you approve.
- Unallocated path needs a dump **you** provide.
- Seed Mirage does not prove BIP32 derivation from Core wallets.
- Dual-verify with `pubkey_match` before moving funds.
