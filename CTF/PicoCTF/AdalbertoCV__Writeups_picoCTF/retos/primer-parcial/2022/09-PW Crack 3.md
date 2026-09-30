# PW Crack 3

# Descripción
Can you crack the password to get the flag?Download the password checker [here](https://artifacts.picoctf.net/c/24/level3.py) and you'll need the encrypted [flag](https://artifacts.picoctf.net/c/24/level3.flag.txt.enc) and the [hash](https://artifacts.picoctf.net/c/24/level3.hash.bin) in the same directory too.There are 7 potential passwords with 1 being correct. You can find these by examining the password checker script.
# Pistas
To view the level3.hash.bin file in the webshell, do: `$ bvi level3.hash.bin`

To exit `bvi` type `:q` and press enter.

The `str_xor` function does not need to be reverse engineered for this challenge.
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ wget https://artifacts.picoctf.net/c/24/level3.py https://artifacts.picoctf.net/c/24/level3.flag.txt.enc https://artifacts.picoctf.net/c/24/level3.hash.bin
--2023-03-06 01:31:47--  https://artifacts.picoctf.net/c/24/level3.py
Resolving artifacts.picoctf.net (artifacts.picoctf.net)... 108.156.172.42, 108.156.172.120, 108.156.172.74, ...
Connecting to artifacts.picoctf.net (artifacts.picoctf.net)|108.156.172.42|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1337 (1.3K) [application/octet-stream]
Saving to: 'level3.py'

level3.py                                       100%[======================================================================================================>]   1.31K  --.-KB/s    in 0s      

2023-03-06 01:31:47 (391 MB/s) - 'level3.py' saved [1337/1337]

--2023-03-06 01:31:47--  https://artifacts.picoctf.net/c/24/level3.flag.txt.enc
Reusing existing connection to artifacts.picoctf.net:443.
HTTP request sent, awaiting response... 200 OK
Length: 31 [application/octet-stream]
Saving to: 'level3.flag.txt.enc'

level3.flag.txt.enc                             100%[======================================================================================================>]      31  --.-KB/s    in 0s      

2023-03-06 01:31:47 (14.2 MB/s) - 'level3.flag.txt.enc' saved [31/31]

--2023-03-06 01:31:47--  https://artifacts.picoctf.net/c/24/level3.hash.bin
Reusing existing connection to artifacts.picoctf.net:443.
HTTP request sent, awaiting response... 200 OK
Length: 16 [application/octet-stream]
Saving to: 'level3.hash.bin'

level3.hash.bin                                 100%[======================================================================================================>]      16  --.-KB/s    in 0s      

2023-03-06 01:31:47 (6.58 MB/s) - 'level3.hash.bin' saved [16/16]

FINISHED --2023-03-06 01:31:47--
Total wall clock time: 0.2s
Downloaded: 3 files, 1.4K in 0s (172 MB/s)
adalh4ck1ng-picoctf@webshell:~$ bvi level3.hash.bin 

bvi version 1.4.0 Copyright (C) 1996-2014 by Gerhard Buergmann
adalh4ck1ng-picoctf@webshell:~$ nano level3.py 

adalh4ck1ng-picoctf@webshell:~$ python level3.py 
Please enter correct password for flag: dba8
Welcome back... your flag, user:
picoCTF{m45h_fl1ng1ng_cd6ed2eb}
```

# Bandera
picoCTF{m45h_fl1ng1ng_cd6ed2eb}
# Comentarios
|cmd| desc|
|-----|------|
| bvi| ingresa al editor de texto vi|
