# Vulnhub: Raven: 1

##### Type: boot 2 root.
##### Level: Begginer.
##### Previous knowledge: basic linux, basic mysql, basic ethical hacking skills

*Note: Para espiar los resultados de cada acción, hacé click en la flecha y spoileate un poco :).*

## Walkthrough

####  Primer flag
Una vez obtenida la IP de la máquina virtual, lo primero que hicimos es escanearla en búsqueda de servicios, ya que no tenemos ninguna información disponible sobre qué hay dentro la vm, ni cómo acceder.

<details> 
    <summary>
  Para esto podemos utilizar alguna herramienta para enumerar puertos y servicios.
    </summary>

`# nmap -sS -sV ip_vm`
</details>
</p>
<details> 
    <summary>
    Una vez enumerados los servicios, pudimos notar dos muy importantes entre ellos.
    </summary>

`ssh:22; http:80`
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
Luego de browsear un poco por el sitio original, uno de los primeros flags se puede encontrar embebido en el HTML de una de las secciones.
  </summary>

**Dentro de `services.html`**
</details>
</p>

La manera más sencilla (pero poco práctica para sitios más grandes) es utilizando `Ctrl+U` en el browser y buscando la palabra `flag`.

<details>
  <summary>
  Allí encontraremos el primero:

  </summary>

  `flag1{b9bbcb33e11b80be759c4e844862482d}`
</details>

### Segundo flag

Dentro de una de las secciones del sitio, se encuentra Blog, que redirige a un WordPress en el path `/wordpress`. 

Al ingresar varios de los recursos que utiliza y algunas redirecciones apuntan a `raven.local`, esto no está claro si es un error del diseñador o una traba más.

<details>
  <summary>
  De todos modos existe una manera muy sencilla de evitar que eso siga sucediendo.
  </summary>

  **Agregamos la IP de la vm en /etc/hosts de la siguiente manera:**
  `ip_vm raven.local`
</details>
</p>

Una vez hecho esto, refrescamos y pudimos verlo con claridad.

<details>
  <summary>
  Por defecto, sabemos que el panel de login se encuentra en:
  </summary>

  `/wp-login.php`
</details>
</p>

<details>
  <summary>
  Probamos usuarios por defectos y no tuvimos suerte. Para obtener información sobre sitios en wordpress, como vulnerabilidades, plugins instalados, user enummeration y demás, existen algunas herramientas conocidas:
  </summary>

**Metasploit provee en auxiliaries algunos módulos de scanning particulares para WordPress, y la herramienta que nunca falla es WPScan.**

**Corriendo `wpscan --url raven.local/wordpress -e u`, se pudieron enumerar dos usuarios: `steven` y `michael`.**
</details>
</p>

<details>
  <summary>
Con los usuarios obtenidos, luego de probar diversos intentos en el login de WP, decidimos probarlos en algunos servicios, siempre comenzando con los básicos.  
  </summary>

**Otro de los servicios era ssh, probando la combinación `michael:michael` logramos obtener acceso ssh: michael@raven.local**
</details>
  </p>

<details>
  <summary>
Dentro del servidor, intentamos escalar privilegios sin éxito alguno, tampoco estaba contenido en el sudoers. Decidimos probar de ver si <code>michael</code> tenía acceso al web root del Apache que estaba hosteando el sitio.  
  </summary>
  
**Accediendo a `/var/www/` encontramos el segundo flag, comprobamos que tiene acceso de lectura/escritura sobre toda la carpeta y subdirectorios.**

`flag2{fc3fd58dcdad9ab23faca6e9a36e581c}`
</details>
</p>
Aquí intentamos hacer una escalación de privilegios, alojando un backdoor PHP en el webroot, pero el servicio corre con usuario <code>www-data</code> y al ejecutarlo obtuvimos más restricciones que con el usuario actual (michael).

 
### Tercer flag (¿y cuarto?)

<details>
  <summary>
En esta situación lo más obvio sería mirar la configuración del WordPress para entender con qué credenciales está interactuando con la base de datos.
  </summary>
  
**El archivo `wp-config.php` en sus comienzos nos brinda lo siguiente:**
`user root, password R@v3nSecurity, database wordpress.` 
</details>
</p>

<details>
  <summary>
  Utilizando estas credenciales nos loggeamos desde el intérprete a la base de datos de la siguiente manera:

  </summary>

  `mysql -u root -pR@v3nSecurity`
</details>
</p>

<details>
  <summary>
  Allí dentro, intentamos leer y escribir archivos del sistema, para reintentar una escalación de privilegios, pero el servicio de MySQL también corre bajo su propio usuario, y a simple vista no hay nada sencillo, más que hurgar en la base de datos.
  </summary>
  
**Vemos qué bases de datos hay.**
`mysql> show databases;`
**Y nos quedamos por ahora con la importante, que es wordpress, ya que tenemos la contraseña del usuario más elevado dentro de la db.**
</details>
</p>

<details>
  <summary>
  La forma más sencilla de hurgar en absolutamente toda la base de datos, más sabiendo que en este tipo de CTFs los flags contienen un patrón "grepeable" es ejecutando:
  </summary>
  
`mysqldump -uroot -pR@v3nSecurity wordpress | egrep -Hn "flag[0-4]{\w*}" --color`
</details>

<details>
  <summary>
  De esta manera aparecieron los siguientes flags:
  </summary>

  `flag3{afc01ab56b50591e7dccf93122770cd2}`
  `flag4{715dea6c055b9fe3337544932f2941ce}`  
</details>
</p>

Que por alguna razón también creemos que es un error del diseñador del ctf que el cuarto también esté allí, ya que generalmente si son modalidad boot2root, el último flag se halla obteniendo root.

#### Cuarto flag

<details>
  <summary>
  Nuevamente, cansados de probar varias cosas, recordamos que todavía no tuvimos acceso real al wordpress, más allá de que podemos modificar toda su base de datos, y tal vez nos hallamos salteado una parte importande del proceso.
  </summary>
  
  **Ingresando nuevamente a `mysql`, listamos los usuarios y contraseñas de la base de datos wordpress.**
`mysql> use wordpress;`
`mysql> select user_login,user_pass from users;`

`michael:$P$BjRvZQ.VQcGZlDeiKToCQd.cPw5XCe0`
`steven:$P$Bk3VD9jsxx/loJoqNsURgHiaB23j7W/`
</details>
</p>

<details>
  <summary>
  Una vez obtenidas los hashes de los usuarios previamente listados en el user enumeration de wpscan, los ponemos a crackear con alguna tool de preferencia.
  </summary>

  **En nuestro caso utilizamos** `john`
`john hash.txt`

**Luego de un rato brinda la contraseña `pink84` para el usuario steven.**
</details>
</p>

<details>
  <summary>
  Ingresando con steven por ssh, lo primero que hicimos fue ver si estaba en sudoers, con el comando:
  </summary>
  
`sudo -l`
</details>
</p>

<details>
  <summary>
  Efectivamente estaba permitida con privilegios de administrador la ejecución de:
  </summary>
  
`/usr/bin/python`
</details>
</p>

<details>
  <summary>
  De esta manera podemos llamar a una shell para poder manipular todo con mucha más facilidad. Esto se logra importando una librería llamada <code>pty</code>
  </summary>

```
# sudo /usr/bin/python;
>> import pty; pty.spawn("/bin/bash");
# id
uid=0(root) gid=0(root) groups=0(root)
```
</details>
</p>

Finalmente se consiguió acceso a `root`, y dentro del root folder se hallaba nuevamente el `flag4`, como es de esperarse de encontrar allí el último flag en este tipo de desafíos.

## Conclusiones

Las maneras de ser `root` según el creador son dos, y posiblemente haya maneras distintas de obtener los flags, como tal vez obteniendo acceso al `wordpress` y observando realmente donde estaba alojado el `flag3`, pero esta fue la manera en la que lo resolvimos en esta ocasión.

### Herramientas utilizadas: nmap, ssh, vi/vim, john, sudo, mysqldump, mysql