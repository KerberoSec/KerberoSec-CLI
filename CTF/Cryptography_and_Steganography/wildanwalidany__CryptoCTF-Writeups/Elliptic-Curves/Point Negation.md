# Point Negation

Platform: Cryptohack

## Description

> For all the challenges in the starter set, we will be working with the elliptic curve $E: Y^{2}=X^{3}+497X+1768, p:9739$
> Using the above curve, and the point $P(8045,6936)$, find the point $Q(x,y)$ such that $P + Q = O$.
> Resources: [The Animated Elliptic Curve: Visualizing Elliptic Curve Cryptography](https://curves.xargs.org/)

## Solution

In Elliptic Curve Addition Algorithm, there is case where:

If $x_{1}= x_{2}$ and $y_{1} = −y_{2}$, then $P_{1} + P_{2} = O$

So, $Q(x,y)=Q(x_{P},-y_{P})$. In other word, $Q=-P$

$-y_{P}$ is additive inverse of $y_{P}$ which satisfies $y_{P}+(-y_{P})=0$

Additive Inverse = $(-y_p) \mod p = (-6936) \mod 9739 = 9739: 6936 = 2803$

<!-- This code section is a work in progress: TODO: Update with the solucion -->
**flag:** `crypto{8045,2803}`
