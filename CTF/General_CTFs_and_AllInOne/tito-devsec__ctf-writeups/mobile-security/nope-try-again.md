# CTF Write-up: Nope! Try Again

**Category:** Mobile Security / Cryptography
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The challenge provided an Android APK (`TZ-CERT.apk`). The goal was to extract embedded cryptographic material from the APK and recover a hidden flag.

## Vulnerability Analysis
### What was wrong?
The application used **hardcoded cryptographic parameters** (key material, IV, AAD) and a **predictable key derivation function** (SHA-256 truncation). This allowed anyone with access to the APK to reproduce the decryption logic and recover the flag.

## Solution
1.  **Unpack APK:** Extract the APK contents using `unzip`.
2.  **Triage (strings):** Scan `classes.dex` for obvious hints.
    ```bash
    unzip -p TZ-CERT.apk classes.dex | strings | grep -E "AES/GCM|tzcert{"
    ```
    *   **Key Material:** `TZCERT2026!`
    *   **AAD:** `contact_screenshot_gate`
    *   **IV (Base64):** `hOjynDbAuga9JYc0`
    *   **Ciphertext (Base64):** `7TuVQIe+4BkwVXkjxOayIqOgRFpgLnq+73cuz13lvoPFJfb2Q4JMGdunzdQ=`
3.  **Decompile (JADX):** Locate the `handleSubmit` method in `com.tzcert.tanzaniacert.ContactActivity`.
4.  **Key Derivation:** The code derives an AES-128 key by taking the first 16 bytes of the SHA-256 hash of the key material.
5.  **Decryption (Python):** Reproduce the AES-GCM decryption in Python using the extracted parameters.
    ```python
    # Conceptual Python script
    from hashlib import sha256
    import base64
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    key = sha256(b"TZCERT2026!").digest()[:16]
    iv = base64.b64decode("hOjynDbAuga9JYc0")
    ct = base64.b64decode("7TuVQIe+4BkwVXkjxOayIqOgRFpgLnq+73cuz13lvoPFJfb2Q4JMGdunzdQ=")
    aad = b"contact_screenshot_gate"
    pt = AESGCM(key).decrypt(iv, ct, aad)
    print(pt.decode())
    ```
6.  **Result:** The decrypted plaintext reveals the flag.

## Code Comparison

### Vulnerable Implementation
Hardcoding cryptographic parameters in the application:
```java
// Java code (Vulnerable)
String keyMaterial = "TZCERT2026!";
String iv = "hOjynDbAuga9JYc0";
String aad = "contact_screenshot_gate";
// ... AES-GCM decryption
```

### Secure Implementation
Use a secure key management system (like Android Keystore) and ensure that IVs are unique and non-predictable for every encryption operation.
```java
// Java code (Secure)
KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
keyStore.load(null);
SecretKey secretKey = (SecretKey) keyStore.getKey("my_secure_key", null);
// Use a random IV for every operation
byte[] iv = new byte[12];
new SecureRandom().nextBytes(iv);
```

## Lessons Learned
*   **Hardcoded Parameters:** Cryptographic parameters (keys, IVs, AAD) should never be hardcoded in the application.
*   **AES-GCM Integrity:** AES-GCM provides both confidentiality and integrity. If any parameter (like AAD) is incorrect, the decryption will fail.
*   **Key Derivation:** Always use a robust, standard key derivation function (like PBKDF2 or Argon2) instead of simple hashing and truncation.

## Flag
`tzcert{Th15_1s_h0w_Do_1t!!!}`
