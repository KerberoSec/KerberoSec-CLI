# transposition-trial

# Descripción
Our data got corrupted on the way here. Luckily, nothing got replaced, but every block of 3 got scrambled around! The first word seems to be three letters long, maybe you can use that to recover the rest of the message.Download the corrupted message [here](https://artifacts.picoctf.net/c/193/message.txt).
# Pistas
Split the message up into blocks of 3 and see how the first block is scrambled
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ cat message.txt 
heTfl g as iicpCTo{7F4NRP051N5_16_35P3X51N3_V9AAB1F8}7adalh4ck1ng-picoctf@webshell:~$ nano flag.py
adalh4ck1ng-picoctf@webshell:~$ cat flag.py 
file = open("message.txt", "r", encoding="UTF-8")
txt = file.read()
n=3
anagrama = [txt[i:i+n] for i in range(0, len(txt), n)]
decode = []
for i in range(len(anagrama)):
        decode.append(anagrama[i][2]+anagrama[i][0]+anagrama[i][1])
        print(''.join(decode))
adalh4ck1ng-picoctf@webshell:~$ python flag.py
The
The fl
The flag 
The flag is 
The flag is pic
The flag is picoCT
The flag is picoCTF{7
The flag is picoCTF{7R4N
The flag is picoCTF{7R4N5P0
The flag is picoCTF{7R4N5P051N
The flag is picoCTF{7R4N5P051N6_1
The flag is picoCTF{7R4N5P051N6_15_3
The flag is picoCTF{7R4N5P051N6_15_3XP3
The flag is picoCTF{7R4N5P051N6_15_3XP3N51
The flag is picoCTF{7R4N5P051N6_15_3XP3N51V3_
The flag is picoCTF{7R4N5P051N6_15_3XP3N51V3_A9A
The flag is picoCTF{7R4N5P051N6_15_3XP3N51V3_A9AFB1
The flag is picoCTF{7R4N5P051N6_15_3XP3N51V3_A9AFB178}
adalh4ck1ng-picoctf@webshell:~$ 
```

# Bandera
picoCTF{7R4N5P051N6_15_3XP3N51V3_A9AFB178}