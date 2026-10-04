# CUDA integration

TrueWalletCollider embeds the **TrueMkeyCollider** CUDA AES-256 search core.

## Linked units

| File | Role |
|------|------|
| `cuda/aes256_cuda.cu` | Device kernels: last-block AES decrypt + padding check vs wallet blobs |
| `cuda/aes256_cuda.h` | `cuda_aes_init/upload/launch`, grid suggest, VRAM estimate |
| `src/crypto/crypto_wallet.*` | SHA256, AES-CBC (ctaes), IV from pubkey, WIF, FOUND_WALLET save |
| `src/crack/CrackEngine.*` | Background thread wrapping launch loop for the GUI |

## Flow

1. Parser extracts 48-byte encrypted mkey/ckey blobs (+ optional pubkey).
2. Each blob becomes a `TargetCipher` (C3 + expected pad material).
3. GUI/`CrackEngine` calls `cuda_aes_upload_targets` then repeated `cuda_aes_launch`.
4. On `HitRecord.found`: `post_hit_decrypt_wif` → append `FOUND_WALLET.txt`.

## CLI parity flags (GUI maps to)

`-d`, `-g blocks,threads`, `-streams`, `-M auto|MB`, `-r`/`-q`/`-rs`, `-s`, `-w`, `--try`, `--selftest`, `--found`.
