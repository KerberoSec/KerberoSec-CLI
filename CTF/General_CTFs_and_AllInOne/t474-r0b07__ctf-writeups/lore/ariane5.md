# `/lore/ariane5.md`

```
ARCHIVO CLASIFICADO: t474
ACCESO: lectura
ADVERTENCIA: un buffer overflow no es un error de principiante.
             es un error que destruyó un cohete de 500 millones de dólares.
```

---

El 4 de junio de 1996,
37 segundos después del despegue,
el Ariane 5 explotó.

No fue un ataque.
No fue sabotaje.
No fue un fallo mecánico.

Fue un número que no cabía donde lo pusieron.

Cuatro bytes. Quinientos millones de dólares.
Diez años de desarrollo. En llamas.

---

## `> cat que_paso.txt`

El Ariane 5 reutilizó software del Ariane 4.
Decisión razonable: el código era probado,
funcionaba, estaba certificado.

El problema: el Ariane 5 era más rápido.
Mucho más rápido.

El sistema de referencia inercial: el que mide la velocidad horizontal de la nave: devolvía un número de punto flotante de 64 bits.

Ese número se convertía a un entero de 16 bits.

En el Ariane 4, el número nunca era demasiado grande.
Cabía perfectamente en 16 bits.

En el Ariane 5, la velocidad horizontal era mayor.
El número no cabía.
Overflow.

El sistema tiró una excepción.
La excepción no estaba manejada.
El sistema se apagó.

El sistema de respaldo hizo exactamente lo mismo: porque era el mismo software.
También se apagó.

Sin sistema de navegación,
el cohete interpretó los datos de error
como datos de vuelo reales.
Giró. Se desintegró en el aire.
El mecanismo de autodestrucción hizo el resto.

---

## `> cat el_error.txt`

No fue falta de pruebas.
El código fue probado: para el Ariane 4.

El error fue asumir que un contexto diferente
no cambiaría los valores.

El error fue no validar que el número cabía
antes de hacer la conversión.

El error fue reutilizar software certificado
sin certificarlo en el nuevo entorno.

Cuatro bytes que no cabían en dieciséis bits.
El mismo principio que narnia0.
El mismo principio que cualquier buffer overflow.

La diferencia: en narnia0 lo hacés a propósito.
En el Ariane 5, nadie lo vio venir.

---

## `> cat la_leccion.txt`

Cuando el programador de narnia0
dejó entrar 24 bytes en un espacio de 20: cometió el mismo pecado que los ingenieros del Ariane 5.

Asumió que los datos iban a caber.
No validó el límite.
No manejó el desborde.

La escala es diferente.
El principio es idéntico.

Cada vez que escribís código que recibe input externo
y no validás el tamaño: estás construyendo tu propio Ariane 5.

Solo que el tuyo no va a explotar en el aire.
Va a explotar en producción.
Frente a alguien como vos.

---

## `> echo $REFERENCIA`

```
Lions, J. L. (1996). ARIANE 5 Flight 501 Failure.
Report by the Inquiry Board. ESA/CNES.

// el reporte oficial. está en internet. es público.
// 19 páginas. cada una duele más que la anterior.
// léelo antes de escribir otro scanf sin límite.
```

---

```
████████████████████████████████████████
█                                      █
█   37 s3gund0s.                       █
█   3s0 3s t0d0 l0 qu3 t4rd0           █
█         un d3sb0rd3 3n m4t4r          █
█         d1ez 4n0s d3 tr4b4j0.       █
█                                      █
████████████████████████████████████████
```

<!-- lore · t474-r0b07 · el desborde no distingue entre un CTF y un cohete. -->
