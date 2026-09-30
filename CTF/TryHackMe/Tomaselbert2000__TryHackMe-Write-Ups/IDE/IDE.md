# TryHackMe Rooms

## "IDE": Spanish Walkthrough

## Primeros pasos y configuración

Como siempre la iniciar la sala, vamos a configurar primero la IP que nos proporciona TryHackMe como máquina objetivo dentro del archivo **hosts**. En mi caso, yo elijo como nombre de diominio ide.thm.

```sudo echo "ide.thm <MACHINE_IP>" >> /etc/hosts```

## Reconocimiento

Abrimos NMap, y realizamos un escaneo inicial hacia el servidor para conocer qué expone a la red. En mi caso, yo elijo aplicar scripts por defecto, descubrimiento de servicios e intentar obtener números de versión que me puedan ser relevantes.

*[Image: alt text]*

De primeras vemos que el servidor cuenta con 3 puertos abiertos: FTP, SSH y HTTP. El primer detalle que notamos acá es con respecto al puerto FTP: permite conexiones como usuario **anónimo**, es decir, sin estar registrado en la máquina. Por otra parte, notamos también que ejecuta vsftpd 3.0.3, número de versión que tenemos que tener en cuenta para más acceder al servidor.
Luego de conectarme especificando el nombre de usuario **anonymous** y dejando en blanco el campo de contraseña, el servidor me permite conectarme, por lo cual lo siguiente que hacemos el listar el directorio actual.

*[Image: alt text]*

A simple vista, pareciera que llegamos a un _rabbit hole_ y que dentro del directorio no hay nada interesante. Pero el detalle se encuentra en el último ítem. Contando desde arriba, el primer ítem (representado por un **.**) indica el directorio actual, mientras que el 2do (representado por **..**) indica el directorio padre. Pero el último el cual figura como **...** no es más que un **directorio oculto** dentro de esta carpeta. Por lo cual, accedemos a él para listar su contenido.
Nuevamente pareciera estar vacío, pero debemos notar que ahora al listar el contenido del directorio, el primer elemento tiene como nombre un guión medio (**-**). Lo siguiente que hacemos es descargarlo a nuestra máquina local con el comando **get**, para poder analizarlo en detalle.

*[Image: alt text]*

Y una vez listo, lo abrimos.

*[Image: alt text]*

Dentro de esta nota encontramos la siguiente pista: va dirigida hacia el usuario **john** lo cual confirma un primer nombre de usuario válido, así como también menciona que para conectarse podrá ser utilizada una contraseña por default. Por último, menciona un archivo de imagen que deberá ser "protegido", además de mostrar el remitente del mensaje (podríamos llegar a suponer un 2do usuario válido en el sistema).

## 2do reconocimiento con Nmap

Cuando llego a esta parte de la sala, me encuentro con que me falta información para continuar. Por lo tanto, ejecutamos un nuevo escaneo con Nmap apuntando a la **totalidad** de puertos abiertos en la máquina. Este proceso lleva varios minutos, por lo tanto el único switch que aplicamos esta vez es **-p-** para apuntar a todos los puertos, omitiendo scripts por defecto y demás cuestiones que puedan aumentar el tiempo de escaneo. Luego de un rato, obtenemos los siguientes resultados:

*[Image: alt text]*

Este nuevo escaneo nos indica que la máquina está corriendo un servicio desconocido en el puerto **62337**. Es claro que la siguiente pista se encuentra ahí, por lo cual procedemos a investigarlo. En mi caso, lo primero que hago es abrir la URL de la sala especificando ahora este nuevo puerto, lo cual nos lleva a la siguiente página.

*[Image: alt text]*

Es en este momento que comienza a cobrar mucho más sentido la información anterior, ya tenemos un usuario confirmado y sabemos que su contraseña es la predeterminada. En mi caso, pruebo con **john** y como contraseña uso **password**, lo cual me permite entrar a la vista principal del IDE:

*[Image: alt text]*

Un detalle no menor es el número de versión instalada en el servidor, que en este caso se trata de **Codiad 2.8.4**. Pasamos a buscar en [ExploitDB](https://www.exploit-db.com/), y encontramos que hay una prueba de concepto publicada específica para esta versión, y que además requiere usuario y contraseña para funcionar, datos que ya obtuvimos, por lo cual la descargamos.

*[Image: alt text]*

Luego de investigar el funcionamiento del exploit, llegamos a que básicamente permitirá abrir una _reverse shell_ en la máquina objetivo, para lo cual se deberá proporcionar al exploit los siguientes datos:

- URL
- Username
- Password
- Dirección IP de la máquina atacante
- Puerto donde se recibirá la shell
- Tipo de plataforma (en mi caso, corresponde a **linux**)

## Explicación de funcionamiento de la reverse shell

Para esta vulnerabilidad, el flujo se estructura de la siguiente forma:

- Abrimos una pestaña en la carpeta donde tenemos descargado el exploit
- En una 2da pestaña, deberemos ejecutar el comando que el exploit indica en pantalla al momento de invocarlo, el cual abre una conexión por **Netcat** hacia el puerto 4444, pero que funcionará como catapulta para la shell estable que en realidad vamos a usar
- Una tercer pestaña, la cual también tendrá a Netcat como protagonista, esta vez en el puerto **4445**.

Se sugiere el uso de **Tmux** para facilitar este intercambio entre pestañas de una forma más sencilla. Una vez armadas las pestañas o en su defecto ventanas, continuamos con el ataque a fin de abrir una primer terminal en el servidor.

*[Image: alt text]*

*[Image: alt text]*

*[Image: alt text]*

Una vez nos encontramos dentro, tenemos varias formas de obtener información acerca del entorno en el que nos movemos, como listas interfaces de red, usuarios, grupos, comandos que se podrían ejecutar como **sudo**. Para poder acelerar el proceso de reconocimiento, optamos por introducir una copia de **linPEAS** en el servidor, aprovechando que dentro del directorio **/dev/shm** tenemos permisos suficientes como www-data. Para ello, bastará con levantar un servidor HTTP con Python desde nuestra máquina atacante en el directorio donde tengamos la copia de linPEAS. Luego, dentro del objetivo, la descargamos con **wget**. No hay que olvidar que una vez descargado, se debe configurar como ejecutable con el siguiente comando:

```chmod +x linpeas.sh```

Una vez configurado, lo ejecutamos y esperamos unos minutos a que termine. La salida de la herramienta es realmente extensa, pero casi al final de la misma, aparece una cadena de texto relacionada a MySQL y el usuario **drac**.

*[Image: alt text]*

## Bandera user.txt

Y resulta que si intentamos cambiar a la cuenta de drac usando dicha cadena como contraseña, la autenticación es exitosa, permitiendo cambiar a dicho usuario y obtener la primer bandera.

*[Image: alt text]*

Lo siguiente es realizar un reconocimiento básico enfocado a este usuario para determinar permisos y grupos, así como posibilidad de ejecución como root.

*[Image: alt text]*

La salida del último comando revela una nueva pista: el usuario drac tiene permisos de sudo sobre **/usr/sbin/service vsftpd restart**. Esto básicamente implica permisos de root sobre dicho servicio para poder reiniciarlo (recordemos que el punto de entrada de la sala fue justamente a través de FTP). El vector de ataque real radica en el siguiente concepto: al reiniciar el servicio, el sistema acudirá al archivo de configuración del mismo y leerá instrucciones desde allí. De poder editarlo como el usuario drac, implicaría inyectar una reverse shell, para luego reiniciarlo con permisos de root, y que eso dispare la shell con permisos de administrador hacia la máquina atacante.
Dicho archivo se encuentra en el siguiente directorio: **/lib/systemd/system/**. Por lo tanto, nos movemos a dicha carpeta y listamos permisos además del contenido.

*[Image: alt text]*

*[Image: alt text]*

El siguiente paso es reemplazar el contenido de la línea **ExecStart** para que en lugar de llamar al archivo de configuración, ejecute una shell. Y dado que todo este procedimiento será gestionado por **systemd**, garantiza que dicha terminal tiene privilegios máximos. En mi caso particular, elijo como puerto de destino el 4446 para no generar conflicto con el resto de mis pestañas de Netcat.

- _**Notar como detalle importante el uso de comillas dobles para evitar problemas durante el procesamiento del comando**_

*[Image: alt text]*

## Bandera root.txt

Y al reiniciar el servicio aprovechando los permisos de sudo, recibo la terminal de root en el puerto 4446 y obtenemos la 2da bantera.

*[Image: alt text]*

*[Image: alt text]*
