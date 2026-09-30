# Haponica: Solution

## Overview

The challenge gives you a 16-byte key and a 32-byte ciphertext. The hint says it works like AES but isn't AES.

## How to Solve

1. **Read the hint carefully.** It tells you the cipher behaves like AES (same block size, same key size) but is a different algorithm.
2. **Look at the challenge name.** "Haponica" is a play on "Japonica": as in *Camellia japonica*, a flower. This points to the **Camellia** cipher.
3. **Decrypt the ciphertext** using Camellia-128 in ECB mode with the provided key.
4. **Strip the padding** (PKCS7) from the result to get the flag.