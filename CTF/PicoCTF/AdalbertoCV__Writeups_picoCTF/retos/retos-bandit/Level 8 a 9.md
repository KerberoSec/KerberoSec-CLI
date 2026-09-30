# Level 8 -> 9
# Descripción
The password for the next level is stored in the file **data.txt** and is the only line of text that occurs only once
# Datos de acceso
bandit8
TESKZC0XvTetK0S9xNwm25STk5iWrBvP
# Solución
```bash
bandit8@bandit:~$ ls
data.txt
bandit8@bandit:~$ sort data.txt | uniq -u
EN632PlfYiZbn3PhVK3XOGSlNInNE00t

```
# Comentarios
|cmd|desc|
|----|-----|
|sort| Nos sirve para ordenar archivos segun sus lineas|
|uniq| nos ayuda a mostrar solo las lineas que no se repiten|

# Referencias