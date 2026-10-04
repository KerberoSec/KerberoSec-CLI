# Natas 11

#### URL: http://natas11.natas.labs.overthewire.org/

#### Credenciales: natas11:UJdqkK1pTu6VLt9UHWAgRZz6sVUZ3lEk

La cookie que tenemos es un objeto con las propiedades "showpassword" y "bgcolor". Nuestro objetivo es que showpassword tenga el valor "yes". 

Pero el objeto que contiene la cookie primero se convierte a JSON, luego se encripta con XOR y despues se codifica a base64:
``` php
function saveData($d) {
    setcookie("data", base64_encode(xor_encrypt(json_encode($d))));
}
```

Para la operacion XOR vemos que usan una clave que desconocemos:
``` php
function xor_encrypt($in) {
    $key = '<censored>';
    $text = $in;
    $outText = '';

    // Iterate through each character
    for($i=0;$i<strlen($text);$i++) {
    $outText .= $text[$i] ^ $key[$i % strlen($key)];
    }

    return $outText;
}
```

Como la operacion XOR es reversible entonces si ciphertext = json_text ^ key, luego ciphertext ^ json_text = key. Presentamos esto en un script de python.

``` python
import requests
from urllib.parse import unquote
from base64 import b64encode, b64decode
from itertools import cycle

def xorEncrypt(op1,op2):
    
    return bytes(a ^ b for a, b in zip(op1,cycle(op2)))

URL="http://natas11.natas.labs.overthewire.org"
headers={'Authorization':f'Basic {b64encode(b"natas11:UJdqkK1pTu6VLt9UHWAgRZz6sVUZ3lEk").decode()}'}

x = requests.get(URL,headers=headers)
raw_cookie = b64decode(unquote(str(x.cookies.get('data'))))
json_data = b'{"showpassword":"no","bgcolor":"#ffffff"}'
print(xorEncrypt(raw_cookie,json_data))
```

``` bash
python3 natas11_sploit.py
b'eDWoeDWoeDWoeDWoeDWoeDWoeDWoeDWoeDWoeDWoe'
```

La clave es "edWoe". Ahora con la clave encriptamos nuestra cookie con "showpassword" cambiado y la codificamos en base64:

``` python
import requests
from base64 import b64encode
from itertools import cycle

def xorEncrypt(op1,op2):
    return bytes(a ^ b for a, b in zip(op1,cycle(op2)))

URL="http://natas11.natas.labs.overthewire.org?bgcolor=%23ffffff"
key=b"eDWo"
payload = b'{"showpassword":"yes","bgcolor":"#ffffff"}'
headers={'Authorization':f'Basic {b64encode(b"natas11:UJdqkK1pTu6VLt9UHWAgRZz6sVUZ3lEk").decode()}',
         'Cookie':f'data={b64encode(xorEncrypt(payload,key)).decode()}',
        }
x = requests.get(URL,headers=headers)
print(x.text)
```

``` bash
> python3 natas11_sploit.py
<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas11", "pass": "UJdqkK1pTu6VLt9UHWAgRZz6sVUZ3lEk" };</script></head>

<h1>natas11</h1>
<div id="content">
<body style="background: #ffffff;">
Cookies are protected with XOR encryption<br/><br/>

The password for natas12 is yZdkjAYZRd3R7tq7T5kXMjMJlOIkzDeB<br>
<form>
Background color: <input name=bgcolor value="#ffffff">
<input type=submit value="Set color">
</form>

<div id="viewsource"><a href="index-source.html">View sourcecode</a></div>
</div>
</body>
</html>
```

`natas12:yZdkjAYZRd3R7tq7T5kXMjMJlOIkzDeB`

