---
layout: post
title:  "Internal: Vulnyx"
date:   2025-08-18
categories: [Vulnyx]
tags: [Vulnyx, LFI, VNC, Fuzzing, Local Port Forwarding]
image: "../assets/machines/VULNYX/vulnyx.png"
---
Internal es una maquina maquina <span class="color-text-yellow">**Linux**</span> de nivel <span class="color-text-yellow">**MEDIUM**</span>, que esta basado en un <span class="color-text-salmon">**LFI**, **Local Port Forwarding**, **etc**</span>.

# Enumeracion
Comenzamos enumerando los puertos, versiones de servicio e informacion de los puertos abiertos de la maquina.

Encontramos los puertos:
- `22` del SSH.

- `80` De un servicio Web.

- `9999` De un servicio Web (?).

Si vamos a la `WEB`, veremos lo siguiente

Si analizamos el codigo fuente, o si hacemos **`hover`** en el logo de la web, encontraremos algo interesante:

Vemos que es una funcion en `PHP` y mejor aun, usa un parametro que recibe una *"web"*, la renderiza y muestra, pero... Y si ponemos rutas que no deberian estar disponibles del servidor.

Si intentamos el clasico LFI, podremos ver que existe una funcion que debe reemplazar el `.` y `/`, por lo que podemos hacer el truquito de `....//`.

## Buscando PID's

Si bien tenemos una forma de listar archivos dentro del servidor, no podemos listar `LOGS` como para efectuar un LFI to RCE via Log Poisoning, por lo que nos queda atentar contra la ruta:

`/proc/[ID]/cmdline`

Esto debido a que, en esta ruta se alojan los parametros de lanzamiento de un servicio con su respectivo PID, por lo que tenemos que hacer un **WEB-FUZZING**.

Entonces, ejecutamos lo siguiente:
{% highlight bash %}
for i in $(seq 1 1000); do curl -s "http://192.168.211.130/internal-item.php?item=index.html....//....//....//....//....//proc/$i/cmdline" | sed -n 's/<pre>//;s/<\/pre>//;s/\x0/ /gp' | grep -v '^$'; done
{% endhighlight %}

Y podremos encontrar credenciales de acceso al servicio web en el puerto `9999`

Pero podemos probar las credenciales en el servicio SSH.

# Privesc
El usuario no tiene archivos `SUID`, permisos en SUDOERS, pero si analizamos puertos y servicios internos, veremos que existe un puerto 5901

Si filtramos con `ps`, podremos ver lo siguiente:

Si buscamos dentro del home, encontraremos una carpeta `...`, si entramos, encontraremos un `zip`, por lo que al momento de descomprimirlo, podremos ver que nos pide una passwd, curiosamente se **REUTILIZAN** credenciales, por lo que obtendremos la credencial de acceso.

Lo que hare, es traerme el puerto del servidor a mi maquina, usare el propio `SSH` para esto.

Usaremos la password que hemos obtenido del `ZIP`, y accederemos a traves de `VNCVIEWER`

En mi caso le dare permisos `SUID` a la bash, por lo que ahora me queda tirar el privileged

# FIN