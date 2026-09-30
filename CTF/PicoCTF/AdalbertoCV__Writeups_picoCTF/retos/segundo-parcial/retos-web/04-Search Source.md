# Search Source

# Descripción
The developer of this website mistakenly left an important artifact in the website source, can you find it?The website is [here](http://saturn.picoctf.net:52523/)
# Pistas
How could you mirror the website on your local machine so you could use more powerful tools for searching?
# Solución

```bash

Utilizando los filtros del inspector de código del buscador Firefox para desarrolladores, podemos encontrar la conincidencia del formato de bandera en el archivo style.css

Al abrir el archivo y buscar texto dentro de el, encontramos la siguiente bandera:

picoCTF{1nsp3ti0n_0f_w3bpag3s_ec95fa49}
 
```

# Bandera
picoCTF{1nsp3ti0n_0f_w3bpag3s_ec95fa49}