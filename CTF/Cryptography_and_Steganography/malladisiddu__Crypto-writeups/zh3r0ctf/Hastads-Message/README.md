# Challenge: Hastad's-message
## Description:
My friend Hastad send me a message but I am not able to read it. Only thing I know is its different each time.

nc crypto.zh3r0.ml 7419 

## Vulnerability:
Here it is given in the decription "its different each time", which gave me the lead to solve in general hastad's broadcast attack. I took 3 values of modulus and ciphertexts and brute forced the value of e = 5 (since e = 3 didn't worked).
