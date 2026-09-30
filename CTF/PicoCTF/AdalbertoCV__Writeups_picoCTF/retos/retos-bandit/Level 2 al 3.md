# Level 2 -> 3

# Descripción

The password for the next level is stored in a file called **spaces in this filename** located in the home directory

# Datos de acceso
bandit2
rRGizSaX8Mk1RTb1CNQoXTcYZWU6lgzi
# Solución

```bash
bandit2@bandit:~$ ls
spaces in this filename
bandit2@bandit:~$ cat spaces\ in\ this\ filename
aBZ0W5EmUfAf7kHTQeOwd8bauFJ2lAiG

```
# Comentarios

La solucion fue poner una diagonal invertida en cada lugar donde se encuentra un espacio para que se pudiera interpretar por el comando cat

# Referencias
https://www.google.com/search?q=spaces+in+filename