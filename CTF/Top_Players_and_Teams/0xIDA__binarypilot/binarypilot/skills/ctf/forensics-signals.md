---
name: forensics-signals
description: "CTF signals and hardware forensics. VGA binary signal decoding (800x525 total frame, 640x480 active, 5-byte samples), HDMI TMDS 10-bit symbol decode, DisplayPort 8b/10b LFSR descrambling, Voyager golden record audio sync pulse image extraction, side-channel power analysis DPA with variance-based leak detection, Saleae Logic 2 .sal UART decode (delta encoding, baud rate detection), Flipper Zero .sub file parsing, keyboard acoustic side-channel MFCC classification. Triggers: 'vga signal', 'hdmi tmds', 'displayport lfsr', 'golden record audio', 'side channel power analysis', 'dpa attack', 'saleae logic uart', 'flipper zero sub', 'keyboard acoustic', 'hardware forensics', 'signal forensics', 'power trace analysis'."
---

# CTF Forensics: Signals & Hardware

VGA/HDMI/DisplayPort decode, power analysis, UART, keyboard acoustics.

## Install

```bash
pip install numpy scipy pillow pyserial --break-system-packages
apt-get install librosa sox
```

---

## Phase 1: VGA Signal Decoding

```python
import numpy as np
from PIL import Image

data = open('vga.bin', 'rb').read()

TOTAL_W, TOTAL_H = 800, 525
ACTIVE_W, ACTIVE_H = 640, 480
BYTES_PER_SAMPLE = 5  # R, G, B, hsync, vsync

samples = np.frombuffer(data, dtype=np.uint8).reshape(-1, BYTES_PER_SAMPLE)
frame = samples.reshape(TOTAL_H, TOTAL_W, BYTES_PER_SAMPLE)

# Extract active region; scale 6-bit color to 8-bit:
active = frame[:ACTIVE_H, :ACTIVE_W, :3]
img_arr = (active.astype(np.uint16) * 4).clip(0, 255).astype(np.uint8)
Image.fromarray(img_arr).save('vga_output.png')
# Key: total frame includes blanking: always crop. If dark, multiply by 4 (6-bit source).
```

---

## Phase 2: HDMI TMDS Decoding

```python
def tmds_decode(symbol_10bit):
    """Decode 10-bit TMDS symbol to 8-bit pixel value."""
    bits = [(symbol_10bit >> i) & 1 for i in range(10)]
    # bits[9] = inversion flag, bits[8] = XOR/XNOR mode

    if bits[9]:
        d = [1 - bits[i] for i in range(8)]
    else:
        d = [bits[i] for i in range(8)]

    q = [d[0]]
    if bits[8]:
        for i in range(1, 8):
            q.append(d[i] ^ q[i-1])        # XOR mode
    else:
        for i in range(1, 8):
            q.append(d[i] ^ q[i-1] ^ 1)    # XNOR mode

    return sum(q[i] << i for i in range(8))

# Parse: read 10-bit symbols, group into 3 channels (R, G, B)
# Frame is 800x525 total, crop to 640x480 active region
```

---

## Phase 3: DisplayPort 8b/10b + LFSR Descrambling

```python
def lfsr_descramble(data):
    """DisplayPort LFSR descrambler (x^16 + x^5 + x^4 + x^3 + 1). Resets on BS/BE control symbols."""
    lfsr = 0xFFFF
    result = []
    for byte in data:
        out = byte
        for bit_idx in range(8):
            feedback = (lfsr >> 15) & 1
            out ^= (feedback << bit_idx)
            new_bit = ((lfsr >> 15) ^ (lfsr >> 4) ^ (lfsr >> 3) ^ (lfsr >> 2)) & 1
            lfsr = ((lfsr << 1) | new_bit) & 0xFFFF
        result.append(out & 0xFF)
    return bytes(result)

# Transport Unit: 64 columns per TU
# Columns 0-59: pixel data (RGB)
# Columns 60-63: overhead (sync, stuffing)
# BS=0x1C, BE=0xFB → LFSR reset points
```

---

## Phase 4: Voyager Golden Record Audio → Image

```python
import numpy as np
from scipy.io import wavfile
from PIL import Image

rate, audio = wavfile.read('golden_record.wav')
audio = audio.astype(np.float32)

# Find sync pulses (sharp negative spikes):
threshold = np.min(audio) * 0.7
sync_indices = np.where(audio < threshold)[0]

pulses = [sync_indices[0]]
for i in range(1, len(sync_indices)):
    if sync_indices[i] - sync_indices[i-1] > 100:
        pulses.append(sync_indices[i])

# Extract scan lines between pulses, resample to fixed width:
WIDTH = 512
lines = []
for i in range(len(pulses) - 1):
    line = audio[pulses[i]:pulses[i+1]]
    resampled = np.interp(
        np.linspace(0, len(line)-1, WIDTH),
        np.arange(len(line)), line
    )
    lines.append(resampled)

img_arr = np.array(lines)
img_arr = ((img_arr - img_arr.min()) / (img_arr.max() - img_arr.min()) * 255).astype(np.uint8)
Image.fromarray(img_arr).save('voyager_image.png')
```

---

## Phase 5: Side-Channel Power Analysis (DPA)

```python
import numpy as np
import hashlib

# Load power traces: shape = (positions, guesses, traces, samples)
data = np.load('power_traces.npy')
n_positions, n_guesses, n_traces, n_samples = data.shape

key_digits = []
for pos in range(n_positions):
    # Average across traces for each guess:
    avg_power = data[pos].mean(axis=1)  # shape: (guesses, samples)
    
    # Find leak point: sample with max variance across guesses
    variance_per_sample = avg_power.var(axis=0)
    leak_sample = np.argmax(variance_per_sample)
    
    # Correct guess = highest power at leak point
    best_guess = np.argmax(avg_power[:, leak_sample])
    key_digits.append(best_guess)

key = ''.join(str(d) for d in key_digits)
print(f"Recovered key: {key}")
flag = hashlib.sha256(key.encode()).hexdigest()
print(f"Flag (if SHA256 wrapped): flag{{{flag}}}")
```

---

## Phase 6: Saleae Logic 2 UART Decode

```python
import zipfile, struct

# .sal file is a ZIP containing digital-0.bin through digital-7.bin + meta.json
with zipfile.ZipFile('capture.sal') as z:
    with z.open('digital-0.bin') as f:
        raw = f.read()

# Binary format: magic "<SALEAE>" + header + delta-encoded transitions
magic = raw[:8]   # b'<SALEAE>'
# Parse version (u32), type (u32=100 for digital), initial_state, then deltas

# Reconstruct signal from deltas:
# Each delta = samples until next state transition
SAMPLE_RATE = 1_000_000  # 1MHz typical
BAUD = 115200
BIT_PERIOD = SAMPLE_RATE / BAUD

def uart_decode(initial_state, deltas, sample_rate, baud):
    """Decode UART from Saleae Logic delta transitions."""
    bit_period = sample_rate / baud
    state = initial_state
    current_sample = 0
    byte_buffer = []
    
    transition_times = []
    for delta in deltas:
        current_sample += delta
        transition_times.append((current_sample, state))
        state ^= 1
    
    # Find start bits (high→low) and decode 8 data bits
    # Try both polarities if output looks garbled
    return bytes(byte_buffer)

# Quick approach: open in Saleae Logic 2 GUI → add UART analyzer → export
```

---

## Phase 7: Keyboard Acoustic Side-Channel

```python
import numpy as np
from scipy.signal import find_peaks
from scipy.io import wavfile
import librosa
from sklearn.neighbors import KNeighborsClassifier

def extract_features(audio, sr, peak_sample, window_ms=10):
    win = int(window_ms / 1000 * sr)
    start = max(0, peak_sample - win // 2)
    segment = audio[start:start + win].astype(float)
    mfccs = librosa.feature.mfcc(y=segment, sr=sr, n_mfcc=20)
    return np.concatenate([mfccs.mean(axis=1), mfccs.std(axis=1)])  # 40-dim

def find_keystroke_peaks(audio_path):
    sr, audio = wavfile.read(audio_path)
    if audio.ndim > 1: audio = audio.mean(axis=1)
    win = int(0.01 * sr)
    energy = np.array([np.sum(audio[i:i+win]**2) for i in range(0, len(audio) - win, win)])
    min_dist = int(0.175 * sr / win)
    peaks, _ = find_peaks(energy, height=0.03 * energy.max(), distance=min_dist)
    return sr, audio, peaks * win

# Build reference from labeled audio, classify flag keystrokes with KNN:
# knn = KNeighborsClassifier(n_neighbors=5)
# knn.fit(X_ref, y_ref)
# flag = ''.join(knn.predict([extract_features(audio, sr, p) for p in flag_peaks]))
```

---

## Output

Save to `.omop/engagement/ctf/forensics/signals/`:
- `decoded_image.png`: VGA/HDMI/audio-decoded output
- `uart_data.bin`: UART decoded bytes
- `flag.txt`: recovered flag

## Next Phase

→ `ctf-forensics-stego-advanced` for FFT stego, SSTV, DTMF
→ `ctf-misc-rf-sdr` for RF/SDR signal challenges
