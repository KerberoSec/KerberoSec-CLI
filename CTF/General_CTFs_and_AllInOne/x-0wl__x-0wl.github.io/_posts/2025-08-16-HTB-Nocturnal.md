---
layout: post
title:  "Nocturnal: HackTheBox"
date:   2025-08-16
categories: [HTB]
tags: [HackTheBox, IDOR, Command Injection, PHP, Authenticated RCE, Web Exploitation]
image: "../assets/machines/HTB/HTB_Nocturnal/logo.png"
---
**Nocturnal** es una máquina Linux de dificultad <span class="color-text-lime">**EASY**</span> centrada en el análisis de una aplicación web en PHP, donde se exploran fallos de acceso, análisis de código y explotación de software vulnerable. Ideal para practicar técnicas realistas de enumeración, obtención de credenciales y escalada de privilegios.

# Enumeracion
Usaremos nuestra herramienta para enumerar <span class="color-text-yellow">**PUERTOS ABIERTOS**</span>, en este caso usare `rustscan`.

Como podemos apreciar, la maquina tiene los puertos:
- `22` del SSH.

- `80` de un HTTP.

Si vamos a la web, veremos que apunta a un dominio: `nocturnal.htb`.

 Pero no puede resolver al host, esto lo podemos resolver haciendo lo siguiente:
{% highlight bash %}
#Como ROOT
echo "<IP> <HOST> | tee -a /etc/hosts"
{% endhighlight %}

Entonces, una vez podamos entrar a la web, veremos que se trata de:

Vemos que es un sitio que aloja archivos de tipo Word, Excel y PDF, a la par que existen rutas visibles como `login` y `register`.

Una vez registrados y logueados veremos lo siguiente:

Si subimos un archivo, en este caso `test.pdf`, podremos ver que podremos descargarlo:

Si comenzamos a editar los parametros, veremos algo interesante, si cambiamos el username por cualquier valor

Veremos que no nos encuentra el usuario, esto puede darnos indicios de un `IDOR`.
Por las dudas, cambiaremos el valor del parametro `file`, y veremos que en este caso la alerta nos muestra que no existe el archivo, pero <span class="color-text-red">muestra los archivos que existen dentro</span>.

## Encontrando usuarios
Entonces, si conocemos mas o menos que valida primero la existencia de un usuario y luego enumera los archivos guardados por el mismo, nos quedara hacer un <span class="color-text-red">**web fuzzing**</span>.

Y como podemos ver, acabamos de encontrar distintos usuarios, por lo que queda enumerar que encontramos en sus archivos subidos.
Si vemos el usuario `amanda`, encontraremos un archivo llamado `privacy.odt`, si descargamos este fichero, veremos un mensaje que dice:

Entonces, si probamos las credenciales, podremos ingresar como `amanda` en el sistema web.

Vemos que `amanda` tiene permisos de administrador, por lo que daremos un vistazo a eso.

Veremos que podemos ver la estructura de la web, algo curioso es que se nos permite crear **backups**, y no solo eso, podremos dar un vistazo al <span class="color-text-red">**codigo fuente**</span>.
Por lo que encontraremos cosas interesantes como:
{% highlight php %}
//dashboard.php
$db = new SQLite3('../nocturnal_database/nocturnal_database.db');
$user_id = $_SESSION['user_id'];
$username = $_SESSION['username'];

//Crear zip
$logFile = '/tmp/backup_' . uniqid() . '.log';
$command = "zip -x './backups/*' -r -P " . $password . " " . $backupFile . " .  > " . $logFile . " 2>&1 &";
        
{% endhighlight %}
Y tambien un filtro para caracteres no permitidos:
{% highlight php %}
//admin.php
function cleanEntry($entry) {
    $blacklist_chars = [';', '&', '|', '$', ' ', '`', '{', '}', '&&'];

    foreach ($blacklist_chars as $char) {
        if (strpos($entry, $char) !== false) {
            return false; // Malicious input detected
        }
    }

    return htmlspecialchars($entry, ENT_QUOTES, 'UTF-8');
}
{% endhighlight %}

- Conocemos que se usa SQLite3.

- Conocemos donde se encuentra la base de datos.

- Conocemos los caracteres en blacklist.

- Conocemos como se crea el ZIP.

Pero si vemos los caracteres en **blacklist** y como se crea el log, podremos encontrar algo interesante, no esta en blacklist el `\n` o famoso **salto de linea**.
Por lo que podremos tratar de montarnos un ataque por ese vector descubierto.
Si damos un vistazo a la tabla ascii, podremos ver que el valor **HEX** del salto de linea es `0A`, o en su forma URL-ENCODED %0A, a la par que podemos usar las **tabulaciones** como espacio, en este caso `09` o `%09`.

Aplicando estos conceptos, podemos usar el comando de SQLite3 -> `.dump`
{% highlight bash %}
sqlite3 <DATABASE>.db .dump
{% endhighlight %}
Obteniendo asi los hashes para romper de los usuarios

Si leemos el `/etc/passwd` aprovechando el Command Injection, descubriremos que el usuario `tobias` existe, por lo que romperemos su password, dando consigo:

Por lo que entraremos por SSH.
## Privesc
Si entramos como el usuario `tobias`, podremos ver que no posee permisos de sudoers, ni de SUID o capabilities, por lo que si listamos procesos o servicios que esten prendidos dentro de la maquina, veremos que existe un servicio WEB.

Si analizamos de que se trata usando `CURL`, podremos ver que es una web cuyo titulo es ISPConfig, por lo que nos quedaria traer ese servicio a nuestra maquina por **Port Forwarding**.
Esto lo lograremos con
{% highlight bash %}
ssh -L <PUERTOATACANTE>:<IP>:<PUERTOVICTIMA>
{% endhighlight %}

Como podemos ver, los hemos traido el servicio del servidor a nuestra maquina, dato curioso, `tobias` no existe como usuario en el servicio, pero si existe `admin`, que comparte la misma password.
Si analizamos en el apartado de `Help`, encontraremos la version:

Haciendo una busqueda rapida en internet, nos toparemos con un `CVE`.
## CVE-2023-46818
Nos topamos con el [CVE-2023-46818](https://github.com/bipbopbup/CVE-2023-46818-python-exploit/tree/main), creado por `bipbopbup`, es una vulnerabilidad que inyecta codigo PHP dentro de un parametro mal sanitizado en la parte de edicion de lenguaje.
Ejecutamos el EXPLOIT, y ya ganamos acceso como ROOT a la maquina.

# FIN