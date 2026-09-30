# Favourite Byte

## Flag
```
crypto{0x10_15_my_f4v0ur173_by7e}
```

## Solution

Se hace brute-force de los 256 posibles valores de clave de un solo byte, buscando que el resultado contenga `crypto{`.

```python
hex_string = "73626960647f6b206821204f21254f7d694f762466206562212127234f726927756d"
byte_data = bytes.fromhex(hex_string)

for key in range(256):
    decoded_bytes = bytes(b ^ key for b in byte_data)
    if b"crypto{" in decoded_bytes:
        print(f"Key found: {hex(key)}")
        print(f"Flag: {decoded_bytes.decode('ascii')}")
        break
```
