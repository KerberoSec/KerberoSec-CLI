# **Diffie-Hellmann: 200 pts**

### Key points

- Diffie-Hellmann key exchange
- Caesar Cipher

---

## **Contents**

- [Overview](#overview)
- [Solution](#solution)
- [Flag](#flag)

---

## Overview

### Description

> Alice and Bob wanted to exchange information secretly. The two of them agreed to use the Diffie-Hellman key exchange algorithm, using p = 13 and g = 5. They both chose numbers secretly where Alice chose 7 and Bob chose 3. Then, Alice sent Bob some encoded text (with both letters and digits) using the generated key as the shift amount for a Caesar cipher over the alphabet and the decimal digits. Can you figure out the contents of the message?

The Diffie-Hellman key exchange algorithm is a method of establishing a common private key without needing to expose the private key to the public. This [article](https://www.comparitech.com/blog/information-security/diffie-hellman-key-exchange/) explains it quite well.

---

## Solution

Scrolling down, the article provides an example of how the algorithm works, with small numbers like the ones we are provided. Simply implement the algorithm to calculate the private key.

We are given:

```py
p = 13  # modulus
g = 5   # base

a = 7   # Alice's number
b = 3   # Bob's number
```

We can calculate the number Alice sends to Bob:

`A = pow(g, a, p)`

And use Bob's number to get the secret key:

`secret = pow(A, b, p)`

Which turns out to be `5`. Now the challenge instructs us to use Caesar Cipher on the encrypted message, shifting by the secret number. Make sure to try shifting forwards _and_ backwards.

An important thing to note is instead of shifting just the alphabet, you have to include the 10 numerical digits, which are appended to the end of the alphabet. Underscores remain as underscores.

## Flag

> `picoCTF{C4354R_C1PH3R_15_4_817_0U7D473D_3A2BF44E}`
