---
name: misc-rf-sdr
description: "CTF RF/SDR signal processing. IQ file formats (cf32/cs16/cu8), spectrum analysis, QAM-16 demodulation with carrier and timing recovery, cyclostationary analysis for symbol rate, Mueller-Muller timing, GNU Radio integration. Triggers: 'sdr', 'rf ctf', 'iq signal', 'qam demodulation', 'signal processing', 'gnuradio', 'rtlsdr', 'iq file', 'cf32', 'radio frequency'."
---

# CTF Misc: RF / SDR / IQ Signal Processing

IQ format loading, spectrum analysis, QAM-16 demodulation, timing recovery.

## Install

```bash
pip install numpy scipy matplotlib --break-system-packages
# GNU Radio: sudo apt-get install gnuradio
```

---

## Phase 1: Load IQ Data

```python
import numpy as np
from scipy import signal
import matplotlib.pyplot as plt

# cf32 (GNU Radio standard: complex float 32):
iq = np.fromfile('signal.cf32', dtype=np.complex64)

# cs16 (complex signed 16-bit):
raw = np.fromfile('signal.cs16', dtype=np.int16).reshape(-1, 2)
iq = (raw[:, 0] + 1j * raw[:, 1]).astype(np.complex64)

# cu8 (RTL-SDR raw: complex unsigned 8):
raw = np.fromfile('signal.cu8', dtype=np.uint8).reshape(-1, 2)
iq = ((raw[:, 0] - 128) + 1j * (raw[:, 1] - 128)).astype(np.float32) / 128.0

print(f"Loaded {len(iq)} samples ({len(iq)/1e6:.2f}M samples)")
```

---

## Phase 2: Spectrum Analysis

```python
# FFT spectrum to find occupied bands:
N = 4096
fft_data = np.fft.fftshift(np.fft.fft(iq[:N], n=N))
power_db = 20 * np.log10(np.abs(fft_data) + 1e-10)

plt.figure(figsize=(12, 4))
plt.plot(np.linspace(-0.5, 0.5, N), power_db)
plt.xlabel('Normalized Frequency')
plt.ylabel('Power (dB)')
plt.title('Spectrum')
plt.savefig('spectrum.png', dpi=150)

# Find band centers (peaks above threshold):
from scipy.signal import find_peaks
peaks, _ = find_peaks(power_db, height=np.max(power_db) - 20, distance=N//20)
print("Band centers (normalized freq):", np.linspace(-0.5, 0.5, N)[peaks])
```

---

## Phase 3: Cyclostationary Analysis (Symbol Rate)

```python
def find_symbol_rate(iq: np.ndarray, n_fft: int = 65536) -> float:
    """Find symbol rate via squared magnitude cyclostationary analysis."""
    # QAM: squaring removes carrier, leaves symbol rate component
    x2 = np.abs(iq) ** 2
    fft_x2 = np.abs(np.fft.fft(x2, n=n_fft))
    freqs = np.fft.fftfreq(n_fft)
    
    # Peak at Rs = samples_per_symbol^-1
    fft_x2[0] = 0  # Remove DC
    peak_idx = np.argmax(fft_x2[:n_fft//2])
    symbol_rate_norm = freqs[peak_idx]
    samples_per_symbol = 1.0 / symbol_rate_norm
    
    print(f"Symbol rate: {symbol_rate_norm:.6f} (normalized)")
    print(f"Samples per symbol: {samples_per_symbol:.2f}")
    return samples_per_symbol

sps = find_symbol_rate(iq)
```

---

## Phase 4: Frequency Shift + Low-Pass Filter

```python
def shift_to_baseband(iq: np.ndarray, center_freq_norm: float, bandwidth: float) -> np.ndarray:
    """Move signal to baseband and low-pass filter."""
    t = np.arange(len(iq))
    baseband = iq * np.exp(-2j * np.pi * center_freq_norm * t)
    
    # Low-pass filter:
    lpf = signal.firwin(101, bandwidth / 2, fs=1.0)
    filtered = signal.lfilter(lpf, 1.0, baseband)
    return filtered

# Example: band at 0.14 normalized, width 0.08
baseband = shift_to_baseband(iq, center_freq_norm=0.14, bandwidth=0.08)
```

---

## Phase 5: QAM-16 Demodulation

```python
# QAM-16 constellation (standard):
QAM16_CONST = np.array([
    c + 1j*r for r in [-3, -1, 1, 3] for c in [-3, -1, 1, 3]
], dtype=np.complex64)
QAM16_CONST /= np.sqrt(np.mean(np.abs(QAM16_CONST)**2))

def decision(symbol, constellation=QAM16_CONST):
    """Find nearest constellation point."""
    return constellation[np.argmin(np.abs(symbol - constellation))]

def demodulate_qam16(iq: np.ndarray, sps: float):
    """Demodulate QAM-16 with decision-directed carrier + Mueller-Muller timing."""
    
    # AGC normalization:
    iq = iq / np.sqrt(np.mean(np.abs(iq)**2)) * np.sqrt(np.mean(np.abs(QAM16_CONST)**2))
    
    # 2nd-order PLL parameters:
    carrier_bw = 0.02
    damping = 1.0
    theta_n = carrier_bw / (damping + 1/(4*damping))
    Kp = 2 * damping * theta_n
    Ki = theta_n ** 2
    
    carrier_phase = 0.0
    carrier_freq = 0.0
    
    # Timing:
    timing_phase = 0.0
    timing_freq = 1.0 / sps
    mu = 0.01
    
    symbols = []
    pos = int(sps)
    
    while pos < len(iq):
        idx = int(pos)
        # De-rotate:
        raw = iq[idx] * np.exp(-1j * carrier_phase)
        
        # Decision:
        d = decision(raw)
        
        # Phase error (decision-directed):
        error = np.imag(raw * np.conj(d)) / (np.abs(d)**2 + 0.1)
        
        # Update carrier loop:
        carrier_freq += Ki * error
        carrier_phase += Kp * error + carrier_freq
        
        symbols.append(d)
        pos += sps
    
    return np.array(symbols)

symbols = demodulate_qam16(baseband, sps)

# Handle 4-fold ambiguity (0/90/180/270 rotation):
for rotation in [0, 1, 2, 3]:
    rotated = symbols * (1j ** rotation)
    # Try to decode bits from each rotation
    print(f"Rotation {rotation*90}°: {rotated[:8]}")
```

---

## Phase 6: Symbol to Bits / Bytes

```python
# QAM-16: 4 bits per symbol
# Nibble encoding depends on CTF challenge spec (check constellation map!)

def qam16_to_bits(symbol, constellation=QAM16_CONST):
    """Map constellation point to 4 bits."""
    idx = np.argmin(np.abs(symbol - constellation))
    return format(idx, '04b')

def symbols_to_bytes(symbols):
    """Convert QAM-16 symbols to bytes (2 symbols = 1 byte)."""
    bits = ''.join(qam16_to_bits(s) for s in symbols)
    return bytes(int(bits[i:i+8], 2) for i in range(0, len(bits)-7, 8))

data = symbols_to_bytes(symbols)
print(f"Decoded {len(data)} bytes")
print("First bytes:", data[:32])

# Search for flag:
import re
flags = re.findall(b'[A-Za-z0-9_]+{[^}]+}', data)
print("Flags found:", flags)
```

---

## Phase 7: Framing / Delineation

```bash
# Common framing patterns:
# - Idle pattern repeating while link idle
# - Start delimiter (often single symbol like 0)
# - Data payload (nibble pairs for QAM-16: high nibble first, low nibble)
# - End delimiter (same as start, e.g., 0)

# Algorithm:
# 1. Find repeating idle pattern (first N symbols)
# 2. Locate start delimiter after idle
# 3. Read data until end delimiter
# 4. Decode nibbles to bytes

python3 << 'EOF'
import numpy as np

symbols = np.load('symbols.npy')

# Find idle by looking for repeating pattern:
for frame_len in [4, 8, 16, 32]:
    idle = symbols[:frame_len]
    repeats = 0
    for i in range(frame_len, min(frame_len*10, len(symbols)), frame_len):
        if np.allclose(symbols[i:i+frame_len], idle, atol=0.1):
            repeats += 1
    if repeats >= 3:
        print(f"Possible idle pattern of length {frame_len}, repeats: {repeats}")
EOF
```

---

## Output

Save to `.omop/engagement/ctf/misc/sdr/`:
- `spectrum.png`: frequency spectrum visualization
- `constellation.png`: IQ scatter plot
- `decoded.bin`: recovered data
- `flag.txt`: found flag

## Next Phase

→ `ctf-misc-encodings` for data encoding
→ `ctf-forensics-network` for PCAP analysis
