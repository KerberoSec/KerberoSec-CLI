# `> [LORE : STEALTH: GOT OVERWRITE]`

```
alias:        Stealth
documento:    "Bypassing PaX ASLR Protection"
              referencias cruzadas en Phrack 56-58
año:          2000-2001
técnica:      sobreescritura de GOT via format string
```

---

La Global Offset Table no es código.
Es un directorio.

Cuando un binario llama a `printf()`, `exit()`, `putchar()`: funciones que viven en libc, fuera del binario: no salta directamente a ellas.
Consulta una tabla. La GOT.
Ahí está la dirección real, resuelta en tiempo de ejecución por el dynamic linker.

El programador no piensa en la GOT.
Para él, `putchar('\n')` es una línea de código inofensiva.
No ve la tabla. No ve el intermediario.
No ve que esa tabla vive en una sección de memoria con permisos de escritura.

Eso fue lo que documentó Stealth:
si tienes una primitiva de escritura arbitraria: como la que otorga `%n` en una format string: puedes reemplazar cualquier entrada de la GOT
con la dirección que tú elijas.

La próxima vez que el programa llame a esa función,
el dynamic linker consulta la tabla,
encuentra tu dirección,
y salta.

```
GOT antes:
  putchar@GOT → 0xf7e6a4b0   (dirección real en libc)

GOT después de %n:
  putchar@GOT → 0xffffd9a0   (tu shellcode / system())
```

No rompiste el binario.
No desbordaste ningún buffer.
Cambiaste una entrada en un directorio.
El sistema hizo el resto.

Lo que Stealth formalizó no fue solo la técnica: fue el principio de que **cualquier puntero de función modificable
es una superficie de ataque**.
GOT. Destructores. Punteros en heap.
Si se puede escribir ahí, se puede redirigir desde ahí.

Hoy la GOT tiene protecciones: RELRO parcial o total.
`RELRO full` la marca como solo lectura después de la resolución de símbolos.
Pero en 2000, nadie había cerrado esa ventana todavía.

```txt
referenciado en: narnia7
técnica derivada: GOT overwrite · PLT hijack · RELRO como mitigación
```
