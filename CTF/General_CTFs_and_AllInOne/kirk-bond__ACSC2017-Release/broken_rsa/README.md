# Instructions for preparing challenge.
1. Write a short flag in the file flag.txt
2. Run `python create_challenge.py`
3. This will generate `encrypted_flag.txt` and `pubkey.json`
4. Provide these files as well as `brokenrsa.py` and `skeleton_solutions.py` to the competitors.

# Instructions for competitors
1. You have been given a public key encryption program based on RSA that has a mistake in it.
2. Your job is to decrypt the file
3. There are no tricks in the source code, you may believe the comments that tell you which parts of the code to ignore
4. It would be __extremely__ prudent to use the provided skeleton as a starting point. 
5. Good Luck!

# Walkthrough
1. This implemention leaks one of the secret primes used in RSA.
2. With the leaked prime, n (large modules) can be factored to give the other prime by using division
3. With both primes the secret phi of n can be computed as (p-1) * (q-1). The code for this is in the RSA implementation provided to the competitors in the challenge.
4. With phi of n the secret decryption exponent can be computed using the modular inverse of the public exponent over phi of n. The code for this is in the RSA implementation provided to the competitors in the challenge.

