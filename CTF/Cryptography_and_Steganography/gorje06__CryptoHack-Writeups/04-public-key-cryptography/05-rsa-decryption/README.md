# RSA Decryption

## Flag
```
crypto{13371337}
```

## Solution

Se descifra usando la clave privada `d` del challenge anterior: `m = c^d mod N`. El resultado es un entero que representa el mensaje en texto plano.

```python
N = 882564595536224140639625987657529300394956519977044270821168...
c = 775789958011578236716362988471867235938148438455225223303932
d = 121832886702415731577073962957377780195510499965398469843281  # del challenge anterior

plain = pow(c, d, N)
print(plain)
# Output: 13371337
```
