# Vulnhub: Matrix: 1

##### Type: boot 2 root.
##### Level: Intermediate.
##### Previous knowledge: basic linux, basic ethical hacking skills (scan de puertos, bruteforce, analisis web)
##### Meta: Conseguir acceso root y leer el unico flag en: /root/flag.txt
*Note: Para espiar los resultados de cada acción, hacé click en la flecha y spoileate un poco :).*

## Walkthrough

Una vez obtenida la IP de la máquina virtual, lo primero que hicimos es escanearla en búsqueda de servicios, ya que no tenemos ninguna información disponible sobre qué hay dentro la VM, ni cómo acceder.

<details> 
    <summary>
  Para esto podemos utilizar alguna herramienta para enumerar puertos y servicios.
    </summary>

`# nmap -sS -sV ip_vm`
</details>
</p>
<details> 
    <summary>
    Una vez enumerados los servicios, pudimos notar tres muy importantes entre ellos.
    </summary>

`ssh:22; http:80; puerto: 31337`
</details>
</p>

<details> 
    <summary>
Utilizando nuevamente la herramienta anterior corroboramos que realmente hay un sitio detrás del puerto default para el protocolo HTTP.
   </summary>

`# nmap ip_vm --script=http-title`
</details>
</p>

<details> 
  <summary>
Luego de navegar un poco por el sitio original, uno de las primeras pistas se encuentra en un indicio dado en el mismo sitio
  </summary>

**Follow the white rabbit**\
Investigando la imágen del conejo que se encuentra al pie de la página utilizando dev tools podemos ver que el nombre de la misma se encuentra en el path: assets/img/p0rt_31337.png, dando una idea que en el puerto 31337 puede hallarse quizas otra pista.
</details>
</p>

<details>
  <summary>
Siguiendo el paso anterior, con la nueva pista encontrada, podemos analizar que tipo de servicio se encuentra corriendo.
  </summary>
Utilizando una herramienta como netcat (nc) podemos intentar conectarnos a este servicio e intentar realizar una HTTP request:'

`# nc ip_vm 31337`\
`# GET / HTTP/1.0`

Esto nos devuelve una respuesta desde un web server de python (simplehttpserver), por lo tanto podemos acceder a ip_vm:31337 como cualquier otra web.
</details>
<details>
  <summary>
  En este paso, como al comienzo, hacemos un poco de analisis del codigo fuente en dev tools y vemos de encontrar alguna pista.
  </summary>
Si miramos detalladamente, encontramos un elemento div con la clase "service" que contiene un elemento de parrafo comentado con un string en formato hash.
Este hash se encuentra codificado en base64, por lo tanto debemos proceder a buscar un decodificar de este tipo.
</details>

<details>
  <summary>
  Habiendo hallado alguna pista en el paso anterior, podemos proceder a analizar el resultado de la misma y como se puede continuar, dentro la misma web.
  </summary>
  Parte del hash hallado en el paso anterior ya decodificado, podemos ver que parte de ese string tiene una referencia a `> Cypher.matrix`.
  Con esa pista, procedemos a probar si la misma es una contraseña para alguno de los servicios actualmente corriendo, o si es parte de la URL para obtener acceso a algun directorio oculto.
  Probando http://ip_vm/Cypher.matrix logramos conseguir una descarga de un archivo.
  Hint: https://en.wikipedia.org/wiki/Brainfuck
</details>
<details>
  <summary>
  En esta instancia, deberiamos haber conseguido credenciales para hacernos con un paso mas y ganar acceso a la VM.
  El desafio no lo hace tan trivial, por lo tanto hay que encontrar la manera de hacerse con las credenciales validas.
  </summary>
  Habiendo decompilado el archivo de texto compilado en brainfuck, conseguimos un nombre de usuario y parte de una contraseña.
  En este punto, deberiamos realizar fuerza bruta para poder acceder mediante SSH con el usuario encontrado y varios intentos de passwords, ya que la contraseña hallada no está completa, y hay que descifrar que caracteres son los que la validan.
  "Crunch" es una herramienta que permite generar diccionarios basados en patrones como letras mayusculas/minusculas, números, etc...
  Considerando que debemos hallar los ultimos dos caracteres de la contraseña hallada, podemos invocar a crunch de la siguiente manera y generar un diccionario:
  crunch 8 8 -t pass_encontrada%@ -o dictionary.txt
</details>
<details>
  <summary>
Es hora de intentar ganar acceso a la VM.
Si en el paso anterior se logro conseguir un set de credenciales potencialmente validas, podemos intentar loguearnos reiteradas veces.
  </summary>
  Deberiamos tener generado un .txt con todas las posibles combinaciones de claves para la password que encontramos en pasos anteriores.
  Ahora lo que resta es conectarse media fuerza bruta al servicio de SSH que la VM tiene corriendo, utilizando Hydra.

  `# hydra -l <usuario hallado> -P dict.txt <ip_vm> ssh`
</details>
<details>
  <summary>
  ¿Se consiguio acceso?.
  Ahora deberiamos analizar que tipo de permisos tenemos en el sistema y analizar si con los permisos actuales podemos hacernos con el flag en /root/flag.txt
  </summary>
  En este desafio hay dos situaciones.
  1) La terminal con la que se puede interactuar es restringida. Tambien conocida como rbash
   
   `#echo $PATH`
   `#echo $SHELL`

  2) El usuario no tiene privilegios de root, por lo tanto hay que lograr saltar las restricciones de rbash y elevar privilegios como root

  De ahora en mas, lo que resta es escapar de las restricciones de rbash:
  Utilizando "vi": \
  :!/bin/bash

  Y exportando como variables de entorno a
  "/bin/bash" como la terminal por defecto, "/usr/bin" y "/bin" para ejecutar comandos de linux apropiadamente.

  De ahora en mas, podria invocarse a sudo para leer el flag.
</details>

### Herramientas utilizadas: nmap, ssh, vi/vim, crunch, hydra, sudo, browser