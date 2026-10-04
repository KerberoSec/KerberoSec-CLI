---
layout: single
title: File Upload Validation ByPass
excerpt: "En este Post, mostrare una serie de métodos para ByPassear la Validación de una subida de archivos cual solo permite cierta extensión o otros factores, llegando en algunos casos, a una ejecución remota de comandos (RCE)."
date: 2026-01-18
classes: wide
header:
  teaser: /assets/images/htb-writeup-shocker/
  teaser_home_page: true
  icon: /assets/images/
categories:
  - Web-documentation
  - Pentesting
tags:
  - HackingWeb
  - FileUpload
---

>Aquí un complemento acerca de este tema: [file-upload](https://hackviser.com/tactics/pentesting/web/file-upload)

### 1 FORMA: Null Byte

Cuando una web valida la extensión de un archivo para permitir solo ciertos tipos (como `.jpg` o `.png`), puedes intentar usar un **null byte** (`%00`) para evadir esa validación. 

El null byte es un carácter especial que indica el final de una cadena en muchos lenguajes, por lo que la validación puede detenerse antes de la extensión real del archivo. 

Por ejemplo, nombrar un archivo como `shell.php%00.jpg` puede hacer que la validación acepte `.jpg`, pero el servidor procese el archivo como `.php`. Sin embargo, esta técnica suele estar mitigada en sistemas modernos.

>Ej: Máquina "[Jerry](https://pabloventx.github.io/htb-writeup-Jerry/)" se ve este metodo.

>Está técnica se puede usar para diferentes ataques. Como *PATH TRAVERSAL* o *LFI*

### 2 FORMA: validación de formato en la cadena del nombre

Interpreta que al comprobar que en la cadena del nombre contiene `.x` (formato deseado), ya no compruebe lo que tiene después.

`shell.jpg.php`

En el formato `.php` podemos validar la subida de estos archivos dandoles alfinar las letras de otros formatos. Ejemplos:

```
.php3
.php4
.php5
.php6
.php7
.php8
.phtml
.pht
.phpt
.phps
.phar
.phfig
.inc
```

`shell.phar`

### 3 FORMA: Validación de los primeros bytes o "Magic Numbers"

Usado para identificar el archivo mediante los primeros bytes, aparte del propio formato.

````php
1 JPG; (En la primera línea del archivo)
2 <?php system("whoami"); ?>
````

>Ej: Challenge "[Trickster](https://pabloventx.github.io/pctf-writeup-Trickster/)", se ve este metodo.

>Más información: [List of Signatures](https://en.wikipedia.org/wiki/List_of_file_signatures)

### 4 FORMA: En Burp Suite capturar modificar campos del paquete

En Burp Suite, podríamos capturar un paquete y pasarlo por el "Repeater", para modificar campos; **Nombre del archivo, contenido del archivo, cambiar el Content-Type (Tipo de archivo) a diferentes formatos...** Hacer las formas anteriores pero usando dicha herramienta.

### 5 FORMA: Archivo que establece políticas/directivas a nivel directorio

<span style="color:green">.htaccess</span> -> Archivo configuración a **nivel directorio**, usado por <span style="color:lime">Apache HTTP Server</span>, que permite modificar el comportamiento del servidor sin tocar la configuración global -> (*httpd.conf* o *apache2.conf*). En este archivo podemos insertar directivas/políticas.

Ej: Ahora estableceremos una política cual permita que cualquier archivo que coincida con la extensión puesta o palabra, lo interprete como motor *PHP*. 

Se subira a la web primero el .htaccess y después el archivomalicioso.jpg

```bash
# Creamos el archivo de políticas a nivel directorio .htaccess
nano .htaccess 

# Establecer política de que el formato en este caso definido como .jpg sea interpretado como motor de PHP
AddType application/x-httpd-php .jpg
```

>En el challenge "[byp4ss3d](https://pabloventx.github.io/pctf-writeup-byp4ss3d/)", se ve este método.
