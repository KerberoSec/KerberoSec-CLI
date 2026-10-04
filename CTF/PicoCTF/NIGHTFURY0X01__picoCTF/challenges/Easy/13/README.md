>> picoCTF --- ROT13

**Challenge name:** 13\
**Category:** Cryptography\
**Difficulty:** Easy\
**Author:** NIGHTFURY0X01 (Arash)

## **Objective:** Decode a ROT13‑encoded string to recover the flag.

## Summary

This challenge provides a short encrypted string using the ROT13
substitution cipher:

    cvpbPGS{abg_gbb_onq_bs_n_ceboyrz}

ROT13 is a simple Caesar cipher that shifts each letter by 13 positions.
Since the alphabet has 26 letters, applying ROT13 twice returns the
original text. ROT13 is commonly used in CTF challenges as a basic
introduction to cryptography.

------------------------------------------------------------------------

## Step 1 --- Identify the Cipher

The challenge explicitly mentions ROT13, and the ciphertext contains
only alphabetic characters, which fits the characteristics of a ROT
cipher.\
To decode ROT13 on Linux, we can use the `tr` command:

``` bash
echo "cvpbPGS{abg_gbb_onq_bs_n_ceboyrz}" | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

------------------------------------------------------------------------

## Step 2 --- Decoding the String

Running the command produces:

    picoCTF{not_too_bad_of_a_problem}

This confirms the correct flag and demonstrates how straightforward
ROT13 is to reverse.

------------------------------------------------------------------------

## Result

    Flag: picoCTF{not_too_bad_of_a_problem}
