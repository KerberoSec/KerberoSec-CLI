# PW Crack 2

# Descripción
Can you crack the password to get the flag?Download the password checker [here](https://artifacts.picoctf.net/c/17/level2.py) and you'll need the encrypted [flag](https://artifacts.picoctf.net/c/17/level2.flag.txt.enc) in the same directory too.
# Pistas
Does that encoding look familiar?

The `str_xor` function does not need to be reverse engineered for this challenge.
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ wget https://artifacts.picoctf.net/c/17/level2.py https://artifacts.picoctf.net/c/17/level2.flag.txt.enc
--2023-03-06 01:27:42--  https://artifacts.picoctf.net/c/17/level2.py
Resolving artifacts.picoctf.net (artifacts.picoctf.net)... 108.156.172.6, 108.156.172.74, 108.156.172.120, ...
Connecting to artifacts.picoctf.net (artifacts.picoctf.net)|108.156.172.6|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 914 [application/octet-stream]
Saving to: 'level2.py'

level2.py                                       100%[======================================================================================================>]     914  --.-KB/s    in 0s      

2023-03-06 01:27:42 (337 MB/s) - 'level2.py' saved [914/914]

--2023-03-06 01:27:42--  https://artifacts.picoctf.net/c/17/level2.flag.txt.enc
Reusing existing connection to artifacts.picoctf.net:443.
HTTP request sent, awaiting response... 200 OK
Length: 31 [application/octet-stream]
Saving to: 'level2.flag.txt.enc'

level2.flag.txt.enc                             100%[======================================================================================================>]      31  --.-KB/s    in 0s      

2023-03-06 01:27:42 (12.4 MB/s) - 'level2.flag.txt.enc' saved [31/31]

FINISHED --2023-03-06 01:27:42--
Total wall clock time: 0.2s
Downloaded: 2 files, 945 in 0s (181 MB/s)
adalh4ck1ng-picoctf@webshell:~$ nano level2.py 
adalh4ck1ng-picoctf@webshell:~$ python
Python 3.10.6 (main, Aug 10 2022, 11:40:04) [GCC 11.3.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> print(chr(0x34) + chr(0x65) + chr(0x63) + chr(0x39))
4ec9
>>> 
KeyboardInterrupt
>>> 
KeyboardInterrupt
>>> exit()
adalh4ck1ng-picoctf@webshell:~$ python level2.py 
Please enter correct password for flag: 4ec9
Welcome back... your flag, user:
picoCTF{tr45h_51ng1ng_9701e681}
```

# Bandera
picoCTF{tr45h_51ng1ng_9701e681}