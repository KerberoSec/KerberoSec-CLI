# `/lore/danny_cohen.md`

```
ARCHIVO CLASIFICADO: t474
ACCESO: lectura
ADVERTENCIA: si no sabés quién es este tipo,
             no entendés por qué tu exploit funciona.
```

---

¿Sabés por qué metiste los bytes al revés?

No. No lo sabés. Copiaste el comando, viste que funcionó,
y seguiste. Tranquilo. Yo también hice eso la primera vez.

Pero hay un tipo que sí lo pensó.
Y lo pensó en 1980, antes de que vos nacieras.

Se llamaba **Danny Cohen**.

---

## `> cat origen.txt`

Cohen era investigador. De los que piensan en serio: no de los que publican papers para tener papers.

En 1980 escribió un memo que no era un memo.
Era una declaración de guerra.

Se llamaba ***"On Holy Wars and a Plea for Peace"***.

Arrancaba así: con Gulliver. Con los Lilliputianos.
Con una guerra absurda sobre por qué lado romper el huevo.

Desde el extremo grande. Desde el extremo chico.
*Big-Endians. Little-Endians.*

Cohen no inventó los términos para ser gracioso.
Los usó para decir algo que nadie quería escuchar:

> que dos arquitecturas completamente válidas
> estaban en guerra por una convención arbitraria.
> y que esa guerra iba a costar caro.

Tenía razón.

---

## `> cat el_problema.txt`

Mirá este número: `0xDEADBEEF`

En memoria, dependiendo de quién seas, lo guardás así:

```
Big-Endian    →  DE AD BE EF   (el byte más grande primero)
Little-Endian →  EF BE AD DE   (el byte más chico primero)
```

Ninguno está mal.
Los dos son válidos.
Los dos son incompatibles.

Cuando mandás datos de una máquina a otra
y no acordaron el orden: el número llega corrupto.
Nadie sabe por qué.
Todo falla en silencio.

Eso es lo que Cohen vio venir.

---

## `> cat la_guerra.txt`

Intel eligió Little-Endian.
Motorola eligió Big-Endian.
Sun eligió Big-Endian.
ARM arrancó Little-Endian y después se volvió configurable.

La red: TCP/IP: eligió Big-Endian.
Por eso se llama *network byte order*.

Y cada vez que un protocolo cruza una arquitectura,
alguien tiene que llamar a `htons()` o a `ntohl()`
para dar vuelta los bytes.

Esa función existe porque Cohen escribió ese memo.
Esa función existe porque la guerra que él predijo
efectivamente ocurrió.

---

## `> cat por_que_importa.txt`

Cuando escribiste `b"\xef\xbe\xad\xde"` en narnia0: eso fue Little-Endian.

`0xDEADBEEF` al revés.
Porque tu procesador es x86.
Porque x86 es Intel.
Porque Intel eligió un bando en 1980.

No lo hiciste porque lo entendías.
Lo hiciste porque alguien en un foro lo escribió así
y funcionó.

Ahora lo entendés.

La próxima vez que escribas bytes al revés,
sabés el nombre del tipo que lo explico primero.

**Danny Cohen. 1980. Un memo sobre huevos.**

---

## `> echo $REFERENCIA`

```
Cohen, D. (1980). On Holy Wars and a Plea for Peace.
USC/ISI. IEN 137.

// está en internet. buscalo. leelo.
// no es largo. es devastadoramente claro.
```

---

```
████████████████████████████████████████
█                                      █
█   3l 0rd3n d3 l0s by t3s             █
█         n0 3s un d3t4ll3.            █
█         3s un4 3l3cc10n.             █
█                                      █
████████████████████████████████████████
```

<!-- lore · t474-r0b07 · el que entiende el origen, controla el destino -->
