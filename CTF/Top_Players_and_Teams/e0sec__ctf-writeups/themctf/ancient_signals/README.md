# Ancient Signals

| Field | Details |
|-------|---------|
| **Challenge** | Ancient Signals |
| **Platform** | themctf.com |
| **Category** | Reverse Engineering |
| **Points** | 951 |
| **Files** | `player.exe`, `transmission.dat` |
| **Flag** | `THEM?!CTF{1mag1n3_gett1ng_r1ckr0ll3d_1n_tH3M?!C7F_xDDD}` |

---

## Overview

Two files: a 64-bit Windows PE executable (`player.exe`) and an encrypted data file (`transmission.dat`). The binary presents a retro-styled audio player UI with three equaliser sliders: BASS, MID, and TREBLE, and a PLAY TRANSMISSION button. Setting the sliders to the correct values unlocks decryption of a hidden flag stored inside the binary itself.

The punchline: the transmission turns out to be *Never Gonna Give You Up*: a certified in-CTF rickroll.

> All analysis was performed statically using Capstone (Python disassembler) without executing the binary.

---

## Reconnaissance

### File Identification

```
$ file player.exe
player.exe: PE32+ executable (GUI) x86-64 (stripped), for MS Windows

$ file transmission.dat
transmission.dat: data   (72,176 bytes)
```

The executable is a stripped 64-bit Windows GUI application. `transmission.dat` has no recognisable magic bytes: it is encrypted.

### String Extraction

```
SIGNAL DECRYPTED
FLAG: %s
PLAY TRANSMISSION
Frequencies misaligned.
transmission.dat
BASS:  MID:  TREBLE:
```

The strings confirm: correct slider values → decrypt signal → display flag.

---

## Binary Analysis

### PE Layout

| Section | VA | VSize | RawOff | RawSize | Notes |
|---------|----|-------|--------|---------|-------|
| `.text` | `0x1000` | `0x7efd0` | `0x400` | `0x7f000` | code |
| `.data` | `0x80000` | `0x810` | `0x7f400` | `0xa00` | globals / encrypted flag |
| `.rdata` | `0x81000` | `0xbb28` | `0x7fe00` | `0xbc00` | read-only strings |
| `.bss` | `0x98000` | `0x1940` |: |: | runtime globals |

Image base: `0x140000000` · Architecture: x86-64 · Stripped (no symbols)

### WndProc: Message Dispatch

The window procedure at `0x14002d770` dispatches Win32 messages. Two paths of interest:

- **WM_HSCROLL (`0x114`)**: fired when any trackbar moves. Reads `TBM_GETPOS (0x400)` for each slider and stores the byte value in three globals:
  ```
  BASS   → [rip + 0x6b09e]   (byte, 0-100)
  MID    → [rip + 0x6b06e]   (byte, 0-100)
  TREBLE → [rip + 0x6b077]   (byte, 0-100)
  ```
- **WM_COMMAND / id `0x65`**: fired by the PLAY TRANSMISSION button. All crypto lives here.

---

## Cryptographic Logic

### Step 1: Anti-Debug Timing Check

Before any key derivation the handler runs an RDTSC-based timing gate: calls a no-op 100 times and checks fewer than `0x200000` cycles elapsed. If a debugger slows execution, `add byte [rip+0x6b0a4], 0x13` corrupts the BASS global, poisoning the key. This check must pass cleanly.

### Step 2: Key Derivation (Linear Recurrence)

A 4-byte password is derived from the slider values using a linear recurrence over GF(256):

```asm
; r11 = TREBLE,  r10 = MID,  edx = BASS  (initial value)
; r9  = pointer to transmission.dat (first 4 bytes)
xor  ecx, ecx                    ; i = 0
loop:
  imul eax, edx, r11d            ; eax  = current_val * TREBLE
  lea  edx, [rax + r10]          ; edx  = eax + MID   (mod 256)
  movzx eax, byte [r9 + rcx]     ; load dat[i]
  xor  eax, edx                  ; key[i] = dat[i] XOR derived_val
  mov  byte [rsp + rcx + 0x6c], al
  inc  ecx
  cmp  rcx, 4
  jne  loop                      ; repeat 4 times
```

The derived sequence `d[i]` satisfies:

```
d[0] = BASS * TREBLE + MID            (mod 256)
d[i] = d[i-1] * TREBLE + MID          (mod 256)  for i > 0
```

### Step 3: Key Validation

The 4-byte result is passed to the validator at `0x1400032d0`, which checks:

```asm
cmp al,  0x52   ; 'R'
cmp al,  0x49   ; 'I'
cmp al,  0x46   ; 'F'
cmp al,  0x46   ; 'F'
```

The password must equal ASCII string `RIFF`: the magic number of a WAV file. This simultaneously validates the key and confirms that `transmission.dat` decrypts to a valid WAV.

### Step 4: Solving for Slider Values

First four bytes of `transmission.dat`:

```
dat[0:4] = 0x08  0xce  0x08  0x25
```

Required derived sequence (`dat[i] XOR d[i] = 'RIFF'[i]`):

```
d[0] = 0x08 ^ 0x52 = 0x5a
d[1] = 0xce ^ 0x49 = 0x87
d[2] = 0x08 ^ 0x46 = 0x4e
d[3] = 0x25 ^ 0x46 = 0x63
```

Solving for TREBLE (T) and MID (M) analytically:

```python
# Subtract consecutive terms to eliminate M:
# d[2] - d[1] ≡ (d[1] - d[0]) * T   (mod 256)
# 0xc7        ≡ 0x2d * T
# 45 is coprime to 256, so the modular inverse exists:
T = 0xc7 * modinv(45, 256) % 256   # = 67

# Recover M from d[1] = d[0] * T + M:
M = (0x63 - 0x4e * 67) % 256       # = 249

# Recover BASS from d[0] = BASS * T + M:
BASS = (0x5a - 249) * modinv(67, 256) % 256  # = 139
```

**Correct slider values:**

| Slider | Value |
|--------|-------|
| BASS | 139 |
| MID | 249 |
| TREBLE | 67 |

### Step 5: FNV-1a Hash Key

After password validation, the handler computes FNV-1a-32 over a fixed 80-byte region of `.text` (`0x1400032d0: 0x140003320`) and stores it as 4-byte little-endian at `[rsp+0x68]`:

```
hash = FNV1a_32( exe[0x26d0 : 0x2720] ) = 0xaa171c81
key  = [ 0x81, 0x1c, 0x17, 0xaa ]
```

This key is constant for any unmodified copy of the binary: a software fingerprint rather than a user-controlled secret.

### Step 6: XOR Decryption & Flag Extraction

The XOR loop at `0x14002df20` decrypts 55 bytes from `.data` (starting at `0x140080000`) using the 4-byte FNV key repeating:

```asm
; rcx = rsp+0x70 (destination buffer)
; r8  = 0x140080000 (.data: encrypted flag)
; key = [rsp+0x68] = 0xaa171c81 (FNV hash, little-endian)
xor rax, rax
loop:
  and  edx, 3                    ; rdx = rax & 3  (key index 0-3)
  movzx edx, byte [rsp+rdx+0x68] ; key byte
  xor  dl,  byte [r8+rax]        ; decrypt .data byte
  mov  byte [rcx-1], dl          ; store to buffer
  inc  rax
  cmp  rax, 0x37                 ; 55 bytes total
  jne  loop
```

The decrypted buffer is passed to `SetWindowTextA` to display in the result panel.

---

## Solution Script

```python
import struct

exe = open('player.exe', 'rb').read()
dat = open('transmission.dat', 'rb').read()

IMAGE_BASE = 0x140000000

def fnv1a_32(data):
    h = 0x811c9dc5
    for b in data:
        h = ((h ^ b) * 0x1000193) & 0xFFFFFFFF
    return h

fn_raw_start = 0x400 + (0x1400032d0 - IMAGE_BASE - 0x1000)
fn_raw_end   = 0x400 + (0x140003320 - IMAGE_BASE - 0x1000)
key = struct.pack('<I', fnv1a_32(exe[fn_raw_start:fn_raw_end]))
# key = b'\x81\x1c\x17\xaa'

data_raw = 0x7f400    # .data raw offset
flag_bytes = bytearray()
for i in range(0x37):
    flag_bytes.append(exe[data_raw + i] ^ key[i % 4])

print(flag_bytes.decode('ascii'))
# THEM?!CTF{1mag1n3_gett1ng_r1ckr0ll3d_1n_tH3M?!C7F_xDDD}
```

---

## Solution Summary

1. Identify binary as a Win32 GUI app with hidden flag logic behind slider controls
2. Disassemble the `WM_COMMAND` handler to find the key derivation recurrence: `d[i] = d[i-1] * TREBLE + MID (mod 256)`
3. Observe that the validator requires the derived 4 bytes to equal `"RIFF"` XOR'd with the first 4 bytes of `transmission.dat`
4. Solve the linear recurrence algebraically (modular arithmetic) → `BASS=139, MID=249, TREBLE=67`
5. Compute the fixed FNV-1a-32 hash of the code region at `0x1400032d0-0x140003320` → `key = 0xaa171c81`
6. XOR-decrypt 55 bytes from `.data` with that key to read the flag

---

## Flag

```
THEM?!CTF{1mag1n3_gett1ng_r1ckr0ll3d_1n_tH3M?!C7F_xDDD}
```
