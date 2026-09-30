# CTF Write-up: VIN

**Category:** Reverse Engineering
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The objective was to recover the correct password and decrypt an embedded flag from a provided Linux ELF binary (`vin`).

## Vulnerability Analysis
### What was wrong?
The binary used a **layered decryption pipeline** (Base64 + XOR + password-based subtraction). While the XOR keys were hardcoded, the final decryption step relied on a user-provided password. However, because the flag prefix (`tzcert{`) was known, the password could be derived using a **known-plaintext attack**.

## Solution
1.  **Static Triage:** Use `file vin` to identify the binary type (64-bit Linux ELF, stripped, statically linked).
2.  **String Analysis:** Use `strings` to find high-signal strings like `Usage:` and `Decrypted flag:`.
3.  **Identify Pipeline:** Analyze the disassembly (using `objdump` or `Ghidra`) to map the decryption steps:
    *   Base64 decode an embedded blob.
    *   Apply repeating-key XOR passes using hardcoded strings: `Welcome!`, `password123`, `milkyway9932`, `miguel2434`.
    *   Apply a password-based subtraction: `byte - password_byte (mod 256)`.
4.  **Known-Plaintext Attack:** Use the known prefix `tzcert{` to solve for the password.
    *   `password[0..6] = "taekwon"`
    *   The natural completion is `taekwondo`.
5.  **Validation:** Run the binary with the recovered password.
    ```bash
    ./vin taekwondo
    ```
    **Output:** `Decrypted flag: tzcert{X0r_@nD_V1GeN3Re_1N_REverSe_ENg1n33rInG_312473297439574}`

## Code Comparison

### Vulnerable Implementation
Using a simple, repeating-key subtraction for encryption:
```c
// C code (Vulnerable)
for (int i = 0; i < len; i++) {
    buf[i] = (buf[i] - password[i % pass_len]) % 256;
}
```

### Secure Implementation
Use a robust, authenticated encryption scheme like **AES-GCM** with a key derived from a strong password using a slow, salted KDF like **Argon2**.
```c
// C code (Secure)
unsigned char key[32];
argon2id_hash_raw(t, m, p, password, pass_len, salt, salt_len, key, 32);
// Use the derived key with AES-GCM
```

## Lessons Learned
*   **Known-Plaintext Attacks:** If any part of the plaintext is known (like a flag prefix), simple encryption schemes (XOR, addition, subtraction) can be easily reversed.
*   **Layered Obfuscation:** Multiple layers of simple encryption (XOR, Base64) do not provide strong security if the keys are hardcoded or the scheme is mathematically weak.
*   **Static Analysis:** Tools like `strings` and `objdump` are essential for reconstructing program logic in stripped binaries.

## Flag
`tzcert{X0r_@nD_V1GeN3Re_1N_REverSe_ENg1n33rInG_312473297439574}`
