# Hex

## Flag
```
crypto{You_will_be_working_with_hex_strings_a_lot}
```

## Solution

Se convierte el string hexadecimal a bytes y luego se decodifica como ASCII.

```python
hex_string = "63727970746f7b596f755f77696c6c5f62655f776f726b696e675f776974685f6865785f6737472696e67735f615f6c6f747d"
byte_data = bytes.fromhex(hex_string)
flag = byte_data.decode("ascii")
print(flag)
```
