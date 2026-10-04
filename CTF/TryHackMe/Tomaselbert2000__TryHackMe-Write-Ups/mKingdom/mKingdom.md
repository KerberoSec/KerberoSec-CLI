# TryHackMe Rooms

## "Lazy Admin": Spanish Walkthrough

## Primeros pasos y configuración

Comenzamos configurando el archivo **hosts** asignando un dominio sencillo a la máquina objetivo. En mi caso, yo elegí _mkingdom.thm_.

```sudo echo <MACHINE_IP> mkingdom.thm```

## Reconocimiento

Iniciamos la sala con un escaneo de Nmap hacia el servidor, opcionalmente especificando el uso de scripts por defecto, rango de puertos e identificación de posibles sistemas operativos y servicios en ejecución. Luego de unos minutos, obtenemos los primeros resultados.

*[Image: alt text]*

- _Particularmente, elegí esperar más tiempo para el primer escaneo ya que además usé el switch **-p-**, el cual le indica a Nmap que escanee los 65535 puertos de la máquina. Esto a fin de no pasar por alto puertos importantes en el escaneo inicial que puedan retrasarme más adelante_

Identificamos que el único puerto abierto es el **85**. Abrimos el navegador y entramos al dominio de la máquina especificando dicho puerto.

*[Image: alt text]*

Dado que por si sola la imagen no da demasiada información, elegí abrir el código fuente para investigar más.

*[Image: alt text]*

- _En un intento por obtener mayor información a partir de la imagen, la descargué a mi máquina atacante para pasarla por **stegseek**, pero no obtuve ningún dato extra. Asimismo, la metadata extraída mediante **exiftool** tampoco reveló ninguna información adicional._

## Enumeración

Ya sabiendo que la máquina mantiene abierto el puerto 85, comenzamos a enumerar directorios. En mi caso, uso **FFUF** pero perfectamente se pueden obtener los mismos resultados con herramientas como **Dirbuster** o **Gobuster**.

*[Image: alt text]*

La enumeración revela la siguiente pista: existe un directorio **app** en el servidor. Nuevamente, revisamos mediante el navegador qué ofrece.

*[Image: alt text]*

Hacer click en el botón nos redirige hacia una nueva página ubicada en el subdirectorio **/castle**.

*[Image: alt text]*

- _El análisis del código fuente de esta página no arrojó detalles adicionales_

Nuevamente, enumeramos con FFUF pero esta vez apuntando al subdirectorio que acabamos de encontrar.

*[Image: alt text]*

Analizando la página en detalle, llegamos a la zona inferior de la misma, en la cual se encuentra un botón de inicio de sesión del CMS de la página.

*[Image: alt text]*

Clickeamos en dicho enlace, y nos redirige a la siguiente página.

*[Image: alt text]*

Dado que hasta este punto no obtuvimos usuarios ni contraseñas, probamos primero con la combinación típica por default: **admin** y **password**. Afortunadamente, dichas credenciales son correctas y permiten ingresar al panel de control del CMS.

*[Image: alt text]*

Luego de unos minutos de investigación, noto que el administrador de archivos me permite subir elementos desde mi máquina local, lo cual abre la posibilidad de subir una _reverse shell_. El problema es el filtro por defecto en el servidor que bloquea archivos con extensión .php. Sin embargo, en los ajustes permite especificar una lista de extensiones permitidas. Y dado que el usuario con el que entramos es administrador, podemos modificarla para permitir dichos archivos e intentar el primer acceso al servidor.

*[Image: alt text]*

Por lo tanto, configuramos una copia de la reverse shell de **PentestMonkey** con la IP y puerto en escucha de la máquina atacante, para luego subirla al servidor.

*[Image: alt text]*

*[Image: alt text]*

El siguiente paso será abrir y dejar en escucha la terminal con **Netcat** en el puerto configurado en el archivo (por costumbre, yo utilizo el 4444).

Una vez hecho todo esto, hacemos click en el enlace que se nos proporciona en pantalla, lo cual dispara la ejecución de la reverse shell y recibimos la conexión en la terminal.

*[Image: alt text]*

*[Image: alt text]*

- _Una vez recibida la terminal, ejecutamos los siguientes comandos para estabilizarla:_

Dentro del servidor, los dos usuarios que más nos interesan son **mario** y **toad** (podemos obtener esta información tanto mediante un cat a **/etc/passwd** como listando los directorios dentro de /home). El problema en este punto son los permisos, ya que la shell recibida nos conecta como **www-data***. Por lo tanto, abro un servidor temporal con Python en mi máquina local con una copia de linPEAS. Luego, en la máquina objetivo lo descargo en el directorio **/dev/shm** (directorio compartido en el cual todos los usuarios pueden leer y escribir, incluso www-data).

*[Image: alt text]*

Pasados unos minutos, la ejecución de linPEAS arroja gran cantidad de resultados. Dentro de todos ellos, el que considero más relevante para este punto de la sala es un string encontrado dentro de un archivo de configuración de PHP, el cual parece ser la contraseña del usuario Toad.

*[Image: alt text]*

Con esta cadena de texto, ejecutamos el siguiente comando en la terminal para loguearnos como Toad:

```su toad```

Ingresamos la contraseña, y efectivamente accedemos con dicho usuario.

*[Image: alt text]*

Dado que la 1er bandera no se encuentra dentro del directorio /toad, nos confirma que se encontrará o al menos estará relacionada con el usuario mario. No es posible acceder al contenido del directorio /mario por falta de permisos, por lo cual será necesario buscar más información para llevar a cabo el movimiento lateral.

*[Image: alt text]*

Luego de esto, toca buscar posibles puntos de ataque a través de archivos ejecutables.

```find / -type f -name "*.sh" 2>dev/null```

- _Uso un wildcard "*" para obtener cualquier archivo con extensión .sh, y con 2>dev/null omito la salida en consola para aquellos archivos sobre los cuales mi usuario no tiene permisos de lectura._

Esta búsqueda arroja una nueva pista, esta vez en el directorio **/var/www/html/app/castle/application/counter.sh**

*[Image: alt text]*

*[Image: alt text]*

## Razonamiento y pasos a seguir

Ya con toda esta información, es necesario hacer una pausa para recapitular y conectar estos datos. El primero de ellos acerca del archivo. Su nombre como tal busca simular una pista, ya que remite al protocolo **System Message Block** que permite compartir y acceder a archivos. Al principio de la sala, durante el escaneo con Nmap, no aparecieron indicios de puertos abiertos correspondientes a SMB, lo cual me llevó a pensar que esto no implicaba que de manera interna la máquina no esté corriendo dicho servicio sobre **localhost**. Sin embargo, luego de una revisión exhaustiva de servicios con **netstat** y **ss**, la máquina tampoco ejecuta SMB de manera local y descarté esa opción.
Por otro lado, el archivo ejecutable encontrado tiene como finalidad ejecutar un conteo de los archivos de la aplicación web y les añade una marca de tiempo (date). Y como en este caso dicho archivo pertenece a root, tiene más sentido pensar que será el pivot en la escalación de privilegios final de la sala.

Como siguente paso, listamos las variables de entorno del usuario Toad mediante el comando **env** o bien la variante **printenv**. Obtenemos una nueva pista asociada a una de ellas dentro de los resultados en pantalla.

*[Image: alt text]*

Me llama especialmente la atención el token que aparece cerca de la mitad de la salida de la terminal. Por la terminación con doble signo de igualdad ("=="), me da a entender que puede tratarse de un string codificado en **Base 64**, por lo tanto lo copio y decodifico en la misma terminal.

*[Image: alt text]*

- _Opcionalmente, también podemos usar [CyberChef](https://gchq.github.io/CyberChef/) para decodificar el string._

Una vez tenemos decodificado el string, ejecutamos un ```su mario``` para sustituir dicho usuario, ingresamos como contraseña el string obtenido en el paso anterior y completamos esta primera etapa del movimiento lateral.

*[Image: alt text]*

*[Image: alt text]*

## Escalación de privivegios

Llegado este punto de la sala, encontramos que dentro del directorio /mario se encuentra la bandera user.txt, la cual solo tiene permisos de root y no permite accederla aún. Por lo tanto, debemos aprovechar el movimiento lateral realizado para intentar ganar root en la máquina. Lo siguiente que hacemos es listar tareas programadas, así como investigar también el archivo **/etc/hosts** ya que podría sernos útil.

*[Image: alt text]*

Efectivamente, notamos a primera vista el detalle sobre los permisos del archivo hosts: el usuario mario tiene autorización de **escritura**. Esto abre la posibilidad a un ataque por **Envenenamiento de DNS** (ver enlace para más información [What is DNS cache poisoning?](https://www.cloudflare.com/learning/dns/dns-cache-poisoning/)).
El siguiente paso es comenzar a listar los procesos que la máquina ejecuta de manera detallada, bajo el siguiente razonamiento: es posible que algún proceso se esté ejecutando con permisos de root y que además use utilidades de red como por ejemplo **cURL** o **wget**. Por lo tanto, envenenar el DNS local podría conseguir que la dirección IP de destino de dicho proceso apuntase a la máquina atacante, logrando servir un archivo malicioso.
Por lo tanto, descargamos en la máquina atacante [pspy](https://github.com/DominicBreuker/pspy), herramienta que permitirá listar procesos en tiempo real **sin necesidad de root**.

*[Image: alt text]*

*[Image: alt text]*

Luego de unos segundos de ejecución, pspy comienza a capturar información sobre los procesos, y confirma la sospecha: el archivo **counter.sh** encontrado antes se ejecuta de manera programada y guarda logs dentro del archivo **/var/log/up.log**. Con esta información, ya tenemos una superficie de ataque lo suficientemente sólida para intentar escalar privilegios. Sin embargo, es importante tomar en cuenta dos detalles fundamentales:

- Dado que el servidor llama a mkingdom.thm en el puerto 85, es imperativo que el servidor HTTP temporal que levantemos en local esté en dicho puerto.
- La llamada que el servidor realiza apunta a la URL **mkingdom.thm:85/app/castle/application/counter.sh**, no podemos crear un archivo malicioso suelto en cualquier directorio y llamarlo counter.sh, es necesario **replicar la URL**.

## Escalación de privilegios

Con todas las piezas del rompecabezas listas, pasamos a la acción. Dentro de la carpeta donde nos sea más comodo levantar el servidor, vamos a crear la misma estructura que necesita el servidor, junto con el nuevo archivo counter.sh con la correspondiente _reverse shell_.

*[Image: alt text]*

*[Image: alt text]*

*[Image: alt text]*

*[Image: alt text]*

*[Image: alt text]*

Una vez conectamos la shell, solo queda estabilizarla, y obtener las banderas de la sala para finalmente completarla.

- _Notar que el comando cat no permitía leer ninguno de los archivos, ni siquiera como root, por lo tanto y para no perder tiempo, directamente optamos por hacerlo con strings_

*[Image: alt text]*

*[Image: alt text]*
