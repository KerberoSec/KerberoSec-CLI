---
name: misc-encodings
description: "CTF encoding challenges. Base64/32/hex decode, IEEE 754 float-as-text, UTF-16 mojibake fix, BCD decode, QR code repair, esoteric languages (Whitespace, Brainfuck, Piet), SMS PDU reassembly, Gray code, RTF hidden data, multi-layer cascade decoder. Triggers: 'encoding ctf', 'base64 decode', 'qr code repair', 'whitespace language', 'brainfuck', 'esoteric language', 'ieee 754', 'mojibake', 'gray code', 'sms pdu', 'multi-layer decode'."
---

# CTF Misc: Encodings & Esoteric Formats

Cascaded decodings, esoteric languages, QR repair, IEEE 754, esoteric formats.

---

## Phase 1: Standard Encodings

```bash
# Base64:
echo "c3RyaW5n" | base64 -d
cat file.b64 | base64 -d > file

# Base32:
echo "ONXW2ZJAMFZA====" | base32 -d

# Hex:
echo "68656c6c6f" | xxd -r -p
python3 -c "print(bytes.fromhex('68656c6c6f').decode())"

# ROT13:
echo "uryyb" | tr 'A-Za-z' 'N-ZA-Mn-za-m'

# ROT18 (ROT13 + ROT5):
python3 -c "
def rot18(text):
    result = []
    for c in text:
        if c.isalpha():
            base = ord('a') if c.islower() else ord('A')
            result.append(chr((ord(c) - base + 13) % 26 + base))
        elif c.isdigit():
            result.append(str((int(c) + 5) % 10))
        else:
            result.append(c)
    return ''.join(result)
print(rot18('INPUT'))
"

# URL decode:
python3 -c "from urllib.parse import unquote; print(unquote('%68%65%6C%6C%6F'))"

# HTML entities:
python3 -c "from html import unescape; print(unescape('&lt;script&gt;'))"
```

---

## Phase 2: IEEE 754 Float-as-Text

```python
import struct

# Numbers that are readable ASCII when viewed as raw bytes:
def float_to_text(f):
    return struct.pack('>f', f).decode('latin-1')

def text_to_float(s):
    return struct.unpack('>f', s.encode('latin-1'))[0]

# Numbers that look like text when re-interpreted:
values = [1.0, 2.0, 3.14]  # given floats
for v in values:
    packed = struct.pack('>f', v)
    print(f"{v} → {packed.hex()} → {packed}")

# Decode IEEE 754 list to string:
def decode_ieee754_msg(floats):
    result = b""
    for f in floats:
        result += struct.pack('>f', f)
    return result.decode('utf-8', errors='replace')
```

---

## Phase 3: UTF-16 Mojibake Fix

```python
# CJK characters appearing in text = UTF-16 LE/BE decoded as wrong encoding

def fix_mojibake_utf16_le(text):
    """Convert CJK mojibake back to original text."""
    # Re-encode as latin-1 then decode as UTF-16 LE:
    try:
        raw = text.encode('utf-16-le')
        return raw.decode('utf-8')
    except:
        pass
    try:
        raw = text.encode('latin-1')
        return raw.decode('utf-16-le')
    except:
        return None

# Try all combinations:
for encoding_in in ['utf-16-le', 'utf-16-be', 'utf-8', 'latin-1']:
    for encoding_out in ['utf-8', 'ascii', 'latin-1']:
        try:
            result = text.encode(encoding_in).decode(encoding_out)
            if result.isprintable():
                print(f"{encoding_in} → {encoding_out}: {result}")
        except:
            pass
```

---

## Phase 4: BCD (Binary Coded Decimal)

```python
# BCD: each nibble = one decimal digit
# e.g., 0x25 = "25" (not decimal 37)

def bcd_decode(data: bytes) -> str:
    """Decode BCD bytes to string."""
    result = ""
    for byte in data:
        high = (byte >> 4) & 0xF
        low = byte & 0xF
        if high <= 9:
            result += str(high)
        if low <= 9:
            result += str(low)
    return result

# Also: each pair of BCD digits → ASCII value
def bcd_to_ascii(data: bytes) -> str:
    digits = bcd_decode(data)
    return ''.join(chr(int(digits[i:i+2])) for i in range(0, len(digits)-1, 2) 
                   if int(digits[i:i+2]) >= 32)
```

---

## Phase 5: QR Code Repair

```bash
# Repair damaged QR code:
pip install qrcode pillow --break-system-packages

# Finder patterns: squares in 3 corners: if damaged, must be restored
# QR structure: finder patterns + alignment patterns + timing + data

# Python QR repair:
python3 << 'EOF'
from PIL import Image
import qrcode

# Open damaged QR:
img = Image.open('damaged_qr.png')
# Manually add finder patterns if missing (top-left, top-right, bottom-left)
# Each finder = 7x7 block pattern

# Decode with zxing or pyzbar:
from pyzbar.pyzbar import decode
result = decode(img)
for r in result:
    print(r.data.decode())
EOF

# Chunk reassembly (QR split into tiles):
# Folder names as base64 → decode → chunk index → sort → combine
python3 -c "
import base64, os
dirs = sorted(os.listdir('.'), key=lambda x: int(base64.b64decode(x + '==').decode()))
# Assemble image from sorted chunks
"
```

---

## Phase 6: Esoteric Languages

```bash
# Brainfuck decoder:
pip install brainfuck --break-system-packages
python3 -c "import brainfuck; print(brainfuck.evaluate('++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.'))"

# Whitespace (S/T/L tokens): use whitespace interpreter:
# Online: https://whitespace.daniel-spang.com/
# Python: pip install whitespace-interpreter

# Piet (color-based): use online interpreter:
# https://www.bertnase.de/npiet/npiet-execute.php

# Detect esoteric language:
cat file.txt | python3 -c "
import sys
content = sys.stdin.read()
if all(c in ' \t\n' for c in content):
    print('Whitespace language')
elif all(c in '+-<>.,[]' for c in content.replace(' ','').replace('\n','')):
    print('Brainfuck')
elif '<><>' in content or 'BOF' in content:
    print('Possibly Malbolge or Befunge')
"

# Multi-layer decode automation:
def try_decodings(data):
    import base64, codecs
    results = {}
    try: results['base64'] = base64.b64decode(data).decode()
    except: pass
    try: results['base32'] = base64.b32decode(data).decode()
    except: pass
    try: results['hex'] = bytes.fromhex(data).decode()
    except: pass
    try: results['rot13'] = codecs.decode(data, 'rot_13')
    except: pass
    return results
```

---

## Phase 7: Gray Code

```python
# Gray code: each successive value differs by one bit
# Rotating wheel puzzles use Gray code

def gray_to_binary(gray):
    """Convert Gray code to binary integer."""
    binary = gray
    mask = gray >> 1
    while mask:
        binary ^= mask
        mask >>= 1
    return binary

def decode_gray_wheel(gray_codes):
    """Decode sequence of Gray code readings."""
    return [gray_to_binary(g) for g in gray_codes]

# Example: rotating wheel with sectors labeled in Gray code
readings = [0b001, 0b011, 0b010, 0b110, 0b111, 0b101, 0b100, 0b000]
print([gray_to_binary(g) for g in readings])
# → [0, 1, 2, 3, 4, 5, 6, 7]
```

---

## Phase 8: SMS PDU Frame Reassembly

```python
# SMS PDU: multi-part messages have User Data Header (UDH)
# Each part: seq number + total parts + content

def parse_sms_pdu(hex_string: str) -> str:
    """Parse SMS PDU and return message text."""
    data = bytes.fromhex(hex_string)
    
    # Basic PDU parsing:
    offset = 0
    smsc_len = data[offset]; offset += 1 + smsc_len
    pdu_type = data[offset]; offset += 1
    # ... (simplified)
    
    # For multi-part: check UDH bit in pdu_type
    # Sort parts by sequence number, concatenate
    pass

# Reassemble by sequence number:
parts = {}  # {seq: content}
for hex_pdu in pdu_hexes:
    # Extract seq, total, content
    # Store in parts dict
    pass

full_message = ''.join(parts[i] for i in sorted(parts.keys()))
```

---

## Output

Save to `.omop/engagement/ctf/misc/`:
- `decoded.txt`: final decoded content
- `flag.txt`: extracted flag

## Next Phase

→ `ctf-misc-pyjails` for Python escape challenges
→ `ctf-misc-bashjails` for bash escape challenges
