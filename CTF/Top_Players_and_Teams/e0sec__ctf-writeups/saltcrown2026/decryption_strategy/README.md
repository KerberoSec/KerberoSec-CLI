# Decryption Strategy

| Field | Details |
|-------|---------|
| **Challenge** | Decryption Strategy |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Forensics |
| **Artifacts** | `network.pcap`, `Logfile.PML`, `C.zip` |
| **Answers** | See [Findings](#findings) below |

---

## Overview

> High on the Crownspire's locked vault, ancient treaties binding the realm's five ruling houses have kept peace for generations. When Vaultrune's archivists notice a cipher key missing from its seal, they know someone inside prepared for this: the archive was opened from within. Our mission: trace how the attacker moved, what they planted, and what they took.

We are given three forensic artifacts: a 9 MB PCAP, a Procmon log (`Logfile.PML`), and a disk snapshot (`C.zip`). The challenge asks eight questions spanning process identification, DLL-load timestamping, binary reverse engineering, registry forensics, and C2 traffic decryption.

---

## Triage

```
network.pcap: 13 843 packets, 250 s capture window (2026-06-27 16:26-16:31)
Logfile.PML: Process Monitor log (~674 MB), same timeframe
C.zip: Snapshot of C:\ including AppData for user "admin"
```

Quick protocol breakdown (`tshark -q -z io,phs`) shows mostly UDP (Skype-like traffic, DNS) and TCP with a notable cluster of **plain-HTTP POSTs** to `discord-cdn.com:80` at `203.49.53.184`. Real Discord uses HTTPS: this is the first red flag.

---

## 1: Identifying the malicious process

The `C.zip` snapshot contains a file at an unusual path:

```
C:\Users\admin\AppData\Local\Discord\app-1.0.9243\d3d11.dll
```

A legitimate `d3d11.dll` lives in `C:\Windows\System32`. Placing one in an application's own directory triggers **DLL search-order hijacking**: when `Discord.exe` calls `LoadLibrary("d3d11.dll")`, Windows finds the local copy first.

Parsing `Logfile.PML` with `procmon-parser` confirms a `Load_Image` event for this path:

```
PID 7664  Discord.exe  Load_Image  …\Discord\app-1.0.9243\d3d11.dll
```

**Process that originated the malicious behavior: `Discord.exe`**

---

## 2: DLL load timestamp

The PML event carries a Windows FILETIME of `134270440913190406`, which converts to:

```python
datetime.datetime(2026, 6, 27, 14, 28, 11, 319040, tzinfo=timezone.utc)
# Unix epoch → 1782570491
```

**Unix epoch timestamp of the malicious module load: `1782570491`**

---

## 3: Exported function invoked

Inspecting the packed DLL with `pefile` reveals a single export: `D3D11CreateDevice`. The Procmon log then shows `rundll32.exe` spawned as a child of `Discord.exe` with the command line:

```
rundll32.exe "…\d3d11.dll",D3D11CreateDevice
```

`D3D11CreateDevice` is also the entry point in the unpacked binary where `CreateMutexW` and the worker thread are launched.

**Exported function invoked: `D3D11CreateDevice`**

---

## 4: 16-byte registry value (RC4 key source)

The packed `d3d11.dll` is UPX-compressed. After unpacking (`upx -d`), disassembly reveals three functions: `GenerateSessionToken`, `WriteSessionToken`, and `ReadSessionToken`. Both read/write to:

```
HKCU\Environment  →  value name: SessionToken  (REG_BINARY, 16 bytes)
```

A Procmon registry event from PID 7664 at load time captures the actual value:

```
HKCU\Environment\SessionToken
Type: REG_BINARY  Length: 16
Data: 1a a3 a6 58 ce 2c 4a 42 58 98 3e ba 18 53 f0 8c
```

**16-byte registry value: `1aa3a658ce2c4a4258983eba1853f08c`**

---

## 5: Mutex name

The `D3D11CreateDevice` export calls `CreateMutexW` with a wide-string pointer resolved from `.rdata+0x120`. Dumping that address from the unpacked PE:

```python
pe.get_data(rva, 64).decode('utf-16le')
# → "Local\DiscordRuntimeCache"
```

**Mutex name: `Local\DiscordRuntimeCache`**

---

## 6: MITRE ATT&CK collection technique

The unpacked binary contains a function named `GetClipboardText` (visible in the symbol table as `_Z16GetClipboardTextB5cxx11v`). This function calls `OpenClipboard` / `GetClipboardData` to collect whatever text is currently on the clipboard: in this case a crypto wallet seed phrase.

**MITRE ATT&CK technique: T1115: Clipboard Data**

---

## 7: C2 IP address

The `SendTelemetry` function calls `WinHttpConnect` with the hardcoded host `discord-cdn.com`, port `0x50` (80). DNS resolution in the PCAP maps this to:

```
discord-cdn.com  →  203.49.53.184
```

All four C2 POST requests in the PCAP (`POST /api/v9/experiments`) go to this IP. Responses are `{"status":"ok"}`.

**C2 server IP: `203.49.53.184`**

---

## 8: Decrypting the exfiltrated seed phrase

### Key derivation

The `RunWorker` function reads the 16-byte `SessionToken`, **reverses it byte-by-byte**, then passes the result as the RC4 key:

```
SessionToken (raw):     1a a3 a6 58 ce 2c 4a 42 58 98 3e ba 18 53 f0 8c
RC4 key (reversed):     8c f0 53 18 ba 3e 98 58 42 4a 2c ce 58 a6 a3 1a
```

### Decryption

Applying RC4 with the reversed key to the four POST bodies:

| Frame | Plaintext |
|-------|-----------|
| 3702 | Lore text (distraction / cover traffic) |
| 8800 | Lore text (cover traffic) |
| 9590 | YouTube URL (clipboard noise) |
| **12133** | **`glow fix connect talon title risk barrel marine truth disease garbage cheese`** |

Frame 12133 is a 12-word BIP-39 mnemonic: a crypto wallet seed phrase.

```python
key = bytes.fromhex("1aa3a658ce2c4a4258983eba1853f08c")[: -1]
ct  = bytes.fromhex("866831405a291038f6cb9ec594ce7f64c270...56a371")
rc4_decrypt(key, ct)
# → b'glow fix connect talon title risk barrel marine truth disease garbage cheese'
```

**Stolen seed phrase: `glow fix connect talon title risk barrel marine truth disease garbage cheese`**

---

## Findings

| # | Question | Answer |
|---|----------|--------|
| 1 | Process that originated the malicious behavior | **Discord.exe** |
| 2 | Unix epoch timestamp when the malicious module was loaded | **1782570491** |
| 3 | Exported function of the malicious module invoked later | **D3D11CreateDevice** |
| 4 | 16-byte registry value used to derive the RC4 key | **`1aa3a658ce2c4a4258983eba1853f08c`** |
| 5 | Mutex created by the malware | **`Local\DiscordRuntimeCache`** |
| 6 | MITRE ATT&CK technique ID for the collection method | **T1115** |
| 7 | C2 server IP address | **203.49.53.184** |
| 8 | Crypto wallet seed phrase stolen by the malware | **glow fix connect talon title risk barrel marine truth disease garbage cheese** |

---

## Takeaway

This challenge chains four common stealer primitives into a single campaign:

1. **DLL hijacking** (`d3d11.dll` beside `Discord.exe`) for stealthy in-process execution  
2. **LOLBIN abuse** (`rundll32.exe`) to invoke the malicious export  
3. **Registry-backed key storage** (`HKCU\Environment\SessionToken`): the RC4 key persists across runs and looks like a legitimate session identifier  
4. **C2 traffic blending**: HTTP POST to `discord-cdn.com/api/v9/experiments` mimics the real Discord analytics endpoint, with `User-Agent: Discord/1.0` headers and `X-Build-Number`/`X-Client-Event-Source` fields

Detection opportunities: alert on `d3d11.dll` loads from any path outside `System32`; flag `CreateMutex` calls to names matching `Local\Discord*`; watch for `RegQueryValueEx` of `HKCU\Environment\SessionToken` from non-system processes.
