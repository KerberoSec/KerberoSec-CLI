
# Challenge: LayeredLocked
**Category:** Cryptography / Multi-layer (archive + password + hash)  
**Points:** 250  
**Author:** Sami Choudhary

**Challenge statement:**  
> You’ve stumbled upon a mysterious archive named `Layeredlocked.zip`. It won’t give up its secrets so easily.  
> Flag Format: `SW{some_thing}`

---

## Files provided
- `Layeredlocked.zip`: password-protected ZIP archive

---

## Reproduction (what players see)
Trying to open the ZIP normally fails because it is password protected.

---

## Quick solution (one-line)
Use a wordlist to crack the ZIP password (`abc123`), extract `raw.txt` which contains a hash, then crack that hash (via CrackStation or local cracking) to recover `p@ssw0rd!`. The flag is:  
**SW{p@ssw0rd!}**

---

## Step-by-step analysis & solution

1. **Confirm the archive**  
   Check the file type:  
   $ file Layeredlocked.zip  
   Layeredlocked.zip: Zip archive data, at least v2.0 to extract

2. **Crack the ZIP password (layer 1)**  
   The ZIP is password-protected. Use a wordlist (e.g., `rockyou.txt`) with tools such as `fcrackzip`, `john` (via `zip2john`), or `7z` to bruteforce or dictionary-attack the archive. Example results show the password `abc123`.

3. **Extract archive with discovered password**  
   Use the found password to extract the archive. Extraction yields a file named `raw.txt` (or similar) inside the extracted directory.

4. **Inspect raw.txt: it contains a hash**  
   Open `raw.txt` to see the contained hash string. The hash type may vary; the file contains a crackable hash.

5. **Crack the hash (layer 2)**  
   Use an online service like CrackStation or local cracking tools (`john`, `hashcat`) with appropriate format selection or wordlists to recover the plaintext. For example, the hash resolves to `p@ssw0rd!`.

6. **Final flag**  
   Wrap the recovered plaintext in the flag format:  
   **SW{p@ssw0rd!}**

---

## Notes
- If the hash type is unknown, use `hash-identifier` or try common formats with `john`/`hashcat`.  
- If ZIP cracking is slow, narrow wordlists or targeted rules help.  
- Consider removing raw flags from public repos or keeping a separate private solutions branch to avoid spoiling challenges.
EOF

