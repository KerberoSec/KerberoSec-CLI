# XOR Starter

## Flag
```
crypto{aloha}
```

## Solution

Se hace XOR de cada carácter del string `"label"` con la clave `13`.

```python
original_string = "label"
xor_key = 13
new_string = "".join(chr(ord(char) ^ xor_key) for char in original_string)
flag = f"crypto{{{new_string}}}"
print(flag)
```
