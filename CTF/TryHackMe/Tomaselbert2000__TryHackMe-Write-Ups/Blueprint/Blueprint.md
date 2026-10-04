# TryHackMe Rooms

## "Blueprint": Spanish Walkthrough

## Configuración

Se inició la sala configurando el archivo ```/etc/hosts``` de la máquina atacante, agregando la dirección IP asignada por TryHackMe a la máquina objetivo, y asociándola a un dominio sencillo como **blueprint.thm**.

```sudo echo <IP de la máquina> blueprint.thm```

## Fase de reconocimiento

La sala partió del reconocimiento de la máquina mediante Nmap en busca de puertos abiertos a la red externa. En consecuencia, se obtuvo información referente a servicios en ejecución, así como sus versiones instaladas. La herramienta fue configurada acorde a la siguiente lista:

- Ejecución de scripts por defecto.
- Descubrimiento de versión de servicios.
- Descubrimiento de versiones de sistema operativo.
- Adicionalmente, se guardó la salida en un archivo de texto para análisis posterior

El comando completo se estructuró de la siguiente manera:

```nmap -sV -sC -O blueprint.thm | tee "nmap_scan.txt"```

En las imagenes se adjuntan los resultados.

El reconocimiento inicial arrojó resultados importantes, se desglosan a continuación:

- Los puertos principales en escucha son el 80, 135, 139, 443 y 445.
- Se han identificado versiones de IIS 7.5, Apache 2.4.23, MariaDB 10.3.23, Microsoft Windows 7 Home Basic, RPC (no especificada), y SMB (también no especificada).
- El reporte de Nmap hizo énfasis además en que existen métodos HTTP potencialmente peligrosos como TRACE.

Por una cuestión de hábito, luego de leer el reporte de Nmap, lo primero que hice fue investigar manualmente el contenido que la máquina expone en los puertos 80 y 8080, a fin de determinar la utilidad de una posible enumeración de directorios.
El directorio servido en el puerto 80 arrojó un error **404**, por lo tanto, pivoté hacia el puerto 8080. En este caso, comprobé que la máquina expone algunos directorios en dicho puerto.
Se adjuntan a continuación imagenes ilustrativas.

Luego de la enumeración, se dió con un nuevo directorio el cual corresponde a **OsCommerce**, un sistema de comercio electrónico gratuito y de código abierto desarrollado aproximadamente en la década del 2000. El mismo se encuentra escrito en **PHP**, y el hecho de que el directorio indique la versión instalada fue un detalle crucial para apuntar a la búsqueda de vulnerabilidades conocidas en dicho software.

## Investigación de vulnerabilidades en OsCommerce

EL siguiente paso fue proseguir la investigación focalizando en el CMS, llevando un procedimiento metódico. El hecho que el objetivo ejecutara una versión de software tan antigua fue determinante para pivotar directamente a la búsqueda de vulnerabilidades ya conocidas para este CMS.
A partir del nombre de la herramienta, sumado al número exacto de versión obtenido durante el reconocimiento, busqué pruebas de concepto y/o CVEs que me permitieran elaborar un ataque rápido al servidor.

*[Image: alt text]*

De todos los resultados que se muestran para esta versión, el que más llamó mi atención dado el contexto de la sala fue el 1er resultado verificado, el cual indica que permitiría ejecución remota de comandos (señalado como RCE).
Continué entonces con el análisis de dicha PoC.

*[Image: alt text]*

## Explicación del exploit

La vulnerabilidad demostrada en esta prueba de concepto radica en el proceso de instalación del CMS en la máquina. Se detalla que el instalador de la herramienta crea un archivo de configuración de nombre ```config.php```, el cual contiene las **credenciales** de la base de datos (en este caso, corriendo sobre MySQL). Puntualmente, este instalador no verifica si ya existe una configuración previamente creada antes de ser ejecutado, así como tampoco valida credenciales antes de crear o sobreescribir dicho archivo. Esta ausencia de validación abre entonces la puerta a que el atacante vuelva a ejecutar el instalador en caso que el administrador no lo haya eliminado. De este modo, se inyectaría código malicioso en el archivo de configuración y, en última instancia, permitiría la ejecución remota de comandos por parte del atacante.

## Preparación y prueba de viabilidad

A fin de no generar ruido en el servidor, se optó por modificar el exploit a fin de poder ejecutar solamente un comando sencillo de prueba y evaluar de qué manera respondía el objetivo. Acorde a la explicación dada en el mismo, se ingresó la información necesaria con respecto a la URL del servidor, y dentro del payload se envió solamente el comando ```whoami```.

*[Image: alt text]*

Notar que se utilizó ```echo exec("whoami")``` debido a que el script original llamaba a la función **system**, la cual se verificó como deshabilitada en el servidor.

*[Image: alt text]*

Luego de acceder al recurso desde el navegador, se validó que los comandos son ejecutados por el usuario **NT AUTHORITY\SYSTEM**, lo cual es un detalle crucial para la resolución de la sala, debido a que este usuario posee el nivel más alto de permisos dentro del sistema. Por lo tanto, se optó por repetir el procedimiento anteriormente mostrado, esta vez en búsqueda de conectar una **shell interactiva**.

## Reverse shell con Netcat

Una vez verifiqué la viabilidad de ejecución de comandos, me dirijí a [RevShells](https://www.revshells.com/), y generé el comando necesario para establecer una terminal interactiva a través de Powershell, tomando en consideración además que la misma fuese **codificada en base64** para evitar errores durante la lectura del comando por parte del objetivo.

*[Image: alt text]*

Luego, se configuró el exploit utilizado anteriormente para sustituir el llamado a ```whoami``` por el payload generado en el paso anterior. Al mismo tiempo, se abrió Netcat en escucha sobre el puerto 4444 de la máquina atacante a la espera de la conexión. Nuevamente, se ejecutó el exploit, sobreescribiendo el archivo ```config.php```, y al acceder al mismo desde el navegador, se recibió en Netcat la conexión desde el objetivo.

*[Image: alt text]*

*[Image: alt text]*

## Bandera root.txt

Dado que en pasos anteriores se determinó que los comandos se ejecutan con máximos privilegios, opté por navegar hasta el directorio **C:\Users\Administrator\Desktop** en el cual se ubica la bandera root.txt, tal como se muestra a continuación.

*[Image: alt text]*

Acto seguido, me dispuse a obtener el hast NTLM del usuario **Lab** para finalizar la sala.

## Hash NTLM del usuario Lab

Para completar la sala, fue necesario aprovechar los permisos elevados conseguidos en el paso anterior para crear un "dump" de dos **colmenas** del registro del sistema:

- **HKLM\SAM**: Contiene la base de datos de usuarios y los hashes cifrados.
- **HKLM\SYSTEM**: Contiene la clave maestra del sistema necesaria para descifrar la base de datos SAM.

El primer paso fue exportar esta información a dos archivos **.hive**, los cuales se generaron dentro del directorio **Public** de la máquina. Se adjuntan los comandos utilizados para ambas operaciones:

```bash
reg save HKLM\SAM C:\Users\Public\sam.hive

reg save HKLM\SYSTEM C:\Users\Public\system.hive
```

Luego de verificar la correcta ejecución de ambos comandos, el paso siguiente fue preparar el entorno para exfiltrar dichos archivos. Para ello, utilicé ```impacket```, creando una carpeta compartida temporal usando el protocolo **SMB**.
Con la carpeta configurada y lista, solamente fue necesario copiar los archivos generados referenciando a mi carpeta compartida a través de la IP de la máquina atacante.

*[Image: alt text]*

*[Image: alt text]*

Ya finalizada la exfiltración de datos a la máquina atacante, procedí a abrir nuevamente Impacket para obtener los hashes NTLM almacenados en la colmena SAM. Para ello, utilicé el comando que se adjunta a continuación:

```impacket-secretsdump -sam sam.save -system system.save LOCAL```

Se puede apreciar como se especificaron los switches correspondientes a la copia de base de datos de usuario, la colmena que contiene la clave del sistema, y por último, indicar a Impacket que realice el análisis de forma local, es decir, sin buscar autenticarse con un host remoto.

*[Image: alt text]*

Completado el análisis por parte de Impacket, se obtuvieron los hashes NTLM correspondientes a los usuarios **Administrator**, **Guest** y **Lab**. Procedí a copiar el hash crudo del usuario Lab a un archivo de texto para atacarlo por fuerza bruta con **John**.

_Nota: luego de almacenar el hash en un archivo local y atacarlo, John no obtuvo coincidencias (utilizando para ello **rockyou.txt**)._

*[Image: alt text]*

Por último, acudí a [CrackStation](https://crackstation.net/), en la cual ingresé el hash encontrado y obtuve finalmente la contraseña original del usuario Lab, finalizando la sala.

*[Image: alt text]*
