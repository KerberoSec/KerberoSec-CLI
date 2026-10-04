# Natas 8

#### URL:  http://natas8.natas.labs.overthewire.org/index.php 

#### Credenciales: natas8:xcoXLmzMkoIP9D7hlgPlh9XD7OgLAe5Q

En el codigo fuente observamos que se le hacen una serie de transformaciones a la clave secreta para compararlo con la variable $encodedSecret.

``` php
<?

$encodedSecret = "3d3d516343746d4d6d6c315669563362";

function encodeSecret($secret) {
    return bin2hex(strrev(base64_encode($secret)));
}

if(array_key_exists("submit", $_POST)) {
    if(encodeSecret($_POST['secret']) == $encodedSecret) {
    print "Access granted. The password for natas9 is <censored>";
    } else {
    print "Wrong secret";
    }
}
?>
```

Si aplicamos las mismas transformaciones en orden inverso encontraremos el secreto correcto. Esto se puede hacer en cualquier lenguage de programacion, pero aprovechamos y lo hacemos en el mismo php si tenemos un interprete:

``` php
<?php

$encodedSecret = "3d3d516343746d4d6d6c315669563362";

function decodeSecret($secret) {
    return base64_decode(strrev(hex2bin($secret)));
}

echo decodeSecret($encodedSecret)
?>
```

``` bash
> curl -u natas8:xcoXLmzMkoIP9D7hlgPlh9XD7OgLAe5Q http://natas8.natas.labs.overthewire.org -d "secret=$(php decode.php)&submit=AAA" 
<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas8", "pass": "xcoXLmzMkoIP9D7hlgPlh9XD7OgLAe5Q" };</script></head>
<body>
<h1>natas8</h1>
<div id="content">

Access granted. The password for natas9 is ZE1ck82lmdGIoErlhQgWND6j2Wzz6b6t
<form method=post>
Input secret: <input name=secret><br>
<input type=submit name=submit>
</form>

<div id="viewsource"><a href="index-source.html">View sourcecode</a></div>
</div>
</body>
</html>
```

`natas9:ZE1ck82lmdGIoErlhQgWND6j2Wzz6b6t`
