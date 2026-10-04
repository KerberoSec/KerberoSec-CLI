# HTB twoforone crypto writeup

## CHALLENGE DESCRIPTION

Alice sent two times the same message to Bob.

**Writeup**

The files for this challenge are 4 files: 2 cipher text and 2 RSA public key .pem file.
Assuming that the 2 ciphertext are encryption of the same plaintext using the 2 public key correspondingly, a [RSA same message attack](https://crypto.stackexchange.com/questions/1614/rsa-cracking-the-same-message-is-sent-to-two-different-people-problem) can be attempted to recover the plaintext.

Run the follow command to examine the .pem files to find out the RSA parameter (modulus and exponent).
```
openssl rsa -in key1.pem -pubin -text
openssl rsa -in key2.pem -pubin -text
```

The ciphertext is base64 encoded. Decode it before proceed to the attack.
After gathering all the information: ciphertext, RSA modulus and exponent, use SageMath and python to perform the same message attack.
