# Caesar
## Description
Decrypt this message.

## Solution
The message is encrypted using a Caesar cipher, so i made a python script to decrypt it.

```python
message = 'gvswwmrkxlivyfmgsrhnrisegl'  # encrypted message
LETTERS = 'abcdefghijklmnopqrstuvwxyz'

for key in range(len(LETTERS) + 1):
    translated = ''
    for symbol in message:
        if symbol in LETTERS:
            num = LETTERS.find(symbol)
            num = num - key
            if num < 0:
                num = num + len(LETTERS)
            translated = translated + LETTERS[num]
        else:
            translated = translated + symbol
    print('Key #%s: picoCTF{%s}' % (key, translated))
```

This script will try to "bruteforce" the key by trying all the possible keys. 

The flag will in this case be revealed at key #4.
