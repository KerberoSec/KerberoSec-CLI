## Bandit Level 1 a 2

# Descripción
The password for the next level is stored in a file called **-** located in the home directory

# Datos de acceso
bandit1
NH2SXQwcBdpmTEzi3bvBHMM9H66vVXjL
# Solución
```bash
bandit1@bandit:~$ ls
-
bandit1@bandit:~$ cat ./-
rRGizSaX8Mk1RTb1CNQoXTcYZWU6lgzi
```

# Comentarios

| Comando | Descripcion|
|------------|--------------|
| cat ./ | Nos ayuda a abrir archivos coyo nombre sea problematico o confuso|

# Referencias
https://www.google.com/search?q=dashed+filename
http://tldp.org/LDP/abs/html/special-chars.html

