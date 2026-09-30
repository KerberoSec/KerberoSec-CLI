# Look Out

**Category:** Crypto | **Difficulty:** Medium | **Flag:** `IIITL{this_was_annoying_lol_79823979735}`

## TL;DR

A PDF with 17 bird silhouettes hides XOR key characters in each bird's PDF accessibility alt-text (`/Alt (char(NN))`), spelling `LOOKSLIKEAKEYTOME`. The ciphertext is stashed in the PDF `/Subject` metadata field as a raw binary string. XOR them together and the flag pops out.

## What We're Given

A single file: `Untitled_document.pdf`: exported from Google Docs. Open it and you're greeted by this:

*[Image: 17 bird silhouettes on a wire]*

Seventeen little bird silhouettes sitting on a wire at the top of an otherwise completely blank page. No text. No numbers. Nothing else visible. The PDF's Keywords metadata field reads `What is this?`: which is either a hint or the challenge author having a laugh at our expense. Probably both.

## Initial Recon

The first thing your brain does when you see birds sitting on a wire in a CTF is scream "Birds on the Wires cipher!": the musical notation cipher where the birds' vertical positions on the staff encode characters. We immediately checked for that.

...but all 17 birds are at the *same* y-position. Every single one. No vertical variation. So that's dead immediately.

Next instinct: the different bird poses must encode something. Running `fitz` (the Python PDF library, also known as PyMuPDF) to extract all the image XObjects from the PDF gave us 17 bird images across 17 xref slots. Hash-deduping them revealed 10 unique silhouettes, so there are repeated poses, which looks exactly like a substitution cipher. We spent a while mapping the pattern `ABBCDAECFGCFHIBJF` (10 unique symbols, 17 positions) and trying to fit it to `IIITL{...}`. It didn't fit any 17-character phrase we could construct. Dead end, but it did confirm the answer was 17 characters long. So that wasn't entirely wasted.

We also tried counting pixel ink amounts per bird (dark pixel count per sprite) and measuring image widths, hoping for a letter frequency or direct encoding. Both produced nonsense.

The break came from the PDF Keywords field: `What is this?`: maybe the data isn't in the visible page at all. Time to look at the metadata more carefully.

## The Vulnerability / Trick

PDFs have two great hiding spots that most humans never look at:

1. **Document metadata fields**: `/Title`, `/Author`, `/Subject`, `/Keywords` etc. They're invisible when you open the PDF but trivially readable with `exiftool` or a PDF library.

2. **Structure tree alt-text**: PDFs support accessibility features. When a PDF is "tagged" for screen readers, each figure gets a `StructElem` (structure element) of type `/Figure` with an `/Alt` attribute containing a text description. In a Google Docs export, every inline image you've given alt text in the Docs editor shows up as exactly this.

The challenge author exploited both. When we dumped the raw PDF xref objects with `fitz`, every bird's structure element looked like this:

```
<</Type /StructElem /S /Figure /Alt (char\(76\)) /P 3 0 R /Pg 4 0 R /K ...>>
```

`char(76)` is `chr(76)` in Python: that's `L`. Each of the 17 birds had a different `char(NN)` alt text. Reading them out in struct tree order spelled: **`LOOKSLIKEAKEYTOME`**.

The challenge title is "Look Out": as in, look *outside* the visible page. The alt text is literally saying "looks like a key to me." Cheeky.

The second piece: the PDF `/Subject` metadata field contained a 320-character string of `0`s and `1`s: 40 bytes of ciphertext encoded as raw binary. That's the thing to decrypt.

XOR the ciphertext with the key (lowercased to `lookslikeakeytome`, repeated to match length) and you get the flag.

A quick note on *why* uppercase didn't work: when we first tried XORing with the uppercase key `LOOKSLIKEAKEYTOME`, we got something close but wrong: `iiitl[THIS WAS ANNOYING LOL ...]` with bracket instead of brace and wrong case throughout. That's a one-bit difference per character (uppercase vs lowercase differs by bit 5), which is exactly what XOR with the wrong case key produces. Switching to lowercase fixed it immediately.

## Building the Exploit

The full solve is in `solve.py`, but here's the walkthrough:

**Step 1: Extract the alt-text characters from the PDF structure tree.**

```python
import fitz

doc = fitz.open("Untitled_document.pdf")

chars = []
for i in range(1, doc.xref_length()):
    obj = doc.xref_object(i)
    if obj and "/Figure" in obj and "/Alt" in obj:
        start = obj.find("char\\(") + 6
        end = obj.find("\\)", start)
        chars.append(int(obj[start:end]))

key = "".join(chr(c) for c in chars).lower()
# key = "lookslikeakeytome"
```

`fitz.xref_object(i)` returns the raw PDF object definition as a string. We scan every object in the xref table and grab any that are `/Figure` StructElems with an `/Alt` entry. The `char\\(` pattern matches the escaped parenthesis in the PDF syntax. We parse the integer out, convert it with `chr()`, collect all 17, lowercase the whole thing.

**Step 2: Parse the binary ciphertext from the Subject field.**

```python
bits = doc.metadata["subject"]
ct = bytes(int(bits[i:i+8], 2) for i in range(0, len(bits), 8))
```

`doc.metadata["subject"]` gives us the raw `/Subject` string: a 320-character binary string. We chunk it into 8-bit groups and convert each to a byte using `int(..., 2)` (base-2 to integer). This gives us 40 bytes of ciphertext.

**Step 3: XOR with the key.**

```python
flag = bytes(b ^ ord(key[i % len(key)]) for i, b in enumerate(ct))
print(flag.decode())
```

Standard repeating-key XOR. The key is 17 characters long; we cycle through it with `i % len(key)` to cover all 40 ciphertext bytes.

## Running It

```
$ python3 solve.py
key: lookslikeakeytome
IIITL{this_was_annoying_lol_79823979735}
```

The flag is deeply self-aware.

## Key Takeaways

- **PDFs are not just what you see.** Document metadata fields and structure tree alt-text are completely invisible to casual viewers but trivially readable with `exiftool` or `fitz`. Always check them.

- **Google Docs exports preserve alt-text as PDF StructElem `/Alt` entries.** If a challenge involves a Docs-exported PDF and the visible content doesn't encode anything useful, look at the accessibility metadata.

- **The title "Look Out" was a literal hint**: look outside the visible page content. CTF challenge titles almost always point at the mechanism.

- **XOR case sensitivity matters.** If your XOR output is close but subtly wrong (wrong braces, wrong case), suspect a case mismatch in the key: uppercase and lowercase ASCII differ by exactly one bit.

- **Tool of choice:** PyMuPDF (`fitz`) is excellent for PDF internals. `doc.xref_object(i)` gives you the raw PDF object string for any xref index, which lets you spot hidden metadata without needing a full PDF spec reference.

- **The dead ends were deliberate.** The 10 unique bird poses form a plausible substitution cipher pattern: this was almost certainly placed there to waste time. When the visible data screams "substitution cipher" but doesn't yield a coherent result, check if there's hidden metadata before spending hours on the rabbit hole.
