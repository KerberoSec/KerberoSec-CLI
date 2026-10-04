# Level 10 -> 11

# Descripción
The password for the next level is stored in the file **data.txt**, which contains base64 encoded data
# Datos de acceso
bandit10
G7w8LIi6J3kTb8A7j9LgrywtEUlyyp6s
# Solución
```bash
bandit10@bandit:~$ ls
data.txt
bandit10@bandit:~$ cat data.txt
VGhlIHBhc3N3b3JkIGlzIDZ6UGV6aUxkUjJSS05kTllGTmI2blZDS3pwaGxYSEJNCg==
bandit10@bandit:~$ cat data.txt | base64 -d
The password is 6zPeziLdR2RKNdNYFNb6nVCKzphlXHBM

```
# Comentarios
|cmd| desc|
|-----|----------|
|base64| Sirve para codificar y decodificar mensajes en base 64|

# Referencias
https://en.wikipedia.org/wiki/Base64