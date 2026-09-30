```
████████╗██████╗ ██╗   ██╗██╗  ██╗ █████╗  ██████╗██╗  ██╗███╗   ███╗███████╗
╚══██╔══╝██╔══██╗╚██╗ ██╔╝██║  ██║██╔══██╗██╔════╝██║ ██╔╝████╗ ████║██╔════╝
   ██║   ██████╔╝ ╚████╔╝ ███████║███████║██║     █████╔╝ ██╔████╔██║█████╗
   ██║   ██╔══██╗  ╚██╔╝  ██╔══██║██╔══██║██║     ██╔═██╗ ██║╚██╔╝██║██╔══╝
   ██║   ██║  ██║   ██║   ██║  ██║██║  ██║╚██████╗██║  ██╗██║ ╚═╝ ██║███████╗
   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝
```
*[Image: banner]*
```bash
$ whoami
> t474_r0b07

$ pwd
> /writeups/tryhackme

$ cat /etc/mission
> 4qu1 n0 s3 c0l3cc10n4n fl4gs.
> 4qu1 s3 4n4l1z4n p0s1c10n3s.
```

---

## `> cat identity.txt`

```
esto no es una colección de walkthroughs.
esto no es un repositorio de tutoriales.
esto no es una guía de comandos.
```

> TryHackMe tiene miles de writeups. Este repositorio también los tiene.
> La diferencia no está en el contenido: está en el enfoque.
> Cada máquina aquí se documenta como una partida. No porque el ajedrez
> sea una metáfora elegante. Porque resulta útil.

| cada servicio | es una pieza |
|---|---|
| cada decisión | modifica la posición |
| cada error | deja algo sin defender |

---

## `> cat context.txt`

```bash
$ cat /etc/arrival
> llegué a TryHackMe desde OverTheWire.
> sé lo que es pelear una posición real.
> sé lo que es cuando no hay posición que pelear.
```

> 21 salas. Top 25%. Un día. No por velocidad: porque la posición se leía sola. TryHackMe en estos niveles no desafía. Etiqueta. Los formularios ya traían los guiones, las respuestas casi visibles en los campos de texto. No lo digo como crítica al que empieza: es el camino correcto para aprender. Lo digo como contexto para entender esta serie. Estas partidas no son el registro de alguien descubriendo cómo funciona un sistema. Son el registro de alguien analizando por qué el sistema ya había perdido antes de que llegara.

```bash
$ cat /etc/verdict
> el sistema no estaba defendido.
> estaba etiquetado.
```

---

## `> cat rules.conf`

```ini
[game]
flag          != objective
root          != victory
copy_paste     = false
fast_answers   = suspicious
reasoning      = required

[philosophy]
; no se buscan vulnerabilidades: se analizan posiciones
; no se busca root: se estudia cómo el sistema llegó a perder
```

---

## `> cat framework.txt`

> El objetivo no es mostrar comandos. El objetivo es entender
> por qué la posición ya estaba perdida.

```bash
$ grep -r "what_matters" /sys/mindset/
> the flag marks the end of the lab.
> not the end of the investigation.
```

---

## `> tree methodology/`

```
methodology/
│
├── ♟  APERTURA/       → ¿qué sabemos?
├── ♞  SEÑAL/          → ¿qué sobresale?
├── ♝  HIPÓTESIS/      → ¿qué creemos?
├── ♝  PRUEBA/         → ¿cómo lo validamos?
├── ♜  INICIATIVA/     → ¿qué ganamos?
├── ♛  JAQUE/          → ¿qué cambió?
├── ♚  JAQUE_MATE/     → ¿cómo termina?
└── ♜  ANÁLISIS/       → ¿por qué era inevitable?
```

> No todas las partidas recorren el mismo camino.
> Pero casi todas pasan por alguno de esos directorios.
> La estructura no es fija. Se adapta a la máquina.

---

## `> cat notation.txt`

```
♟  apertura         →  primer contacto con la máquina
♞  pieza expuesta   →  enumeración · señales · anomalías
♝  combinación      →  hipótesis · variantes · líneas de juego
♜  iniciativa       →  acceso inicial · ruptura · ventaja material
♛  rey expuesto     →  escalada · defensa colapsada
♚  jaque mate       →  root. siempre jaque mate. no cambia.
```

> No todas las máquinas pierden igual.
> No todas las partidas terminan por la misma razón.

---

## `> grep learning attempts.log`

```bash
[+] wrong hypotheses    → preserved
[+] dead ends           → documented
[+] failed attempts     → most useful data lives here
[+] the moment it clicked → especially that one
```

> Las hipótesis equivocadas se conservan. Los callejones sin salida también.
> El aprendizaje aparece justo antes de abandonar una idea.
> No después del jaque mate.

---

## `> tail -f progress.log`

```bash
PARTIDA   ROOM                     STATUS           
────────  ───────────────────────  ───────────────  
001       RootMe                   ✅ [jaque mate]   
002       Blue                     ✅ [jaque mate]   
003       Vulnerability Capstone   ✅ [jaque mate]   
004       Pickle Rick              ✅ [jaque mate]   
005       Simple CTF               ✅ [jaque mate]   
006       [PENDIENTE]              [░░░░░░░░░░]     
007       [PENDIENTE]              [░░░░░░░░░░]     
008       [PENDIENTE]              [░░░░░░░░░░]     
009       [PENDIENTE]              [░░░░░░░░░░]     
010       [PENDIENTE]              [░░░░░░░░░░]     
```

---

## `> cat observation.log`

```
el rey raramente cae en el movimiento que importa.
para cuando ves el jaque mate,
la posición ya estaba perdida.
```

> El sistema no fue comprometido el día del ataque.
> Fue comprometido el día en que alguien tomó una mala decisión
> y pensó que nadie la iba a encontrar.

---

## `> cat tablero.txt`

```
r n b q k b n r
p p p p p p p p
. . . . . . . .
. . . . . . . .
. . . . . . . .
. . . . . . . .
P P P P P P P P
R N B Q K B N R
```

> todas las partidas empiezan igual.
> raramente terminan igual.

---

## `> cat /var/log/sys.log | tail -1`

```
[♟] 526f6f74206e6f20657320656c2066696e616c2064656c20726f6f742e
    45732073696d706c656d656e746520656c20756c74696d6f206d6f76696d69656e746f2e
```

---

<details>
<summary><code>// s1 ll3g4st3 4qu1, 3st4b4s busc4nd0</code></summary>

```bash
$ cat /hidden/truth.txt

> ♟ cada servicio habla.
> ♞ algunos gritan.
> ♝ pocos saben escuchar.
> ♜ t474 escucha.
> ♛ el rey ya sabe lo que viene.
> ♚ jaque mate.
```

</details>

---

> *// l1v3 pr0c3ss · 3sp4ñ0l · 3rr0r3s 1nclU1d0s*
> *→[https://youtube.com/t474-r0b07](https://youtube.com/@kaderd.garnica?si=9vk1E6Gkkb7LftTK)*
---

> *→ [github.com/t474-r0b07/ctf-writeups](https://github.com/t474-r0b07/ctf-writeups)*

<!--
  "It is not about predicting all the results,
   but about devising a better strategy
   than your opponent's.": Garry Kasparov
-->
