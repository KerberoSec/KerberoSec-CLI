# 🧩 Puzzled Glyphs: Ecowas CTF (MISC)

## 📌 Challenge Information
- **Category:** Misc
- **Difficulty:** Medium
- **Points:** 200

## 🧠 Description
> An ancient glyph, shattered into nine shards. We need your help to recover them.

---

## 🔍 Initial Analysis

The challenge provided a ZIP archive containing 9 PNG images:

```bash
unzip chall.zip
cd tiles
ls
```

Output:

```
tile_0.png  tile_1.png  tile_2.png  tile_3.png  tile_4.png
tile_5.png  tile_6.png  tile_7.png  tile_8.png
```

Each image has the same format:

```bash
file *
```

```
PNG image data, 98 x 98, 8-bit grayscale
```

Opening individual tiles revealed that each one contained a **fragment of a QR code**.

---

## 🧩 Understanding the Challenge

- We have **9 tiles → 3x3 grid**
- Each tile is a **part of a QR code**
- Goal: **reconstruct the QR code correctly → scan → get flag**

---

## 🧠 Key Observation

QR codes always contain **3 large finder patterns** (corners):

- Top-left
- Top-right
- Bottom-left

By visually inspecting the tiles, we identified some corner positions:

| Tile     | Position (human) | Position (Python) |
|----------|------------------|-------------------|
| tile_3   | (1,1)            | (0,0)             |
| tile_6   | (1,3)            | (0,2)             |
| tile_1   | (3,1)            | (2,0)             |
| tile_4   | (3,3)            | (2,2)             |

This drastically reduces the search space.

---

## ⚙️ Approach

Instead of brute-forcing all permutations:

```
9! = 362880 possibilities ❌
```

We fix the known tiles and only permute the remaining ones:

```
5! = 120 possibilities ✅
```

---

## 🛠️ Reconstruction Script

```python
from PIL import Image
import itertools, os

# Known tile positions (row, col)
known = {
    (0,0): "tile_3.png",
    (0,2): "tile_6.png",
    (2,0): "tile_1.png",
    (2,2): "tile_4.png",
}

all_tiles = [f"tile_{i}.png" for i in range(9)]
remaining_tiles = [t for t in all_tiles if t not in known.values()]
remaining_positions = [(r,c) for r in range(3) for c in range(3) if (r,c) not in known]

sample = Image.open(all_tiles[0])
w, h = sample.size

os.makedirs("candidates", exist_ok=True)

count = 0
for perm in itertools.permutations(remaining_tiles):
    grid = dict(known)

    for pos, tile in zip(remaining_positions, perm):
        grid[pos] = tile

    canvas = Image.new("L", (w*3, h*3), 255)

    for (r,c), tile in grid.items():
        img = Image.open(tile).convert("L")
        canvas.paste(img, (c*w, r*h))

    canvas.save(f"candidates/candidate_{count:03d}.png")
    count += 1

print(f"[+] Generated {count} candidates")
```

---

## 🔎 QR Code Detection

We used `zbarimg` to scan all generated candidates:

```bash
sudo apt install zbar-tools

for f in candidates/*.png; do
    zbarimg "$f" 2>/dev/null && echo "FOUND: $f"
done
```

---

## 🎯 Result

```
QR-Code:EcowasCTF{fr4ctur3d_gl4phs_r34ss3mbl3d}
FOUND: candidates/candidate_048.png
```

---

## 🏁 Flag

```
EcowasCTF{fr4ctur3d_gl4phs_r34ss3mbl3d}
```

---

## 💡 Key Takeaways

- Recognizing **QR code structure** (finder patterns) is crucial
- Fixing known positions reduces brute force drastically
- Combining **image processing + automation** is powerful in CTFs
- Always look for **visual patterns before brute-forcing blindly**

---

## ⚡ Alternative Approach (Faster)

Instead of brute force:
- Manually identify edges using pixel continuity
- Place tiles by matching borders
- Reconstruct QR directly

But brute-force with constraints is faster and safer during a CTF.

---

## 🧠 Pipeline Summary

```
tiles → identify corners → reduce permutations → reconstruct → scan → flag
```
