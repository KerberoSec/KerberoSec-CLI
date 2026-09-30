# `> [LORE : NERGAL: PHRACK 58]`

```
alias:        nergal
documento:    "The Advanced return-into-lib(c) Exploits"
publicación:  Phrack Magazine, Issue 58, Article 4
año:          2001
```

---

En 1998, nergal demostró que ret-into-libc existía.
Una llamada. `system()`. `"/bin/sh"`.
El concepto era correcto pero incompleto.

El problema: una sola llamada a `system()` no siempre es suficiente.
Hay binarios que sanitizan el entorno antes de ejecutar.
Hay situaciones donde necesitas encadenar múltiples funciones de libc
para preparar el contexto antes de la llamada final.
Y hay un problema mecánico que nadie había resuelto limpiamente:
cuando encadenas llamadas, los argumentos en la pila se superponen.
La geometría se rompe.

En 2001, nergal volvió con Phrack 58 y resolvió todo eso.

La técnica central: **esp lifting**.
Después de cada llamada a libc, en vez de saltar directo a la siguiente función,
saltas a un gadget que ajusta el stack pointer: limpia los argumentos usados y deja la pila alineada para la siguiente llamada.

```
[ libc_func_1 ] [ pop/pop/ret gadget ] [ arg1 ] [ arg2 ] [ libc_func_2 ] [ ... ]
      ↑               ↑                                         ↑
  primera llamada   limpia la pila                        segunda llamada
```

No hay shellcode. No hay código inyectado.
Solo direcciones de funciones que ya existen,
conectadas por gadgets que también ya existen,
orquestadas desde el stack que el atacante controla.

Eso es lo que tres años después se llamaría **ROP**: Return-Oriented Programming.
Nergal no le puso ese nombre.
Pero construyó el blueprint.

```txt
referenciado en: narnia6
anterior entrada: → nergal.md (Bugtraq 1998)
concepto derivado: ROP · gadget chaining · esp lifting
```

---

> *"The only condition for this to work is that we can find
>  the right gadgets in the code we have available."*
>
>: nergal, Phrack 58, 2001
