# You either know, XOR you don't

## Flag
```
crypto{1f_y0u_Kn0w_En0uGH_y0u_Kn0w_1t_4ll}
```

## Solution

Se descubre la clave repetida `myXORkey` y se usa para hacer XOR con el ciphertext byte a byte.

```python
hex_string = "0e0b213f26041e480b26217f27342e175d0e070a3c5b103e2526217f27342e175d0e077e263451150104"
ciphertext = bytes.fromhex(hex_string)
key = b"myXORkey"
flag_bytes = bytes(c ^ key[i % len(key)] for i, c in enumerate(ciphertext))
flag = flag_bytes.decode("ascii")
print(flag)
```
