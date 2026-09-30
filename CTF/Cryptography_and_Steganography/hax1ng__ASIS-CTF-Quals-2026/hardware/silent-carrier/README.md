# Silent Carrier

**Category:** Hardware  ·  **Flag:** `ASIS{N0_K3Y_N0_V01C3}`

## Challenge Description

Two captures were provided:

```text
Capture.pcapng   USB packets exchanged with a TYT MD-UV380 handheld radio
RTL2832.wav      stereo 16-bit IQ samples at 2.4 MHz (~42.5 s)
```

An IQ recording is a radio recording made *before* audio has been extracted: the
two WAV channels are the `I` and `Q` components of a complex signal, so we can
retune and demodulate in software. The WAV holds three DMR digital-radio
transmissions. The USB traffic looks like an STM DFU firmware transfer, but its
payload is actually a radio **codeplug** (the configuration database with
channels, IDs, and privacy keys).

## Initial Analysis

**Rebuilding the codeplug.** The useful USB transfers carry 1032-byte fragments;
concatenating them reconstructs the image:

```bash
tshark -r Capture.pcapng -Y 'usb.data_len==1032' \
  -T fields -e usb.data_fragment \
  | tr -d '\n' | xxd -r -p > dfu.bin
```

The result is exactly 851968 bytes (`0xd0000`), which `dmrconfig` recognizes as a
TYT MD-UV380 codeplug (`codeplug.txt`). Radio ID `1234`, contact ID `1` (group
call), color code `1`, time slot `1`: values that later appear in the RF
transmission too, confirming the two captures belong together.

The channels use TYT **Enhanced Privacy**. Eight 16-byte key records start at raw
offset `0x59c0`. Note the CPS *displays* each key with all 16 bytes reversed, so
byte order matters: feeding a raw key where the display form is expected
silently produces the wrong result.

**Demodulating the IQ.** The strongest signal sits ~15.5 kHz below the WAV
center. The chain is: shift by `-15500` Hz, low-pass, decimate 2.4 MHz → 48 kHz,
then a quadrature phase discriminator for 4-FSK baseband:

```python
z *= np.exp(-2j * np.pi * (-15500) * n / fs)
z = lfilter(firwin(1001, 8000, fs=fs), [1], z)[::50]
fm = np.angle(z[1:] * z[:-1].conj())
```

Three push-to-talk regions hold `256 + 142 + 196` DMR bursts.

## Vulnerability / Core Concept

Two technical traps and one conceptual trap.

**Symbol-clock drift.** At 48 kHz a DMR symbol is nominally 10 samples, but the
real value was `10.00284` samples/symbol. That tiny error accumulates over a long
transmission until you sample near symbol boundaries. Magnitude gating found
exactly 594 bursts (`256+142+196`) spaced ~2880.818 samples apart; we fit a
*fractional* clock per PTT rather than rounding to 10. The 4 baseband levels
`[-3,-1,+1,+3]` map to DMR dibits `[3,2,0,1]`. Each burst gives 132 payload
dibits = 3 AMBE voice frames, deinterleaved with DSD-FME's `rW/rX/rY/rZ` tables
and FEC-corrected with mbelib.

**Enhanced Privacy = fixed XOR.** TYT "privacy" is just a fixed XOR mask over each
49-bit AMBE payload. The mask is `AES-128-ECB(fixed_key, raw_radio_key)`
truncated to the first 49 bits:

```python
fixed = bytes.fromhex("6e028d8acaeb9bbe4272fb82645631fa")
stream = AES.new(fixed, AES.MODE_ECB).encrypt(raw_radio_key)
mask49 = int.from_bytes(stream, "big") >> (128 - 49)
```

**Choosing the right key objectively.** DMR FEC is corrected *before* the privacy
XOR, so every candidate key produces the same RF/FEC error count: error counts
cannot pick the key. And wrong-key AMBE still sounds vaguely voice-like, so ASR
hallucinates. The reliable test is *known plaintext*: a frequently repeated
ciphertext frame maps, under the correct mask, to the exact AMBE silence frame in
all three parts:

```text
part 1:  86F46709D14E00 XOR 7856650BD34600 = FEA20202020800   (K7)
part 2/3: 10B72DB8489080 XOR EE152FBA4A9880 = FEA20202020800   (K8)
```

Two unrelated ciphertexts collapsing to the same silence frame is not a
coincidence: this cleanly identifies **part 1 → K7, parts 2 & 3 → K8**.

**The final joke.** After error correction and the correct XOR, the decrypted
audio is not speech: it is a series of regular **1 kHz beeps**, i.e. Morse. That
is exactly why speech-to-text was useless.

## Exploitation

`direct_best.py` is the burst decoder: it gates the FM discriminator output into
594 bursts, fits the fractional symbol clock per group, slices 132 dibits/burst,
deinterleaves + FEC-corrects each AMBE frame via `libmbe`, XORs the correct
49-bit privacy mask (K7 for part 1, K8 for parts 2/3), and writes `.amb` streams
in the MD380-emulator format:

```python
out.write(b".amb")
for frame in plaintext_frames:
    out.write(b"\0" + (frame >> 1).to_bytes(6, "big") + bytes([frame & 1]))
```

The `.amb` streams are rendered to audio with an emulated MD380 firmware codec:

```bash
md380-emu -d -i best1.amb -o best1.raw
ffmpeg -f s16le -ar 8000 -ac 1 -i best1.raw best1.wav
```

The rendered audio (`recovered_audio/best1.wav`, `best2.wav`, `best3.wav`) is
clean 1 kHz CW. `decode_morse.py` labels each 20 ms AMBE frame as tone/silence
with a 1 kHz Goertzel measurement and decodes the timing (dot ≈ 80 ms, dash ≈
240 ms, letter gap ≈ 600 ms, word gap ≈ 2.7 s):

```console
$ cd recovered_audio && python3 decode_morse.py
part 1: ASISN0 K3Y
part 2: N0
part 3: V01C3
```

The three calls read `ASISN0 K3Y` / `N0` / `V01C3`. Applying the ASIS wrapper and
treating the word/PTT breaks as underscores gives the flag.

## Flag

`ASIS{N0_K3Y_N0_V01C3}`

## Key Takeaways

- Do not assume decoded radio audio must be speech: here it was deliberate CW,
  and the title/description were fair warnings.
- ASR is not evidence on bad vocoder audio; wrong keys produce confident,
  contradictory transcripts.
- Tiny clock errors matter: `10` vs `10.00284` samples/symbol was the difference
  between damaged audio and clean Morse timing.
- AMBE FEC error counts cannot choose the privacy key (FEC runs before the XOR).
  Mapping two frequent, independent ciphertext clusters to the exact AMBE silence
  frame proved the K7/K8 selection.
- Byte order is a classic codeplug trap: the raw key bytes and the CPS display
  strings are complete reversals of one another.
