#  PicoCTF2023: information

## Problem Statement

Files can always be changed in a secret way. Can you find the flag? [cat.jpg](https://mercury.picoctf.net/static/d1375e383810d8d957c04eef9e345732/cat.jpg)

## Information

**Point Value**: 10 points

**Category**: Forensics

## Hints

1. Look at the details of the flag.
## Tags

picoCTF2021
Forensics

## Solution

Rendered image, and while looking at photo's info, noticed the license was a bit too long. Copied and decrypted it from Base64 and, there you go! Your flag is there.

## Flag

picoCTF{the_m3tadata_1s_modified}

