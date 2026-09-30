# 03: One Day...-AMRRISH ROSHAN

> **ZeroDay Heist 2026 · CyberHX**

---

## Challenge Info

| Field | Value |
|---|---|
| **Category** | Steganography |
| **Points** | 150 |
| **Difficulty** | Easy |
| **Solved At** | June 6, 2026: 2:37 AM |
| **File** | `image.png` |

---

## Description

> One day, you'll find what's hidden. Today might be that day.

A steganography challenge with a PNG image. The title and description hint at patience and careful observation: something is hidden, and it's up to you to find it.

---

## Approach

### Step 1: Visual Inspection

The image was opened and examined visually. Nothing unusual was apparent in the image content itself: no obvious text, QR codes, or visual artifacts.

### Step 2: File Type Confirmation

```bash
$ file image.png
image.png: PNG image data, [dimensions], 8-bit/color RGBA, non-interlaced
```

Confirmed it's a legitimate PNG, not a renamed archive or other format.

### Step 3: Metadata Extraction with exiftool

The first tool to reach for in any image steganography challenge:

```bash
$ exiftool image.png
```

**Key output fields to examine:**
- `Comment`: frequently used to hide flags
- `Artist` / `Author`
- `Description` / `ImageDescription`
- `Copyright`
- `UserComment`
- `XMP` fields

The flag was found directly in the **metadata comment field**:

```
Comment: 0dayheist{1_dAy_U_will_Be}
```

### Step 4: Verify with strings

Cross-verified with:

```bash
$ strings image.png | grep -i "heist\|day\|ctf\|flag\|0day"
```

The same flag string appeared in the output.

---

## Full Recon Checklist (for completeness)

Even though the flag was found at Step 3, here's the full methodology for image steganography challenges:

```bash
# 1. Identify file
file image.png

# 2. Metadata
exiftool image.png

# 3. Printable strings
strings image.png

# 4. Embedded files / archives
binwalk image.png
binwalk -e image.png   # extract if found

# 5. LSB steganography (PNG)
zsteg image.png
zsteg -a image.png     # all bit planes

# 6. Steghide (JPEG primarily, but worth trying)
steghide extract -sf image.png

# 7. Spectrogram analysis (if audio is embedded or if visual patterns)
# Open in Audacity or SonicVisualiser

# 8. Colour plane analysis
stegsolve image.png    # GUI tool: cycle through bit planes
```

---

## Tools Used

- `exiftool`: metadata extraction
- `strings`: printable string scan
- `file`: file type identification

---

## What I Learned

The golden rule of steganography challenges: **always check metadata before doing anything complex**. EXIF data is the fastest, lowest-effort hiding spot for challenge authors, and the first thing solvers should examine.

**Methodology priority order:**
1. `exiftool` (metadata)
2. `strings` (printable data)
3. `binwalk` (embedded files)
4. `zsteg` / `stegsolve` (LSB)
5. Spectrogram / colour analysis

---

## Flag

```
0dayheist{1_dAy_U_will_Be}
```
