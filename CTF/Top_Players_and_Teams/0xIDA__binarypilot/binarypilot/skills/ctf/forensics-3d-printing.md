---
name: forensics-3d-printing
description: "CTF 3D printing and G-code forensics. PrusaSlicer binary G-code (bgcode/GCDE) parsing, heatshrink decompression, G-code coordinate visualization for hidden patterns, QOIF image format extraction, uncommon file format identification. Triggers: '3d printing', 'gcode', 'gcde', 'bgcode', 'prusaslicer', 'heatshrink', 'qoif', 'stl forensics', 'g-code forensics'."
---

# CTF Forensics: 3D Printing & G-Code

PrusaSlicer binary G-code parsing, coordinate visualization, QOIF thumbnails.

## Install

```bash
pip install heatshrink2 qoi pillow numpy matplotlib --break-system-packages
```

---

## Phase 1: Identify File Format

```bash
# Check magic bytes:
xxd file.g | head -2
# GCDE = PrusaSlicer binary G-code (.g or .bgcode)
# qoif = Quite OK Image Format
# OggS = Ogg container
# STL: ASCII starts with "solid", binary = 80-byte header

file *.g *.bgcode *.gcode 2>/dev/null
```

---

## Phase 2: Parse PrusaSlicer Binary G-code (GCDE)

```python
import struct, zlib

try:
    import heatshrink2
    HAVE_HEATSHRINK = True
except ImportError:
    HAVE_HEATSHRINK = False

def parse_bgcode(filepath):
    """Parse PrusaSlicer binary G-code (.g / .bgcode) file."""
    
    BLOCK_TYPES = {
        0: 'FileMetadata', 1: 'GCode', 2: 'SlicerMetadata',
        3: 'PrinterMetadata', 4: 'PrintMetadata', 5: 'Thumbnail'
    }
    COMPRESSION_TYPES = {0: 'None', 1: 'Deflate', 2: 'Heatshrink_11_4', 3: 'Heatshrink_12_4'}
    THUMBNAIL_FORMATS = {0: 'PNG', 1: 'JPEG', 2: 'QOI'}
    
    with open(filepath, 'rb') as f:
        data = f.read()
    
    # Validate magic:
    if data[:4] != b'GCDE':
        raise ValueError("Not a binary G-code file (missing GCDE magic)")
    
    pos = 10  # Skip header: magic(4) + version(4) + checksum_type(2)
    blocks = []
    
    while pos < len(data) - 8:
        block_type = struct.unpack_from('<H', data, pos)[0]
        compression = struct.unpack_from('<H', data, pos+2)[0]
        uncompressed_size = struct.unpack_from('<I', data, pos+4)[0]
        pos += 8
        
        if compression != 0:
            compressed_size = struct.unpack_from('<I', data, pos)[0]
            pos += 4
        else:
            compressed_size = uncompressed_size
        
        # Type-specific header:
        extra = {}
        if block_type in (0, 1, 2, 3, 4):
            extra['encoding'] = struct.unpack_from('<H', data, pos)[0]
            pos += 2
        elif block_type == 5:
            extra['format'] = struct.unpack_from('<H', data, pos)[0]
            extra['width'] = struct.unpack_from('<H', data, pos+2)[0]
            extra['height'] = struct.unpack_from('<H', data, pos+4)[0]
            pos += 6
        
        block_data = data[pos:pos+compressed_size]
        pos += compressed_size + 4  # data + CRC32
        
        # Decompress:
        if compression == 0:
            raw = block_data
        elif compression == 1:
            raw = zlib.decompress(block_data)
        elif compression in (2, 3) and HAVE_HEATSHRINK:
            ws = 11 if compression == 2 else 12
            raw = heatshrink2.decompress(block_data, window_sz2=ws, lookahead_sz2=4)
        else:
            raw = block_data
        
        blocks.append({
            'type': BLOCK_TYPES.get(block_type, f'Unknown_{block_type}'),
            'compression': COMPRESSION_TYPES.get(compression, 'Unknown'),
            'raw': raw,
            **extra
        })
    
    return blocks

# Usage:
blocks = parse_bgcode('file.g')
for i, b in enumerate(blocks):
    print(f"Block {i}: {b['type']}, {len(b['raw'])} bytes")
```

---

## Phase 3: Extract G-code and Search for Flag

```python
blocks = parse_bgcode('file.g')

for i, b in enumerate(blocks):
    if b['type'] == 'GCode':
        gcode_text = b['raw'].decode('utf-8', errors='replace')
        
        # Search for flag patterns:
        for line_num, line in enumerate(gcode_text.splitlines()):
            if any(kw in line.upper() for kw in ['FLAG', 'CTF', 'META', 'SECRET']):
                print(f"L{line_num}: {line}")
        
        # Save full G-code:
        with open(f'extracted_gcode_{i}.gcode', 'w') as f:
            f.write(gcode_text)

    elif b['type'] == 'Thumbnail':
        fmt = {0: 'png', 1: 'jpg', 2: 'qoi'}.get(b.get('format', 0), 'bin')
        with open(f'thumbnail_{i}.{fmt}', 'wb') as f:
            f.write(b['raw'])
        print(f"Saved thumbnail: thumbnail_{i}.{fmt}")
```

---

## Phase 4: G-code Coordinate Visualization

```python
import numpy as np
import matplotlib.pyplot as plt

def visualize_gcode(gcode_text, view='xy'):
    """Visualize G-code tool path. view: 'xy', 'xz', 'yz'"""
    coords = []
    x, y, z = 0.0, 0.0, 0.0
    
    for line in gcode_text.splitlines():
        line = line.split(';')[0].strip()  # Remove comments
        if not line.startswith('G1') and not line.startswith('G0'):
            continue
        
        parts = {p[0]: float(p[1:]) for p in line.split()[1:]
                 if p[0] in 'XYZE' and len(p) > 1}
        
        if 'X' in parts: x = parts['X']
        if 'Y' in parts: y = parts['Y']
        if 'Z' in parts: z = parts['Z']
        
        # Only record if extruding (for G1 with E):
        if 'E' in parts:
            coords.append((x, y, z))
    
    if not coords:
        return
    
    coords = np.array(coords)
    
    # Choose view:
    if view == 'xy':
        px, py = coords[:, 0], coords[:, 1]
        xlabel, ylabel = 'X', 'Y'
    elif view == 'xz':
        px, py = coords[:, 0], coords[:, 2]
        xlabel, ylabel = 'X', 'Z'
    else:
        px, py = coords[:, 1], coords[:, 2]
        xlabel, ylabel = 'Y', 'Z'
    
    plt.figure(figsize=(12, 12))
    plt.scatter(px, py, s=0.5, c='blue', alpha=0.5)
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.title(f'G-code {view.upper()} projection')
    plt.axis('equal')
    plt.savefig(f'gcode_{view}.png', dpi=200, bbox_inches='tight')
    print(f"Saved gcode_{view}.png")
    plt.close()

# For text hidden in side view (XZ = side, XY = top):
gcode_text = open('extracted_gcode_0.gcode').read()
visualize_gcode(gcode_text, 'xz')   # Side view: shows engraved letters
visualize_gcode(gcode_text, 'xy')   # Top view
```

---

## Phase 5: Metadata Extraction

```bash
# Check SlicerMetadata/PrinterMetadata blocks for flags:
python3 << 'EOF'
from parse_bgcode import parse_bgcode  # use function from above

blocks = parse_bgcode('file.g')
for b in blocks:
    if b['type'] in ('SlicerMetadata', 'PrinterMetadata', 'FileMetadata', 'PrintMetadata'):
        content = b['raw'].decode('utf-8', errors='replace')
        print(f"=== {b['type']} ===")
        for line in content.splitlines():
            if any(kw in line.upper() for kw in ['FLAG', 'CTF', 'SECRET', 'HIDDEN']):
                print(f"  > {line}")
EOF
```

---

## Output

Save to `.omop/engagement/ctf/forensics/3d/`:
- `extracted_gcode_*.gcode`: decompressed G-code
- `thumbnail_*.png`: extracted preview images
- `gcode_xz.png` / `gcode_xy.png`: coordinate visualizations
- `flag.txt`: found flag

## Next Phase

→ `ctf-forensics-disk` for disk image analysis
→ `ctf-misc-encodings` for encoding challenges
