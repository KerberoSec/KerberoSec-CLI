# Level 11 -> 12

# Descripción
The password for the next level is stored in the file **data.txt**, where all lowercase (a-z) and uppercase (A-Z) letters have been rotated by 13 positions
# Datos de acceso
bandit11
6zPeziLdR2RKNdNYFNb6nVCKzphlXHBM
# Solución
```bash
bandit11@bandit:~$ ls
data.txt
bandit11@bandit:~$ cat data.txt
Gur cnffjbeq vf WIAOOSFzMjXXBC0KoSKBbJ8puQm5lIEi
bandit11@bandit:~$ cat data.txt | tr [a-zA-Z] [n-za-mN-ZA-M]
The password is JVNBBFSmZwKKOP0XbFXOoW8chDz5yVRv

```
# Comentarios
|cmd| desc|
|-----|----------|
| tr| Nos permite reemplazar un texto por otro|
| a-zA-Z      n-za-mN-ZA-M| Esta indicacion se refiere a el Rot13, rotando 13 lugares todas las letras del texto

# Referencias
https://en.wikipedia.org/wiki/Rot13