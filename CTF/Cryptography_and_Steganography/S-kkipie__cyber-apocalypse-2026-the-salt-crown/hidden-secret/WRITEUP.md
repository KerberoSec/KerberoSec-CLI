# HTB Crypto: "Hidden Secret" (challenge 73604)

**SOLVED.** Flag: `HTB{too_few_samples_too_much_lattice_42874424b5e32fabd174491e1ba6cc85}`

Two stages: (1) a degree-4 linearization turns the problem into an orthogonal-lattice
instance whose LLL recovers 53 hidden quartic relations `K`; (2) a *germ* computation
turns `K` into the parameter `x` by pure linear algebra.

---

## 1. The challenge

```python
bits, samp, deg = 8192, 7, 40

p = getPrime(bits)
x = secrets.randbelow(p)
a = secrets.randbelow(p)
arr = []
for _ in range(samp):                       # 7 samples
    tot = 0
    for j in range(deg):                    # 40 terms
        tot += a * pow(x, j, p) * (1 - secrets.randbelow(3))   # coefficient in {-1,0,1}
    tot %= p
    arr.append(tot)

key = sha256(str(x)).digest()               # AES-ECB key
```

Published: `p`, `arr` (7 values), `encflag` (80 bytes). Secret: `x`.

### Mathematical model

Writing `f_i` for the trit polynomial of sample `i`:

```
arr_i = a · f_i(x)  mod p ,   f_i ∈ {-1,0,1}[X],  deg f_i < 40,  i = 0..6
```

So this is a **hidden subset-sum problem with a geometric weight sequence**: the hidden
weights are `α_j = a·x^j` (j = 0..39) and the coefficient matrix `C ∈ {-1,0,1}^{7×40}`.

Uniqueness: the trit matrix carries `280·log2(3) ≈ 444` bits, while the 7 samples impose
5 excess conditions of ~8192 bits each, so `(C, a, x)` is unique with overwhelming
probability.

### Why the textbook attacks do not apply

* **Nguyen-Stern / orthogonal lattice (hidden subset sum)** needs #samples > #weights.
  Here 7 < 40, so the orthogonal lattice of `{u : u·arr ≡ 0}` is a generic rank-7 lattice
  (λ₁ ≈ p^{1/7} = 2^1170) with no unusually short vectors.
* Every *linear* relation one can write down needs the unknown weights `a·x^j`, so no
  lattice can be built directly.
* Only ratios help: `arr_i·f_0(x) ≡ arr_0·f_i(x)`, still containing the unknown `x^j`.

---

## 2. Step 1: degree-4 linearization + orthogonal lattice

The only **x-free** relations come from raising the samples to a power. For a degree-`d`
monomial in the samples,

```
arr^m = a^d · P_m(x),      P_m = Π_{i∈m} f_i ,  deg P_m ≤ 39d
```

so degree-`d` monomials are combinations of `39d+1` hidden weights `a^d x^k`:

| d | #monomials `C(d+6,6)` | #weights `39d+1` | relations |
|---|---|---|---|
| 1 | 7   | 40  | none |
| 2 | 28  | 79  | none |
| 3 | 84  | 118 | none |
| **4** | **210** | **157** | **53** |

Degree 4 is minimal. Geometrically: the curve `t ↦ (f_0(t):…:f_6(t)) ⊂ P^6` has degree 39
and its ideal starts in degree 4.

So with `V_m = Π_{i∈m} arr_i mod p` (210 values), there is a rank-53 lattice
`K = {λ ∈ Z^210 : λ^T Q = 0}` (Q = the 210×157 coefficient matrix) with
`λ·V ≡ 0 mod p`, and K's vectors are far shorter than generic ones.

### Why `bits = 8192`: the design point

Measured on random trit instances:

```
λ1(K)               ≈ 2^24.7
Gaussian heuristic of {λ : λ·V ≡ 0 mod p}, dim 210, det p  ≈ 2^40.8
```

The gap only exists because `p` is huge: the attack needs `bits ≳ 210·24.7 ≈ 5200`.
At 4096 bits it fails; 8192 is the next power of two. **This confirms the intended attack.**

### Execution

```
build_lat.py   # 210-dim basis of {λ : λ·V ≡ 0 mod p}
runlll.py      # fpylll LLL
```

LLL finished in **262 s** and the profile is exactly as predicted:

```
log2 norms: [25]*53  then  49, 49, 49, ...      <-- clean cliff at 53
```

Verified exactly: all 53 vectors satisfy `λ·V ≡ 0 (mod p)`.
The same pipeline was re-run on a self-generated instance (own `x`,`a`,`f`, same `p`)
and reproduced the identical profile (53 vectors at 2^26), so step 1 is robust.

**Artifacts:** `lll_out.txt` (first 53 rows = K), `val_lll_out.txt` (validation instance).

---

## 3. Step 2: recovering `x` from K: what does NOT work

Knowing K is equivalent to knowing `W = K^⊥` = the span of the 157 coefficient columns
`q_k` of Q, where

```
q_k[m] = [X^k] Π_{i∈m} f_i ,      V = a^4 · Σ_k x^k q_k
```

If the actual columns `q_k` were known, everything follows: `q_k` determines the trit
column `φ_k = (c_{i,k})_i` uniquely, and then
`x = root of arr_1·f_0(T) − arr_0·f_1(T) mod p` (a degree-39 gcd).

### 3a. Nguyen-Stern step 2 does not transfer

In NS the columns of the hidden matrix are 0/1 and hence the shortest vectors of `W`.
Here the columns have a *profile*:

```
||q_0||=3.9  ||q_1||=11.8  ||q_5||=57  ||q_10||=207  ||q_20||=668
||q_39||=1616  ||q_78||=2867          GH(W) ≈ 776
```

Only the extreme columns are short; the middle ones are above the Gaussian heuristic.
LLL on `W` returned a reduced basis containing only **2 of 157** true columns.
Checked at degrees 4, 5 and 6: the middle columns are always 1-3 bits above GH.

### 3b. Coefficient peeling has an intrinsic 2-dimensional gauge

Peeling `φ_0, φ_1, …` level by level (test: `q_k ⊥ K`, enumerate 3^7 trit candidates) works,
but the level-`k` test only determines `φ_k` **modulo the kernel**

```
N = { φ : T(φ) ⊥ K } = span{ φ_0 , φ_1 }
```

because `T(φ_0) = 4·q_0` and `T(φ_1) = q_1` are themselves columns. This kernel is
intrinsic (it is the same at every level and for every linearization degree). It is exactly
the group of symmetries of a *parametrised* curve:

* `φ → λ(t)·φ`: rescaling by a scalar series (shear by `φ_0`),
* `φ → φ∘ψ`: reparametrisation (shear by `φ_1`).

Both preserve all columns `0..39`; only the **high columns (k ≥ 40)** distinguish the true
polynomial, and those require *all 40* coefficients: i.e. the check only fires at the leaves.

Measured branching (exact integer arithmetic, real instance):

```
level:      1     2     3     4      5      6      7      8       9       10
branches:   5    17    79   261   1173   3899  17677  58609  265239  879155
```

≈ **3.87 per level ⇒ ~10^23 leaves**. Meet-in-the-middle needs ~10^11 per half: infeasible.

### 3c. Beam search does not rescue it

The 5 sibling columns at a level are `q_k`, `q_k ± 4q_0`, `q_k ± q_1`; since the deviations
are near-orthogonal, the true column is the shortest at **25/39** levels, suggesting a
norm-based beam. Measured on the validation instance (truth known), the true branch's rank
under the cumulative-‖column‖² score:

```
k=1: 1/5   k=2: 7/17   k=3: 27/77   k=4: 99/257   k=5: 475/1177 …  k=9: 87755/100000
```

The truth sits at the **median**: the score has no usable signal, because deviated
branches are themselves trit matrices with statistically identical column norms.
A width-20000 beam on the real data produced no consistent branch (105 s).

---

## 4. Step 2: the germ trick (SOLVES IT)

The blocker above was that `K` alone gives the *span* `W = span{q_0..q_156}` but not the
**filtration** `span{q_0..q_m}`. The filtration is what is needed, and it is obtained by a
cheap linear computation:

**Run the peel over `F_p` without the trit constraint.** At each level the constraint
`K·(R_k + T(g_k)) = 0` is a *linear* system for `g_k ∈ F_p^7`: solvable, with the same
2-dimensional gauge. Pick the gauge arbitrarily (seeding level 1 with a kernel vector not
proportional to `φ_0`, so that `ψ'(0) ≠ 0`). The result is a genuine parametrisation germ

```
g(s) = λ(s) · φ(ψ(s)) ,   λ(0) ≠ 0 , ψ(0) = 0 , ψ'(0) ≠ 0
```

Its quartic columns satisfy `c_n = Σ_{j≤n} β_nj q_j` with `β_nn = λ_0^4 μ_1^n ≠ 0`: **triangular with non-zero diagonal**, hence

```
span{c_0..c_n} = span{q_0..q_n}      (gauge independent!)
```

Equivalently: the *order of vanishing* of a quartic form along the curve is gauge
invariant, so any germ measures it.

Run this at both known points: start `φ_0` (t = 0) and start `φ_39` (t = ∞, the reversed
parametrisation, whose columns are `q_{156-n}`). Then solve two linear systems in the
210 quartic coefficients:

```
omega_0 :  perp to  q_1..q_156          ->  omega_0(phi(t)) = C0        (constant)
omega_1 :  perp to  q_0, q_2..q_156     ->  omega_1(phi(t)) = C1 * t    (linear)
```
Each is 156 conditions on 210 unknowns → a 54-dimensional solution space (= `K` ⊕ 1),
and the answer is independent of which representative is chosen, since `K` vanishes on
the curve. With `arr = a·φ(x)` and both forms homogeneous of degree 4 the `a^4` cancels:

```
omega_1(arr) / omega_0(arr) = (C1/C0) · x
C0 = omega_0 · q_0          (q_0 = Veronese_4(phi_0), known)
C1 = omega_1 · T(phi_1)     (phi_1 from the level-1 trit peel)
=>  x = [omega_1(arr)/omega_0(arr)] · C0/C1
```

`phi_1` needs no search: the level-1 trit candidates are `{0, ±φ_0, ±φ_1}`, and the
degenerate ones give `C1 = 0` automatically (because `T(φ_0) = 4q_0 ⊥ omega_1`), leaving
`±φ_1`. Together with the choice of which start is `t=0`, that is 4 candidates for `x`
(`x, −x, 1/x, −1/x`): decrypt each and keep the one starting `HTB{`.

**Cost:** germs ≈ 70 s, the two 156×210 eliminations mod an 8192-bit prime ≈ 740 s,
per ordering. Total run ≈ 27 min. Validated first on a self-generated instance with known
`x` (`RECOVERED TRUE x: True`, nullspace dims 54/54) and then on the challenge data.

### Why the earlier searches failed (kept for the record)

Peeling the trit coefficients directly cannot work: the level-`k` test determines `φ_k`
only modulo `N = span{φ_0, φ_1}` (because `T(φ_0) = 4q_0` and `T(φ_1) = q_1` are
themselves columns). `N` is exactly the symmetry group of a parametrised curve: rescaling by `λ(t)` and reparametrisation by `ψ(t)`, so no amount of extra relations
(degree 5, degree 6, …) shrinks it. Only the high columns `k ≥ 40` break the tie, and they
need all 40 coefficients at once. Measured branching (exact arithmetic):

```
level:      1     2     3     4      5      6      7      8       9       10
branches:   5    17    79   261   1173   3899  17677  58609  265239  879155
```

≈ 3.87 per level ⇒ ~10^23 leaves. A beam search scored by cumulative ‖column‖² does not
help either: on the validation instance the true branch sits at the *median*
(rank 475/1177 at level 5, 87755/100000 at level 9) because the deviated branches are
themselves trit matrices with statistically identical column norms.

The germ sidesteps the whole search: it never needs the trit structure at all, only the
gauge-invariant filtration.

## 5. Files

| file | purpose |
|---|---|
| `common.py` | monomial list, `Q` matrix, sample monomials |
| `build_lat.py` / `runlll.py` | step 1: lattice construction + LLL → `lll_out.txt` |
| `peel.py`, `fastpeel.py`, `beam.py` | exact / vectorised / beam coefficient peeling |
| `feas.py`, `degcheck.py` | lattice-shape estimates that pin the design point |
| `germ.py`, `invert.py` | step 2: germ, filtration, omega_0/omega_1, x |
| `finalsolve.py` | full run on the challenge data -> `FLAG.txt`, `X.txt` |
| `mkval.py`, `val_lll.py`, `tinvert.py`, `vrank.py` | end-to-end validation with known secrets |

**Caveat on tooling:** two earlier measurements were wrong and were corrected: an `int64` overflow in the fast peel (gave 5,5,25,25… instead of the true 5,17,79,261…)
and a signature-hash overflow. All numbers quoted above are from exact integer arithmetic.
