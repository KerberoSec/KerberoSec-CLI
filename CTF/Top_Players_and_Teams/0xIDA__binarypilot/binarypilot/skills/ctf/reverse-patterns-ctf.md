---
name: reverse-patterns-ctf
description: "CTF-specific reverse engineering patterns. Hidden opcode crypto key capture, image XOR mask via smoothness, RC4 parameter extraction, Z3 VM constraint solving, Sprague-Grundy Nim strategy, block cipher zero diffusion, meet-in-middle hash inversion, kernel ioctl maze, recursive process counter, RWX shellcode detection. Triggers: 'ctf reverse patterns', 'crypto key capture', 'image xor brute', 'z3 constraint', 'sprague grundy', 'meet in middle hash', 'ioctl maze', 'reverse patterns', 'hidden opcode', 'xor image recovery'."
---

# CTF Reverse: Competition Patterns

Crypto key hooks, image XOR, Z3 constraints, meet-in-middle, kernel ioctl.

---

## Phase 1: Hidden Opcode / Crypto Key Capture

```bash
# Pattern: binary triggers crypto via unusual opcode or signal
# Key: hook the crypto function to capture key before use

# LD_PRELOAD hook on known crypto function:
cat > hook.c << 'EOF'
#include <stdio.h>
#include <string.h>
#define __USE_GNU
#include <dlfcn.h>

void AES_set_encrypt_key(const unsigned char *key, int bits, void *key_sched) {
    fprintf(stderr, "AES key captured (%d bits): ", bits);
    for(int i = 0; i < bits/8; i++) fprintf(stderr, "%02x", key[i]);
    fprintf(stderr, "\n");
    
    // Call real function:
    void (*real_func)(const unsigned char*, int, void*) = dlsym(RTLD_NEXT, "AES_set_encrypt_key");
    real_func(key, bits, key_sched);
}
EOF
gcc -shared -fPIC -ldl -o hook.so hook.c
LD_PRELOAD=./hook.so ./binary

# Frida version:
# Session.setExceptionHandler('*'); Interceptor.attach(Module.findExportByName(null, "AES_set_encrypt_key"), { onEnter(args) { console.log(args[0].readByteArray(args[1].toInt32()/8).toString()); }});
```

---

## Phase 2: Image XOR Mask Brute Force

```python
# Pattern: image XOR'd with unknown key → brute force by smoothness
# Key insight: XOR with wrong key → noisy; correct key → smooth image

from PIL import Image
import numpy as np

def smoothness_score(img_array):
    """Higher score = smoother = more likely correct."""
    diff_h = np.abs(img_array[:, 1:].astype(int) - img_array[:, :-1].astype(int))
    diff_v = np.abs(img_array[1:, :].astype(int) - img_array[:-1, :].astype(int))
    return -(np.mean(diff_h) + np.mean(diff_v))

img = np.array(Image.open('encrypted.png'))

best_score = float('-inf')
best_key = None

# For each possible 1-byte XOR key:
for key in range(256):
    candidate = img ^ key
    score = smoothness_score(candidate)
    if score > best_score:
        best_score = score
        best_key = key

print(f"Best key: 0x{best_key:02x}")
result_img = Image.fromarray(img ^ best_key)
result_img.save('decrypted.png')
```

---

## Phase 3: RC4 Static Parameter Extraction

```bash
# RC4 in binary: find S-box initialization or key scheduling

# Strings that look like RC4 keys:
strings ./binary | awk 'length($0) >= 16 && length($0) <= 256 && /^[[:print:]]+$/' | head -20

# In Ghidra: search for RC4 key schedule pattern
# KSA: for i in 0..255: S[i] = i
# Find: loop initializing 256-element array with values 0..255

# GDB: find the key at the moment KSA is called
gdb ./binary
(gdb) b *0x401234  # address of KSA function
(gdb) r
(gdb) x/32s $rdi   # key pointer in first argument
```

---

## Phase 4: Z3 VM Constraint Solving

```python
# Pattern: custom VM validates password via series of operations
# Z3 can solve constraint systems for valid input

from z3 import *

# Create symbolic input:
password = [BitVec(f'p_{i}', 8) for i in range(32)]
s = Solver()

# Add constraints from VM trace:
# Example: VM XORs bytes, adds constants, checks sums

# Constraints from reversing:
s.add(password[0] ^ password[1] == 0x42)
s.add(password[2] + password[3] == 0x85)
s.add(password[0] >= 0x20, password[0] <= 0x7e)  # printable

# Solve:
if s.check() == sat:
    model = s.model()
    flag = ''.join(chr(model[p].as_long()) for p in password)
    print(f"Flag: {flag}")
else:
    print("Unsatisfiable")

# For multi-path VM: trace execution with concrete input,
# extract comparison operations → formulate as Z3 constraints
```

---

## Phase 5: Sprague-Grundy Nim Strategy

```python
# Pattern: CTF game theory challenge (Nim variants)
# Sprague-Grundy theorem: compute nimber for each position

def grundy(state, memo={}):
    """Compute Grundy value (nimber) for game state."""
    if state in memo:
        return memo[state]
    
    # Generate all possible moves from this state:
    moves = set()
    for move in generate_moves(state):
        moves.add(grundy(apply_move(state, move), memo))
    
    # Grundy value = mex (minimum excludant) of reachable values:
    mex = 0
    while mex in moves:
        mex += 1
    
    memo[state] = mex
    return mex

# For multi-pile Nim: XOR all pile sizes
def nim_strategy(piles):
    """Return winning move or None if losing position."""
    nim_sum = 0
    for pile in piles:
        nim_sum ^= pile
    
    if nim_sum == 0:
        return None  # Losing position: opponent wins with perfect play
    
    # Find move: reduce pile so nim_sum becomes 0
    for i, pile in enumerate(piles):
        target = pile ^ nim_sum
        if target < pile:
            return (i, pile - target)  # Remove (pile-target) from pile i
    return None
```

---

## Phase 6: Block Cipher Zero Diffusion Attack

```python
# Pattern: block cipher with zero cross-byte diffusion
# Input byte N only affects output byte N (no mixing)

# Detect: encrypt bytes individually
def detect_zero_diffusion(oracle):
    """Test if byte positions are independent."""
    base = oracle(b'\x00' * 16)
    
    for pos in range(16):
        test = bytearray(b'\x00' * 16)
        test[pos] = 0x01
        ct = oracle(bytes(test))
        
        changed = [i for i in range(16) if ct[i] != base[i]]
        print(f"Byte {pos} affects: {changed}")
        
        if len(changed) == 1 and changed[0] == pos:
            print(f"VULNERABLE: Zero cross-byte diffusion at position {pos}")

# Exploit: decrypt byte-by-byte without key
def decrypt_zero_diffusion(ciphertext, oracle):
    plaintext = bytearray(len(ciphertext))
    for pos in range(len(ciphertext)):
        for b in range(256):
            test = bytearray(len(ciphertext))
            test[pos] = b
            ct = oracle(bytes(test))
            if ct[pos] == ciphertext[pos]:
                plaintext[pos] = b
                break
    return bytes(plaintext)
```

---

## Phase 7: Meet-in-the-Middle Hash Inversion

```python
# Pattern: target = H(H(H(...H(seed)...))) with known output
# MITM reduces 95^6 → 2×95^3

import hashlib

def mitm_hash_preimage(target_hash, depth, charset):
    """Find input: H^depth(input) = target."""
    import itertools
    
    n = depth // 2
    
    # Forward: compute all H^n(x) for all x
    forward = {}
    for combo in itertools.product(charset, repeat=n):
        inp = ''.join(combo).encode()
        h = hashlib.md5(inp).hexdigest()
        for _ in range(n - 1):
            h = hashlib.md5(h.encode()).hexdigest()
        forward[h] = inp
    
    # Backward: compute H^(depth-n)(y) = target, find y in forward
    # Work backwards: find y such that H^n(y) is in forward
    for combo in itertools.product(charset, repeat=depth-n):
        inp = ''.join(combo).encode()
        h = hashlib.md5(inp).hexdigest()
        for _ in range(depth - n - 1):
            h = hashlib.md5(h.encode()).hexdigest()
        if h == target_hash and inp.decode() in forward:
            return forward[h] + inp
    
    return None

charset = [chr(c) for c in range(32, 127)]  # ASCII printable
result = mitm_hash_preimage("abc123...", depth=6, charset=charset)
```

---

## Phase 8: Kernel Module Maze / ioctl Navigation

```python
from ctypes import cdll, c_int, c_ulong, CDLL

# Pattern: kernel module with ioctl interface
# Each ioctl call = one maze step; navigate to find flag

import fcntl, struct

def ioctl_call(fd, cmd, data=0):
    """Call ioctl on device file."""
    buf = struct.pack('I', data)
    result = fcntl.ioctl(fd, cmd, buf)
    return struct.unpack('I', result)[0]

# Enumerate valid ioctl commands:
DEVICE = '/dev/challenge'
fd = open(DEVICE, 'rb')

for cmd in range(0, 256):
    try:
        result = ioctl_call(fd.fileno(), cmd)
        print(f"ioctl {cmd}: {result}")
    except OSError:
        pass

# BFS maze solution:
from collections import deque

def solve_maze(fd, start_state, goal_cmd):
    visited = {start_state}
    queue = deque([(start_state, [])])
    
    while queue:
        state, path = queue.popleft()
        
        for direction in [1, 2, 3, 4]:  # ioctl commands for N/S/E/W
            new_state = ioctl_call(fd.fileno(), direction)
            if new_state == GOAL_STATE:
                return path + [direction]
            if new_state not in visited:
                visited.add(new_state)
                queue.append((new_state, path + [direction]))
    return None
```

---

## Output

Save to `.omop/engagement/ctf/reverse/`:
- `z3_solution.py`: constraint solver
- `decrypted.png`: XOR-decrypted image
- `flag.txt`: found flag

## Next Phase

→ `ctf-reverse-dynamic` for dynamic analysis
→ `ctf-reverse-tools-advanced` for VMProtect/Triton
