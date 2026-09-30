# Pixelated

# Descripción
I have these 2 images, can you make a flag out of them? [scrambled1.png](https://mercury.picoctf.net/static/49743139fb7c10765dbf462d40987d2a/scrambled1.png) [scrambled2.png](https://mercury.picoctf.net/static/49743139fb7c10765dbf462d40987d2a/scrambled2.png)
# Pistas
[https://en.wikipedia.org/wiki/Visual_cryptography](https://en.wikipedia.org/wiki/Visual_cryptography)

Think of different ways you can "stack" images
# Solución

```bash
Python 3.9.6 (tags/v3.9.6:db3ff76, Jun 28 2021, 15:26:21) [MSC v.1929 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license" for more information.
>>> from PIL import Image
>>> import numpy as np
>>> import os
>>> imgs = ["scrambled1.png","scrambled2.png"]
>>> datos = [np.asarray(Image.open(f'{name}')) for name in imgs]
>>> datos_conjuntos = datos[0].copy() + datos[1].copy()
>>> nueva = Image.fromarray(datos_conjuntos)
>>> nueva.save("flag.png","PNG")
>>> exit()

Solo queda abrir nuestra imagen y obtenemos la siguiente bandera:

flag: picoCTF{2a4d45c7}

```

# Bandera
flag: picoCTF{2a4d45c7}