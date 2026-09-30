# Forbidden Paths

# Descripción
Can you get the flag?Here's the [website](http://saturn.picoctf.net:52278/).We know that the website files live in `/usr/share/nginx/html/` and the flag is at `/flag.txt` but the website is filtering absolute file paths. Can you get past the filter to read the flag?
# Pistas
None
# Solución

```bash
Para encontrar la bandera basta con salir de la ruta absoluta donde se encuentran los archivos usando los comandos ../ correspondientes.

Si enviamos como entrada la siguiente cadena: ../../../../flag.txt podremos obtener la correspondiente bandera

flag: picoCTF{7h3_p47h_70_5ucc355_6db46514}
```

# Bandera
picoCTF{7h3_p47h_70_5ucc355_6db46514}