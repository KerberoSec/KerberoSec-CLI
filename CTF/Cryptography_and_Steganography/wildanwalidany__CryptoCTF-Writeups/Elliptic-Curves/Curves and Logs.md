# Curves and Logs

Platform: Cryptohack

## Description

> Using the curve, prime and generator: $E: Y^{2}=X^{3}+497X+1768, p:9739, G: (1804,5368)$
> Calculate the shared secret after Alice sends you $Q_{A} = (815, 3190)$ , with your secret integer $n_{B} = 1829$.
> Generate a key by calculating the SHA1 hash of the `x` coordinate (take the integer representation of the coordinate and cast it to a string). The flag is the hexdigest you find.

## Solution

<!-- This code section is a work in progress: TODO: Update with the solucion -->
`solver.py`:

```python
# solver by epistemologist
# Not reinventing the wheel, doing this in Sage
from hashlib import sha1
E = EllipticCurve(GF(9739),[497,1768])
P = E(815, 3190)
print(sha1(str((1829*P)[0]).encode()).hexdigest())
```

**flag:** `flag`
