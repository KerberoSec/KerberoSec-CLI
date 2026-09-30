# TryHackMe Rooms

## "Brute It": Spanish Walkthrough

## Primeros pasos y configuración

Como siempre lo hacemos al comenzar la sala, vamos a configurar el archivo **hosts** para asignarle a la IP del objetivo un dominio sencillo de recordar y tipear. En mi caso, yo elijo **_bruteit.thm_**

```sudo echo 'bruteit.thm <MACHINE_IP>' >> /etc/hosts```

## Reconocimiento

Comenzamos escaneando la máquina con **Nmap**, en mi caso además redirijo la salida hacia un archivo de texto para poder consultarlo más adelante de ser necesario.

*[Image: alt text]*

### ¿Cuántos puertos hay abiertos?

La máquina expone un total de **2 puertos** a la red externa.

### ¿Qué versión de SSH se está ejecutando?

La versión de SSH en ejecución es **OpenSSH 7.6p1**.

### ¿Qué versión de Apache se está ejecutando?

La máquina se encuentra ejecutando **Apache 2.4.29**.

### ¿Qué distribución de Linux corre la máquina como sistema operativo?

La distribución de Linux instalada en la máquina es **Ubuntu**.

### ¿Cuál es el directorio oculto?

Una vez tenemos una imagen general del objetivo, para completar esta pregunta es necesario comenzar a enumerar en busca de directorios ocultos, archivos, y cualquier otro tipo de pista en el servidor. En mi caso, elijo enumerar utilizando **FFUF** debido a la gran velocidad para mostrar resultados.

*[Image: alt text]*

Podemos confirmar entonces que el directorio oculto es **/admin**.

*[Image: alt text]*

## Obteniendo una shell en el servidor

La sala indica en la consigna que es necesario obtener una shell mediante SSH en el servidor (recordemos que dicho puerto es el único abierto además de HTTP). El primer obstáculo que debemos pasar para siquiera pensar en intentar acceder a la máquina, es obtener información acerca de usuarios registrados en la misma. Y refiriendo a la imagen anterior, por buena costumbre siempre miramos el código fuente de la página, por si llegasen a haber pistas o detalles ocultos.

*[Image: alt text]*

Analizar el código ahora nos arroja dos detalles clave:

- El mensaje tiene como destinatario a **john**, podemos inferir entonces que se trata de un usuario en el servidor.
- El username es **admin**. Por lo tanto, será un elemento a auditar a continuación al momento de interactuar con el panel de Login.

Comenzamos por el panel de Login. Ya sabemos que el usuario correcto es **admin** por lo cual solo resta obtener la contraseña. Para ello, abrimos nuestra herramienta de intercepción y análisis de solicitudes, en mi caso uso **OWASP ZAP** pero perfectamente se puede reemplazar con Burp Suite, ya que el procedimiento a seguir el mismo.

Luego de abrirlo, lo que hago es enviar una solicitud POST con el usuario y una contraseña cualquiera, ZAP la captura y de ahí la envío al editor de solicitudes. Básicamente, lo que hacemos es que, a sabiendas que el usuario admin es correcto, vamos a **fuzzear** contraseñas hasta dar con la correcta. Seleccionamos el valor de la contraseña en el editor, hacemos click derecho y elegimos "Fuzz". En la ventana emergente seleccionamos la opción para agregar un payload, y cuando nos lo solicite, ingresamos el archivo de lista de palabras, en mi caso, yo uso **rockyou.txt**.

*[Image: alt text]*

*[Image: alt text]*

*[Image: alt text]*

Una vez iniciamos el ataque, lo único que tenemos que hacer es analizar las respuestas del servidor. Al filtrar por **status code**, vemos que el objetivo devuelve un **302** al encontrar la contraseña correcta.

*[Image: alt text]*

Y una vez iniciamos sesión como el usuario admin, la página muestra la bandera correspondiente a la web en pantalla.

*[Image: alt text]*

No suficiente con obtener la bandera, la página además nos redirige hacia una **clave privada RSA**, la cual será necesaria para poder loguearnos mediante SSH como nos pide la consigna.
En este punto, lo que hacemos es entrar al link, copiar el texto de la clave privada y pegarlo en un archivo, yo lo hice directamente en la terminal con:

```touch id_rsa_john # esto crea el archivo vacío```

Y luego lo abro con **nano** para pegar el contenido.

```nano id_rsa_john```

Una vez hecho esto, guardamos los cambios, y previo a descifrar la _passphrase_, debemos preparar el archivo. Para crackearlo, vamos a usar **jonh**, pero por si sola la herramienta no puede abrir este archivo que acabamos de crear. Por lo tanto, primero lo pasamos por **ssh2john**, que convertirá el archivo en un formato que john pueda atacar y descifrar con una wordlist.

```ssh2john id_rsa_john > id_rsa_john_decrypted```

Y una vez tenemos este 2do archivo listo, lo crackeamos.

*[Image: alt text]*

Luego de este proceso, lo siguiente que hacemos es asignarle los permisos necesarios al archivo de clave privada que creamos, y lo usamos para conectarnos por SSH especificando con el **switch -i** dicha clave. Al entablar la conexión, nos pedirá la passphrase que acabamos de descifrar. La ingresamos, y accedemos como el usuario john al servidor.

*[Image: alt text]*

Como ya estamos conectados y podemos leer archivos, con listar el contenido del directorio, ya encontramos la bandera **user.txt**.

*[Image: alt text]*

Llegado este punto, es necesario escalar privilegios dentro de la máquina para continuar avanzando. Empezamos tanteando el terreno, listando permisos de **sudo** y grupos.

*[Image: alt text]*

Vemos que el usuario john puede ejecutar **/bin/cat** como sudo, esta configuración permitirá aplicar la utilidad **cat** para leer información sensible y fuera del alcance normal del usuario.

Para buscar rápidamente archivos para atacar, subimos linPEAS al servidor.

*[Image: alt text]*

*[Image: alt text]*

- **_Los resultados de linPEAS no arrojaron información adicional relevante para esta etapa de la CTF por lo cual fueron omitidos_**

El siguiente es acudir a la vía tradicional, ya que podemos ejecutar **sudo -u root /bin/cat** sin contraseña, lo apuntamos al archivo **/etc/shadow** y leemos los hashes de las contraseñas almacenadas allí.

*[Image: alt text]*

Copiamos la línea completa correspondiente al usuario root, la pegamos en un archivo de texto y se la pasamos a **john** para intentar descifrarla.

*[Image: alt text]*

Y una vez tenemos la contraseña, podemos escalar privilegios dentro de la máquina y obtener la bandera **root.txt**.

*[Image: alt text]*

Opcionalmente, la bandera **root.txt** la podemos obtener incluso sin tener la contraseña, ejecutando el siguiente comando:

```sudo -u root /bin/cat /root/root.txt```

*[Image: alt text]*
