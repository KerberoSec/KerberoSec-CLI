# hotrod
CTF Swiss Army Knife.
HOTROD is a comprehensive, terminal-based utility script designed for Capture The Flag (CTF) players and cybersecurity enthusiasts. It combines common tasks such as encoding, hashing, encryption, forensics, and network analysis into a single, easy-to-use menu interface.

## usage
* Run the script directly, make sure its executable: `sudo chmod +x hotrod.sh`.
```bash
./hotrod.sh
```
* Use the latest updated version of this tool.
* Add the script to the bin folder to make it a command.
```bash
sudo mv hotrod.sh /usr/local/bin/hotrod
```

## all features
- **Encoding/Decoding:** Base64, Hex, and other formats
- **Hashing:** Generate hashes (MD5, SHA1, SHA256, etc.)
- **Encryption:** Simple encryption/decryption helpers
- **Forensics:** Tools for analyzing files and extracting metadata
- **Analysis:** General utilities for inspecting data
- **Network:** Basic networking utilities

---
## Features

### 1. Encoding & Ciphers
* Base64 Encode/Decode
* Base32 Encode/Decode
* Hex Encode/Decode
* Binary Encode/Decode (010101 format)
* URL Decode

### 2. Hashing Utilities
* Calculate MD5, SHA1, and SHA256 hashes simultaneously.
* Integrity Check: Verify a file against a known hash string.

### 3. Encryption (AES/GPG)
* AES-256 Encryption/Decryption (using OpenSSL).
* GPG Encryption/Decryption.

### 4. File Forensics
* Identify file types using magic bytes.
* Extract readable strings from binary files.
* Extract Exif metadata (requires exiftool).
* Analyze firmware and file structures using Binwalk.

### 5. Cryptanalysis
* Identify hash and encoding types based on format and length.
* Brute-Force: Rotational ciphers (Caesar/ROT 1-26).
* Brute-Force: Dictionary attacks on MD5/SHA1 hashes using a wordlist.

### 6. Network & Shells
* Netcat Listener generator.
* Reverse Shell generator (Bash TCP).
* Local Interface IP display.
* Public IP fetcher.
* Simple TCP Port Scanner.

### 7. Interface
* Smart Input: Accepts file paths or direct text input.
* Auto-organized output: All results are saved to the "ctf_output" directory.

## Requirements

The script relies on standard Linux utilities. For full functionality, ensure the following are installed:
* bash
* python3
* openssl
* gpg
* binwalk
* exiftool (optional, for metadata extraction)
* xxd (usually part of vim-common)

---
## Disclaimer

This tool is provided for educational and authorized testing purposes only. The developer is not responsible for any misuse or damage caused by this program. Ensure you have permission before scanning or testing any system.

---
# License
This project is **COMPLETELY free** to use and is licensed under the MIT License: see the [LICENSE](LICENSE) file for details.
