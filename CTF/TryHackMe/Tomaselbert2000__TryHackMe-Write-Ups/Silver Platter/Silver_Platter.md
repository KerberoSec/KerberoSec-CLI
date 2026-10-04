# TryHackMe Rooms

## "Silver Platter": Spanish Walkthrough

## Configuración

Para iniciar la sala, comencé realizando la configuración inicial en el archivo **hosts** en mi máquina atacante, asociando la dirección IP asignada por TryHackMe a la máquina objetivo con un dominio sencillo, en mi caso, utilicé "silverplatter.thm".

```sudo echo "<MACHINE_IP> silverplatter.thm" >> /etc/hosts```

## Fase de reconocimiento

El reconocimiento inicial del objetivo fue llevado a cabo acorde al procedimiento usual, empleando **Nmap** para el escaneo de puertos abiertos. Luego de finalizado el proceso, se determinó que el servidor exponía los siguientes puertos a la red externa: **22**, **80** y **8080**.

*[Image: alt text]*

### Razonamiento del reporte

Con el reporte completo, la imagen general del objetivo plantea un servidor que expone una página web en el puerto 80 y que además cuenta con un _reverse proxy_ en el puerto 8080, el cual responde con código de estado **404** a solicitudes GET. Dado que la superficie de ataque hasta este punto es insuficiente, se determinó realizar enumeración de directorios sobre la URL de la página servida.

## Análisis de página web

Al acceder al puerto 80 del servidor, se visualizó una página principal o _landing page_ sobre una supuesta empresa de ciberseguridad. Se adjunta a continuación una imagen ilustrativa de la misma.

*[Image: alt text]*

Dicha página fue auditada tanto de manera interactiva como a través de la visualización del código fuente en busca de comentarios, etiquetas ocultas, enlaces y cualquier otro tipo de pista. En la sección "Contact" se encontró mención a un usuario particular.

*[Image: alt text]*

### ¿Qué es Silverpeas? ¿Cuál es su finalidad?

Se conoce con este nombre a un software de colaboración y gestión de proyectos (CMS/Intranet), centrado principalmente en la colaboración entre miembros, fácil compartición de archivos, habilidades y conocimientos en el ámbito corporativo. Como detalle adicional, se encuentra basado principalmente en **Java JEE**.
Para más información, ver [Silverpeas](https://www.silverpeas.org/).

## Panel de login de Silverpeas

Acorde a la documentación de la herramienta, el panel de login de la misma se encuentra alojado en el puerto 8080, el cual se verificó abierto durante el reconocimiento inicial. Al agregar "/silverpeas" en la URL, accedí al panel en cuestión.

*[Image: alt text]*

## Estrategia de ataque

Dado que la misma sala deja en claro que es imposible usar la lista de palabras "rockyou.txt" para atacar por fuerza bruta, se recurrió al uso de una lista de palabras "custom" creada a partir de todo el texto relevante en la página principal del objetivo. Para ello, se utilizó ```cewl``` indicando la página objetivo, y generó una lista de palabras de aproximadamente 300 candidatos.

```cewl http://silverplatter.thm > custom_wordlist.txt```

Una vez generada la lista de palabras, se utilizó OWASP ZAP como herramienta de _fuzzeo_ para atacar el endpoint de login, especificando el nombre de usuario encontrado y agregando como contraseña cada uno de los payloads de la lista de palabras. Luego, los resultados fueron ordenados por código de estado obtenido, y se identificó que para uno de los casos el servidor respondió con status code **500**. A partir de ese dato, se intentó manualmente la autenticación desde el navegador utilizando el payload en cuestión, el cual resultó ser la contraseña correcta, y permitió acceder al dashboard principal del usuario en Silverpeas.

*[Image: alt text]*

*[Image: alt text]*

Con la sesión iniciada, el siguiente dato relevante fue encontrado al acceder a la sección de mensajes reciente, en la cual se menciona a un nuevo usuario de nombre "Tyler". Esto se consideró una pista clara para determinar movimiento lateral en el objetivo.

*[Image: alt text]*

Al hacer click en el enlace "See more", se abrió la vista principal de mensajes del usuario. Al visualizar el mensaje completo, se encontró que el mismo se abre en una ventana emergente que muestra la **URL** del mensaje.
Se adjunta una imagen ilustrativa a continuación:

*[Image: alt text]*

### ¿Qué implicaciones hay debido a la exposición de la URL?

El hecho que el servidor esté mostrando al usuario la URL del recurso revela que se trata de un caso de **Broken Object Level Authorization (BOLA)**, la presencia de **ID=5** al final de la URL sugiere que el backend utiliza **identificadores numéricos** para referenciar objetos (mensajes), lo cual es un vector crítico para la enumeración y escalada de privilegios. Por lo tanto, se decidió fuzzear nuevamente usando distintos valores numéricos consecutivos, en pos de obtener mensajes de otros usuarios o mayor información. Nuevamente, se utilizó ZAP para el proceso.

## Fuzzeo de mensajes con ZAP

Se creó un nuevo archivo de texto con valores consecutivos como lista de palabras, el cual fue utilizado como fuente de payloads para alimentar un nuevo fuzzeo con ZAP. En mi caso, decidí iterar sobre 20 mensajes diferentes. Luego del fuzzeo, todas las solicitudes enviadas fueron respondidas con un _status code 200_, pero luego de ser analizadas en detalle, se encontró que el mensaje correspondiente al **ID número 6** contenía información acerca de credenciales de **SSH**.

*[Image: alt text]*

De modo tal que utilizando las credenciales obtenidas, accedí por SSH directamente al servidor, lo cual me permitió confirmar la ubicación de la primera bandera de la sala, así como leer su contenido.

*[Image: alt text]*

## Movimiento lateral

Luego de obtenida la primer bandera de la sala, se listó el contenido del directorio principal, así como sus permisos. Este procedimiento fue de utilidad para confirmar la existencia de un usuario de nombre "Tyler", dicho nombre corresponde al remitente del mensaje encontrado en la bandeja de entrada del usuario "scr1ptkiddy" en Silverpeas.
Esta información se consideró suficiente para continuar la fase de movimiento lateral apuntando directamente a este usuario.
Para ello, primero comencé con comandos típicos de reconocimiento interno como ```sudo -l```, ```groups```, ```id```, así como búsqueda de archivos ejecutables o scripts con ```find```.

*[Image: alt text]*

- _La búsqueda de archivos ejecutables no arrojó resultados revelevantes._

Ante la falta de información, se intentó ingresar una copia de ```linpeas.sh``` en el objetivo. Dicho intento tampoco fue exitoso, ya que el mismo servidor bloqueó intentos de descarga desde la máquina atacante tanto con **cURL** como **wget**.

El siguiente paso llevado a cabo fue la búsqueda de información sensible filtrada en el log de eventos de la máquina objetivo. Para ello, se utilizó el comando **cat** en conjunto con **grep** para generar un filtrado de archivos de logs que mencionaran al usuario Tyler. Si bien la salida en terminal fue algo extensa, fue posible determinar la existencia de una entrada de log relacionada con **PostgreSQL**, en la cual se filtró la contraseña utilizada por el usuario Tyler. Se adjuntan comando utilizado para el filtrado de datos e imagen de resultados obtenidos.

```cat /var/log/* | grep "tyler"```

*[Image: alt text]*

## Escalación de privilegios

Esta entrada de log permitió llevar a cabo una acción de **movimiento lateral**, ya que fue posible utilizar las credenciales filtradas para obtener una shell interactiva por SSH.

*[Image: alt text]*

Nuevamente, se listaron permisos y alcance aproximado con este nuevo usuario, y se confirmó que el usuario Tyler cuenta con **permisos totales** para ejecución de comandos como **sudo**.

*[Image: alt text]*

## Bandera root.txt

Con esta información, fue suficiente para listar el contenido del directorio **/root** y obtener la última bandera, para así completar exitosamente la sala.

*[Image: alt text]*
