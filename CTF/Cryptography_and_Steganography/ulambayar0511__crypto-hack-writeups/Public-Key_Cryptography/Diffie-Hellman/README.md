Cryptographic explanation

The simplest and the original implementation[2] of the protocol uses the multiplicative group of integers modulo p, where p is prime, and g is a primitive root modulo p. These two values are chosen in this way to ensure that the resulting shared secret can take on any value from 1 to p: 1. Here is an example of the protocol, with non-secret values in blue, and secret values in red.

    Alice and Bob publicly agree to use a modulus p = 23 and base g = 5 (which is a primitive root modulo 23).
    Alice chooses a secret integer a = 4, then sends Bob A = ga mod p
        A = 54 mod 23 = 4 (in this example both A and a have the same value 4, but this is usually not the case)
    Bob chooses a secret integer b = 3, then sends Alice B = gb mod p
        B = 53 mod 23 = 10
    Alice computes s = Ba mod p
        s = 104 mod 23 = 18
    Bob computes s = Ab mod p
        s = 43 mod 23 = 18
    Alice and Bob now share a secret (the number 18).Cryptographic explanation

The simplest and the original implementation[2] of the protocol uses the multiplicative group of integers modulo p, where p is prime, and g is a primitive root modulo p. These two values are chosen in this way to ensure that the resulting shared secret can take on any value from 1 to p: 1. Here is an example of the protocol, with non-secret values in blue, and secret values in red.

    Alice and Bob publicly agree to use a modulus p = 23 and base g = 5 (which is a primitive root modulo 23).
    Alice chooses a secret integer a = 4, then sends Bob A = ga mod p
        A = 54 mod 23 = 4 (in this example both A and a have the same value 4, but this is usually not the case)
    Bob chooses a secret integer b = 3, then sends Alice B = gb mod p
        B = 53 mod 23 = 10
    Alice computes s = Ba mod p
        s = 10 ^ 4 mod 23 = 18
    Bob computes s = Ab mod p
        s = 4 ^3 mod 23 = 18
    Alice and Bob now share a secret (the number 18).