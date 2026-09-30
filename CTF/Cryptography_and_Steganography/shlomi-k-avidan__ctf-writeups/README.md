# CTF Writeups

Writeups from cybersecurity competitions I have solved, covering reverse engineering, protocol exploitation, binary and cryptographic attacks, network attacks, forensics, and steganography.

## Writeups

### Check Point Security Academy 2020
Multi-challenge writeup. The strongest challenge, **Shoes**, involved reverse engineering a custom SOCKS-like network protocol from packet captures: recovering the XOR key of a challenge-response scheme by diffing challenges across sessions, then modifying requests past a CRC-32 integrity check to redirect the proxy to an internal target. **CS-Hacked** was an end-to-end network attack: SSH access, reconnaissance, ARP-spoofing MITM, traffic capture, and recovery of an RC4 key via a length-correlated dictionary attack. The archive also includes solutions to further challenges across scripting, forensics, cryptography, and steganography.

### Mossad 2019 CTF
Three challenges spanning mobile reverse engineering, PKI, and applied cryptography:

- **Timing side-channel attack**: reverse engineered a Flutter Android app and its authentication endpoint, then recovered the password with a timing attack: the server took measurably longer for each additional correct character, so the script recovers the password one character at a time by measuring response times, reducing an exponential search to linear.
- **Certificate forging**: built a custom X.509 / PKCS#12 certificate chain (own CA, signing, PKCS#10 request handling) to forge an administrator certificate accepted by the target.
- **Padding oracle attack**: implemented a padding oracle attack against an encryption binary to recover plaintext without the key.

### Hoshen / Sukkot 2020 (IDF Cyber Riddle)
A steganography chain: decoding Morse from shofar-audio to recover an IP address, extracting a password-protected RAR hidden inside a JPEG (binwalk), cracking the archive with John the Ripper and rockyou, and decoding a payload image whose pixel hex values spell out the flag.

## Notes

- Each folder contains my own solve scripts and, where written, a full writeup (PDF, so it renders with its screenshots).
- These document challenges from public recruitment and community CTFs.
- Challenge-provided binaries and third-party files are not redistributed here; the writeups describe them and link the original source where relevant.
- Writeup for the Iron Codes 2024 challenge wasn't written. Linkedin post: https://www.linkedin.com/posts/cyberproai-israel_cyber-challenge-cyberweek2024-activity-7212103360814977024-8JO9
- Huntress CTF 2025 certificate uploaded, didn't compose a write-up.
