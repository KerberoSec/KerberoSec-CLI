# CTF Write-up: SIRI-2

**Category:** Mobile Security / Reverse Engineering
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The challenge provided an Android APK (`siri-2.release.apk`). The goal was to extract a hidden flag protected by multiple layers of encryption, including an encrypted database (SQLCipher) and a hidden native library.

## Vulnerability Analysis
### What was wrong?
The application relied on **hardcoded encryption keys** and **client-side key derivation logic**. While the keys were hidden in native code and encrypted assets, they were still recoverable through static and dynamic analysis.

## Solution
1.  **Unpack APK:** Extract the APK contents using `unzip`.
2.  **Identify Database:** Locate `assets/siri-2.db`. It's an encrypted SQLCipher database.
3.  **Trace Logic (JADX):** Use JADX to find where the database is opened. The key is derived by a native method `Secrets.derivePassword()`.
4.  **Decrypt Native Library:** A hidden asset `libsecrets.so` is decrypted at runtime using AES-256-ECB with a hardcoded key: `816ad66faf299e650a8224894c8aed7966cbe52fb32a085c3789be9f66fa10b5`.
    ```bash
    openssl enc -d -aes-256-ecb -K <key> -in libsecrets.so -out libsecrets.dec.so
    ```
5.  **Reverse Native Code (Ghidra):** Analyze `libsecrets.dec.so` to find the SQLCipher key: `SUP3R_S3CR37_K3Y_2026`.
6.  **Decrypt Database:** Use `sqlcipher` with the recovered key and specific parameters (page size, KDF iterations, HMAC algorithm) to extract the `encrypted_flag`.
7.  **Final Decoding:** The `encrypted_flag` is XOR-decoded using the same key material to reveal the final flag.

## Code Comparison

### Vulnerable Implementation
Hardcoding encryption keys in the application:
```java
// Java code (Vulnerable)
String key = "SUP3R_S3CR37_K3Y_2026";
SQLiteDatabase db = SQLiteDatabase.openOrCreateDatabase(dbFile, key, null);
```

### Secure Implementation
Never store encryption keys on the client side. Use a secure key management system (like Android Keystore) or derive keys from user-provided secrets that are never stored.
```java
// Java code (Secure)
KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
keyStore.load(null);
SecretKey secretKey = (SecretKey) keyStore.getKey("my_secure_key", null);
// Use the key from the secure Keystore
```

## Lessons Learned
*   **Client-Side Secrecy:** There is no such thing as a secret on the client side. Any key or logic shipped with the app can be recovered by a determined analyst.
*   **Layered Security:** While multiple layers of encryption (AES, SQLCipher, XOR) make analysis harder, they don't provide absolute security if the root keys are accessible.
*   **Native Code Reversing:** Reversing JNI and native libraries is a critical skill for mobile security assessments.

## Flag
`tzcert{1F_Y0U_4R3_1ST_BL00D-AIRTEL_10K_VOUCHER_30621628153116}`
