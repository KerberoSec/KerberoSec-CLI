# CTF Writeups: Cryptography

A collection of cryptography CTF challenge writeups with solve scripts.

## Challenges

| Challenge | Category | Technique |
|-----------|----------|-----------|
| [Base64Maze](./Base64Maze/) | Encoding | Multi-layer encoding brute force |
| [CBCOracle](./CBCOracle/) | AES-CBC | Padding oracle attack |
| [CanRSAbeBroken](./CanRSAbeBroken/) | RSA | Small prime factor attack |
| [CryptoLock](./CryptoLock/) | AES-CBC | Weak RNG seed recovery |
| [CustomCipherService](./CustomCipherService/) | DH + XOR | Diffie-Hellman key recovery |
| [InvisibleInk](./InvisibleInk/) | Steganography | Whitespace steganography |
| [SmallSubgroup](./SmallSubgroup/) | DH + AES | Small subgroup attack |
| [TripleDES](./TripleDES/) | 3DES | Meet-in-the-middle attack |
| [VigenereCipher](./VigenereCipher/) | Classical | Vigenere decryption |
| [YehDilMaangeMorse](./YehDilMaangeMorse/) | Encoding | Morse code decode |
| [meme_diary](./meme_diary/) | Steganography | PNG metadata + AES decryption |
| [sherlocked](./sherlocked/) | XOR | Known plaintext attack |
| [weak_key](./weak_key/) | DES | DES weak key exploitation |

## Skills Demonstrated

- Symmetric attacks: CBC padding oracle, meet-in-the-middle, weak RNG
- Asymmetric attacks: RSA small factor, Diffie-Hellman small subgroup
- Classical ciphers: Vigenere, XOR, DES weak keys
- Steganography: whitespace encoding, PNG metadata extraction
- Encoding analysis: multi-layer base64/binary/hex/base32, Morse code

## Tools

`Python 3` `pycryptodome` `Pillow`
