# Static ain't always noise

# Descripción
Can you look at the data in this binary: [static](https://mercury.picoctf.net/static/66932732825076cad4ba43e463dae82f/static)? This [BASH script](https://mercury.picoctf.net/static/66932732825076cad4ba43e463dae82f/ltdis.sh) might help!
# Pistas
(None)
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ ls -la
total 44
drwxr-xr-x 2 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  146 Mar  4 18:23 .
drwxr-xr-x 3 root                root                  33 Mar  2 18:36 ..
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  220 Mar  2 18:36 .bash_logout
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf 3771 Mar  2 18:36 .bashrc
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  807 Mar  2 18:36 .profile
-rw------- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  128 Mar  2 18:54 .python_history
-rw-rw-r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  178 Mar  4 18:16 .wget-hsts
-rw-r--r-- 1 root                root                4443 Mar  4 17:54 README.txt
-rw-rw-r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  785 Mar 16  2021 ltdis.sh
-rw-rw-r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf 8376 Mar 16  2021 static
adalh4ck1ng-picoctf@webshell:~$ cat ltdis.sh 
#!/bin/bash

echo "Attempting disassembly of $1 ..."

#This usage of "objdump" disassembles all (-D) of the first file given by 
#invoker, but only prints out the ".text" section (-j .text) (only section
#that matters in almost any compiled program...

objdump -Dj .text $1 > $1.ltdis.x86_64.txt

#Check that $1.ltdis.x86_64.txt is non-empty
#Continue if it is, otherwise print error and eject

if [ -s "$1.ltdis.x86_64.txt" ]
then
        echo "Disassembly successful! Available at: $1.ltdis.x86_64.txt"

        echo "Ripping strings from binary with file offsets..."
        strings -a -t x $1 > $1.ltdis.strings.txt
        echo "Any strings found in $1 have been written to $1.ltdis.strings.txt with file offset"

else
        echo "Disassembly failed!"
        echo "Usage: ltdis.sh <program-file>"
        echo "Bye!"
fi
adalh4ck1ng-picoctf@webshell:~$ chmod +x ltdis.sh 
adalh4ck1ng-picoctf@webshell:~$ chmod +x static
adalh4ck1ng-picoctf@webshell:~$ ./ltdis.sh ./static 
Attempting disassembly of ./static ...
Disassembly successful! Available at: ./static.ltdis.x86_64.txt
Ripping strings from binary with file offsets...
Any strings found in ./static have been written to ./static.ltdis.strings.txt with file offset
adalh4ck1ng-picoctf@webshell:~$ ls -la
total 60
drwxr-xr-x 2 adalh4ck1ng-picoctf adalh4ck1ng-picoctf 4096 Mar  4 18:29 .
drwxr-xr-x 3 root                root                  33 Mar  2 18:36 ..
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  220 Mar  2 18:36 .bash_logout
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf 3771 Mar  2 18:36 .bashrc
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  807 Mar  2 18:36 .profile
-rw------- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  128 Mar  2 18:54 .python_history
-rw-rw-r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  178 Mar  4 18:16 .wget-hsts
-rw-r--r-- 1 root                root                4443 Mar  4 17:54 README.txt
-rwxrwxr-x 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  785 Mar 16  2021 ltdis.sh
-rwxrwxr-x 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf 8376 Mar 16  2021 static
-rw-rw-r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf 1668 Mar  4 18:29 static.ltdis.strings.txt
-rw-rw-r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf 6499 Mar  4 18:29 static.ltdis.x86_64.txt
adalh4ck1ng-picoctf@webshell:~$ cat static.ltdis.strings.txt | grep pico
   1020 picoCTF{d15a5m_t34s3r_f5aeda17}
```

# Bandera
picoCTF{d15a5m_t34s3r_f5aeda17}