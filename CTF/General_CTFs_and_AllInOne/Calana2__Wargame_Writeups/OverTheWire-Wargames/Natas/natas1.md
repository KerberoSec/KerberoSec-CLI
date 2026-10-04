# Natas 1

#### URL: http://natas1.natas.labs.overthewire.org/

#### Credenciales: natas1:0nzCigAq7t2iALyvU9xcHlYN4MlkIwlq

![2025-03-18-173937_604x143_scrot](https://github.com/user-attachments/assets/38be9d47-1d11-4c90-9410-3ad896b09982)

Bloquearon el click derecho, pero igual podemos ver el codigo fuente de la pagina y obtener la contraseña:

``` bash
> curl -u "natas1:0nzCigAq7t2iALyvU9xcHlYN4MlkIwlq" http://natas1.natas.labs.overthewire.org/
<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas1", "pass": "0nzCigAq7t2iALyvU9xcHlYN4MlkIwlq" };</script></head>
<body oncontextmenu="javascript:alert('right clicking has been blocked!');return false;">
<h1>natas1</h1>
<div id="content">
You can find the password for the
next level on this page, but rightclicking has been blocked!

<!--The password for natas2 is TguMNxKo1DSa1tujBLuZJnDUlCcUAPlI -->
</div>
</body>
</html>
```

`natas2:TguMNxKo1DSa1tujBLuZJnDUlCcUAPlI`
