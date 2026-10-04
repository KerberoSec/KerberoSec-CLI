
# Bases

# Descripción
What does this `bDNhcm5fdGgzX3IwcDM1` mean? I think it has something to do with bases.
# Pistas
Submit your answer in our flag format. For example, if your answer was 'hello', you would submit 'picoCTF{hello}' as the flag.
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ echo 'bDNhcm5fdGgzX3IwcDM1' | base64 --decode
l3arn_th3_r0p35
adalh4ck1ng-picoctf@webshell:~$ 
```

# Bandera
picoCTF{l3arn_th3_r0p35}
# Comentarios
|cmd| desc|
|-----|------|
| base64| nos ayuda a realizar el encriptamiento o desencriptamiento en base64|
