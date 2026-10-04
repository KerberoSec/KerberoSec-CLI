# Reto Permissions

## Descripcion
Can you read files in the root file?

Additional details will be available after launching your challenge instance.

`ssh -p 50813 picoplayer@saturn.picoctf.net`
Password: `pEN9KN1qYm`

Can you login and read the root file?

## Pistas
- What permissions do you have?

## Solucion

Para la solucion de este reto accedemos a la carpeta raiz y con ayuda del comando vim exploramos el contenido de las carpetas, la flag fue encontrada dentro de challenge/metadato.json.

```bash
axelliot-picoctf@webshell:~$ ssh -p 50813 picoplayer@saturn.picoctf.net
picoplayer@saturn.picoctf.net's password: 
Welcome to Ubuntu 20.04.5 LTS (GNU/Linux 5.15.0-1031-aws x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

This system has been minimized by removing packages and content that are
not required on a system that users do not log into.

To restore this content, you can run the 'unminimize' command.

The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

picoplayer@challenge:~$ ls -la
total 12
drwxr-xr-x 1 picoplayer picoplayer   20 Mar 19 19:23 .
drwxr-xr-x 1 root       root         24 Mar 16 02:29 ..
-rw-r--r-- 1 picoplayer picoplayer  220 Feb 25  2020 .bash_logout
-rw-r--r-- 1 picoplayer picoplayer 3771 Feb 25  2020 .bashrc
drwx------ 2 picoplayer picoplayer   34 Mar 19 19:23 .cache
-rw-r--r-- 1 picoplayer picoplayer  807 Feb 25  2020 .profile
picoplayer@challenge:~$ cd ..
picoplayer@challenge:/home$ ls -la
total 0
drwxr-xr-x 1 root       root       24 Mar 16 02:29 .
drwxr-xr-x 1 root       root       51 Mar 19 19:21 ..
drwxr-xr-x 1 picoplayer picoplayer 20 Mar 19 19:23 picoplayer
picoplayer@challenge:/home$ cd ..
picoplayer@challenge:/$ ls -la
total 0
drwxr-xr-x    1 root   root     51 Mar 19 19:21 .
drwxr-xr-x    1 root   root     51 Mar 19 19:21 ..
-rwxr-xr-x    1 root   root      0 Mar 19 19:21 .dockerenv
lrwxrwxrwx    1 root   root      7 Mar  8 02:05 bin -> usr/bin
drwxr-xr-x    2 root   root      6 Apr 15  2020 boot
drwxr-xr-x    1 root   root     21 Mar 16 02:29 challenge
drwxr-xr-x    5 root   root    340 Mar 19 19:21 dev
drwxr-xr-x    1 root   root     66 Mar 19 19:21 etc
drwxr-xr-x    1 root   root     24 Mar 16 02:29 home
lrwxrwxrwx    1 root   root      7 Mar  8 02:05 lib -> usr/lib
lrwxrwxrwx    1 root   root      9 Mar  8 02:05 lib32 -> usr/lib32
lrwxrwxrwx    1 root   root      9 Mar  8 02:05 lib64 -> usr/lib64
lrwxrwxrwx    1 root   root     10 Mar  8 02:05 libx32 -> usr/libx32
drwxr-xr-x    2 root   root      6 Mar  8 02:06 media
drwxr-xr-x    2 root   root      6 Mar  8 02:06 mnt
drwxr-xr-x    2 root   root      6 Mar  8 02:06 opt
dr-xr-xr-x 3018 nobody nogroup   0 Mar 19 19:21 proc
drwx------    1 root   root     23 Mar 16 02:29 root
drwxr-xr-x    1 root   root     54 Mar 19 19:23 run
lrwxrwxrwx    1 root   root      8 Mar  8 02:05 sbin -> usr/sbin
drwxr-xr-x    2 root   root      6 Mar  8 02:06 srv
dr-xr-xr-x   13 nobody nogroup   0 Mar 19 19:21 sys
drwxrwxrwt    1 root   root      6 Mar 16 02:29 tmp
drwxr-xr-x    1 root   root     18 Mar  8 02:06 usr
drwxr-xr-x    1 root   root     17 Mar  8 02:09 var
picoplayer@challenge:/$ cd sys
picoplayer@challenge:/sys$ ls -la
total 0
dr-xr-xr-x  13 nobody nogroup  0 Mar 19 19:21 .
drwxr-xr-x   1 root   root    51 Mar 19 19:21 ..
drwxr-xr-x   2 nobody nogroup  0 Mar 19 19:24 block
drwxr-xr-x  41 nobody nogroup  0 Mar 19 19:24 bus
drwxr-xr-x  71 nobody nogroup  0 Mar 19 19:24 class
drwxr-xr-x   4 nobody nogroup  0 Mar 19 19:24 dev
drwxr-xr-x  15 nobody nogroup  0 Mar 19 19:24 devices
drwxrwxrwt   2 root   root    40 Mar 19 19:21 firmware
drwxr-xr-x   9 nobody nogroup  0 Mar 19 19:21 fs
drwxr-xr-x   2 nobody nogroup  0 Mar 19 19:24 hypervisor
drwxr-xr-x  16 nobody nogroup  0 Mar 19 19:24 kernel
drwxr-xr-x 179 nobody nogroup  0 Mar 19 19:24 module
drwxr-xr-x   3 nobody nogroup  0 Mar 19 19:24 power
picoplayer@challenge:/sys$ cd ..
picoplayer@challenge:/$ vim
picoplayer@challenge:/$ ls -la
total 0
drwxr-xr-x    1 root   root     51 Mar 19 19:21 .
drwxr-xr-x    1 root   root     51 Mar 19 19:21 ..
-rwxr-xr-x    1 root   root      0 Mar 19 19:21 .dockerenv
lrwxrwxrwx    1 root   root      7 Mar  8 02:05 bin -> usr/bin
drwxr-xr-x    2 root   root      6 Apr 15  2020 boot
drwxr-xr-x    1 root   root     21 Mar 16 02:29 challenge
drwxr-xr-x    5 root   root    340 Mar 19 19:21 dev
drwxr-xr-x    1 root   root     66 Mar 19 19:21 etc
drwxr-xr-x    1 root   root     24 Mar 16 02:29 home
lrwxrwxrwx    1 root   root      7 Mar  8 02:05 lib -> usr/lib
lrwxrwxrwx    1 root   root      9 Mar  8 02:05 lib32 -> usr/lib32
lrwxrwxrwx    1 root   root      9 Mar  8 02:05 lib64 -> usr/lib64
lrwxrwxrwx    1 root   root     10 Mar  8 02:05 libx32 -> usr/libx32
drwxr-xr-x    2 root   root      6 Mar  8 02:06 media
drwxr-xr-x    2 root   root      6 Mar  8 02:06 mnt
drwxr-xr-x    2 root   root      6 Mar  8 02:06 opt
dr-xr-xr-x 3070 nobody nogroup   0 Mar 19 19:21 proc
drwx------    1 root   root     23 Mar 16 02:29 root
drwxr-xr-x    1 root   root     54 Mar 19 19:23 run
lrwxrwxrwx    1 root   root      8 Mar  8 02:05 sbin -> usr/sbin
drwxr-xr-x    2 root   root      6 Mar  8 02:06 srv
dr-xr-xr-x   13 nobody nogroup   0 Mar 19 19:21 sys
drwxrwxrwt    1 root   root      6 Mar 16 02:29 tmp
drwxr-xr-x    1 root   root     18 Mar  8 02:06 usr
drwxr-xr-x    1 root   root     17 Mar  8 02:09 var
picoplayer@challenge:/$ vim /
picoplayer@challenge:/$ 
```

# Bandera
picoCTF{uS1ng_v1m_3dit0r_55878b51}

## Notas adicionales
 | comando | descripcion |
|---------|-------------|
| |  |

## Referencias

[Vim: comandos y atajos imprescindibles para trabajar con él | Arsys](https://www.arsys.es/blog/comandos-vim)
