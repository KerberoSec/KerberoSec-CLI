# Round Keys

## Flag
```
crypto{r0undk3y}
```

## Solution

Se aplica XOR byte a byte entre el estado y la round key (operación `AddRoundKey` de AES).

```python
def add_round_key(s, k):
    return ''.join(chr(m ^ k) for i,j in zip(s,k) for m,k in zip(i,j))

print(add_round_key(state, round_key))
```
