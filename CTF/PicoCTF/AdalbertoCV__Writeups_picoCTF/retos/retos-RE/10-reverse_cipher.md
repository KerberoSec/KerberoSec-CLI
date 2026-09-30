# reverse_cipher

# Descripción
We have recovered a [binary](https://jupiter.challenges.picoctf.org/static/31c9b832d036a10daeef52d8b4290ef0/rev) and a [text file](https://jupiter.challenges.picoctf.org/static/31c9b832d036a10daeef52d8b4290ef0/rev_this). Can you reverse the flag.
# Pistas
objdump and Gihdra are some tools that could assist with this
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ cat rev
rev       rev_this  
adalh4ck1ng-picoctf@webshell:~$ cat rev_this 
picoCTF{w1{1wq85jc=2i0<}

adalh4ck1ng-picoctf@webshell:~$ nano flag.py

Script de python para hacer el revesring a la bandera:

flag = ""

with open("rev_this", "rb") as data:
    for i in range(8):
        flag += chr(data.read(1)[0])
    for i in range(8, 23):
        if (i & 1) == 0:
            flag += chr(data.read(1)[0] - 5)
        else:
            flag += chr(data.read(1)[0] + 2)
    flag+= chr(data.read(1)[0])

print("Flag: {}".format(flag))

adalh4ck1ng-picoctf@webshell:~$ python flag.py 
Flag: picoCTF{r3v3rs37ee84d27}
```

# Bandera
picoCTF{r3v3rs37ee84d27}