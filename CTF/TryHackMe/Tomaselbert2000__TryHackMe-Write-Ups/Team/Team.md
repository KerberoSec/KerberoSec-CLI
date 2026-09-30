# TryHackMe Rooms

## "Team": Spanish Walkthrough

## Primeros pasos y configuración

Para comenzar con el reconocimiento del  objetivo, será de gran ayuda configurar el archivo **hosts** especificando la dirección IP de la máquina objetivo. Esto permitirá referir al objetivo mediante un nombre de dominio sencillo como "team.thm" al momento de entablar contacto con el servidor, ya sea para enumerar, descubrir puertos, etc.

```sudo echo MACHINE_IP team.thm >> /etc/hosts```

Como detalle a recordar, en caso de reiniciar la instancia, la IP cambiará por lo cual solamente será necesario reemplazarla en el archivo hosts con la nueva dirección proporcionada por THM.

## Reconocimiento

En la etapa inicial del ataque, se opta por utilizar las siguientes herramientas básicas a fin de obtener una imagen concreta del objetivo:

* Nmap
* Gobuster
* FFUF

A continuación se muestran los resultados de cada una de ellas:

### Nmap

*[Image: alt text]*

Los detalles a los cuales debemos prestar atención dentro de este primer escaneo son:

* El puerto **21** expone el servicio vsftpd v3.0.5 (notar el número, para buscar posibles vulnerabilidades que apunten a esa versión en específico)
* El puerto **22** (SSH) se encuentra abierto
* El puerto **80** se encuentra abierto, y dado que corre Apache 2.4.41, se decanta que sirve una página web

### Gobuster

*[Image: alt text]*

La imagen anterior muestra un intento de enumeración de directorios sencillo, usando como lista de palabras la propia de Gobuster, disponible [aquí](https://github.com/matteo741/Gobuster/blob/main/wordlist.txt).
Es importante destacar que pese a haber descubierto dos directorios interesantes en el servidor (assets y scripts), la información no resulta suficiente para pivotar hacia la fase de ataque. Por lo tanto, se opta por llevar a cabo un 2do intento de fuzzeo, esta vez dirigido directamente al directorio /scripts, en busca de cualquier archivo o que pueda ser de utilidad. Para ello, se eligió aplicar **FFUF**.

### FFUF

En esta parte, aprovechamos la gran velocidad de fuzzeo que provee la herramienta para atacar directamente al directorio en busca de archivos que puedan revelar información que permita elaborar una estrategia de ataque más sólida, ya que hasta este punto, la superficie de ataque es aún insuficiente. Dado que se buscan archivos, se configura FFUF para buscar por extensiones típicas que podríamos encontrar dentro de un directorio de scripts, como pueden ser **.php** o **.sh**; así como también se aprovecha la instancia de fuzzeo para buscar más archivos de texto que puedan ser relevantes. Si bien la lista de directorios usada es sustancialmente extensa, no fue necesario correrla en su totalidad, ya que luego de unos minutos, arrojó el siguiente hallazgo:

*[Image: alt text]*

Se puede apreciar que el servidor expone un archivo de texto llamado "script.txt", el cual retorna un **status code 200** en la respuesta del servidor, lo cual indica que podemos acceder a él, ya sea con un navegador o descargándolo a la máquina atacante.

*[Image: alt text]*
*[Image: alt text]*

Dentro del archivo se puede ver que refiere a credenciales de acceso por FTP, las cuales no se encuentran directamente aquí, pero prestando atención al comentario final, el archivo sugiere que existe una copia o versión anterior del mismo la cual si contiene dichas credenciales, las cuales permitirán acceder al servidor aprovechando que el puerto 21 se encuentra abierto en escucha. Por lo tanto, volvemos a fuzzear con FFUF, esta vez cambiando las extensiones de archivo por opciones típicas a archivos de respaldo y/o copias de seguridad:

*[Image: alt text]*

Llegado este punto, encontramos que, efectivamente, el servidor expone el archivo original con las credenciales hardcodeadas, por lo cual accedemos a él con el mismo procedimiento que usamos antes, obteniendo así las credenciales en texto plano:

*[Image: alt text]*

## Inicio del ataque al servidor

### Acceso por FTP

Una vez conseguidas las credenciales de acceso, abrimos una ventana de la terminal para conectarnos por FTP, especificando tanto el sitio como el puerto:

*[Image: alt text]*

Una vez conectados al servidor, usamos el comando **ls** para listar el contenido del directorio actual de trabajo (es posible que el servicio tarde en responder, en dado caso, solo es necesario esperar a que realice el listado). Dentro de la carpeta se encuentra una subcarpeta interesante, llamada **workshare**. Con el comando **cd** nos movemos a ella, para dar con un nuevo archivo de texto llamado "**New_site.txt**". Por último, con el comando **get** descargamos el archivo a nuestra máquina local.

*[Image: alt text]*

## Análisis de archivo "New_site.txt"

*[Image: alt text]*

Al leer el archivo, se obtienen varios datos importantes que serán de mucha utilidad para obtener la primera flag:

* Menciona dos usuarios: **Dale** y **Gyles**
* Se confirma que el servidor utiliza **PHP**, además que indica un dominio hasta ahora desconocido, "**.dev**"
* Sugiere que hay claves **RSA** que no se encuentran bien configuradas hasta el momento

Dado el flujo actual de reconocimiento, lo siguiente que hacemos es comenzar a investigar el subdominio en construcción. Al igual que con el dominio principal, lo vamos a agregar al archivo hosts:

```sudo echo MACHINE_IP dev.team.thm >> /etc/hosts```

Dado que se encuentra en desarrollo, no es viable realizar enumeración directamente al subdominio, por lo tanto lo abrimos en nuestro navegador, y veremos una pantalla como la que se muestra a continuación:

*[Image: alt text]*

Lo siguiente es analizar el código fuente de la página para obtener más información, dado que como tal, la página no dice mucho. Al abrir el código, nos encontramos con otra pista:

*[Image: alt text]*

Se puede ver que dentro del código, hay un enlace que apunta a un archivo **script.php**, el cual además recibe parámetros, siendo en este caso **teamshare.php**. Es decir, al ejecutarse, busca este recurso dentro del servidor, por lo cual se puede pensar en que este recurso sea vulnerable a una _[Local File Inclusion](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/11.1-Testing_for_Local_File_Inclusion)_ (LFI). Probamos con el comando típico para listar el contenido del archivo /etc/passwd, para lo cual lo pasamos como parámetro en la URL (usando la técnica de [Path traversal](https://en.wikipedia.org/wiki/Directory_traversal_attack))

*[Image: alt text]*

### Fuzzeo de archivos

Se confirma entonces que el servidor es vulnerable ya que no valida correctamente el input del usuario, por lo tanto permitirá acceder a archivos desde fuera del servidor. Lo siguiente, es comenzar a aplicar este método, en conjunto con la información de los usuarios encontrados, para obtener más archivos y, potencialmente, la 1era flag.
Dado que buscar manualmente es costoso en cuanto a tiempo, volvemos a aplicar FFUF, esta vez tomando como URL objetivo la que indica el script que encontramos dentro del subdominio .dev. Como lista de palabras, podemos usar alguna de las opciones que provee **SecLists**.

*[Image: alt text]*

Dado que la lista es algo extensa y compleja de leer, vuelvo a correr el comando, esta vez dirigiendo la salida a un archivo de texto, para luego poder filtrar por palabras clave usando **grep**. En este caso, se opta por buscar por el término "ssh" dado que la nota anterior sugiere una configuración incorrecta o bien incompleta relacionada con SSH.

*[Image: alt text]*

Dado que podemos intentar leer archivos del servidor explotando la LFI encontrada antes, usamos el mismo procedimiento para acceder al archivo de configuración principal de OpenSSH, el cual se encuentra en **/etc/ssh/sshd_config**

*[Image: alt text]*

A efectos prácticos, abrimos la vista con el código fuente de la página, y terminamos de obtener la clave privada del usuario **Dale** que se encuentra expuesta tal como sugería la nota en New_site.txt.

*[Image: alt text]*

Copiamos la clave desde la vista de código, y luego la editamos para eliminar los "#" sobrantes. Una vez hecho esto, y para que la clave sea funcional y nos permita conectarnos, le asignamos los permisos necesarios al archivo

```chmod 600 SSH_KEY```

Y una vez todo listo, podemos usar la clave obtenida para conectarnos por SSH al servidor con la cuenta del usuario Dale

*[Image: alt text]*

## Bandera user.txt encontrada

No es necesario más que listar el directorio principal del usuario Dale para encontrar la primera bandera, hacemos un **cat** sobre el archivo y copiamos el contenido.

*[Image: alt text]*

La flag es el único archivo que se encuentra dentro de la carpeta del usuario Dale. Por lo tanto, nos movemos al directorio **/home** y listamos en busca de más información. Allí encontramos la carpeta correspondiente al usuario Gyles mencionado dentro de la nota que leímos antes. Y dentro de esta carpeta un archivo interesante llamado **admin_checks**, el cual es un script de Bash, como se muestra a continuación:

*[Image: alt text]*

Y no solamente esto, sino que al buscar dentro del directorio **/opt**, se encuentra una carpeta con el mismo nombre que este script, la cual no podemos acceder directamente con el usuario Dale debido a permisos insuficientes. Claramente la ejecución de este script se relaciona con dicha carpeta, por lo cual pasamos a analizarlo en detalle para comprender qué hace.

## Análisis del script y movimiento lateral

Este archivo ejecutable parece actuar como una utilidad de copia de seguridad rudimentaria dentro del servidor. Básicamente, al ejecutarlo solicita un nombre al usuario y lo almacena en una variable de nombre **name**. Luego, usando ese nombre, lo escribe al final del archivo /var/stats/stats.txt. Acto seguido, pide al usuario que escriba la palabra **date** la cual indicaría la fecha, y almacenando a su vez este último valor dentro de otra variable de nombre **error**. Esta parte es la más importante, ya que se puede ver como el script redirige este valor de $error como si se tratara de un comando del sistema. Finalmente, se encarga de crear un archivo con extensión **.bak** a partir del archivo stats.txt original, asignandole la fecha ingresada como _timestamp_.
La clave en este caso será buscar una forma de inyectar comandos directamente dentro del contexto de ejecución de este archivo.
Por otra parte, y para descartar dudas, listamos también los permisos de la carpeta y archivo de destino mencionados en el script:

*[Image: alt text]*

Por si sola esta información no termina de ser suficiente para movernos lateralmente en el servidor y pasar al usuario Gyles o bien root. Lo siguiente que hacemos en este caso es listar qué cosas se pueden ejecutar como super usuario desde el usuario Dale, usando:

```sudo -l```

Y además, buscamos los permisos específicos de este archivo:

```ls -lah```

Obtenemos los siguientes resultados:

*[Image: alt text]*

Con esta información, podemos derivar la siguiente conclusión: el usuario Dale puede ejecutar este archivo en nombre de Gyles, indicando la ruta que se muestra en la salida del comando **sudo -l**. Por lo tanto, existe la chance de impersonar a Gyles para ejecutar el archivo, pasarle un comando como **whoami** a modo de prueba y verificar si efectivamente lo ejecuta o no. Y dado que Gyles tiene mayores permisos que Dale, si esto funciona, permitirá el movimiento lateral necesario para obtener la 2da bandera.
Ejecutamos el siguiente comando para utilizar sudo en nombre de Gyles, aplicando el switch **-u** y especificando su nombre:

```sudo -u gyles /home/gyles/admin_checks```

Notar que el comando debe ser exactamente igual a lo que vimos anteriormente en la salida de **sudo -l**. Es decir, **no hay que invocar a Bash** cuando ejecutamos el script.

*[Image: alt text]*

Se puede apreciar que al terminar de ejecutarse el archivo, el texto mostrado en pantalla para el parámetro **date** corresponde al nombre de usuario **gyles**, por lo cual confirma que al pasarle como valor el comando whoami, el sistema lo ejecutó correctamente. El siguiente paso será ejecutar nuevamente el archivo, esta vez provocando que el sistema devele mayor información acerca del directorio que encontramos anteriormente.

## Explotación de admin_checks sobre el directorio /opt/admin_stuff

Dado que ya comprobamos que el script permite inyectar comandos en nombre del usuario Gyles, será de mucha utilidad para obtener más información sobre el directorio **/opt/admin_stuff**. Recordar que al ingresar por SSH con el usuario Dale, no contamos con permisos para leer sobre este directorio, dado que pertenece a Gyles. Por lo cual, usamos el comando **ls- lah** como valor para el parámetro "date" al momento de ejecutar el script. Y esto permite obtener información sobre el contenido del directorio.
Esto último termina siendo muy revelador, ya que expone un nuevo archivo de nombre **script.sh** como único contenido del directorio. Siguiendo la misma estrategia, volvemos a ejecutar admin_checks, esta vez pasando como parámetro el comando **cat** apuntando a este archivo para imprimirlo en pantalla. Como detalle adicional, vemos que este archivo tiene permisos de ejecución como **root**¨:

*[Image: alt text]*

Se puede apreciar que al realizar un **cat** sobre el archivo, se muestra en pantalla su contenido, revelando que se encuentra configurado en un **cronjob**, con una cadencia de 1 minuto. Es decir, pasado ese tiempo, el sistema ejecutará el contenido del script, el cual inicialmente realiza un backup local de dos de los sitios que el servidor contiene.

### Elaboración de nueva estrategia de ataque

Incluso aunque se puedan inyectar comandos a través de la ejecución del archivo **admin_checks**, no es posible escribir directamente sobre **script.sh** debido a permisos insuficientes. Esto bloquea de momento la posibilidad de agregar un comando al archivo que genere una _reverse shell_. Por lo cual ahora volvemos a ejecutar el archivo, pero usando en su lugar estos dos comandos que sirvan para obtener información tanto sobre los **grupos** como sobre los propietarios del directorio /admin_stuff:

*[Image: alt text]*

Y luego de ejecutar ambos comandos, encontramos que el usuario gyles pertenece al grupo **admin**, el cual tiene permisos de **escritura** sobre el directorio, lo cual abre la puerta a poder pivotar desde este aquí para conseguir la 2da bandera. Para ello, y aprovechando nuevamente la vulnerabilidad anterior, vamos a ver el contenido de los dos scripts nuevos que acabamos de encontrar, así como también intentar saber quien tiene permisos sobre ellos.

*[Image: alt text]*

Luego de ejecutar varias veces, encontramos un nuevo dato que puede ser muy útil: el archivo ubicado en /usr/local/bin/main_backup.sh está asociado al grupo **admin**, el cual sabemos que Gyles pertenece. Por lo tanto, una opción viable es, a sabiendas que se ejecuta como root, intentar explotarlo.

## Shell interactiva a través de la ejecución de admin_checks

Para este último paso, optamos por intentar abrir una shell interactiva al ejecutar admin_checks. Es importante notar que si bien en pantalla no se visualiza nada, la shell corre en 2do plano a través del script y es posible ejecutar comandos en ella. Y por si fuera poco, dado que esta shell se ejecuta internamente con los permisos de gyles, permitirá escribir sobre el archivo **main_backup.sh**.

*[Image: alt text]*

Es necesario ser preciso con el input que ingresamos dentro de la shell, ya que al no tener salida en pantalla se vuelve más difícil reconocer si cometemos un error o no al escribir los comandos. Por otra parte, es posible usar Tabs para autocompletar así como también se puede pegar texto, lo cual será de ayuda para no cometer errores de sintaxis al escribir a ciegas en la shell.
En la imagen se puede apreciar que primero se fue probando con comandos sencillos como "whoami" para validar que el script se modifica correctamente. Una vez confirmado esto, agrego un comando que permita abrir una **reverse shell** dentro del equipo como root, la cual apunta al puerto 4444 de mi máquina local que ya tengo configurada previamente en escucha por **Netcat**.

## Bandera root.txt encontrada

Una vez listo el comando dentro de main_backup.sh, solo esperamos 1 minuto a que el sistema ejecute el cronjob asociado al archivo. Una vez pasado ese tiempo, veo en mi terminal de Netcat que efectivamente el servidor se ha conectado a mi máquina con permisos de **root**, por lo cual solamente listo el directorio y hago un **cat** sobre el archivo encontrado para obtener la 2da bandera y finalizar la sala.

*[Image: alt text]*
