# 🧠 Adinkra Echoes: Steganography & Crypto Writeup

**Category:** Steganography / Cryptography  
**Difficulty:** Medium (200 pts)  
**CTF:** Ecowas CTF  

---

## 📜 Description

> "Listen to this, and let the knot untangle itself."

We are provided with a single image file named `adinkra.png`. The goal is to extract the hidden flag by correctly interpreting the clues provided in the description and analyzing the image.

---

## 📂 Initial Analysis

We start by analyzing the provided image file to understand its structure and look for obvious anomalies.

```bash
file adinkra.png
exiftool adinkra.png
binwalk -e adinkra.png
strings adinkra.png | tail -n 20
```

### Observations

- It's a standard PNG image data file.
- `binwalk` only detects Zlib compressed data at offset 80 (standard for PNGs), with no additional files concatenated at the end.
- `strings` reveals typical compressed data noise at the end (`IEND` chunk), but no clear-text flags or passwords.
- The prompt explicitly mentions "Listen to this" and "knot untangle itself". The title is "Adinkra Echoes".

---

## 🔓 Step 1: LSB Data Extraction

Since simple file concatenation or metadata analysis yielded nothing, we move to analyzing the image pixels themselves, specifically the Least Significant Bits (LSB).

```bash
zsteg -a adinkra.png | grep "{"
```

Output:
```text
b1,a,lsb,xy  .. text: "%RaojssRHS{3pz03g_0f_4d1bxp4_n1v3a3r3}"
b1,a,msb,Xy  .. text: "1d4_f0_g30zp3{SHRssjoaR%"
```

### Conclusion

The flag format is present in the alpha channel's LSB (`b1,a,lsb,xy`), but the text is scrambled. The extracted string `%RaojssRHS{3pz03g_0f_4d1bxp4_n1v3a3r3}` is the ciphertext we need to decode.

---

## 🧪 Step 2: Cryptanalysis (Identifying the Cipher)

We compare the expected flag prefix with the extracted ciphertext prefix:

- **Expected:** `EcowasCTF`
- **Ciphertext:** `RaojssRHS` (ignoring the `%` noise character)

Let's look at the character shifts:
- `R` -> `E` (-13 / +13)
- `a` -> `c` (+2)
- `o` -> `o` (+0)
- `j` -> `w` (+13)

👉 The non-uniform shift confirms this is a **polyalphabetic substitution cipher**, specifically a **Vigenère Cipher**.

---

## 🔑 Step 3: Discovering the Key

To decrypt Vigenère, we need the key. The clues are in the challenge text:
- Title: **Adinkra Echoes**
- Description: **"let the knot untangle itself"**

In West African Adinkra symbology, the symbol that represents the "wisdom knot" is called **Nyansapo**.

👉 The decryption key is: **NYANSAPO**

---

## 🧠 Step 4: The CTF Trick (Continuous Vigenère)

Standard Vigenère decryption tools (like CyberChef) ignore numbers and punctuation, pausing the key index progression on these characters.

When using a standard tool on `3pz03g_0f_4d1bxp4_n1v3a3r3` with the key `NYANSAPO`, the result is garbage (e.g., `3rz03t...`).

**The Catch:**
The challenge author implemented a custom Vigenère algorithm where the key index advances **unconditionally** for every character in the string, including numbers, underscores (`_`), and curly braces (`{`).

---

## 🛠️ Step 5: Decryption & Bypass

To bypass this trick, we must write a custom script or manually align the key across the entire string, not just the alphabetical characters.

### Python Decryption Script

```python
def decrypt_adinkra_vigenere(ciphertext, key):
    key = key.upper()
    decrypted = ""
    key_index = 0

    for char in ciphertext:
        current_key_char = key[key_index % len(key)]
        shift = ord(current_key_char) - ord('A')

        if char.isalpha():
            if char.isupper():
                new_char = chr((ord(char) - ord('A') - shift) % 26 + ord('A'))
            else:
                new_char = chr((ord(char) - ord('a') - shift) % 26 + ord('a'))
            decrypted += new_char
        else:
            # Leave non-alphabetical characters as they are
            decrypted += char

        # THE TRICK: The key index increments for EVERY character
        key_index += 1

    return decrypted

ciphertext = "RaojssRHS{3pz03g_0f_4d1bxp4_n1v3a3r3}"
key = "NYANSAPO"
print(decrypt_adinkra_vigenere(ciphertext, key))
```

---

## 🎯 Step 6: Final Reconstruction

Running the script mathematically untangles the string:

```text
Ciphertext : R a o j s s R H S { 3 p z 0 3 g _ 0 f _ 4 d 1 b x p 4 _ n 1 v 3 a 3 r 3 }
Key stream : N Y A N S A P O N Y A N S A P O N Y A N S A P O N Y A N S A P O N Y A N
Plaintext  : E c o w a s C T F { 3 c h 0 3 s _ 0 f _ 4 d 1 n k r 4 _ v 1 g 3 n 3 r 3 }
```

The decrypted inner string is leetspeak for "Echoes of Adinkra Vigenere", which perfectly aligns with the challenge theme.

---

## 🏁 Final Flag

```text
EcowasCTF{3ch03s_0f_4d1nkr4_v1g3n3r3}
```

---

## 🧠 Key Takeaways

- LSB steganography extraction using `zsteg` is often the fastest initial vector for PNG analysis.
- Themed challenges usually contain the cryptographic key in plain sight (e.g., Nyansapo = Wisdom Knot).
- Standard decryption tools fail against custom implementations; always verify if the key advances unconditionally (Continuous Key Indexing).
- When automatic tools produce near-misses, a custom Python script is necessary to replicate the specific obfuscation logic.
