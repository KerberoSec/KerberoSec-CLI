# Plumbing

# Descripción
Sometimes you need to handle process data outside of a file. Can you find a way to keep the output from this program and search for the flag? Connect to `jupiter.challenges.picoctf.org 7480`.
# Pistas
Remember the flag format is picoCTF{XXXX}
What's a pipe? No not that kind of pipe (JAJAJAA)... This [kind](http://www.linfo.org/pipes.html)
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ nc jupiter.challenges.picoctf.org 7480 | grep pico
picoCTF{digital_plumb3r_06e9d954}
```

# Bandera
picoCTF{digital_plumb3r_06e9d954}

# Comentarios

El pipe | de linux sirve para realizar algun proceso a algun archivo y en este caso, filtrar las lineas para no obtener muchisimos mensajes.
