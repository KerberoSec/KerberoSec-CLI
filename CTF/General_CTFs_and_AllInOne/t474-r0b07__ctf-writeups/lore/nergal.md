# `> [LORE :: NERGAL]`

```
alias:        nergal
nombre real:  Michal Zalewski (atribuido, nunca confirmado)
documento:    "Defeating Solar Designer's Non-Executable Stack Patch"
              Bugtraq, febrero 1998
```

---

En 1997, Solar Designer cerró una ventana.
La pila dejó de ejecutar código.
La shellcode inyectada en el stack no podía correr.
El modelo clásico de explotación: NOP sled, shellcode, salto: dejaba de funcionar.

Seis meses después, nergal publicó cómo entrar por otra parte.

No necesitaba ejecutar código propio.
El código ya estaba ahí.
`system()`. `execve()`. `/bin/sh` como string dentro de libc.
Funciones estándar, cargadas en memoria cada vez que el proceso arranca.

La técnica: redirigir EIP no hacia shellcode inyectada,
sino hacia `system()` dentro de libc.
Pasar `/bin/sh` como argumento.
Dejar que la librería estándar haga el trabajo.

```c
// no hay shellcode.
// hay un salto a código que ya existe.
// la diferencia es todo.
```

Narnia 4 no usa ret-into-libc: la pila aquí ejecuta, ASLR no existe.
Pero el NOP sled que usas es exactamente lo que nergal quería eliminar.
Lo que él construyó fue la respuesta al mundo donde eso ya no funciona.

Cada técnica define la siguiente.
NOP sled → pila no ejecutable → ret-into-libc → ASLR → ROP.
Una cadena donde cada eslabón nació para romper el anterior.

```txt
referenciado en: narnia4
concepto derivado: ret-into-libc · ROP (return-oriented programming)
anterior entrada: → solar_designer.md
siguiente entrada: → proftp_2000.md
```

---

> *"it seems to me there exist at least two generic ways
>  to bypass this patch fairly easily."*
>
>: nergal, Bugtraq, febrero 1998
