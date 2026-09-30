---
title: Field Trip: Diffie-Hellman over 𝔽₂²²⁴ (Pohlig-Hellman)
tags: crypto,ctf,writeup,discrete-log,finite-field
---

# Field Trip: Diffie-Hellman over 𝔽₂²²⁴ (Pohlig-Hellman)

> **TL;DR**  
> The multiplicative group \( \mathbb{F}_{2^{224}}^\* \) has order \(N=2^{224}-1\) which **fully factors** into small/medium primes plus one ~48-49-bit prime. This makes \(a=\log_g A\) recoverable via **Pohlig-Hellman** (BSGS for small factors, Pollard’s Rho for the big prime). Then compute \(K=B^a\), derive the AES key with SHA-256, and decrypt.  
> **Flag:** `ENO{1t_i5_no1_th3_fi3ld_5iz3_th4t_c0unts}`

We want $(a=\log_g A \pmod N$.

For **each prime** $p\mid N$:

1. **Reduce to the subgroup of order \(p\)**:
   $g_1 = g^{N/p}, \quad h_1 = A^{N/p}.$
   Then $\langle g_1\rangle$ has order exactly $p$, and we need $g_1^{x_p}=h_1$ in $\mathbb{Z}/p\mathbb{Z}$.

2. **Solve DLP in the order-\(p\) subgroup**:
   - For small/medium $p$: **BSGS** (baby-step/giant-step), $O(\sqrt{p})$ time, modest memory.
   - For $p = 358{,}429{,}848{,}460{,}993$ (~48-49 bits): **Pollard’s Rho for DLP** (expected $O(\sqrt{p})$ time, $O(1)$ memory).  
     A collision of the form $g_1^{a-A}=h_1^{B-b}$ gives
     $a-A \equiv x(B-b)\ (\bmod\ p)\ \Rightarrow\ x \equiv (a-A)\cdot(B-b)^{-1} \pmod p.$

3. **Recombine with CRT**:
   With all residues $x_p \equiv a \pmod p$, apply the **Chinese Remainder Theorem** to recover $a \pmod N$.

4. **Decrypt**:
   Compute $K=B^a$. The AES key is
   $\text{key}=\text{SHA-256}(\text{28-byte big-endian}(K)).$\]
   Decrypt AES-ECB \(C\) to obtain the flag.

Script:
```python=
from hashlib import sha256
from Crypto.Cipher import AES

f = 26959946667150639794667015087019630673637144422540572481103610249993
g = 7
A = 22740222493854193828995311834548386053886320984395671900304436279839
B = 13537441615011702013355237281886711701217244531581593794890884829133
enc_flag = "9946ca81ffb1a741cff186a38ecbb4ddcf0e912764413642641fab7db83278a31268b5dc13e66cd86990ab1b65b73465"

F.<x> = GF(2)[]
modulus = sum([x^i for i in range(f.bit_length()) if f & (1 << i)])

assert modulus.is_irreducible()
GF2_224.<a> = GF(2^224, modulus=modulus)

def int_to_field_element(n, field):
    poly = 0
    for i in range(n.bit_length()):
        if n & (1 << i):
            poly += x^i
    return field(poly)

g_elem = int_to_field_element(g, GF2_224)
A_elem = int_to_field_element(A, GF2_224)
B_elem = int_to_field_element(B, GF2_224)

a = discrete_log(A_elem, g_elem)
print(f"a = {a}")

K_poly = (B_elem^a).polynomial()
K = 0
coeffs = K_poly.coefficients(sparse=False)
for i, coeff in enumerate(coeffs):
    if coeff:
        K |= (1 << i)

key = sha256(K.to_bytes(28, 'big')).digest()
cipher = AES.new(key, AES.MODE_ECB)
flag = cipher.decrypt(bytes.fromhex(enc_flag))
print(flag)
```
