# `> [LORE : KLOG: PHRACK 55]`

```
alias:        klog
documento:    "Busting Frame Pointers"
publicación:  Phrack Magazine, Issue 55, Article 8
año:          1998
técnica:      off-by-one · LSB corruption · frame pointer hijack
```

---

La comunidad de seguridad en 1998 tenía un modelo mental claro:
para secuestrar la ejecución de un proceso
necesitas controlar el Saved EIP.
Cuatro bytes. La dirección de retorno.
Sin eso, no hay ataque.

klog publicó en Phrack 55 que estaban mirando el objetivo equivocado.

No necesitas los cuatro bytes del EIP.
A veces basta con uno.

El byte menos significativo del Saved EBP: el Frame Pointer guardado, la base del stack frame del llamador.
Si lo modificas, cuando la función ejecute `leave`,
moverá la base del stack a una dirección que tú controlas parcialmente.
El `ret` que sigue lee el EIP desde ahí.
No desde donde el compilador lo puso.
Desde donde tú apuntaste.

```
leave:
  mov esp, ebp   ← ESP apunta a donde EBP dice
  pop ebp        ← EBP se restaura desde la pila

ret:
  pop eip        ← EIP se lee desde el nuevo ESP
  jmp eip        ← la CPU salta
```

Un solo byte incorrecto en EBP
y toda la cadena de restauración del stack frame
trabaja para el atacante.

Lo que klog formalizó no fue solo una técnica.
Fue un cambio de perspectiva:
el objetivo no siempre es el puntero más obvio.
A veces el puntero que nadie vigila
es el que mueve todo lo demás.

```txt
referenciado en: narnia9
técnica derivada: off-by-one · frame pointer overwrite · LSB corruption
publicación:      Phrack 55, 1998
```

---

> *"You don't need to control four bytes
>  if one byte moves the foundation."*
>
>: klog, Phrack 55, 1998
