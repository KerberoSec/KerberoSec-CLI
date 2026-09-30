# `/lore/little_endian.md`

```
ARCHIVO CLASIFICADO: t474
ACCESO: lectura
ADVERTENCIA: si pensás que esto es un detalle técnico menor,
             seguís siendo turista.
```

---

Hay cosas que usás todos los días
sin saber que tienen nombre.
Sin saber que alguien peleó por ellas.

Little-Endian es una de esas cosas.

---

## `> cat que_es.txt`

Tu procesador lee la memoria en orden.
La pregunta es: ¿en qué orden?

Tenés el número `0xDEADBEEF`.
Ocupa 4 bytes. Tiene que vivir en algún lugar de la RAM.

La dirección de memoria más baja: ¿qué guarda?
¿El byte más significativo o el menos significativo?

```
dirección →  0x00  0x01  0x02  0x03

Big-Endian:   DE    AD    BE    EF    ← el más grande primero
Little-Endian: EF    BE    AD    DE    ← el más chico primero
```

Little-Endian pone el byte menos significativo
en la dirección más baja.

Al revés de como lo escribís.
Al revés de como lo pensás.
Exactamente como lo lee tu procesador x86.

---

## `> cat por_que_al_reves.txt`

Tiene sentido. Aunque no lo parezca.

Pensá en el número `1`.
En Little-Endian vive así en memoria: `01 00 00 00`

Si querés saber si el número es par o impar: mirás el primer byte. `01`. Listo.
No tenés que recorrer los cuatro.

Para operaciones aritméticas,
empezar por el byte menos significativo
es más eficiente en hardware.

Intel lo vio. Eligió Little-Endian.
x86 es Little-Endian.
x86-64 es Little-Endian.
Tu máquina es Little-Endian.

---

## `> cat en_la_practica.txt`

Narnia0. El valor que tenías que meter: `0xDEADBEEF`

En tu cabeza: `DE AD BE EF`
En memoria x86: `EF BE AD DE`

Por eso el payload era `b"\xef\xbe\xad\xde"` y no `b"\xde\xad\xbe\xef"`.

Si hubieras mandado `DE AD BE EF`: la comparación fallaba.
La shell no abría.
Y vos seguías sentado preguntándote por qué.

Muchos se quedan ahí.
Ven que no funciona y prueban otra cosa.
Nunca entienden por qué.

---

## `> cat la_trampa.txt`

Cuando lees un número en un debugger: `gdb`, `x/wx`, lo que sea: te lo muestra como lo entendés vos.
`0xDEADBEEF`. De izquierda a derecha.

Cuando lo volcás a hex crudo: `xxd`, `hexdump`: te muestra lo que hay en memoria.
`EF BE AD DE`.

El mismo número. Dos representaciones.
Una para humanos. Una para la máquina.

La confusión entre las dos
ha roto más exploits que cualquier firewall.

---

## `> echo $REFERENCIA`

```
Cohen, D. (1980). On Holy Wars and a Plea for Peace.
→ el origen del nombre. léelo.

Patterson & Hennessy. Computer Organization and Design.
→ capítulo de representación de datos. sin rodeos.

// si llegaste hasta acá sin buscar nada: // volvé a leer desde el principio.
```

---

```
████████████████████████████████████████
█                                      █
█   n0 3s qu3 3st3 4l r3v3s.          █
█   3s qu3 t474s l33n d3sd3            █
█         3l 0tr0 l4d0.               █
█                                      █
████████████████████████████████████████
```

<!-- lore · t474-r0b07 · el orden importa. siempre importó. -->
