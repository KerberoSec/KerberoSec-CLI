# Never Gonna Give You Flag

**Category:** Misc | **Difficulty:** Medium | **Flag:** `IIITL{r1ck_45t13y_15_l3g3nd}`

## TL;DR

A C++ lookalike file is actually a ZIP archive in disguise. Extracting it reveals obfuscated C++ code that decodes a TinyURL, a steganographic JPEG hiding a Java decryption tool, and a web endpoint that hands out encrypted flag parts: all that's left is to feed everything into the JAR and peel off the flag.

## What We're Given

- `chall.txt`: a file that looks exactly like C++ source code filled with `hehe` macros
- A URL: `https://rick-roll-0k02.onrender.com/`
- The challenge description drops heavy hints: *"the real story lies beneath the surface: buried, fragmented, and carefully concealed"* and *"Reconstruct what was broken"*

That description is basically screaming "there are layers here." Let's start peeling.

## Initial Recon

The file is named `chall.txt` and it opens in a text editor looking like someone got really creative with C++ macro names. Here's a snippet of what greets us:

```cpp
#include "hehe.h"

hehe heheheheheehe()
{
    hehehe heheheehehe = haha;
    hehehe heheeheheeh = hahah;
    hehehe heheheehee = heheheehehe + heheeheheeh;
}
```

Okay, that's definitely not normal C++. But before we start manually decoding the gibberish, the first rule of CTF file analysis: run `file` on it.

```
$ file chall.txt
chall.txt: Zip archive data, with extra data prepended
```

There it is. The file is actually a **ZIP archive**: the C++ code is just prepended garbage before the real content starts. This is a common hiding technique where you stick valid-looking text in front of a binary format. The ZIP format doesn't care what comes before the `PK` magic bytes: `unzip` just finds the signature and goes.

We can verify by scanning for the ZIP magic bytes (`PK\x03\x04`) ourselves:

```bash
python3 -c "data=open('chall.txt','rb').read(); print(data.find(b'PK\x03\x04'))"
# 22157
```

The ZIP starts at offset 22157, meaning 22KB of fake C++ is prepended. Extract it:

```bash
python3 -c "
data = open('chall.txt', 'rb').read()
idx = data.find(b'PK\x03\x04')
open('extracted.zip', 'wb').write(data[idx:])
"
unzip extracted.zip
```

This drops us into a directory `x/` with:
- `a`, `b`, `c`: three small files
- `hehe.h`: a combined C++ header
- `i`: a 55KB file (spoiler: it's a JPEG)

## The Vulnerability / Trick

This challenge is really three puzzles stacked on top of each other:

1. **Polyglot file hiding**: the `chall.txt` is a ZIP with text prepended, a classic CTF "it's not what it looks like" trick
2. **Macro obfuscation**: the extracted C++ code uses macros to hide a URL
3. **Steganography**: an image hides a JAR file, and the right password is buried in the code fragments

Let's work through each layer.

### Layer 1: Decoding the "hehe" code

Files `a`, `b`, and `c` are fragments of `hehe.h`: split apart and individually confusing, but together they form the full header. The key line from file `b` is:

```cpp
#define haha 10
```

And in the main function `heheheheheheh()` from `chall.txt`, every character is computed as:

```cpp
hehe_append(s, (char)(haha * haha + 4))
hehe_append(s, (char)(haha * haha + 16))
// ... and so on
```

`haha * haha` = `10 * 10` = `100`. So each character is `100 + offset`. Let's decode a few manually:

- `100 + 4` = `104` = `'h'`
- `100 + 16` = `116` = `'t'`
- `100 + 16` = `116` = `'t'`
- `100 + 12` = `112` = `'p'`
- `100 + 15` = `115` = `'s'`
- `100 - 42` = `58` = `':'`
- `100 - 53` = `47` = `'/'`
- `100 - 53` = `47` = `'/'`

That spells `https://`: we're decoding a URL! The full decoded string is:

```
https://tinyurl.com/g0t-y0u4-ur1
```

Which, in true CTF fashion, redirects to `https://youtu.be/dQw4w9WgXcQ`. Rick Astley. Of course.

### Layer 2: Steganography with a twist

File `i` is a JPEG image. Steganography: hiding data inside images: is a classic CTF technique. `steghide` is the tool of choice here: it embeds data in image files and requires a password to extract.

We have two candidate passwords buried in the header files:
- `hehe.h` contains: `#define IMG_KEY "random_key_456"`
- File `b` contains: `#define IMG_KEY "rickroll_key_123"`

The second one wins (and honestly, "rickroll_key_123" is the more on-brand choice):

```bash
steghide extract -sf x/i -p "rickroll_key_123"
# wrote extracted data to "Decrypt.jar"
```

We now have a Java application.

### Layer 3: The web endpoint

The challenge URL `https://rick-roll-0k02.onrender.com/` has a form. Poking around, it POSTs to `/x7a9kq`. What do we POST? The URL we decoded from the obfuscated C++: the TinyURL:

```bash
curl -s -X POST "https://rick-roll-0k02.onrender.com/x7a9kq" \
  -H "Content-Type: application/json" \
  -d '{"input": "https://tinyurl.com/g0t-y0u4-ur1"}'
```

Response:

```json
{
  "parts": [
    "ZZZKC{i1tb_45",
    "1721260800224b1d2d245c073e57000807134e58",
    "A01G4P5HSO0}q"
  ],
  "status": "correct"
}
```

Three encrypted pieces of the flag. This is what `Decrypt.jar` is for.

## Building the Exploit

### Understanding Decrypt.jar

Decompiling the JAR reveals it takes input in the format `[part1]|[part2]|[part3]` and applies a different cipher to each piece:

- **Part 1:** Caesar cipher: shift each character back by 17 positions
- **Part 2:** Hex decode → XOR every byte with the repeating key `"secret"` → base64 decode
- **Part 3:** ROT13 → reverse the string

Each of these is a classic, reversible cipher. The JAR acts as a three-in-one decoder: you feed it the three scrambled parts and it outputs the plaintext flag.

### Running the Decryption

Feed the three parts from the web response into the JAR, wrapped in square brackets and separated by pipes:

```bash
java -jar Decrypt.jar "[ZZZKC{i1tb_45]|[1721260800224b1d2d245c073e57000807134e58]|[A01G4P5HSO0}q]"
```

## Running It

```
$ java -jar Decrypt.jar "[ZZZKC{i1tb_45]|[1721260800224b1d2d245c073e57000807134e58]|[A01G4P5HSO0}q]"
IIITL{r1ck_45t13y_15_l3g3nd}0BFU5C4T10N
```

The flag is everything inside `IIITL{...}`:

```
IIITL{r1ck_45t13y_15_l3g3nd}
```

The trailing `0BFU5C4T10N` ("OBFUSCATION") is the challenge winking at you one last time.

## Key Takeaways

- **Polyglot files are real.** A file can be simultaneously valid text AND a valid ZIP/PNG/PDF/whatever. `file` should be your absolute first command on any challenge file: never trust the extension or how it looks in a text editor.

- **Look for magic bytes manually.** When `file` says "extra data prepended," find the real format's magic bytes with a quick Python one-liner: `data.find(b'PK\x03\x04')` for ZIP, `b'\xff\xd8\xff'` for JPEG, `b'\x89PNG'` for PNG, etc.

- **Read all the source files, not just the obvious one.** Files `a`, `b`, and `c` looked like junk individually. File `b` had the steghide password. If you only skimmed `hehe.h` and skipped the fragments, you'd be stuck.

- **The challenge description is a treasure map.** *"Follow the trail. Reconstruct what was broken."* That's literally describing the split header files. *"Make sure you know how to use it"* is a hint that the final step is running a tool. Always re-read the description after you're stuck: you'll see hints you missed the first time.

- **Steghide passwords hide in the source.** When you see `#define IMG_KEY "..."` or similar constants in challenge code, those are almost always steganography passwords. Make a habit of grepping extracted code for `key`, `pass`, `secret`, and `img`.

- **Rick Astley is the lore.** The flag `r1ck_45t13y_15_l3g3nd` confirms it. We have been rickrolled. We accept this.
