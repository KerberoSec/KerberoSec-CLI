# TryHackMe Rooms

## "Soupedecode 01": Spanish Walkthrough

## Configuración

Comenzamos configurando el archivo **hosts** en nuestra máquina atacante asignando un nombre de dominio al objetivo, en mi caso voy a usar "soupedecode.thm".

```sudo echo <IP de la máquina> soupedecode.thm```

- Es recomendable seguir el consejo inicial de sala y aguardar unos 4 minutos antes de comenzar la interacción con el objetivo para permitir que el proceso de arranque del mismo se complete correctamente.

## Fase de reconocimiento del objetivo

Comencé la sala ejecutando un escaneo mediante Nmap sobre el dominio asignado al objetivo. A fin de conseguir una imagen sólida de qué tipo de máquina se trataba, opté por configurar Nmap con los **switches** correspondientes a:

- Descubrimiento de servicios
- Comprobación de sistemas operativos
- Scripts por defecto.

```nmap -sV -sC -O soupedecode.thm```

El comando anterior arrojó los siguientes resultados.

*[Image: alt text]*

Dada la información obtenida por el reporte, se pudo determinar que el objetivo es un **Domain Controller** dentro de una infraestructura de **Active Directory**, el cual orquesta autenticación y seguridad para toda la red ```SOUPEDECODE.LOCAL``` . El servidor en cuestión corre **Windows Server 2022** (lo cual sugiere parches medianamente recientes pero no totalmente actualizado).
En cuanto a puertos abiertos, la máquina expone los siguientes:

- **3389**: correspondiente al protocolo **RDP**. El script ```rdp-ntlm-info``` ejecutado por Nmap confirmó que dicho puerto respondió con información [NTLM](https://es.wikipedia.org/wiki/NTLM).
- **139 y 445**: ambos puertos asignados a [SMB](https://es.wikipedia.org/wiki/Server_Message_Block), protocolo para compartir archivos en Windows. Esto podría sugerir probabilidad de **movimiento lateral** en caso de ser posible acceder a alguna de las máquinas conectadas a la red.
- **389/636**: ambos puertos son utilizados por [LDAP](https://es.wikipedia.org/wiki/Protocolo_ligero_de_acceso_a_directorios) para consultar la base de datos de [Active Directory](https://es.wikipedia.org/wiki/Active_Directory).
- **88**: puerto asignado a [Kerberos](https://es.wikipedia.org/wiki/Kerberos), protocolo que sustenta la seguridad de Active Directory.
- **53**: corresponde al servicio [DNS](https://es.wikipedia.org/wiki/Sistema_de_nombres_de_dominio). El hecho de que este puerto se encuentre abierto abre a la posibilidad de realizar **Enumeración de DNS** para descubrir servidores internos en la red.

Y una vez completé este primer reconocimiento, agregué al archivo hosts los correspondientes nombres de equipo y nombre completo de dominio (conocido como **FQDN**) basado en la salida de Nmap.

```sudo echo <IP de la máquina> SOUPEDECODE.LOCAL DC01.SOUPEDECODE.LOCAL```

## Investigación focalizada en SMB

Se determinó que la máquina ejecuta el servicio SMB, lo cual implica la presencia de recursos compartidos, y permite inferir que, en caso de una **mala configuración**, alguno de ellos fuese accesible con permisos de lectura desde el exterior. Bajo este razonamiento, me dispuse a investigar cómo acceder a tal información. Para ello, me propuse usar [NetExec](https://www.netexec.wiki/), también conocido como ```nxc```, herramienta especializada en auditoría y explotación en redes de gran tamaño.
El primer paso fue determinar primero qué respuesta daba el servicio SMB al intentar acceder mediante la cuenta **guest**, la cual al ser de "Invitado", permite no especificar contraseña durante la autenticación. Por lo tanto, el comando se estructuró de la siguiente forma:

```nxc smb soupedecode.local -U 'guest' -p ''```

Los parámetros aplicados se explican a continuación:

- **smb**: indica el servicio al cual se accederá.
- **soupedecode.local**: el dominio o IP de la máquina objetivo.
- **-U**: refiere a "User", permitiendo especificar el usuario, en este caso "guest".
- **-p**: switch para la contraseña ("Password"). Intencionalmente en blanco dado que el usuario no requiere credenciales.

Una vez ejecutado dicho comando, se visualizó la siguiente respuesta en la terminal:

*[Image: alt text]*

Al analizar la salida, se confirmaron los siguientes datos:

- La autenticación mediante el usuario 'guest' fue exitosa.
- Se confirmó que el servidor objetivo ejecuta **Windows Server 2022 Build 20348 x64**.

Más allá de la versión de Windows, el dato con mayor relevancia sigue siendo que el servidor permite cierta interacción mediante el uso de la cuenta guest. Por lo tanto, lo siguiente fue listar los recursos compartidos que el usuario guest puede acceder.
El comando utilizado fue practicamente el mismo, solo se agregó el switch **--shares** que le indica a la herramienta que liste los recursos visibles.
A continuación se muestra el resultado.

*[Image: alt text]*

Este nuevo resultado fue aún más interesante y revelador. Se verificó que el recurso **IPC$** puede ser leído por el usuario guest.

- _¿Qué significa IPC$ en este contexto? Corresponde a **Inter-Process Communication**. En informática, cuando dos programas necesitan hablar entre sí (ejemplo: un script de PowerShell hablando con el servicio de red), lo hacen a través del sistema operativo. Por lo tanto, el share IPC es la "puerta" o el "puerto" que Windows abre para permitir esa comunicación rápida y segura entre procesos._

De todas formas, y dado que incluso con la cuenta "guest" funcionando, la superficie de ataque no era suficiente, me dispuse a enumerar usuarios válidos dentro del servicio SMB. NetExec fue de gran ayuda en este aspecto, ya que permite enumerar usuarios a partir del **Relative Identifier**, conocido como RID. Podría hacerse el paralelismo con un número único de identificación para cada usuario.
Fue entonces que se continuó mediante una enumeración de usuarios, aplicando a la herramienta el switch **--rid**. Y debido a que la salida puede ser bastante extensa, se optó por redirigirla hacia un archivo de texto de nombre **output.txt**. El comando completo se lista debajo:

```nxc smb soupedecode.local -u guest -p '' --rid > output.txt 2>&1```

Una vez generado el archivo (la salida en la consola es omitida por la redirección) limpié el archivo para eliminar trazas de texto innecesarias y quedarme solo con los nombres de usuario. Este fue el comando que utilicé:

```grep 'SOUPEDECODE\\' output.txt | cut -d':' -f2- | sed -E 's/.*SOUPEDECODE\\(.*) \(SidType.*/\1/' | grep -v '\$' > usernames.txt```

Dado que el comando usado es bastante complejo, aquí se detallan cada uno de sus parámetros y por qué fueron usados:

- grep SOUPEDECODE\\: Busca todas las líneas en el archivo que contengan el nombre del dominio SOUPEDECODE. Como detalle, la doble barra invertida (\\) es necesaria porque en Linux la barra invertida \ es un carácter especial.
- cut -d':' -f2-: cut es una utilidad que permite al usuario cortar texto, para este caso, se usó el caractér ":" (dos puntos) como delimitador, preservando el texto **luego** de la ocurrencia del ":".
- sed -E 's/.\*SOUPEDECODE\\(.\*) \(SidType.*/\1/': sed es una herramienta que permite editar texto rápidamente, buscando patrones y reemplazando texto. El switch **-E** activa expresiones regulares mientras que ```'s/.../\1/'``` busca un string en particular, en este caso, "SOUPEDECODE".
- grep -v '\$': mediante el swittch **-v**, filtra todas las líneas que **no tengan** el caracter "$".
- \> usernames.txt: guarda el resultado final de todo el proceso en un archivo nuevo llamado usernames.txt.

A partir de este momento, ejecuté una nueva enumeración de usuarios, esta vez enfocada en propiciar una autenticación exitosa usando el propio nombre de usuario a modo de password. Por lo tanto, configuré nxc para que extraiga las credenciales directamente del archivo que preparé. El comando completo se adjunta a continuación.

```nxc smb -u usernames.txt -p usernames.txt --no-brute --continue-on-success```

- El parámetro **--no-brute** indica a la herramienta que no se aplicará fuerza bruta durante la autenticación.
- Por su parte, **--continue-on-success** indicará a nxc que continúe probando usuarios incluso al encontrar coincidencias.

Luego de unos segundos espera, la enumeración confirmó como válido al usuario **ybob317**.

*[Image: alt text]*

## Acceso a recursos compartidos a partir del usuario encontrado

Para esta parte de la sala se optó por utilizar la herramienta ```smbclient```. Mediante las credenciales encontradas se listaron los recursos del servidor a los cuales el usuario ybob317 podía acceder. A continuación se adjuntan los resultados.

```smbclient //soupedecode.local/Users -U ybob317```

- Se especificó en el comando que la herramienta se conectara al recurso "Users" descubierto anteriormente.

*[Image: alt text]*

Se confirmó que la bandera **user.txt** se encontraba almacenada dentro del directorio **\ybob317\Desktop\\**. Dado que no es posible utilizar comandos como "cat" dentro de la sesión de SMB, se descargó el archivo a la máquina atacante para leer su contenido y obtener la 1er bandera de la sala.

*[Image: alt text]*

*[Image: alt text]*

## ¿Qué significan los términos "Kerberoasting" y "SPN"?

Kerberoasting es una técnica que se basa en obtener un **ticket de servicio** el cual se encuentra cifrado con la contraseña de la cuenta de servicio a la cual se asocia. Dicho ticket permitirá al atacante **crackear** de manera offline el hash del ticket, y mediante este proceso, derivar la **contraseña de la cuenta de servicio**.
Por otra parte, es importante conocer el concepto de **Service Principal Names**, también conocido como SPN. Consta de una dirección única que permitirá a un servicio autenticarse con Kerberos (SQL Server, IIS, Exchange, entre otros).

## Fase de Kerberoasting y acceso a archivos críticos

Una vez confirmada la primer bandera, el camino hacia la escalación de privilegios se formó a partir de un ataque por **Kerberoasting**, aprovechando las credenciales válidas obtenidas anteriormente.
La herramienta utilizada en este paso fue ```impacket```, y se explican a continuación los parámetros definidos:

- **GetUserSPNs**: el script de Python que impacket deberá ejecutar.
- **soupedecode.local/ybob317:password**: el controlador de dominio al cual se desea conectar (reemplazar "password" con la contraseña real).
- **-dc-ip**: la dirección IP del servidor objetivo.
- **-request**: solicita al servidor el Ticket Granting Ticket buscado para luego crackear el hash y lo devuelve en un formato legible por herramientas de cracking como John The Ripper o Hashcat.
- **-output**: guarda los resultados en un archivo de texto.

El comando completo se adjunta a continuación:

```impacket-GetSPNs soupedecode.local/ybob317:password -dc-ip soupedecode.thm -request -output hash_list.txt```

*[Image: alt text]*

Una vez obtenidos los hashes, procedí a crackearlos usando **John the Ripper**.

*[Image: alt text]*

La contraseña que obtuve la utilicé con la primer cuenta de servicio que arrojó la lista de SPNs, la cual es **file_svc**. Con esta información, volví a repetir el procedimiento llevado a cabo antes con ```nxc``` en el cual se listaron los recursos accesibles, reemplazando usuario y contraseña con esta nueva combinación. Se muestra en la siguiente imagen la respuesta del servidor.

*[Image: alt text]*

Logré determinar que esta cuenta tenía acceso de lectura al directorio "backup" encontrado antes, por lo cual pivoté directamente hacia él. Nuevamente a través de ```smbclient```, me conecté a dicha compartición para listar sus contenidos.

```smbclient //soupedecode.local/backup -U file_svc```

Ya dentro del directorio, listé sus contenidos, e identifiqué un archivo de texto de nombre "backup_extract.txt". Lo descargué a mi máquina local para continuar con su análisis.

*[Image: alt text]*

*[Image: alt text]*

## Escalación de privilegios mediante "Pass-the-Hash"

Una vez obtuve este archivo, se crearon dos nuevos archivos correspondientes a los usuarios definidos en el backup y sus hashes asociados. Esto a fin de contar con los elementos necesarios para realizar un ataque de tipo "Pass-the-Hash", en el cual la autenticación se lleva a cabo mediante el usuario y luego proporcionando su hash.

Extracción de usuarios: ```cat backup_extract.txt | cut -d ':' -f 1 > backup_users.txt```
Extracción de hash: ```cut -d: -f4 backup_extract.txt > backup_hashes.txt```

Una vez armé dichos archivos, ejecuté nxc nuevamente, esta vez acorde a los siguientes parámetros:

- **-u**: indica usar la lista de usuarios creada.
- **-H**: especifica la lista de hashes.

*[Image: alt text]*

Como se puede ver en la imagen anterior, el servidor contestó con un hash determinado correspondiente a **FileServer$**. Con dicho hash, se lanzó la ejecución de ```impacket-smbexec``` para obtener una shell autenticada con dicho usuario.

```impacket-smbexec 'FileServer$'@soupedecode.local -hashes ':[hash]'```

La ejecución exitosa de este comando permitió acceso con permisos de administrador al sistema. Luego de unos momentos de investigación, se confirmó que la bandera **root.txt** se encuentra en el directorio **C:\Users\Administrator\Desktop\\**.

*[Image: alt text]*
