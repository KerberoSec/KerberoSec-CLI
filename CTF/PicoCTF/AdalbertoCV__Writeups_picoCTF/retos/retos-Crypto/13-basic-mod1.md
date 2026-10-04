# basic-mod1

# Descripción
We found this weird message being passed around on the servers, we think we have a working decryption scheme.Download the message [here](https://artifacts.picoctf.net/c/127/message.txt).Take each number mod 37 and map it to the following character set: 0-25 is the alphabet (uppercase), 26-35 are the decimal digits, and 36 is an underscore.Wrap your decrypted message in the picoCTF flag format (i.e. `picoCTF{decrypted_message}`)
# Pistas
Do you know what `mod 37` means?

`mod 37` means modulo 37. It gives the remainder of a number after being divided by 37.
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ wget https://artifacts.picoctf.net/c/127/message.txt
--2023-04-27 02:47:57--  https://artifacts.picoctf.net/c/127/message.txt
Resolving artifacts.picoctf.net (artifacts.picoctf.net)... 108.156.172.74, 108.156.172.6, 108.156.172.42, ...
Connecting to artifacts.picoctf.net (artifacts.picoctf.net)|108.156.172.74|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 85 [application/octet-stream]
Saving to: 'message.txt'

message.txt                                     100%[======================================================================================================>]      85  --.-KB/s    in 0s      

2023-04-27 02:47:57 (35.2 MB/s) - 'message.txt' saved [85/85]

adalh4ck1ng-picoctf@webshell:~$ cat message.txt 
128 322 353 235 336 73 198 332 202 285 57 87 262 221 218 405 335 101 256 227 112 140

calculando el mod 37 obtenemos:

17 26 20 13 3 36 13 36 17 26 20 13 3 36 33 35 2 27 34 5 1 29

encontramos las siguientes reglas de encriptacion:
A: 0
B: 1
C: 2
D: 3
E: 4
F: 5
G: 6
H: 7
I: 8
J: 9
K: 10
L: 11
M: 12
N: 13
O: 14
P: 15
Q: 16
R: 17
S: 18
T: 19
U: 20
V: 21
W: 22
X: 23
Y: 24
Z: 25
0: 26
1: 27
2: 28
3: 29
4: 30
5: 31
6: 32
7: 33
8: 34
9: 35
_: 36

Entonces seguimos las reglas y encontramos la siguiente bandera:

flag: picoCTF{R0UND_N_R0UND_79C18FB3}

```

# Bandera
picoCTF{R0UND_N_R0UND_79C18FB3}