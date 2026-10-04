# aeg

![img](https://raw.githubusercontent.com/Calana2/Writeups/main/pwnable.kr/Grotesque/aeg.png)

Este reto consiste en explotar una vulnerabilidad en un binario generado automaticamente. La estrategia para explotarlo es la siguiente:
+ Enviar una carga util que se divide en dos partes:
  - Una cabecera de 0x30 bytes que supere ciertas condiciones (usamos `angr` para esto)
  - Un cuerpo que contiene la ROP chain (una vez las condiciones se cumplen, hay un stack buffer overflow con `memcpy`, nuestra carga util decodificada se encuentra en la seccion .bss tambien y el binario no tiene PIE)
+ En el cuerpo de la carga util crear una ROPchain adecuada:
  - Hacer *stack pivoting* para poblar los registros con un gadget especial que nos encontramos
  - Usar `mprotect` para hacer la seccion `.bss` ejecutable 
  - Redirigir la ejecucion a la direccion que contenga nuestro shellcode
+ Xorear los bytes de la carga util para revertir el algoritmo XOR que se usa antes de evaluar las condiciones.
+ Convertir la carga util a un volcado hexadecimal.
+ Enviar en `argv[1]` y esperar la shell.

Partes del codigo que son generadas aleatoriamente:
- La direccion base del ejecutable 
- Las condiciones de la cabecera
- Los bytes con los que se hace XOR a la carga util
- Los offsets a `rbp` del gadget que usamos para rellenar los registros
- El tamaño del buffer local usado por `memcpy`

No profundizaré mas en este writeup. Lo que queda sabiendo esto es intentarlo: obtener el binario, descomprimirlo, analizarlo para extraer sus partes dinamicamente generadas, y explotarlo.

`W1ll_AI_4ot0mat1cally_3xploit_Us?`