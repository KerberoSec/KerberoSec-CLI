## Challenge: PolyRSA

### Description
All the warmup you need 
### Writeup
Given [out.txt](out.txt) which consists of
* p 
* n (as polynomial)
* m^65537 (ciphertext also as polynomial)
To be honest, I never solved an RSA challenge based polynomials. So I checked for similar challenges which I couldn't find, but I found one research paper from which I was able to solve this challenge.
It is just similar to integer RSA, instead of numbers we have here polynomials. Here the toient function is
```
s = (p^m-1)*(p^n-1)
```
where **m** & **n** are the degree of the two irreducible polynomials reduced from modulus(n) 
Here is my [exploit](exploit.sage)
### The Vulnerability
Given n is factorizable.

**Flag**: inctf{and_i_4m_ir0n_m4n}
### Reference
[Polynomial RSA](http://www.diva-portal.se/smash/get/diva2:823505/FULLTEXT01.pdf)
