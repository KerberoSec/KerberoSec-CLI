# Overstrike

| Field | Details |
|-------|---------|
| **Challenge** | Overstrike |
| **Platform** | Cyber Apocalypse CTF 2026: The Salt Crown |
| **Category** | Mobile (Android / Godot) |
| **Flag** | `HTB{0v3rstr1k3_r3cut_th3_w0rld_s34l_by_f0rg1ng_th3_mark}` |

---

## Overview

The challenge ships `Overstrike.apk`: a **Godot 4 Mono/C# game**. The player runs around a small level collecting five "Mark" pickups, which accumulate into a `CarriedMark` value on a `GameState` singleton. That value is hashed every frame into a `WorldSeal`; when the seal matches a hardcoded target, the world is "aligned" (a bridge becomes solid) and, per the game's own logic, a sealed registry of bytes can be decoded.

Collecting all five in-world marks only ever sums to 18: nowhere near enough to hit the target seal by normal play. The actual solve is static: recover the exact 64-bit `CarriedMark` that produces the target seal by algebraically inverting the mixing function, then feed that value into the same decoding routine the game itself uses to unseal the flag.

---

## Unpacking

```bash
unzip -o Overstrike.apk -d apk
```

Standard Godot/Mono Android layout. The interesting file is the compiled game assembly (not the loose `.cs` stubs under `assets/scripts/`, which are just source references: the real logic is compiled):

```
apk/assets/.godot/mono/publish/x86_64/Overstrike.dll
```

`assets/project.binary` confirms `application/config/name = Overstrike`.

## Decompiling the assembly

No `dotnet`/`ilspycmd` toolchain was available, so the assembly was parsed directly with [`dnfile`](https://github.com/malwarefrank/dnfile) (ECMA-335 metadata reader) and [`dncil`](https://github.com/mandiant/dncil) (IL disassembler):

```bash
python3 -m venv venv && ./venv/bin/pip install dnfile dncil
```

```python
import dnfile
from dncil.cil.body import CilMethodBody
from dncil.cil.body.reader import CilMethodBodyReaderBase

pe = dnfile.dnPE("Overstrike.dll")
tables = pe.net.mdtables

class Reader(CilMethodBodyReaderBase):
    def __init__(self, pe, rva):
        self.pe, self.offset = pe, pe.get_offset_from_rva(rva)
    def read(self, n):
        d = self.pe.get_data(self.pe.get_rva_from_offset(self.offset), n)
        self.offset += n
        return d
    def tell(self): return self.offset
    def seek(self, o): self.offset = o; return o

for t in tables.TypeDef.rows:
    for midx in t.MethodList:
        m = midx.row
        if m.Rva:
            body = CilMethodBody(Reader(pe, m.Rva))
            # inspect body.instructions
```

Walking `TypeDef`/`MethodDef` turns up the game's own types: `Archive`, `BridgeBuilder`, `CameraRig`, `GameState`, `Hud`, `IntroOverlay`, `JumpButton`, `Main`, `MarkPickup`, `Player`, `VirtualJoystick`. Three methods matter:

### `GameState.Mix(long)`: a splitmix64-style finalizer

```
x = x + 0x9E3779B97F4A7C15   (constant, wrapping)
x = x ^ (x >>> 30)
x = x * 0xBF58476D1CE4E5B9
x = x ^ (x >>> 27)
x = x * 0x94D049BB133111EB
x = x ^ (x >>> 31)
return x
```

(constants recovered from the IL as signed 64-bit literals; shifts are `shr.un`, i.e. logical.)

### `GameState.get_WorldIsAligned`

```csharp
this.WorldSeal == -2764723033133996666   // 0xD9A1BB0CABB52586
```

`WorldSeal` is set every `_Process` tick to `Mix(this.CarriedMark)`. So the puzzle is: find `CarriedMark` such that `Mix(CarriedMark) == 0xD9A1BB0CABB52586`.

### `MarkPickup.OnBodyEntered` / `Main.BuildMarks`

Each pickup does `GameState.Instance.CarriedMark += this.Worth`. The five `Worth` values are baked into a `RuntimeHelpers.InitializeArray`-initialized `long[5]`: read directly from the field's RVA in the PE:

```python
data = pe.get_data(0x10a78, 40)          # FieldRva for the array's backing field
struct.unpack('<5q', data)               # -> (1, 2, 3, 5, 7)
```

Max reachable sum by picking up every mark is `1+2+3+5+7 = 18`. `Mix(18)` (and every other subset sum 0-18) does **not** equal the target: the in-game bridge puzzle is unsolvable by normal play. That's the tell that the real value has to be recovered mathematically.

### `GameState.UnsealRegistry`: the decoder

Reconstructed from IL (resolved via `MemberRef`/`Field` tokens): builds a keystream from repeated SHA-256 and XORs it against a static 56-byte blob (`SealedRecord`, again pulled straight from its `FieldRva`):

```python
h = SHA256(long_to_8_bytes_LE(CarriedMark))
keystream = b""
block = 0
while len(keystream) < len(SealedRecord):
    keystream += SHA256(h + int32_to_4_bytes_LE(block))
    block += 1
plaintext = bytes(a ^ b for a, b in zip(SealedRecord, keystream))
```

(`SealedRecord`'s 56 raw bytes were read from its `FieldRva` the same way as the marks array.)

## Inverting `Mix`

Splitmix64's finalizer is a bijection on 64-bit integers, so it can be inverted directly instead of brute-forced: undo each XOR-shift with the standard iterative unshift, and undo each multiply with the modular inverse of the (odd) constant mod 2⁶⁴.

```python
MASK, MOD = (1 << 64) - 1, 1 << 64
C1, C2, C3 = 0x9E3779B97F4A7C15, 0xBF58476D1CE4E5B9, 0x94D049BB133111EB
target = 0xD9A1BB0CABB52586

def unxorshift(v, shift):
    u = v
    for _ in range(70 // shift + 2):
        u = (v ^ (u >> shift)) & MASK
    return u

x5 = unxorshift(target, 31)
x4 = (x5 * pow(C3, -1, MOD)) & MASK
x3 = unxorshift(x4, 27)
x2 = (x3 * pow(C2, -1, MOD)) & MASK
x1 = unxorshift(x2, 30)
carried_mark = (x1 - C1) & MASK          # 0xD7CAAD24DD98B676 (signed: -2897313036411292042)
```

Verified: `Mix(carried_mark) == target`. ✅

## Recovering the flag

Feed the recovered `CarriedMark` into the same decoding routine the game uses:

```python
import hashlib, struct

SealedRecord = bytes.fromhex(
    "0d563344126e440f363dec5e87cad5b60401b6b596e4b87e79e0ecdc075299"
    "fbb36800572022033ca6607c32fd1f7cb3dc9d7873132f600b"
)

def unseal(carried_mark):
    h = hashlib.sha256(struct.pack('<q', carried_mark)).digest()
    out, i, block = bytearray(len(SealedRecord)), 0, 0
    while i < len(SealedRecord):
        h2 = hashlib.sha256(h + struct.pack('<i', block)).digest()
        for b in h2:
            if i >= len(SealedRecord):
                break
            out[i] = SealedRecord[i] ^ b
            i += 1
        block += 1
    return bytes(out)

print(unseal(-2897313036411292042).decode())
```

```
HTB{0v3rstr1k3_r3cut_th3_w0rld_s34l_by_f0rg1ng_th3_mark}
```

## Takeaways

- Godot Mono/C# APKs ship a normal .NET assembly; a bare-bones ECMA-335 reader (or `dnfile`/`dncil`) is enough to disassemble it without `dotnet`/`ilspy` installed.
- `RuntimeHelpers.InitializeArray` literals (marks array, sealed record) live at a `FieldRva`-referenced offset in the PE, not in any string table: read them as raw bytes.
- A splitmix64-style mixer is a *bijection*, not a one-way hash: if the target output is known, invert it algebraically (unshift + modular inverse) instead of searching the input space.

---

*Writeup by [e1](mailto:e0sec@proton.me).*
