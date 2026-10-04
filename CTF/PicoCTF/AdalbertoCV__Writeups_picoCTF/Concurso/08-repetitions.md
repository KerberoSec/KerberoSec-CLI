# repetitions

## Descripcion
Can you make sense of this file?Download the file [here](https://artifacts.picoctf.net/c/292/enc_flag).

## Pistas
- Multiple decoding is always good.

## Solucion
Primero extraemos el archivo por medio de la consola con ayuda del comando wget: 
```bash
aaxelliot-picoctf@webshell:~$ wget https://artifacts.picoctf.net/c/292/enc_flag
--2023-03-14 19:15:29--  https://artifacts.picoctf.net/c/292/enc_flag
Resolving artifacts.picoctf.net (artifacts.picoctf.net)... 108.156.172.120, 108.156.172.6, 108.156.172.74, ...
Connecting to artifacts.picoctf.net (artifacts.picoctf.net)|108.156.172.120|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 349 [application/octet-stream]
Saving to: 'enc_flag'

enc_flag                                                 100%[==================================================================================================================================>]     349  --.-KB/s    in 0s      

2023-03-14 19:15:30 (17.5 MB/s) - 'enc_flag' saved [349/349]

axelliot-picoctf@webshell:~$ ls   
Addadshashanammu  Addadshashanammu.zip  README.txt  enc_flag  ende.py  file  flag  ltdis.sh  static  static.ltdis.strings.txt  static.ltdis.x86_64.txt  strings  warm
axelliot-picoctf@webshell:~$ cat  enc_flag 
VmpGU1EyRXlUWGxTYmxKVVYwZFNWbGxyV21GV1JteDBUbFpPYWxKdFVsaFpWVlUxWVZaS1ZWWnVh
RmRXZWtab1dWWmtSMk5yTlZWWApiVVpUVm10d1VWZFdVa2RpYlZaWFZtNVdVZ3BpU0VKeldWUkNk
MlZXVlhoWGJYQk9VbFJXU0ZkcVRuTldaM0JZVWpGS2VWWkdaSGRXCk1sWnpWV3hhVm1KRk5XOVVW
VkpEVGxaYVdFMVhSbHBWV0VKd1ZtMDFRMDFHV1hsbFJrNVlDbUY2UWpOVVZsSmhZVVpLU0dWRlZs
aGkKYlRrelZERldUMkpzUWxWTlJYTkxDZz09Cg==
axelliot-picoctf@webshell:~$
```

El texto codificado lo pasamos a la herramienta cyberchef y lo decodificamos a base64 6 veces y obtenemos la bandera.

# Bandera
picoCTF{base64_n3st3d_dic0d!n8_d0wnl04d3d_fffe6738}

## Notas adicionales
 | comando | descripcion |
|---------|-------------|
| |  |

## Referencias
https://cyberchef.org