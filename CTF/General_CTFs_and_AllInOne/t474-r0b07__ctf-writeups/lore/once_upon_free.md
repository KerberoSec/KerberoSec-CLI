# `> [LORE : ONCE UPON A FREE(): PHRACK 57]`

```
documento:    "Once upon a free()..."
alias:        anonymous
publicación:  Phrack Magazine, Issue 57, Article 9
año:          2001
técnica:      heap exploitation · use-after-free · chunk metadata corruption
```

---

En 2001, la comunidad de seguridad había dominado la pila.
Buffer overflows. Shellcode. NOP sleds. Ret-into-libc.
El stack era territorio conocido.

Phrack 57 abrió otra habitación.

El heap: la memoria dinámica, la que `malloc` administra: tenía su propia anatomía.
Sus propias estructuras internas.
Sus propios punteros de control.
Y sus propias vulnerabilidades.

Cuando `malloc` asigna un bloque de memoria,
no solo reserva el espacio que pediste.
Agrega metadata: cabeceras de chunk: que describen
el tamaño del bloque, si está libre, si el anterior está libre.
Esa metadata vive contigua a los datos del usuario.

```
[ chunk header ] [ datos del usuario ] [ chunk header ] [ datos del usuario ]
   (metadata)       (lo que pediste)      (metadata)       (siguiente bloque)
```

Si desbordar el buffer de datos del usuario
sobrescribe la metadata del chunk siguiente,
`free()` procesa esa metadata corrompida
y escribe datos arbitrarios en direcciones arbitrarias.

No estás atacando la pila.
Estás atacando el administrador de memoria
y dejando que él haga el trabajo.

En Narnia 11 el vector es más directo:
`name` y `print_privileges` coexisten en el mismo bloque.
No hay metadata de por medio.
El puntero de función vive exactamente después del buffer.
`strcpy` no sabe eso.
Copia hasta el `\x00` y sigue.

```c
struct User {
    char name[32];              // 32 bytes
    void (*print_privileges)(); // puntero de función: 4 bytes inmediatamente después
};
```

Lo que Phrack 57 formalizó fue el principio:
el heap tiene estructura.
La estructura tiene punteros.
Los punteros son objetivos.

La pila no es el único camino.

```txt
referenciado en: narnia11
técnica derivada: heap overflow · function pointer overwrite · use-after-free
publicación:      Phrack 57, 2001
```

---

> *"The stack is not the only road.
>  Sometimes the heap is faster."*
