# Roboto Sans

# Descripción
The flag is somewhere on this web application not necessarily on the website. Find it.Check [this](http://saturn.picoctf.net:64271/) out.
# Pistas
None
# Solución

```bash
El nombre del reto nos sugiere mirar el archivo "robots.txt"... al abrirlo nos encontramos con lo siguiente:

User-agent *
Disallow: /cgi-bin/
Think you have seen your flag or want to keep looking.

ZmxhZzEudHh0;anMvbXlmaW
anMvbXlmaWxlLnR4dA==
svssshjweuiwl;oiho.bsvdaslejg
Disallow: /wp-admin/

Ese texto podria ser algun texto encriptado, por lo que usando cyberchef, podemos descifrar que dice.

La segunda linea nos proporciona una ruta a consultar

"js/myfile.txt"

al abrir el archivo obtenemos la bandera:

flag: picoCTF{Who_D03sN7_L1k5_90B0T5_032f1c2b}

```

# Bandera
picoCTF{Who_D03sN7_L1k5_90B0T5_032f1c2b}