```
 ██╗    ██╗ ██╗███████╗███████╗ ██████╗ ██╗   ██╗██╗   ██╗
 ██║    ██║███║██╔════╝██╔════╝██╔════╝ ██║   ██║╚██╗ ██╔╝
 ██║ █╗ ██║╚██║███████╗█████╗  ██║  ███╗██║   ██║ ╚████╔╝
 ██║███╗██║ ██║╚════██║██╔══╝  ██║   ██║██║   ██║  ╚██╔╝
 ╚███╔███╔╝ ██║███████║███████╗╚██████╔╝╚██████╔╝   ██║
  ╚══╝╚══╝  ╚═╝╚══════╝╚══════╝ ╚═════╝  ╚═════╝    ╚═╝
           TryHackMe: W1seGuy
```

> 👤 **Author:** farhan | 📅 **Date:** 2026-06-08 | 🏠 **Platform:** TryHackMe | 💀 **Difficulty:** Easy | ⭐ **Rating:** ⭐⭐☆☆☆

> ⏱️ ~10 min read

---

## Table of Contents

- [Progress Checklist](#progress-checklist)
- [Tools Used](#️-tools-used)
- [TL;DR](#-tldr)
- [Introduction](#-introduction)
- [Recon](#-recon)
- [Foothold](#-foothold)
- [Exploitation](#-exploitation)
- [Rabbit Holes](#-rabbit-holes)
- [Flag](#-flag)
- [Mitigations](#️-mitigations)
- [Key Takeaway](#-key-takeaway)
- [If I Did It Again](#-if-i-did-it-again)
- [Changelog](#-changelog)

---

## Progress Checklist

- [x] Downloaded and analysed `source.py` from the challenge page
- [x] Identified XOR encryption with a 5-character repeating key
- [x] Recognised known-plaintext attack vector: fake flag hardcoded in source
- [x] Understood XOR self-inverse property: `C ⊕ P = K`
- [x] Derived key recovery strategy: first 4 bytes from `THM{`, 5th byte from `}`
- [x] Wrote Python decryption script (`decoder.py`)
- [x] Connected to server, copied live ciphertext, ran script offline
- [x] Submitted recovered key in the same open session
- [x] Retrieved both flags

---

## 🛠️ Tools Used

- 🔌 Netcat: connecting to the challenge server on port 1337
- 🐍 Python 3: custom XOR known-plaintext decryption script
- 🧮 XOR arithmetic: key recovery via known-plaintext attack

---

## ⚡ TL;DR

The server XORs a hardcoded fake flag (`THM{thisisafakeflag}`) with a random 5-character key and hands you the hex-encoded result. Since the plaintext is known, XOR's self-inverse property recovers the key directly: `C ⊕ P = K`. A fifteen-line Python script extracts the key, decrypts flag 1, and the key submitted back to the open session unlocks flag 2.

---

## 📖 Introduction

Today's target is **W1seGuy**: a pure cryptography challenge with no ports to scan, no login forms to brute force, and no `sudo -l` to run. The entire puzzle lives in a Python file provided upfront: a TCP server running a custom XOR cipher, confident that a randomly generated 5-character key is sufficient protection. The flaw isn't in the randomness of the key. It's in the fact that the developer hardcoded the exact plaintext being encrypted right there in the source code, then handed that source to the attacker. Knowing what was encrypted before receiving the ciphertext is about as close to a free lunch as cryptanalysis gets. The box asks if you're wise. The answer takes about fifteen lines of Python.

### Prerequisites

Readers are assumed to know:

- What XOR is and why `A ⊕ B = C` implies `C ⊕ A = B`
- What a known-plaintext attack is
- Basic Python: bytes, hex encoding, modular indexing
- How to connect to a TCP port with Netcat

---

## 🔍 Recon

*(~0 mins into the box)*

This challenge provides `source.py` upfront: no scanning required. Reading it is the entire recon phase.

*The full server source (provided by the challenge):*

```python
import random, socketserver, socket, os, string

flag = open('flag.txt','r').read().strip()   # the real flag: never sent to you directly

def setup(server, key):
    flag = 'THM{thisisafakeflag}'            # local override: this is what gets encrypted
    xored = ""
    for i in range(0, len(flag)):
        xored += chr(ord(flag[i]) ^ ord(key[i % len(key)]))
    hex_encoded = xored.encode().hex()
    return hex_encoded

def start(server):
    res = ''.join(random.choices(string.ascii_letters + string.digits, k=5))
    key = str(res)                           # 5-char random alphanumeric key, new each connection
    hex_encoded = setup(server, key)
    send_message(server, "This XOR encoded text has flag 1: " + hex_encoded + "\n")
    send_message(server, "What is the encryption key? ")
    key_answer = server.recv(4096).decode().strip()
    if key_answer == key:
        send_message(server, "Congrats! That is the correct key! Here is flag 2: " + flag + "\n")
    else:
        send_message(server, 'Close but no cigar\n')
```

Three observations that determine the entire attack:

1. The `setup` function encrypts `'THM{thisisafakeflag}'`: a static local string, not the real flag. We know this plaintext in full before connecting.
2. The key is exactly 5 characters, randomly chosen from `[a-zA-Z0-9]`, and repeats cyclically using `i % len(key)`.
3. The server sends the ciphertext, then asks for the key. Correct key = real flag revealed.

---

## 🚪 Foothold

*(~5 mins into the box)*

### XOR Known-Plaintext Attack: Theory

**What is a known-plaintext attack?** When an attacker knows (or can reliably guess) the original message that was encrypted, they can use that knowledge to recover the encryption key: provided the cipher is vulnerable. XOR with a repeating key is maximally vulnerable because of its self-inverse property:

```
Encryption:  P ⊕ K = C
Decryption:  C ⊕ K = P
Key recovery: C ⊕ P = K
```

If you have `C` (given by the server) and `P` (hardcoded in the source), XORing them directly yields `K`. The key repeats at period 5, so only 5 unique key bytes need recovery:

- **Bytes 0-3** of the key: derived from `THM{` at positions 0-3 of the ciphertext
- **Byte 4** of the key: derived from `}` at the last position of the fake flag (index 19), because `19 % 5 = 4`: landing exactly on key byte index 4

This covers all 5 key bytes without brute force.

### The Decryption Script

*`decoder.py`: written to accept the live hex string as a command-line argument:*

```python
import argparse

def derive_key_part(hex_encoded, known_plaintext, start_index):
    encrypted_bytes = bytes.fromhex(hex_encoded)
    derived_key = ""
    for i in range(len(known_plaintext)):
        derived_key += chr(encrypted_bytes[start_index + i] ^ ord(known_plaintext[i]))
    return derived_key

def xor_decrypt(hex_encoded, key):
    encrypted_bytes = bytes.fromhex(hex_encoded)
    decrypted = ""
    for i in range(len(encrypted_bytes)):
        decrypted += chr(encrypted_bytes[i] ^ ord(key[i % len(key)]))
    return decrypted

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('hex_encoded', type=str)
    args = parser.parse_args()
    hex_encoded = args.hex_encoded

    # Recover key bytes 0-3 from known prefix THM{
    key_start = derive_key_part(hex_encoded, 'THM{', 0)

    # Recover key byte 4 from known suffix } at last ciphertext byte
    key_end = derive_key_part(hex_encoded, '}', len(hex_encoded) // 2 - 1)

    derived_key = (key_start + key_end)[:5]
    print("Derived key:", derived_key)
    print("Decrypted flag 1:", xor_decrypt(hex_encoded, derived_key))

if __name__ == '__main__':
    main()
```

Breaking down the key functions:

- `derive_key_part` takes a known plaintext fragment and its byte offset in the ciphertext, XORing each ciphertext byte against the corresponding plaintext byte to recover those key positions
- `len(hex_encoded) // 2 - 1` converts hex string length to byte count (divide by 2), then points at the last byte: where `}` was encrypted with key byte 4
- `xor_decrypt` applies the full derived key cyclically to produce the plaintext

---

## 💥 Exploitation

*(~8 mins into the box)*

### Test Run: Offline Key Derivation

*Connecting to get the first ciphertext:*

```bash
nc 10.48.180.105 1337
```

```
This XOR encoded text has flag 1: 240d2a1a0041240b0f04353d1320040471040a13312b1552111c091e092502311e5105023d28130d
What is the encryption key?
```

*Running the decryption script against the received hex:*

```bash
python3 decoder.py 240d2a1a0041240b0f04353d1320040471040a13312b1552111c091e092502311e5105023d28130d
```

```
Derived key: pEgap
Decrypted flag 1: THM{p1alntExtAtt4ckcAnr3alLyhUrty0urxOr}
```

Flag 1 recovered. Key is `pEgap`. However: this session was already closed before the key could be submitted. A new connection was opened to test, which produced a completely different ciphertext and key. Submitting `pEgap` to a new session predictably failed.

### Correct Run: Same Session, Live Submit

*Connecting fresh, copying the new ciphertext, running the script in a second terminal, and submitting the key back into the still-open Netcat session:*

```bash
nc 10.48.180.105 1337
```

```
This XOR encoded text has flag 1: 6d797b481608505a5d127c494272124d05555805785f440007557d4f5b334b454f03134b4979411b
What is the encryption key?
```

```bash
python3 decoder.py 6d797b481608505a5d127c494272124d05555805785f440007557d4f5b334b454f03134b4979411b
```

```
Derived key: 9163f
Decrypted flag 1: THM{...}
```

*Typing `9163f` back into the open Netcat prompt:*

```
Congrats! That is the correct key! Here is flag 2: THM{BrUt3_ForC1nG_XOR_cAn_B3_FuN_nO?}
```

---

## 🐇 Rabbit Holes

### Submitting the Key to a New Connection

The cleanest stumble in this box. The server generates a brand new random key on every TCP connection: the ciphertext changes completely each time. Solving one session's ciphertext and submitting the answer to a freshly opened session always returns the troll flag `THM{Try_Again}`. The session must stay open between receiving the ciphertext and submitting the key. *This took an embarrassingly short time to figure out, but it cost one wasted solve attempt.*

---

## 🏁 Flag

| Flag | Value | Location |
| --- | --- | --- |
| Flag 1 | `THM{p1alntExtAtt4ckcAnr3alLyhUrty0urxOr}` | Decrypted offline from server ciphertext |
| Flag 2 | `THM{BrUt3_ForC1nG_XOR_cAn_B3_FuN_nO?}` | Server response on correct key submission |

---

## 🛡️ Mitigations

| Vulnerability | Severity | Mitigation |
| --- | --- | --- |
| Hardcoded known plaintext inside the encryption function | Critical | Never encrypt a static, known string: the known-plaintext attack becomes trivially feasible; use a random nonce or challenge value as plaintext if a challenge-response scheme is needed |
| XOR with a short repeating key | High | Repeating-key XOR is mathematically equivalent to the Vigenère cipher, broken since 1863; use a modern authenticated cipher such as AES-GCM or ChaCha20-Poly1305 with a proper random IV |
| 5-character alphanumeric keyspace | Medium | Even without the known-plaintext flaw, `(26+26+10)^5 = ~916 million` keys is brute-forceable in seconds on modern hardware; key length should be at minimum 128 bits of entropy |

---

## 💡 Key Takeaway

> 💡 **Takeaway:** XOR is not encryption: it is a bitwise operation. Using it with a short repeating key and a known plaintext is equivalent to publishing the key alongside the ciphertext. Security in cryptography must come entirely from key secrecy and algorithmic strength, never from assuming the attacker doesn't know the plaintext. When building any system that involves cryptography, assume the attacker knows your algorithm, knows your plaintext format, and has unlimited compute time. Design accordingly.

---

## 🔁 If I Did It Again

Automate the entire pipeline in a single Python script: open a socket to the server, read the hex ciphertext, derive the key offline, and write the key back through the same socket connection: no manual copy-paste, no risk of the session expiring between receive and submit.

---

## 🔚 Changelog

*Last updated: 2026-06-08*

---

[↑ Back to top](#)
