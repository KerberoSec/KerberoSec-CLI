# Natas 2

#### URL: http://natas2.natas.labs.overthewire.org/

#### Credenciales: natas2:TguMNxKo1DSa1tujBLuZJnDUlCcUAPlI

![2025-03-18-174501_1363x194_scrot](https://github.com/user-attachments/assets/02dda6fd-0abd-4a99-97c1-28a0862b339a)

Si hacemos una peticion vemos una imagen 'pixel.png' en el codigo fuente:

``` bash
> curl -u "natas2:TguMNxKo1DSa1tujBLuZJnDUlCcUAPlI" http://natas2.natas.labs.overthewire.org/
<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas2", "pass": "TguMNxKo1DSa1tujBLuZJnDUlCcUAPlI" };</script></head>
<body>
<h1>natas2</h1>
<div id="content">
There is nothing on this page

</div>
</body></html>
```
Si hacemos una peticion a la ruta /files encontramos un archivo 'users.txt'.

![2025-03-18-174939_1134x293_scrot](https://github.com/user-attachments/assets/834191b9-7528-4437-b3d1-4f63f33db68d)

Y precisamente alli estan las credenciales para el proximo nivel:
```
> curl -u "natas2:TguMNxKo1DSa1tujBLuZJnDUlCcUAPlI" http://natas2.natas.labs.overthewire.org/files/users.txt
# username:password
alice:BYNdCesZqW
bob:jw2ueICLvT
charlie:G5vCxkVV3m
natas3:3gqisGdR0pjm6tpkDKdIWO2hSvchLeYH
eve:zo4mJWyNj2
mallory:9urtcpzBmH
```

`natas3:3gqisGdR0pjm6tpkDKdIWO2hSvchLeYH`
