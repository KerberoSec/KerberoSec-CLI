# Input formats (TrueMkeyCollider)

## Encrypted blobs (mkey / ckey)

Bitcoin Core `wallet.dat` stores **encrypted master key** (`mkey`) and **encrypted private keys** (`ckey`) as AES-256-CBC ciphertexts.

Each loaded target must be **exactly 48 bytes** encoded as **96 hexadecimal characters** (no `0x` prefix).

Layout of the 48-byte blob (same as crackBTCwallet):

| Offset | Name | Meaning |
|--------|------|---------|
| 0-15   | C1   | first cipher block |
| 16-31  | C2   | second cipher block (IV for last block in CBC) |
| 32-47  | C3   | last cipher block |

Hot-loop check (GPU and host):

1. AES-256-ECB-decrypt `C3` with candidate key `K`
2. Compare result to `expected = C2 XOR (0x10 × 16)`  
   (PKCS#7 full padding block for a 32-byte plaintext)

Only one **AES decrypt of the last block** is needed per key×target: this is the crackBTCwallet optimization.

Extract blobs from a wallet with the original helper:

```
./get_mkey_ckey wallet.dat
```

That tool also prints the **public key** next to each ckey. You need the pubkey for the post-hit IV.

## Pubkey / IV (required for auto decrypt → WIF)

Bitcoin Core derives the CBC IV for each ckey as:

```
IV = first 16 bytes of SHA256(SHA256(pubkey))
```

(= first 32 hex chars of double-SHA256). Same as crackBTCwallet `doublesha256`.

### File formats that include pubkey

```
# bare: ENC96 PUBHEX
2e24da…93155 0382ca08ce78b0935099c74db12873a7dc1cba10a44165ce8cc1d0602f49ee97f5

ckey <96-hex> <33-or-65-byte-pubkey-hex>
load ckey <96-hex> <pubkey-hex>
```

### Companion `-pubkeys FILE`

If your ckeys file is only 96-hex blobs (no pubkey column):

```
TrueMkeyCollider.exe -ckeys data\ckeys_enc_only.txt -pubkeys data\pubkeys.txt --try …
```

One pubkey hex per line, paired by order with loaded ckeys.

**Without a pubkey**, a found AES key is still logged, but full CBC decrypt / WIF cannot run (document that pubkey must be supplied).

## Auto post-hit pipeline

When padding check succeeds:

1. `IV = doublesha256(pubkey)[0..15]`
2. Full AES-256-CBC decrypt of the 48-byte blob
3. Verify trailing sixteen `0x10` bytes
4. Strip padding → 32-byte private key
5. Derive uncompressed + compressed WIF
6. Print all steps; save to `FOUND_WALLET.txt` (or `--found FILE`)

## CLI helpers (manual crackBTCwallet flow)

```
TrueMkeyCollider.exe --cmd doublesha256 0382ca08ce78b0935099c74db12873a7dc1cba10a44165ce8cc1d0602f49ee97f5
TrueMkeyCollider.exe --cmd aesdecrypt 35fc5f8253f1bcf2c185571a35413f1f 563758754506d53828c5383d2cb6296efe7f217c5ef6a84b13bce3ecec66da2e 2e24da42feb389aab372163cac88c5b9233d6f1a2e6bcb4e8337dfa21f0aa85309fa70c00637474a88b0d881c4d93155
TrueMkeyCollider.exe --cmd privatekeytowif 3ea5eaabe7f7b997ce732acc9cf08315a805109003ce2bd918bac1b73b82d7b7
```

## Known PoC (from original README)

```
ckey:   2e24da42feb389aab372163cac88c5b9233d6f1a2e6bcb4e8337dfa21f0aa85309fa70c00637474a88b0d881c4d93155
pubkey: 0382ca08ce78b0935099c74db12873a7dc1cba10a44165ce8cc1d0602f49ee97f5
key:    563758754506d53828c5383d2cb6296efe7f217c5ef6a84b13bce3ecec66da2e
WIF_u:  5JHsqscg3o1iAWjRP83nWWJFbgMrjnXwVQoxejtAqp4t6cCVgbo
WIF_c:  KyKVQiQTML68gzEEce7HsEK9S4j4XqyZWQ6GdaGrSSk8XZJHqNWe
```

Verify:

```
TrueMkeyCollider.exe -ckeys data\ckeys.txt --try 563758754506d53828c5383d2cb6296efe7f217c5ef6a84b13bce3ecec66da2e
TrueMkeyCollider.exe --selftest
```
