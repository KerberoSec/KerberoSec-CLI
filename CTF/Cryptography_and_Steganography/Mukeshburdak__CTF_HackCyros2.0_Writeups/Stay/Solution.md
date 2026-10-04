# 📡 Stay (Crypto/Audio)

> *"It says Stayyyy....."*

| Field | Details |
|-------|---------|
| **Challenge** | Stay |
| **Category** | Crypto |
| **Points** | 430 |
| **File** | `chall.wav` |
| **Flag** | `cyros{m0R5E_Y0uR53Lf}` |

---

## 🧠 TL;DR

A mono 8kHz WAV file encodes Morse code (single ~551 Hz tone, short = dot, long = dash). Decoding the Morse gives a **Base32** string. Decoding that gives a **Base64** string. Decoding *that* gives the flag.

```
Audio → Morse → Base32 → Base64 → Flag
```

---

## 🔍 Step-by-Step Walkthrough

### Step 1: Inspect the Audio File

```python
import scipy.io.wavfile as wav
rate, data = wav.read('chall.wav')
# Sample rate: 8000 Hz | Duration: ~39.4 seconds | Type: uint8
```

Running a spectrogram reveals **only one active frequency** throughout the entire file: approximately **551 Hz**. The "Stayyyy....." title is a clue: the drawn-out dots hint at **Morse code**: short beeps (dots) and long boops (dashes).

---

### Step 2: Identify the Morse Timing

Using energy-based detection to find tone vs. silence segments:

```python
from scipy import signal
import numpy as np

f, t_spec, Sxx = signal.spectrogram(normalized, rate, nperseg=256, noverlap=230)
energy = np.sum(Sxx, axis=0)
is_tone = energy > (np.max(energy) * 0.1)
```

Two distinct tone lengths and two distinct silence lengths are found:

| Signal | Duration | Meaning |
|--------|----------|---------|
| Short tone | ~81 ms | **Dot** (`.`) |
| Long tone | ~201 ms | **Dash** (`-`) |
| Short silence | ~39 ms | Inter-symbol gap (same letter) |
| Long silence | ~159 ms | **Inter-letter gap** |

> ℹ️ The first tone (~55 ms) is a **preamble burst**: treated as a dot and included as part of the first letter.

---

### Step 3: Decode Morse → Base32 String

Grouping tones between letter-boundary silences (≥ 150 ms) and mapping dot/dash sequences to the Morse alphabet yields 56 characters:

```
LEZWY6LCGNHDOYSUIJJU4VKWMZLVIQRRKVVFK6SUI5NDSRCRN46Q====
```

The four trailing `====` characters come from the Morse code for `=` (`-...-`) and are **Base32 padding**.

---

### Step 4: Base32 Decode → Base64 String

```python
import base64
b32_result = base64.b32decode("LEZWY6LCGNHDOYSUIJJU4VKWMZLVIQRRKVVFK6SUI5NDSRCRN46Q====")
# Result: b'Y3lyb3N7bTBSNUVfWTB1UjUzTGZ9DQo='
```

The decoded bytes form a valid **Base64 string**:

```
Y3lyb3N7bTBSNUVfWTB1UjUzTGZ9DQo=
```

---

### Step 5: Base64 Decode → Flag

```python
flag = base64.b64decode("Y3lyb3N7bTBSNUVfWTB1UjUzTGZ9DQo=")
# Result: b'cyros{m0R5E_Y0uR53Lf}\r\n'
print(flag.decode().strip())
```

---

## 🚩 Flag

```
cyros{m0R5E_Y0uR53Lf}
```

> The flag itself is leet-speak for **"MORSE YOURSELF"**: a cheeky self-referential message from the challenge author.

---

## 🛠️ Full Solve Script

```python
import scipy.io.wavfile as wav
import numpy as np
from scipy import signal
from itertools import groupby
import base64

# --- Load & normalize ---
rate, data = wav.read('chall.wav')
normalized = data.astype(float) - 128.0  # uint8 center at 0

# --- Spectrogram & energy detection ---
f, t_spec, Sxx = signal.spectrogram(normalized, rate, nperseg=256, noverlap=230)
dt = t_spec[1] - t_spec[0]
energy = np.sum(Sxx, axis=0)
is_tone = energy > (np.max(energy) * 0.1)

# --- Build tone/silence runs ---
runs = [(k, sum(1 for _ in v)) for k, v in groupby(is_tone)]

# --- Morse code lookup ---
MORSE = {
    '.-':'A',  '-...':'B', '-.-.':'C', '-..':'D',  '.':'E',   '..-.':'F',
    '--.':'G', '....':'H', '..':'I',   '.---':'J', '-.-':'K', '.-..':'L',
    '--':'M',  '-.':'N',   '---':'O',  '.--.':'P', '--.-':'Q', '.-.':'R',
    '...':'S', '-':'T',    '..-':'U',  '...-':'V', '.--':'W',  '-..-':'X',
    '-.--':'Y','--..':'Z', '-----':'0','.----':'1','..---':'2','...--':'3',
    '....-':'4','.....':'5','-....':'6','--...':'7','---..':'8','----.':'9',
    '-...-':'='
}

# --- Decode Morse (include preamble dot as first symbol) ---
current_morse = []
letters = []

for is_t, count in runs:
    dur_ms = count * dt * 1000
    if is_t:
        current_morse.append('.' if dur_ms < 130 else '-')
    elif dur_ms > 100:          # letter boundary
        if current_morse:
            ms = ''.join(current_morse)
            letters.append(MORSE.get(ms, ms))
            current_morse = []

if current_morse:
    ms = ''.join(current_morse)
    letters.append(MORSE.get(ms, ms))

b32_string = ''.join(letters)
print(f"Morse decoded : {b32_string}")
# LEZWY6LCGNHDOYSUIJJU4VKWMZLVIQRRKVVFK6SUI5NDSRCRN46Q====

# --- Base32 decode ---
b64_string = base64.b32decode(b32_string)
print(f"Base32 decoded: {b64_string.decode()}")
# Y3lyb3N7bTBSNUVfWTB1UjUzTGZ9DQo=

# --- Base64 decode ---
flag = base64.b64decode(b64_string).decode().strip()
print(f"Flag: {flag}")
# cyros{m0R5E_Y0uR53Lf}
```

---

## 🔗 Encoding Chain Visualized

```
┌─────────────────────────────────────────────────────────────┐
│  chall.wav  (8 kHz, ~39s, single 551 Hz tone)               │
│                                                              │
│  Morse timing:  81ms = dot (.)   201ms = dash (-)           │
│                 39ms = symbol gap   159ms = letter gap       │
└───────────────────────┬─────────────────────────────────────┘
                        │ Morse decode
                        ▼
  LEZWY6LCGNHDOYSUIJJU4VKWMZLVIQRRKVVFK6SUI5NDSRCRN46Q====
                        │ Base32 decode
                        ▼
          Y3lyb3N7bTBSNUVfWTB1UjUzTGZ9DQo=
                        │ Base64 decode
                        ▼
              cyros{m0R5E_Y0uR53Lf}
```

---

## 💡 Key Takeaways

- **"Stayyyy....."** = the drawn-out dots hint at **Morse code** (short dot, long dash)
- **"speaks in protocols"** = layered encoding (Morse → Base32 → Base64)
- **"precise pairs"** = each character pair (dot duration, gap duration) is exact
- Always check for **multi-layer encoding** when a decode looks like another encoded string
- The Morse `=` character (`-...-`) serves double duty as **Base32 padding**

---

## 📦 Requirements

```bash
pip install scipy numpy
```
