# sizcaller

![img](https://raw.githubusercontent.com/Calana2/Wargame_Writeups/refs/heads/main/pwnable.kr/Grotesque/sizcaller.png)

El programa invoca una syscall aleatoria con hasta 5 argumentos "aleatorios". Los argumentos aleatorios generados en caso de ser impares son obligados a caer dentro del rango 0x10000-0x10fff.

En remoto el reto permite interactuar con la terminal, es un reto de escalada de privilegios. Dado que controlamos el programa en local podemos abusar de estas dos syscalls:
- SYS_creat
- SYS_fchmod

La idea es que SYS_creat cree un archivo con propietario sizcaller_pwn y que sea escribible para otros, sobreescribir este archivo con un programa malicioso (pierde SUID de tenerlo) y usar SYS_fchmod para recuperar el SUID y hacerlo ejecutable para otros.

Para hacer esto útimo se puede modificar el límite de descriptores de archivo que puede tener un programa hasta 0x11000 y duplicar los descriptores de archivos  en el rango 0x10000-0x10ffff para apuntar al archivo creado. Luego usar un fork en dicho programa para invocar un hijo "sizcaller".

Es un proceso de fuerza bruta. El entorno tiene un intérprete de Python2.

`Never_m3ssup_w1th_SysTem_C4lls`