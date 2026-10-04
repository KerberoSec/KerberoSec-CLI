# Reto rotation

## Descripcion
You will find the flag after decrypting this fileDownload the encrypted flag [here](https://artifacts.picoctf.net/c/386/encrypted.txt).

## Pistas
Sometimes rotation is right

## Solucion

Para la solucion de este reto descargamos el archivo desde consola y consultamos el contenido, el contenido lo copiamos y con ayuda de la herramienta cyberchef lo descincriptamos.
La forma que se desencripto fue que rotamos 18 veces el texto con la función ROT13, cambiando el numero a 18.
```bash
axelliot-picoctf@webshell:~$ wget https://artifacts.picoctf.net/c/386/encrypted.txt
--2023-03-16 18:11:28--  https://artifacts.picoctf.net/c/386/encrypted.txt
Resolving artifacts.picoctf.net (artifacts.picoctf.net)... 108.156.172.74, 108.156.172.120, 108.156.172.6, ...
Connecting to artifacts.picoctf.net (artifacts.picoctf.net)|108.156.172.74|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 37 [application/octet-stream]
Saving to: 'encrypted.txt'

encrypted.txt                                            100%[================================================================================================================================>]      37  --.-KB/s    in 0s      

2023-03-16 18:11:29 (9.17 MB/s) - 'encrypted.txt' saved [37/37]

axelliot-picoctf@webshell:~$ cat encrypted.txt 
xqkwKBN{z0bib1wv_l3kzgxb3l_4k71n5j0}
axelliot-picoctf@webshell:~$
```

# Bandera
picoCTF{r0tat1on_d3crypt3d_4c71f5b0}

## Notas adicionales
 | comando | descripcion |
|---------|-------------|
| |  |

## Referencias

[ROT13: Wikipedia](https://en.wikipedia.org/wiki/ROT13)
