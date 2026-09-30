# CTF Write-up: Enigma

**Category:** Reverse Engineering / Forensics
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The objective was to reverse an intercepted message provided as `enigma.raw.zip` and extract a hidden CTF flag.

## Solution
1.  **Unpack Archive:** Extract the ZIP archive to obtain `enigma.raw`.
2.  **Identify Encoding:** The first characters of `enigma.raw` begin with `H4sIA....`, which is a common prefix for a **Base64-encoded gzip stream**.
3.  **Decoding:** Base64-decode the content and check the first bytes.
    ```bash
    # Expected gzip signature: 1f 8b 08
    echo "H4sIA..." | base64 -d | xxd | head
    ```
4.  **Decompression:** Decompress the gzip stream. Even if the stream is truncated, a tolerant inflater can recover the beginning of the decompressed text.
    ```python
    # Conceptual Python script
    import base64, zlib
    raw = open('enigma.raw','rb').read()
    gz = base64.b64decode(raw)
    d = zlib.decompressobj(wbits=16+zlib.MAX_WBITS)
    ps = d.decompress(gz) + d.flush()
    print(ps.decode('utf-8','replace'))
    ```
5.  **Script Analysis:** The decompressed content is a **PowerShell script**. Within it, a call to `[System.Convert]::FromBase64String('...')` was found.
6.  **Flag Extraction:** Decode the embedded Base64 string: `dHpjZXJ0e0dYbzN0TGNQaE1AMEMtcHMzfQ==`.
    ```bash
    echo "dHpjZXJ0e0dYbzN0TGNQaE1AMEMtcHMzfQ==" | base64 -d
    ```
    **Output:** `tzcert{GXo3tLcPhM@0C-ps3}`

## Lessons Learned
*   **Encoding Prefixes:** Recognizing common Base64 prefixes (like `H4sIA` for gzip) is a powerful skill for quick triage.
*   **Tolerant Decompression:** Truncated or corrupted streams can often still be partially recovered using the right tools and techniques.
*   **Script Analysis:** Embedded data in scripts (PowerShell, Python, JavaScript) is a common way to hide flags or second-stage payloads.

## Flag
`tzcert{GXo3tLcPhM@0C-ps3}`
