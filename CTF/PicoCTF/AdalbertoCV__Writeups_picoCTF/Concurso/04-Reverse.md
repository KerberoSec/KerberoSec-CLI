# Reverse

# Descripción
Try reversing this file? Can ya?I forgot the password to this [file](https://artifacts.picoctf.net/c/273/ret). Please find it for me?
# Pistas
None
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ file ret
ret: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=64856d07d138e412faf30b9722d92f507e3b5c9c, for GNU/Linux 3.2.0, not stripped
adalh4ck1ng-picoctf@webshell:~$ chmod +x ret
adalh4ck1ng-picoctf@webshell:~$ ./ret
Enter the password to unlock this file: 

psw
You entered: psw
Access denied
adalh4ck1ng-picoctf@webshell:~$ strings ret | grep pico
picoCTF{H
Password correct, please see flag: picoCTF{3lf_r3v3r5ing_succe55ful_d7b14d43}
```

# Bandera 

picoCTF{3lf_r3v3r5ing_succe55ful_d7b14d43}