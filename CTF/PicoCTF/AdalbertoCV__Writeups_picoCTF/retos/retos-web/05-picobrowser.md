# picobrowser

# Descripción
This website can be rendered only by **picobrowser**, go and catch the flag! `https://jupiter.challenges.picoctf.org/problem/26704/` ([link](https://jupiter.challenges.picoctf.org/problem/26704/)) or http://jupiter.challenges.picoctf.org:26704
# Pistas
You don't need to download a new web browser
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ curl https://jupiter.challenges.picoctf.org/problem/26704/flag -H "User-Agent: picobrowser" | grep pico
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  2115  100  2115    0     0   9558      0 --:--:-- --:--:-- --:--:--  9570
         <!-- <strong>Title</strong> --> picobrowser!
            <p style="text-align:center; font-size:30px;"><b>Flag</b>: <code>picoCTF{p1c0_s3cr3t_ag3nt_e9b160d0}</code></p>
adalh4ck1ng-picoctf@webshell:~$ 
```

# Bandera
picoCTF{p1c0_s3cr3t_ag3nt_e9b160d0}

# Comentarios 

- Hacemos creer que estamos usando un navegador picobrowser enviando un encabezado.