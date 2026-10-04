# TrueWalletCollider: Quick Start

**Made by TrueScent** · https://t.me/TrueScent  
Authorized owner / DFIR recovery only. Windows x64 Forensic Suite.

## 1. Setup & open

```bat
cd %USERPROFILE%\Desktop\TrueWalletCollider
setup_forensics.bat
TrueWalletCollider.exe
```

Confirm:

- Brand bar: `TrueWalletCollider // Forensic Suite` · Made by TrueScent
- Status: `CPU: AVXx active (N KDF workers)`
- Tools: `TrueWalletCollider.exe --tools-status` → HASHCAT / PYTHON / BTCRECOVER / JOHN
- Outside Box: `TrueWalletCollider.exe --outside-box` → 23-module inventory

## 2. Load / classify

| Step | Where |
|------|--------|
| Open or drag-drop `.dat` | **Extract** |
| Integrity verdict | **Verify** or Outside Box → **detector++** |
| Evidence folder | **Case** → notes + zip |
| Damaged dump | **Salvage** or Breaker → **Carve** |
| Shadow copies / ghosts / leftovers | **Outside Box → Disk** |

## 3. Recover

| Situation | Go to |
|-----------|--------|
| Multi-strategy attack | **Breaker & Rebuild** → **1 · Break** |
| Password fragments / mask | **Passphrase Lab** |
| Heir story / fat-finger / CSV passwords | **Outside Box → Structural** |
| Shared passphrase across wallets | **Outside Box → Two-Body** |
| Multiple historical mkeys | **Outside Box → multi-mkey** |
| Tokenlist / BIP39 / Electrum / typos | **BTCRecover Lab** |
| GPU / large wordlist | **Hashcat Bridge** (stream) or John |
| Known AES prefix / Keyhole / cold-boot | **Outside Box → Keyhole** or **AES Partial** |
| RAM / pagefile / hiberfil / process dump | **Outside Box → Memory** (import only) |
| Cheap wallets first | **Outside Box → Time-Slice** |
| Rematerialize + new password | **Breaker & Rebuild** → **3 · Rebuild** |

## 4. Confirm & clean up

1. Dual-verify OK (`pubkey_match` preferred): **Results**
2. Rebuild export or copy `FOUND_WALLET.txt` offline
3. Secure erase (Results checklist)

## 5. Useful CLI

```bat
TrueWalletCollider.exe --outside-box
TrueWalletCollider.exe --verify wallet.dat
TrueWalletCollider.exe --verify-plus wallet.dat
TrueWalletCollider.exe --export-hashcat wallet.dat
TrueWalletCollider.exe --salvage dump.bin
TrueWalletCollider.exe --parse wallet.dat
TrueWalletCollider.exe --portable-scan
TrueWalletCollider.exe --ghost-scan "%USERPROFILE%\Desktop"
TrueWalletCollider.exe --keyhole 56375875
```

Full manual: [USER_GUIDE.md](USER_GUIDE.md)
