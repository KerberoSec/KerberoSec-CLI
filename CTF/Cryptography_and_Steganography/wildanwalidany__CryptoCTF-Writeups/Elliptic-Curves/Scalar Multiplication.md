# Scalar Multiplication

Platform: Cryptohack

## Description

> We will work with the following elliptic curve, and prime: $E: Y^{2}=X^{3}+497X+1768, p:9739$
> Using the above curve, and the point $P = (2339, 2213)$ find the point $Q(x,y) = 7863 P$.
> After calculating Q, substitute the coordinates into the curve. Assert that the point $Q$ is in $E(F_{p})$

## Solution

The Algorithm for efficient scalar multiplication in Elliptic Curve follows these algorithm:
![image](https://github.com/wildanwalidany/CryptoCTF-Writeups/assets/74038077/e601e2df-e95b-4e89-8614-f0a7e039dec3)

So we just need to implement the algorithm.

`multiplication.py`:

```python
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
            lmd = (y2 - y1) * pow(x2 - x1, -1, Ep)  # Using modular inverse for efficiency
        else:
            lmd = (3 * (x1**2) + Ea) * pow(2 * y1, -1, Ep)
        x3 = (lmd**2 - x1 - x2) % Ep
        y3 = (lmd * (x1 - x3) - y1) % Ep
        return x3, y3

def scalar_mult(n, p, E):
    Q = (0, 0)
    while n > 0:
        if n & 1:  # Check if the least significant bit is 1
            Q = pt_add(Q, p, E)
        p = pt_add(p, p, E)
        n >>= 1  # Right-shift n to divide by 2
    return Q

if __name__ == '__main__':
    E = {'a': 497, 'b': 1768, 'p': 9739}
    P = (2339, 2213)
    n = 7863

    # Calculate scalar multiplication Q = nP
    Q = scalar_mult(n, P, E)

    # Print the result Q(x, y)
    x, y = Q
    print(f"Q(x, y) = ({x}, {y})")
```

**flag:** `crypto{9467,2742}`
