# Base64

## Flag
```
crypto{Base64+Encoding+is+Web+Safe/}
```

## Solution

Se convierte el hex a bytes y luego se codifica en Base64.

```python
import base64

hex_string = "72bca9b68fc16ac7beeb8f849dca1d8a783e8acf9679bf9269f7bf"
byte_data = bytes.fromhex(hex_string)
base64_data = base64.b64encode(byte_data)
flag = base64_data.decode("ascii")
print(flag)
```
