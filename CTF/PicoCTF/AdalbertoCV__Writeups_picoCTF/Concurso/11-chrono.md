# Reto chrono

## Descripcion
How to automate tasks to run at intervals on linux servers?Use ssh to connect to this server:

```
Server: saturn.picoctf.net
Port: 65514
Username: picoplayer 
Password: KkPyI5bkmn
```
## Pistas
- Np hay pistas

## Solucion

Para la solucion de este reto ingresamos al server con los datos proporcionados, nos dirigimos a la carpeta raiz, challenge y metadata.json y ahi encontramos la flag.

```bash
axelliot-picoctf@webshell:~$ ssh -p 64823 saturn.picoctf.net
The authenticity of host '[saturn.picoctf.net]:64823 ([13.59.203.175]:64823)' can't be established.
ED25519 key fingerprint is SHA256:p/PvzCEZdcZTX+VPBLVApO7dmZmo7L7qwjpiIdTTHao.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[saturn.picoctf.net]:64823' (ED25519) to the list of known hosts.
axelliot-picoctf@saturn.picoctf.net's password: 
Permission denied, please try again.
axelliot-picoctf@saturn.picoctf.net's password: 
Permission denied, please try again.
axelliot-picoctf@saturn.picoctf.net's password: 
axelliot-picoctf@saturn.picoctf.net: Permission denied (publickey,password).
axelliot-picoctf@webshell:~$ ssh -p 50813 picoplayer@saturn.picoctf.net^C
axelliot-picoctf@webshell:~$ ssh -p 65514 picoplayer@saturn.picoctf.net
The authenticity of host '[saturn.picoctf.net]:65514 ([13.59.203.175]:65514)' can't be established.
ED25519 key fingerprint is SHA256:p/PvzCEZdcZTX+VPBLVApO7dmZmo7L7qwjpiIdTTHao.
This host key is known by the following other names/addresses:
    ~/.ssh/known_hosts:10: [hashed name]
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[saturn.picoctf.net]:65514' (ED25519) to the list of known hosts.
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
drwxr-xr-x 1 picoplayer picoplayer   20 Mar 19 20:25 .
drwxr-xr-x 1 root       root         24 Mar 16 02:00 ..
-rw-r--r-- 1 picoplayer picoplayer  220 Feb 25  2020 .bash_logout
-rw-r--r-- 1 picoplayer picoplayer 3771 Feb 25  2020 .bashrc
drwx------ 2 picoplayer picoplayer   34 Mar 19 20:25 .cache
-rw-r--r-- 1 picoplayer picoplayer  807 Feb 25  2020 .profile
picoplayer@challenge:~$ vim   
-bash: vim: command not found
picoplayer@challenge:~$ ls
picoplayer@challenge:~$ cron
cron: can't open or create /var/run/crond.pid: Permission denied
picoplayer@challenge:~$ ls -la
total 12
drwxr-xr-x 1 picoplayer picoplayer   20 Mar 19 20:25 .
drwxr-xr-x 1 root       root         24 Mar 16 02:00 ..
-rw-r--r-- 1 picoplayer picoplayer  220 Feb 25  2020 .bash_logout
-rw-r--r-- 1 picoplayer picoplayer 3771 Feb 25  2020 .bashrc
drwx------ 2 picoplayer picoplayer   34 Mar 19 20:25 .cache
-rw-r--r-- 1 picoplayer picoplayer  807 Feb 25  2020 .profile
picoplayer@challenge:~$ cd ..
picoplayer@challenge:/home$ ls -la
total 0
drwxr-xr-x 1 root       root       24 Mar 16 02:00 .
drwxr-xr-x 1 root       root       51 Mar 19 20:23 ..
drwxr-xr-x 1 picoplayer picoplayer 20 Mar 19 20:25 picoplayer
picoplayer@challenge:/home$ cd ..
picoplayer@challenge:/$ ls .la
ls: cannot access '.la': No such file or directory
picoplayer@challenge:/$ ls -la
total 0
drwxr-xr-x    1 root   root     51 Mar 19 20:23 .
drwxr-xr-x    1 root   root     51 Mar 19 20:23 ..
-rwxr-xr-x    1 root   root      0 Mar 19 20:23 .dockerenv
lrwxrwxrwx    1 root   root      7 Mar  8 02:05 bin -> usr/bin
drwxr-xr-x    2 root   root      6 Apr 15  2020 boot
drwxr-xr-x    1 root   root     21 Mar 16 02:00 challenge
drwxr-xr-x    5 root   root    340 Mar 19 20:23 dev
drwxr-xr-x    1 root   root     66 Mar 19 20:23 etc
drwxr-xr-x    1 root   root     24 Mar 16 02:00 home
lrwxrwxrwx    1 root   root      7 Mar  8 02:05 lib -> usr/lib
lrwxrwxrwx    1 root   root      9 Mar  8 02:05 lib32 -> usr/lib32
lrwxrwxrwx    1 root   root      9 Mar  8 02:05 lib64 -> usr/lib64
lrwxrwxrwx    1 root   root     10 Mar  8 02:05 libx32 -> usr/libx32
drwxr-xr-x    2 root   root      6 Mar  8 02:06 media
drwxr-xr-x    2 root   root      6 Mar  8 02:06 mnt
drwxr-xr-x    2 root   root      6 Mar  8 02:06 opt
dr-xr-xr-x 2903 nobody nogroup   0 Mar 19 20:23 proc
drwx------    2 root   root     37 Mar  8 02:09 root
drwxr-xr-x    1 root   root     54 Mar 19 20:25 run
lrwxrwxrwx    1 root   root      8 Mar  8 02:05 sbin -> usr/sbin
drwxr-xr-x    2 root   root      6 Mar  8 02:06 srv
dr-xr-xr-x   13 nobody nogroup   0 Mar 19 20:23 sys
drwxrwxrwt    1 root   root      6 Mar 16 02:00 tmp
drwxr-xr-x    1 root   root     18 Mar  8 02:06 usr
drwxr-xr-x    1 root   root     17 Mar  8 02:09 var
picoplayer@challenge:/$ vim
-bash: vim: command not found
picoplayer@challenge:/$ cd challenge
picoplayer@challenge:/challenge$ ls -la
total 4
drwxr-xr-x 1 root root  21 Mar 16 02:00 .
drwxr-xr-x 1 root root  51 Mar 19 20:23 ..
-rw-r--r-- 1 root root 104 Mar 16 02:00 metadata.json
picoplayer@challenge:/challenge$ cat metadata.json
{"flag": "picoCTF{Sch3DUL7NG_T45K3_L1NUX_5b7059d0}", "username": "picoplayer", "password": "KkPyI5bkmn"}picoplayer@challenge:/challenge$ ^C
picoplayer@challenge:/challenge$ Connection to saturn.picoctf.net closed by remote host.
Connection to saturn.picoctf.net closed.
axelliot-picoctf@webshell:~$ 
```

# Bandera
picoCTF{Sch3DUL7NG_T45K3_L1NUX_5b7059d0}
## Notas adicionales
 | comando | descripcion |
|---------|-------------|
| |  |

## Referencias