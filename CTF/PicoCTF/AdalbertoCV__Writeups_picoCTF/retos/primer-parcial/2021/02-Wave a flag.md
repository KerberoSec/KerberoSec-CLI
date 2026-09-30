# Wave a flag

# Descripción
Can you invoke help flags for a tool or binary? [This program](https://mercury.picoctf.net/static/beec4f433e5ee5bfcd71bba8d5863faf/warm) has extraordinarily helpful information...
# Pistas
This program will only work in the webshell or another Linux computer.

To get the file accessible in your shell, enter the following in the Terminal prompt: `$ wget https://mercury.picoctf.net/static/beec4f433e5ee5bfcd71bba8d5863faf/warm`

Run this program by entering the following in the Terminal prompt: `$ ./warm`, but you'll first have to make it executable with `$ chmod +x warm`

-h and --help are the most common arguments to give to programs to get more information from them!

Not every program implements help features like -h and --help.
# Solución

```bash
2023-03-04 17:59:29 (62.2 MB/s) - 'warm' saved [10936/10936]

adalh4ck1ng-picoctf@webshell:~$ ls -la
total 40
drwxr-xr-x 2 adalh4ck1ng-picoctf adalh4ck1ng-picoctf   128 Mar  4 17:59 .
drwxr-xr-x 3 root                root                   33 Mar  2 18:36 ..
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf   220 Mar  2 18:36 .bash_logout
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  3771 Mar  2 18:36 .bashrc
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf   807 Mar  2 18:36 .profile
-rw------- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf   128 Mar  2 18:54 .python_history
-rw-rw-r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf   178 Mar  4 17:59 .wget-hsts
-rw-r--r-- 1 root                root                 4443 Mar  4 17:54 README.txt
-rw-rw-r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf 10936 Mar 16  2021 warm
adalh4ck1ng-picoctf@webshell:~$ ./warm
-bash: ./warm: Permission denied
adalh4ck1ng-picoctf@webshell:~$ chmod +x warm
adalh4ck1ng-picoctf@webshell:~$ ./warm
Hello user! Pass me a -h to learn what I can do!
adalh4ck1ng-picoctf@webshell:~$ ./warm -h
Oh, help? I actually don't do much, but I do have this flag here: picoCTF{b1scu1ts_4nd_gr4vy_616f7182}
```

# Bandera
picoCTF{b1scu1ts_4nd_gr4vy_616f7182}
