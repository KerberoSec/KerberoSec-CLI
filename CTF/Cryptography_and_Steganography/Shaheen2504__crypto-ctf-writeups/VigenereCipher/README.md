# VigenereCipher

**Category:** Classical Cipher: Vigenere

## Vulnerability
The encryption key was provided in the challenge description. Standard Vigenere decryption applied.

## Approach
Applied Vigenere decryption: for each letter, subtracted the key letter value modulo 26. Non-alphabetic characters (digits, braces) were left unchanged. Key repeated cyclically over the ciphertext.

## Solve Script
See `solve.py`

## Note
When the key is known, Vigenere offers zero security. Even without the key, the Kasiski test or Index of Coincidence can recover it for long ciphertexts.

## Mitigation
- Vigenere is a historical cipher: never use it for real encryption
