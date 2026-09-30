## Objetivo

How about we take you on an adventure on exploring certificate signing requestsTake a look at this CSR file [here](https://artifacts.picoctf.net/c/261/readmycert.csr).

## Solución
```
┌──(kali㉿Brayan)-[~/Documents/PicoCTF]
└─$ ls
codebook.txt  fixme2.py            level2.flag.txt.enc  level3.py
code.py       _flag.png.extracted  level2.py            readmycert.csr
convertme.py  level1.flag.txt.enc  level3.flag.txt.enc  runme.py
fixme1.py     level1.py            level3.hash.bin      token.txt
                                                                             
┌──(kali㉿Brayan)-[~/Documents/PicoCTF]
└─$ cat readmycert.csr 
-----BEGIN CERTIFICATE REQUEST-----
MIICpzCCAY8CAQAwPDEmMCQGA1UEAwwdcGljb0NURntyZWFkX215Y2VydF9iZWZh
NDIyMX0xEjAQBgNVBCkMCWN0ZlBsYXllcjCCASIwDQYJKoZIhvcNAQEBBQADggEP
ADCCAQoCggEBAKecjf2NWOao3GVCrD9BuIhsfiW1+cqe01kW00XxIh1lmeH3PTk6
Uxc0ezIw6xJwbI/SZCNHP9oN+0b8KubevzRQuB8WgDiWVMoEYa6eT74/tEGm1G+s
+/WUqvxFJjJG9rUGf/29H0N5N2Ti3nt9bBkVaS/uVrfxGnH9I52i49+RxRq4oBHI
Faq44Su02iHMdbyAHZBqkAOnBh98BNVpPxqFMpaFrukXqDc5rn+7NMD+lsiO3SZP
DWNslLb9EnrqxvAnCrs/AsWM6VZ7zG+cBf0ZxGLHVfoi5t2xaUoyFRw++BItGRW8
hDI6siGQCr1zJ7CYEwx+G+cIX9VuRkZ9YFUCAwEAAaAmMCQGCSqGSIb3DQEJDjEX
MBUwEwYDVR0lBAwwCgYIKwYBBQUHAwIwDQYJKoZIhvcNAQELBQADggEBAFRWcf2Q
IGntMWwSOwnVJUG/SC2yajnI7+w6H1W/o1JJGVZeLsR2YUqm7EYjG84rwNlOGrcM
IH7xm5Zc60FRx9K93JNXVHxTKCwZT2ukCBUzWLOzphEwbQKmCzLRlsdvZpmSuC1l
fGlR6NxuuRP7qBrXDWzoV+ZyxpCzWTiZqz2HhJNFvP56cLXnMpWArgzX/Zh7nQ5V
08vLEe0sCnVIvw4z/DeNwIjpZxR+bazy/TYO8C2eF0rch+pKfOCoFedI6fbk5aaD
FgRsYMNLXJhw4JbbX9ovrx0D31G/gIFwpLZHOejC/yD9rtDBfyxnzJelOuDkR+DJ
8aogt7Ix56LqiQM=
-----END CERTIFICATE REQUEST-----
                                                                             
┌──(kali㉿Brayan)-[~/Documents/PicoCTF]
└─$ 

```

### `picoCTF{read_mycert_befa4221}`
 
## Notas adicionales

#### Definiciones que entender

El problema sugiere la idea de indagar en una exploración de las solicitudes de firma de certificados (CSR, por sus siglas en inglés).

Estas solicitudes de firma de certificados son documentos que se envían a una autoridad de certificación (CA, por sus siglas en inglés) para solicitar un certificado digital. Los certificados digitales son utilizados para asegurar la comunicación en línea y garantizar la autenticidad de un sitio web o servicio.

en este caso obtuve el siguiente certificado 

```
-----BEGIN CERTIFICATE REQUEST-----
MIICpzCCAY8CAQAwPDEmMCQGA1UEAwwdcGljb0NURntyZWFkX215Y2VydF9iZWZh
NDIyMX0xEjAQBgNVBCkMCWN0ZlBsYXllcjCCASIwDQYJKoZIhvcNAQEBBQADggEP
ADCCAQoCggEBAKecjf2NWOao3GVCrD9BuIhsfiW1+cqe01kW00XxIh1lmeH3PTk6
Uxc0ezIw6xJwbI/SZCNHP9oN+0b8KubevzRQuB8WgDiWVMoEYa6eT74/tEGm1G+s
+/WUqvxFJjJG9rUGf/29H0N5N2Ti3nt9bBkVaS/uVrfxGnH9I52i49+RxRq4oBHI
Faq44Su02iHMdbyAHZBqkAOnBh98BNVpPxqFMpaFrukXqDc5rn+7NMD+lsiO3SZP
DWNslLb9EnrqxvAnCrs/AsWM6VZ7zG+cBf0ZxGLHVfoi5t2xaUoyFRw++BItGRW8
hDI6siGQCr1zJ7CYEwx+G+cIX9VuRkZ9YFUCAwEAAaAmMCQGCSqGSIb3DQEJDjEX
MBUwEwYDVR0lBAwwCgYIKwYBBQUHAwIwDQYJKoZIhvcNAQELBQADggEBAFRWcf2Q
IGntMWwSOwnVJUG/SC2yajnI7+w6H1W/o1JJGVZeLsR2YUqm7EYjG84rwNlOGrcM
IH7xm5Zc60FRx9K93JNXVHxTKCwZT2ukCBUzWLOzphEwbQKmCzLRlsdvZpmSuC1l
fGlR6NxuuRP7qBrXDWzoV+ZyxpCzWTiZqz2HhJNFvP56cLXnMpWArgzX/Zh7nQ5V
08vLEe0sCnVIvw4z/DeNwIjpZxR+bazy/TYO8C2eF0rch+pKfOCoFedI6fbk5aaD
FgRsYMNLXJhw4JbbX9ovrx0D31G/gIFwpLZHOejC/yD9rtDBfyxnzJelOuDkR+DJ
8aogt7Ix56LqiQM=
-----END CERTIFICATE REQUEST-----
```

lo primero que se me ocurrio al ver esto fue utilizar un **decodificador de CSR, entonces para decodificar una solicitud de firma de certificado** y verificar que contiene la información correcta. 
Ya que al indagar se dice que una solicitud de firma de certificado es un bloque de texto codificado que contiene información sobre la empresa a la que se emitirá un certificado SSL y la clave pública SSL. Una vez que se crea un CSR, es difícil verificar qué información contiene porque está codificada, entonces utilizamos una herramienta especial (esta en el apartado *referencias*) y me arrojo en el apartado *Nombre común* lo siguiente:

`picoCTF{read_mycert_befa4221}`

y fue todo lo que se realizo.

## Referencias

- https://www.sslshopper.com/csr-decoder.html
- https://certlogik.com/decoder/
- https://www.dondominio.com/es/help/242/que-es-csr/