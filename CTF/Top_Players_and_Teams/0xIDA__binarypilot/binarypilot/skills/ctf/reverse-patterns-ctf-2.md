---
name: reverse-patterns-ctf-2
description: "CTF reverse engineering competition patterns part 2. Multi-layer self-decrypting binary with JIT fork execution, embedded ZIP XOR license decryption, .rodata XOR blob deobfuscation, prefix hash brute-force, CVP/LLL lattice for constrained ASCII validation, decision tree function obfuscation via Ghidra headless scripting, GLSL shader VM with sequential emulation (texture bytecode), GF(2^8) Gaussian elimination for flag recovery, Z3 for single-line Python boolean circuits, sliding window popcount differential propagation, Morse code via keyboard LED ioctl, C++ destructor-hidden validation, VM sequential key-chain brute-force with OpenMP, syscall side-effect memory corruption. Triggers: 'self-decrypting binary', 'embedded zip license', 'rodata xor deobfuscation', 'cvp lattice ascii', 'decision tree obfuscation', 'glsl shader vm', 'gf28 gaussian elimination', 'z3 boolean circuit', 'popcount sliding window', 'keyboard led morse', 'cxx destructor validation', 'vm keychain brute', 'jit fork exploit'."
---

# CTF Reverse: Competition Patterns Part 2

Self-decrypting layers, lattice solving, shader VMs, GF(2^8), popcount.

---

## Phase 1: Multi-Layer Self-Decrypting Binary

```c
// Pattern: N layers (e.g., 256), each reads 2 key bytes, derives keystream via SHA-256 NI,
// XOR-decrypts next layer, jumps to it. Oracle: wrong key → garbage; correct → 2 call read@plt

// JIT execution approach: fastest (~3500/s with 32 workers):
void *text = mmap((void*)0x400000, text_size, PROT_RWX,
                  MAP_FIXED|MAP_PRIVATE, fd, 0);
void *bss  = mmap((void*)bss_addr, bss_size, PROT_RW,
                  MAP_FIXED|MAP_SHARED, shm_fd, 0);  // Shared BSS via /dev/shm

for (int candidate = 0; candidate < 65536; candidate++) {
    pid_t pid = fork();
    if (pid == 0) {
        // COW from shared BSS: child gets isolated copy
        mmap(bss_addr, bss_size, PROT_RW, MAP_FIXED|MAP_PRIVATE, shm_fd, 0);
        inject_key(candidate >> 8, candidate & 0xff);
        ((void(*)())layer_addr)();
        if (count_read_calls(next_layer_addr) == 2)
            signal_parent(candidate);
        _exit(0);
    }
}
// Speed: Python subprocess ~2/s, JIT+fork ~1000/s, JIT+shared BSS+32workers ~3500/s
```

---

## Phase 2: Embedded ZIP + XOR License Decryption

```bash
# No need to run binary: extract offline
readelf -s binary | grep -E "EMBEDDED|ENCRYPTED|LICENSE"

# Find ZIP in .rodata:
python3 -c "
data = open('binary','rb').read()
zip_start = data.find(b'PK\x03\x04')
open('embedded.zip','wb').write(data[zip_start:zip_start+384])
"
unzip embedded.zip  # → license.txt
```

```python
# XOR flag with license:
license = open('license.txt', 'rb').read()
enc_msg = open('encrypted_msg.bin', 'rb').read()
flag = bytes(a ^ b for a, b in zip(enc_msg, license))
print(flag.decode())
```

---

## Phase 3: .rodata XOR Blob Deobfuscation

```python
from elftools.elf.elffile import ELFFile

with open('binary', 'rb') as f:
    elf = ELFFile(f)
    ro = elf.get_section_by_name('.rodata')
    blob = ro.data()[offset:offset+size]

# Reimplement byte-by-byte verification loop:
# Look for constants: 0x9E3779B9 (golden ratio), 0x85EBCA6B (MurmurHash3), 0xA97288ED
# Pattern: each byte computed from running state (add, rol, xor with blob)

state = initial_state
for i in range(len(blob)):
    h1 = (state * 0x9E3779B9) & 0xFFFFFFFF
    h2 = (state ^ 0x85EBCA6B) & 0xFFFFFFFF
    expected_byte = (h1 ^ h2) & 0xFF
    input_byte = blob[i] ^ expected_byte
    # input_byte is the flag character at position i
    state = (state + input_byte) & 0xFFFFFFFF
```

---

## Phase 4: CVP/LLL Lattice for Constrained ASCII Validation

```python
from sage.all import *

def solve_constrained_matrix(coefficients, targets, char_range=(32, 126)):
    """
    Binary validates: M * input = targets (over integers)
    Input must be printable ASCII: lattice CVP finds constrained solution.
    """
    n = len(coefficients[0])
    mid = (char_range[0] + char_range[1]) // 2
    scale = 1000

    M = matrix(ZZ, n + len(targets), n + len(targets))
    for i, row in enumerate(coefficients):
        for j, c in enumerate(row):
            M[j, i] = c
        M[n + i, i] = 1
    for j in range(n):
        M[j, len(targets) + j] = scale

    target_vec = vector(ZZ,
        [t - sum(c * mid for c in row) for row, t in zip(coefficients, targets)]
        + [0] * n)

    L = M.LLL()
    closest = L * L.solve_left(target_vec)
    solution = [closest[len(targets) + j] // scale + mid for j in range(n)]
    return bytes(solution)
```

---

## Phase 5: Decision Tree Function Obfuscation

```python
# Mass function extraction with radare2 in batch mode (no Ghidra/IDA here):
#   r2 -q -c 'aaa; aflj' binary > funcs.json
# Each function's disassembly: r2 -q -c 'aaa; pdfj @ <addr>' binary
# Then walk instructions in Python via r2pipe:

import r2pipe
r = r2pipe.open("binary", flags=["-2"])
r.cmd("aaa")
for fn in r.cmdj("aflj") or []:
    name = fn["name"]
    if name.startswith("f") and name[1:].isdigit():
        insts = r.cmdj(f"pdfj @ {fn['offset']}") or {}
        for ins in insts.get("ops", []):
            if ins.get("mnemonic") == "cmp":
                print(name, ins.get("disasm"))
# Then: constraint propagation from known output (e.g., "http://HTB{")
# Fixed positions cascade through arithmetic → remaining free vars
```

---

## Phase 6: GLSL Shader VM Sequential Emulation

```python
# Pattern: WebGL2 fragment shader implements VM on 256x256 RGBA texture
# Row 0: registers; Rows 1-127: program; Rows 128-255: VRAM
# Opcodes: NOP(0), SET(1), ADD(2), SUB(3), XOR(4), JMP(5), JNZ(6), VRAM-write(7), STORE(8), LOAD(9)
# GPU parallelism causes write conflicts → must emulate sequentially

from PIL import Image
import numpy as np

img = Image.open('program.png').convert('RGBA')
state = np.array(img, dtype=np.int32).copy()
regs = [0] * 33

x, y = start_x, start_y
while True:
    r, g, b, a = state[y][x]
    opcode = int(r)
    if   opcode == 1: regs[g] = b & 255                  # SET
    elif opcode == 2: regs[g] = (regs[b] + regs[a]) & 255  # ADD
    elif opcode == 4: regs[g] = regs[b] ^ regs[a]         # XOR
    elif opcode == 7:                                       # VRAM write
        tx, ty = regs[g], regs[b]; vram[ty][tx] = regs[a]
    elif opcode == 8:                                       # STORE (patches program)
        tx, ty = regs[g], regs[b]
        state[ty][tx] = [regs[a], regs[a+1], regs[a+2], regs[a+3]]
    elif opcode == 5: x, y = b, a; continue               # JMP
    elif opcode == 6:                                       # JNZ
        if regs[g]: x, y = b, a; continue
    x += 1
    if x > 255: x, y = 0, y + 1
```

---

## Phase 7: GF(2^8) Gaussian Elimination

```python
def gf_mul(a, b, poly=0x1b):
    """Multiply in GF(2^8) with AES reduction polynomial (x^8+x^4+x^3+x+1)."""
    p = 0
    for _ in range(8):
        if b & 1: p ^= a
        hi = a & 0x80
        a = (a << 1) & 0xFF
        if hi: a ^= poly
        b >>= 1
    return p

def gf_inv(a):
    if a == 0: return 0
    for x in range(1, 256):
        if gf_mul(a, x) == 1: return x

def solve_gf28(aug, N):
    """Gaussian elimination over GF(2^8)."""
    for col in range(N):
        pivot = next((r for r in range(col, N) if aug[r][col] != 0), -1)
        if pivot != col: aug[col], aug[pivot] = aug[pivot], aug[col]
        inv = gf_inv(aug[col][col])
        aug[col] = [gf_mul(v, inv) for v in aug[col]]
        for row in range(N):
            if row == col: continue
            f = aug[row][col]
            if f == 0: continue
            aug[row] = [v ^ gf_mul(f, aug[col][j]) for j, v in enumerate(aug[row])]
    return bytes(aug[i][N] for i in range(N))

# Extract N×N matrix + augmentation from .rodata (N² bytes + N bytes)
# Look for constant 0x1b in disassembly → AES polynomial
```

---

## Phase 8: Sliding Window Popcount

```python
expected = [...]  # popcount per window position

total_bits = len(expected) + 15  # window size = 16

for start_val in range(0x10000):
    if bin(start_val).count('1') != expected[0]: continue
    bits = [(start_val >> (15 - j)) & 1 for j in range(16)] + [0] * (total_bits - 16)
    valid = True
    for i in range(len(expected) - 1):
        new_bit = bits[i] + (expected[i+1] - expected[i])
        if new_bit not in (0, 1): valid = False; break
        bits[i + 16] = new_bit
    if valid:
        flag_bytes = bytes(int(''.join(map(str, bits[i:i+8])), 2)
                          for i in range(0, total_bits, 8))
        print(flag_bytes.decode(errors='replace'))
        break
```

---

## Phase 9: VM Sequential Key-Chain Brute-Force

```c
// Pattern: each N-byte block's output feeds as key to next block
// Per-block space ~2^24 → brute-force with OpenMP

uint32_t process(uint32_t val) {
    for (int i = 0; i < 1000; i++) {
        val ^= (val << 13);
        val ^= (val >> 17);
        val ^= (val << 5);
        val *= 0x2545f491;
    }
    return val;
}

// gcc -O3 -march=native -fopenmp -o solve solve.c
int solve_block(uint32_t old_key, uint32_t expected) {
    #pragma omp parallel for
    for (int v = 0; v < 0x1000000; v++) {
        uint32_t saved = v ^ old_key;
        if ((process(saved) ^ saved) == expected) {
            // Found: output bytes from v
        }
    }
}
```

---

## Output

Save to `.omop/engagement/ctf/reverse/`:
- `solve.py` / `solve.c`: solver
- `flag.txt`: recovered flag

## Next Phase

→ `ctf-reverse-patterns-ctf` for Part 1 (hidden opcode, image XOR, Z3 VM)
→ `ctf-reverse-tools-advanced` for VMProtect, Triton DSE
