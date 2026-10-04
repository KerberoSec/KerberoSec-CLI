# PW Crack 1

# Descripción
Can you crack the password to get the flag?Download the password checker [here](https://artifacts.picoctf.net/c/51/level1.py) and you'll need the encrypted [flag](https://artifacts.picoctf.net/c/51/level1.flag.txt.enc) in the same directory too.
# Pistas
To view the file in the webshell, do: `$ nano level1.py`

To exit `nano`, press Ctrl and x and follow the on-screen prompts.

The `str_xor` function does not need to be reverse engineered for this challenge.
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ wget https://artifacts.picoctf.net/c/51/level1.py https://artifacts.picoctf.net/c/51/level1.flag.txt.enc
--2023-03-05 22:36:20--  https://artifacts.picoctf.net/c/51/level1.py
Resolving artifacts.picoctf.net (artifacts.picoctf.net)... 108.156.172.6, 108.156.172.42, 108.156.172.120, ...
Connecting to artifacts.picoctf.net (artifacts.picoctf.net)|108.156.172.6|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 876 [application/octet-stream]
Saving to: 'level1.py'

level1.py                                       100%[======================================================================================================>]     876  --.-KB/s    in 0s      

2023-03-05 22:36:21 (336 MB/s) - 'level1.py' saved [876/876]

--2023-03-05 22:36:21--  https://artifacts.picoctf.net/c/51/level1.flag.txt.enc
Reusing existing connection to artifacts.picoctf.net:443.
HTTP request sent, awaiting response... 200 OK
Length: 30 [application/octet-stream]
Saving to: 'level1.flag.txt.enc'

level1.flag.txt.enc                             100%[======================================================================================================>]      30  --.-KB/s    in 0s      

2023-03-05 22:36:21 (16.9 MB/s) - 'level1.flag.txt.enc' saved [30/30]

FINISHED --2023-03-05 22:36:21--
Total wall clock time: 0.2s
Downloaded: 2 files, 906 in 0s (207 MB/s)

adalh4ck1ng-picoctf@webshell:~$ ls -la
total 44
drwxr-xr-x 5 adalh4ck1ng-picoctf adalh4ck1ng-picoctf 4096 Mar  5 22:37 .
drwxr-xr-x 3 root                root                  33 Mar  2 18:36 ..
-rw------- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  963 Mar  5 18:55 .bash_history
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  220 Mar  2 18:36 .bash_logout
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf 3771 Mar  2 18:36 .bashrc
drwxrwxr-x 3 adalh4ck1ng-picoctf adalh4ck1ng-picoctf   19 Mar  5 19:34 .local
-rw-r--r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  807 Mar  2 18:36 .profile
-rw------- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  269 Mar  5 22:35 .python_history
drwx------ 2 adalh4ck1ng-picoctf adalh4ck1ng-picoctf   48 Mar  5 18:53 .ssh
-rw-rw-r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  215 Mar  5 18:40 .wget-hsts
drwxr-xr-x 3 adalh4ck1ng-picoctf adalh4ck1ng-picoctf   28 Mar 16  2021 Addadshashanammu
-rw-r--r-- 1 root                root                4443 Mar  5 22:26 README.txt
-rw-rw-r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf   30 Jan  4  2022 level1.flag.txt.enc
-rw-rw-r-- 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf  876 Jan  4  2022 level1.py
adalh4ck1ng-picoctf@webshell:~$ nano level1.py 
adalh4ck1ng-picoctf@webshell:~$ python level1.py 
Please enter correct password for flag: 691d
Welcome back... your flag, user:
picoCTF{545h_r1ng1ng_56891419}
```

# Bandera
picoCTF{545h_r1ng1ng_56891419}