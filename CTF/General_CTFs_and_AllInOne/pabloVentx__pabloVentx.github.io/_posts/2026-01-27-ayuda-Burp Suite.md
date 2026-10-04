---
layout: single
title: Como usar Burp Suite
excerpt: "En este Post, enseñare a como usar Burp Suite, destacando las funciones mas importantes en cara al Hacking web para la hora de jugar con paquetes web, etc."
date: 2026-01-27
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
  - traffic-interception
---

##### ¿QUE ÉS?

**Burp Suite** es una herramienta que ya viene preinstalada en varias distribuciones de Linux. Es bastante útil e imprescindible, que nos permite recibir y manipular peticiones web.

Esto nos ayuda bastante para el ámbito de Hacking web, ya que según el uso que le demos, podemos hacer unas cosas u otras.

##### ¿COMPLEMENTOS?

En Burp Suite vendrá por defecto esta configuración de Proxy: <span style="color:darkred">127.0.0.1</span>:<span style="color:purple">8080</span>

Esto es importante saberlo porque va de la mano con la Extensión "<span style="color:rgb(238, 208, 157)">FoxyProxy</span>":

Para configurarla, necesitamos rellenar los siguientes parámetros para la conexión del proxy de nuestro navegador y Burp Suite:

-Burp Suite
-<span style="color:red">IP</span> <span style="color:tomato">localhost</span>: 127.0.0.1 
-<span style="color:purple">Puerto</span>: 8080
-HTTP

>En caso de querer configurarlo desde el navegador -> Network Settings -> Manual Proxy -> Http Proxy:127.0.0.1 Port:8080

##### ¿COMO SE CONFIGURA?

Antes de usar Burp Suite, lo principal será activar el Proxy de la extensión que hemos configurado.

Ahora en Burp Suite, lo configuraremos para capturar paquetes:
Nos iremos a  "Proxy" > "Intercept" > **Intercept on**.

También se recomienda agregar la IP de la página o dominio que tengamos al scope:
Nos iremos a "Target" > "Scope" > **Target Scope**.

El Scope define exactamente qué hosts, dominios o URLs forman parte del objetivo autorizado para probar, filtrando todo el tráfico irrelevante *(Google, CDNs, redes sociales...)* y mostrando solo lo del target en el Site map, Proxy history e interceptando únicamente peticiones in-scope.

Se usa para reducir ruido, evitar falsos positivos, limitar automáticamente herramientas como Intruder al ámbito permitido y proteger tanto al pentester como al cliente al delimitar claramente qué sí y qué no se debe tocar.

##### ¿UTILIDADES?
A continuación voy a listar algunas cosas comunes que se suelen hacer con esta herramienta, sin entrar en términos muy difíciles:

###### SITE MAP

Al coger un paquete va ir cogiendo; **scripts, tecnologías...** de lo que va cargando por detrás a nivel servidor.
Nos iremos al apartado de "Proxy" > **HTTP history**

Una vez esto sabido esto, nos hará un esquema con la estructura del sitio (de lo que tiene resgistrado):
Nos iremos a "Target" > **Site map**

###### REPEATER

Cuando capturamos un paquete le podemos hacer, Clic derecho > **Send to Repeater** o apretar   "**CTRL + R**", para mandarlo aquí.

En este apartado podremos modificar cualquier campo; **borrar, escribir...**
Usado para probar vulnerabilidades fáciles o complejas de controlar. Cuando le damos a "Send"
nos dice todo acerca de la salida de la solicitud -> <span style="color:lime">GET</span> | como si lo hiciéramos por la web pero por esta herramienta.

###### DECODER

En el apartado **Decoder**

Aquí podemos jugar con URLs; **Encodear, Decodear, hashear...**
Usado para inyectar código en las mismas.

Opciones a elegir, en este caso para encodear:

###### INTRUDER

Cuando capturamos un paquete le podemos hacer, Clic derecho > **Send to Intruder** o apretar   "**CTRL + I**", para mandarlo aquí.

Este apartado sirve para hacer ataques fuerza bruta, previamente habido configurado unos payloads que tendrán definidos unos diccionarios o valores, en los campos a atacar.

1) Hay 4 ataques distintos a probar:

2) Configuración de los payloads a atacar:

3) Definición del orden de los payloads y configuración individual, pinchas uno y luego el otro (diferentes ventanas):

Puedes cargar tus propios diccionarios de fuerza bruta o de lo que sea, según el uso:

Las palabras a probar del diccionario seleccionado:

4) En este apartado podemos pasar la respuesta del error o intento fallido del servidor para qué nos diga con que resultado sale otra cosa distinta:

Le damos a "Add".

Le damos a "Refetch response" y seleccionamos el mensaje, cual extrae automáticamente Burp Suite, en el campo "Extract from regex group".  Así nos dice si nos da un mensaje distinto a dicho mensaje definido a la hora de ejecutar el ataque.

5) Le damos a "Start attack", y empezara el ataque:

