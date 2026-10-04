# TryHackMe Rooms

## "Publisher": Spanish Walkthrough

## Primeros pasos y configuración

Comenzamos configurando el archivo **hosts** asignando un dominio sencillo a la máquina objetivo. En mi caso, yo elegí _publisher.thm_.

```sudo echo <MACHINE_IP> publisher.thm```

## Reconocimiento

Iniciamos el reconocimiento del objetivo con procedimiento habitual. Abrimos Nmap, y realizamos un escaneo de puertos contra el dominio objetivo. Opcionalmente, podemos especificar scripts por defecto, rango de puertos, descubrimiento de servicios, etc.

*[Image: alt text]*

Paralelamente a esto, abrimos una nueva pestaña de la terminal y comenzamos a **fuzzear directorios**. En mi caso, elijo hacerlo con FFUF debido a la gran velocidad que tiene, pero igualmente es perfectamente válido hacerlo con Gobuster o Dirbuster.

*[Image: alt text]*

Al mismo tiempo, nos conectamos al puerto 80 de la máquina para determinar si existe una página web que nos sea relevante. En este caso, vemos un _magazine_ creado sobre [SPIP](https://es.wikipedia.org/wiki/SPIP), el cual es un CMS de código abierto, creado en Francia.

*[Image: alt text]*

La primera etapa de fuzzeo revela dos directorios en el servidor. Ya con esta información, vamos a volver a ejecutar el procedimiento esta vez apuntando al directorio **/spip**. Para aprovechar la capacidad de FFUF, lo que hacemos es configurarlo para que aplique **recursividad** en el fuzzeo, es decir, buscará los directorios a partir de la lista de palabras, y en caso de encontrar coincidencias, realizará el mismo proceso sobre dichos directorios.

*[Image: alt text]*

Revisando los directorios que la herramienta fue encontrando, llegué hasta el subdirectorio de nombre **/spip/ecrire**, el cual presenta un panel de inicio de sesión que está oculto a simple vista en el servidor.

*[Image: alt text]*

- _La versión de SPIP detectada por Wappalyzer es la 4.2.0_

Por otra parte, dentro del directorio **/config/bases/**, hay expuestos archivos correspondientes a SQLite. Descargamos el de 512KB a la máquina atacante para analizarlo.

*[Image: alt text]*

- _Si bien dentro del archivo se encuentra información referente a usuarios y contraseñas, éstas últimas se almacenan hasheadas usando **Bcrypt**. Dicho algoritmo busca ser altamente costoso en cuanto a poder de cómputo necesario para poder crackearlo por fuerza bruta. Acorde a lo analizado, el coste aplicado en el hash de contraseña es **10**, haciendo inviable un atacarlo en mi máquina local._

Tomando en cuenta la información proporcionada por **Wappalizer**, sabemos que el servidor ejecuta la versión **4.2.0** de SPIP. Investigando en ExploitDB, llegamos a que existe una PoC para dicha versión, la cual consigue una RCE en el servidor mediante un script malicioso en Python que aprovecha una mala gestión en la serialización de datos, todo esto a través de una inyección de código PHP (para mayor información, ver [SPIP v4.2.0: Remote Code Execution (Unauthenticated)](https://www.exploit-db.com/exploits/51536)).

- _Créditos a [Nuts7](https://github.com/nuts7) por el exploit._

Una vez descargado el script, lo ubicamos en un directorio donde nos sea cómodo, y lo ejecutamos acorde a la información de ayuda en el mismo código fuente, la cual nos indica como requisitos obligatorios lo siguiente:

- URL del objetivo (switch -u)
- Comando que deseamos ejecutar (switch -c)

_Como detalle importante, y luego de varias pruebas y búsqueda en internet, doy con el detalle que para evitar errores durante el envío de comandos, el string del mismo deberá codificarse en **Base64**_

*[Image: alt text]*

*[Image: alt text]*

## Bandera user.txt

Una vez obtenemos la shell, nos dirigimos al directorio del usuario **think** y obtenemos la 1er bandera.

*[Image: alt text]*

Una vez tenemos la primer bandera, vamos a continuar buscando información dentro del directorio del usuario think, listando todo el contenido incluyendo archivos ocultos y directorios.

*[Image: alt text]*

Podemos apreciar como dentro del directorio **/.ssh** tenemos expuestas claves privadas. Hacemos un cat sobre **id_rsa** y lo pegamos en un archivo en nuestra máquina atacante. Asignamos los permisos necesarios y nos conectamos por SSH.

*[Image: alt text]*

Con la shell obtenida a través de SSH, tenemos una interacción mucho más cómoda con el servidor. Siguiendo la pista de la sala, la cual señala a AppArmor como siguiente vector de ataque, vamos a comenzar a buscar distintos archivos y configuraciones relacionados con este módulo.

Para poder tener una imagen más clara de la situación, primero vamos a analizar el estado actual de App Armor en el sistema, listando su estado, entrando al directorio donde se ubican sus archivos más relevantes e intentando hilar desde allí como ubicar una configuración incorrecta. Sabemos además por la descripción de la sala que dentro del sistema de archivos existe un **binario custom** que probablemente tenga permisos excesivos (por una configuración incorrecta de App Armor). Por lo tanto, tenemos en cuenta este detalle también para continuar.

*[Image: alt text]*

Con este primer comando, confirmamos que App Armor está en funcionamiento, por lo tanto seguimos por su directorio principal, el cual es **/etc/apparmor.d/**.

*[Image: alt text]*

Luego de analizar los archivos detenidamente, así como un README encontrado dentro de uno de los directorios, la configuración de la máquina que llegamos a ver pareciera ser bastante estándar y además segura. Cuestiones como lectura y escritura en directorios relevantes están siendo bloqueadas por App Armor mediante perfiles configurados con la directiva **Enforce**. El detalle para avanzar radica en el perfil **usr.sbin.ash**, cuyo contenido vemos a continuación:

*[Image: alt text]*

Ash corresponde en este caso a un procesador de comandos ligero, similar a Bash. Básicamente, lo que se presenta en este caso es la oportunidad de llevar a cabo lo que plantea la descripción de la sala, ejecutar una shell **sin confinamiento** que permita ganar privilegios elevados; ésto último debido a una premisa simple: **App Armor loguea la actividad, pero no la bloquea por completo**. Este detalle es fundamental.
Por otra parte, es necesario que busquemos ejecutables que tengan permisos de root y que puedan ser vulnerables, para lo cual vamos a aplicar el comando **find** de la siguiente forma:

```find / -type f -perm -4000 -user root 2>/dev/null```

*[Image: alt text]*

De la lista obtenida, salta a la vista el caso de **run_container**, ya que su nombre no corresponde a un binario estándar del sistema. Pasamos a auditarlo.

*[Image: alt text]*

Se puede apreciar que es un ejecutable de 64 bits ELF, y especialmente, que el contenido del archivo revela que invoca a "/bin/bash /opt/run_container.sh".

## Conexión con la pista y AppArmor

Aquí es donde encajan todas las piezas expuestas en la descripción de la sala:

El perfil de AppArmor que analizamos al inicio estaba vinculado únicamente al ejecutable **/usr/sbin/ash**. Al invocar **/bin/bash** directamente a través de run_container, ese proceso se ejecuta **fuera** de las reglas de ash, operando como una shell no confinada por AppArmor. Si el binario SUID ejecuta el archivo **/opt/run_container.sh** con privilegios elevados, la seguridad del sistema pasa a depender de los permisos de ese script.

## Pivot sobre run_container.sh

Ya determinamos que el punto de quiebre de la sala radica en este archivo. Como es determinante conocer los permisos del archivo para saber hasta dónde podemos atacar, los listamos, y luego además el contenido del script.

*[Image: alt text]*

*[Image: alt text]*

## Escalación de privilegios

Es clave tomar en cuenta los permisos del archivo: están configurados como **-rwxrwxrwx**, lo cual implica que **todos los usuarios** tienen permisos de lectura, escritura y ejecución.
De modo que el proceso a seguir es el siguiente:

- Usamos el cargador dinámico **/lib64/ld-linux-x86-64.so.2** para abrir una shell de Bash sin confinamiento, dado que está exento de las reglas de App Armor.
- Agreamos al script la línea que lanzará la shell, usando el switch **-p** para que no descarte los permisos de root.

*[Image: alt text]*

Una vez hecho esto, ya tenemos vía libre para movernos al directorio root y obtener la bandera.

## Bandera root.txt

*[Image: alt text]*
