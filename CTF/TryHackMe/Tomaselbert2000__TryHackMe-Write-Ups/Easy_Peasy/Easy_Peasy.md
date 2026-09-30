# TryHackMe Rooms

## Easy Peasy: Spanish Walkthrough

## Primeros pasos y configuración

Como siempre y para hacer más sencilla la interacción con la máquina objetivo, primero que todo guardamos su IP dentro del archivo **hosts** con un dominio fácil, en este caso yo elegí "easypeasy.thm".

̣̣```sudo echo 'MACHINE_IP easypeasy.th,' >> /etc/hosts```

## Enumeración inicial con Nmap

Comenzamos enumerando la máquina con nuestra herramienta de confianza, a fin de obtener información relevante sobre qué tipo de objetivo se trata. Además, será mediante esta enumeración que vamos a ir contestando las preguntas iniciales durante la primer parte de la sala.

### Cantidad de puertos abiertos

Esta pregunta fue algo "tramposa" al principio, ya que pide encontrar la **cantidad** de puertos abiertos en el servidor. Al realizar un primer escaneo con Nmap, obtuve esta información:

*[Image: alt text]*

Dentro de la salida, lo único que encontré fue el puerto **80** abierto, con lo cual mi respuesta inicial fue **1**. Esto es incorrecto, por lo que volví a escanear el servidor, esta vez especificando el switch  **-p-** para que se enumeren **todos los puertos**.

### Versión de Nginx en ejecución

Dado que en el escaneo ya especifiqué la búsqueda y descubrimiento de servicios, utilizando el switch **-A**, obtuve que la versión de Nginx que corre en el servidor es la **1.16.1**.

### Servicio en ejecución en el puerto más alto

Ya en este punto y aprovechando el escaneo anterior, obtuve que el puerto más alto es el **65524** y en él se ejecuta **Apache 2.4.43**. En la siguiente imágen se muestra la salida en consola con la respuesta a las 3 preguntas anteriores:

*[Image: alt text]*

## Comprometiendo la máquina

A partir de este punto, comencé la etapa de reconocimiento en profundidad, en la cual busqué vulnerabilidades que permitan acceder al servidor. En las siguientes líneas, respondí cada una de las preguntas planteadas por la sala.

### Flag 1

Sabiendo que la máquina corre Apache, FFUF será la herramienta a utilizar en este caso, ya que supera en velocidad a Gobuster. Para ello, especifiqué tanto la URL como la _wordlist_, obteniendo los siguientes resultados:

*[Image: alt text]*

Mientras FFUF continúa buscando, abrí en mi navegador la URL, encontrando esta imágen:

*[Image: alt text]*

Luego de un rato de espera, FFUF seguía sin encontrar más directorios, por lo cual opté por realizar el mismo procedimiento, ahora apuntando a enumerar **dentro** de /hidden.

*[Image: alt text]*

Y ahora, abrí /whatever en el navegador para conocer su contenido:

*[Image: alt text]*

Luego de ver la imágen, abrí el código fuente de la página en busca de más pistas. Efectivamente, dentro del source de la misma, encontré un **string** interesante:

*[Image: alt text]*

Ya con el string en cuestión, me dirigí a [CyberChef](https://gchq.github.io/CyberChef/), decodifiqué el string usando la opción "From Base64", y obtuve la primer bandera de la sala.

## Flag 2

Para la 2da bandera de la sala, la consigna nos dice que es necesario enumerar incluso más que hasta ahora para poder encontrarla. En este punto, probé tanto con FFUF, Gobuster e incluso Dirbuster utilizando distintas listas de palabras para ver si era posible descubrir algo más, y recordé un detalle que pasé por alto al iniciar el reconocimiento. Al momento de enumerar la 1era vez, dí con el archivo **robots.txt**, el cual tiene un contenido algo interesante:

*[Image: alt text]*

*[Image: alt text]*

El texto dentro de robots.txt me da a entender lo siguiente:

- El asterisco indica que cualquier **User-Agent** que intente sondear el servidor será rechazado, impidiendo acceder al contenido.
- El User-Agent configurado en la cadena de texto parecería estar autorizado dentro del servidor, y no solo eso sino que debajo se indica **"Allow: /"**, lo cual me podría intentar indicar que dicho User-Agent accede a ese **directorio**.
Pero al ver la cadena, ya a simple vista me llamó la atención por la longitud y los caractéres que tiene, los cuales no se parecen en nada a un User-Agent tradicional. De primeras, ese texto me recordó a un **valor hash**, por lo cual copié la cadena y con **hash-identifier** busqué a qué tipos de hash podría corresponder.

*[Image: alt text]*

Acorde a los resultados arrojados por la herramienta, lo más probable es que se trate de un hash **MD5**, por lo tanto lo guarde dentro de un archivo .txt en mi máquina local, y con John intenté descifrarlo, usando para ello **rockyou.txt**.
Al final, no obtuve resultados y opté por usar un enfoque diferente: comencé a buscar en bases de datos de hashes precalculados ya conocidas, en busca de alguna coincidencia al valor proporcionado. Por ello me dirigí a [Crackstation](https://crackstation.net/), busqué posibles matches pero no tuve resultados. Mediante una rápida búsqueda del hash en Google, di con [MD5 GromWeb](https://md5.gromweb.com/) en la cual obtuve la 2da bandera mediante búsqueda inversa:

*[Image: alt text]*

Por otra parte, intenté interactuar con el servidor usando OWASP ZAP, y envié una solicitud GET configurando el User-Agent con el valor que encontre (que más adelante noté no influía en nada puntual). Esto me hizo analizar en detalle la respuesta que el servidor devolvió, encontrando en ella **texto oculto** que de otro modo habría pasado por alto totalmente.

*[Image: alt text]*

Y siguiendo lo que la pista plantea, decodifiqué el texto usando el mismo procedimiento que la flag anterior. Como en este caso el texto no indica cuál decodificación debo usar, Cyberchef me fue nuevamente de gran ayuda, ya que con solo poner el texto como input e ir intercalando distintos tipos de formato de codificación, encontré que el texto utiliza **Base62**, y como resultado obtuve lo que parece ser el nombre de un **directorio**.

*[Image: alt text]*

Lo siguiente fue volver a mi navegador, y escribir la URL completa, completando tanto el dominio, como el puerto en cuestión y por último este nombre de directorio que acabo de encontrar, obteniendo acceso a una página que recuerda a la película Matrix. Y es acá cuando al ver la imágen de cerca, se nota una serie de caractéres en el centro de la misma que indican el camino hacia la siguiente flag.

*[Image: alt text]*

*[Image: alt text]*

Luego de guardar el texto dentro de un archivo y pasarlo por Hash-Identifier, obtuve como resultado que el tipo de hash más probable sea **SHA-256**.
Luego de varios intentos de descifrarlo, no me fue posible, tanto con rockyou.txt como con la lista de palabras propuesta por la sala. Fue entonces que me dispuse a investigar con otras herramientas, como **hashid**, la cual arrojó mayor información acerca del mismo.

*[Image: alt text]*

Y fue acá que, mediante algo más de investigación, encontré que otro tipo de hash muy usado en entornos de CTFs es **GOST**, por lo tanto probé nuevamente con John, esta vez obteniendo un resultado:

*[Image: alt text]*

La cadena de texto que obtuve asemeja ser una contraseña, y de primeras pensé en SSH, pero hasta este punto no obtuve ni siquiera pistas sobre posibles usuarios por lo cual descarté esa opción por el momento. Pero recordé que existe la posibilidad de encontrar mayor información a partir de la **imagen** de la página donde estaba el hash que descifre. Recordemos que era un fondo de Matrix, y que además muestra una 2da imagen, la cual retrata números binarios. Fue así que al analizar el **source code** de la página, dí con el link de tal imagen, y usando wget la descargué a mi máquina local para analizarla con **StegHide**

*[Image: alt text]*

*[Image: alt text]*

Una vez descargué la imagen, la analicé con StegHide para extraer información que pudiera tener. Para ello, la herramienta solicita un texto para el **salvoconducto**, y es acá donde ingresé la contraseña que descifré anteriormente con John. El resultado fue un archivo de texto dentro del cual se encuentra un nombre de usuario en texto plano y una contraseña en formato **binario**.

*[Image: alt text]*

Anoté esta serie de números, las pasé a CyberChef nuevamente y obtuve en texto plano la contraseña asociada a este usuario. Con esta información en mi poder, pude saltar directamente a la fase en la cual conseguí acceder directamente a la máquina en busca de la flag **user.txt**.

*[Image: alt text]*

## Flag 3

Por raro que parezca, la 3era bandera del servidor está bastante más a la vista que lo que se acostumbra en entornos de CTF, ya que al leer con detenimiento la página por default de Apache (en la cual también se encuentra la etiqueta oculta que lleva al directorio **/n0th1ng3ls3m4tt3r** encontrado antes), se encuentra en la parte inferior de la página totalmente a la vista.

*[Image: alt text]*

## Bandera user.txt

En este punto, ya cuento con un par de credenciales posibles, y sé que el puerto **6498** corre SSH, por lo tanto, me conecté especificando dicho puerto, ingresé las credenciales, y pude entrar exitosamente al servidor como el usuario **boring**.

*[Image: alt text]*

Sin embargo, la cadena de texto como tal no me sirve, ya que como la misma pista de la terminal lo indica, es necesario **rotarla**. Volvemos a CyberChef, pegamos la cadena de texto, y en el campo de "recetas" seleccionamos ROT13 para obtener finalmente la bandera.

*[Image: alt text]*

## Bandera root.txt

La descripción inicial de sala menciona que existe un **cronjob** que sirve como punto de partida para escalar privilegios en el servidor. Por lo tanto, y para acelerar la búsqueda, una vez me encontré logueado por SSH, lo siguiente que hice fue:

- Levantar en mi máquina local un servidor Python, y alojar en él una copia de [linPEAS](https://github.com/peass-ng/PEASS-ng/tree/master/linPEAS)
- En la máquina objetivo, moverme al directorio **/tmp** dentro del cual tengo permisos de escritura, y con el comando **wget**, descargar la copia especificando la IP de mi máquina atacante.
- Una vez descargada la copia, asignarle permisos de ejecución con **chmod +x** y ejecutarla dentro del servidor.

Luego de unos minutos de búsqueda y análisis (la salida de linPEAS es sustancialmente completa incluso sin permisos de sudo), encontré el que creo es el archivo de la tarea programada al cual la descripción de la sala hace alusión:

*[Image: alt text]*

Se puede apreciar que dentro del directorio **var/www** existe un archivo de Shell con el nombre **.mysecretcronjob.sh**. Procedí a analizar tanto permisos como su contenido, ya que corresponde al usuario con el cual estoy conectado.

*[Image: alt text]*

El contenido del script indica que se ejecutará con permisos de root, por lo cual inmediatamente agregué un comando de reverse shell dentro del mismo apuntando a mi máquina local, a la vez que dejé **Netcat** en escucha en el puerto 4444. Luego de unos momentos, recibí la shell como root desde el servidor, y obtuve la última bandera.

*[Image: alt text]*
