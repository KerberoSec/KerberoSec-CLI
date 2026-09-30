# Familiar

Platform: Information and Technology Festival 2023

## Description

> Reinventing the wheel can be stupid sometimes.
> >*(Author: aimardcr)*

Two files were attached:

`main.py`:

```python
def encode(data):
    charset = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
    padd = "="

    binstr = "".join(format(byte, "08b") for byte in data)
    padding = (5 - len(binstr) % 5) % 5
    binstr += "0" * padding
    groups = [binstr[i:i+5] for i in range(0, len(binstr), 5)]  # groups it into 5-bit chunks

    result = ""
    for group in groups:
        dec = int(group, 2)
        result += charset[dec]

    result += padd * (padding // 2)
    return result

FLAG = "flag{fake_flag_dont_submit}"
print(encode(FLAG.encode()))
```

`result.txt`:

```text
*&(&)<+$*"$%+?_?:.,[;[+~+{](+`#%,|![{[*;.]^@}@,>'.:@)_"<+.:?+`>$'"#$#`=((|};==
```

## Solution

The encoding function takes a string (data) as input and encodes it using a custom character set and padding scheme. It converts the input string into binary, groups the binary digits into 5-bit chunks, and maps these chunks to characters in the custom character set to produce the encoded result.

To reverse the encoding, we need to remove any padding characters (=) from the end of the encoded string. Map each character in the encoded string back to its corresponding 5-bit binary representation using the custom character set.
Remove any trailing zeros that were added during encoding. And lasty, convert the resulting binary string into bytes.

To overcome the issue of double quotes `(")` inside a string enclosed by double quotes we can use a backslash (\) before the inner double quotes to indicate that they are part of the string and not the string delimiters

`reverse.py`:

```python
def decode(encoded_str):
    charset = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
    padd = "="

    # Remove padding characters from the end
    while encoded_str.endswith(padd):
        encoded_str = encoded_str[:-1]

    # Create a binary string by converting characters from the charset back to binary
    binstr = "".join(format(charset.index(char), "05b") for char in encoded_str)

    # Remove any trailing zeros added during encoding
    binstr = binstr.rstrip("0")

    # Convert the binary string to bytes
    decoded_bytes = bytes(int(binstr[i:i+8], 2) for i in range(0, len(binstr), 8))

    return decoded_bytes

# Usage
encoded_str =  "*&(&)<+$*\"$%+?_?:.,[;[+~+{](+`#%,|![{[*;.]^@}@,>'.:@)_\"<+.:?+`>$'\"#$#`=((|};=="
decoded_data = decode(encoded_str)
print(decoded_data.decode())
```

**Flag:** `INTECHFEST{WhY_W0ulD_AnY0n3_Us3_Th1S_Enc0D1nG?}`
