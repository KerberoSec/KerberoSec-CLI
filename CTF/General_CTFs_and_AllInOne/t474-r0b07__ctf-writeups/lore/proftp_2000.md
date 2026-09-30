# `> [LORE : PROFTPD 2000]`

```
software:     ProFTPD: servidor FTP de código abierto
vulnerabilidad: format string en función de logging
año:          1999-2000
CVE:          anterior al sistema CVE moderno
impacto:      acceso root remoto en servidores FTP en producción
```

---

El error no estaba en un buffer.
Estaba en una función de impresión que recibió un string externo como formato.

ProFTPD usaba `syslog()` para registrar eventos.
En algún punto del código, el input del usuario llegaba directamente
como argumento de formato: sin pasar por `%s`.

```c
// lo que el programador escribió (implícitamente):
syslog(LOG_INFO, input_del_usuario);

// lo que debió escribir:
syslog(LOG_INFO, "%s", input_del_usuario);
```

Un carácter de diferencia.
Un `%` que el programador no puso.

Eso convirtió cualquier string con `%x`, `%n`, `%p`
en una instrucción directa al motor de formato de la función.
El atacante podía leer la pila, escribir en direcciones arbitrarias,
y eventualmente ejecutar código como root: de forma remota,
sin tocar ningún buffer de tamaño fijo.

No había desbordamiento. No había NOP sled.
Solo una función de impresión obedeciendo órdenes
que no debería haber recibido.

El incidente formó parte de lo que consolidó las format string vulnerabilities
como categoría propia en la investigación de seguridad.
Antes de ProFTPD, el vector existía en papers.
Después, estaba en exploits reales contra infraestructura en producción.

```c
// %x → lee un valor de la pila y lo imprime en hex
// %n → escribe en la dirección que apunta el siguiente argumento
//       el número de bytes impresos hasta ese momento
// combinados → lectura y escritura arbitraria de memoria
```

La función de formato no es un mecanismo de salida.
Es un intérprete.
Si le das el string de formato, le das el control.

```txt
referenciado en: narnia5
concepto derivado: format string exploitation · arbitrary write · %n primitive
anterior entrada: → nergal.md
```
