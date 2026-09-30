```
user: bandit1
password: ZjLjTmM6FvvyRnrb2rfNWOZOTa6ip5If
```
En este nivel la contraseña esta en un directorio llamado `-` en el directorio `/home/bandit1`
Para ingresar a él podemos utilizar la ruta absoluta:
```
cat /home/bandit1/-
```
o simplemente indicamos con `./` que queremos visualizar el fichero con nombre `-`
```
cat ./-
```
