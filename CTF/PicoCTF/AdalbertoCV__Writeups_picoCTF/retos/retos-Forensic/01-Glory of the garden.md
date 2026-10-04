# Glory of the garden

# Descripción
This [garden](https://jupiter.challenges.picoctf.org/static/43c4743b3946f427e883f6b286f47467/garden.jpg) contains more than it seems.
# Pistas
What is a hex editor?
# Solución

Para esta solución basta para mirar si hay algo oculto en los strings de la imagen para encontrar la bandera.
```bash
adalh4ck1ng-picoctf@webshell:~$ ls
README.txt  garden.jpg
adalh4ck1ng-picoctf@webshell:~$ strings garden.jpg | grep pico
Here is a flag "picoCTF{more_than_m33ts_the_3y3657BaB2C}"
```

# Bandera
"picoCTF{more_than_m33ts_the_3y3657BaB2C}"