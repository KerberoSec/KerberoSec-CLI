---
layout: single
title: Flag Command: Hack The Box
excerpt: "El objetivo es mediante un juego web, escapar del encantado bosque, descubriendo una opción secreta para ello."
date: 2025-08-20
classes: wide
header:
  teaser: /assets/images/htb-writeup-flagcommand/logo_fc.png
  teaser_home_page: true
  icon: /assets/images/hackthebox.webp
categories:
  - Hackthebox
  - Pentesting
  - Challenge
  - Web
tags:
  - writeup
  - challenge
  - HackingWeb
  - DevTools
---

"El objetivo es mediante un juego web, escapar del encantado bosque, descubriendo una opción secreta para ello."

## WRITE UP
docker host: 94.237.61.242:35563

### ANÁLISIS WEB: RECONOCIMIENTO

Iniciamos la instancia del reto:

Copiamos la IP del host en el navegador.
De primeras, vemos en la página, la introducción del juego y unos simples comandos con "help", que nos dicen como empezarlo...

Si ponemos "**start**", vemos que nos salen 4 opciones y hay que elegir una, pero si nos equivocamos morimos y habrá que poner "**restart**". A medida que avanzamos, llegamos a un punto en el que da igual que opción elijamos que vamos a morir si o si.

### ANÁLISIS DEV TOOLS:  NETWORK Y TOMAR BANDERA

Vamos a probar ver las solicitudes en la red que recibe la página mientras que la página funciona.
Apretamos en el teclado "**Ctrl + shift + i**"  > "Network" y refrescamos la página.

Vemos distintas solicitudes, entre ellas, una que destaca llamada  "<span style="color:green">options</span>" y que nos deja acceder,  si le hacemos doble Clic , nos lleva al **endpoint del api**  <span style="color:lightblue">/options</span>  con las opciones que ya conocemos.

hay una opción secreta, que la copiaremos.

Ahora, empezamos el juego "**start**" y copiamos dicha opción, así nos devolverá la flag, escapando del bosque.

