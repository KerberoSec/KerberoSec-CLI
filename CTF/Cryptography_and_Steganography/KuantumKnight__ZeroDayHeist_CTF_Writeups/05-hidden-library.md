# 05: The Hidden Library

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field | Value |
|---|---|
| **Category** | Steganography / Miscellaneous |
| **Points** | 650 |
| **Difficulty** | Hard |
| **Solved At** | June 6, 2026: 6:50 AM |
| **Files** | `challenge.png`, `poem.txt` |

---

## Description

> You've intercepted a mysterious package containing an old library photograph and some cryptic documents. Intelligence suggests there's a hidden message that only human intuition can uncover.

Two files were provided: a PNG image of a library bookshelf and a poem containing cryptic hints. The challenge explicitly stated that the solution requires **human intuition**: no automated tool will hand you this one.

---

## Files

### `poem.txt`

```
Whispers in the dark of night,
Seventeen steps to reach the light.
Books that lean but never fall,
Secrets hidden within the wall.

Time stands still at half past three,
Colors blend for eyes to see.
Every third holds truth within,
Rotate the world to let light in.

Red before blue makes purple shine,
Angles whisper the divine.
Backward glances reveal the key,
What once was hidden now breaks free.
```

### `challenge.png`

A photograph of a library bookshelf. Visually, it appears completely normal.

---

## Approach

### Step 1: Close Reading of the Poem

Each line of the poem is a hint. Breaking them down:

| Line | Interpretation |
|---|---|
| `Secrets hidden within the wall` | Something hidden in the image background |
| `Backward glances reveal the key` | **Reverse** something |
| `What once was hidden now breaks free` | Decoding/reversing will reveal the answer |
| `Colors blend for eyes to see` | Visual steganography: look carefully |
| `Every third holds truth within` | Could reference character positions |

The single most important line: **"Backward glances reveal the key"**: reverse something.

### Step 2: Standard Forensic Enumeration (Ruled Out)

```bash
$ exiftool challenge.png   # No flag in metadata
$ strings challenge.png    # No readable flag
$ binwalk challenge.png    # No embedded archives
$ zsteg challenge.png      # No LSB data
```

No automated tools worked. The challenge required **visual inspection**, as the description warned.

### Step 3: Visual Examination of the Image

After careful, patient examination of the bookshelf image: specifically the shelf edges, background wall, and areas near the bottom of the image: faint text was discovered blended into the background colour:

```
nol71lu7nl_n4muh_sl_y3k_3p
```

The text is intentionally low-contrast against the background and extremely easy to miss on a quick look.

### Step 4: Reverse the String

Following the poem's most explicit hint ("Backward glances reveal the key"):

```
nol71lu7nl_n4muh_sl_y3k_3p
         ↓ reverse
p3_k3y_ls_hum4n_ln7ul17lon
```

### Step 5: Decode Leetspeak

The reversed string uses common leetspeak substitutions:

| Leet | Letter |
|---|---|
| `3` | `e` |
| `4` | `a` |
| `7` | `t` (or `i`) |
| `1` | `i` (or `l`) |

```
p3_k3y_ls_hum4n_ln7ul17lon
          ↓ decode leet
the_key_is_human_intuition
```

### Step 6: Construct the Flag

```
0dayhiest{the_key_is_human_intuition}
```

---

## Solution Summary

```
challenge.png
  └─► Visual inspection → hidden text: nol71lu7nl_n4muh_sl_y3k_3p
        └─► Reverse: p3_k3y_ls_hum4n_ln7ul17lon
              └─► Leet decode: the_key_is_human_intuition
                    └─► Flag: 0dayhiest{the_key_is_human_intuition}
```

---

## Tools Used

| Tool | Purpose |
|---|---|
| `exiftool` | Metadata check (ruled out) |
| `binwalk` | Embedded file check (ruled out) |
| `zsteg` | LSB check (ruled out) |
| Human eyes | Actual solution |

---

## What I Learned

1. **Read challenge descriptions literally**: "only human intuition can uncover" was a direct warning that automated tools would fail.
2. **Poems in CTFs are always structural guides**, not decoration. Every line has a technical meaning.
3. **Reversing + leet decoding** is a classic CTF combo: not complex on its own, but easy to miss if you don't find the hidden string first.
4. **Patience beats tools sometimes**: the 650-point value reflects the difficulty of finding the hidden text visually, not the complexity of the decode.

---

## Flag

```
0dayhiest{the_key_is_human_intuition}
```
