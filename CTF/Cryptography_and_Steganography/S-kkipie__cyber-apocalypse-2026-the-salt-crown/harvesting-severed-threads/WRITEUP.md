# Harvesting Severed Threads: HTB Forensics writeup

Artifacts: `memory.elf` (VirtualBox physical RAM core, Linux 7.0.0-22 Ubuntu),
`dev_disk.img` (encrypted drive), `capture.pcapng` (37 KB, WireGuard).

Flag is 3 parts, one per artifact/technique:

**`HTB{v0l4t1l3_1uk52_d3crypt10n_w1th_k3rn3l_k3yr1ng_4nd_w1r3gu4rd_3xf1l_brrr_brrr_brrr!!}`**

- part_1 = `HTB{v0l4t1l3_1uk52_d3crypt10n_`: serpent CRUD record (see §4)
- part_2 = `w1th_k3rn3l_k3yr1ng_4nd_`: kernel keyring (see §2)
- part_3 = `w1r3gu4rd_3xf1l_brrr_brrr_brrr!!}`: WireGuard exfil (see §3)

## 1. Break the "codex": dev_disk.img (LUKS2, detached header, Serpent-XTS)

- Disk = sparse, high-entropy from 4 MiB; no LUKS magic on it.
- Memory carving found the unlock command:
  `sudo cryptsetup open --key-file /run/media/dev5812/dev_usb/luks_keyfile --header /run/media/dev5812/dev_usb/dev_header.img ./dev_disk.img dev_volume`
  → **detached header + keyfile on a USB that is NOT provided.**
- dm-crypt config in kernel memory (`page_offset_base = 0xffff8a7280000000`):
  cipher = **serpent-xts-plain64**, key_size 64, sector size **4096**.
- `cc->key` was wiped, so the 64-byte master key was recovered by a
  **known-plaintext scan of RAM**: ext4 block-0 was in the page cache (plaintext),
  its ciphertext is on the disk → scan every offset for the key K where
  `Serpent-256-XTS(K, tweak=0, zeros) == disk[0x400000..]`.

  Master key: `6d092b4dcb45c0141e5306b7e8ee39ceecb8cb4b4b75f6f4e1b1f8f2d74773a0d4ce7acf39d2197edc70fb453728b1713ed52e396c50217e99299a6797d350df`

- Decrypt: per-4096 data unit, tweak = unit_index*8 (512-sector). `dec_disk2.c`.
- ext4 recovered → `secure_cb/` (the "serpent" Rust tool: source + 36 MB binary)
  and `full_chain.c` (the exfil LKM). Disk was partially `sdmem`-wiped.

## 2. secure_cb "serpent" tool → boot-bound key + part_2 (kernel keyring)

`main.rs`: boot-bound key = `Argon2id(boot_id, salt="serpent_secure_salt_2026",
m=262144, t=4, p=4, len=32)`, ChaCha20Poly1305 for the keyring, and AES-256-CBC
(same boot-bound key) for the CRUD DB `/tmp/serpent.db` (see §4).

- `boot_id` (journald `_BOOT_ID`) = `710d1eb0-9a77-4c9c-a148-a8dd002d8755`.
- Derived key: `4af1975878abc3db67aa68d510f848d277f2854fb5cf9ac92906c23a769e46e4`.
- Kernel keyring key `keyring:part_2@serpent` (linux-keyutils backend) → payload
  base64 `vFq7uwx/2Zet+LsG3dpjbe1cJdfbykcWbitZs22pUysEUQREdJTNkc6jDDnYOHEHhSDFQw==`
  = nonce(12)||ct||tag(16); ChaCha20Poly1305(boot_key) →

  **part_2 = `w1th_k3rn3l_k3yr1ng_4nd_`**

## 3. WireGuard exfil (capture.pcapng) → part_3

- pcap = kernel WireGuard, victim 192.168.56.101 → collector .1:9999.
- Extracted from kernel `noise_keypair` in RAM (AEAD-tag scan against pcap):
  - Static keypair (curve25519 self-check): priv `18f5e6bb…b373b146`, pub `1331…1024`.
  - Transport keys (ChaCha20Poly1305 tag match on a keepalive):
    - Tsend `2d3d193f3889d53e9d1788e2fb42589d2b5390a2160c061baa6529e6da1da21c`
    - Trecv `953c534a5e6402ff3ed260cc23383beba5dccb31adb4119429bd9c54f3e8a42e`
- Decrypt WG transport → inner TCP stream (valid checksums) → 27525-byte payload.
- Payload = the Python **PyInstaller exfil** (`pyz/exfil`) output. Recovered its
  frozen module from RAM page cache (zlib @2164953928): reads `/root/dummy.pdf`,
  AES-256-GCM, key = `sha256(HARDCODED_SECRET)`, nonce prepended.
  `HARDCODED_SECRET = "https://www.youtube.com/watch?v=oHafFDkFgeg"`.
- `AESGCM(sha256(secret)).decrypt(payload[:12], payload[12:])` → `%PDF-1.7` = the
  exfiltrated `dummy.pdf`, which contains:

  **part_3 = `w1r3gu4rd_3xf1l_brrr_brrr_brrr!!}`**

## 4. part_1: carve `/tmp/serpent.db` from the tmpfs page cache + AES-256-CBC

`/tmp/serpent.db` is a tmpfs (page-cache-backed) file; the serpent tool's
`get_connection` was `sdmem`-wiped in the recovered `main.rs`, so the DB had to
be carved from RAM and decrypted blind.

- **Locate the file's pages by walking kernel structs** (no volatility symbols):
  `dentry("serpent.db")` → `d_inode` (`i_size = 0x3000` = 3 pages) →
  `i_mapping` (embedded `i_data` at inode+0x30) → `i_pages.xa_head` → `xa_node`
  (slots at node+0x28) → 3 `struct page*` (`0xfffffb3bc0d8af00/+40/+80`).
- **struct page → physical**: `vmemmap_base = 0xfffffb3bc0000000` (only
  1 GB-aligned candidate; cross-checked against the 2 MB vmemmap huge-page that
  maps virt `0xfffffb3bc0c00000`→phys `0xb9600000`). `pfn = (page: vmemmap)/64
  = 221884` → phys `0x362bc000` → the 3 file pages (12288 B) carved to
  `serpent_db_extracted.bin`.
- **Decrypt**: pages are high-entropy, no `SQLite`/`Turso` magic. turso/AEGIS
  (all variants, verified impls) failed every tag → not turso per-page. The
  wiped `get_connection` actually whole-file-encrypts with **AES-256-CBC(boot_key)**:
  `AES-256-CBC(key = 4af1975878abc3db…, IV = 0)` decrypts everything except
  block 0 (wrong IV only corrupts the first 16 B = the SQLite magic).
- Decrypted DB → `CREATE TABLE records (name TEXT PRIMARY KEY, value TEXT ...)`
  and the row `part_1` (SQLite serial type 0x49 = 30-byte TEXT):

  **part_1 = `HTB{v0l4t1l3_1uk52_d3crypt10n_`**

## Flag

`HTB{v0l4t1l3_1uk52_d3crypt10n_w1th_k3rn3l_k3yr1ng_4nd_w1r3gu4rd_3xf1l_brrr_brrr_brrr!!}`

(“volatile luks2 decryption with kernel keyring and wireguard exfil brrr brrr brrr!!”)

## Key scripts
- `dec_disk2.c`: Serpent-XTS volume decryptor (nettle).
- `scan_serpent.c` / `scan_wg.c` / `scan_wgkey.c`: RAM key scanners (nettle/hogweed).
- `aegis256.c`: AEGIS-256 (matches CFRG test vector), for turso decryption.
- carve of the exfil PyInstaller module from RAM page cache → AES-GCM key.
