# Call Me

| Field | Details |
|-------|---------|
| **Challenge** | Call Me |
| **CTF** | Kali Team CTF 26 |
| **Category** | Misc |
| **Points** | 100 |
| **Author** | SHADOW |
| **Description** | "so ezzz" |
| **Flag** | `KaliTeam{s1gn41_h34rd_10ud_4nd_c134r_!!!!}` |

---

## Challenge

`signal_037.wav`: a ~47-second mono WAV. The prompt for this stage was to
read a message hidden in Morse code between the 16s and 48s marks of the
file.

## Decoding the Morse tone

The audio in that window is a clean two-level tone (on/off), so rather than
listening by ear, I extracted the amplitude envelope and thresholded it:

1. Read the raw PCM samples with `wave`/`numpy`.
2. Slice to the `[16s, 48s]` window (the file actually ends at ~47.18s).
3. Rectify (`abs()`) and smooth the samples with a small moving-average
   window to get a clean envelope.
4. Threshold at 30% of the envelope's peak to get a boolean on/off signal.
5. Find contiguous "on" runs (tones) and "off" runs (gaps) via
   `np.diff`/`np.where`.

This produced two tight clusters of tone length: ≈0.078s and ≈0.238s (a
clean ~1:3 ratio): i.e. dot and dash. Gaps clustered into three bands:
intra-character (~0.08s, ignored), inter-letter (~0.24s), and inter-word
(~1.5s), which is exactly standard Morse timing (unit : 3×unit : 7×unit).

Classifying each tone/gap in original order and mapping through the
standard Morse table:

```
$ python3 decode_morse.py signal_037.wav 16 48
Morse: ...-|...-|...- / ...-|...-|...- / -.|.|-..-|- / -.-.|....|.|-.-.|-.- / --|-.-- / .-..|..|-.|-.-|.|-..|..|-. / -|--- / --.|.|- / .--.|.-|.-.|-|..---
Text:  VVV VVV NEXT CHECK MY LINKEDIN TO GET PART2
```

(script: `decode_morse.py`)

So this window of the audio isn't the flag itself: it's a pointer to
"part 2": check a linked LinkedIn profile for the next piece.

## Part 2: the spectrogram

A spectrogram of a *different* part of the same signal (or a related file
in the same challenge chain) renders the flag directly as visible text in
the frequency plot:

```
KaliTeam{s1gn4l_h34rd_l0ud_4nd_cl34r_part2}
```

That `_part2` suffix isn't literal flag content: it's the same "go check
part 2" pointer as the Morse message, this time telling you the *ending*
of the flag is what you find there, not the literal string `part2`.

The linked LinkedIn profile's bio supplied that missing ending:

```
Jr. Digital Forensics | eCIR v2 | eCTHP v3 | CTF Player.  _!!!!}
```

i.e. the flag's closing segment is `_!!!!}`.

## Assembling the flag

Concatenating the spectrogram body with the LinkedIn-supplied ending gives:

```
KaliTeam{s1gn4l_h34rd_l0ud_4nd_cl34r_!!!!}
```

This was **rejected**. The spectrogram's rendered font makes `1` (digit
one) and `l` (lowercase L) visually identical, and a naive reading
transcribed every ambiguous glyph as `l`. The challenge author's own
leetspeak substitution was actually consistent: every `l` was replaced
with `1`, so the correct transcription swaps all four ambiguous
characters:

```
s1gn4l -> s1gn41
h34rd  -> h34rd   (no ambiguous glyph)
l0ud   -> 10ud
cl34r  -> c134r
```

Giving the accepted flag:

```
KaliTeam{s1gn41_h34rd_10ud_4nd_c134r_!!!!}
```

## Lessons learned

- **Envelope-threshold + run-length decoding beats decoding Morse by
  ear**: it's exact, reproducible, and trivially reveals the dot/dash
  and letter/word gap timing bands as clean numeric clusters.
- **Not every stego payload is the final flag**: this one was a relay
  pointing to a second artifact (a LinkedIn profile) that supplied the
  missing suffix.
- **Don't trust glyph transcription from a stylized/rendered font at face
  value**, especially `1`/`l`/`I` and `0`/`O`. When a flag gets rejected
  and you're confident about the logic, re-derive it from the challenge's
  own substitution pattern rather than the rendered pixels.

---
*Written with substantial AI assistance in analysis and writing.*
