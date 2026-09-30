
# Level 14 -> 15

# Descripción
The password for the next level can be retrieved by submitting the password of the current level to **port 30000 on localhost**
# Datos de acceso
bandit14
fGrHPx402xGC7U7rXKDaxiWFTOiF0ENq
# Solución
```bash
bandit14@bandit:~$ ls -la
total 24
drwxr-xr-x  3 root root 4096 Jan 11 19:18 .
drwxr-xr-x 70 root root 4096 Jan 11 19:19 ..
-rw-r--r--  1 root root  220 Jan  6  2022 .bash_logout
-rw-r--r--  1 root root 3771 Jan  6  2022 .bashrc
-rw-r--r--  1 root root  807 Jan  6  2022 .profile
drwxr-xr-x  2 root root 4096 Jan 11 19:18 .ssh
bandit14@bandit:~$ nc -v localhost 30000
Connection to localhost (127.0.0.1) 30000 port [tcp/*] succeeded!
fGrHPx402xGC7U7rXKDaxiWFTOiF0ENq
Correct!
jN2kgmIXJ6fShzhT2avhotn4Zcka6tnt
```
# Comentarios
|cmd| desc|
|-----|----------|
| nc| Es el comando de NetCat, que nos ayuda a hacer conexiones o comprobar conexiones en alguna maquina

# Referencias
https://www.youtube.com/watch?v=7_LPdttKXPc
http://computer.howstuffworks.com/web-server5.htm
https://en.wikipedia.org/wiki/IP_address
http://computer.howstuffworks.com/web-server8.htm
https://en.wikipedia.org/wiki/Port_(computer_networking)