# HideToSee
# Descripción
How about some hide and seek heh?Look at this image [here](https://artifacts.picoctf.net/c/235/atbash.jpg).
# Pistas
Download the image and try to extract it.
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ wget https://artifacts.picoctf.net/c/235/atbash.jpg
--2023-04-27 02:59:52--  https://artifacts.picoctf.net/c/235/atbash.jpg
Resolving artifacts.picoctf.net (artifacts.picoctf.net)... 108.156.172.74, 108.156.172.120, 108.156.172.42, ...
Connecting to artifacts.picoctf.net (artifacts.picoctf.net)|108.156.172.74|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 51499 (50K) [application/octet-stream]
Saving to: 'atbash.jpg'

atbash.jpg                                      100%[======================================================================================================>]  50.29K  --.-KB/s    in 0.03s   

2023-04-27 02:59:52 (1.90 MB/s) - 'atbash.jpg' saved [51499/51499]

adalh4ck1ng-picoctf@webshell:~$ steghide extract -sf atbash.jpg 
Enter passphrase: 
wrote extracted data to "encrypted.txt".
adalh4ck1ng-picoctf@webshell:~$ cat encrypted.txt 
krxlXGU{zgyzhs_xizxp_92533667}

usamos una herramienta llamada dcode para desencriptar la llave

obtenemos la siguiente bandera luego de la desencriptacion:

picoCTF{atbash_crack_92533667}
```

# Bandera
picoCTF{atbash_crack_92533667}

# Referencias

https://www.dcode.fr/atbash-cipher