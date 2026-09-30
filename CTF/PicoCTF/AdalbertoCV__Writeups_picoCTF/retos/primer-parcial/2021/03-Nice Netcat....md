# Nice Netcat...

# Descripción
There is a nice program that you can talk to by using this command in a shell: `$ nc mercury.picoctf.net 7449`, but it doesn't speak English...
# Pistas
You can practice using netcat with this picoGym problem: [what's a netcat?](https://play.picoctf.org/practice/challenge/34)
You can practice reading and writing ASCII with this picoGym problem: [Let's Warm Up](https://play.picoctf.org/practice/challenge/22)
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ nc mercury.picoctf.net 7449 
112 
105 
99 
111 
67 
84 
70 
123 
103 
48 
48 
100 
95 
107 
49 
116 
116 
121 
33 
95 
110 
49 
99 
51 
95 
107 
49 
116 
116 
121 
33 
95 
102 
50 
100 
55 
99 
97 
102 
97 
125 
10
```

- Utilizando cyberchef traduje de decimal a Ascii, obteniendo la siguiente bandera:

# Bandera
picoCTF{g00d_k1tty!_n1c3_k1tty!_f2d7cafa}
