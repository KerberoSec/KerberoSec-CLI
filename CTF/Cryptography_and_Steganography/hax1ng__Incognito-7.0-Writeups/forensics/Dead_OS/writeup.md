# Dead OS

**Category:** Forensics | **Difficulty:** 400pts | **Flag:** `IIITL{53r10u5ly!!_U_R3v1v3d_1t}`

## TL;DR

A 20 GB Windows VHD with a tampered MBR hides a base64-encoded AES ciphertext right in the bootloader error string. A password-protected zip buried deep in AppData holds the AES key: crack the zip with rockyou, decrypt the MBR blob, get the flag.

## What We're Given

The challenge drops `Dead_OS.7z` (described as a system that "won't boot but has confidential data fully intact"). Unpack it and you get `Dead_OS.vhd`: a 20 GB fixed-size VHD created with VirtualBox 7.2. The flavor text mentions a "hidden vault" and a "lock" to break, which is a pretty clear map of what we're looking for.

Flag format for this one is `IIITL{...}` (not the usual `ictf{}`).

## Initial Recon

With a 20 GB disk image, the first instinct is to not open it in a hex editor and cry. Instead, we start cheap:

```bash
file Dead_OS.vhd
```

And this immediately hands us something weird. The `file` command parses the MBR of VHD images and prints the bootloader text, and here it prints something that should NOT be in a bootloader:

```
iumuhAh5x1NWNh6Twkk9xDn0ZwlKn3yJ7C4FVZ1z/PY=ing system
```

That's not a coincidence. `iumuhAh5x1NWNh6Twkk9xDn0ZwlKn3yJ7C4FVZ1z/PY=` is 44 characters of base64, which decodes to exactly 32 bytes. It was stitched right into the middle of the "Missing operating system" error string at MBR offset 0x163. Someone overwrote part of the bootloader error text with this blob, and 32 bytes is a perfect AES block. We've found what the MBR was hiding.

Next we look at the partition layout:

```bash
mmls Dead_OS.vhd
```

Three partitions: a 50 MB System Reserved, a 19.4 GB NTFS C: drive, and a 522 MB WinRE partition. Nothing encrypted at the volume level: we hunted for BitLocker (`-FVE-FS-` signatures) and VeraCrypt headers (`TRUE`/`VERA`), but the hits were all inside unrelated Windows PE binaries that happen to contain those strings in their code. Red herring.

The C: partition is a near-vanilla Windows 10 install with a single user account named `You`.

## The Hidden Vault

We list the NTFS filesystem using The Sleuth Kit's `fls`: this lets us enumerate files without mounting the image:

```bash
fls -o 104448 -r Dead_OS.vhd
```

The offset `104448` is the sector start of the NTFS partition (from `mmls` output) converted to sectors. Buried in the output:

```
r/r 109998-128-1:   Users/You/AppData/Roaming/HiddenApp/key.zip
```

There it is: the "hidden vault". A second breadcrumb confirms it: `HiddenApp.lnk` exists in the user's Recent shortcuts, meaning someone actually opened it.

We extract the zip using `icat`: another Sleuth Kit tool that reads a file by its inode number directly from the image:

```bash
icat -o 104448 Dead_OS.vhd 109998-128-1 > key.zip
```

The result is a 192-byte zip containing a single file, `key.txt` (32 bytes, ZipCrypto encrypted). The file is stored without compression, which matters for certain attacks, but first we have to get past the password.

## The Lock

ZipCrypto (the old-style zip encryption) is weak in specific ways. We tried the obvious passwords first: `password`, `HiddenApp`, `incognito`, and the base64 string from the MBR itself. All wrong.

We also tried a bkcrack plaintext attack: bkcrack is a tool that can crack ZipCrypto if you know some of the plaintext inside the zip. Our hypothesis: maybe the MBR blob decodes to the plaintext of `key.txt`. We fed the 32 decoded bytes from the MBR to bkcrack as "known plaintext". It ran for about 5 minutes and found nothing. Good: that ruled out the hypothesis cleanly and told us the MBR blob is ciphertext, not plaintext.

So we fell back to the classic: dictionary attack.

```bash
zip2john key.zip > key.hash
john --wordlist=/usr/share/wordlists/rockyou.txt key.hash
```

`zip2john`: part of the John the Ripper suite: extracts a crackable hash from the zip's ZipCrypto header. Then John hammers rockyou.txt against it. This cracked in under a second:

```
Passw0rd123      (key.zip/key.txt)
```

## Building the Exploit

With the password in hand:

```bash
unzip -P 'Passw0rd123' key.zip
cat key.txt
# ThisIsA32ByteKeyForAES256!!12345
```

Exactly 32 bytes. That's an AES-256 key. The pieces snap into place: the MBR blob is AES-256 ciphertext, and `key.txt` is the key.

Now we just need to pick the right AES mode. The ciphertext is exactly one 32-byte block, which rules out anything that needs multiple blocks to make sense (like CBC chaining). ECB (Electronic Codebook) mode: the simplest mode, where each block is encrypted independently: is the obvious first try. Here's the full decrypt:

```python
from Crypto.Cipher import AES
import base64

ct = base64.b64decode("iumuhAh5x1NWNh6Twkk9xDn0ZwlKn3yJ7C4FVZ1z/PY=")
key = b"ThisIsA32ByteKeyForAES256!!12345"
pt = AES.new(key, AES.MODE_ECB).decrypt(ct)
print(pt.rstrip(b"\x01").decode())
```

The `.rstrip(b"\x01")` strips the PKCS#7 padding byte: the plaintext is 31 bytes, so the 32-byte AES block has one padding byte (`\x01`) appended.

## Running It

```bash
python3 solve.py
IIITL{53r10u5ly!!_U_R3v1v3d_1t}
```

There's the flag. The OS was dead. We revived it.

## Dead Ends Worth Knowing About

A few rabbit holes we went down so you don't have to:

- **MBR blob as zip password.** The base64 string is 44 characters, which looks password-shaped. It isn't. It's the ciphertext, not a password.
- **BitLocker / VeraCrypt hunting.** The NTFS partition has dozens of `-FVE-FS-` string hits. These are inside Windows binaries that contain BitLocker-related code: not actual encrypted volumes. Don't chase them.
- **SAM dump.** We extracted the SAM and SYSTEM hives and recovered the NTLM hash for user `You`. It cracked to `password`. Not the zip password, not the AES key. Just a user account with a bad password: a red herring.
- **bkcrack plaintext attack.** Worth trying if you think you know the plaintext, but in this case it confirmed the opposite of what we hoped.

## Key Takeaways

- **`file` on a disk image is free and fast.** The `file` command parses MBR text and will literally print embedded strings for you. This one printed the base64 ciphertext directly to the terminal. Always start here.
- **The classic CTF forensics loop:** find the clue (MBR blob) → find the artifact (`HiddenApp/key.zip`) → crack the weak lock (ZipCrypto + rockyou) → use the strong key (AES-256) → profit. Each step gates the next.
- **`fls` + `icat` > mounting.** Mounting a 20 GB VHD in WSL/Kali is a pain. Sleuth Kit's `fls` and `icat` let you enumerate and extract files directly from the image at the partition offset without any mounting gymnastics.
- **Try ECB first for single-block ciphertexts.** One block = ECB is probably right. CBC needs at least two blocks to be meaningfully different from ECB.
- **Dictionary attack before clever cryptanalysis.** ZipCrypto has real weaknesses (bkcrack is legitimate), but rockyou + john takes 1 second. Always exhaust the cheap options first.
