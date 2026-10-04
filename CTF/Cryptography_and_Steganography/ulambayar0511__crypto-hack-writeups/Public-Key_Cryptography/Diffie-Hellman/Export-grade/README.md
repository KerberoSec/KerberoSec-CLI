## export-grade

 Alice and Bob are using legacy codebases and need to negotiate parameters they both support. You've man-in-the-middled this negotiation step, and can passively observe thereafter. How are you going to ruin their day this time?

Connect at nc socket.cryptohack.org 13379

### Intercepted from Alice: {"supported": ["DH1536", "DH1024", "DH512", "DH256", "DH128", "DH64"]}

### Intercepted from Bob: {"chosen": "DH1024"}

Intercepted from Alice: {"p": "0xde26ab651b92a129", "g": "0x2", "A": "0x3f0a77d02e6e7276"}
A = 2 ^ a mod p
Intercepted from Bob: {"B": "0x26fc1c12fd9dcac9"}

B = 2 ^ b mod p = 0x26fc1c12fd9dcac9

s = pow(B,a,p)
A = 2 ^ a mod p
Intercepted from Alice: {"iv": "0c848ab12ce56007d40b107a2772255e", "encrypted_flag": "d169f135de26e4f135009e1bb7bcea8ee41c613f04f72c0e7bb91c9d94728cbb"}

