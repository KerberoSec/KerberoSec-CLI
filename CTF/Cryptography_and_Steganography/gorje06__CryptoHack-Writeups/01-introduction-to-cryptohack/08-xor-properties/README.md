# XOR Properties

## Flag
```
crypto{x0r_i5_ass0c1at1v3}
```

## Solution

Usando las propiedades del XOR (asociatividad y conmutatividad), se combinan los tres valores hex para recuperar el flag.

```python
key1 = bytes.fromhex("a6c8b6733c9b22de7bc0253266a3867df55acde8635e19c73313")
key2_xor_key3 = bytes.fromhex("c1545756687e7573db23aa1c3452a098b71a7fbf0fddddde5fc1")
flag_xor_keys = bytes.fromhex("04ee9855208a2cd59091d04767ae47963170d1660df7f56f5faf")

flag_bytes = bytes(a ^ b ^ c for a, b, c in zip(flag_xor_keys, key1, key2_xor_key3))
flag = flag_bytes.decode("ascii")
print(flag)
```
