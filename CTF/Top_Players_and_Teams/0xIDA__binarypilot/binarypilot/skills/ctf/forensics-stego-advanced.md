---
name: forensics-stego-advanced
description: "CTF advanced steganography. FFT frequency domain image stego, SSTV decoding, DotCode barcode, DTMF custom frequency keypad, multi-track audio differential subtraction, cross-channel multi-bit LSB, video frame accumulation, audio waveform binary, spectrogram QR code, whitespace encoding in tar archives. Triggers: 'advanced stego', 'fft stego', 'sstv decode', 'dtmf decode', 'audio stego', 'video stego', 'spectrogram', 'whitespace stego', 'multi-track audio', 'differential audio'."
---

# CTF Forensics: Advanced Steganography

FFT domain, SSTV, custom DTMF, multi-track differential, video frame accumulation.

## Install

```bash
pip install numpy scipy pillow --break-system-packages
apt-get install sox multimon-ng ffmpeg qsstv
```

---

## Phase 1: FFT Frequency Domain Steganography

```python
import numpy as np
from PIL import Image

img = np.array(Image.open("image.png")).astype(float)
F = np.fft.fftshift(np.fft.fft2(img))
mag = np.log(1 + np.abs(F))

# Look for bright peaks at specific radii and angles:
cy, cx = mag.shape[0]//2, mag.shape[1]//2
radii = [100 + 69*i for i in range(21)]  # challenge-specific spacing
angles = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5]
THRESHOLD = 13.0

bits = []
for r in radii:
    byte_val = 0
    for a in angles:
        fx = cx + r * np.cos(np.radians(a))
        fy = cy - r * np.sin(np.radians(a))
        bit = 0 if mag[int(round(fy)), int(round(fx))] > THRESHOLD else 1
        byte_val = (byte_val << 1) | bit
    bits.append(byte_val)

print(bytes(bits).decode(errors='replace'))
```

```bash
# Visualize FFT in Python:
python3 -c "
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
img = np.array(Image.open('image.png').convert('L'), dtype=float)
F = np.fft.fftshift(np.fft.fft2(img))
plt.imshow(np.log(1 + np.abs(F)), cmap='gray')
plt.savefig('fft_view.png')
"
```

---

## Phase 2: SSTV Decoding

```bash
# Decode SSTV (Slow-Scan Television) from audio:
# Real-time decode from audio file:
sox audio.wav -r 44100 -t raw - | qsstv --pipe

# Or save to WAV and use qsstv GUI:
qsstv  # Load audio file → auto-detect mode (Scottie 1, Robot 36, etc.)

# CLI decode:
pip install pysstv --break-system-packages
python3 -c "
from pysstv.color import Robot36
import wave, numpy as np
with wave.open('audio.wav') as wf:
    data = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16)
r = Robot36(data, wf.getframerate())
img = r.decode()
img.save('sstv_output.png')
"
```

---

## Phase 3: Custom Frequency DTMF Decoding

```python
import numpy as np
from scipy.io import wavfile

rate, audio = wavfile.read('challenge.wav')
if audio.ndim > 1:
    audio = audio[:, 0]

# Standard DTMF: rows=[697,770,852,941], cols=[1209,1336,1477,1633]
# Challenge may use custom frequencies: check spectrogram first:
# ffmpeg -i challenge.wav -lavfi showspectrumpic=s=1920x1080 spec.png

# Identify two distinct frequency SETS from spectrogram:
ROW_FREQS = [301, 902, 1503, 2104]   # challenge-specific
COL_FREQS = [2705, 3306, 3907]        # challenge-specific
KEYPAD = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
]

def detect_dtmf(segment, rate, row_freqs, col_freqs):
    freqs = np.fft.rfftfreq(len(segment), 1/rate)
    mag = np.abs(np.fft.rfft(segment))
    
    # Find dominant frequencies near each reference:
    row_match = max(range(len(row_freqs)), 
        key=lambda i: mag[np.argmin(abs(freqs - row_freqs[i]))])
    col_match = max(range(len(col_freqs)),
        key=lambda i: mag[np.argmin(abs(freqs - col_freqs[i]))])
    return KEYPAD[row_match][col_match]

window = rate  # 1 second per symbol
digits = ''
for i in range(0, len(audio) - window, window):
    digits += detect_dtmf(audio[i:i+window], rate, ROW_FREQS, COL_FREQS)

# Convert digits to ASCII:
def digits_to_ascii(digits):
    result, i = [], 0
    while i < len(digits):
        for length in [2, 3]:
            if i + length <= len(digits):
                val = int(digits[i:i+length])
                if 32 <= val <= 126:
                    result.append(chr(val))
                    i += length
                    break
        else:
            i += 1
    return ''.join(result)

print(digits_to_ascii(digits))
```

---

## Phase 4: Multi-Track Audio Differential

```bash
# Pattern: two nearly identical audio tracks, flag in tiny difference

# 1. Extract tracks:
ffmpeg -i challenge.mkv -map 0:a:0 -c copy track0.flac
ffmpeg -i challenge.mkv -map 0:a:1 -c copy track1.flac

# 2. Convert to WAV:
ffmpeg -i track0.flac track0.wav
ffmpeg -i track1.flac track1.wav

# 3. Subtract (invert + mix):
sox -m track0.wav "|sox track1.wav -p vol -1" diff.wav

# 4. Normalize:
sox diff.wav diff_norm.wav gain -n -3

# 5. Spectrogram to read flag:
sox diff_norm.wav -n spectrogram -o spec.png -X 2000 -Y 1000 -z 100 -h

# 6. Narrow band filter if needed:
sox diff_norm.wav filtered.wav sinc 5000-12000
sox filtered.wav -n spectrogram -o filtered_spec.png -X 2000 -Y 1000 -z 100 -h
```

---

## Phase 5: Cross-Channel Multi-Bit LSB

```python
from PIL import Image

# Standard zsteg/stegsolve fails because DIFFERENT bit positions per channel
# Red: bit 0, Green: bit 1, Blue: bit 2

img = Image.open("challenge.png")
pixels = img.load()
bits = []

for y in range(img.height):
    for x in range(img.width):
        r, g, b = pixels[x, y][:3]
        bits.append((r >> 0) & 1)   # Red: bit position 0
        bits.append((g >> 1) & 1)   # Green: bit position 1
        bits.append((b >> 2) & 1)   # Blue: bit position 2

# Pack to bytes:
data = bytearray()
for i in range(0, len(bits) - 7, 8):
    byte = 0
    for j in range(8):
        byte = (byte << 1) | bits[i + j]
    data.append(byte)

print(data.decode('ascii', errors='ignore')[:200])
```

---

## Phase 6: Video Frame Accumulation

```bash
# Hidden pattern in positions of flashing objects across frames

# 1. Extract all frames:
ffmpeg -i challenge.mp4 -vsync 0 frames/frame_%04d.png

# 2. Composite (take maximum pixel value):
python3 << 'EOF'
from PIL import Image
import numpy as np, os

frames = sorted(f for f in os.listdir('frames') if f.endswith('.png'))
base = np.zeros(np.array(Image.open(f'frames/{frames[0]}')).shape, dtype=np.float64)

for f in frames:
    frame = np.array(Image.open(f'frames/{f}'), dtype=np.float64)
    base = np.maximum(base, frame)

Image.fromarray(base.astype(np.uint8)).save('accumulated.png')
EOF

# 3. Scan for QR code:
zbarimg accumulated.png
```

---

## Phase 7: Audio Musical Note Identification

```python
import numpy as np
from scipy.io import wavfile

rate, audio = wavfile.read('challenge.wav')
if audio.ndim > 1:
    audio = audio[:, 0]

# FFT to find dominant frequencies
freqs = np.fft.rfftfreq(len(audio), 1/rate)
magnitude = np.abs(np.fft.rfft(audio))

NOTE_FREQS = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
    'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
    'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
}

def freq_to_note(freq):
    return min(NOTE_FREQS.items(), key=lambda x: abs(x[1] - freq))[0]

# Get top peaks:
peak_indices = np.argsort(magnitude)[-20:]
peak_freqs = sorted(set(round(freqs[i]) for i in peak_indices if freqs[i] > 20))
notes = [freq_to_note(f) for f in peak_freqs]

# Read note letters as word:
print(''.join(n[0] for n in notes))  # e.g., BADFACE

# Also check metadata:
import subprocess
meta = subprocess.run(['exiftool', 'challenge.wav'], capture_output=True, text=True)
print(meta.stdout)
```

---

## Phase 8: Whitespace Encoding in Archives

```python
import tarfile, os

def extract_nested_tar(path, depth=0, max_depth=100):
    if depth >= max_depth:
        return
    if tarfile.is_tarfile(path):
        outdir = f'layer_{depth}'
        os.makedirs(outdir, exist_ok=True)
        with tarfile.open(path) as tf:
            tf.extractall(outdir)
            for member in tf.getmembers():
                nested = os.path.join(outdir, member.name)
                if os.path.isfile(nested):
                    extract_nested_tar(nested, depth+1, max_depth)

extract_nested_tar('challenge.tar')

# Collect whitespace from file contents:
bits = []
for root, dirs, files in os.walk('.'):
    for f in sorted(files):
        path = os.path.join(root, f)
        with open(path, 'rb') as fh:
            for byte in fh.read():
                if byte == 0x20:   # space = 0
                    bits.append(0)
                elif byte == 0x09:  # tab = 1
                    bits.append(1)

# Decode:
data = bytes(int(''.join(map(str, bits[i:i+8])), 2) for i in range(0, len(bits)-7, 8))
print(data.decode(errors='replace'))
```

---

## Output

Save to `.omop/engagement/ctf/forensics/stego/`:
- `fft_view.png`: FFT visualization
- `sstv_output.png`: SSTV decoded image
- `accumulated.png`: video frame composite
- `flag.txt`: extracted flag

## Next Phase

→ `ctf-forensics-network` for PCAP analysis
→ `ctf-forensics-disk` for disk/memory forensics
