All primes that aren't 2 are of the form p ≡ 1 mod 4 or p ≡ 3 mod 4, since all odd numbers obey these congruences. As the previous challenge hinted, in the p ≡ 3 mod 4 case, a really simple formula for computing square roots can be derived directly from Fermat's little theorem. That leaves us still with the p ≡ 1 mod 4 case, so a more general algorithm is required.

In a congruence of the form r2 ≡ a mod p, Tonelli-Shanks calculates r.

Tonelli-Shanks doesn't work for composite (non-prime) moduli. Finding square roots modulo composites is computationally equivalent to integer factorization.