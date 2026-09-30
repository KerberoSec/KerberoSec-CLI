---
type: resource-note
status: done
created: 2026-02-15
updated: 2026-03-12
tags: [security-writeup, tryhackme, encoding, unicode]
source: TryHackMe: Data Encoding
platform: tryhackme
room: Data Encoding
slug: data-encoding
path: TryHackMe/00-foundations/data-encoding.md
topic: 00-foundations
domain: [foundations, data-transformation]
skills: [ascii, unicode]
artifacts: [concept-notes]
sanitized: true
---

# Data Encoding

## Summary

* **Representation**: data lives as **bits** (0/1) and therefore as **numbers** in memory.
* **Encoding**: an agreed mapping from numbers → meaning (e.g., which number means the character `A`).
* Mismatched encodings are a common reason text becomes **gibberish** when opened on another system.
* Core standards covered: **ASCII**, **Unicode**, and **UTF-8 / UTF-16 / UTF-32**.

## Key Concepts

### Representation vs Encoding

* Representation answers: “What is stored?” → bits / numbers.
* Encoding answers: “What do those numbers *mean*?” → a mapping from numeric codes to characters.
* A text string is just a **sequence of character codes**.

### ASCII (American Standard Code for Information Interchange)

* Early character encoding (1963).
* Uses numeric codes **0-127** (originally **7-bit**) for:

  * English letters (A: Z, a: z)
  * Digits (0-9)
  * Punctuation and control characters
* Think of ASCII as a small dictionary: number ↔ character.

### Extended ASCII and European languages

* ASCII alone can’t represent characters like `ñ`, `ß`, `ł`, `č`, `ș`, `ț`, etc.
* Adding an 8th bit gives **128 extra slots**, but different regions used them differently.
* Examples of “regional variants” mentioned:

  * **ISO-8859-1 (Latin-1)**: Western European languages (German, French, Spanish, Italian, Portuguese, Catalan, Nordic languages)
  * **ISO-8859-2 (Latin-2)**: Central/Eastern European languages (Polish, Czech, Hungarian, Croatian, Romanian, Slovak)
* Consequence: saving text in one variant and reading it as another can display different characters.

### Unicode

* A universal character set standard: assigns a unique **code point** to characters across modern + historical writing systems.
* Enables mixed-language text without choosing a “regional encoding” per language.
* Example code points (as stated in the material):

  * `U+0041` = `A`
  * `U+03A9` = `Ω`
  * `U+3042` = `あ`

### UTF-8 / UTF-16 / UTF-32 (Unicode Transformation Formats)

These are ways to store Unicode code points as bytes.

* **UTF-8**

  * Uses **1 to 4 bytes** depending on the character.
  * ASCII range `U+0000`: `U+007F` uses **1 byte**, matching original ASCII (backward compatibility).
  * Non-ASCII examples in the material:

    * `Ω` uses 2 bytes
    * emoji such as `🔥` (`U+1F525`) uses 4 bytes

* **UTF-16**

  * Uses **2 bytes** for many common characters.
  * Uses **4 bytes** for characters that require a *pair* of 16-bit units.
  * Example in the material: `🔥` encoded as `U+D83D U+DD25`.

* **UTF-32**

  * Fixed-width: every code point uses **4 bytes**.
  * Examples in the material:

    * `A` as `U+00000041`
    * `🔥` as `U+0001F525`

### 2) Worked Examples (from the text)

#### ASCII example: `TryHackMe`

If stored using ASCII, the text plus newline is:

Binary (8-bit groups shown):

* `01010100 01110010 01111001 01001000 01100001 01100011 01101011 01001101 01100101 00001010`

Hexadecimal (4 bits per hex digit):

* `54 72 79 48 61 63 6b 4d 65 0a`

Interpretation:

* The last byte `0a` represents a newline (`\n`).

#### Unicode examples mentioned

* `龍` (dragon): `U+9F8D` (or shown as `U+00009F8D` in UTF-32 style)
* `😊`: `U+0001F60A` (UTF-32 style; also shown as a 32-bit binary sequence)
* `ツ`: `U+30C4` (or `U+000030C4` in UTF-32 style)
* `ت`: `U+062A`
* `♞`: `U+265E`

## Pattern Cards

### Pattern: “Gibberish text” = encoding mismatch

* Same bytes, different decoding table → different characters displayed.
* Typical failure mode with extended ASCII variants (e.g., Latin-1 vs Latin-2).

### Pattern: UTF-8 compatibility with ASCII

* ASCII bytes remain valid UTF-8 for the `U+0000`: `U+007F` range.
* This is why UTF-8 is common on the modern web.

### Pattern: Variable-length vs fixed-width tradeoff

* UTF-8: compact for ASCII-heavy text, variable length.
* UTF-32: simplest indexing (fixed width), highest space cost.

## 4) Pitfalls

* Treating “Unicode” as a single storage format: Unicode defines code points, while UTF-8/16/32 define byte encodings.
* Assuming “8-bit extended ASCII” is one standard: regional variants make the upper 128 positions inconsistent.
* Opening a file with the wrong encoding: non-English characters are most likely to break first.

## Takeaways

* Text is numbers; encoding is the contract that assigns meaning.
* ASCII explains the historical baseline and why hex dumps are readable for text.
* Unicode solves global interoperability by giving every character a unique code point.
* UTF formats are practical byte-level encodings of Unicode with different storage tradeoffs.

## 6) CN: EN Glossary (small)

* Encoding（编码）: mapping numbers → characters
* Character set（字符集）: defined set of characters (Unicode as a universal set)
* Code point（码点）: `U+XXXX` identifier for a character
* ASCII（美国信息交换标准代码）: 7-bit English-centric encoding
* UTF (Unicode Transformation Format)（Unicode 转换格式）: UTF-8 / UTF-16 / UTF-32

## References

```text
Unicode Standard (general): https://www.unicode.org/standard/standard.html
UTF-8 definition (RFC): https://www.rfc-editor.org/rfc/rfc3629
```
