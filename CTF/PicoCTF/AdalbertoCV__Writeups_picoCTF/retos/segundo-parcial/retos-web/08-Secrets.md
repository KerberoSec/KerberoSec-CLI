# Secrets

# Descripción
We have several pages hidden. Can you find the one with the flag?The website is running [here](http://saturn.picoctf.net:52025/).
# Pistas
folders folders folders
# Solución

```bash
Si inspeccionamos la pagina, podemos darnos cuenta de que algunos estilos y elementos se encuentran dentro de una carpeta llamada secret/... Si accedemos a ella podemos encontrar una nueva pagina con una imagen diciendo "# Finally. You almost found me. you are doing well"

ahora, nos damos cuenta por la misma razón de la existencia de un folder llamado "hidden"... si accedemos a el podemos encontrar un login...

repetimos el proceso y podemos encontrar una carpeta llamada "superhidden".. si accedemos a ella encontramos el siguiente texto

"# Finally. You found me. But can you see me"

basta con inspeccionar la pagina y la bandera aparecerá en una etiquet

<h3 class="flag">picoCTF{succ3ss_@h3n1c@10n_39849bcf}</h3>
```

# Bandera
picoCTF{succ3ss_@h3n1c@10n_39849bcf}