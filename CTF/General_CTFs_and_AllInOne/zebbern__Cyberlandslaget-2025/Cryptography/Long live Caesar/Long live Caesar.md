
# Writeup: Decrypting the Modified Caesar Cipher

This challenge uses a modified version of the Caesar cipher where each character is encrypted by multiplying its index in a custom Danish alphabet by the index of a secret key character. The custom alphabet is:

```
abcdefghijklmnopqrstuvwxyzæøå
```

This alphabet has 29 characters. The encryption function computes the new index as follows:

```
new_index = (index(text_char) * index(key)) mod 29
```

To decrypt the ciphertext, you need to reverse this process. Since multiplication is used, you must compute the **modular inverse** of the key’s index under modulo 29. The modular inverse of a number `a` (with respect to modulo `m`) is a number `inv` such that:

```
(a * inv) mod m = 1
```

Using the modular inverse, you can recover the original character with:
 
```
original_index = (index(ciphertext_char) * mod_inverse(key_index)) mod 29
```

Because the key is chosen randomly (and is not `'a'`), we can’t know it in advance. Instead, we **brute-force** all possible key values (ignoring `'a'`) until we find one that produces plaintext that contains the expected flag format (`ddc` as a marker).

Below is the Python script that implements this logic:

```python
import string

# Danish alphabet used in encryption
alphabet = 'abcdefghijklmnopqrstuvwxyzæøå'
alphabet_size = len(alphabet)

# Provided ciphertext from encryption.txt
ciphertext = "uux fwnqeefæzr bq eayr xareah"

# Function to compute the modular inverse of 'a' under modulo 'modulo'
def mod_inverse(a, modulo):
    for i in range(1, modulo):
        if (a * i) % modulo == 1:
            return i
    return None  # Return None if no modular inverse exists

# Function to decrypt the text using a given key index (modular inverse method)
def decrypt(text, key_index):
    plaintext = ""
    mod_inv = mod_inverse(key_index, alphabet_size)
    if mod_inv is None:
        return "No modular inverse found. Key may be invalid."
    for char in text:
        # Preserve whitespace
        if char in string.whitespace:
            plaintext += char
        else:
            # Multiply by the modular inverse and take modulo to find original index
            decrypted_index = (alphabet.index(char) * mod_inv) % alphabet_size
            plaintext += alphabet[decrypted_index]
    return plaintext

# Brute-force all possible keys (skipping 'a' since it's not allowed) to find the correct decryption.
for key in alphabet[1:]:
    key_index = alphabet.index(key)
    decrypted_text = decrypt(ciphertext, key_index)
    # Check for the expected marker 'ddc' in the plaintext
    if "ddc" in decrypted_text:
        # Format the flag according to the challenge requirements
        flag = "DDC{" + decrypted_text.replace(' ', '_') + "}"
        print("The decrypted flag is:")
        print(flag)
        break
```

### How to Run

1. **Copy the entire script above** into a file named, for example, `decrypt.py`.
2. **Run the script** using Python 3:
   ```bash
   python3 decrypt.py
   ```
3. The script will output the decrypted flag:
   ```
   DDC{ddc_impossible_to_save_caesar}
   ```

This writeup and code will allow anyone to reproduce the decryption and obtain the flag exactly as we did. Enjoy!
