# `> [LORE :: SOLAR DESIGNER]`

```
nombre real:  Alexander Peslyak
alias:        Solar Designer
origen:       Rusia
activo desde: 1996
```

---

En 1997, la comunidad de seguridad creía que hacer la pila no ejecutable era suficiente.
Poner el código ahí y saltar a él: eso era el modelo mental del ataque.
Si la pila no ejecuta, el atacante no tiene dónde poner su shellcode.
Problema resuelto. Caso cerrado.

Solar Designer no cerró el caso. Lo abrió de nuevo.

En abril de 1997 publicó un parche para el kernel de Linux que marcaba la pila como no ejecutable.
Él mismo. El mismo que después, en agosto del mismo año, publicó en Bugtraq cómo saltarse ese parche.

No necesitas inyectar código si el código que necesitas ya existe en memoria.
`system()`. `execve()`. `/bin/sh` como string en libc.
Todo está ahí. Solo hay que redirigir el flujo hacia lo que ya existe.

Eso es **ret-into-libc**. No shellcode. No instrucciones propias.
El programa ejecuta su propia librería estándar con tus argumentos.

```c
// el atacante no escribe código nuevo.
// redirige EIP hacia system() en libc.
// pasa "/bin/sh" como argumento.
// la función estándar hace el trabajo.
```

Lo que Solar Designer demostró no fue solo una técnica.
Fue un principio: **las mitigaciones crean el siguiente vector**.
Cada defensa que se construye define la forma del ataque que viene después.

El NX bit moderno, DEP en Windows, la pila no ejecutable en Linux: todo desciende de ese parche de 1997.
Y todas las técnicas que los saltean: ROP, ret-into-libc, JOP: descienden de la respuesta que él mismo publicó dos meses después.

```txt
referenciado en: narnia2
técnica derivada: return-oriented programming (ROP)
siguiente entrada: → nergal.md
```

---

> *"the return-into-libc method is probably the best.
>  however, note that this requires the knowledge
>  of the exact version of libc."*
>
>: Solar Designer, Bugtraq, agosto 1997
