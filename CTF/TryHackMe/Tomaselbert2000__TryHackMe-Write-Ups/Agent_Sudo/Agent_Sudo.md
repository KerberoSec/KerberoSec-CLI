# TryHackMe Rooms

## "Agent Sudo": Spanish Walkthrough

## Primeros pasos y configuración

Para comenzar la sala, como siempre partimos de la configuración inicial del archivo hosts. Anotamos la dirección IP de la máquina objetivo proporcionada por THM y le damos un nombre de dominio sencillo para luego referirnos a ella mediante este nombre y no necesitar el valor de la IP. En mi caso, yo elegí "agentsudo.thm".

```sudo echo "agentsudo.thm <MACHINE_IP>" >> /etc/hosts```

## Reconocimiento

Abrimos **Nmap**, y tomando como base el dominio que elegimos en el paso anterior, ejecutamos un escaneo básico sobre el objetivo para obtener un vistazo de los puertos abiertos y los servicios que ejecutan. Notar que de ahora en adelante y en repetidas ocasiones, ejecuto los escaneos redirigiendo la salida de la herramienta en uso mediante el **pipe** (|) y el comando **tee**. Esto no es obligatorio, pero si muy útil para guardar los resultados en archivos de texto y poder consultarlos más adelante en caso de dudas.

## Enumeración

*[Image: alt text]*

### _¿Cuántos puertos hay abiertos?_

Dada la información que devolvió Nmap al terminar, podemos confirmar que el objetivo expone a la red externa **3 puertos**:

- FTP
- SSH
- HTTP

Al ver que el puerto 80 está abierto, nos indica que muy probablemente se trate de un sitio web. Como ya guardamos el dominio en el archivo hosts, nos dirigimos a esa URL con el navegador para buscar más información.

*[Image: alt text]*

_**"Dear agents,**_

_**Use your own codename as user-agent to access the site.**_

_**From,**_
_**Agent R"**_

El anuncio es claro, es necesario cambiar el User-Agent dentro de las solicitudes que se hagan al servidor, para poder identificarnos y continuar avanzando en la sala.

### _¿Cómo me redirecciono a la página secreta?_

Tomando en cuenta la pregunta, podemos razonar que el procedimiento o clave para poder acceder a una página secreta dentro del servidor es con el User-Agent, siendo a su vez este término la **respuesta** a la 2da pregunta.

### _¿Cuál es el nombre del agente?_

Dado que para poder acceder a mayor información es necesario aplicar el **nombre en código** (referido como "codename" por la sala) como User-Agent, nos dirigimos a nuestra herramienta de intercepción de solicitudes habitual. En mi caso, opté por usar OWASP ZAP, pero de igual manera se puede usar también Burp Suite.
En esta parte, comenzamos a tirar del hilo a partir de las pistas planteadas en el anuncio:

- Es necesario usar el **codename** como valor para el User-Agent en la solicitud HTTP
- El anuncio está firmado por **Agent R**

Por lo cual, tiene sentido pensar que una buena forma de probar cómo entrar, sea enviar repetidas solicitudes usando distintas letras como identificador hasta dar con una que permita obtener más información. Por lo tanto, creamos una _wordlist_ con el abecedario, y la pasamos a la pestaña "Resend with Request Editor" (el equivalente en caso de usar Burp Suite es "Repeater"). Luego, seleccionamos el texto del User-Agent en la solicitud, damos click derecho, y presionamos "Fuzz". Se abrirá una ventana en la cual podemos pasar el parámetro **payload** que queremos fuzzear. Luego, seleccionamos la lista de palabras para usar durante el ataque (yo armé la mía) y comenzamos a enviar solicitudes. Luego, en la parte inferior de la pantalla, podemos ver si varía o no la respuesta del servidor.

*[Image: alt text]*

*[Image: alt text]*

Analizando el tamaño de las responses y el texto, noté que no había variación alguna en ninguna de ellas. Por lo tanto, redoblamos la apuesta. Probamos nuevamente con la lista de palabras, pero en este caso usando solamente las letras sin especificar la palabra "Agent" en la solicitud. Luego de ajustar la lista de palabras, volvemos a enviar el ataque.

*[Image: alt text]*

Nuevamente, miramos el tamaño de las respuestas, así como los códigos de estado que devuelve el servidor. Notamos entonces que para el caso de la letra C, el código pasó de ser un 200 a **302**, así como también cambió el tamaño en bytes a comparación al resto de la lista. Por lo tanto, seleccionamos esta solicitud, hacemos click derecho y la abrimos en Requester, le damos a Send, y observamos que el cuerpo de la response contiene un mensaje y dentro del mismo, la respuesta de la 3er pregunta de la sala.

## Crackeo de hash y ataque por fuerza bruta

### Contraseña FTP

Dentro del mensaje, se deja en claro que el usuario a quien va dirigido posee credenciales dentro del servidor, y no solo eso sino que además la contraseña es **débil**, por lo cual podría ser fácil de vulnerar. Recordemos que el puerto FTP se encuentra abierto, por lo tanto, el siguiente paso será intentar vulnerarlo con un ataque de fuerza bruta. Para ello, elegí usar **Hydra**. Especificamos el nombre de usuario que encontramos en el paso anterior, como lista de palabras elegimos **rockyou.txt** y la IP del objetivo, anteponiendo el prefijo "ftp" para atacar ese servicio. Luego de unos momentos (la velocidad puede variar acorde a la potencia de la máquina atacante), Hydra consigue conectarse exitosamente.

*[Image: alt text]*

Y ahora que ya tenemos credenciales, abrimos la terminal, y con la herramienta nativa de FTP, nos conectamos al servidor. Luego, con el comando **dir**, listamos los contenidos del directorio. Finalmente, con **get** descargamos a la máquina local los archivos que nos interesen.

*[Image: alt text]*

Una vez tenemos los archivos en la máquina local, vamos a analizarlos en busca de más pistas, empezando por la nota para el Agente J.

*[Image: alt text]*

**_"Dear agent J,_**

**_All these alien like photos are fake! Agent R stored the real picture inside your directory. Your login password is somehow stored in the fake picture. It shouldn't be a problem for you._**

**_From,_**
**_Agent C_"**

Esta nota nos indica que las imágenes son falsas, pero que la imagen real se encontraría dentro del directorio del Agente J. Además, como pista extra sabemos que la contraseña de login del agente se encuentra en una de las imagenes falsas. Sabiendo esto, volvemos a la terminal y comenzamos a buscar información oculta en los archivos.
En este caso, no me fue posible usar **steghide** debido a que para extraer la información, requiere el ingreso de una _passphrase_ o salvoconducto. Fue entonces, que luego de unos minutos de investigación, di con **stegseek**, similar a la anterior pero con la capacidad de atacar la contraseña del archivo por fuerza bruta. Le pasamos el archivo, y especificamos el switch **--crack**. Luego, vemos en pantalla algunos resultados nuevos e interesantes.

*[Image: alt text]*

Al finalizar la ejecución, la herramienta genera un archivo **ASCII text** que podemos leer fácilmente desde la terminal, el cual contiene un nuevo mensaje para el Agente J.

*[Image: alt text]*

**_"Hi james,_**

**_Glad you find this message. Your login password is hackerrules!_**

**_Don't ask me why the password look cheesy, ask agent R who set this password for you._**

**_Your buddy,_**
**_chris"_**

Por otra parte, continuamos analizando las imagenes encontradas, esta vez mediante **binwalk**, herramienta que permite encontrar archivos ocultos o incrustados dentro de otros, aplicando búsqueda por extensiones conocidas. Binwalk se encarga de extraer automáticamente los archivos y los destina a una carpeta con el mismo nombre para poder gestionarlos. Al terminar, notamos que hay dos archivos nuevos que llaman nuestra atención: una nota para el Agente R, y un archivo zip, el cual a este punto sabemos que se encuentra cifrado con contraseña por la consigna de la sala.

*[Image: alt text]*

Dado que el archivo tiene contraseña, podemos pasarlo primero por **john** para crackearla usando **rockyou.txt**.

*[Image: alt text]*

Y una vez tenemos la contraseña, accedemos al archivo.

*[Image: alt text]*

A continuación, respondemos las preguntas de esta sección de la sala en base a la información obtenida.

### Contraseña del archivo zip

La contraseña del archivo zip es **alien**

### Contraseña Steg

La contraseña aplicada en la esteganografía de la imagen es **Area51**

### ¿Cual es el nombre completo del otro agente

El nombre completo del agente es **james**

### Contraseña SSH

La contraseña SSH, la cual corresponde a james, es **hackerrules!**

## Capturando la bandera user.txt

### ¿Cual es la bandera user.txt?

Ya tenemos credenciales para entrar por SSH al servidor, por lo cual, volvemos nuevamente a la terminal y nos conectamos como james, listamos el directorio del usuario, y dentro encontramos la bandera **user.txt**, además de una nueva imagen que también será necesario analizar.

*[Image: alt text]*

Dado que nos encontramos conectados por SSH, usamos **scp** para descargarnos el archivo (recordar activar el servicio SSH en la máquina local para recibir la conexión).

*[Image: alt text]*

### ¿Cuál es el nombre del incidente en la imagen?

*[Image: alt text]*

Al ver la imagen, se decanta que la respuesta a la pregunta es la supuesta autopsia a un extraterrestre en el incidente de Rowsell ocurrido en México, **"Roswell alien autopsy"**.

## Escalación de privilegios

Una vez dentro de la máquina, nos disponemos a obtener información relevante acerca de los permisos y capacidades del usuario james dentro del servidor con comandos típicos como **sudo -l** y **groups**.

*[Image: alt text]*

Luego, dentro del directorio de dicho usuario (ya que es aquí donde tenemos permisos de lectura y escritura), transferimos desde la máquina atacante una copia de **linPEAS** mediante un servidor HTTP temporal con Python. Luego, le asignamos permisos de ejecución.

*[Image: alt text]*

*[Image: alt text]*

Una vez descargado el archivo, le cambiamos los permisos para permitir su ejecución y lo corremos.

*[Image: alt text]*

Luego de analizar la salida en la terminal, no encontré archivos relevantes, claves expuestas o pistas reales. Pero sí podemos ver que al inicio del proceso, linPEAS reporta que la **versión de sudo** instalada es la 1.8.21p2. Por lo tanto, guiados por el nombre de la sala y, así como también una de las preguntas refiere a una **CVE**, nos disponemos a investigar esta versión en específico.

*[Image: alt text]*

Una vez realizada una investigación acerca de esta versión y las vulnerabilidades que tiene, damos con que, debido a la regla explícita que tiene configurada y que vimos anteriormente al correr **sudo -l**, el punto de ataque radica en cómo el sistema identifica al usuario que invoca a sudo y cómo lo interpreta internamente. Recordemos la regla:

_**(ALL, !root)**_

Esta regla le indica al sistema que **cualquier usuario** podrá invocar a sudo, **excepto** el usuario **root**. Pero el detalle radica en que si bien en este caso la regla hace referencia mediante el nombre o _tag_, también es posible referir a un usuario mediante su **UID**. El usuario root sabemos que tiene el UID 0, por lo tanto, si el UID del usuario especificado al llamar a sudo es **distinto** a 0, el sistema **permite la ejecución**. De modo tal que, en este caso, se debe proporcionar un **valor negativo** como por ejemplo -1.
Debido a que en este caso referimos al usuario mediante el valor numérico, es necesario además usar el **#** en el comando.

```sudo -u#-1 /bin/bash```

*[Image: alt text]*

Y ya con la terminal con permisos de root, nos desplazamos al directorio de dicho usuario y obtenemos la bandera root.txt.

*[Image: alt text]*

### CVE utilizado para la escalación de privilegios

La vulnerabilidad utilizada corresponde a la **CVE-2019-14287**.

### Bonus: ¿Quién es el Agente R?

El nombre real del Agente R es **DesKel**.
