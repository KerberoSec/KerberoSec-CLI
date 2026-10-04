# Structure of AES

## Flag
```
crypto{inmatrix}
```

## Solution

Se convierte una matriz 4x4 de bytes a su representación como string usando `matrix2bytes`.

```python
def matrix2bytes(matrix):
    return bytes(sum(matrix, []))

matrix = [
    [99, 114, 121, 112],
    [116, 111, 123, 105],
    [110, 109, 97, 116],
    [114, 105, 120, 125],
]
print(matrix2bytes(matrix).decode('utf-8'))
```
