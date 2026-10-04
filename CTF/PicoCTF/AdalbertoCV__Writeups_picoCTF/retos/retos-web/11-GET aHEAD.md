# GET aHEAD

# Descripción
Find the flag being held on this server to get ahead of the competition [http://mercury.picoctf.net:45028/](http://mercury.picoctf.net:45028/)
# Pistas
Maybe you have more than 2 choices

Check out tools like Burpsuite to modify your requests and look at the responses
# Solución

```bash
La solución de este reto, es inspeccionar el sitio. Y observar lo que sucede en las request.

Tenemos una request con el metodo get, si cambiamos esto por el metodo head, entonces la peticion tiene una respuesta con la bandera del reto.

flag: picoCTF{r3j3ct_th3_du4l1ty_775f2530}
```

# Bandera
picoCTF{r3j3ct_th3_du4l1ty_775f2530}
