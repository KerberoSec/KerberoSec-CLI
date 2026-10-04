# 🔊 beeepp booppp: CTF Challenge Writeup

**Category:** Forensics  
**Points:** 430  
**Flag:** `cyros{1tta_A5aa&_H@1_KY@1!}`

---

## Challenge Description

> An automated system broadcast a short transmission before going silent.
>
> The signal is structured: not speech, not music, not noise.  
> Just a sequence of tones, repeating in precise pairs.
>
> The system doesn't use language. It speaks in protocols.
>
> Decode the transmission and recover the message.

---

## Solution Overview

The encoding chain is:

```
WAV audio → DTMF digits → ASCII decimal string → Flag
```

Each character of the flag is stored as its **decimal ASCII value** (2-3 digits) in a continuous DTMF digit stream. The "precise pairs" in the description refers to DTMF itself: every tone is a **dual-frequency pair** (one row frequency + one column frequency played simultaneously).

---

## Step-by-Step Walkthrough

### Step 1: Inspect the File

```python
import wave
w = wave.open('chall.wav')
# Sample rate: 44100 Hz | Mono | Duration: ~14.3 s
```

---

### Step 2: Find the 62 Tone Segments

The file contains **62 equal-length DTMF tones** (~183 ms each) separated by **61 equal silences** (~48 ms each). There is no duration-based Morse encoding: all tones are the same length.

```python
# Threshold RMS to find silence regions
rms_arr = np.array([np.sqrt(np.mean(data[i:i+100]**2))
                    for i in range(0, len(data)-100, 100)])
silent = rms_arr < 500
# → 61 silent regions → 62 tone segments
```

---

### Step 3: Decode Each Tone as DTMF

Analyse the middle portion of each tone segment using FFT and match the two strongest frequencies to the DTMF table:

| Row \ Col | 1209 Hz | 1336 Hz | 1477 Hz | 1633 Hz |
|-----------|---------|---------|---------|---------|
| **697 Hz** | 1 | 2 | 3 | A |
| **770 Hz** | 4 | 5 | 6 | B |
| **852 Hz** | 7 | 8 | 9 | C |
| **941 Hz** | * | 0 | # | D |

Result:

```
99121114111115123491161169795655397973895726449957589644933125
```

---

### Step 4: Decode ASCII Decimal

Each character's ASCII value is concatenated as its decimal representation: no delimiter, variable length:

| Digits | Value | Char |
|--------|-------|------|
| `99`  | 99  | `c` |
| `121` | 121 | `y` |
| `114` | 114 | `r` |
| `111` | 111 | `o` |
| `115` | 115 | `s` |
| `123` | 123 | `{` |
| `49`  | 49  | `1` |
| `116` | 116 | `t` |
| ... | ... | ... |
| `125` | 125 | `}` |

The parse is unambiguous: 2-digit numbers cover ASCII 32-99 and 3-digit numbers cover 100-127. There is exactly one valid decoding.

---

## Full Solve Script

```python
import numpy as np
import wave

# Load audio
w = wave.open('chall.wav')
frames = w.readframes(w.getnframes())
sr = w.getframerate()
w.close()
data = np.frombuffer(frames, dtype=np.int16).astype(float)

# ── Step 1: Find silence boundaries to isolate each tone segment ──
chunk_small = 100
rms_arr = np.array([
    np.sqrt(np.mean(data[i:i+chunk_small]**2))
    for i in range(0, len(data) - chunk_small, chunk_small)
])

silent = rms_arr < 500
silent_runs = []
in_sil = False; start = 0
for i, s in enumerate(silent):
    if not in_sil and s:     start = i;  in_sil = True
    elif in_sil and not s:   silent_runs.append((start, i)); in_sil = False
if in_sil: silent_runs.append((start, len(silent)))

tone_segs = []
prev_end = 0
for sil_start, sil_end in silent_runs:
    if sil_start > prev_end:
        tone_segs.append((prev_end, sil_start))
    prev_end = sil_end
if prev_end < len(rms_arr):
    tone_segs.append((prev_end, len(rms_arr)))

# ── Step 2: Decode each tone segment as a DTMF digit ─────────────
DTMF_MAP = {
    (697,1209):'1', (697,1336):'2', (697,1477):'3', (697,1633):'A',
    (770,1209):'4', (770,1336):'5', (770,1477):'6', (770,1633):'B',
    (852,1209):'7', (852,1336):'8', (852,1477):'9', (852,1633):'C',
    (941,1209):'*', (941,1336):'0', (941,1477):'#', (941,1633):'D',
}
rows = [697, 770, 852, 941]
cols = [1209, 1336, 1477, 1633]

dtmf_sequence = ''
for start_c, end_c in tone_segs:
    start_s = start_c * chunk_small
    end_s   = min(end_c * chunk_small, len(data))
    seg = data[start_s:end_s]
    if len(seg) < 512:
        continue

    mid  = len(seg) // 2
    alen = min(4096, len(seg))
    seg_mid = seg[mid - alen//2 : mid + alen//2]

    freqs = np.fft.rfftfreq(len(seg_mid), 1/sr)
    mag   = np.abs(np.fft.rfft(seg_mid * np.hanning(len(seg_mid))))

    def peak(f):
        m = mag[(freqs >= f-30) & (freqs <= f+30)]
        return m.max() if len(m) else 0

    best_row = max(rows, key=peak)
    best_col = max(cols, key=peak)
    dtmf_sequence += DTMF_MAP.get((best_row, best_col), '?')

print(f"[+] DTMF sequence: {dtmf_sequence}")

# ── Step 3: Decode digit string as variable-length ASCII decimal ──
def decode_ascii_decimal(s, pos=0, acc=''):
    if pos == len(s):
        yield acc
        return
    for length in (3, 2):
        if pos + length <= len(s):
            v = int(s[pos:pos+length])
            if 32 <= v <= 127:
                yield from decode_ascii_decimal(s, pos + length, acc + chr(v))

flag = next(
    d for d in decode_ascii_decimal(dtmf_sequence)
    if d.startswith('cyros{') and d.endswith('}')
)
print(f"[+] Flag: {flag}")
```

---

## Key Takeaways

- **"Precise pairs"** = DTMF itself. Every DTMF tone is defined by exactly two simultaneous frequencies (row + column). No Morse, no multi-tap.
- **No duration encoding**: all 62 tones are identical in length. The only information is the digit identity.
- **Variable-length ASCII decimal** is unambiguous when the character set is limited to printable ASCII (32-127), because 1-digit values (1-9) don't reach printable range, enforcing 2- or 3-digit groupings naturally.
- The earlier (incorrect) README described a Morse + Base32 + Base64 chain: that was solved on a *different* version of the file. This is the real challenge file.

---

## Flag

```
cyros{1tta_A5aa&_H@1_KY@1!}
```
