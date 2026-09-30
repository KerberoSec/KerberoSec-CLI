# TryHackMe Rooms

## "Lazy Admin": Spanish Walkthrough

## Primeros pasos y configuración

Como siempre, empezamos configurando la IP de la máquina objetivo que nos asigne TryHackMe en el archivo **hosts** de modo que usemos directamente una URL sencilla, en mi caso, "lazyadmin.thm"

```sudo echo MACHINE_IP >> /etc/hosts```

Una vez hecho esto, ya podemos empezar con la sala cómodamente.

## Reconocimiento

Al igual que cualquier pentest, empezamos la sala con el reconocimiento del objetivo, de modo que podamos identificar tecnologías, versiones de servicio, puertos abiertos y demás.

Como de costumbre, arranco usando **Nmap** para obtener un paneo general de cual es el objetivo.

*[Image: alt text]*

Ya a primera vista me encuentro con un servidor **Ubuntu Linux**, dentro del cual solo veo abiertos los puertos **22** para Secure Shell y **80** para HTTP, éste último además corriendo Apache 2.4.18. En sí, es poca información, por lo cual, a partir del puerto HTTP abierto, comienzo a enumerar directorios usando **Gobuster**.

*[Image: alt text]*

La información que Gobuster encontró es realmente poca, pero es suficiente para definir que es necesario seguir enumerando directorio. A partir de este subdirectorio **/content** que encontré, aplico nuevamente enumeración para sacar más información.

*[Image: alt text]*

Y acá es cuando la cosa cambia, porque encuentro ya varios directorios que sí me pueden revelar más información sobre el servidor su funcionamiento. Por empezar, intenté entrar al archivo **index.php** para saber en qué consistía la página principal del servidor, a lo cual me encontré con un panel muy rudimentario para un sistema de gestión de contenidos llamado **Sweet Rice**. Ya acá encuentro una pista sobre tecnologías que pueden ser vulnerables.

*[Image: alt text]*

Para seguir el reconocimiento y no buscar a ciegas dentro de los distintos archivos, lo que hago ahora es realizar el mismo proceso que el paso anterior, esta vez sobre el directorio **/inc**, que puede contener información relevante. Y como la lista de palabras que uso ahora es un poco más extensa, uso **FFUF** el cual destaca por su velocidad.

*[Image: alt text]*

Llegado este punto, y para probar por mi mismo, decidí abrir el directorio **/inc** desde mi navegador y revisar qué podía encontrar dentro de los archivos del servidor.

*[Image: alt text]*

Dentro hay muchos archivos **.php** lo cual es lógico dado que se trata de un servidor web. Me llamó la atención especialmente el archivo "latest.txt" el cual al abrirlo me devuelve un número de versión, el cual entiendo se refiere a la última versión instalada y en ejecución del CMS que encontramos antes.
Por otra parte, también investigué el directorio **/mysql_backup**, en busca de archivos de copia de seguridad que puedan tener información sensible dentro.

*[Image: alt text]*

*[Image: alt text]*

## Búsqueda de vulnerabilidades

Una vez llegué hasta acá, tengo claro que el objetivo de la sala es romper la seguridad de Sweet Rice 1.5.1 de alguna forma. Investigando en internet acerca de este CMS, opté por consultar en [ExploitDB](https://www.exploit-db.com/) en busca de vulnerabilidades conocidas en este software para identificar por dónde podría pivotar hacia el ataque.

*[Image: alt text]*

Se puede apreciar que la versión que ejecuta el servidor claramente es vulnerable, entre otras cosas, mediante la exposición del backup de la base de datos que encontré antes, así como también me llamó en gran medida la atención el hecho que el servidor es vulnerable tanto a ataques mediante subida de archivos como también mediante ejecución dentro del propio servidor.
Dado esto último, analicé el 1er script proporcionado en la lista, el cual está escrito en Python y para poder utilizarlo, es necesario contar con **credenciales** de acceso al servidor. Esto me llevó a recordar que al inicio de la sala, la página principal del servidor indica que se encuentra en construcción, pero que el usuario "webmaster" puede activarlo. Por lo tanto, ampliando mi información, llegué a que para poder acceder al panel de acceso del servidor, me debo dirigir al directorio raíz del CMS (es decir, donde fue instalado) para lo cual agrego **/as/** en la URL. Esto da como resultado que al agregar la referencia al endpoint dentro de la URL que ya tengo, me queda lo siguiente: **<http://lazyadmin.thm/content/as/>** (notar que en mi caso, el dominio que utilicé es "lazyadmin", en caso de usar otro, reemplazarlo aquí).
Luego de abrir la URL en mi navegador, di con el panel de login:

*[Image: alt text]*

Básicamente, lo que razono en este punto es: si consigo las credenciales, puedo entrar y activar el sitio, para luego usando esas mismas credenciales, intentar subir un archivo que me permita obtener la 1era bandera de la sala. Y como antes encontramos el archivo de **backup** de la base de datos, lo siguiente que hice fue analizarlo en búsqueda de credenciales _hardcodeadas_.

## Análisis del backup encontrado

La abrir el backup en mi editor de código, comencé a buscar tomando en cuenta que si existen credenciales hardcodeadas, deben encontrarse en sentencias de **inserción** de datos, es decir, sentencias del tipo "INSERT INTO". En las siguientes imágenes se aprecia que, efectivamente, hay sentencias de este tipo en el archivo.

*[Image: alt text]*

Noto que la línea es bastante extensa, por lo que comienzo a leer detenidamente, y encuentro lo que buscaba:

*[Image: alt text]*

Ahora con estos datos, lo siguiente que hago es identificar el tipo de hash que encontré usando **hash-identifier**. Esta información me será útil para descifrar el hash en el paso siguiente usando **john**.

*[Image: alt text]*

Una vez que ejecuté la herramienta, encuentro que el tipo más probable para este hash es **MD5**, por lo cual ahora uso esto para configurar john de manera que apunte a este tipo de hash en específico.

*[Image: alt text]*

Y ya teniendo el usuario junto con la contraseña en texto plano, vuelvo al panel de login de Sweet Rice e inicio sesión.

*[Image: alt text]*

## Ataque mediante Add malicioso

Luego de varios intentos de subir un archivo malicioso mediante el exploit que encontramos en ExploitDB, no me fue posible hacerlo, por lo cual opté por seguir investigando, ahora intentando emplear el sistema de anuncios del servidor, el cual también es vulnerable ya que permite **ejecutar código PHP** y que permitiría abrir una reverse shell hacia la máquina atacante. Por lo tanto, busqué el archivo HTML en ExploitDB (créditos a **Ashiyane Digital Security Team** por su excelente trabajo), y lo adapté incluyendo dentro del mismo la famosa reverse-shell de **PentestMonkey**. Una vez me quedó armado el código, lo siguiente fue volver al panel de Sweet Rice, acceder a la sección "Ad" y dentro del campo de texto, ingresar tanto el nombre del Ad nuevo (el cual nombré como "exploit") y adjunté el código malicioso. Guardé los cambios, y procedí a dirigirme de nuevo al directorio **/content/inc/**, en el cual hay una nueva carpeta "add" y dentro de ella encontré mi archivo.

*[Image: alt text]*

*[Image: alt text]*

*[Image: alt text]*

Una vez tengo ya creado el Add, lo único que necesito hacer es hacer click en el mismo dentro del sistema de ficheros del servidor, lo cual activa la ejecución del archivo PHP malicioso, y recibo en mi terminal local mediante **Netcat** la shell activada.

*[Image: alt text]*

*[Image: alt text]*

Y ya una vez tuve la reverse-shell lista, lo único necesario fue hacer un _upgrade_ de la misma para tener autocompletado, limpieza de pantalla, etc.

*[Image: alt text]*

## Bandera user.txt obtenida

Ya con acceso al sistema de ficheros, se encontró muy fácilmente la primer bandera de la sala.

*[Image: alt text]*

## Investigación dentro del sistema de ficheros

Al realizar un listado del directorio **/itguy**, encontré además de la bandera, dos archivos que llamaron mi atención nuevamente. El primero de ellos **mysql_login.txt**, el cual por el nombre sugiere credenciales de MySQL. Por otra parte, el archivo **backup.pl**, el cual por la extensión indica un script escrito en Perl y que a su vez, dentro de sus líneas indica que ejecuta el contenido de un 2do script, de nombre **copy.sh**.
Es entonces que realicé un llamado a **cat** esta vez apuntando al script copy.sh, a fin de conocer primero si tenía permisos para leerlo, y de ser así, conocer su contenido. Como resultado, obtuve la siguiente información:

*[Image: alt text]*

El archivo que me interesa es copy.sh, ya que se ejecuta como root, y dentro básicamente contiene código que permite abrir una shell remota a través de Netcat. El razonamiento que pude hacer entonces, fue el siguiente: la ejecución de estos archivos funciona como una cadena, empezando por **backup.pl**, que a su vez genera la ejecución inmediata de **copy.sh**; el cual en última instancia lanza una conexión por Netcat hacia una IP y puertos en especial. En síntesis, poder modificar la línea que define la IP y el puerto para que apunten hacia mi máquina, sumado a que copy.sh se ejecuta con **permisos de root**, permite conseguir la 2da bandera.

## Descubrimiento de permisos de sudo para el usuario www-data

Fue entonces que se me ocurrió listar si el usuario www-data con el cual me encontraba conectado tenía permisos de **sudo**. Por lo general, esto es algo que muy difícilmente suceda, ya que es una práctica extremadamente insegura de configuración. Grande fue mi sorpresa cuando obtuve como resultado que el usuario www-data tiene permisos de ejecución como sudo tanto para:

- /usr/bin/perl
- /home/itguy/backup.pl

Llegado este punto, intenté el mismo procedimiento con ambos archivos: intentar editarlos para ver qué podría hacer con ellos. Primero lo intenté con **backup.pl**.

*[Image: alt text]*

No me fue posible realizar cambios sobre el mismo, por lo cual pasé a intentarlo con **copy.sh**.

*[Image: alt text]*

Y dado que me permitió escribir en él, lo siguiente fue modificar la línea para que se conecte a mi máquina.

*[Image: alt text]*

## Bandera root.txt obtenida

Una vez todo listo, abrí la terminal de Netcat en escucha en mi equipo, para al mismo tiempo ejecutar el archivo **backup.pl** aprovechando los permisos de sudo mal configurados.

*[Image: alt text]*
