# CLCG Crypto

---

## Challenge:

Le générateur est la **somme de 8 LCG affines** modulo un premier $p$ de 256 bits :

Pour $i=1..8$ :

$$
X_{t+1}^{(i)} \equiv a_i X_t^{(i)} + c_i \pmod p.
$$

Somme interne :

$$
S_t \equiv \sum_{i=1}^8 X_t^{(i)} \pmod p,\quad 0 \le S_t < p < 2^{256}.
$$

Fuite publiée (64 MSB) :

$$
Y_t = \left\lfloor \frac{S_t}{2^{192}} \right\rfloor \in [0,2^{64}-1].
$$

Le chiffrement utilise AES-CBC avec la clé :

$$
\text{key} = \mathrm{MSB}_{64}\!\left(S_{37}\right) \ \| \ \mathrm{MSB}_{64}\!\left(S_{38}\right).
$$

**Code du chall :**
```python
from Crypto.Util.number import getPrime
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad
from secrets import randbelow, token_bytes
import json

with open('flag.txt') as f:
    flag = f.read().strip()

class CLCG:
    
    def __init__(self, length):
        self.p = getPrime(256)
        self.A = [randbelow(self.p) for _ in range(length)]
        self.C = [randbelow(self.p) for _ in range(length)]
        self.X = [randbelow(self.p) for _ in range(length)]
    
    def rand(self):
        self.X = [(a * x + c) % self.p for a, x, c in zip(self.A, self.X, self.C)]
        return int.to_bytes((sum(self.X) % self.p) >> 192, 8)

NUM_HINTS = 36

clcg = CLCG(8)
data = dict()
data['p'] = clcg.p
data['A'] = clcg.A
data['hints'] = [clcg.rand().hex() for _ in range(NUM_HINTS)]

key = clcg.rand() + clcg.rand()
iv = token_bytes(16)
cipher = AES.new(key, AES.MODE_CBC, iv=iv)
data['iv'] = iv.hex()
data['ct'] = cipher.encrypt(pad(flag.encode(), 16)).hex()

print(json.dumps(data))
```

---

## Vulnerability:

### Polynôme caractéristique et récurrence d’ordre 9

Si $E$ est l’opérateur de décalage $(Ef)_t=f_{t+1}$, alors pour une suite affine $X_{t+1}=aX_t+c$ :

$$
(E-1)(E-a)\,X \equiv 0 \pmod p.
$$

La somme de 8 suites affines est donc annihilée par

$$
P(E) = (E-1)\prod_{i=1}^8 (E-a_i),
$$

d’où une **récurrence homogène d’ordre 9** pour $S_t$ :

$$
\sum_{k=0}^{9} c_k\, S_{t+k} \equiv 0 \pmod p,\qquad
P(x)=\sum_{k=0}^{9} c_k x^k,\ \ c_9=1.
$$

### Des MSB aux intervalles bornés (HNP)

Chaque fuite $Y_t$ borne $S_t$ dans un intervalle de taille $2^{192}$ :

$$
S_t \in \big[\,Y_t \cdot 2^{192},\ (Y_t+1)\cdot 2^{192}-1\,\big].
$$

On obtient ainsi un **système linéaire modulo $p$** (27 équations pour $t=1..27$) avec **contraintes d’intervalle** pour $S_1..S_{36}$.  
En le réduisant à un problème de **CVP dans un réseau** (famille *Hidden Number Problem*), LLL + arrondi permettent de retrouver **univoquement** $(S_1,\dots,S_{36})$.

*Bref :* la récurrence impose une forte redondance temporelle, donc 36 fuites (64 MSB) suffisent pour retrouver les 36 valeurs complètes modulo \(p\).

---

## Recover the key

Une fois $S_1..S_{36}$ trouvés, on propage la récurrence :

$$
S_{t+9} \equiv -\sum_{k=0}^{8} c_k\, S_{t+k} \pmod p.
$$

On calcule $S_{37}$ (depuis $S_{28..36}$ puis $S_{38}$ (depuis $S_{29..37}$), et on prend les MSB 64 bits :

$$
\text{key} = \big\lfloor S_{37}/2^{192}\big\rfloor \ \| \ \big\lfloor S_{38}/2^{192}\big\rfloor.
$$

Enfin on déchiffre l’AES-CBC avec l’`iv` fourni.

---

## Solve:

### `a.sage`

```python
from sage.all import *
import json
from binascii import unhexlify

from linineq import solve_bounded_mod, LLL, rounding_cvp, PPL
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad

with open('out.txt','r') as f:
    data = json.load(f)

ZZ = IntegerRing()
p = ZZ(data["p"])
A = [ZZ(a) for a in data["A"]]
Y = [ZZ(int(h, 16)) for h in data["hints"]]
iv = unhexlify(data["iv"])
ct = unhexlify(data["ct"])

N = 36                 
Bshift = ZZ(1) << 192    

R = GF(int(p))['x']; x = R.gen()
P = x - R(1)
for a in A:
    P *= (x - R(int(a)))
coeffs = [int(c) for c in P.list()]   # c0 + c1 x + ... + c9 x^9, with c9 = 1
assert len(coeffs) == 10 and coeffs[-1] == 1

rows = []
for t in range(1, N - 9 + 1):  # t=1..27
    row = [ZZ(0)] * N
    base = t - 1
    for k in range(10):
        j = base + k
        c = ZZ(coeffs[k] % p)
        if c > p//2:
            c -= p
        row[j] = c
    rows.append(row)

M = matrix(ZZ, rows)              # 27 x 36
b = [ZZ(0)] * M.nrows()           # RHS = 0
lb = [Y[i] * Bshift for i in range(N)]
ub = [(Y[i] + 1) * Bshift - 1 for i in range(N)]

print("[*] solve mod p on S_t...")
S_list = solve_bounded_mod(M, b, lb, ub, int(p),
                           reduce=LLL, cvp=rounding_cvp, solver=PPL)

S = [ZZ(s) % p for s in S_list]   # S_1..S_36 in [0,p)

def msb64(z): return int(ZZ(z) >> 192)
for i in range(N):
    if msb64(S[i]) != int(Y[i]):
        print(f"[!] MSB mismatch at t={i+1}  expected={int(Y[i]):016x}  obtained={msb64(S[i]):016x}")
        raise SystemExit(1)

def next_S(win9):
    # S_{t+9} ≡ - sum_{k=0..8} c_k S_{t+k} (mod p)
    acc = ZZ(0)
    for k in range(9):
        acc += ZZ(coeffs[k]) * ZZ(win9[k])
    return int((-acc) % p)

S37 = next_S(S[27:36])                 # from S_28..S_36
S.append(S37)
# S_38 use S_29..S_37
acc = ZZ(0)
for k in range(8):                      # k=0..7 -> S_29..S_36
    acc += ZZ(coeffs[k]) * ZZ(S[28+k])
acc += ZZ(coeffs[8]) * ZZ(S37)          # k=8 -> S_37
S38 = int((-acc) % p)
S.append(S38)

k1 = (ZZ(S37) >> 192) & ((1<<64)-1)
k2 = (ZZ(S38) >> 192) & ((1<<64)-1)
key = int(k1).to_bytes(8, 'big') + int(k2).to_bytes(8, 'big')

print("[+] key =", key.hex())
```

### `b.py`

```python
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import json

output = json.load(open('out.txt'))
iv = bytes.fromhex(output['iv'])
ct = bytes.fromhex(output['ct'])

key = bytes.fromhex("31842cfe63a337495f6e91f7b84ef05d")

cipher = AES.new(key, AES.MODE_CBC, iv=iv)
decrypted_padded = cipher.decrypt(ct)
flag = unpad(decrypted_padded, 16)  
print(f"flag: {flag.decode()}")
```

---

## Output:

```
$ sage a.sage
[*] solve mod p on S_t...
[+] key = 31842cfe63a337495f6e91f7b84ef05d

$ python3 b.py
flag: ictf{y3t_an07h3r_lcg_ch411_7b24ac314588057bfd4b70b10585a277}
```

[linieq](https://github.com/TheBlupper/linineq/)

