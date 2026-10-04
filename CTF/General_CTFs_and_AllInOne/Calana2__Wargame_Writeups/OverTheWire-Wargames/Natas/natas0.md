# Natas 0

#### URL: http://natas0.natas.labs.overthewire.org/

#### Credenciales: natas0:natas0

![2025-03-18-172855_606x129_scrot](https://github.com/user-attachments/assets/c5485ff8-792f-43de-ba2c-202a71eb8133)

La contraseña del siguiente nivel se encuentra en el código fuente, solo debes buscar como ver el código fuente de la página en tu navegador y la obtendrás. 

Es útil [familiarizarse con la herramienta *curl*](https://curl.se/) para interactuar con la web desde la terminal. Aquí presento un ejemplo de su uso para autenticarse y hacer una petición al sitio web de natas y obtener la contraseña:

``` bash
>  curl -u "natas0:natas0" http://natas0.natas.labs.overthewire.org/
<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas0", "pass": "natas0" };</script></head>
<body>
<h1>natas0</h1>
<div id="content">
You can find the password for the next level on this page.

<!--The password for natas1 is 0nzCigAq7t2iALyvU9xcHlYN4MlkIwlq -->
</div>
</body>
</html>
```

`natas1:0nzCigAq7t2iALyvU9xcHlYN4MlkIwlq`

