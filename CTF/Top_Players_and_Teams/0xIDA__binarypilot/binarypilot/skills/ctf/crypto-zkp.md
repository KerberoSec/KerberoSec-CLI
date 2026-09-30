---
name: crypto-zkp
description: "CTF zero-knowledge proof and advanced cryptography attacks. Groth16 broken trusted setup delta==gamma forgery, Groth16 replay with unconstrained nullifier, DV-SNARG forgery via verifier oracle, KZG pairing oracle for permutation recovery, FROST lattice threshold signature attack, MAYO post-quantum fault injection over GF(16), garbled circuits free XOR delta recovery, Shamir deterministic coefficients univariate root-finding, race condition on crypto endpoints, Z3 BPF/SECCOMP constraint solving. Triggers: 'groth16 attack', 'trusted setup', 'zkp forgery', 'kzg oracle', 'frost threshold attack', 'mayo post-quantum', 'garbled circuit', 'shamir secret sharing attack', 'zk proof forgery', 'bpf seccomp z3', 'seccomp bypass z3', 'snark attack', 'snarg oracle'."
---

# CTF Crypto: ZKP & Advanced Attacks

Groth16, KZG, FROST, MAYO, garbled circuits, Shamir.

## Install

```bash
pip install z3-solver py_ecc fastecdsa --break-system-packages
# SageMath for lattice: sage (apt)
```

---

## Phase 1: Groth16: Broken Trusted Setup

```python
from py_ecc.bn128 import G1, G2, multiply, add, pairing, neg, FQ, FQ2
from py_ecc.fields import bn128_FQ as field_modulus

# Broken setup: delta == gamma (or tau leaked)
# With delta = gamma, the proof system is completely broken

# If delta = gamma = x (the toxic waste):
# You can forge ANY statement as valid by constructing C element

# Detect broken setup: check if pairing(delta_g2, gamma_g1) == pairing(G2, G1)
# i.e., e(delta*G2, G1) == e(G2, G1) * delta means delta is unknown,
# but if server reveals relationship...

# Forgery when delta_g1 is known:
# pi = (A, B, C) where C absorbs the fake statement
# C = (A*B - alpha_g1 * beta_g2) / delta (if delta is trapdoor)

# Simpler: replay existing proof with modified public inputs
# if nullifier is unconstrained in circuit → resubmit same proof
```

---

## Phase 2: Groth16: Unconstrained Nullifier Replay

```python
# Pattern: ZK system for "I know secret s such that H(s) = commitment"
# Nullifier = s * G (should prevent replay)
# Bug: nullifier not checked in circuit → same proof accepted twice

# Check: does the verify function check nullifier uniqueness in-circuit?
# grep for "nullifier" in circuit constraints

# Exploit: capture valid proof (A, B, C), replay with different context
# If server tracks nullifiers externally but circuit doesn't enforce:
# Craft proof with known s, submit twice to double-spend / double-vote

# Z3 constraint extraction from circuit:
from z3 import *
s = z3.BitVec('s', 254)
h = z3.BitVec('h', 254)
# Model the circuit constraints as Z3 assertions
# Solve for s given commitment H(s) = h
```

---

## Phase 3: DV-SNARG Forgery via Verifier Oracle

```python
# Pattern: designated-verifier SNARG: proof only valid to specific verifier
# Oracle: verifier tells you accept/reject
# Attack: binary search / GS extraction using oracle

# If verifier leaks partial information (timing, error message):
# Use oracle to extract witness w by testing one bit at a time

def oracle_attack(target_commitment, num_bits=254):
    """Extract witness using verifier oracle with binary search."""
    w = 0
    for bit in range(num_bits - 1, -1, -1):
        # Test: is witness[bit] = 1?
        test_w = w | (1 << bit)
        proof = forge_proof_for_partial(test_w)
        if verify_oracle(proof, target_commitment):
            w = test_w
    return w

# Soundness error exploitation:
# Many SNARK schemes have soundness error ~1/p (p = field prime)
# For small statement space: just guess/brute-force with rejection sampling
```

---

## Phase 4: KZG Pairing Oracle

```python
from py_ecc.bn128 import G1, G2, multiply, pairing, add

def kzg_permutation_recovery(commitments, oracle_fn, field_prime):
    """
    KZG polynomial commitment oracle reveals evaluation at unknown point.
    Use polynomial interpolation to recover permutation.
    """
    # commitments[i] = commit(f_i(x)) where f_i is i-th polynomial
    # oracle_fn(i, z) returns f_i(z) for any z

    # Recover permutation sigma: f_sigma(i)(x) = x
    # Query oracle for each polynomial at random points
    # Match evaluations to discover permutation

    recovered = []
    test_points = [2, 3, 5, 7, 11]  # arbitrary evaluation points

    for i, commit in enumerate(commitments):
        evals = [oracle_fn(i, z) for z in test_points]
        # Lagrange interpolation to recover polynomial
        poly = lagrange_interpolate(test_points, evals, field_prime)
        recovered.append(poly)
    return recovered

def lagrange_interpolate(xs, ys, p):
    from functools import reduce
    def modinv(a, m): return pow(a, m-2, m)
    n = len(xs)
    result = [0] * n
    for i in range(n):
        num = ys[i]
        den = 1
        for j in range(n):
            if i != j:
                num = num * (0 - xs[j]) % p
                den = den * (xs[i] - xs[j]) % p
        result[i] = num * modinv(den, p) % p
    return result
```

---

## Phase 5: FROST Lattice Threshold Signature Attack

```python
# FROST: Flexible Round-Optimized Schnorr Threshold Signatures
# Vulnerability: nonce reuse across sessions with different messages
# Attack: recover private key share via lattice reduction (same as Schnorr nonce reuse)

from sage.all import *

def frost_nonce_reuse_attack(sigs, msgs, pub_key_share, q):
    """
    Given two FROST signatures with same nonce r but different messages,
    recover the secret key share.
    
    sig = (R, s) where s = r + c * x_i (mod q)
    c = H(R, msg, ...)
    """
    (R1, s1), (R2, s2) = sigs
    c1 = hash_to_scalar(R1, msgs[0])
    c2 = hash_to_scalar(R2, msgs[1])

    # s1 - s2 = (c1 - c2) * x_i (mod q)
    x_i = (s1 - s2) * pow(c1 - c2, -1, q) % q
    return x_i

# For n signatures with biased nonces (HNP):
# Build lattice, find short vector → recover key
# See ctf-crypto-lattice for HNP/LLL setup
```

---

## Phase 6: MAYO Post-Quantum Fault Injection

```python
# MAYO: signature scheme over GF(16) (multivariate quadratic)
# Vulnerability: fault in signing → two equations for same variable

def gf16_solve_system(eq1, eq2, target1, target2):
    """
    MAYO fault: same ephemeral used twice with different faults.
    Recover secret key bytes via GF(16) system.
    """
    GF16 = GF(2**4, 'a')

    for s in GF16:  # brute force over GF(16) is trivial (16 elements)
        if eq1(s) == GF16(target1) and eq2(s) == GF16(target2):
            return s

def mayo_fault_attack(sig_normal, sig_faulted, public_key):
    """
    Differential fault analysis on MAYO oil variables.
    Two signatures on same message → different oil vector → solve.
    """
    # For each pair of equations from the two signatures:
    # P_i(o_1,...,o_k, v_1,...,v_v) = 0 (normal)
    # P_i(o_1',...,o_k', v_1,...,v_v) = 0 (faulted, different oil)
    # Subtraction cancels common terms → linear system in Δo

    delta_o = sig_normal['oil'] - sig_faulted['oil']
    # Solve linear system → oil variables → private key
    pass
```

---

## Phase 7: Garbled Circuits: Free XOR Delta Recovery

```python
# Free XOR optimization: wire labels differ by global delta
# W_i^1 = W_i^0 XOR delta  for all wires i
# Attack: learn two labels for same wire → recover delta → forge all labels

def recover_delta(label0, label1):
    """If you obtain both garbled labels for any wire, delta is revealed."""
    delta = label0 ^ label1
    return delta

def forge_garbled_label(label0, delta, bit_value):
    """With delta, create label for any wire at any value."""
    return label0 if bit_value == 0 else label0 ^ delta

# Where to get two labels:
# - Input wires where you choose the input (selective leakage)
# - OT protocol flaw: can observe both messages
# - Memory side channel on garbler

# With delta: compute output wire label → determine circuit output
# without evaluating → predict secret value
```

---

## Phase 8: Shamir Deterministic Coefficients

```python
from sage.all import *

def shamir_deterministic_attack(shares, p, threshold):
    """
    If Shamir coefficients are deterministic (not random),
    use univariate root-finding to recover secret without enough shares.
    Pattern: coefficients a_1,...,a_{t-1} are H(secret, 1),...,H(secret, t-1)
    """
    # Reconstruct polynomial from t-1 shares (not enough normally)
    # But with deterministic coefficients: iterate over secret candidates

    PR = PolynomialRing(GF(p), 'x')
    x = PR.gen()

    for secret_candidate in range(0, 2**32):  # or known range
        # Recompute deterministic polynomial
        coeffs = [secret_candidate] + [
            deterministic_coeff(secret_candidate, i)
            for i in range(1, threshold)
        ]
        poly = sum(c * x**i for i, c in enumerate(coeffs))

        # Check against known shares
        if all(poly(xi) == yi for xi, yi in shares):
            return secret_candidate

    return None

# Simpler: if only 1 share is known and polynomial is degree 1:
# y = secret + a_1 * x  (mod p)
# a_1 = H(secret): iterate candidates, check
```

---

## Phase 9: Z3 BPF/SECCOMP Solving

```python
from z3 import *

def solve_seccomp_filter(bpf_program, target_result):
    """
    BPF filter checks syscall args. Find valid arg values to pass.
    Typically: filter returns ALLOW if complex condition on args is met.
    """
    # Represent BPF registers as Z3 bitvectors:
    A = BitVec('A', 32)    # accumulator
    X = BitVec('X', 32)    # index register
    M = [BitVec(f'M{i}', 32) for i in range(16)]  # memory

    solver = Solver()

    # Translate BPF instructions to Z3 constraints:
    # LD  → A = [offset in struct]
    # ADD → A = A + k
    # JEQ → if A == k: goto true_branch else goto false_branch
    # RET → return A

    # Example: seccomp filter for write() with fd check:
    fd = BitVec('fd', 64)
    buf = BitVec('buf', 64)
    count = BitVec('count', 64)

    # Filter allows: fd < 3 AND count < 0x1000
    solver.add(ULT(fd, 3))
    solver.add(ULT(count, 0x1000))

    if solver.check() == sat:
        m = solver.model()
        return m[fd].as_long(), m[buf].as_long(), m[count].as_long()
    return None

# For SECCOMP-BPF in CTF:
# Dump filter: seccomp-tools dump ./binary (after triggering)
# Or: /proc/<pid>/seccomp → parse with seccomp-tools
# Then: seccomp-tools asm seccomp.txt → constraints → Z3
```

---

## Output

Save to `.omop/engagement/ctf/crypto/zkp/`:
- `solve.py`: attack script
- `flag.txt`: recovered value

## Next Phase

→ `ctf-crypto-ecc` for elliptic curve attacks (DLP, ECDSA nonce)
→ `ctf-crypto-lattice` for LLL/BKZ lattice reduction
