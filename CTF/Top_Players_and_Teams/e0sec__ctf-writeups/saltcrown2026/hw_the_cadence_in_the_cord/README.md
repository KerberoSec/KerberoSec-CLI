# the_cadence_in_the_cord: Writeup

**Category:** Hardware / Forensics (Logic analyzer capture / covert timing channel)
**Files provided:** `capture.sr`

## TL;DR

The capture is an 8-channel sigrok logic analyzer trace where only one line
(`D1`) carries any activity. Decoding it as standard UART (9600-8-N-1) yields
a decoy plaintext: a flowery message about a black-market "seller": that
explicitly tells you to ignore the words themselves and instead read the
**silence between the bytes**. The real payload is a covert timing channel:
the *gap length* between consecutive UART frames encodes a bit (short gap =
`0`, long gap = `1`), 8 gaps per hidden character.

```
you read the silence well HTB{th3_f1rst_m4rk_r1ngs_tru3_b3n34th_th3_w0rds}
```

---

## 1. Identifying the capture

`capture.sr` is a standard `.sr` archive (it's literally a zip):

```
$ file capture.sr
capture.sr: Zip archive data, at least v2.0 to extract

$ unzip -l capture.sr
version
metadata
logic-1-1 ... logic-1-782      (20480 bytes each, 1 byte/sample -> 8 channels)
```

`metadata` reveals the acquisition parameters:

```ini
[global]
sigrok version=0.5.2

[device 1]
capturefile=logic-1
total probes=8
samplerate=2 MHz
total analog=0
probe2=D1
unitsize=1
```

8 logic channels sampled at 2 MHz, one byte per sample (bit-packed), ~16M
samples total (~8 seconds of capture). Only channel index 1 has a custom
label (`D1`): a strong hint that it's the only channel that matters.

## 2. Finding the live wire

Concatenating all `logic-1-*` chunks and counting bit transitions per channel
confirms it:

```python
counts = [0]*8
prev = data[0]
for b in data:
    x = b ^ prev
    for i in range(8):
        if x & (1 << i):
            counts[i] += 1
    prev = b
# counts == [222, 3562, 0, 0, 0, 0, 0, 0]
```

Only bit 0 and bit 1 ever toggle. Bit 1 (`D1`) is the active data line;
bit 0 toggles far less often (222 times) and turns out to just be an idle/
trigger artifact of the capture setup, not a real second channel.

## 3. Decoding the UART

Feeding `D1` into sigrok's built-in `uart` protocol decoder and trying
common baud rates, **9600-8-N-1** locks immediately (clean start/stop bits,
no framing errors):

```
$ sigrok-cli -i capture.sr -P uart:rx=D1:baudrate=9600 -A uart=rx-data
54 6F 20 74 68 65 20 62 75 79 65 72 20 77 68 6F 20 70 61 69 64 ...
```

Decoded as ASCII, this spells out a full decoy message:

> *"To the buyer who paid in secrets: what follows is the pleasant tone,
> the goods I sell in daylight and never miss. Lord Varo's debt... Take
> them and thank me. But what is written is worth nothing. The dragon's
> true note does not live in the words; it lives in the rests between
> them. A long rest raises the mark to one, a short rest lets it fall to
> nothing; count eight rests to every letter before the note will speak.
> Read the silence, not the song, and pay."*

This is the challenge's puzzle statement, delivered *in-band* over the same
wire: the visible bytes are a red herring. The actual secret is encoded in
the **duration of the gaps between UART frames**.

## 4. Reading the silence

Re-running the decoder with `--protocol-decoder-samplenum` gives the exact
sample range of every decoded byte:

```
4001403-4003071 uart-1: 54
4007497-4009165 uart-1: 6F
4029595-4031263 uart-1: 20
...
```

Computing the gap between the end of one frame and the start of the next
(in samples, at 2 MHz → 0.5 µs/sample) shows a clean bimodal distribution:

```python
gaps = [frames[i][0] - frames[i-1][1] for i in range(1, len(frames))]
sorted(set(gaps))
# [4426, 4427, 20429, 20430]
```

Two clusters only, ~4426 samples (**short rest**) and ~20430 samples
(**long rest**): roughly a 1:4.6 ratio, easily distinguished with a simple
threshold. Exactly as hinted: *short rest → 0*, *long rest → 1*.

```python
bits = [1 if gap > 10000 else 0 for gap in gaps]   # 592 bits total
```

## 5. Reassembling the hidden message

*"count eight rests to every letter"*: group the 592 gap-bits into bytes,
MSB-first, one byte per 8 consecutive gaps:

```python
chars = []
for i in range(0, len(bits) - 7, 8):
    byte = bits[i:i+8]
    val = 0
    for b in byte:
        val = (val << 1) | b
    chars.append(val)

message = bytes(chars).decode('ascii')
```

74 bytes fall out cleanly as printable ASCII:

```
you read the silence well HTB{th3_f1rst_m4rk_r1ngs_tru3_b3n34th_th3_w0rds}
```

## 6. The flag

```
HTB{th3_f1rst_m4rk_r1ngs_tru3_b3n34th_th3_w0rds}
```

## Root cause / design summary

| | |
|---|---|
| **Surface channel** | Standard UART (9600-8-N-1) on the single active logic line, carrying an innocuous decoy narrative in the byte values themselves. |
| **Covert channel** | The *inter-frame gap duration* between UART bytes, quantized into two discrete states (short ≈ 4426 samples, long ≈ 20430 samples at 2 MHz). |
| **Encoding** | 1 gap = 1 bit (short = `0`, long = `1`); 8 consecutive gaps = 1 ASCII byte, MSB-first. |
| **"Aha"** | The visible UART payload literally instructs the analyst to stop reading the data bytes and instead measure the silence between them: a timing/covert-channel exfiltration technique layered on top of a normal serial protocol. |
| **Tools used** | `sigrok-cli` (`uart` PD) for both byte decoding and precise sample-accurate frame timing; a short Python script to threshold gap lengths and repack them into bytes. |
