**Category:** Steganography  
**Points:** 250  
**Author:** Sami Choudhary

**Challenge statement:**  
> The minions have hidden a flag inside `Minions.jpeg` using steganography. Clues in the image’s metadata may reveal the passphrase needed to extract it. Can you uncover their secret?

---

## Files provided
- `Minions.jpeg`: image containing hidden data
- (After extraction) `flag.txt`: base64-encoded flag

---

## Reproduction (what players see)
Opening the image shows nothing special, but metadata contains hints.

---

## Quick solution (one-line)
Check metadata with exiftool, find the passphrase `my admin`, extract with steghide, then base64-decode the hidden file to get the flag `SW{this_is_fun}`.

---

## Step-by-step analysis & solution
1. Inspect metadata  
   Use exiftool to view metadata and find the passphrase (example output shows `Keywords : my admin`). The passphrase is `my admin`.

2. Extract hidden file with steghide  
   Use the discovered passphrase to extract the hidden file; steghide will write `flag.txt` to the current directory.

3. Decode the extracted file  
   The extracted `flag.txt` contains base64 text. Decode it to reveal `SW{this_is_fun}`.

---

The final flag is:  
**`SW{this_is_fun}`**

---

Notes:
- If steghide fails, try alternative tools such as binwalk or foremost, but here the metadata passphrase and steghide are the intended path.
- Consider avoiding raw flags in public repos if you want participants to solve challenges without spoilers.
EOF
