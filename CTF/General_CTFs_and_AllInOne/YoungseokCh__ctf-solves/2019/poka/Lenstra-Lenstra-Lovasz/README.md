# Lenstra-Lenstra-Lovász

> I am not good at Linear Algebra : (
> Can you tell me about Lenstra-Lenstra-Lovász lattice basis reduction algorithm?
> Add) e=151. This is for make challenge easy.
>
> [enc.txt](https://github.com/3-24/write-up/blob/master/2019/poka/Lenstra-Lenstra-Lovasz/enc.txt) [Lenstra-Lenstra-Lovász.sage](https://github.com/3-24/write-up/blob/master/2019/poka/Lenstra-Lenstra-Lovasz/Lenstra%E2%80%93Lenstra%E2%80%93Lov%C3%A1sz.sage)

### My Contribution

[diff](https://github.com/pcw109550) worked on this problem a lot. What I did was just some code review and running the sage code in my local machine.

## Notations

Before start, let's make the notations clear. 

* `n` : RSA modulus

  `p,q` : two distinct prime factor of `n`.

* `e` : RSA encryption exponent
  `d` : RSA decryption exponent

* `dp = d % (p-1)`

* `bits` : bit length of `dp`

* `shiftbits = bits//2 - bits//10`

* `ct` : ciphertext

* `s,x` : `dp = s << shiftbits + x`. i.e., `shiftbits`-length leaked `dp` is `s` and the remainder part is `x`.

Given values are `n,e,ct,s`. Of course the objective is getting the plaintext of this RSA encryption.

## Modular Arithmetics

Since $ed \equiv 1 \mod ((p-1)(q-1)) $,\
$$
ed_p \equiv 1 \mod (p-1).
$$\
Let $ed_p = 1 + (p-1)k $. Then\
$$
e(s \ll \texttt{shiftbits} + x ) = 1 + (p-1)k
$$\
## Range For `bit` and `shiftbits`

We have bit-length of `secret` which is approximately 6/10 bit-length of `dp`, which was 614. Therefore `bits` is either 1023 or 1024.

```python
for bits in range (1010,1030):
	print(bits, bits - (bits//2 - bits//10))
```

```
...
1018 610
1019 611
1020 612
1021 613
1022 613
1023 614 (*)
1024 614 (*)
1025 615
1026 615
1027 616
1028 616
...
```

Also note that $ed_p = k (p-1)+1$ and $d_p < p-1 $, so $k\le e=151$. So bound of `k` and bit-length of `dp` is reasonable.

## Polynomial Modulo `p`

We now have appropriate range for `shiftbits` and `k` to solve\
$$
e(s \ll \texttt{shiftbits} + x ) -1 + k \equiv 0 \mod p
$$\
I used `small_roots` in SageMath to use **Coppersmith's Method** to solve above this.\
$$
s \ll \texttt{shiftbits} + x + (k-1) e^{-1} \equiv 0 \mod N
$$\
Where $e^{-1}$ is modular inverse of $e$ respect to $N$.

```python
def coppersmith(shiftbits, k):
    F.<x> = PolynomialRing(Zmod(n))
    invE = inverse_mod(e, n)
    f = (s << shiftbits) + x + (k - 1) * invE   # make monic
    x0 = f.small_roots(X=2 ** shiftbits, beta=0.44, epsilon=1/32)
    return x0
```

Therefore we get`dp` and also `p` using $p = \frac {e d_p -1} k +1 $. By processing a simple RSA decryption, I could get a flag.

```
POKA{You_4r3_Crypt0_N00000B_XDD}
```

You can find the full code in [solve.sage](https://github.com/3-24/write-up/blob/master/2019/poka/Lenstra-Lenstra-Lovasz/solve.sage).
