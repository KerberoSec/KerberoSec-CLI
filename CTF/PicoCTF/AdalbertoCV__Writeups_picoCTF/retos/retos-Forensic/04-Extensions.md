# Extensions

# Descripción
This is a really weird text file [TXT](https://jupiter.challenges.picoctf.org/static/e7e5d188621ee705ceeb0452525412ef/flag.txt)? Can you find the flag?
# Pistas
How do operating systems know what kind of file it is? (It's not just the ending!

Make sure to submit the flag as picoCTF{XXXXX}
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ type 
adalh4ck1ng-picoctf@webshell:~$ ls
README.txt  capture.pcap  flag.txt
adalh4ck1ng-picoctf@webshell:~$ file flag.txt 
flag.txt: PNG image data, 1697 x 608, 8-bit/color RGB, non-interlaced
adalh4ck1ng-picoctf@webshell:~$ cat flag.txt > flag.png 

Al abrir la imagen en un editor de imagenes nos da la siguiente bandera:

picoCTF{now_you_know_about_extensions}
```

# Bandera
picoCTF{now_you_know_about_extensions}