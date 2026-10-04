# CTF Write-up: CIA

**Category:** Warm Up
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The challenge provided a Base64 encoded string: `dHpjZXJ0e2lfNG1fdGgzX2NoYW1wMTBufQ==`. The goal was to decode it to find the flag.

## Solution
1.  **Identification:** The string ends with `==`, which is a classic indicator of Base64 padding.
2.  **Decoding:** Use a command-line tool or an online decoder to retrieve the plaintext.
    ```bash
    echo "dHpjZXJ0e2lfNG1fdGgzX2NoYW1wMTBufQ==" | base64 -d
    ```
    **Output:** `tzcert{i_4m_th3_champ10n}`

## Lessons Learned
*   **Encoding vs. Encryption:** Base64 is an encoding scheme used for data representation, not for security. It can be easily reversed by anyone.
*   **Pattern Recognition:** Recognizing common encoding formats (like Base64, Hex, or Rot13) is a fundamental skill in CTFs.

## Flag
`tzcert{i_4m_th3_champ10n}`
