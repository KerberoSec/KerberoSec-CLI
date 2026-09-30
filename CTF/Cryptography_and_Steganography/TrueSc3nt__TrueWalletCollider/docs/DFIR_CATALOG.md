# DFIR Catalog: Nothing Left Out

**Made by TrueScent** · https://t.me/TrueScent  
Authorized owner / DFIR recovery only.

This document is the inventory checklist for the **Universal Tool Bay**. Every named tool from the Huge DFIR research dump appears as a GUI catalog entry (`Tool Bay` tab). Live counts:

```bat
TrueWalletCollider.exe --catalog-count
TrueWalletCollider.exe --tools-status
```

## Honesty legend

| Status in GUI | Meaning |
|---------------|---------|
| Runnable (native) | First-party C++/GUI in this exe |
| Installed (setup) | Present under `third_party/` after `setup_forensics.bat` |
| Missing: run setup | Open-source fetchable; one-click path is the setup script |
| Bridge OK / Not found | External install detected or configure path |
| Install separately | Commercial LE / on-chain: **never pirate** |
| Catalog/Idea | Research quickfire / Top-25 tracker (still in bay, not docs-only) |

**Commercial ≠ free embed.** **GPU seed tools often experimental.** **On-chain labeling ≠ crack.**

## Native pipelines (Tool Bay → Pipelines)

- MetaMask LevelDB vault pipe → Hashcat 26600/26620 hint  
- Exodus `.seco` intake → 28200 / exodus2hashcat  
- Electrum helper → 16600/21700/21800 tips  
- BIP39 OCR text intake  
- Email/mbox seed scavenger  
- Browser extension walker (MetaMask/Phantom/Rabby/Ronin/Coinbase/Binance)  
- SQLite Core heuristic  
- Volatility-style dump scan (import only)  
- AddressDB builder hook  
- KeePass/CSV bridge  
- Orchestrator recommend + cheap scan  

## setup_forensics.bat fetches (when network allows)

Hashcat, Python embed, BTCRecover, John, pywallet (+GSC), metamask_pwn, hashcat_26620_kernel, metamask-leveldb-forensic-tools, seed-sweep, Image-Seed-Phrase-Finder, seed_parser, seed-phrase-scanner, CUPP, Autopsy-Plugins, Volatility3 (pip), iLEAPP, aLEAPP, seedcat, Hydra, CUDA_Mnemonic_Recovery, WalletForge, BitcoinCarver, bip39-brute, bitcoin_electrum_cracking, Exodus-Seco-To-Passphrase, kwprocessor, princeprocessor, CeWL, plaso, PhotoRec/TestDisk portable.

## Commercial Integration Hub

Cellebrite, Magnet AXIOM, Graykey, Belkasoft, MSAB, Oxygen, X-Ways, EnCase, FTK, GetData, Passware, Elcomsoft EDPR/EIFT, GMDSOFT, Recovery CAT, Chainalysis, Elliptic, TRM, Crystal, Maltego.

Configure paths in `data/commercial_paths.ini` or select a Commercial row → set path. Launch if present; else “Install separately” + what TWC covers instead.

## Checklist (research dump)

- [x] Hashcat / John / BTCRecover / bitcoin2john / pywallet  
- [x] WalletForge / BitcoinCarver / key-elf / Universal Wallet Reader (catalog + clone where possible)  
- [x] seedcat / Hydra / CUDA_Mnemonic_Recovery / bip39-brute  
- [x] MetaMask / Exodus / Electrum pipelines  
- [x] bulk_extractor / PhotoRec / TestDisk / TSK / Autopsy plugins  
- [x] Volatility3 / VSS tools / vshadow family (catalog + Outside Box VSS)  
- [x] OCR seed finders / aLEAPP / iLEAPP  
- [x] PassLLM / password frameworks (catalog; PassLLM = idea/wordlist-only honesty)  
- [x] Top 25 priority rows  
- [x] 150 quickfire idea rows  
- [x] Commercial LE + on-chain labeling bridges  

Regenerate catalog data:

```bat
python scripts\gen_tool_catalog.py
```
