# HVL: v1t CTF 2026

**Category:** Web / Misc  
**Points:** 100  
**Solves:** 78  
**Flag:** `v1t{g04t_mck_hvl}`

> *"MCKeyyyyyy. You can listen the full album here: [youtube playlist](https://www.youtube.com/playlist?list=PLG5bpInXG8Sc): Note this is a troll challenge don't spend too much time on it"*  
> Challenge URL: https://hvl.v1t.site

---

## Step 1: MP3 → Broken PNG

```
exiftool kDC9T3kG.mp3
```

Reveals an embedded cover image extracted as `picture.png`. Opening it fails: the file header is corrupt.

```
xxd picture.png | head -2
# 3133 2e35 306b 4443 39...  "13.50kDC9T3kG.mp..."  ← exiftool metadata prepended
```

The real PNG magic bytes (`89 50 4e 47`) start at offset **213**. Strip the junk:

```bash
dd if=picture.png of=fixed.png bs=1 skip=213
file fixed.png  # PNG image data, 1280x1280, 8-bit/color RGB
```

*[Image: HVL album cover]*

Checking for extras after the PNG:

```bash
python3 -c "
data=open('fixed.png','rb').read()
iend=data.rfind(b'IEND')
print(data[iend+8:])"
# b'255226.612125'   <-- red herring
```

---

## Step 2: hvl.v1t.site: Hidden Unicode chars

The page source contains an embedded SRT string. Cue 33 carries 9 invisible characters after the 🔥 emoji: Unicode **Variation Selectors Supplement** (`U+E0100+`):

```
cue 33  →  e0158  e0155  e015c  e015c  e015f  e0110  e0163  e0159  e0162
```

Extract in the browser console:

```js
lyricCues.slice(29).forEach((c, i) => {
  const full = c.text + ' ' + (c.sub || '');
  const pts = [...full].map(ch => ({ch, cp: ch.codePointAt(0).toString(16)}));
  const hidden = pts.filter(x => parseInt(x.cp, 16) > 0xE0000);
  if (hidden.length) console.log('cue', i+30, hidden);
})
// cue 33  Array(9) [ e0158, e0155, e015c, e015c, e015f, e0110, e0163, e0159, e0162 ]
```

Decoding `codepoint − 0xE00F0`:

```
e0158 → h   e0155 → e   e015c → l   e015c → l   e015f → o
e0110 → (space)   e0163 → s   e0159 → i   e0162 → r
```

**→ "hello sir"**: a troll message, not the flag.

---

## Step 3: Flag visible in the CSS glitch layer

The visualizer applies a chromatic-aberration glitch to every lyric via `::before`/`::after`:

```css
.lyric-current::before,
.lyric-current::after {
  content: attr(data-text);      /* full lyric text incl. hidden chars */
  transform: translateX(±10px);
  clip-path: polygon(...);       /* clips top / bottom half */
  color: var(--magenta) / var(--acid);
}
```

During the hook section (~1:21-1:35), the glitch layers on consecutive lyric frames reveal the flag fragments visually: the offset colour copies, clip regions, and animation transforms expose text that reads as the flag across multiple cues:

```
cue 30  →  v1t{g
cue 31  →  04t
cue 32  →  _mc
cue 33  →  k_hvl
```

The "hello sir" hidden chars were a troll red herring. The actual flag was hiding in plain sight in the visual rendering.

---

## Chain

```
kDC9T3kG.mp3
  -> exiftool: embedded PNG (picture.png)
  -> picture.png: 213-byte corrupt header (exiftool metadata prepended)
  -> dd skip=213 -> fixed.png (valid 1280x1280 album cover)
  -> fixed.png IEND trailer: "255226.612125"  ← red herring #1

hvl.v1t.site
  -> page source: embeddedSrt JS string
  -> cue 33: 9x Unicode Variation Selectors Supplement (U+E0100+)
     decode (cp − 0xE00F0): "hello sir"  ← red herring #2
  -> CSS ::before/::after { content: attr(data-text) }
     + translateX(±10px) + clip-path + magenta/acid colours
  -> flag fragments visible in glitch layers during hook playback
     v1t{g | 04t | _mc | k_hvl
```

**Flag:** `v1t{g04t_mck_hvl}`
