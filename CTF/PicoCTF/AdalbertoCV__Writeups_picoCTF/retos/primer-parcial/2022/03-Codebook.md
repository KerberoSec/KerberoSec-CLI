# Codebook

# Descripción
Run the Python script `code.py` in the same directory as `codebook.txt`.

-   [Download code.py](https://artifacts.picoctf.net/c/101/code.py)
-   [Download codebook.txt](https://artifacts.picoctf.net/c/101/codebook.txt)
# Pistas
On the webshell, use `ls` to see if both files are in the directory you are in

The `str_xor` function does not need to be reverse engineered for this challenge.
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ wget https://artifacts.picoctf.net/c/101/code.py https://artifacts.picoctf.net/c/101/codebook.txt
--2023-03-05 19:28:16--  https://artifacts.picoctf.net/c/101/code.py
Resolving artifacts.picoctf.net (artifacts.picoctf.net)... 108.156.172.120, 108.156.172.42, 108.156.172.74, ...
Connecting to artifacts.picoctf.net (artifacts.picoctf.net)|108.156.172.120|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1278 (1.2K) [application/octet-stream]
Saving to: 'code.py'

code.py                                         100%[======================================================================================================>]   1.25K  --.-KB/s    in 0s      

2023-03-05 19:28:16 (710 MB/s) - 'code.py' saved [1278/1278]

--2023-03-05 19:28:16--  https://artifacts.picoctf.net/c/101/codebook.txt
Reusing existing connection to artifacts.picoctf.net:443.
HTTP request sent, awaiting response... 200 OK
Length: 27 [application/octet-stream]
Saving to: 'codebook.txt'

codebook.txt                                    100%[======================================================================================================>]      27  --.-KB/s    in 0s      

2023-03-05 19:28:16 (16.3 MB/s) - 'codebook.txt' saved [27/27]

FINISHED --2023-03-05 19:28:16--
Total wall clock time: 0.2s
Downloaded: 2 files, 1.3K in 0s (377 MB/s)
adalh4ck1ng-picoctf@webshell:~$ cat codebook.txt 
azbycxdwevfugthsirjqkplomn
adalh4ck1ng-picoctf@webshell:~$ python code.py 
picoCTF{c0d3b00k_455157_7d102d7a}
```

# Bandera
picoCTF{c0d3b00k_455157_7d102d7a}