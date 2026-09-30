# Reto useless

## Descripcion
There's an interesting script in the user's home directoryThe work computer is running SSH. We've been given a script which performs some basic calculations, explore the script and find a flag.

```
Hostname: saturn.picoctf.net
Port:     54345
Username: picoplayer
Password: password
```

## Pistas
-  No hay pistas

## Solucion

Para la solucion de este reto usamos inspeccionamos el script useless que esta en home, ejecutamos man useless y ahi encontramos la flag

```bash
axelliot-picoctf@webshell:~$ ssh -p 54345 picoplayer@saturn.picoctf.net
The authenticity of host '[saturn.picoctf.net]:54345 ([13.59.203.175]:54345)' can't be established.
ED25519 key fingerprint is SHA256:ves7M6DhshpiJSsScBWo3n34oOFTUXvLZqPyqLWeTHk.
This key is not known by any other names
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[saturn.picoctf.net]:54345' (ED25519) to the list of known hosts.
picoplayer@saturn.picoctf.net's password: 
Welcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.15.0-1031-aws x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

picoplayer@challenge:~$ ls -la
total 16
drwxr-xr-x 1 picoplayer picoplayer   20 Mar 19 20:39 .
drwxr-xr-x 1 root       root         24 Mar 16 02:30 ..
-rw-r--r-- 1 picoplayer picoplayer  220 Feb 25  2020 .bash_logout
-rw-r--r-- 1 picoplayer picoplayer 3771 Feb 25  2020 .bashrc
drwx------ 2 picoplayer picoplayer   34 Mar 19 20:39 .cache
-rw-r--r-- 1 picoplayer picoplayer  807 Feb 25  2020 .profile
-rwxr-xr-x 1 root       root        517 Mar 16 01:30 useless
picoplayer@challenge:~$ cd useless
-bash: cd: useless: Not a directory
picoplayer@challenge:~$ cat useless
#!/bin/bash
# Basic mathematical operations via command-line arguments

if [ $# != 3 ]
then
  echo "Read the code first"
else
        if [[ "$1" == "add" ]]
        then 
          sum=$(( $2 + $3 ))
          echo "The Sum is: $sum"  

        elif [[ "$1" == "sub" ]]
        then 
          sub=$(( $2 - $3 ))
          echo "The Substract is: $sub" 

        elif [[ "$1" == "div" ]]
        then 
          div=$(( $2 / $3 ))
          echo "The quotient is: $div" 

        elif [[ "$1" == "mul" ]]
        then
          mul=$(( $2 * $3 ))
          echo "The product is: $mul" 

        else
          echo "Read the manual"
         
        fi
fi
picoplayer@challenge:~$ cd..
-bash: cd..: command not found
picoplayer@challenge:~$ cd ..
picoplayer@challenge:/home$ ls -la
total 0
drwxr-xr-x 1 root       root       24 Mar 16 02:30 .
drwxr-xr-x 1 root       root       51 Mar 19 20:38 ..
drwxr-xr-x 1 picoplayer picoplayer 20 Mar 19 20:39 picoplayer
picoplayer@challenge:/home$ cd ..
picoplayer@challenge:/$ ls -la
total 0
drwxr-xr-x    1 root   root     51 Mar 19 20:38 .
drwxr-xr-x    1 root   root     51 Mar 19 20:38 ..
-rwxr-xr-x    1 root   root      0 Mar 19 20:38 .dockerenv
lrwxrwxrwx    1 root   root      7 Mar  8 02:05 bin -> usr/bin
drwxr-xr-x    2 root   root      6 Apr 15  2020 boot
drwx------    1 root   root      6 Mar 16 02:31 challenge
drwxr-xr-x    5 root   root    340 Mar 19 20:38 dev
drwxr-xr-x    1 root   root     66 Mar 19 20:38 etc
drwxr-xr-x    1 root   root     24 Mar 16 02:30 home
lrwxrwxrwx    1 root   root      7 Mar  8 02:05 lib -> usr/lib
lrwxrwxrwx    1 root   root      9 Mar  8 02:05 lib32 -> usr/lib32
lrwxrwxrwx    1 root   root      9 Mar  8 02:05 lib64 -> usr/lib64
lrwxrwxrwx    1 root   root     10 Mar  8 02:05 libx32 -> usr/libx32
drwxr-xr-x    2 root   root      6 Mar  8 02:06 media
drwxr-xr-x    2 root   root      6 Mar  8 02:06 mnt
drwxr-xr-x    2 root   root      6 Mar  8 02:06 opt
dr-xr-xr-x 2803 nobody nogroup   0 Mar 19 20:38 proc
drwx------    1 root   root     24 Mar 16 02:30 root
drwxr-xr-x    1 root   root     54 Mar 19 20:39 run
lrwxrwxrwx    1 root   root      8 Mar  8 02:05 sbin -> usr/sbin
drwxr-xr-x    2 root   root      6 Mar  8 02:06 srv
dr-xr-xr-x   13 nobody nogroup   0 Mar 19 20:38 sys
drwxrwxrwt    1 root   root      6 Mar 16 02:31 tmp
drwxr-xr-x    1 root   root     18 Mar  8 02:06 usr
drwxr-xr-x    1 root   root     17 Mar  8 02:09 var
picoplayer@challenge:/$ cd challenge/
-bash: cd: challenge/: Permission denied
picoplayer@challenge:/$ chmod 777 challenge
chmod: changing permissions of 'challenge': Operation not permitted
picoplayer@challenge:/$ vim
-bash: vim: command not found
picoplayer@challenge:/$ vim /
-bash: vim: command not found
picoplayer@challenge:/$ cd home/
picoplayer@challenge:/home$ cd picoplayer/
picoplayer@challenge:~$ ls .la
ls: cannot access '.la': No such file or directory
picoplayer@challenge:~$ ls -la
total 16
drwxr-xr-x 1 picoplayer picoplayer   20 Mar 19 20:39 .
drwxr-xr-x 1 root       root         24 Mar 16 02:30 ..
-rw-r--r-- 1 picoplayer picoplayer  220 Feb 25  2020 .bash_logout
-rw-r--r-- 1 picoplayer picoplayer 3771 Feb 25  2020 .bashrc
drwx------ 2 picoplayer picoplayer   34 Mar 19 20:39 .cache
-rw-r--r-- 1 picoplayer picoplayer  807 Feb 25  2020 .profile
-rwxr-xr-x 1 root       root        517 Mar 16 01:30 useless
picoplayer@challenge:~$ cat useless
#!/bin/bash
# Basic mathematical operations via command-line arguments

if [ $# != 3 ]
then
  echo "Read the code first"
else
        if [[ "$1" == "add" ]]
        then 
          sum=$(( $2 + $3 ))
          echo "The Sum is: $sum"  

        elif [[ "$1" == "sub" ]]
        then 
          sub=$(( $2 - $3 ))
          echo "The Substract is: $sub" 

        elif [[ "$1" == "div" ]]
        then 
          div=$(( $2 / $3 ))
          echo "The quotient is: $div" 

        elif [[ "$1" == "mul" ]]
        then
          mul=$(( $2 * $3 ))
          echo "The product is: $mul" 

        else
          echo "Read the manual"
         
        fi
fi
picoplayer@challenge:~$ nano useless
-bash: nano: command not found
picoplayer@challenge:~$ ^C
picoplayer@challenge:~$ ^C
picoplayer@challenge:~$ man useless

useless
     useless, -- This is a simple calculator script

SYNOPSIS
     useless, [add sub mul div] number1 number2

DESCRIPTION
     Use the useless, macro to make simple calulations like addition,subtraction, multiplication and division.

Examples
     ./useless add 1 2
       This will add 1 and 2 and return 3

     ./useless mul 2 3
       This will return 6 as a product of 2 and 3

     ./useless div 6 3
       This will return 2 as a quotient of 6 and 3

     ./useless sub 6 5
       This will return 1 as a remainder of substraction of 5 from 6

Authors
     This script was designed and developed by Cylab Africa

     picoCTF{us3l3ss_ch4ll3ng3_3xpl0it3d_1888}

picoplayer@challenge:~$
```

# Bandera
picoCTF{us3l3ss_ch4ll3ng3_3xpl0it3d_1888}

## Notas adicionales
 | comando | descripcion |
|---------|-------------|
| |  |

## Referencias

[¿Qué es el comando man en Linux?: CompuHoy.com](https://www.compuhoy.com/que-es-el-comando-man-en-linux/#:~:text=El%20comando%20man%20en%20Linux%20se%20usa%20para,ERRORES%2C%20ARCHIVOS%2C%20VERSIONES%2C%20EJEMPLOS%2C%20AUTORES%20y%20VER%20TAMBI%C3%89N.)
