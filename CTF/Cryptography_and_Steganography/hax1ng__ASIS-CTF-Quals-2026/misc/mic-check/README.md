# Mic Check

**Category:** Misc  ·  **Flag:** `ASIS{f4r3w3ll_cl4ss1c_h3ll0_unc3rt41n_3r4!}`

## Challenge Description

We are given five readouts drawn from underscores (`_`), vertical bars (`|`), slashes (`/`, `\`), and a dot (`.`). The challenge tells us these are vintage LED-style displays and asks us to read each block, convert everything to lowercase, and join the blocks with underscores inside `ASIS{...}`.

## Initial Analysis

The text looks intimidating at first because each display is spread across three rows. Read row by row, none of it makes sense as a sentence. The key realization is that this is a **seven-segment / LED-style font**: each character is drawn using a small group of columns stacked across the three rows.

So instead of reading horizontally, we read the display **vertically**: every small group of columns forms one character. For example, this shape is an `r`:

```text
 _
|_|
|\
```

The top and middle rows form the rounded body of the letter, while the slash on the bottom row makes its diagonal leg.

## Vulnerability / Core Concept

This is a decoding/ASCII-art recognition puzzle rather than a bug. Two ideas make it solvable:

1. **Vertical segmentation.** Slice the three-row art into per-character column groups and match each group to the LED glyph it represents.
2. **Leet-speak substitutions.** The display uses digits in place of vowels, which we keep exactly as shown when building the flag:

   | Display | Letter it represents |
   |---|---|
   | `4` | `a` |
   | `3` | `e` |
   | `1` | `i` |
   | `0` | `o` |

## Exploitation

Decoding each of the five blocks character by character:

**Block 1** → `f 4 r 3 w 3 l l` → `f4r3w3ll` (reads as *farewell*)

**Block 2** → `c l 4 s s 1 c` → `cl4ss1c` (reads as *classic*)

**Block 3** → `h 3 l l 0` → `h3ll0` (reads as *hello*)

**Block 4** → `u n c 3 r t 4 1 n` → `unc3rt41n` (reads as *uncertain*)

**Block 5** → `3 r 4 !` → `3r4!` (reads as *era!*, the `!` drawn by the vertical bar and dot at the end)

Joining the five decoded blocks with underscores and wrapping in `ASIS{...}` produces the stylized sentence *"farewell classic, hello uncertain era!"*.

## Flag

```text
ASIS{f4r3w3ll_cl4ss1c_h3ll0_unc3rt41n_3r4!}
```

## Key Takeaways

- When ASCII art refuses to parse horizontally, try reading it **vertically**: LED/seven-segment fonts group columns per character across multiple rows.
- Watch for **leet-speak** digit-for-vowel substitutions (`4→a`, `3→e`, `1→i`, `0→o`); the flag keeps the digits, but recognizing the words underneath confirms your decode is correct.
