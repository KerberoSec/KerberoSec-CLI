# Euler's Totient

## Flag
```
crypto{t0t13nt_0f_pr0duct}
```

## Solution

La función totient de Euler `φ(N)` para `N = p*q` (producto de dos primos) es `(p-1)*(q-1)`. Se calcula directamente dados `p` y `q`.

```python
p = 857504083333971275248999381077
q = 1029224949794299880750803486472219

phi = (p - 1) * (q - 1)
print(phi)
# Output: 882564595536224140639625987657529300394956519977044270821168
```
