# Diffusion through Permutation

## Flag
```
crypto{d1ffUs3R}
```

## Solution

Se aplican las operaciones inversas de AES: `InvMixColumns` seguido de `InvShiftRows` para recuperar el estado original.

```python
inv_mix_columns(state)
inv_shift_rows(state)
for i in range(4):
    for j in range(4):
        print(chr(state[i][j]), end='')
```
