Este es un wargame para practicar tus skills en el sistema unix de linux, este es el room/mundo bandit de la plataforma `https://overthewire.org/wargames/bandit/`
Las crendeciales para conectarse al primer nivel son:
```
user: bandit0
pass: bandit0
```

En este nivel simplemente debemos conectarnos por ssh con las credenciales que nos indican

```
ssh bandit0@bandit.overthewire.org -p 5000
```
PD: El puerto para ssh es el puerto `5000`, por lo que debemos indicarlo en el parametro `-p`.
