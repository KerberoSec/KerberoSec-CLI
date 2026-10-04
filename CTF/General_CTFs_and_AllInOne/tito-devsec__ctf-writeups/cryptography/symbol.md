# CTF Write-up: Symbol

**Category:** Cryptography
**Challenge Source:** tcraCyber champion 2026
**Write-up Author:** TitoDevsec (T1t0D3v$3c)

## Challenge Summary
The challenge provided an image (`symbols.png`) containing a message written in mysterious symbols. The goal was to decipher the symbols.

## Solution
1.  **Visual Analysis:** The symbols consisted of corner/box shapes and dots. This is a characteristic of the **Pigpen cipher** (also known as the Masonic cipher).
2.  **Deciphering:** Use a Pigpen cipher key or an online decoder (like dCode) to map the symbols to letters.
3.  **Variant Testing:** Since there are different mappings for Pigpen, test common variants until a readable English phrase is found.
4.  **Result:** The decoded phrase was `LOCKYOURDOORS`.

## Lessons Learned
*   **Historical Ciphers:** Familiarity with classical and historical ciphers (Pigpen, Caesar, Vigenère) is essential for "Misc" and "Crypto" challenges.
*   **Visual Pattern Recognition:** Being able to identify a cipher based on its visual representation can save significant time.

## Flag
`tzcert{LOCKYOURDOORS}`
