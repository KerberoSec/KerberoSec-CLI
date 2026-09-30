# Easy1

# Descripción
The one time pad can be cryptographically secure, but not when you know the key. Can you solve this? We've given you the encrypted flag, key, and a table to help `UFJKXQZQUNB` with the key of `SOLVECRYPTO`. Can you use this [table](https://jupiter.challenges.picoctf.org/static/1fd21547c154c678d2dab145c29f1d79/table.txt) to solve it?.
# Pistas
Submit your answer in our flag format. For example, if your answer was 'hello', you would submit 'picoCTF{HELLO}' as the flag.

Please use all caps for the message.
# Solución

```bash
Utilizamos Cyberchef para encontrar esta solucion. La encriptación usada para este reto se trata de el formato Vigenere.

Ingresando la key SOLVECRYPTO y el texto `UFJKXQZQUNB` como entrada, obtenemos nuestra bandera

flag: picoCTF{CRYPTOISFUN}
```

# Bandera
picoCTF{CRYPTOISFUN}