# Whispering Feather

**Category:** REV  
**Points:** 100  
**Author:** [0xK1L](https://www.linkedin.com/in/ahmad-mazary/)  
**Flag:** `KaliTeam{p0lyg1ot_b3h1nd_th3_m1rr0r}`

---

## Challenge

> Can you find the flag?

Provided: `whispering_feather`: a stripped static ARM64 ELF.

---

## Reconnaissance

```
$ file whispering_feather
whispering_feather: ELF 64-bit LSB executable, ARM aarch64,
                    version 1 (SYSV), statically linked, stripped
```

The README flags the intended friction upfront:

> The file is intentionally a stripped static ELF. The visible flag-shaped strings are decoys, and the response is not stored as plaintext.

`strings` confirms two KaliTeam-formatted strings:

```
KaliTeam{str1ngs_lie_to_you}
KaliTeam{n0t_th3_b1rd_y0u_w4nt}
```

Both are planted in `.rodata` to burn analysis time. Neither is the flag.

Running the binary (via `qemu-aarch64`) shows the interaction model:

```
== WHISPERING FEATHER ==
Present the three seals: <input>
[-] The keeper rejects this composite response.
```

---

## Static Analysis

### Section layout

| Section    | VAddr      | File offset | Size    |
|------------|------------|-------------|---------|
| `.text`    | `0x400000` | `0x10000`   | `0xd8c` |
| `.rodata`  | `0x400d90` | `0x10d90`   | `0x13c8`|

Only one LOAD segment; the binary is entirely self-contained.

### Key strings in `.rodata`

```
ABCDEFGHJKLMNPQRSTUVWXYZ23456789   ← custom base32 alphabet (no I/O/0/1)
0123456789abcdef                   ← hex alphabet
[+] seals aligned; selecting a handler...
[!] mmap failed
```

The base32 and hex alphabets, combined with the "three seals" prompt, immediately suggest the expected input format is a composite of differently-encoded segments.

### Input length check

At `0x400528`:

```asm
cmp  x19, #0x33        ; x19 = trimmed input length
b.ne #0x40083c         ; reject if not 51 chars
```

51 characters, three segments separated by `-` and `:`.

### Output buffer layout (stack, relative to SP)

Tracing the store instructions that build the expected composite:

| Offset     | Content               | Length |
|------------|-----------------------|--------|
| `sp+0x220` | First seal (ASCII)    | 4      |
| `sp+0x224` | `-`                   | 1      |
| `sp+0x225` | Second seal (base32)  | 20     |
| `sp+0x239` | `:`                   | 1      |
| `sp+0x23a` | Third seal (hex)      | 8      |
| `sp+0x242` | `:`                   | 1      |
| `sp+0x243` | Fourth seal (hex)     | 16     |
| `sp+0x253` | `\0`                  | 1      |

Total: `4 + 1 + 20 + 1 + 8 + 1 + 16 = 51` ✓

### Validation logic (`0x400608`: `0x40069c`)

The binary XORs the internally-generated composite with the user-supplied input using NEON vector instructions, then ORs all difference bytes together into a single scalar. The final check:

```asm
cbnz  w8, #0x40083c    ; non-zero → reject
```

Zero means every byte matched: full comparison in constant time.

### Success path

On a passing comparison the binary:

1. Prints `[+] seals aligned; selecting a handler...`
2. Calls `mmap(NULL, 0x1400, PROT_RWX, MAP_PRIVATE|MAP_ANON, -1, 0)` (`syscall 0xde`)
3. Decrypts `0x400` bytes from `.rodata` into the mmap'd region using a key stream derived from the three seals
4. Calls `blr x0`: executes the now-decrypted shellcode
5. The shellcode writes the real flag via `write(1, ...)`

The flag is never stored in plaintext anywhere in the binary. It exists only as encrypted bytes in `.rodata`, unlocked by the correct composite input.

---

## PRNG and Seal Generation

The second seal (20 base32 chars) is produced by a deterministic PRNG seeded entirely from `.rodata` bytes starting at `0x400d90`. There is no external entropy. The PRNG loop (`0x4001e8`: `0x4003b8`) iterates 20 times; each iteration applies a sequence of `ror`, `eor`, `mul`, and table-driven operations to a 96-byte state array initialised from hardcoded `.rodata` data, then indexes into the base32 alphabet to emit one character.

The third and fourth seals are similarly derived: a hash accumulator walks the user-supplied first seal bytes against `.rodata` constants, and the low nibbles of the resulting 64-bit value are hex-encoded.

Since all seeds are hardcoded, the correct composite is **fully static**: it does not depend on runtime state or the user's own input at any point before the final comparison. We can recover it by emulation.

---

## Solve

### Approach

Run the binary under Unicorn (ARM64 emulator) with a dummy 51-char input, halt execution immediately after the PRNG loop fills the expected-composite buffer, and read the answer directly from the stack. Then replay it as real input.

### Implementation

```python
from unicorn import *
from unicorn.arm64_const import *

with open("whispering_feather", "rb") as f:
    raw = bytearray(f.read())

mu = Uc(UC_ARCH_ARM64, UC_MODE_ARM)
mu.mem_map(0x400000, 0x4000)
mu.mem_write(0x400000, bytes(raw[0x10000:0x10000 + 0x2158]))

STACK_BASE = 0x7fff0000
mu.mem_map(STACK_BASE, 0x20000)
SP = STACK_BASE + 0x20000 - 0x2000
mu.reg_write(UC_ARM64_REG_SP, SP)

input_data = b"ABCD-AAAAAAAAAAAAAAAAAAAA:aaaaaaaa:aaaaaaaaaaaaaaaa\n"
input_pos = [0]

def hook_intr(mu, intno, ud):
    w8 = mu.reg_read(UC_ARM64_REG_X8)
    x1 = mu.reg_read(UC_ARM64_REG_X1)
    x2 = mu.reg_read(UC_ARM64_REG_X2)
    if w8 == 0x40:                              # write: suppress
        mu.reg_write(UC_ARM64_REG_X0, x2)
    elif w8 == 0x3f:                            # read: feed dummy
        inp = input_data[input_pos[0]:input_pos[0] + x2]
        input_pos[0] += len(inp)
        if inp:
            mu.mem_write(x1, inp)
        mu.reg_write(UC_ARM64_REG_X0, len(inp))
    elif w8 == 0x5d:                            # exit
        mu.emu_stop()

mu.hook_add(UC_HOOK_INTR, hook_intr)

# Halt right after the PRNG loop writes the null terminator (0x4005e0)
mu.emu_start(0x400000, 0x4005e0, timeout=10 * UC_SECOND_SCALE)

sp = mu.reg_read(UC_ARM64_REG_SP)
composite = bytes(mu.mem_read(sp + 0x220, 51))
print(composite.decode())
# wing-CSBWUGKJGUHGSGJ4F5XB:037413d7:7b456423ebd50c2f
```

### Extracting the expected composite

```
wing-CSBWUGKJGUHGSGJ4F5XB:037413d7:7b456423ebd50c2f
```

### Replaying it for the flag

Feed the recovered composite as real input, allow the shellcode to execute:

```python
input_data = b"wing-CSBWUGKJGUHGSGJ4F5XB:037413d7:7b456423ebd50c2f\n"
# ... same emulator setup, plus mmap handler, run to exit ...
```

Output:

```
== WHISPERING FEATHER ==
Present the three seals: [+] seals aligned; selecting a handler...
KaliTeam{p0lyg1ot_b3h1nd_th3_m1rr0r}
```

---

## Flag

```
KaliTeam{p0lyg1ot_b3h1nd_th3_m1rr0r}
```

The name is apt: the binary presents a mirrored surface of decoy strings while the actual flag hides behind a polyglot of custom base32, hex encoding, deterministic PRNG, and a self-decrypting shellcode payload.
