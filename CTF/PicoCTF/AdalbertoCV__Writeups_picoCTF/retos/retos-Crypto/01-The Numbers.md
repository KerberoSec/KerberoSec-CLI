# The Numbers

# Descripción
The [numbers](https://jupiter.challenges.picoctf.org/static/f209a32253affb6f547a585649ba4fda/the_numbers.png)... what do they mean?
# Pistas
The flag is in the format PICOCTF{}
# Solución

```bash
Al abrir y obsevar la imagen, nos encontramos con una serie de numeros, pero su acomodo es bastante parecido al de una bandera, por ende podemos intuir que estan encriptados de alguna manera.

Metiendo dichos numeros en cyberchef, nos damos cuenta que se encuentran encriptados en formato A1Z26. Realizando la desencriptacion obtenemos la siguiente bandera

flag: picoCTF{thenumbersmason}
```

# Bandera
picoCTF{thenumbersmason}