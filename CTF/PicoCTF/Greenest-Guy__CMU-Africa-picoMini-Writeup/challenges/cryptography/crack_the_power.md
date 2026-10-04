## 🔐 Crack the Power
**Category:** Cryptography

**Files/Links Provided:** ```message.txt```

**Description:**  

```
We received an encrypted message. The modulus is built from
primes large enough that factoring them isn’t an option, at
least not today. See if you can make sense of the numbers
and reveal the flag. Download the message.
```

**Steps to Solve:**  
1. Download ```message.txt```
2. Extract n, c, and e for analysis.
3. Check if the ciphertext corresponds to an exact integer e-th power. If the plaintext $$m$$ satisfies $$m^e < n$$, then $$m^e = c$$. Now you can recover $$m$$ by taking the e-th root of the ciphertext:
   
$$
m = \sqrt[e]{c}
$$

4. Use a Python script to calculate $$m = \sqrt[e]{c}$$ and convert the bytes to plaintext.

**Explanation:**

This challenge uses RSA encryption to encrypt a message where n is built off of prime numbers too large to factor. However e (the public exponent) is 20 which is unsafe for RSA encryption, being vulnerable to low public exponent attacks.

The ciphertext in RSA is calculated using the formula:

$$
c = m^e mod(n)
$$

When $$m^e$$ is smaller than n modular reduction doesnt occur as $$m^e mod(n)$$ would just be $$m^e$$. Because of this, the ciphertext isnt actually encrypted, and can be decrypted by rearranging $$c = m^e$$ into $$m = \sqrt[e]{c}$$.

**Code / Commands / Images**
```python
import gmpy2

# modulus & ciphertext redacted
n = (modulus)
c = (ciphertext)
e = 20

m, exact = gmpy2.iroot(c, e)

if exact:
    plaintext_bytes = m.to_bytes((m.bit_length() + 7) // 8, byteorder='big')
    plaintext = plaintext_bytes.decode('utf-8')

    print(plaintext)
```
> Python code to calculate the e-th root and decode the plaintext bytes to utf-8.

[🏠 Back to Main Page](https://github.com/Greenest-Guy/CMU-Africa-picoMini-Writeup)
