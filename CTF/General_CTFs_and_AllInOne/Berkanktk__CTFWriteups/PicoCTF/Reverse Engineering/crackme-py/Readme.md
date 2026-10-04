# Crackme-py
## Description
None

## Solution
The `bezos_cc_secret` is encrypted using ROT47, which is a simple encryption technique that involves rotating each letter in a message by 47 places in the alphabet. It is a form of Caesar cipher, where the shift is always 47.

To solve this challenge, I created a python script to decrypt the message.

```python
alphabet = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ" + \
           "[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
encoded_str = "A:4@r%uL`M-^M0c0AbcM-MFE0d_a3hgc3N"

decoded_str = ""
for c in encoded_str:
    index = alphabet.index(c)
    decoded_index = (index - 47) % len(alphabet)
    decoded_char = alphabet[decoded_index]
    decoded_str += decoded_char

print(decoded_str)
```

However, this could also be solved simply by using CyberChef.
