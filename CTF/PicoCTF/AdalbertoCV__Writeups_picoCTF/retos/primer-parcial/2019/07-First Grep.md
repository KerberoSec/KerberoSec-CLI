# First Grep

# Descripción
Can you find the flag in [file](https://jupiter.challenges.picoctf.org/static/495d43ee4a2b9f345a4307d053b4d88d/file)? This would be really tedious to look through manually, something tells me there is a better way.
# Pistas
grep [tutorial](https://ryanstutorials.net/linuxtutorial/grep.php)
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ ls -la
total 804
drwxr-xr-x 2 adalh4ck1ng-picoctf adalh4ck1ng-picoctf    143 Mar  3 01:42 .
drwxr-xr-x 3 root                root                    33 Mar  2 18:36 ..
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf    220 Mar  2 18:36 .bash_logout
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf   3771 Mar  2 18:36 .bashrc
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf    807 Mar  2 18:36 .profile
-rw------- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf    128 Mar  2 18:54 .python_history
-rw-rw-r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf    178 Mar  2 19:04 .wget-hsts
-rw-r--r-- 1 root                root                  4443 Mar  3 01:42 README.txt
-rw-rw-r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  14551 Oct 26  2020 file
-rw-rw-r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf 776032 Oct 26  2020 strings
adalh4ck1ng-picoctf@webshell:~$ cat file | grep pico
picoCTF{grep_is_good_to_find_things_dba08a45}
```

# Bandera
picoCTF{grep_is_good_to_find_things_dba08a45}
