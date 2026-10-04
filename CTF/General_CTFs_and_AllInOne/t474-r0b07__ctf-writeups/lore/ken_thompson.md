# `> [LORE : KEN THOMPSON]`

```
nombre:       Kenneth Lane Thompson
alias:        ken
origen:       Nueva Orleans, EE.UU.
relevancia:   co-creador de Unix · co-creador del lenguaje B · creador de UTF-8
documento:    "Reflections on Trusting Trust": ACM Turing Award Lecture, 1984
```

---

En 1984, Ken Thompson subió al escenario del ACM Turing Award y dijo algo
que la mayoría de la sala no quiso escuchar.

No habló de lo que había construido.
Habló de por qué nada de lo que construimos puede ser confiado completamente.

La demostración fue simple.
Un compilador modificado que, al compilar el programa de login de Unix,
insertaba una puerta trasera: sin que el código fuente del login mostrara nada.
Y además: al compilar cualquier compilador nuevo,
se auto-replicaba en él.

El código malicioso no estaba en ningún archivo.
Estaba en el binario del compilador.
Invisible al código fuente. Invisible a la auditoría.

```c
// no podés encontrar esto leyendo el código.
// porque no está en el código.
// está en lo que el código produce.
```

La conclusión no era técnica. Era filosófica.

> *"You can't trust code that you did not totally create yourself."*

No confíes en el compilador que no compilaste.
No confíes en el compilador con el que compilaste ese compilador.
La cadena de confianza no tiene fondo.

Narnia 3 no explota código.
Explota exactamente esto: la confianza implícita en que una variable
inicializada al principio del programa
sigue siendo lo que era al final.

El programador confió en `ofile`.
No debía.

```txt
referenciado en: narnia3
concepto derivado: supply chain attacks · trusting trust · compiler backdoors
siguiente entrada: → nergal.md
```

---

> *"You can't trust code that you did not totally create yourself."*
>
>: Ken Thompson, ACM Turing Award Lecture, 1984
