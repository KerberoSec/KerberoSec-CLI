# `> [LORE : Y2K]`

```
evento:       Bug del Año 2000: Year 2000 Problem
también:      Y2K · el Millennium Bug
año:          1999-2000
clasificado:  mito urbano con raíz técnica real
costo estimado: 300-600 mil millones de dólares en correcciones globales
```

---

El mundo entró en pánico.
Los noticieros hablaban de aviones cayendo, reactores nucleares fallando,
cuentas bancarias vaciándose a medianoche del 31 de diciembre de 1999.

Nada de eso pasó.
Y por eso mucha gente concluyó que Y2K fue una mentira.
No lo fue.

El problema era real.
El pánico estaba exagerado.
Son cosas distintas.

En los años 60 y 70, el almacenamiento era caro.
Los programadores guardaban el año con dos dígitos: `99` en vez de `1999`.
Era eficiente. Era razonable para su época.
Nadie pensó que ese código iba a seguir corriendo treinta años después.

Pero siguió corriendo.

El problema: cuando el reloj llegara a `00`,
los sistemas lo interpretarían como 1900, no como 2000.
Cálculos de fechas. Vencimientos. Intereses. Registros médicos.
Todo dependía de que el año fuera un número de dos dígitos
dentro de un rango que nadie había definido explícitamente.

```
año almacenado: 99
año siguiente:  00
interpretación: 1900
diferencia:     -99 años
```

No era un overflow clásico.
Era una suposición implícita sobre el rango válido de un número
que nadie documentó y nadie cuestionó
hasta que fue casi demasiado tarde.

Se gastaron cientos de miles de millones de dólares
auditando y corrigiendo sistemas antes del 1 de enero de 2000.
Eso es lo que evitó el desastre.
No que el problema no existiera.

Y2K no fue un mito.
Fue la primera vez que el mundo entendió
que los números tienen contexto
y que ese contexto puede ser una vulnerabilidad.

En Narnia 8, el contexto es `int` vs `size_t`.
Con signo vs sin signo.
El candado dice que `-1` es menor que `256`.
`memcpy` dice que `-1` son cuatro mil millones de bytes.

Mismo principio.
Distinta escala.

```txt
referenciado en: narnia8
concepto derivado: integer overflow · signed/unsigned mismatch · implicit type assumptions
```

---

> *"The most dangerous kind of software vulnerability
>  is one that looks correct."*
