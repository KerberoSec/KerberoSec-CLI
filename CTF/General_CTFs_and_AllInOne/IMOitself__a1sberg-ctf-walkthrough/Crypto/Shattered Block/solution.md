# Shattered Block: Solution Walkthrough

## The Challenge

We're given two things:
- **`chall.py`**: the server's source code
- **A remote server** at `nc 178.128.110.55 4323`

The server encrypts a secret flag using **AES in CBC mode** with PKCS#7 padding, hands us the encrypted flag, and then lets us submit any ciphertext we want. For each one, it tells us just one thing: **"Padding is valid"** or **"Invalid padding!"**

That one-bit answer is all we need to crack the entire flag.

---

## Understanding the Vulnerability

### What is CBC mode?

AES-CBC (Cipher Block Chaining) splits data into 16-byte blocks. Each plaintext block is XORed with the previous ciphertext block before encryption. The first block uses a random **IV** (Initialization Vector) instead. This chaining means flipping a byte in one ciphertext block changes the corresponding byte in the *next* decrypted block, and that's exactly what we exploit.

### What is PKCS#7 padding?

Encryption works on fixed-size blocks (16 bytes). If your message isn't a perfect multiple of 16, padding bytes are added:
- Need 1 byte of padding? Add `\x01`
- Need 5 bytes? Add `\x05\x05\x05\x05\x05`
- Need 16 bytes? Add `\x10` × 16

After decryption, the server checks if this padding is correct. If we tampered with the ciphertext and the padding happens to look right, the server says **"valid"**. If not, **"invalid"**.

### Why is this dangerous?

That valid/invalid response is a **padding oracle**: it leaks information about the decrypted plaintext. By carefully crafting ciphertexts and watching the server's response, we can figure out the plaintext **one byte at a time** without ever knowing the key.

---

## The Solution Process

### Step 1: Reading the Source Code

The server code (`chall.py`) was heavily obfuscated with single-letter variable names, but we deobfuscated it:

| Obfuscated | Meaning |
|------------|---------|
| `_k` | AES key (random 16 bytes) |
| `_i` | IV (random 16 bytes) |
| `_f` | The flag (redacted) |
| `_e(d)` | Encrypt function: AES-CBC with PKCS#7 padding, IV prepended |
| `_v(d)` | Validation function: decrypt and check if padding is valid |
| `_A.new(_k, 2, _i)` | AES cipher in mode 2 (CBC) |

The key detail: `_v()` returns `True` if the padding is valid, `False` otherwise. This is our oracle.

This is 64 bytes total = **4 blocks of 16 bytes** (1 IV block + 3 ciphertext blocks = 48 bytes of plaintext including padding).

### Step 2: The Padding Oracle Attack

Here's the core idea, explained simply:

**Goal:** Figure out what byte is at position X in the plaintext.

**How:** In CBC mode, the decrypted block gets XORed with the *previous* ciphertext block. So if we change byte X of the previous ciphertext block, it directly changes byte X of the decrypted plaintext. We use this to our advantage:

1. **Target the last byte first.** We want the decrypted last byte to be `\x01` (valid 1-byte padding).
2. **Try all 256 possible values** for the last byte of a crafted "previous block."
3. **Send each crafted ciphertext** to the server. When it says "valid," we know the decrypted last byte is `\x01`.
4. **Do the math:** If `crafted_byte XOR intermediate_byte = 0x01`, then `intermediate_byte = crafted_byte XOR 0x01`. And `plaintext_byte = intermediate_byte XOR original_previous_byte`.
5. **Move to the next byte.** Now we want the last TWO bytes to be `\x02\x02`. We already know the intermediate value of the last byte, so we set it to produce `\x02` and brute-force the second-to-last byte.
6. **Repeat** for all 16 bytes, then move to the next block.

### Step 3: Handling False Positives

There's a gotcha: when testing the very last byte, we might get a false positive. For example, if the decrypted bytes happen to end in `\x02\x02`, that's also valid padding, but we'd wrongly think the last byte is `\x01`.

**Fix:** When we find a "valid" response for the last byte, we flip another byte in the crafted block. If padding is still valid, it was a true `\x01` (only the last byte matters). If it becomes invalid, it was a longer padding pattern and we skip it.

### Step 4: Dealing with Network Issues

The first run of the solver failed partway through: the socket response parsing was fragile and sometimes missed the server's reply. We fixed this by:

- Writing a robust `recv_until_prompt()` function that keeps reading until it sees the `> ` prompt
- Adding explicit checks for all three possible server responses: "Success", "Error", and "Invalid hex input"
- Adding timeout handling with graceful fallbacks

## Stats

| Metric | Value |
|--------|-------|
| **Attack type** | CBC Padding Oracle |
| **Blocks decrypted** | 3 (48 bytes, 43 after removing padding) |
| **Queries per byte** | ~128 on average (out of 256 possible) |
| **Total oracle queries** | ~6,144 |
| **Total solve time** | ~7 minutes (limited by network latency) |
| **Solver iterations** | 2 (first version had fragile socket I/O) |

---

## Key Takeaways

1. **Never reveal padding validity.** The server's "valid/invalid" response seems harmless, but it leaks enough to decrypt everything. This is why modern systems use **authenticated encryption** (like AES-GCM): they don't tell you *why* decryption failed.

2. **One bit of information per query is enough.** The oracle only leaks a single yes/no answer, but across ~6,000 queries, that's 6,000 bits of information: more than enough to recover a 344-bit flag.

3. **CBC mode is fragile.** The way CBC chains blocks means tampering with one ciphertext block gives you precise control over the next decrypted block. This property, called **malleability**, is what makes the attack possible.

4. **The challenge name was a hint.** "Shattered Block" + "each block a battlefield" + "break the layers" all point to attacking the block cipher structure one block at a time: which is exactly what a padding oracle attack does.
