---
layout: single
title: NeoVault: Hack The Box
excerpt: "Este challenge simula una aplicación bancaria con funciones básicas como registro, transferencias y descarga de extractos. El reto esconde una vulnerabilidad **IDOR** en una versión antigua de su API. Manipulando identificadores de usuario, es posible acceder a archivos de otros clientes. El objetivo es explotar este fallo para obtener la flag y entender riesgos de control de acceso."
date: 2025-10-01
classes: wide
header:
  teaser: /assets/images/htb-writeup-neovault/logo_nv.png
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
  - API
  - IDOR
---

"Este challenge simula una aplicación bancaria con funciones básicas como registro, transferencias y descarga de extractos. El reto esconde una vulnerabilidad **IDOR** en una versión antigua de su API. 
Manipulando identificadores de usuario, es posible acceder a archivos de otros clientes. El objetivo es explotar este fallo para obtener la flag y entender riesgos de control de acceso."

## WRITE UP
Sesión Doker-> 94.237.55.43

### ANÁLISIS PÁGINA

Iniciamos la instancia del reto:

Nos metemos a la página, para analizarla.
En la interfaz de una aplicación bancaria sobre transferencias bancarias llamada "NeoVault".

Le daremos a "**Create Account**" y nos crearemos una cuenta, para ver como funciona por dentro que funciones a nivel usuario tenemos disponibles.

### ENUMERACIÓN SITIOS WEB

Tendremos una interfaz gráfica sobre transferencias, el histórico y seguimiento del dinero.

Entre las opciones que disponemos nos quedamos con:

<span style="color:lightblue">/Transfer</span>  Aquí podremos hacer transacciones a quien queramos.

<span style="color:lightblue">/Transactions</span> sacamos al usuario <span style="color:blue">neo_system</span> porque nos hizo una transacción de 100 dolares.
Nos podemos descargar un PDF con el historial de las transacciones.

Le damos arriba derecha a "Download".

### CONFIGURAR BURP SUITE: INTERCEPTAR PETICIONES

Usaremos *Burp Suite* para interceptar peticiones a nivel web, para analizarlas peticiones donde nos metamos.
Nos ponemos en escucha dándole a "Proxy" > "**Intercept on**".

### ENVIAR TRANSFERENCIA

Como <span style="color:blue">neo_system</span> nos ha enviado dinero, vamos a darle nosotros y, da igual la cantidad, le damos a "Transfer Money".

Nos sale esta pestaña, pero antes de aceptar, habrá que configurar un Proxy para recibir los paquetes a nuestro BurpSuite.

### CONFIGURAR FOXY PROXY

En la extensión de <span style="color:lightyellow">FoxyProxy</span>, configuramos uno para BurpSuite. 

Ponemos esta configuración:

*127.0.0.1* (apunta a nuestro localhost)
*8080* (Por este puerto)

Le damos a confirmar transacción, y nos saldrá la cuenta de la misma.

### ANÁLISIS SOLICITUDES

Miramos la petición de **Burp Suite** que ha capturado en el apartado "Proxy", y vemos que nos ha dejado el <span style="color:yellow">ID</span> de <span style="color:blue">neo_system</span>, por lo cual puede ser crítico si sabemos como aprovecharlo.

API: **POST** <span style="color:lime">/api/</span><span style="color:orange">v2</span><span style="color:lightblue">/transactions</span> 

>Son los datos que hemos enviado en la información de la transacción; cantidad dinero, razón...

<span style="color:blue">neo_system</span>:<span style="color:yellow">68dd6c1ce4e7643eadc1c73</span>

En el **HTTP HISTORY** vemos una respuesta donde podremos ver la información de la transacción.

API: **GET** <span style="color:lime">/api/</span><span style="color:orange">v2</span><span style="color:lightblue">/transactions</span> 

>Son los datos que nosotros recibimos, en este caso; la fecha de la transaccion, de quien la hizo  a quien la recibe... Esto se ve el histórico de transacciones.

Aquí concretamente.

API: **GET** <span style="color:lime">/api/</span><span style="color:orange">v2</span><span style="color:lightblue">/auth/inquire?</span>username=<span style="color:blue">neo_system</span>

>Verifica o consulta el estado del usuario** dentro del sistema de autenticación.

### RUTAS API ENDPOINTS

Nos vamos a las herramientas de desarrollador. "**CTRL + SHIFT + I**" 

"Debugger" > "app" > <span style="color:cyan">layout.js</span> > Filtramos por **API** y **{ }**

Encontraremos todos los <span style="color:lime">API endpoints</span> <span style="color:orange">v1</span> y <span style="color:orange">v2</span>.\

### MANIPULAR API ENDPOINTS

Cogemos la petición de cuando descargamos el PDF para ver nuestras transacciones.
La llevamos al **Repeater**.

API: **GET**  <span style="color:lime">/api/</span><span style="color:orange">v2</span><span style="color:lightblue">/transactions/download-transactions</span>

>Si ponemos los datos del neo_system, no estando en la v2 de la API, no saldrá nada.

```json
{
   "_id":68dd6c1ce4e7643eadc1c7"
   "username":"neo_system"
}
```

Si cambiamos del <span style="color:lime">API endpoint</span> <span style="color:orange">v2</span> al <span style="color:orange">v1</span>, y borramos el campo id y username, así pasándolo al **Response**:

API: **GET**  <span style="color:lime">/api/</span><span style="color:orange">v1</span><span style="color:lightblue">/transactions/download-transactions</span>

Dice que no hay id establecido.

Ponemos el campo "**id**" con lo que sea y nos dice que no ha relacionado ninguna id para el modulo usuario, dando un *Internal server error*.

API: **GET**  <span style="color:lime">/api/</span><span style="color:orange">v1</span><span style="color:lightblue">/transactions/download-transactions</span>

```json
{
      "_id":"test"
}
```

Ponemos el de <span style="color:blue">neo_system</span> y nos cargará un PDF de las transacciones de dicho usuario cual no podemos ver.

API: **GET**  <span style="color:lime">/api/</span><span style="color:orange">v1</span><span style="color:lightblue">/transactions/download-transactions</span>

```json
}
    "_id":"68dd6c1ce4e7643eadc1c73"
{
```

Para ver el PDF de sus transacciones, nos ponemos en escucha para capturar peticiones.
Nos vamos al apartado transacciones para descargarnos el PDF.

En la petición recibida hacemos lo de antes. Ponemos el <span style="color:yellow">ID del usuario</span> de <span style="color:blue">neo_system</span> y le damos a **Forward** para enviarla. Y ponemos la versión de la <span style="color:lime">API</span> a <span style="color:orange">v1</span>

API: **GET**  <span style="color:lime">/api/</span><span style="color:orange">v1</span><span style="color:lightblue">/transactions/download-transactions</span>

```json
}
    "_id":"68dd6c1ce4e7643eadc1c73"
{
```

### IDOR (Insecure Direct Object Reference) -> HISTORIAL NEO_SYSTEM

Vemos que aparte de las transacciones que ya sabemos, hay una nueva del usuario <span style="color:blue">user_with_flag</span>.

>Aconteciéndose así la vulnerabilidad *IDOR* (**Insecure Direct Object Reference**). La versión legada (`v1`) no valida correctamente los parámetros de usuario, permitiendonos (aunque sea con una cuenta normal) manipule el identificador interno de usuario (`_id`) para descargar archivos de transacciones de otros usuarios.

### VER HISTORIAL DEL NUEVO USUARIO

Vamos a coger su ID enviándole una transacción, así ver su historial de transacciones.

API: **GET**  <span style="color:lime">/api/</span><span style="color:orange">v2</span><span style="color:lightblue">/transactions/</span>

La tenemos -> <span style="color:blue">user_with_flag</span>:<span style="color:yellow">68dd6c1ce4e76430eadc1c78</span>

API: **GET** <span style="color:lime">/api/</span><span style="color:orange">v2</span><span style="color:lightblue">/auth/inquire?</span>username=<span style="color:blue">user_with_flag</span> 

>Verifica o consulta el estado del usuario** dentro del sistema de autenticación.

Hacemos lo mismo, le damos al botón de descargar PDF mientras estamos en escucha, recibimos la petición, y insertamos el <span style="color:yellow">ID del usuario</span> <span style="color:blue">user_with_flag</span>. Le damos a **Forward** para enviar la petición:

API: **GET**  <span style="color:lime">/api/</span><span style="color:orange">v1</span><span style="color:lightblue">/transactions/download-transactions</span>

```json
}
    "_id":"68dd6c1ce4e76430eadc1c78"
{
```

### BANDERA USUARIO

Nos mostrara el PDF del usuario con la bandera.

