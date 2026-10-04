# level 10

Accidentalmente borré este writeup así que será resumido:
- El módulo es igual al del nivel anterior, la única particularidad es que en este caso el sistema usa KASLR.
- El módulo ejecuta `printk(logger.buffer)`, siendo `printk` una función que acepta operadores de formato como primer argumento. Esto es una vulnerabilidad de cadena formateada o fsb. `python -c 'print("%llx "*40)' > /proc/pwncollege; dmesg | tail -n 3` muestra el contenido de la pila.
- La dirección de `printk` se encuentra en una variable local porque es usada por la estructura `logger`.
- Mediante `grep -E ' printk$|run_cmd' /proc/kallsyms` filtramos las direcciones de ambas funciones en modo privilegiado y obtenemos el desplazamiento de una con respecto a la otra.
- Finalmente actualizamos el exploit para tomar la dirección de `printk` como argumento:

pwn.college{whsZ2T9ODTS5P0SV2FxwOcMGG9A.dFDN0wCNwYzM5EzW}

