# HTB Project Power writeup

## CHALLENGE DESCRIPTION
We captured the embedded device that was used to encrypt the ciphers we need to break. Our field agent has set up a remote lab to facilitate remote exploitation of the device so that we can recover its Encryption Key.

The web service let the attackers to enter a plaintext and return the power trace of the secure device while encrypting the plaintext.

```                                                                                                                                                                         
Remote Lab Interface:
1. Encrypt plaintext (Returns power trace)
2. Verify key (Returns ASCII Text)
Select:
```

The encryption method used by the secure device is standard AES with 128-bit key. To obtain the key, a differential power analysis (DPA) attack can be performed. 
The attack can be divied into 2 stages:
1. Traces collecting stage
2. Analysis stage

** Traces collecting stage**

Around 1000 traces of random plaintext are obtained using the web service provide.

** Analysis stage ** 

A DPA attack targeting the LSB of the output of the first sub-byte. 
