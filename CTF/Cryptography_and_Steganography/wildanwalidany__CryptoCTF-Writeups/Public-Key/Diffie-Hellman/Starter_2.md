# Starter 2

Platform: Cryptohack

## Description

> Every element of a finite field Fp can be used to make a subgroup H under repeated action of multiplication. In other words, for an element g: H = {g, g^2, g^3, ...} A primitive element of Fp is an element whose subgroup H = Fp, i.e., every element of Fp, can be written as g^n mod p for some integer n. Because of this, primitive elements are sometimes called generators of the finite field. For the finite field with p = 28151 find the smallest element g which is a primitive element of Fp.

## Solution

The Primitive Root Theorem states:

For every prime number p, there exists at least one integer g (1 < g < p) such that the powers of g (g, g^2, g^3, ..., g^(p-1)) cover all the non-zero residues modulo p.

In other words, for any prime p, there exists an integer g (known as the primitive root) that generates all the non-zero elements of the finite field Fp when raised to the powers from 1 to p-1.

For example, To find a primitive root (generator) in the finite field F7, we need to check each element in the set {1, 2, 3, 4, 5, 6} to see if it generates all non-zero elements when raised to different powers modulo 7.

For g = 2:

```console
g^1 mod 7 = 2
g^2 mod 7 = 4
g^3 mod 7 = 1
g^4 mod 7 = 2 (repeats)
g^5 mod 7 = 4 (repeats)
g^6 mod 7 = 1 (repeats)
```

For g = 3:

```console
g^1 mod 7 = 3
g^2 mod 7 = 2
g^3 mod 7 = 6
g^4 mod 7 = 4
g^5 mod 7 = 5
g^6 mod 7 = 1
```

From the above calculations, we find that for g = 3, all the powers from 1 to 6 produce all non-zero elements {1, 2, 3, 4, 5, 6} of F7 in a distinct order. Therefore, the element 3 is a primitive root (generator) in the finite field F7.

The script:

```python
def is_primitive_root(g, p, factors):
    for factor in factors:
        if pow(g, (p - 1) // factor, p) == 1:
            return False
    return True

def prime_factors(n):
    factors = []
    i = 2
    while i * i <= n:
        if n % i:
            i += 1
        else:
            n //= i
            factors.append(i)
    if n > 1:
        factors.append(n)
    return factors

def find_primitive_root(p):
    if p <= 2 or not all(p % i for i in range(2, int(p**0.5) + 1)):
        return None  # p is not a valid prime number

    factors = prime_factors(p - 1)
    for g in range(2, p):
        if is_primitive_root(g, p, factors):
            return g
    return None  # No primitive root found

if __name__ == "__main__":
    try:
        p = int(input("Enter a prime number (p): "))
        primitive_root = find_primitive_root(p)
        if primitive_root:
            print(f"The primitive root of {p} is: {primitive_root}.")
        else:
            print(f"No primitive root found for {p}.")
    except ValueError:
        print("Invalid input. Please enter a valid integer.")

```

Output:

```console
Enter a prime number (p): 28151
The primitive root of 28151 is: 7.
```
