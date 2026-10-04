# pdfglot: PDF/ZIP Polyglot & the MD5 Misdirect

| Field | Details |
|-------|---------|
| **Challenge** | pdfglot |
| **Platform** | themctf.com |
| **Category** | Forensics / Steganography |
| **Files** | `mistery.pdf`, `flag_2_.zip` |
| **Tools** | Python, pyzipper, hashlib |
| **Flag** | `THEM?!CTF{pygl0tt3d_fl4gg0}` |

---

## TL;DR

- `mistery.pdf` is a PDF/ZIP polyglot: valid as both formats simultaneously
- Its embedded barcode font renders `pwd:pyglotted` on the page
- `flag_2_.zip` uses WinZip AES-256 (method 99): not crackable with standard `unzip`
- `pyglotted` itself is not the password: it's the input
- The real password is `md5("pyglotted") = bfa9c03cfd94cffd9381b83234ca6ac1`

---

## Step 1: Initial Recon

Two files: `mistery.pdf` and `flag_2_.zip`. The flavour text says the archive contains 1×10⁻⁸ BTC and needs a password found in the "other zip": which turns out to be the PDF.

```
$ file mistery.pdf
mistery.pdf: PDF document, version 1.3, 0 page(s)

$ file flag_2_.zip
flag_2_.zip: Zip archive data, at least v2.0 to extract, compression method=store
```

Zero pages in the PDF is suspicious. Trying to extract `flag_2_.zip`:

```
$ unzip flag_2_.zip
error: unsupported compression method 99
```

Compression method 99 is WinZip's AES-256 extension: standard `unzip` doesn't support it. You need `7z` or Python's `pyzipper`.

---

## Step 2: The Polyglot Structure

Running `python3 -c "import zipfile; print(zipfile.ZipFile('mistery.pdf').namelist())"` on the PDF reveals it's also a valid ZIP:

```
['hint/', 'hint/hint.txt']
```

This is a PDF/ZIP polyglot: a file whose bytes satisfy both format parsers simultaneously. The creator is literally named `TruePolyglot` in the metadata.

**File layout:**

```
0x000  %PDF-1.3 header + obj 1 (contains ZIP bytes as stream)
0x045  ZIP LH #1: hint/ directory entry
0x088  ZIP LH #2: hint/hint.txt (flags=0x0008, sizes=0, data→PDF bytes)
0x0D3  ← hint/hint.txt "compressed data" slot = PDF endstream/endobj bytes →
0x0E2  PDF obj 2, 3, 4 … page tree, font resources, content stream
0xD11  ZIP Central Directory (2 entries)
0xEEF  End of Central Directory record
```

The polyglot works because ZIP parsers scan for the End-of-Central-Directory record from the **end** of the file, while PDF parsers read linearly from the **start**. Neither gets confused by the other's structures.

---

## Step 3: The hint.txt Red Herring

Trying to read `hint/hint.txt` from the ZIP layer crashes with:

```
zipfile.BadZipFile: Bad magic number for file header
```

Investigation reveals a cascade of deliberate sabotage:

**Data descriptor flag (`0x0008`) with no descriptor**: the local file header has `flags=0x0008`, meaning sizes and CRC are deferred to a data descriptor after the compressed data. But no `PK\x07\x08` signature exists anywhere in the file. Python's zipfile reads into the next `PK\x03\x04` header and throws the error.

**Fabricated CRC32 in Central Directory**: the CD entry claims `crc32=0x755aaba2`, `comp_size=64`, `uncomp_size=318`. A full scan of all 4177 bytes for any 64-byte window matching that CRC found nothing.

**`extra_len` mismatch**: local header says `extra_len=32`; the CD entry says `24`. This 8-byte discrepancy shifts the computed data start into PDF structural bytes.

**No valid deflate stream**: exhaustive brute-force of every window size 32-128 bytes across the whole file, attempting raw inflate (`wbits=-15`), yielded zero readable output. The hint file simply does not exist in any recoverable form.

> This is the intended rabbit hole. The challenge author spent effort making `hint.txt` look salvageable: specifically to waste your time on header patching and CRC repair.

---

## Step 4: Reading the PDF Page

Decompressing the actual PDF page content stream (FlateDecode, stream index 4):

```
2 J
0.57 w
BT /F1 20.00 Tf ET
BT 297.64 793.37 Td (\x00N\x00o\x00t\x00h\x00i\x00n\x00g\x00H\x00e\x00r\x00e\x00O\x00r\x00M\x00a\x00y\x00b\x00e\x00:) Tj ET
BT /F1 60.00 Tf ET
BT 31.19 753.02 Td (\x00p\x00w\x00d\x00:\x00p\x00y\x00g\x00l\x00o\x00t\x00t\x00e\x00d) Tj ET
```

The null bytes between characters are UTF-16BE encoding. The font is an Identity-H symbolic font with a stub cmap. The rendered text is `pwd:pyglotted`.

The embedded font is Code-39-Logitogo, a Code-39 barcode font. Code-39 is inherently uppercase-only in its standard alphabet: the lowercase is a visual quirk of glyph encoding, but the underlying codepoints are clean ASCII.

---

## Step 5: Cracking the AES-256 Archive

The flag archive uses WinZip AES-256. Structure:

```
# flag/flag.txt local header at offset 67
flags       = 0x0009   # encrypted + data descriptor
compression = 99       # WinZip AES method
comp_size   = 57       # from central directory
uncomp_size = 27       # flag is 27 bytes

# AES extra field (tag 0x9901):
aes_version = 1
vendor      = b'AE'
strength    = 3        # AES-256
actual_comp = 8        # deflate inside AES

# Data at offset 153 (57 bytes):
salt        = baee9028c3254406567ea191d6bb2b5e  # 16 bytes
pwd_verify  = 7536                              # 2 bytes
encrypted   = 64cefaff...fb4772                 # 29 bytes
hmac        = 9eb2224af6bc985a6e40              # 10 bytes
```

The WinZip AES key derivation uses PBKDF2-HMAC-SHA1 with 1000 iterations. The last 2 bytes of the 66-byte derived key are a password verifier: fast to check without full decryption:

```python
def check_password(pwd_bytes):
    derived = hashlib.pbkdf2_hmac('sha1', pwd_bytes, salt, 1000, dklen=66)
    return derived[64:66] == pwd_verify  # b'\x75\x36'
```

`pyglotted` fails. Trying every obvious mutation: uppercase, leet speak, with digits, reversed, substrings, related words: all fail. Then trying hashes of `pyglotted`:

```python
import hashlib

for algo in ['md5', 'sha1', 'sha256']:
    digest = hashlib.new(algo, b'pyglotted').hexdigest()
    if check_password(digest.encode()):
        print(f'MATCH: {algo} -> {digest}')

# Output:
# MATCH: md5 -> bfa9c03cfd94cffd9381b83234ca6ac1
```

> **Key insight:** The hint gives you the *input*, not the password. The real password is `md5("pyglotted")`. The flag itself (`pygl0tt3d_fl4gg0`) is a leet-speak wink: you needed to transform the hint, just not with leet speak.

---

## Step 6: Extraction

```python
import pyzipper, hashlib

pwd = hashlib.md5(b'pyglotted').hexdigest()
# bfa9c03cfd94cffd9381b83234ca6ac1

with pyzipper.AESZipFile('flag_2_.zip') as zf:
    zf.setpassword(pwd.encode())
    flag = zf.read('flag/flag.txt')
    print(flag)

# b'THEM?!CTF{pygl0tt3d_fl4gg0}'
```

---

## Tricks Summary

| # | Trick | Detail |
|---|-------|--------|
| 1 | PDF/ZIP polyglot | ZIP parsers scan from end (EOCD); PDF parsers read from front. The overlap is invisible to both |
| 2 | Fake hint.txt | Fabricated CRC, no matching compressed data, broken data-descriptor flag, local/CD extra-field length mismatch. It was never there |
| 3 | Barcode font obfuscation | Password hint in Code-39 font with Identity-H encoding. Looks like a barcode but renders as plain ASCII `pwd:pyglotted` |
| 4 | MD5 transform | The displayed value is an input to a hash function, not the password itself. The flag name `pygl0tt3d` hints that transformation was needed |

---

## Flag

```
THEM?!CTF{pygl0tt3d_fl4gg0}
```

---

## Author's Note

After the CTF, challenge author **tegeda** confirmed in the writeups forum that `hint.txt` was intended to be recoverable: it should have contained an encoded hint via a base85→base64→morse→braille chain. However, the file was broken due to an authoring mistake, making it genuinely unrecoverable rather than an intentional rabbit hole.

The solve path above (bypassing `hint.txt` entirely and reading the password from the PDF page content) was therefore the unintended but fully valid route.
