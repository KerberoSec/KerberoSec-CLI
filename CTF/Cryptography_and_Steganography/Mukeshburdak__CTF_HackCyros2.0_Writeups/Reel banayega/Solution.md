🕷 Reel banayega: CTF Writeup
-
<p align="center"> <img src="https://img.shields.io/badge/Category-Cryptography-blue?style=for-the-badge"> <img src="https://img.shields.io/badge/Difficulty-Medium-orange?style=for-the-badge"> <img src="https://img.shields.io/badge/Technique-XOR%20Encryption-red?style=for-the-badge"> </p>

🧠 Challenge Overview
-
Munna Bhai is frustrated with the song “Chuttamalle” playing on loop and hides the secret in pieces.

Krish introduces another twist by providing his own song file.

The challenge provides:

🎥 challenge_video.mp4
-
🖼 nahi.jpeg (actually WEBP)
-
🎵 Krish_ka_gana_sunega.webm
-
The description hints that:

The secret is encrypted

The key is hidden elsewhere

Multiple layers of obfuscation are involved

🎯 Objective
-
Recover the final flag by:

Extracting hidden data from media files

Identifying the encryption method

Finding the XOR key

Decrypting the ciphertext

🔍 Step 1: Analyze the Files
-
📁 Observations
-
nahi.jpeg was actually a WEBP file

Both nahi and spidey.mp4 had extra appended bytes

Each contained:

[39 encrypted bytes] + "CYROS" + [same 39 encrypted bytes repeated]

This repetition suggested XOR-based encryption.

<img width="1650" height="829" alt="Screenshot 2026-02-28 012559" src="https://github.com/user-attachments/assets/3a5c7ec0-8654-414b-9bfd-b4ac2521bda5" />

🔐 Step 2: Extract the XOR Key
-
Inside:

Krish_ka_gana_sunega.webm

The string:

KEY-Krish42

was appended at the end of the file.

So the XOR key was:

Krish42

🧩 Step 3: Understand the Encryption
-
Encryption logic discovered:

Cipher1 ⊕ Cipher2 ⊕ Key = Plaintext

Steps:

XOR ciphertext from nahi

XOR ciphertext from spidey.mp4

XOR result with key Krish42

This revealed the original flag.

🚩 Final Flag
-
cyros{chuttamalle_spidey_is_vibin_hard}

🧠 Technical Explanation
-
The attacker used:

XOR encryption

File data appending

Multiple ciphertext fragments

Hidden key inside media file

XOR works because:

A ⊕ B ⊕ B = A

So combining the encrypted parts and applying the correct key reveals the plaintext.

🛠 Tools Used
-
Hex editor / binwalk

Strings command

XOR script (Python)

Media file inspection tools

💻 Example XOR Script (Python)
-
def xor_bytes(data, key):

    return bytes([data[i] ^ key[i % len(key)] for i in range(len(data))])

key = b"Krish42"

cipher1 = open("cipher1.bin", "rb").read()
cipher2 = open("cipher2.bin", "rb").read()

intermediate = bytes([a ^ b for a, b in zip(cipher1, cipher2)])
flag = xor_bytes(intermediate, key)

print(flag.decode())
