# fixme1.py

# Descripción
Fix the syntax error in this Python script to print the flag.[Download Python script](https://artifacts.picoctf.net/c/38/fixme1.py)
# Pistas
Indentation is very meaningful in Python

To view the file in the webshell, do: `$ nano fixme1.py`

To exit `nano`, press Ctrl and x and follow the on-screen prompts.

The `str_xor` function does not need to be reverse engineered for this challenge.
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ wget https://artifacts.picoctf.net/c/38/fixme1.py
--2023-03-05 19:33:14--  https://artifacts.picoctf.net/c/38/fixme1.py
Resolving artifacts.picoctf.net (artifacts.picoctf.net)... 108.156.172.120, 108.156.172.74, 108.156.172.6, ...
Connecting to artifacts.picoctf.net (artifacts.picoctf.net)|108.156.172.120|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 837 [application/octet-stream]
Saving to: 'fixme1.py'

fixme1.py                                       100%[======================================================================================================>]     837  --.-KB/s    in 0s      

2023-03-05 19:33:14 (37.2 MB/s) - 'fixme1.py' saved [837/837]

adalh4ck1ng-picoctf@webshell:~$ python fixme1.py 
  File "/home/adalh4ck1ng-picoctf/fixme1.py", line 20
    print('That is correct! Here\'s your flag: ' + flag)
IndentationError: unexpected indent
adalh4ck1ng-picoctf@webshell:~$ nano fixme1.py 
adalh4ck1ng-picoctf@webshell:~$ python fixme1.py 
That is correct! Here's your flag: picoCTF{1nd3nt1ty_cr1515_09ee727a}
```

# Bandera
picoCTF{1nd3nt1ty_cr1515_09ee727a}
# Comentarios
|cmd| desc|
|-----|------|
|nano| editor de archivos|
