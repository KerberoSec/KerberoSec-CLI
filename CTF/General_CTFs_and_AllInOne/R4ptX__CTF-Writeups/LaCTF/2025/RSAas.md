# Challenge

The goal was to cause an exception in the relevant part of the following code in order to get the flag.

```python

#!/usr/local/bin/python3

from Crypto.Util.number import isPrime

def RSAaaS():
    try:
        print("Welcome to my RSA as a Service! ")
        print("Pass me two primes and I'll do the rest for you. ")
        print("Let's keep the primes at a 64 bit size, please. ")

        while True:
            p = input("Input p: ")
            q = input("Input q: ")
            try:
                p = int(p)
                q = int(q)
                assert isPrime(p)
                assert isPrime(q)
            except:
                print("Hm, looks like something's wrong with the primes you sent. ")
                print("Please try again. ")
                continue

            try:
                assert p != q
            except:
                print("You should probably make your primes different. ")
                continue

            try:
                assert (p > 2**63) and (p < 2**64)
                assert (q > 2**63) and (q < 2**64)
                break
            except:
                print("Please keep your primes in the requested size range. ")
                print("Please try again. ")
                continue

        n = p * q
        phi = (p - 1) * (q - 1)
        e = 65537
        d = pow(e, -1, phi)

        print("Alright! RSA is all set! ")
        while True:
            print("1. Encrypt 2. Decrypt 3. Exit ")
            choice = input("Pick an option: ")

            if choice == "1":
                msg = input("Input a message (as an int): ")
                try:
                    msg = int(msg)
                except:
                    print("Hm, looks like something's wrong with your message. ")
                    continue
                encrypted = pow(msg, e, n)
                print("Here's your ciphertext! ")
                print(encrypted)

            elif choice == "2":
                ct = input("Input a ciphertext (as an int): ")
                try:
                    ct = int(ct)
                except:
                    print("Hm, looks like something's wrong with your message. ")
                    continue
                decrypted = pow(ct, d, n)
                print("Here's your plaintext! ")
                print(decrypted)

            else:
                print("Thanks for using my service! ")
                print("Buh bye! ")
                break

    except Exception:
        print("Oh no! My service! Please don't give us a bad review! ")
        print("Here, have a complementary flag for your troubles. ")
        with open("flag.txt", "r") as f:
            print(f.read())

RSAaaS()
```

# Solution

The critical line is the following one
```python
d = pow(e, -1, phi)
```
If e is not invertible mod phi(N) = (p-1)*(q-1), then this will raise an exception and we will get the flag.
So we just need to find a prime p = k.e + 1 with 64 bit size and then take a random prime q with 64 bit size to recover the flag.
Here is the source code from our solution:

```python
import random
from sympy import isprime
import math 

def generate_64bit_prime_congruent_to_1_mod_65537():
    while True:
        # Step 1: Generate a random 64-bit number
        random_number = random.getrandbits(64)

        # Step 2: Adjust for congruence to 1 modulo 65537
        remainder = random_number % 65537
        if remainder == 1:
            candidate = random_number
        else:
            candidate = random_number + (65537 - remainder) + 1

        # Step 3: Check for primality
        if isprime(candidate) and math.log(candidate,2) > 63 and math.log(candidate,2) < 64:
            return candidate

def generate_64_bit_prime():
    while True:
        random_number = random.getrandbits(64)
        if isprime(random_number):
            return random_number 

# Generate the prime number
prime_number = generate_64bit_prime_congruent_to_1_mod_65537()
print(f"Generated 64-bit prime congruent to 1 mod 65537: {prime_number}")
print(math.log(prime_number, 2))
second_prime = generate_64_bit_prime()
print("second prime: ", second_prime)
print(math.log(second_prime, 2))
```