## HV19.08 SmileNcryptor 4.0

You hacked into the system of very-secure-shopping.com and you found a SQL-Dump with \$\$-creditcards numbers. As a good hacker you inform the company from which you got the dump. The managers tell you that they don't worry, because the data is encrypted.

Dump-File: `dump.zip`

#### Goal

Analyze the "Encryption"-method and try to decrypt the flag.

### Solution

When looking at the encrypted credit card numbers, we can see that the characters are close to each other. As also the input characters (0-9) are close, we suspect that this might be a transposition cipher. However, the longer the number gets, the bigger is the offset between the expected source range (0-9) and the target range (Q-b). Therefore, my guess was that the offset increases depending on the position.

I created a small python script to brute force the possible offset values accross all credit card numbers, assuming that there must be one offset that leads to valid credit card numbers. For each position in the encrypted data, I increased the offset by one. Running my program revealed that the only possible offset in this scenario is `30`. When using this value as an initial offset, I was able to decrypt the content of the flag-table:

```python
#!/usr/bin/python3
import sys

encrypted_flag = r"SlQRUPXWVo\Vuv_n_\ajjce"
encrypted_ccards = [r"QVXSZUVY\ZYYZ[a", r"QOUW[VT^VY]bZ", r"SPPVSSYVV\YY_\\]", r"RPQRSTUVWXYZ[\]^", r"QTVWRSVUXW[_Z`\b]"]

def decrypt(input, initialShift):
    shift = initialShift
    output = ""

    for c in input:
        target = ord(c) - shift
        try:
            output += chr(target)
        except:
            break

        shift += 1

    return output

for encrypted_card in encrypted_ccards:
    decrypted = decrypt(encrypted_card, 30)
    if len(decrypted) == len(encrypted_card):
        print(decrypted)

print("Flag: HV19{%s}" % (decrypt(encrypted_flag, 30)))
```

**Flag:** HV19{5M113-420H4-KK3A1-19801}
