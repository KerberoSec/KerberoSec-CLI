# Confusion through Substitution

## Flag
```
crypto{l1n34rly}
```

## Solution

Se aplica la transformación inversa de SubBytes usando la S-box inversa de AES sobre cada byte del estado.

```python
def sub_bytes(s, sbox):
    return [[sbox[byte] for byte in row] for row in s]

new_state = sub_bytes(state, sbox=inv_s_box)
flag = matrix2bytes(new_state)
print(flag.decode())
```
