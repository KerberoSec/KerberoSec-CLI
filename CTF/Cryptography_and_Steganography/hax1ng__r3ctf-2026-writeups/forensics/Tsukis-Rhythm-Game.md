# Tsuki's Rhythm Game

**Category:** Forensics / Malware / Reversing | **Difficulty:** Hard | **Flag:** `r3ctf{fiNaLIy-Y0U_find-Th3-5ECret-beh1nD-RhYTHm_4Nd_tR@CE_them0}`

## TL;DR

A rhythm game is secretly running a malicious Python mod that hides marshalled bytecode inside beatmap notes (2 bits per note from the `lane` field). The payload downloads a C2 implant that communicates using a custom "book cipher": every byte is encoded as its first-occurrence offset in `C:\Windows\hh.exe`. The clever twist: the C2 client hands you the exact copy of `hh.exe` in its very first frame (XOR'd with a fixed key), letting you decode the entire session. Following the attacker's steps leads you to an RDP bitmap cache, where bmc-tools reassembles screen tiles to reveal a MetaMask seed phrase, and draining the wallet to find the flag.

## What We're Given

Three files:

- **`Game.zip`**: a 77 MB archive containing `TsukiRhythmGame.exe` (a PyInstaller-bundled rhythm game), five AES-encrypted `.tsuki` chart files, and a `mods/` directory. The mod folder has a file called `advanced_stats.tsukimod`.
- **`traffic.pcapng`**: a 28 MB network capture of the victim's machine.
- **`Evidence.zip`**: an AES-256 encrypted zip containing `Cache0000.bin`, a 48 MB mystery blob. Password unknown. (The quiz gives it to us later.)

The challenge description frames this as a DFIR investigation: someone's rhythm game got compromised, and we need to figure out exactly what happened.

## Initial Recon

The first instinct is to poke at the game binary. Running `file TsukiRhythmGame.exe` confirms it's a PyInstaller bundle: a Python application that's been packaged into a self-extracting Windows executable. PyInstaller bundles include the Python interpreter, all required packages, and the compiled `.pyc` bytecode files, all stuffed into a PE binary. This is great news for us: there are well-known tools to pull everything back out.

```bash
file TsukiRhythmGame.exe
# TsukiRhythmGame.exe: PE32+ executable (GUI) ... Python 3.11
```

Meanwhile, the `.tsuki` chart files are clearly not plaintext: they're binary blobs. And the mod file `advanced_stats.tsukimod` is suspicious by name alone. Let's peel this onion layer by layer.

## Stage 1: Cracking Open the Game (PyInstaller + AES Charts)

### Extracting the PyInstaller Bundle

`pyinstxtractor-ng` is a tool that knows the internal layout of PyInstaller bundles and can extract everything out: including the compiled Python bytecode files (`.pyc`). Think of it like unzipping a very opinionated archive.

```bash
python3 pyinstxtractor-ng.py TsukiRhythmGame.exe
# Output: TsukiRhythmGame.exe_extracted/
```

This gives us a directory full of `.pyc` files. The one we care about is `main.pyc`: the game's main logic. `.pyc` files are compiled Python bytecode, which we need to decompile back to readable source. We used `pycdc` (a bytecode decompiler that handles Python 3.11):

```bash
pycdc main.pyc > /tmp/main_dec.py
```

The decompiled output is a bit mangled in places (decompilers aren't perfect), but two lines jump out immediately:

```python
AES_KEY = b'TsukiRhythmKey!!'
AES_IV  = b'TsukiRhythmIV!!!'
```

There's our chart decryption key. The game uses AES-CBC with a hardcoded 16-byte key and IV baked right into the binary: a classic "security through obscurity" fail.

### Decrypting the Charts

With the key and IV in hand, we decrypt all five `.tsuki` files. Four of them are ordinary beatmaps (JSON with note data). The fifth: `Eggdrasil.tsuki`: is the odd one out. Its JSON contains **3,096 notes of type 99**, which is not a normal rhythm game note type. That's suspicious.

### The Malicious Mod: Bytecode Hidden in Notes

Looking at `advanced_stats.tsukimod` (a zip-like Python module package), we find it has a hook called `on_judgement` that fires every time the player hits a note. But more interesting is how it processes the chart at load time: it reads every note where `type == 99` and extracts 2 bits from the `lane` field of each note.

Here's the trick: each note's `lane` value is an integer 0-3 (which lane to hit), stored in 2 bits. By stringing together 3,096 notes × 2 bits each, you get 6,192 bits = 774 bytes. The mod collects all these bits, assembles them into a byte array, and calls `marshal.loads()` on the result.

`marshal` is Python's internal serialization format for code objects: it's essentially how `.pyc` files store compiled bytecode. So the attacker embedded a complete, executable Python code object inside what looks like beatmap data. When the mod runs, it calls `custom_compare`: the extracted function: which executes the payload.

What does the payload do? It fetches `http://192.168.117.1:8000/Updater.exe`, saves it to `%TEMP%\Updater.exe`, and runs it via `subprocess.Popen(shell=True)`. Classic dropper behavior.

## Stage 2: The C2 Implant (Updater.exe)

### Carving Updater.exe from the PCAP

The pcap captures the HTTP download of `Updater.exe`. `tshark` can export HTTP objects directly:

```bash
tshark -r traffic.pcapng --export-objects http,./carve/
```

This gives us `Updater.exe` (MSVC C++, 64-bit Windows PE). We load it into Ghidra for static analysis.

### Reversing Updater.exe

Ghidra's decompiler reveals the structure quickly. The binary:

1. Connects to `192.168.117.1:4444` (the C2 server; port 0x115c in big-endian = 4444).
2. Opens `C:\Windows\hh.exe` and reads the whole file into memory.
3. Enters a loop: receive a frame from the C2, decode it, AES-decrypt the command, execute it via `cmd.exe`, AES-encrypt the output, encode it, send it back.

The AES part uses the Windows BCrypt API: each message is encrypted as `KEY(16) || ciphertext || IV(16)`, where a fresh random 16-byte key and IV are generated per message. Not bad for key management... but the transport encoding is what's truly novel.

## The Star Trick: The Book Cipher

### What Is a Book Cipher?

A book cipher is an old steganographic trick where you encode a message by referencing a shared "book": a document both parties have. Instead of sending the byte `0x41` (letter 'A'), you send the page number where 'A' first appears in the book. Anyone without the book sees meaningless numbers; anyone with the book can decode it.

Here, the "book" is `C:\Windows\hh.exe`: Microsoft's HTML Help executable, a standard Windows system file. The encoding works like this:

- For each byte value in the message, find the **first** position in `hh.exe` where that byte value appears.
- Send that decimal position.
- If a byte value doesn't appear anywhere in `hh.exe`, send it as a **negative literal** (e.g., byte `0x9B` → send `-155`).

Multiple values in a frame are joined with dots: `1337.4.18432.9.0.255.-155.2048...`

Frames are prefixed with a 4-byte big-endian length, so the protocol is: `[4-byte-length][ASCII-dotted-numbers]`.

This is clever for a few reasons. The numbers look benign. The book is a legitimate Windows file that wouldn't raise suspicion. And if you don't have the exact same `hh.exe` as the victim, you can't decode anything: the first-occurrence positions depend on the exact binary.

### The Clever Self-Defeating Twist

Here's where the challenge gets beautiful. Looking at the raw pcap TCP stream, the **very first frame from the client** is raw binary: not the dotted-number encoding. It's 18,432 bytes long. What is it?

It's `hh.exe`, XOR'd with the repeating 4-byte key `1337c0de`.

The C2 implant uploads the book to the server at the start of the session so the server-side operator can decode future traffic! This is operationally necessary: the attacker's C2 server needs to know which exact version of `hh.exe` the victim has so it can decode responses.

For us, this is a gift-wrapped solution. We XOR the first frame back and get the exact victim `hh.exe` (MD5: `2c8fe78d53c8ca27523a71dfd2938241`). Now we can decode everything.

```python
# Recover hh.exe from the first C2 frame
raw = open('C2S_00_binary.bin', 'rb').read()  # first frame payload
key = b'\x13\x37\xc0\xde'
hh_exe = bytes(raw[i] ^ key[i % 4] for i in range(len(raw)))
open('book_true.bin', 'wb').write(hh_exe)
```

### Decoding the Session

With `hh.exe` in hand, decoding each frame is straightforward. For each dotted-number frame:

```python
def decode_nums(frame_bytes, book):
    nums = [int(x) for x in frame_bytes.decode('ascii').split('.') if x]
    return bytes(book[v] if v >= 0 else (-v) & 0xff for v in nums)
```

The decoded blob is `KEY(16) || AES-CBC-ciphertext || IV(16)`. We strip the key and IV, decrypt the ciphertext, and get the plaintext command or response.

One interesting detail from inspecting the book: only 248 of 256 possible byte values appear in `hh.exe`. The 8 missing values (including bytes like `0x9B`, `0xA3`, etc.) are always sent as negative literals. We verified this matches what we see in the pcap: exactly 8 distinct negative numbers appear.

## Stage 3: Reading the Attacker's Playbook

Once we decode all 16 frames (8 commands from attacker, 8 responses from victim), we see the attacker's full session played out in glorious detail. The responses are in Chinese (GBK encoding: the victim is running a zh-CN Windows install):

| Frame | Direction | Content |
|-------|-----------|---------|
| S2C 0 | Attacker → Victim | `ipconfig /all` |
| C2S 1 | Victim → Attacker | Full IP config: hostname `DESKTOP-GB98L3M`, IP `192.168.117.135` |
| S2C 1 | Attacker → Victim | `whoami` |
| C2S 2 | Victim → Attacker | `desktop-gb98l3m\tsuki` |
| S2C 2 | Attacker → Victim | `dir` |
| C2S 3 | Victim → Attacker | Downloads folder: `TsukiRhythmGame.exe`, Firefox, Wireshark |
| S2C 3 | Attacker → Victim | `tasklist` |
| C2S 4 | Victim → Attacker | Full process list (including `TsukiRhythmGame.exe`, `Updater.exe`, Wireshark running) |
| S2C 4 | Attacker → Victim | `REG ADD ...Terminal Server /v fDenyTSConnections /d 00000000` |
| C2S 5 | Victim → Attacker | "The operation completed successfully." |
| S2C 5 | Attacker → Victim | `net user aurahack P@ssw0rd /add` |
| C2S 6 | Victim → Attacker | "The command completed successfully." |
| S2C 6 | Attacker → Victim | `net localgroup Administrators aurahack /add` |
| C2S 7 | Victim → Attacker | "The command completed successfully." |
| S2C 7 | Attacker → Victim | `netsh firewall set opmode disable` |
| C2S 8 | Victim → Attacker | Firewall disabled (with a deprecation warning: charming) |

The attacker's plan is clear: enable RDP, create a backdoor admin account (`aurahack` / `P@ssw0rd`), disable the firewall, then RDP in. The RDP session itself isn't in this pcap: it's in the `Evidence.zip`.

## Stage 4: The Quiz and the Evidence Password

The challenge server at `challenge.ctf2026.r3kapig.com:31645` runs an 11-question forensics quiz. Each answer is something we've uncovered. **Question 10 is special**: it doesn't just accept an answer: it hands back the `Evidence.zip` password when you get it right.

The 7th word of the seed phrase is the answer to Q10. (We'll find that in the next stage.) The password we receive: `18ae3a54-1c1a-4f44-adca-9884acb80d9a`.

## Stage 5: The RDP Cache and the MetaMask Seed

### What's in Cache0000.bin?

Opening `Evidence.zip` with that password gives us `Cache0000.bin`, a 48 MB file. Running `file` on it or checking the first 8 bytes:

```
52 44 50 38 62 6D 70 00  →  "RDP8bmp\x00"
```

That's the magic header for a **Windows RDP bitmap cache file**. When you use Remote Desktop, Windows caches screen tiles locally so it doesn't have to re-transmit unchanged parts of the screen: it's a bandwidth optimization. These cached tiles can be extracted and reassembled to reconstruct what the RDP session displayed.

The tool for this is `bmc-tools`:

```bash
bmc-tools -s Cache0000.bin -d /tmp/rdpcache/ -b
# Extracts 2943 tiles and generates a composite image
```

`bmc-tools` produces both individual tile files and a "band" collage (`band_00.png` through `band_04.png`) that stitches tiles together. Scrolling through the bands, we can see what the attacker was looking at on the victim's screen, and there it is: the MetaMask browser extension, showing the **12-word BIP39 seed phrase**.

### Reading the Seed

Most words are clearly visible. Two caused us trouble:

**Word 10** was partially obscured by an overlapping UI element. We could see enough letters to narrow it down to two candidates: `emerge` or `merge`. This is where BIP39 checksum validation saves the day.

A BIP39 seed phrase isn't just 12 random words: the last word encodes a checksum that validates the phrase. We test both candidates:

```python
from mnemonic import Mnemonic
mnemo = Mnemonic("english")
candidates = [
    "labor trophy emerge material divorce input faint bench cricket emerge sunset cream",
    "labor trophy emerge material divorce input faint bench cricket merge sunset cream",
]
for phrase in candidates:
    print(phrase.split()[9], "valid:", mnemo.check(phrase))
# emerge  valid: False
# merge   valid: True
```

`merge` it is. The full seed phrase:

> **labor trophy emerge material divorce input faint bench cricket merge sunset cream**

Word 7 (1-indexed) is **faint**: that's the Q10 answer.

### Deriving the ETH Address

BIP39 seeds generate wallets via a derivation path. MetaMask uses the standard Ethereum path `m/44'/60'/0'/0/0` for the first account:

```python
from eth_account import Account
Account.enable_unaudited_hdwallet_features()
acct = Account.from_mnemonic(
    "labor trophy emerge material divorce input faint bench cricket merge sunset cream",
    account_path="m/44'/60'/0'/0/0"
)
print(acct.address)
# 0x27A2481a2D840C64c1f6a99842E1A63A1586237e
```

That's the answer to Q11, and submitting it releases the flag.

## The Quiz: All 11 Answers

| # | Question | Answer |
|---|----------|--------|
| 1 | MD5 of TsukiRhythmGame.exe | `1eeb9c6ed21903f22e1b28dbcbc5c01c` |
| 2 | Chart decryption key and IV | `TsukiRhythmKey!!_TsukiRhythmIV!!!` |
| 3 | MD5 of the marshalled payload (from Eggdrasil.tsuki) | `aed1e4e8b9061e19506848ca579e46ac` |
| 4 | C2 port number | `4444` |
| 5 | The "book" file path used by the C2 | `C:\Windows\hh.exe` |
| 6 | MD5 of the victim's hh.exe | `2c8fe78d53c8ca27523a71dfd2938241` |
| 7 | First command the attacker ran | `ipconfig /all` |
| 8 | Victim username | `desktop-gb98l3m\tsuki` |
| 9 | Backdoor account credentials | `aurahack_P@ssw0rd` |
| 10 | 7th word of the MetaMask seed | `faint` |
| 11 | ETH address of the victim's wallet | `0x27A2481a2D840C64c1f6a99842E1A63A1586237e` |

## Running It

Submitting Q11 to the challenge server:

```
[Q11] What is the ETH address?
> 0x27A2481a2D840C64c1f6a99842E1A63A1586237e

Congratulations! Here is your flag:
r3ctf{fiNaLIy-Y0U_find-Th3-5ECret-beh1nD-RhYTHm_4Nd_tR@CE_them0}
```

## Key Takeaways

**The book cipher self-destruct.** The most elegant (and self-defeating) design choice in this challenge is that the C2 client uploads `hh.exe` to the server at session start. This is actually realistic: a real attacker's server needs to know the victim's exact file to decode responses. But it means the "secret" book is sitting in the pcap in plaintext (just XOR'd), handing it directly to a forensic analyst. Always check the first few frames of a C2 session for key material.

**PyInstaller is not obfuscation.** Bundling Python into an EXE doesn't hide the source code. `pyinstxtractor-ng` + `pycdc` makes reversing PyInstaller apps a 5-minute job. If you see a large Windows EXE that `file` calls Python, assume you can read the source.

**Steganography in beatmap data.** Hiding executable code in game note data is genuinely creative. The payload is invisible to a player and plausible enough to slip past a casual file review: the chart is "just a song." The 2-bits-per-note encoding is efficient and leaves no obvious signature in the JSON structure.

**RDP bitmap caches are forensic gold.** `Cache0000.bin` files are a known forensic artifact from RDP sessions. `bmc-tools` is the standard tool for extracting them. If you're ever doing incident response on a Windows machine and find these files, run `bmc-tools`: you might reconstruct exactly what the attacker saw (and in this case, steal their stolen seed phrase).

**BIP39 checksum saves the day.** When you can partially reconstruct a mnemonic from a screenshot but aren't sure about one word, BIP39 checksums let you narrow it to the correct word from a small set of candidates. The `mnemonic` Python library's `check()` method is your friend.

**Tools used:** `pyinstxtractor-ng`, `pycdc`, `tshark`, `Ghidra`, `bmc-tools`, Python (`pycryptodome`, `mnemonic`, `eth-account`).
