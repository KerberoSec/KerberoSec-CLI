# CTF Write-up: Memory Forensics: NTLM Password Cracking

**Category:** Forensics / Memory Forensics
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The objective was to recover the plaintext password for the Windows account `admin` from a provided memory image (`me.mem`) using a provided wordlist (`dictionary.txt`).

## Vulnerability Analysis
### What was wrong?
The Windows system used NTLM (NT LAN Manager) hashes to store user passwords. NTLM hashes are computed as the MD4 hash of the UTF-16LE encoded password. These hashes are vulnerable to offline dictionary attacks if they are extracted from memory or the SAM database.

## Solution
1.  **Hash Extraction:** Use Volatility 3's `windows.hashdump` plugin to extract the NTLM hash for the `admin` account.
    ```bash
    vol -f me.mem windows.hashdump
    ```
    *   **User:** `admin`
    *   **NTLM Hash:** `4b9d9d134c6ac77ce7f6c59553996398`
2.  **Dictionary Attack:** Use a script or a tool like `hashcat` to test each candidate in the provided `dictionary.txt`.
    ```python
    # Conceptual Python script
    import hashlib
    target = "4b9d9d134c6ac77ce7f6c59553996398".lower()
    with open("dictionary.txt", "r") as f:
        for word in f:
            word = word.strip()
            ntlm = hashlib.new("md4", word.encode("utf-16le")).hexdigest()
            if ntlm == target:
                print("MATCH:", word)
    ```
3.  **Result:** The password was found to be `tzcert{9Zx@#2}`.

## Code Comparison

### Vulnerable Configuration
Using weak or common passwords that can be easily cracked:
*   **User:** `admin`
*   **Password:** `tzcert{9Zx@#2}` (Found in a dictionary)

### Secure Configuration
Enforce strong password policies (length, complexity, rotation) and use modern authentication protocols like Kerberos or multi-factor authentication (MFA) to mitigate the risk of password cracking.
*   **User:** `admin`
*   **Password:** `k9#fL2!mPq8*zXvR` (Strong, random, not in any dictionary)

## Lessons Learned
*   **Hash Extraction:** Volatility's `hashdump` is the standard tool for extracting cached credentials from memory.
*   **NTLM Vulnerability:** NTLM hashes are relatively weak and can be cracked quickly using modern hardware and well-crafted wordlists.
*   **Password Complexity:** Even if a password looks complex, if it's in a dictionary, it's not secure.

## Flag
`tzcert{9Zx@#2}`
