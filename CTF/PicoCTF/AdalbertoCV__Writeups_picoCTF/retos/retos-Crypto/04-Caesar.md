# Caesar

# Descripción
Decrypt this [message](https://jupiter.challenges.picoctf.org/static/6385b895dcb30c74dbd1f0ea271e3563/ciphertext).
# Pistas
caesar cipher [tutorial](https://learncryptography.com/classical-encryption/caesar-cipher)
# Solución

```bash
Al abrir el archivo y ver su contenido, nos encontramos con la siguiente bandera:

picoCTF{dspttjohuifsvcjdpoabrkttds}

la cual, se nota que se encuentra encriptada.

El nombre del reto y la pista, nos dice cual es la encriptacion utilizada. En cyberchef realizamos la encritacion de Caesar cipher. 

Lo siguiente es probar algunos numeros, en el numero 25 nos aparece el siguiente mensaje: crossingtherubiconzaqjsscr

entonces nuestra bandera sería

flag: picoCTF{crossingtherubiconzaqjsscr}
```

# Bandera
picoCTF{crossingtherubiconzaqjsscr}