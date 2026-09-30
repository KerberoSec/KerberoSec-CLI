>> picoCTF --- interencdec

**Challenge name:** interencdec\
**Category:** Cryptography\
**Difficulty:** Easy\
**Author:** NIGHTFURY0X01 (Arash)

## **Objective:** Decode a multi-layer encoded string and recover the flag.

## Summary

This challenge provides a file containing an encoded string.\
By examining the content, we discover that it is encoded multiple times
using **Base64** and finally encoded using a **Caesar cipher**.

The goal is to peel each layer until the real flag appears.

------------------------------------------------------------------------

## Step 1 --- Downloading and Viewing the File

We download the provided file and inspect its content:

``` bash
wget https://artifacts.picoctf.net/c_titan/109/enc_flag
cat enc_flag
```

Output:

    YidkM0JxZGtwQlRYdHFhR3g2YUhsZmF6TnFlVGwzWVROclgyMHdNakV5TnpVNGZRPT0nCg==

This appears to be valid Base64.

------------------------------------------------------------------------

## Step 2 --- First Base64 Decode

``` bash
echo "YidkM0JxZGtwQlRYdHFhR3g2YUhsZmF6TnFlVGwzWVROclgyMHdNakV5TnpVNGZRPT0nCg==" | base64 -d
```

Output:

    b'd3BqdkpBTXtqaGx6aHlfazNqeTl3YTNrX20wMjEyNzU4fQ=='

We still have Base64 inside the decoded string.

------------------------------------------------------------------------

## Step 3 --- Second Base64 Decode

``` bash
echo "d3BqdkpBTXtqaGx6aHlfazNqeTl3YTNrX20wMjEyNzU4fQ==" | base64 -d
```

Output:

    wpjvJAM{jhlzhy_k3jy9wa3k_m0212758}

Now we have something readable but clearly encoded.

The structure resembles a **Caesar cipher**, especially since
`picoCTF{...}` often appears after decryption.

------------------------------------------------------------------------

## Step 4 --- Apply Caesar Cipher Rotation

We use the `tr` command to apply ROT shifts. ROT7 fits:

``` bash
echo "wpjvJAM{jhlzhy_k3jy9wa3k_m0212758}" | tr 'a-zA-Z' 't-za-sT-ZA-S'
```

Output:

    picoCTF{caesar_d3cr9pt3d_f0212758}

This confirms the decoded flag.

------------------------------------------------------------------------

## Result

    Flag: picoCTF{caesar_d3cr9pt3d_f0212758}
