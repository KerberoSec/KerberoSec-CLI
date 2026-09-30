# meme_diary

**Category:** PNG Steganography + AES Decryption

## Vulnerability
AES-128-CBC encryption key and encrypted payload were hidden inside custom PNG metadata chunks: invisible when viewing the image normally.

## Approach
1. Used Python Pillow to read all custom metadata chunks from the PNG
2. Found the base64-encoded AES key in one chunk
3. Found the encrypted payload in format `v1:IV:ciphertext` in another chunk
4. Decoded key and IV from base64, decrypted with AES-128-CBC

## Key Insight
PNG files support arbitrary custom metadata chunks. Sensitive data hidden this way is completely invisible to anyone just viewing the image.

## Solve Script
See `solve.py`

## Mitigation
- Never embed encryption keys alongside the encrypted data
- Scan uploaded files for unexpected metadata before storing them
