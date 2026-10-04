#  CryptoHack: Base64

## Problem Statement

Another common encoding scheme is Base64, which allows us to represent binary data as an ASCII string using an alphabet of 64 characters. One character of a Base64 string encodes 6 binary digits (bits), and so 4 characters of Base64 encode three 8-bit bytes.

Base64 is most commonly used online, so binary data such as images can be easily included into HTML or CSS files.

Take the below hex string, decode it into bytes and then encode it into Base64.

`72bca9b68fc16ac7beeb8f849dca1d8a783e8acf9679bf9269f7bf`

## Information

**Point Value**: 10 points

**Category**: Cryptography

## Hints
In Python, after importing the base64 module with `import base64`, you can use the `base64.b64encode()`function. Remember to decode the hex first as the challenge description states.

## Solution

Using CyberChef decode the string From Hex and encode it To Base64. Retrieve the flag.

## Flag
`crypto/Base+64+Encoding+is+Web+Safe/`
