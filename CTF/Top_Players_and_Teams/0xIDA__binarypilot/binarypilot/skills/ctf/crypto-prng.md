---
name: crypto-prng
description: "CTF PRNG attacks. Mersenne Twister state recovery, time-seeded PRNG brute force, LCG parameter recovery, V8 Math.random XorShift128+ Z3 solver, GF(2) matrix approach. Triggers: 'prng attack', 'mersenne twister', 'random seed', 'predictable random', 'lcg attack', 'math.random crack', 'random state recovery', 'prng prediction', 'twister untemper'."
---

# CTF Crypto: PRNG Attacks

Mersenne Twister state recovery, time-seeded brute force, LCG, V8 Math.random.

---

## Phase 1: Identify PRNG Type

```python
# Python random (Mersenne Twister):
import random
# Generated: random.random(), random.randint(), random.choice()
# Internal state: 624 32-bit integers

# C rand() (LCG):
# state = state * 1103515245 + 12345
# output = (state >> 16) & 0x7fff

# JavaScript Math.random (V8 XorShift128+):
# 128-bit state, outputs doubles

# Custom PRNG (identify from source):
# LCG: x[n+1] = (a*x[n] + c) mod m
# LFSR: shift register with XOR taps
```

---

## Phase 2: Mersenne Twister State Recovery

```python
# Need: 624 consecutive 32-bit outputs (from random.getrandbits(32))

def untemper(y):
    """Reverse the Mersenne Twister temper operation."""
    # Inverse of y ^= y >> 18:
    y ^= y >> 18
    # Inverse of y ^= (y << 15) & 0xefc60000:
    y ^= (y << 15) & 0xefc60000
    # Inverse of y ^= (y << 7) & 0x9d2c5680:
    y ^= (y << 7) & 0x9d2c5680
    y ^= (y << 14) & (0x9d2c5680 & (0x9d2c5680 << 7))
    # Inverse of y ^= y >> 11:
    y ^= y >> 11
    y ^= y >> 22
    return y & 0xFFFFFFFF

# Collect 624 outputs from target:
outputs = [int(input(f"Output {i}: "), 16) for i in range(624)]

# Recover internal state:
state = [untemper(y) for y in outputs]

# Reconstruct random module state:
import random

# Inject recovered state:
state_formatted = [3, *state, 624]
random.setstate((3, tuple(state_formatted), None))

# Now predict all future outputs:
print("Next:", random.getrandbits(32))
print("Next:", random.getrandbits(32))
```

---

## Phase 3: Time-Seeded PRNG Brute Force

```python
import random, time, ctypes

# UNIX timestamp seeded:
TARGET_TOKENS = [...]    # observed tokens from target

def crack_seed_unix(tokens, window=3600):
    """Try timestamps in a window around now."""
    now = int(time.time())
    
    for seed in range(now - window, now + 1):
        random.seed(seed)
        candidate_tokens = [random.randint(0, 2**32) for _ in range(len(tokens))]
        if candidate_tokens == tokens:
            print(f"Seed: {seed} (unix timestamp)")
            return seed
    return None

# C rand() seeded (use ctypes to sync with libc):
libc = ctypes.CDLL("libc.so.6")

def crack_c_rand(target_values, window=3600):
    now = int(time.time())
    
    for seed in range(now - window, now + 1):
        libc.srand(seed)
        candidates = [libc.rand() for _ in range(len(target_values))]
        if candidates == target_values:
            print(f"C rand() seed: {seed}")
            return seed
    
# Millisecond precision from file metadata:
import os
stat = os.stat("generated_file.txt")
mtime_ms = int(stat.st_mtime * 1000)

for seed in range(mtime_ms - 100, mtime_ms + 100):
    random.seed(seed)
    # test...
```

---

## Phase 4: LCG Parameter Recovery

```python
# LCG: x[n+1] = (a * x[n] + c) mod m
# Given several consecutive outputs, recover a, c, m

def recover_lcg(outputs):
    """Recover LCG parameters from consecutive outputs."""
    n = len(outputs)
    assert n >= 4
    
    # Use differences to find modulus:
    # x[2] - x[1], x[3] - x[2], etc.
    diffs = [outputs[i+1] - outputs[i] for i in range(n-1)]
    
    from math import gcd
    from functools import reduce
    
    # t[i] = a * (x[i-1] - x[i-2]) mod m
    # t[i] - t[i-1] = ... 
    # GCD of second differences gives m (or multiple of m)
    t = [diffs[i+1] * diffs[i-1] - diffs[i]**2 for i in range(1, len(diffs)-1)]
    m = abs(reduce(gcd, t))
    
    # Recover a from consecutive outputs:
    a = (outputs[1] - outputs[0]) * pow(outputs[0], -1, m) % m
    
    # Recover c:
    c = (outputs[1] - a * outputs[0]) % m
    
    return a, c, m

# Test:
a, c, m = recover_lcg([12345, 67890, 11111, 22222, 33333])
print(f"LCG: x = ({a} * x + {c}) mod {m}")
```

---

## Phase 5: V8 Math.random (XorShift128+)

```python
# V8 XorShift128+ state: two 64-bit integers s0, s1
# Output: double from s0 + s1 (with bit manipulation)
# Need ~5-10 outputs → Z3 SMT solver

from z3 import *

def crack_v8_math_random(outputs):
    """Recover XorShift128+ state from Math.random() outputs."""
    s = Solver()
    
    # State variables:
    s0_0 = BitVec('s0_0', 64)
    s1_0 = BitVec('s1_0', 64)
    
    s0 = s0_0
    s1 = s1_0
    
    for output in outputs:
        # One XorShift128+ step:
        s1 ^= s0
        s0 = RotateLeft(s0, 55) ^ s1 ^ (s1 << 14)
        s1 = RotateLeft(s1, 36)
        
        # Expected output (V8 converts to double):
        result = (s0 + s1) & 0x000FFFFFFFFFFFFF
        
        # Constraint: output matches observed (floor'd to int):
        expected = int(output * (2**53))
        s.add(result == expected)
    
    if s.check() == sat:
        m = s.model()
        s0_val = m[s0_0].as_long()
        s1_val = m[s1_0].as_long()
        print(f"s0={hex(s0_val)}, s1={hex(s1_val)}")
        return s0_val, s1_val
    
    return None

# inputs: outputs from Math.floor(Math.random() * 2**53)
outputs = [...]  # collect from target
crack_v8_math_random(outputs)
```

---

## Phase 6: GF(2) Matrix Approach

```python
# For XOR-only PRNGs (LFSRs, MT from float outputs):
# Each output is a linear combination of state bits over GF(2)
# → Set up linear system, solve with Gaussian elimination

import numpy as np

def gf2_solve(A, b):
    """Solve Ax = b over GF(2) (Gaussian elimination)."""
    n = len(A)
    aug = np.hstack([A, b.reshape(-1, 1)]) % 2
    
    row = 0
    for col in range(n):
        pivot = None
        for r in range(row, n):
            if aug[r, col]:
                pivot = r
                break
        if pivot is None:
            continue
        aug[[row, pivot]] = aug[[pivot, row]]
        for r in range(n):
            if r != row and aug[r, col]:
                aug[r] = (aug[r] + aug[row]) % 2
        row += 1
    
    return aug[:, -1]

# For random.random() → float → 52 mantissa bits:
# Need ~3360 float observations to recover full MT state
```

---

## Output

Save to `.omop/engagement/ctf/crypto/`:
- `recovered-state.py`: PRNG state recovery script
- `predicted-values.txt`: next predicted outputs
- `flag.txt`: decrypted flag using predicted keystream

## Next Phase

→ `ctf-crypto-classic` for classical cipher attacks
→ `ctf-crypto-rsa` for RSA attacks
