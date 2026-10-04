# `/lore/gusano_morris.md`

```
ARCHIVO CLASIFICADO: t474
ACCESO: lectura
ADVERTENCIA: el primer malware que colapsó internet
             no usó exploits sofisticados.
             usó strcpy.
             el mismo que acabas de ver en narnia1.
```

---

El 2 de noviembre de 1988,
Robert Tappan Morris lanzó un programa desde MIT.

No era un ataque.
Era un experimento.
Quería medir cuántas máquinas estaban conectadas a internet.

Setenta y dos horas después,
el 10% de todas las máquinas en ARPANET
estaban fuera de línea.

---

## `> cat que_paso.txt`

El gusano usó tres vectores para propagarse.
Uno de ellos era `fingerd`: el demonio que respondía
consultas sobre usuarios conectados en UNIX.

`fingerd` usaba `gets()` para leer input.
`gets()` no valida tamaño.
Copia hasta encontrar un byte nulo.
Si no lo encuentra: sigue escribiendo.

El gusano mandaba más datos de los que el buffer aguantaba.
Los bytes sobrantes pisaban la dirección de retorno.
El flujo de ejecución se desviaba al código del atacante.

No era magia.
Era memoria lineal que obedece al que escribe.

El mismo principio que narnia1.
La misma confianza ciega en el input.
La misma falta de validación.

---

## `> cat el_error.txt`

Morris no quería tirar internet.
El gusano tenía un mecanismo para no reinfectar
máquinas que ya estaban comprometidas.

Pero Morris lo desactivó.
Pensó que los administradores podrían usarlo
para inmunizar sus sistemas a propósito.

Entonces el gusano se replicó sin límite.
Una máquina podía tener cientos de instancias corriendo.
Los recursos se agotaban.
Los sistemas colapsaban.

El error no fue el exploit.
El error fue no medir las consecuencias
de un sistema que funciona exactamente como fue diseñado.

---

## `> cat el_resultado.txt`

Morris fue el primer condenado bajo la
Computer Fraud and Abuse Act de 1986.
Tres años de libertad condicional.
Cuatrocientas horas de servicio comunitario.
Diez mil dólares de multa.

Las máquinas afectadas: entre seis mil y seis mil quinientas.
En 1988, eso era el 10% de internet.

El costo estimado de recuperación:
entre cien y diez millones de dólares: nadie se puso de acuerdo en la cifra exacta.

Lo que sí quedó claro:
la red era frágil.
Y `strcpy` era una puerta abierta.

Treinta y seis años después: sigue siendo una puerta abierta.
Narnia1 lo demuestra.

---

## `> echo $REFERENCIA`

```
Spafford, E. H. (1989). The Internet Worm Program: An Analysis.
Purdue Technical Report CSD-TR-823.

Seeley, D. (1989). Password Cracking: A Game of Wits.
Communications of the ACM, 32(6).

// el reporte de Spafford es el análisis técnico más completo.
// está en internet. es público.
// léelo antes de escribir otro gets() sin validación.
```

---

```
████████████████████████████████████████
█                                      █
█   3l pr1m3r gus4n0.                  █
█   n0 fu3 s0f1st1c4d0.               █
█                                      █
█         fu3 strcpy.                  █
█         c0nf14nd0 d3m4s14d0.        █
█                                      █
████████████████████████████████████████
```

<!-- lore · t474-r0b07 · 1988. el mismo error. distinta escala. -->
