# CTF Challenge: Silent_Transfer

## Competition Details

- **CTF Name:** OVERRIDE CTF
- **Challenge Name:** Silent_Transfer
- **Category:** Forensics / Steganography
- **Points:** 150
- **Solves:** 0 (at time of attempt)
- **Flag Format:** `OVERRIDE{...}` (case-sensitive)

---

## Challenge Description

A single file named `challenge` (35,073 bytes) is provided with no other hints or description beyond the title "Silent_Transfer".

---

## Confirmed File Structure (Polyglot File)

The file is a **polyglot**: two files concatenated back-to-back:

| Layer | Type | Offset | Size | Details |
|-------|------|--------|------|---------|
| 1 | **PNG Image** | 0x0000 | 13,430 bytes | 500×400, RGBA, 8-bit, Deflate, Non-interlaced |
| 2 | **PCAP Capture** | 0x3476 (13430) | 21,643 bytes | pcap v2.4, Ethernet, microsecond timestamps |

There is **no gap** between the PNG IEND and the PCAP magic bytes. The PCAP ends exactly at the file's last byte: no trailing data.

---

## PNG Analysis

### Visual Content

- Blue background (RGB: 48, 121, 230)
- Dark text reading **"OVERRIDE!"** rendered **mirrored/upside-down**
- 832 unique pixel colors total

### Chunk Structure (minimal: no metadata)

| Chunk | Offset | Length |
|-------|--------|--------|
| IHDR | 8 | 13 |
| IDAT | 33 | 8192 |
| IDAT | 8237 | 5169 |
| IEND | 13418 | 0 |

- **No tEXt, zTXt, iTXt, eXIf, or any metadata chunks exist.**
- All rows use **filter type 1 (Sub)**.

### Alpha Channel

- Binary values only: `0` (transparent) and `255` (opaque)
- 199,600 pixels are transparent (alpha=0), only 400 are opaque (alpha=255)
- The 400 opaque pixels are all at **x=0** (leftmost column), one per row: not a stego channel, just an artifact.

### Steganography Results

- **LSB extraction** on R, G, B, A channels individually and combined: all **null bytes (0x00)**.
- **Second-bit extraction**: also null.
- **Stegano Python library** (`stegano.lsb.reveal`): returns **"Impossible to detect message"**.

---

## PCAP Analysis (33 packets total)

### Traffic Summary

Two TCP conversations on localhost (127.0.0.1):

#### Stream 1: Burp Suite Polling (port 48356 ↔ 32813)

- 7 identical `GET /json/list` HTTP requests at ~1-second intervals
- Authorization header: `x-burp-authorization: 7b38befa-32a5-4150-8cf2-6455762b097c`
- All 7 responses are **byte-for-byte identical** (1,536 bytes each)
- Response is JSON listing 3 Chrome DevTools pages:
  1. `"title": "OVERRIDE"` at `http://127.0.0.1:4000/` (the CTFd platform)
  2. `"title": "Burp Suite"` (browser extension background page)
  3. `"title": "Method-based access control can be circumvented"` (PortSwigger Web Security Academy lab)

#### Stream 2: Secret File Transfer (port 55884 ↔ 8000)

- `GET /secret.png HTTP/1.1` from `curl/8.15.0`
- Server: `SimpleHTTP/0.6 Python/3.13.7`
- Response: `HTTP/1.0 200 OK`, `Content-type: image/png`, **`Content-Length: 6666`**
- Last-Modified: `Wed, 25 Feb 2026 10:20:08 GMT`
- The transferred file is actually a **JPEG** (not PNG despite the Content-type header)

### Network Metadata: No Covert Channels Found

- All TTL values: **64** (uniform)
- IP IDs: sequential, incrementing normally
- Timing: regular ~1s intervals for Burp, no anomalies
- All Ethernet MACs: **00:00:00:00:00:00** (loopback)
- No packet padding (incl_len == orig_len for every packet)
- TCP flags are standard (SYN, SYN-ACK, PSH-ACK, FIN, ACK)

---

## Extracted JPEG Analysis (secret.png)

### Properties

- **6,666 bytes** exactly
- JFIF 1.01, baseline DCT, 500×400, 3 components (YCbCr 4:2:0)
- Same dimensions as the PNG cover image

### Visual Content

- Identical appearance to the PNG: blue background with mirrored "OVERRIDE!" text

### Structure

| Marker | Offset | Length |
|--------|--------|--------|
| SOI | 0 |: |
| APP0/JFIF | 2 | 16 |
| DQT | 20 | 67 |
| DQT | 89 | 67 |
| SOF0 | 158 | 17 |
| DHT | 177 | 31 |
| DHT | 210 | 181 |
| DHT | 393 | 31 |
| DHT | 426 | 181 |
| SOS | 609 | 12 |
| EOI | 6664 |: |

- **No EXIF, no COMMENT markers, no APP1 segments**
- **No data after JPEG EOI** (clean termination)
- Clean scan data: 6,005 bytes after byte-unstuffing

### DCT Coefficient Analysis (via OpenCV)

- Y-channel DCT LSBs: **all null bytes** (0x00)
- Cr-channel DCT LSBs: **all null bytes**
- Cb-channel DCT LSBs: **all null bytes**
- AC coefficient LSBs (all non-zero): random-looking data, no readable text, no flag

### Pixel Comparison (PNG vs JPEG)

- Every single pixel differs (JPEG compression artifacts)
- Background pixels differ by exactly +1 on R and B channels
- XOR of all pixels yields values 0-255 with no readable text
- No flag in the XOR output

---

## Encoding/Crypto Searches Performed

All on the raw 35,073-byte file:

| Method | Result |
|--------|--------|
| Plain text `OVERRIDE{` | ❌ Not found (only `"title": "OVERRIDE"` in Burp JSON) |
| Base64 of `OVERRIDE{` → `T1ZFUlJJREV7` | ❌ Not found |
| ROT13 of `OVERRIDE` → `BIREEVQR` | ❌ Not found |
| Hex encoding `4f56455252494445` | ❌ Not found |
| XOR brute force (keys 0x01-0xFF) against `OVERRIDE{` | ❌ No matches anywhere |
| Reversed `EDIRREVO` | ❌ Not found |
| File carving (foremost) | Only the same PNG + JPEG |
| Binwalk extraction | Only the same PNG + JPEG |

---

## Tools That Were NOT Available (Potential Next Steps)

These tools could not be installed on the Arch Linux system:

1. **steghide**: JPEG steganography tool. Try extracting with passphrases: `""` (empty), `"John"` (string found at PNG offset 2652), `"silent"`, `"transfer"`, `"Silent_Transfer"`, `"OVERRIDE"`, `"secret"`, `"password"`, `"6666"`
2. **outguess**: Alternative JPEG stego tool
3. **stegseek**: Steghide cracker with wordlist
4. **jsteg** (Go binary): True jsteg operates at the Huffman coding level, not recomputed DCT. Our OpenCV-based DCT analysis recomputes from pixels and may miss the original quantized coefficients.
5. **F5 steganography** decoder: Another JPEG embedding method

---

## Unsolved Hypotheses (Ranked by Likelihood)

1. **Steghide in the JPEG**: Most likely. The JPEG is the "silently transferred" secret, and steghide is the most common JPEG stego tool in CTFs. The passphrase could be `"John"`, empty, or derived from the challenge.

2. **F5 or Outguess stego in the JPEG**: Similar to steghide but different embedding algorithm.

3. **True jsteg extraction**: Requires parsing the raw Huffman stream and extracting LSBs of the original quantized DCT coefficients (not recomputed ones). Our OpenCV approach recomputes DCT from decoded pixels, which loses the original quantized values.

4. **Multi-layer encoding**: The flag could be encoded through multiple transformations (e.g., extract → decode base64 → XOR → flag).

5. **Timing covert channel**: Although timing looked regular (~1s), microsecond-level variations could encode binary data.

---

## Key Observations Worth Investigating

- The HTTP response says `Content-type: image/png` but serves a **JPEG**: deliberate mismatch
- Content-Length is **6666**: possibly significant (number of the beast × 2, or just coincidence)
- The string **"John"** appears at PNG offset 2652 (inside pixel data): could be a steghide passphrase
- Both images show the **same mirrored "OVERRIDE!" text**: the visual content may be a distraction
- The title **"Silent_Transfer"** directly describes the PCAP capture of a file being transferred

---

## Quick Reproduction Commands

```bash
# Extract the PCAP from the challenge file
dd if=challenge of=capture.pcap bs=1 skip=13430

# Extract the JPEG from the PCAP (at offset 0x4F27 in the original file)
dd if=challenge of=secret.jpg bs=1 skip=20263 count=6666

# Try steghide (if available)
steghide extract -sf secret.jpg -p ""
steghide extract -sf secret.jpg -p "John"
steghide extract -sf secret.jpg -p "Silent_Transfer"

# Try stegseek with rockyou wordlist
stegseek secret.jpg /usr/share/wordlists/rockyou.txt
```
