# Vulnhub: Mr. Robot: 1

##### Type:

##### Level: beginner-intermediate.

##### Previous knowledge:

##### Meta: Encontrar 3 claves escondidas en diferentes locaciones

## Walkthrough

####  Primer flag

Encontrar la IP de una maquina especifica dentro de una red (la IP comienza con 172.29.81...)

Hacemos REQUESTS con Zaproxy (OWASP)

Descubrimos que se trata de una Web (Analizamos la direccion IP mediante NMap: Tiene activos los puertos 80 y 433 )

<details> 
    <summary>
        Al ingresar en el browser la IP (http/172.29.81.94) nos devuelve la 1er pista
    </summary>
    
`flag1of3`
</details>

Ahora debemos saber si se trata de un CMS
<details> 
    <summary>
        Al agregar el path del Wordpress a la URL descubrimos que se trata de un WP.
    </summary>
    
`http/172.29.81.94/wp-admin.php`
</details>

Mediante http/172.29.81.94/robots.txt llegamos a fsociety, un diccionario.

<details> 
    <summary>
        Descargamos el diccionario
    </summary>
    
`# wget 172.29.81.94/fsociety.dicc`
</details>

<details> 
    <summary>
        Removemos elementos duplicados
    </summary>
    
` # /Documentos grep fsociety.dic sort-u`
</details>

Probamos como user de Wordpress cada campo del diccionario purgado (este paso conviene automatizarlo) : Si el user no existe 
Wordpress tira un error, si el user existe Wordpress tira otro tipo diferente de error. (Brute Force Attack)

Para los users existentes probamos todos los campos de ese diccionario hasta dar con la password.

### Herramientas utilizadas: nmap, zaproxy
