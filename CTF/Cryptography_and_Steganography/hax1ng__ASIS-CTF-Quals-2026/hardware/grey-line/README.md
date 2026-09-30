# Grey Line

**Category:** Hardware / RF  ·  **Flag:** `ASIS{gr3yl1n3_d0ppl3r}`

> *"The greyline works perfectly. Your sanity does not."*

## Challenge Description

We are given a small ARM Cortex-M firmware image (`modem.bin`) and a 15-minute
WAV recording (`capture.wav`, 16-bit mono PCM, 12000 samples/s, 900 seconds).
The firmware is a custom radio *modem transmitter*. It normally beacons a default
station ID `UNPROVISIONED-00000000` (exactly 22 bytes). The recorded device was
provisioned with the flag as its ID, so the flag has to be demodulated out of
the capture.

The recording contains ordinary contest-style radio messages, but that visible
contest log is a decoy. The real payload rides a covert sub-hertz frequency
offset on top of each frame.

## Initial Analysis

900 seconds divides neatly into **60 slots of 15 seconds**. A spectrogram shows
one FSK transmission per slot, hopping across coarse 100 Hz channels from roughly
300 Hz to 2300 Hz. Each frame occupies 151680 samples (79 symbols × 1920
samples/symbol = 12.64 s), leaving a little quiet time inside each slot.

Reversing the Thumb-2 firmware (base `0x08000000`) recovered every DSP constant:

- **Modulation:** custom FT8-like 8-FSK, 79 symbols/frame, 1920 samples/symbol
  (6.25 baud), Costas sync at symbols 0-6, 36-42, 72-78 (8 candidate rows).
- **Visible payload chain:** 12 chars × 6 bits + 1 fixed bit = 73 bits →
  CRC-14 (init `0x2A3F`, poly `0x372B`) → tail-biting convolutional code
  (fb `0x1D`, polys `0x171`/`0x1EB`, 87→174 bits) → 174-byte interleaver →
  pack 3 bits → Gray map → 8-FSK tones. Charset:
  `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 /-`.
- **Covert channel (the flag):** the whole frame carrier is offset by
  `0.390625 * value` Hz, where `value ∈ 0..7` is a 3-bit hidden symbol:

  ```text
  base_freq = 300 + 100*((timer>>4) % 21) + 0.390625 * value
  ```

  The coarse 100 Hz hop is hardware-timer noise, not data. The tiny sub-hertz
  offset carries the payload.

## Vulnerability / Core Concept

The 22-byte device ID becomes the 60 covert symbols like this (from the reset
handler):

1. Unpack 22 bytes → 176 bits, **LSB-first within each byte**.
2. Compute a 4-bit LFSR checksum over those 176 bits (seed `0xF`).
3. Append the 4 checksum bits → 180 bits.
4. Split into 60 groups of 3, `value = (b0<<2)|(b1<<1)|b2`.

That explains the oddly specific counts: `22*8 + 4 = 180 bits = 60 × 3`. Each of
the 60 frames transmits one of these 3-bit values as its carrier offset.

The **decoy contest log** carries unique serial numbers 001-060, but the frames
are shuffled in the recording. Those serials are the ordering key that unshuffles
the 60 hidden symbols back into the original bitstream.

The nasty part is the challenge's joke: each frame has a **changing frequency
offset across its duration**: it behaves like *Doppler drift*. A naive
full-frame FFT of the residual carrier measures a Doppler-biased *average*, which
does not land cleanly on the 0.390625 Hz grid and produces plausible-but-wrong
flags.

The fix: measure the carrier from only the **first seven-symbol Costas block**,
where the tones are known exactly and the Doppler has had far less time to drift.
Dechirp each Costas symbol with its known expected FSK phase, sum to a phasor per
symbol, and take the phase-ramp slope to recover the residual carrier offset with
sub-0.05 Hz precision.

## Exploitation

The solve is a pipeline of the reversed DSP:

1. **`recover_match.py`**: slides Costas correlators (built from the firmware's
   Gaussian pulse-shaping tables at `0x0800274a`) across the file to lock every
   frame's coarse base, start offset and Costas row.

2. **`full_recover.py`**: full inverse of the visible FSK chain (Viterbi decode
   of the tail-biting convolutional code, CRC-14 check, interleaver, Gray map),
   recovering the contest message + serial per frame, plus a per-frame carrier
   estimate. This gives the ordering key.

   ```text
    6 b 900 ... 'UA9CD 042   '
   26 b 700 ... 'JA1AB 060   '
   34 b1800 ... 'TU VK4ZZ 001'
   ```

3. **`alpha_recover.py`**: models the per-frame Doppler as a time-scale factor
   `alpha` and re-measures the true carrier after removing the reconstructed FSK
   waveform, resolving the drift bias.

4. **`station_dp.py`**: assembles the 60 recovered offset values (ordered by the
   visible serials) into the 180-bit stream, then a small dynamic-programming
   search over the ID charset finds the 22 bytes consistent with the measured
   offsets and the firmware's 4-bit checksum.

`solve.py` is a compact standalone demodulator that documents the whole TX
structure inline (Costas locking, carrier extraction, 60-symbol → 22-byte
inverse with CRC verification).

Turning the 60 values back into bytes (LSB-first per byte, MSB-first triplet):

```python
bits = []
for v in values:
    bits += [(v >> 2) & 1, (v >> 1) & 1, v & 1]
decoded = bytearray()
for pos in range(0, 176, 8):
    decoded.append(sum(bits[pos + i] << i for i in range(8)))
```

The recovered offset sequence (unshuffled by serial) is:

```text
4 0 5 4 5 2 2 2 6 2 5 5 7 3 4 6 2 3 5 4
6 2 3 6 1 5 5 0 6 1 6 6 6 3 1 7 5 0 4 6
0 3 0 0 7 0 1 6 1 5 5 4 6 1 1 6 5 7 5 1
```

The first 176 bits give `ASIS{gr3yl1n3_d0ppl3r}`; the final 4 bits are `1001 =
0x9`, which matches the firmware checksum over that exact string. The checksum
also disambiguates the spelling: `d0ppl3r` yields checksum `0x9` (final symbol
`1`, matching serial 060's measured `~1.36`), while `doppl3r` would need a `6`
and gives the wrong checksum.

## Flag

`ASIS{gr3yl1n3_d0ppl3r}`

## Key Takeaways

- The obvious contest messages were a decoy; the tiny sub-hertz carrier offset
  carried the hidden data, and the visible serials were the un-shuffle key.
- Reversing the firmware supplied nearly every DSP constant (Costas rows, pulse
  shapes, tone spacing, checksum), which made a clean decoder possible.
- A very precise measurement can still be *wrong* if its model is wrong: the
  full-frame carrier estimate returned Doppler-biased averages. Measuring from
  the first Costas block, before the drift accumulates, fixed it.
- A tiny 4-bit checksum was enough to pin the exact leetspeak spelling instead of
  guessing it.
