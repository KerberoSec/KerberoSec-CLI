#  PicoCTF-2023: Mind your Ps and Qs

## Problem Statement

In RSA, a small e value can be problematic, but what about N? Can you decrypt this? [values](https://mercury.picoctf.net/static/b9ddda080c56fb421bf30409bec3460d/values)

## Information

**Point Value**: 20 points

**Category**: Forensics

## Hints

1. Bits are expensive, I used only a little bit over 100 to save money

## Tags

picoCTF2021
Forensics

## Solution
The file 'values.txt' gives me three variables. In a RSA Cipher, we put the variable `c` as the message, the variable `e` as the public key and `n` as the public key value. It gives us the flag already decrypted.

## Flag
picoCTF{sma11_N_n0_g0od_73918962}
