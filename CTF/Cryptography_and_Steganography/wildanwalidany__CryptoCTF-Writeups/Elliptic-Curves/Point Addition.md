# Point Addition

Platform: Cryptohack

## Description

> We will work with the following elliptic curve, and prime: $E: Y^{2}=X^{3}+497X+1768, p:9739$
> Using the above curve, and the point $P(493, 5564)$, $Q(1539,4742)$, $R(4403,5202)$ find the point $S(x,y) = P + P + Q + R$.
> After calculating S, substitute the coordinates into the curve. Assert that the point $S$ is in $E(F_{p})$

## Solution

The Algorithm for the addition of two points in ECC follows these rules:
![ECC_addition](https://github.com/wildanwalidany/CryptoCTF-Writeups/assets/74038077/afc555fa-1b4a-45c3-8aed-ea06210bf4f4)

So we just need to implement the algorithm.

`addition.py`:

```python
from Crypto.Util.number import inverse

def pt_add(p, q, E):
    zero = (0, 0)
    if p == zero:
        return q
    elif q == zero:
        return p
    else:
        x1, y1 = p
        x2, y2 = q
        if x1 == x2 and y1 == -y2:
            return zero

        Ea, Ep = E['a'], E['p']
        if p != q:
            lmd = (y2 - y1) * inverse(x2 - x1, Ep)
        else:
            lmd = (3 * (x1**2) + Ea) * inverse(2 * y1, Ep)
        x3 = ((lmd**2) - x1 - x2) % Ep
        y3 = (lmd * (x1 - x3) - y1) % Ep
        return x3, y3

def main():
    E = {'a': 497, 'b': 1768, 'p': 9739}

    x = (5274, 2841)
    y = (8669, 740)
    assert pt_add(x, y, E) == (1024, 4440)
    assert pt_add(x, x, E) == (7284, 2107)

    p = (493, 5564)
    q = (1539, 4742)
    r = (4403, 5202)
    pp = pt_add(p, p, E)
    qr = pt_add(q, r, E)
    ppqr = pt_add(pp, qr, E)
    flag = 'crypto{' + str(ppqr[0]) + ',' + str(ppqr[1]) + '}'
    print('flag:', flag)

if __name__ == '__main__':
    main()

```

**flag:** `crypto{4215,2162}`
