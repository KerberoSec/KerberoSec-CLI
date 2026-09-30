# Difference of P
Points: 700

### Description
I made an RSA cipher from scratch. It is pretty easy to use. Eve told me that my Ps and Qs were not far enough apart to be safe, but I don't think that is the case... Can you break my cipher?

C=1974980851853019257771773253811679794137241209581612326758022524735213521549252839752456399226743 

N=22124683985039812698470600343255891405990431861180855450772516395200335369863431601013187704080051 

e=65537

## My Approach
1. I wrote a python script to factorize the given N.
2. I used `factorint` function from `sympy` library to factorize the number.
3. I got the factors of N.
4. Then I used `mod_inverse` function from `sympy` library to get the private key.
5. I decrypted the given ciphertext using the private key.
6. I got something but it was in bytes.
7. I converted the bytes to string and got the flag.

   ![image](https://github.com/sr-tamim/bearcatCTF-writeup/assets/86656406/4af0facb-2fda-427a-aba9-58be35e90254)

9. The python script is as follows:
```python
from sympy import mod_inverse, factorint

# Given values
C = 1974980851853019257771773253811679794137241209581612326758022524735213521549252839752456399226743
N = 22124683985039812698470600343255891405990431861180855450772516395200335369863431601013187704080051
e = 65537

# factorize N to get p and q
factors = factorint(N)
p, q = factors.keys()

# use p and q to calculate d
phi = (p-1)*(q-1)
d = mod_inverse(e, phi)

# decrypt the message
M = pow(C, d, N)

# convert the message to a ascii string
message = M.to_bytes((M.bit_length() + 7) // 8, 'big').decode('utf-8')

print(message)
```
