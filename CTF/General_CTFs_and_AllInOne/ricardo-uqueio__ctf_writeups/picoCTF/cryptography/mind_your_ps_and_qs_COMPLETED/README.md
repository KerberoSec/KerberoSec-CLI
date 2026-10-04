# Mind your Ps and Qs 

The website [dcode.fr](https://www.dcode.fr/rsa-cipher) offers encryption/decryption tools that helps with cryptography.

The rsa-cipher tool can decipher the current problem by providing the values we were given: **C, N and E.**

**The pair (N, E) make up the public key.**

From what I understand, it uses the value of **N** and  calculates/obtains the values for **P** and **Q** using [factordb](http://factordb.com/).

`N = P*Q`

Having the values of **P and Q** it next uses them together with the value **E** to determine **D**, since it is chosen such that `D * E ≡ 1 mod(P-1)(Q-1)`. ([calculating the modular multiplicative inverse](https://en.wikipedia.org/wiki/Modular_multiplicative_inverse))

**D is the private key.**

With **C, D and N** in hand, the value of the message **M** is then calculated with the formula:
$M≡C^d (mod\space n)$.
 