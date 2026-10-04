---
layout: single
title: Neighbour: TryHackMe
excerpt: "En esta máquina tendremos un login, cual no dispondremos de ninguna credencial. En el código fuente de la página habra unas credenciales de invitado, accediendo. Miraremos el código fuente nuevamente, donde nos dira que el admin puede ser vulnerable, y en la URL tendremos =guest, acontenciendo la vulnerabilidad IDOR (Insecure Direct Object Reference) cambiando en el parámetro de la URL el usuario para convertirnos en otro usuario."
date: 2025-09-28
classes: wide
header:
  teaser: /assets/images/thm-writeup-neighbour/logo_neigh.png
  teaser_home_page: true
  icon: /assets/images/tryhackme.webp
categories:
  - TryHackMe
  - Pentesting
tags:
  - writeup
  - HackingWeb
  - InformationLekeage
  - IDOR
---

## WRITE UP
IP VÍCITMA-> 10.10.208.50 (TTL 63) LINUX

### RECONOCIMIENTO

Lo primero que vamos hacer es crear nuestro entorno de trabajo: <span style="color:lightblue">neighbour</span>

Dentro usaremos la herramienta de s4vitar *mkt* cual nos generara las carpetas necesarias para tener todo más organizado; **Nmap...**

Para empezar el reconocimiento, enviamos una traza ICMP a la <span style="color:red">IP</span> de la maquina víctima, para comprobar que tenemos conectividad, tenemos dos alternativas:

-Usar el script *whichSystem* que nos dirá directamente el equipo al que estamos atacando, por ende habrá tenido ping para dar la respuesta. Es más silencioso que nmap.

```bash
whichSystem.py 10.10.208.50
```

-Usar el comando *ping*: 

```bash
ping 10.10.208.50 -c1 -R
# -R Lo que hace es un record route que consiste que a la hora de hacer la petición se lo envía a un nodo intermediario para que no sea directa la petición, nos muestra el proceso.
```

Después de confirmar que tenemos conectividad, usaremos **nmap** para a ver que puertos tenemos abiertos y que protocolos/servicios tenemos.

```bash
nmap -p- --open -sS --min-rate 5000 -n -Pn -vvv 10.10.208.50 -oG allPorts
# Veremos porque el formato grapeable, es importante.
```

Una vez hecho, usaremos otra herramienta de s4vitar *extractports* al archivo allPorts
cual nos copiara los puertos, y escanearlos con nmap. 

```bash
extractports.sh allPorts
```

```bash
nmap -sVC -p22,80 10.10.208.50 -oN targeted
#  El formato -oN lo emplearemos con batcat lenguaje java para verlo mejor
#  Nos mostrará la versión de los servicios que están corriendo
#  Usará scripts defaults definidos en lua
```

Una vez escaneado, usaremos batcat:
>https://github.com/sharkdp/bat.git

```bash
batcat targeted -l java
# Nos mostrara la salida en un formato más bonito, con java
```

### ANÁLISIS WEB: RECONOCIMIENTO

Haremos un pequeño análisis a nivel web con *whatweb*.
Nos dirá que hay un formulario y una cookie de sesión.

```bash
whatweb http://10.10.208.50/
```

Entramos a la página web y estaremos en un formulario. Vamos a revisar el código fuente.
"**CTRL + U**"

Nos dice que podemos entrar como invitados <span style="color:blue">guest</span>:<span style="color:darkred">guest</span>  y nos dan el nombre <span style="color:blue">admin</span>.

Probamos a entrar como invitado.

Nos deja y revisamos el código fuente.
Dice que la cuenta admin puede ser vulnerable.

### VULNERABILIDAD IDOR (Insecure Direct Object Reference)

Vemos en la URL el nombre del usuario <span style="color:orange">=</span><span style="color:blue">guest</span>, pues lo cambiamos a <span style="color:orange">=</span><span style="color:blue">admin</span>.
Nos convertiremos en el, obteniendo la bandera.

> cuando una aplicación web permite acceder directamente a objetos internos (IDs, archivos, registros) sin verificar correctamente la autorización del usuario. Esto permite que un atacante manipule parámetros y acceda a datos o recursos de otros usuarios.
> ARTÍCULO: [Rinku IDOR](https://rinku.tech/idor/)

