# Atari 2600: v1t CTF 2026

**Category:** Misc  
**Points:** 100  
**Flag:** `v1t{0_0}`

## Challenge

We're given `v1t.bas.bin`. The `.bin` extension and small size suggest a ROM dump.

## Identification

```
$ file v1t.bas.bin
v1t.bas.bin: data

$ wc -c v1t.bas.bin
4096 v1t.bas.bin

$ xxd v1t.bas.bin | head -1
00000000: 78d8 a000 a5d0 c92c d007 ...
```

Key fingerprints:
- **First two bytes `78 d8`**: `SEI` (disable interrupts) then `CLD` (clear decimal). Canonical 6502 startup.
- **4096 bytes**: exactly 4 KB, the standard size of a 2600 cartridge.
- **Reset vector at `$FFFC: $FFFD`**: points to `$F000`, confirming the ROM maps to `$F000: $FFFF`.

This is an **Atari 2600 cartridge ROM**.

## Running It

```
$ brew install stella
$ stella v1t.bas.bin
```

The game is a small platformer/maze. The score counter at the bottom of the screen shows all zeros: **`0 0 0 0 0 0 0`**. The flag is read from that score display.

## What's Inside

### Rendering function at `$F278`

The drawing code follows a strict pattern repeated throughout the ROM:

```asm
LDX #$00
LDY #<row>
LDA #<tile>
JSR $F278
```

There are exactly **108 calls** to `$F278`, grouped into two scanline bands:
- **Rows 1-3** (top half)
- **Rows 5-7** (bottom half)

### Pixel font at `$FF9C`

The ROM stores **10 font glyphs** (digits 0-9) as 8×8 bitmaps starting at `$FF9C`, used to render the score digits:

```
Digit 0:
..XXXX..
.XX..XX.
.XX..XX.
.XX..XX.
.XX..XX.
.XX..XX.
.XX..XX.
..XXXX..
```

<img width="718" height="742" alt="obrázok" src="https://github.com/user-attachments/assets/ced787c1-c07b-4884-a645-91a0374a906a" />

The whole block:

```
  ######## .##..##. ...##... .....##. 
  ######## .##..##. ..###... .....##. 
  ######## .##..##. ...##... .#...##. 
  ######## ..####.. ....#... ..####.. 
  ..####.. .######. .######. ..####.. 
  .##..##. ...##... .##..... .#...##. 
  .##..##. ...##... .##..... .....##. 
  .##..##. ...##... ..####.. .....##. 
  ...###.. .#..##.. ..####.. .#####.. 
  .....##. ..#.##.. .##..... .##..... 
  .#...##. ...###.. .##..... .##...#. 
  ..####.. ....##.. .######. ..####.. 
  ....##.. ..####.. ..####.. ..##.... 
  ....##.. .#...##. .##..##. ..##.... 
  .######. .....##. .##..##. ..##.... 
  .#..##.. .....##. .##..##. ...##... 
  ....##.. ..####.. .##..##. ........ 
  .....##. .##..##. .##..##. ........ 
  .#....#. .##..##. .##..##. ........ 
  ..#####. ..####.. ..####.. ........ 
  ..####.. ..####.. ........ ######## 
  .##..##. .#...##. ........ ######## 
  .##..##. .....##. ........ ######## 
  .##..##. ..#####. ........ ########
```

### Rendering pipeline

`$F278` → `$F259` (computes display buffer offset) → `$F2AC` (ORs a single bit into zero-page display RAM using the bitmask table at `$F2D3`: `80 40 20 10 08 04 02 01 01 02 04 08 …`).

## Flag

```
v1t{0_0}
```
