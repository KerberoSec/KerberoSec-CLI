# Musk-e-teers

**Category:** OSINT | **Difficulty:** 300 pts | **Flag:** `IIITL{N0T_G0NN4_H4T3_051NT?}`

## TL;DR

A five-platform OSINT chain: X/Twitter tweets hold base64-encoded Spotify URL fragments, the Spotify profile hosts playlists whose cover art tiles assemble into a QR code, the QR leads to a password-protected Pastebin, the Pastebin contains a WAV file encoded in base64, and the WAV's spectrogram reveals the flag burned into the audio frequencies.

## What We're Given

Just a challenge description: no files, no direct links:

> "A dormant online identity known as 'ilovectf' has resurfaced during a routine investigation, leaving behind a scattered digital trail across multiple platforms. While the content appears ordinary at first glance, subtle patterns suggest deliberate layering of hidden information within internet. Analysts believe the creator embedded clues in unconventional formats, requiring observation and interpretation rather than brute force. One recovered hint reads, 'Some messages aren't meant to be seen: they're meant to be revealed differently.'"

**Title:** Musk-e-teers → Musk → Elon Musk → X/Twitter. That's our entry point. "Musketeers" also hints at three (or more) platforms chained together. "Revealed differently" is a nudge toward spectrogram steganography.

## Initial Recon

Username: `ilovectf`. Check X/Twitter first.

`x.com/ilovectf`: account created 2026-03-22, display name `ctf_goin_good`, bio entirely in Japanese: `ログインするだけだよ` ("just log in"). Profile pic is a cartoon acorn. Banner is Jethalal from *Taarak Mehta Ka Ooltah Chashmah* peeking through a hole in a fence. Chaotic energy. Standard OSINT bait.

Problem: X is extremely hostile to unauthenticated access. Guest tokens expire fast, Nitter is broken, GraphQL APIs reject anonymous queries. Couldn't read tweets directly from the web.

Solution: **Wayback Machine CDX API**: an archive index that lets you query historical captures without a login:

```
https://web.archive.org/cdx/search/cdx?url=twitter.com/ilovectf/status/*&output=json&fl=original,timestamp
```

This returned six archived tweet URLs. Fetching each one revealed that tweets 1-4 each contained a base64 string:

- `aHR0cHM6Ly9vcGVuLnNwb3RpZnkuY29tL3VzZXIv`
- `MzE3ZTZ3cmtkdHM=`
- `NG11ZWI3Z2ducw==`
- `eHA1ZTQ2bQ==`

Tweets 5 and 6 were just `"hey im new on X!"` and `"i m nub ;&gt;"`: noise/misdirection.

## The Vulnerability / Trick

This is five tricks stacked in sequence:

**Layer 1: Base64 fragmented across tweets:** Concatenate all four strings *before* decoding:

```python
import base64
parts = [
    "aHR0cHM6Ly9vcGVuLnNwb3RpZnkuY29tL3VzZXIv",
    "MzE3ZTZ3cmtkdHM=",
    "NG11ZWI3Z2ducw==",
    "eHA1ZTQ2bQ==",
]
url = base64.b64decode("".join(parts) + "==").decode()
# https://open.spotify.com/user/317e6wrkdts4mueb7ggnsxp5e46m
```

Decoding each chunk individually gives garbage: you have to concatenate first.

**Layer 2: Spotify playlist cover QR code:** The Spotify account `317e6wrkdts4mueb7ggnsxp5e46m` (display name `craft_a_CTF`) has 10 playlists: nine with single-letter names and one called "find me find me." Each single-letter playlist has a custom cover image: these are tiles of a QR code. Assemble them in order and you get a scannable QR code that decodes to:

```
https://pastebin.com/zAY6yxtT
```

But the Pastebin is password-protected.

**Layer 3: Finding the password:** The "find me find me" playlist has 20 tracks, and the first letter of each track title spells an acrostic: `AXIOS{0S1NT_15_C00L}`: interesting, but the wrong flag format. The actual password was **NAMASTE**, a greeting that fits the cultural flavor of the challenge (Japanese bio, Indian TV show banner, general greeting theme).

**Layer 4: Pastebin base64 WAV:** Unlocking the Pastebin with `NAMASTE` reveals a wall of base64 text. Decode it:

```python
import base64
with open("pastebin_content.txt") as f:
    b64_data = f.read().strip()
wav_bytes = base64.b64decode(b64_data)
with open("hidden.wav", "wb") as f:
    f.write(wav_bytes)
```

Playing the WAV just sounds like noise.

**Layer 5: Spectrogram steganography:** "Some messages aren't meant to be seen: they're meant to be revealed differently." The challenge description was literally telling us to visualize the audio. A spectrogram maps frequencies over time: text encoded at specific frequencies is invisible to the ear but shows up visually.

```bash
sox hidden.wav -n spectrogram -c "" -t "" -o spec_reread.png
```

## Running It

Opening `spec_reread.png`:

The flag appears clearly in the low-frequency band of the spectrogram: **`IIITL{N0T_G0NN4_H4T3_051NT?}`**

The flag is a meta-comment: "Not gonna hate OSINT?": after dragging you through five platforms and a spectrogram, do you still like this category?

## Key Takeaways

**The full chain:**
1. X/Twitter `@ilovectf` → base64 tweet fragments → Spotify URL
2. Spotify `craft_a_CTF` → playlist cover tiles → assembled QR code
3. QR code → password-protected Pastebin (`zAY6yxtT`)
4. Password `NAMASTE` → Pastebin → base64-encoded WAV
5. WAV spectrogram → `IIITL{N0T_G0NN4_H4T3_051NT?}`

**Techniques worth keeping:**

- **Wayback CDX API**: when a social account's content is inaccessible, the Internet Archive may have it. `web.archive.org/cdx/search/cdx?url=...&output=json` is more useful than the regular Wayback search for scraping tweet URLs.

- **Base64 across multiple posts**: always concatenate before decoding. Splitting at chunk boundaries leaves unpadded fragments that decode to garbage individually.

- **Spotify as a data carrier**: playlist names, track order, cover images, and track titles can all carry hidden data. Acrostic-via-track-titles and QR-via-cover-tiles are both real techniques now.

- **Spectrogram steganography**: key tool is `sox`. When a challenge says "revealed differently" about audio, check the spectrogram. [Sonic Visualizer](https://www.sonicvisualiser.org/) is another good option for interactive exploration.

- **The gotcha**: spending time decoding each base64 chunk individually and getting garbage before realizing you needed to concatenate first. Always: concatenate → then decode.
