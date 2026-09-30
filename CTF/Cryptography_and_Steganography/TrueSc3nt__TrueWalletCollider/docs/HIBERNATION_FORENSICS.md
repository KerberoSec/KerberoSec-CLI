# Hibernation / memory forensics (guidance only)

**Authorized owner recovery** context only. TrueWalletCollider does **not** scrape live RAM or ship malware.

## When this applies

You already hold a lawful forensic image (hibernation file, crash dump, or cold-boot capture) that may contain AES key material or `wallet.dat` fragments.

## Suggested workflow

1. Acquire image with your standard forensic toolkit (outside this lab).
2. Carve candidate 32-byte sequences offline (volatility plugins, hex carving, etc.).
3. Paste candidates into **Recovery Lab → AES Partial → cold-boot import** (64 hex chars per line).
4. Or drop a damaged `wallet.dat` / raw dump into **Salvage**.
5. Dual-verify hits; export WIFs; follow the secure-erase checklist.

## What we deliberately defer

- Automated hibernation file parsers
- Kernel driver / live memory acquisition
- Full AES key-schedule bit-decay repair (Halderman et al.): too heavy; import repaired candidates instead
