**Made by TrueScent** · Telegram: [https://t.me/TrueScent](https://t.me/TrueScent)  BTC DONATION:bc1qke9ets26d6vs8ardndteds57frcald98n8g3te

# TrueWalletCollider: Forensic Suite / Recovery Lab

Portable Windows **x64** toolkit for **authorized** multi-format wallet recovery, DFIR triage, and cryptanalysis R&D.

Dear ImGui + GLFW + OpenGL GUI with embedded **CUDA AES** search (TrueMkeyCollider core), native passphrase / KDF with **runtime CPU SIMD detection** (SSE2 / AVX / AVX2 / AVX-512), salvage, dual-verify, **Breaker & Rebuild Lab**, **TrueReweave**, **Outside Box** maximalist archaeology, **Universal Tool Bay**, Verify / Case evidence tabs, and bundled third-party bridges after `setup_forensics.bat`.

## Supported formats (SHIPPED)

**Open Any Wallet** / drag-drop auto-detects and routes to inventory + hash extract + crack bridges:

| Format | Detect label | Hashcat / bridge |
|--------|--------------|------------------|
| Bitcoin Core `wallet.dat` (BDB + SQLite) | Detected: Bitcoin Core BDB/SQLite | `-m 11300` `$bitcoin$` |
| Bitcoin Cash / Litecoin / Dogecoin / Core forks | Detected: … Core BDB/SQLite | same 11300 (shared wallet crypto) |
| Ethereum UTC keystore JSON | Detected: Ethereum Keystore | `-m 15600` / `15700` (/ `16300` pre-sale) |
| Electrum family | Detected: Electrum | `-m 16600` / `21700` / `21800` |
| Exodus `seed.seco` | Detected: Exodus seed.seco | `-m 28200` (exodus2hashcat) |
| MetaMask LevelDB vault | Detected: MetaMask LevelDB | `-m 26600` / `26620` |
| Phantom / Atomic LevelDB | Detected: Phantom / Atomic | intake + Tool Bay pipelines |
| Blockchain.com JSON | Detected: Blockchain.com | intake + `-m 12700` bridge |
| MultiBit | Detected: MultiBit | `-m 22500` bridge |
| Wasabi JSON | Detected: Wasabi | intake |

Derivation path hints (walletsrecovery.org style): **BTC BIP44/49/84/86**, **ETH `m/44'/60'/0'/0/0`**, **SOL `m/44'/501'/0'/0'`**.

**TrueReweave** inventories every record and rematerializes under a **new passphrase** with WIF/JSON export **after unlock**. Explicitly **forbids** fake “replace BIP39 inside Core `wallet.dat`” (classic Core never stored BIP39).

**Force Rebuild (Experimental)** always rips apart the wallet, then exports a **new** BIP39 seed / xprv / sample addresses / research mkey under a passphrase you choose, plus any carved **UNENCRYPTED_KEY** material. It does **not** decrypt original encrypted `ckey` blobs and is **not** a bypass of wallet.dat protection.

CLI: `--formats` · `--detect FILE` · `--open-any FILE`

> **Authorized use only**: wallet owners, businesses recovering their own assets, and DFIR under clear legal authority.  
> Unauthorized access to wallets or systems is illegal.  
> Classic Bitcoin Core `wallet.dat` typically stores **no BIP39 mnemonic**: Breaker Lab reports that honestly.  
> **There is no magic bypass** of wallet.dat AES/mkey without the passphrase. Real levers: passphrase/KDF + dual-verify + salvage + **partial** AES + UNENCRYPTED keys. Raw full AES-256 against unknown keys remains **2^256**.  
> Memory / VSS features are **guided capture + import** of user-supplied dumps (and elevated PowerShell VSS copy). **No silent RAM stealers.**  
> **Commercial LE / on-chain tools are Integration Hub bridges only**: never claimed as free embeds. GPU seed tools may be experimental. **On-chain labeling ≠ crack.**

---

## Feature inventory (ships in this build)

### Left-column GUI tabs

| Tab | Capabilities |
|-----|----------------|
| **Extract** | **Open Any Wallet** multi-format detect; Core mkey/ckeys; ETH/Electrum/Exodus/MetaMask hash export; archaeology; drag-drop |
| **Salvage** | Carve mkey/ckey from damaged dumps; heatmap + ranked candidates |
| **Passphrase Lab** | Method-0 KDF, dict/mask/recall wizard, dual-verify batch, measured H/s |
| **AES Partial** | CUDA prefix search (`MODE_PARTIAL`) + cold-boot hex candidates |
| **Breaker & Rebuild** | Orchestrate verify/carve/KDF/Hashcat/John/BTCRecover; **TrueReweave** after unlock; **Force Rebuild (Experimental)** = NEW BIP39 export (does **not** unlock original encrypted ckeys) |
| **Outside Box** | All 23 archaeology / memory-import / structural / lab-exotic modules (see below) |
| **Verify** | REAL / SUSPECT / FAKE / CORRUPT checklist (wallet, `$bitcoin$`, pasted mkey/ckey) |
| **Case** | `cases/<id>/` notes, artifact copies, PowerShell zip export |
| **BTCRecover Lab** | tokenlist / passwordlist / BIP39 / Electrum / typos / seedrecover + stream |
| **Hashcat Bridge** | Multi-mode export/spawn (`11300`, `15600`/`15700`, Electrum, MetaMask, Exodus `28200`) |
| **Results** | Dual-verify status, `decrypt_all_ckeys`, FOUND_WALLET, secure-erase checklist |
| **Tools** | Pass/WIF, BIP39, brainwallet, Base58/Bech32, hex+entropy, wallet.dat diff, strings, balance HTTP, triage |
| **Tool Bay** | Full DFIR catalog · Pipelines wired into Open/Detect · Commercial Integration Hub |

### Right-column GUI tabs

| Tab | Capabilities |
|-----|----------------|
| **CUDA Crack** | Random / sequential / mixed AES search, try key, selftest, live HIT + WIF |
| **Console** | Unified log (clear / copy) |
| **Lab Docs** | In-app workflow, honesty limits, hibernation guidance (import only), secure-erase reminder |

### Universal Tool Bay (nothing left out)

`TrueWalletCollider.exe --catalog-count` prints live counts. Every item from the Huge DFIR research dump (Hashcat/John/BTCRecover, pywallet, WalletForge, BitcoinCarver, key-elf, seedcat, Hydra, CUDA_Mnemonic, MetaMask/Exodus, bulk_extractor, TSK/Autopsy, Volatility3, VSS, OCR, aLEAPP/iLEAPP, Electrum, PassLLM, Top 25, 150 quickfire, commercial LE, on-chain) has a GUI catalog row.

| Class | Meaning |
|-------|---------|
| **Native** | Built-in runnable pipelines |
| **Setup** | `setup_forensics.bat` → `third_party/` (Installed/Missing in GUI) |
| **Experimental** | Clone/build (seed GPU farms, etc.) |
| **Bridge** | Launch if installed |
| **Commercial** | Licensed path detect: never pirate |
| **Idea** | Research checklist (still in the bay, never docs-only) |

### Outside Box modules (honest status)

| # | Module | Status | Notes |
|---|--------|--------|-------|
| 1 | Shadow-copy / VSS harvester | **LANDED** | List shadows + UAC-elevated PowerShell copy into `case/vss/` |
| 2 | NTFS undelete / MFT residual | **LANDED** | Best-effort carve of **user-supplied** unallocated/disk-image dump (not full NTFS undelete engine) |
| 3 | Cloud sync ghost finder | **LANDED** | Recursive `wallet.dat*`, `(1)`, `.tmp`, conflict copies under chosen roots |
| 4 | Portable / leftover scanner | **LANDED** | Common Core paths + USB/drive-letter scan |
| 5 | Unlock-session capture kit | **LANDED** | Checklist UI + import scavenger (no live silent dump) |
| 6 | pagefile / hiberfil hunt | **LANDED** | Stream BIP39/wordlike/passphrase pattern scan with progress |
| 7 | GPU VRAM residue | **EXPERIMENTAL-LITE** | Import raw VRAM dump → string/hex candidates; noisy by nature |
| 8 | Passphrase-change archaeology | **LANDED** | Extract multiple mkeys; shared-dict attack each |
| 9 | Crash-dump partial AES keys | **LANDED** | 32-byte candidates from dump → dual-verify |
| 10 | Descriptor / PSBT scrapyard | **LANDED** | Carve descriptors, PSBT magic, xpub/xprv scraps |
| 11 | Multi-wallet / Two-Body | **LANDED** | Case folder load + shared-passphrase multi-target |
| 12 | Keyboard adjacency / fat-finger | **LANDED** | Mutants from almost-password → Passphrase Lab candidates |
| 13 | Heir interview grammar | **LANDED** | Structured story fields → recall candidates |
| 14 | Password-manager CSV bridge | **LANDED** | Chrome / Bitwarden / KeePass CSV → wordlist |
| 15 | Backup stitch surgeon | **LANDED** | mkey from A + ckeys from B → dual-verify |
| 16 | Rebuild / re-encrypt | **LANDED** | Breaker tab **3 · Rebuild** |
| 17 | ChipWhisperer / EM importer | **EXPERIMENTAL-LITE** | CSV/bin ranked guesses → AES verify |
| 18 | Fault-injection candidates | **LANDED** | Paste/file of hex keys → dual-verify |
| 19 | Fake-wallet detector++ | **LANDED** | Entropy + consistency scoring beyond basic Verify |
| 20 | Network timeline | **LANDED** | Optional read-only HTTP balance / activity proxy |
| 21 | Time-Slice Crack | **LANDED** | Attack plan ordered by file age × KDF iters |
| 22 | Keyhole mode | **LANDED** | Known AES bytes → plan wired to AES Partial / CUDA |
| 23 | Seed Mirage Meter | **LANDED** | Score carved BIP39 vs wallet addresses (experimental overlap) |

### Bundled via `setup_forensics.bat`

| Bundle | Path |
|--------|------|
| Hashcat 6.2.6 (+ exodus2hashcat) | `third_party/hashcat/` |
| Python embed 3.12 | `third_party/python/` |
| BTCRecover | `third_party/btcrecover/` |
| John jumbo | `third_party/john/` |
| pywallet, metamask_*, Volatility3, LEAPPs, seed/OCR clones, GPU seed repos, PhotoRec, … | `third_party/` (see `setup_forensics.bat`) |
| BIP39 wordlist | `data/bip39_english.txt` |
| Launchers | `third_party/run_*.bat` |

---

## Quick start (one-click)

**Double-click [`INSTALL.bat`](INSTALL.bat)** (alias: [`INSTALL_EVERYTHING.bat`](INSTALL_EVERYTHING.bat)):

1. Runs `setup_forensics.bat`: fetches Hashcat, embed Python, BTCRecover, John, and research clones into `third_party/`
2. Asks **Y/N**: “Build TrueWalletCollider.exe now?” → runs `build_cuda.bat` if you say yes (needs VS C++ tools + CUDA Toolkit + CMake)
3. Prints how to launch

```bat
INSTALL.bat
TrueWalletCollider.exe
```

Manual / incremental:

```bat
setup_forensics.bat
build_cuda.bat
TrueWalletCollider.exe
```

Confirm brand bar shows SIMD status, then:

```bat
TrueWalletCollider.exe --tools-status
TrueWalletCollider.exe --catalog-count
TrueWalletCollider.exe --formats
TrueWalletCollider.exe --outside-box
```

Guides: [docs/QUICKSTART.md](docs/QUICKSTART.md) · [docs/USER_GUIDE.md](docs/USER_GUIDE.md) · [docs/DFIR_CATALOG.md](docs/DFIR_CATALOG.md)  
Notices: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

---

## CLI

```bat
TrueWalletCollider.exe                  # Forensic Suite GUI
TrueWalletCollider.exe -h
TrueWalletCollider.exe --formats
TrueWalletCollider.exe --detect wallet.dat
TrueWalletCollider.exe --open-any UTC--….json
TrueWalletCollider.exe --open-any seed.seco
TrueWalletCollider.exe --tools-status
TrueWalletCollider.exe --catalog-count
TrueWalletCollider.exe --pipeline metamask "C:\path\to\LevelDB"
TrueWalletCollider.exe --pipeline electrum default_wallet
TrueWalletCollider.exe --pipeline orch wallet.dat
TrueWalletCollider.exe --outside-box
TrueWalletCollider.exe --verify wallet.dat
TrueWalletCollider.exe --verify-plus wallet.dat
TrueWalletCollider.exe --parse wallet.dat
TrueWalletCollider.exe --export-hashcat wallet.dat
TrueWalletCollider.exe --salvage dump.bin
TrueWalletCollider.exe --vss-list
TrueWalletCollider.exe --portable-scan
TrueWalletCollider.exe --ghost-scan "%USERPROFILE%\OneDrive"
TrueWalletCollider.exe --scavenge-dump unlock.dmp
TrueWalletCollider.exe --timeslice cases\my_case
TrueWalletCollider.exe --csv-bridge passwords.csv
TrueWalletCollider.exe --keyhole 56375875
TrueWalletCollider.exe --selftest
TrueWalletCollider.exe --experiment help
TrueWalletCollider.exe --partial-help
```

Sibling CUDA CLI (partial key research): [TrueMkeyCollider](https://github.com/TrueSc3nt/TrueMkeyCollider)

---

## Build (Windows x64)

Requires Visual Studio C++ tools, CUDA Toolkit 12.x/13.x, and CMake:

```bat
build_cuda.bat
rem or via alias:
build.bat
rem incremental (if build\ already configured):
rebuild_quick.bat
```

Parse, salvage, Passphrase Lab, Outside Box (CPU paths), Verify, Case, Hashcat export, BTCRecover (CPU), and most Tools work **without** a GPU. AES Partial / CUDA Crack / Keyhole-to-Partial need an NVIDIA driver stack.

---

## Legal / honesty

| Topic | Position |
|-------|----------|
| Authorized use | Own wallets, business-owned assets, or DFIR under written authority |
| No AES-256 miracle | Full unknown-key search space is **2^256**; GPU rates are research / partial-key only |
| BIP39 | Classic Bitcoin Core `wallet.dat` usually has **no** seed: Carve / Seed Mirage say so |
| Memory / VSS | Guided + import / elevated copy only: not malware |
| Dual-verify | Prefer `pubkey_match` over PKCS-only before moving funds |
| Commercial / on-chain | Bridges + licensed installs only; labeling ≠ local crack |
| GPU seed tools | Often experimental (clone/build); need address/xpub |

---

## License

TrueWalletCollider original code is released under the **[MIT License](LICENSE)**.

Optional tools fetched by `setup_forensics.bat` (BTCRecover, John the Ripper, Python, Hashcat, clones, etc.) remain under **their own licenses** and are not part of the MIT grant for this repo’s source: see **[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)**.
