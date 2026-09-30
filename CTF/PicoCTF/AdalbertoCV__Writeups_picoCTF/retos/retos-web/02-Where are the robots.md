# Where are the robots

# Descripción
Can you find the robots? `https://jupiter.challenges.picoctf.org/problem/36474/` ([link](https://jupiter.challenges.picoctf.org/problem/36474/)) or http://jupiter.challenges.picoctf.org:36474
# Pistas
What part of the website could tell you where the creator doesn't want you to look?
# Solución

Viendo codigo de pagina html
```html
En la liga: https://jupiter.challenges.picoctf.org/problem/36474/robots.txt

User-agent: *
Disallow: /477ce.html

Guess you found the robots  
picoCTF{ca1cu1at1ng_Mach1n3s_477ce}
```

# Bandera
Guess you found the robots  
picoCTF{ca1cu1at1ng_Mach1n3s_477ce}
# Comentarios
- Colocando al final de la url el robots.txt, podemos acceder a las paginas que no deberian ser revisadas en la web.