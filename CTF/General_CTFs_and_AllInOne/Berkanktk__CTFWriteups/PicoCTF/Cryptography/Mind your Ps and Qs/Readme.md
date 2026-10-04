# Mind your Ps and Qs
## Description
In RSA, a small e value can be problematic, but what about N? Can you decrypt this? values.

## Solution
In this challenge, we are given the values of c, n, and e in an RSA encryption scheme. Our task is to decrypt the ciphertext c and obtain the original plaintext message.

To decrypt the message, we need to factor the modulus n into its prime factors p and q. We can do this using a tool like factordb.com or by applying various factorization techniques. Once we have the values of p and q, we can calculate the totient function phi as (p-1)*(q-1).

Next, we can calculate the decryption key d using the formula d = inverse(e, phi), where inverse is the modular multiplicative inverse function. Once we have the value of d, we can decrypt the ciphertext c using the formula m = pow(c, d, n), where m is the original plaintext message.

The following Python code can be used to perform the above steps and obtain the plaintext message:
````python
from Crypto.Util.number import inverse, long_to_bytes

# n = p * q
# phi = (p - 1) * (q - 1)
# d = inverse(e, phi)
# m = pow(c, d, n)
# p and q are prime numbers. We can factor n using factordb.com to get p and q.

n = 1584586296183412107468474423529992275940096154074798537916936609523894209759157543
e = 65537
c = 964354128913912393938480857590969826308054462950561875638492039363373779803642185

p = 2434792384523484381583634042478415057961
q = 650809615742055581459820253356987396346063

phi = (p - 1) * (q - 1)
d = inverse(e, phi)
m = pow(c, d, n)

print(long_to_bytes(m).decode())
````

Aaand we get the flag!
