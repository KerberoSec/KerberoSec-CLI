# OutOfPhase

**Category:** Hardware / Signal Processing  ·  **Flag:** `ASIS{R0t4t3dC4rri3rs_m1uAF0HBNhEJ4YJAUDQPhCNe2uk8vtY8mYVYg}`

> *"Everything is perfectly normal. That is the problem."*

## Challenge Description

Two useful files were provided:

```text
capture.wav   8 kHz, 16-bit, mono WAV
oopenc        stripped 64-bit Linux executable
```

Running the binary gives away that it is the **encoder**, not a decoder:

```console
$ ./oopenc
usage: ./oopenc out.wav CALL CARRIER NOISE FANCY MESSAGE
```

That is gold: instead of guessing the waveform format, we can reverse the exact
encoder and generate our own known reference signals.

## Initial Analysis

The capture just sounds like bursts of noise. A normal magnitude spectrogram is
also noise-like: which is the whole joke. The energy at each frequency looks
perfectly ordinary; the information lives in the **phase** and ordering of many
small carriers.

The `FANCY` mode draws a callsign into the frequency bins. Reading the fancy
raster revealed the interesting endpoint: **`EP2AES`**.

Reversing the waveform with Ghidra plus a few controlled test encodes recovered
an OFDM-like format:

| Property | Value |
|---|---:|
| Sample rate | 8000 Hz |
| Output block size | 1440 samples |
| Useful transform size | 1280 samples |
| Overlap/guard | 160 samples |
| Active subcarriers | 256 |
| Carrier spacing | 6.25 Hz (`8000/1280`) |

A non-fancy packet is: `[noise] [sync] [header] [4 data blocks] [tail]`. The four
data blocks carry 1024 QPSK symbols = 256 bytes.

## Vulnerability / Core Concept

The data carriers are deliberately scrambled per block. For each of the four
blocks the encoder:

1. Splits bytes into 2-bit QPSK symbols.
2. Permutes the 256 physical carriers.
3. Rotates each QPSK value by a keyed multiple of 90°.
4. Sends the four 64-byte quarters in a keyed block order.
5. Differentially multiplies each carrier's phase by the previous OFDM symbol,
   so the useful data is `Q[t,k] = S[t,k] / S[t-1,k]`.

All of these "random" orders are derived from the **callsign** via a base-37
integer, a SplitMix64-style mix, and a small Speck-like ARX generator embedded in
the binary. Domain separation drives each operation (domain 2 = byte permutation,
16-19 = carrier permutations, 32-35 = QPSK rotations, 64 = block order). Once
`EP2AES` is known, every order is reproducible (Fisher-Yates over the keyed RNG).

The "out of phase" part: on `oopenc`-generated waveforms the demodulator worked
perfectly, but most *capture* bursts gave clean QPSK constellations yet nonsense
bytes. The cause is a small **carrier-frequency offset** (CFO): the TX/RX
oscillators differed by ~1-2 Hz, which is huge when carriers are only 6.25 Hz
apart. It shows up as a per-block phase rotation plus inter-carrier leakage.

## Exploitation

Because every block before the payload is known once you know the callsign,
carrier and noise count, you can generate a reference preamble and fit out the
CFO:

```console
$ ./oopenc reference.wav EP2AES 1750 6 0 X
```

For each known preamble block, compare the captured FFT against the reference
FFT; the phase difference grows almost linearly with time, and its slope is the
frequency offset. Correct with a standard complex down-mix:

```python
n = np.arange(start, start + 1280)
corrected = samples * np.exp(-1j * 2*np.pi * delta_f * n / 8000)
symbol = np.fft.fft(corrected)
```

After correction the QPSK points sharpen and the Reed-Solomon codewords validate
with zero errors.

**Solve scripts:**

- `decode_data.py` / `decode_common.py`: the reversed encoder: `seed_call()`
  (base-37 + SplitMix64), the Speck-like `RNG`, the `perm()` Fisher-Yates
  shuffle, and the OFDM demod (differential ratio, carrier permutation, QPSK
  de-rotation via a 4th-power circular phase-ramp estimator).
- `demod_sync.py` / `demod_cfo.py`: start detection and the reference-based CFO
  estimation and correction.
- `decode_headers.py`: differential-BPSK header decode (the fixed low byte
  `0x10` resolves the 180° ambiguity), confirming callsigns `EP2AES`, `EP2DES`,
  `TA2LMS`.
- `rs_soft.py` / `rs_common_soft.py`: the RS(255,191) layer.
- `decrypt_full.py`: the final unwrap.

**Frame format** (256 recovered bytes): bytes 0-190 frame data, 191-254 RS
parity, byte 255 CRC-8. The RS parameters are `RS(255,191)`, GF(256) prim poly
`0x187`, first root α⁵:

```python
from reedsolo import RSCodec
rs = RSCodec(64, nsize=255, fcr=5, prim=0x187, generator=2, c_exp=8)
```

The three valid `EP2AES` frames (parts 0/3, 1/3, 2/3 from capture bursts 9, 14,
17) give 558 payload bytes. Those are still encrypted, so `decrypt_full.py` runs
the encoder backward: undo the domain-2 byte permutation, then XOR the
callsign-seeded keystream:

```python
scat = part0 + part1 + part2
p    = perm(seed, 2, len(scat))
enc  = bytes(scat[p[i]] for i in range(len(scat)))
rng  = RNG(seed, 1)
plain = bytes(x ^ rng.byte() for x in enc)
```

The decrypted packet is `"OOPH" | len(u16) | crc(u32) | message`. The `EP2DES`
conversation decrypts too but explicitly warns *not* to mix parts across
callsigns: the keyed permutation smears a wrong part across the whole message,
and the packet checksum catches it. The recovered codewords are included under
`codewords/` (run `decrypt_full.py` from a directory containing those `.cw`
files); the decrypted `EP2AES` packet is saved as `decoded_EP2AES.bin`.

Decrypted `EP2AES` message:

```text
OPERATOR LOG 2026-08-20 1750Z DE EP2AES
...
PAYLOAD: ASIS{R0t4t3dC4rri3rs_m1uAF0HBNhEJ4YJAUDQPhCNe2uk8vtY8mYVYg}
```

## Flag

`ASIS{R0t4t3dC4rri3rs_m1uAF0HBNhEJ4YJAUDQPhCNe2uk8vtY8mYVYg}`

## Key Takeaways

- A noise-looking magnitude spectrum does not mean there is no structure. Phase
  can carry the whole message.
- When you are given the encoder binary, generating known reference signals is
  usually easier than reversing every DSP routine perfectly.
- Tiny frequency offsets matter enormously in tightly spaced OFDM: a 1-2 Hz CFO
  wrecks a 6.25 Hz carrier grid.
- Protocol checks (the `F` frame marker, RS parity, `OOPH` magic, final CRC) each
  validated a different layer and stopped bad guesses.
- Do not mix radio parts from different callsigns: the decoy operator literally
  warned us, and the checksum proves it.
