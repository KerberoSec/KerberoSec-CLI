# Tapping

# Descripción
Theres tapping coming in from the wires. What's it saying `nc jupiter.challenges.picoctf.org 21610`.
# Pistas
What kind of encoding uses dashes and dots?

The flag is in the format PICOCTF{}
# Solución

```bash
Al realizar la conexion, obtenemos lo siguiente

adalh4ck1ng-picoctf@webshell:~$ nc jupiter.challenges.picoctf.org 21610
.--. .. -.-. --- -.-. - ..-. { -- ----- .-. ... ...-- -.-. ----- -.. ...-- .---- ... ..-. ..- -. ...-- ----. ----- ..--- ----- .---- ----. ..... .---- ----. }

esto claramente es un codigo morse. Entonces, la solucion basta con realizar la desencriptacion de codigo morse en cyberchef... obteniendo lo siguiente

PICOCTFM0RS3C0D31SFUN3902019519

solo debemos acomodarlo en formato de bandera

flag: picoCTF{M0RS3C0D31SFUN3902019519}

```

# Bandera
picoCTF{M0RS3C0D31SFUN3902019519}