# Breaking RSA: Hands-On RSA Factorization and Private Key Recovery

## 📌 Overview

RSA is one of the most widely used public-key cryptographic algorithms. Its security relies heavily on the difficulty of factoring a large integer into its two prime factors.

In this hands-on practice, I worked through an RSA challenge where the public key contained a vulnerable RSA modulus. The objective was to understand how an attacker could recover the RSA private key when the two prime factors `p` and `q` are generated too close to each other.

The lab demonstrated the complete process:

```text
RSA Public Key
      │
      ▼
Extract modulus n
      │
      ▼
Factor n into p and q
      │
      ▼
Calculate φ(n)
      │
      ▼
Use e = 65537
      │
      ▼
Calculate private exponent d
      │
      ▼
Generate RSA Private Key
      │
      ▼
Use private key for authentication
```

> **Disclaimer:** This write-up was created for an authorized cybersecurity training environment. The techniques should only be used against systems where you have explicit permission to test.

---

# 🎯 Objectives

The main objectives of this exercise were:

* Understand the structure of an RSA public key.
* Identify the RSA modulus `n`.
* Understand why RSA depends on difficult integer factorization.
* Factor a vulnerable RSA modulus into `p` and `q`.
* Understand Fermat's factorization method.
* Calculate Euler's totient `φ(n)`.
* Calculate the RSA private exponent `d`.
* Construct an RSA private key.
* Understand how the recovered key can be used for SSH authentication.

---

# 🧠 RSA Fundamentals

Before starting the practical work, it is important to understand the basic RSA parameters.

RSA uses two large prime numbers:

```text
p
q
```

The modulus is:

$$
n = p \times q
$$

The public key consists mainly of:

```text
(n, e)
```

where:

* `n` = RSA modulus
* `e` = public exponent

In this lab:

```text
e = 65537
```

The private exponent is:

$$
d = e^{-1} \mod \phi(n)
$$

where:

$$
\phi(n)=(p-1)(q-1)
$$

The private key therefore depends on knowing `p` and `q`.

This is why factoring `n` is such an important part of RSA security.

---

# 🔎 Step 1: Obtain the RSA Public Key

The lab provided an SSH public key:

```text
id_rsa.pub
```

The key was in OpenSSH format:

```text
ssh-rsa AAAAB3NzaC1yc2E...
```

I first inspected the file:

```bash
cat id_rsa.pub
```
<img width="793" height="223" alt="4" src="https://github.com/user-attachments/assets/5cf9bc3d-0834-40af-9d2d-720d5b165445" />

The important point here is that an OpenSSH RSA public key contains the RSA public parameters encoded using Base64.

---

# 🔄 Step 2: Convert the OpenSSH Key to PEM

OpenSSL tools are easier to use with PEM-formatted RSA keys.

I converted the OpenSSH public key using:

```bash
ssh-keygen -f id_rsa.pub -e -m PEM > public.pem
```

Then I inspected the converted key:

```bash
cat public.pem
```
<img width="792" height="522" alt="5" src="https://github.com/user-attachments/assets/aeb7d2fb-9d31-4ded-aa1e-14a43db26cd4" />

The result looked like a standard PEM public key.

---

# 🔍 Step 3: Extract the RSA Modulus

The next step was to identify the RSA modulus `n`.

I used OpenSSL:

```bash
openssl rsa -pubin -in public.pem -text -noout
```

Depending on the key format, this can also be useful:

```bash
openssl rsa -RSAPublicKey_in -in public.pem -text -noout
```

The output contained:

```text
Public-Key: (4096 bit)

Modulus:
    00:eb:66:1f:28:7b:c4:3c:8f:a9:2d:db...
    
Exponent: 65537 (0x10001)
```

The large number under `Modulus` is `n`.

The exponent was:

```text
e = 65537
```

At this point I had the public RSA parameters:

```text
n = RSA modulus
e = 65537
```
<img width="794" height="383" alt="6" src="https://github.com/user-attachments/assets/99533c72-6b8a-4dca-9e00-4b1a4b46a976" />

---

# 🧮 Step 4: Why the RSA Key Was Vulnerable

Normally, factoring a properly generated 4096-bit RSA modulus is computationally infeasible.

However, this challenge intentionally used a weakness in the relationship between the two prime factors.

The two primes were extremely close:

```text
p ≈ q
```

This is dangerous because RSA moduli with close prime factors can be attacked using **Fermat's factorization method**.

Fermat's method is based on the difference of squares:

$$
a^2-b^2=(a+b)(a-b)
$$

If:

$$
n=pq
$$

and `p` and `q` are close, then we can write:

$$
p=a-b
$$

and:

$$
q=a+b
$$

Therefore:

$$
n=(a-b)(a+b)=a^2-b^2
$$

The closer `p` and `q` are, the faster Fermat's method can find them.

---

# 💻 Step 5: Implement Fermat Factorization

I used Python with `gmpy2` for efficient integer square-root calculations.

Install it if required:

```bash
pip install gmpy2
```

The factorization code was:

```python
#!/usr/bin/python3

from gmpy2 import isqrt

def factorize(n):

    # If n is even
    if (n & 1) == 0:
        return (n // 2, 2)

    # Start at ceil(sqrt(n))
    a = isqrt(n)

    if a * a == n:
        return a, a

    while True:

        a += 1

        bsq = a * a - n
        b = isqrt(bsq)

        if b * b == bsq:
            break

    return a + b, a - b
```

Then I supplied the RSA modulus:

```python
p, q = factorize(n)

print("p =", p)
print("q =", q)
```

The important part of the algorithm is:

```python
a = isqrt(n)
```

followed by:

```python
bsq = a * a - n
```

The program checks whether `bsq` is a perfect square.

Once it finds one:

```text
b² = a² - n
```

We can calculate:

```text
p = a - b
q = a + b
```
---

# 🔐 Step 6: Recover p and q

The factorization produced two large prime numbers.

I verified the result using:

```python
print(p * q == n)
```

The expected result was:

```text
True
```

This is an important verification step.

If:

$$
p\times q=n
$$

Then the factorization is correct.

<img width="792" height="322" alt="7" src="https://github.com/user-attachments/assets/68f4beb1-20b6-4b6d-96b4-b456e3eeb562" />

---

# 📐 Step 7: Calculate Euler's Totient

Once `p` and `q` were known, I could calculate Euler's totient:

$$
\phi(n)=(p-1)(q-1)
$$

Python:

```python
phi = (p - 1) * (q - 1)

print("phi =", phi)
```

This value is required to calculate the private exponent.

---

# 🔑 Step 8: Calculate the Private Exponent d

The public exponent was:

```text
e = 65537
```

The private exponent is the modular inverse:

$$
d=e^{-1}\mod\phi(n)
$$

In Python:

```python
e = 65537

d = pow(e, -1, phi)

print("d =", d)
```

The result was a very large integer.

I also verified the calculation:

```python
print((e * d) % phi)
```

The result should be:

```text
1
```

This confirms that:

$$
ed\equiv1\pmod{\phi(n)}
$$

---

# 🛠️ Step 9: Generate the RSA Private Key

Knowing:

```text
n
e
d
p
q
```

allows us to reconstruct the RSA private key.

I used PyCryptodome:

```bash
pip3 install pycryptodome
```

Then:

```python
from Crypto.PublicKey import RSA

p = YOUR_P
q = YOUR_Q
e = 65537

n = p * q
phi = (p - 1) * (q - 1)

d = pow(e, -1, phi)

key = RSA.construct((n, e, d, p, q))

with open("id_rsa", "wb") as f:
    f.write(key.export_key())

print("Private key generated successfully.")
```

This generated:

```text
id_rsa
```
<img width="553" height="126" alt="9" src="https://github.com/user-attachments/assets/8c119851-d03c-4371-b5eb-3ae57297dbd5" />

The resulting key is an actual RSA private key.

---

# 🔒 Step 10: Protect the Private Key

SSH requires private keys to have restrictive permissions.

I used:

```bash
chmod 600 id_rsa
```

Then I verified the key:

```bash
ssh-keygen -y -f id_rsa > generated.pub
```

This derives the public key from the private key.

I could then compare it with the original public key.
<img width="790" height="401" alt="10" src="https://github.com/user-attachments/assets/8f48b2a4-0482-4105-b3f9-aa9f109dbd34" />

---

# 🌐 Step 11: SSH Authentication

If the lab provides an authorized SSH account and target machine, the recovered private key can be supplied using:

```bash
ssh -i id_rsa username@TARGET-IP
```

If SSH uses a different port:

```bash
ssh -i id_rsa -p PORT username@TARGET-IP
```

The important concept is:

```text
Private key
     │
     ▼
SSH authentication
     │
     ▼
Server verifies against
authorized public key
```
<img width="737" height="436" alt="11" src="https://github.com/user-attachments/assets/956f81c1-e19f-4eed-b970-ca2624027481" />
<img width="676" height="470" alt="12" src="https://github.com/user-attachments/assets/f480a89c-b2b9-4e18-b916-d42dee2fa63e" />

The private key should **never be shared publicly**.

---

# 🧪 Complete Python Workflow

The complete mathematical process can be summarized as:

```python
from math import isqrt

# RSA modulus
n = YOUR_N

# Public exponent
e = 65537

# Fermat factorization
a = isqrt(n)

if a * a < n:
    a += 1

while True:
    b2 = a * a - n
    b = isqrt(b2)

    if b * b == b2:
        p = a - b
        q = a + b
        break

    a += 1

# Verify
assert p * q == n

# Euler's totient
phi = (p - 1) * (q - 1)

# Private exponent
d = pow(e, -1, phi)

print("p =", p)
print("q =", q)
print("n =", n)
print("phi =", phi)
print("e =", e)
print("d =", d)
```

---

# 📊 RSA Attack Workflow

```text
             RSA Public Key
                   │
                   ▼
             Extract n and e
                   │
                   ▼
          Check RSA key weakness
                   │
                   ▼
       p and q are very close
                   │
                   ▼
        Fermat Factorization
                   │
             ┌─────┴─────┐
             ▼           ▼
             p           q
             └─────┬─────┘
                   ▼
          φ(n) = (p-1)(q-1)
                   │
                   ▼
       d = e⁻¹ mod φ(n)
                   │
                   ▼
          RSA Private Key
                   │
                   ▼
       Authorized SSH Access
```

---

# 🧠 What I Learned

This exercise helped me understand that RSA security doesn't simply depend on using a large key size.

The **quality of prime generation** is equally important.

The major lessons were:

### 1. RSA depends on the difficulty of factoring n

If an attacker can efficiently obtain:

```text
p
q
```

from:

```text
n = p × q
```

The RSA private key can potentially be reconstructed.

### 2. Close prime factors can weaken RSA

If:

```text
p ≈ q
```

Fermat's factorization method becomes particularly effective.

### 3. The public key can reveal important information

The public key doesn't directly contain the private exponent, but it contains the modulus `n` and public exponent `e`.

If `n` can be factored, the remaining RSA parameters can be reconstructed.

### 4. `e = 65537` is not the weakness

`65537` is a common RSA public exponent.

The vulnerability in this exercise was the weak relationship between `p` and `q`, not simply the value of `e`.

### 5. Private key reconstruction is mathematically possible

Once the attacker knows:

```text
p
q
e
```

they can calculate:

```text
φ(n)
d
```

and reconstruct the private key.

---

# 🛡️ Defensive Recommendations

To prevent this type of RSA weakness:

* Generate RSA primes using a cryptographically secure random number generator.
* Ensure `p` and `q` are sufficiently independent.
* Avoid intentionally selecting primes that are too close.
* Use well-tested cryptographic libraries instead of implementing RSA key generation manually.
* Protect private keys using appropriate filesystem permissions.
* Rotate compromised keys immediately.
* Use modern SSH key management practices.
* Monitor for unauthorized access attempts.

The biggest lesson for developers is:

> **Don't implement cryptographic key generation yourself when reliable, audited cryptographic libraries are available.**

---

# 🎯 Skills Practiced

* RSA fundamentals
* Public/private key cryptography
* RSA modulus analysis
* Fermat factorization
* Integer arithmetic
* Euler's totient function
* Modular inverse
* Python scripting
* OpenSSL
* OpenSSH
* SSH authentication
* Cryptographic weakness identification
* CTF methodology

---

# 📝 Conclusion

This hands-on exercise demonstrated how a weakness in RSA key generation can undermine an otherwise strong cryptographic algorithm.

The overall attack was:

```text
Public RSA Key
      ↓
Extract n
      ↓
Identify close prime factors
      ↓
Fermat factorization
      ↓
Recover p and q
      ↓
Calculate φ(n)
      ↓
Calculate d
      ↓
Reconstruct private key
      ↓
Use key for authorized authentication
```

The most important takeaway for me was that **cryptography is only as strong as its implementation and key generation process**.

A 4096-bit RSA key may look extremely strong, but if its prime factors are generated poorly, the underlying security assumptions can be broken.

---

## ⚠️ Disclaimer

This write-up documents a controlled cybersecurity training exercise. All techniques described here were performed in an authorized lab environment for educational purposes. Never attempt to access systems, accounts, or networks without explicit permission.

