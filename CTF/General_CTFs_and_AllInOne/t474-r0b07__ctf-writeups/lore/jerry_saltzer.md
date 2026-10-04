# `/lore/jerry_saltzer.md`

```
ARCHIVO CLASIFICADO: t474
ACCESO: lectura
ADVERTENCIA: 0xDEADBEEF no es un número random.
             nunca fue un número random.
```

---

Cuando tiraste el `ltrace` en narnia0
y viste `0xDEADBEEF`: ¿qué pensaste?

Que era decorativo. Que era aleatorio.
Que el que escribió el código
simplemente eligió algo que sonara raro.

No.

Ese valor tiene historia.
Y la historia tiene nombre.

---

## `> cat el_valor.txt`

`0xDEADBEEF`

Leído en inglés: *dead beef*. Carne muerta.

Es lo que se llama un **magic number**: un valor constante con significado específico,
usado para marcar o identificar algo en memoria.

No es random. Es intencional.
Fue elegido porque es reconocible,
porque es fácil de ver en un volcado de memoria,
porque cuando aparece donde no debería: sabés exactamente qué estás mirando.

---

## `> cat saltzer.txt`

**Jerry Saltzer** es uno de los arquitectos del sistema operativo Multics: el abuelo de Unix, el abuelo de Linux,
el abuelo de todo lo que usás hoy.

En los años 60 y 70, Saltzer y su equipo
tenían que debuggear memoria en tiempo real.

El problema: cuando inicializás memoria,
si la llenás con ceros: todo parece válido.
Un puntero nulo, un entero sin inicializar, todo es cero.
No sabés si ese valor lo pusiste vos
o si simplemente estaba ahí.

La solución: llenar la memoria no inicializada
con un valor imposible de confundir.
Un valor que, si aparece en un registro o en un puntero,
te diga inmediatamente: *esto no fue inicializado*.

`0xDEADBEEF` era uno de esos valores.

Si tu programa crasheaba y el stack pointer era `0xDEADBEEF`: sabías exactamente qué pasó.

---

## `> cat los_otros.txt`

No era el único. Había toda una familia:

```
0xDEADBEEF  →  memoria no inicializada (el clásico)
0xCAFEBABE  →  magic number de archivos Java .class
0xFEEDFACE  →  magic number de binarios Mach-O (macOS)
0xDEADC0DE  →  marcador de código muerto
0xBAADF00D  →  memoria asignada pero no inicializada (Windows)
0x8BADF00D  →  "ate bad food": timeout en iOS
0xDEAD10CC  →  "dead lock": deadlock en iOS
```

Todos legibles. Todos inconfundibles.
Todos diseñados para que un humano mirando hex crudo
entienda de inmediato qué está viendo.

Eso es ingeniería pensada para el que viene después.

---

## `> cat la_leccion.txt`

En narnia0, el programador usó `0xDEADBEEF`
como valor de control: el que `val` tenía que tener
para que el programa te diera acceso.

No lo eligió al azar.
Lo eligió porque cualquiera que sepa lo que es
va a entender inmediatamente el juego.

El reto no era solo hacer el overflow.
Era reconocer el valor.
Era saber que `0xDEADBEEF` tiene historia.

Si no lo sabías: lo aprendiste ahora.

---

## `> echo $REFERENCIA`

```
Saltzer, J. H., & Schroeder, M. D. (1975).
The Protection of Information in Computer Systems.
Proceedings of the IEEE.

// uno de los papers más citados en seguridad informática.
// escrito hace 50 años. sigue siendo válido.
// si no lo leíste, no sabés de dónde viene todo esto.
```

---

```
████████████████████████████████████████
█                                      █
█   0xDEADBEEF n0 3s d3c0r4c10n.      █
█   3s un m3ns4j3 d3 l0s qu3           █
█         3st4b4n 4ntes.              █
█                                      █
████████████████████████████████████████
```

<!-- lore · t474-r0b07 · los que vinieron antes dejaron marcas. aprendé a leerlas. -->
