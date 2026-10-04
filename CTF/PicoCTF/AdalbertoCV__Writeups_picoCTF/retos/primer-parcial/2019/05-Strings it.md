# Strings it

# Descripción
Can you find the flag in [file](https://jupiter.challenges.picoctf.org/static/5bd86036f013ac3b9c958499adf3e2e2/strings) without running it?
# Pistas
[strings](https://linux.die.net/man/1/strings)
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ ls
README.txt  strings
adalh4ck1ng-picoctf@webshell:~$ strings strings | grep pico
picoCTF{5tRIng5_1T_827aee91}
```

# Bandera
picoCTF{5tRIng5_1T_827aee91}
# Comentarios
|cmd| desc|
|-----|------|
|strings| muestra las cadenas dentro de un archivo|
|grep| filtra por busqueda un patron|
