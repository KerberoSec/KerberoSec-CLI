# Tab,Tab,Atack

# Descripción
Using tabcomplete in the Terminal will add years to your life, esp. when dealing with long rambling directory structures and filenames: [Addadshashanammu.zip](https://mercury.picoctf.net/static/72712e82413e78cc8aa8d553ffea42b0/Addadshashanammu.zip)
# Pistas
After `unzip`ing, this problem can be solved with 11 button-presses...(mostly Tab)...
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ unzip Addadshashanammu
  inflating: Addadshashanammu/Almurbalarammi/Ashalmimilkala/Assurnabitashpi/Maelkashishi/Onnissiralis/Ularradallaku/fang-of-haynekhtnamet  
adalh4ck1ng-picoctf@webshell:~$ cd Addadshashanammu/Almurbalarammi/Ashalmimilkala/Assurnabitashpi/Maelkashishi/Onnissiralis/Ularradallaku/
adalh4ck1ng-picoctf@webshell:~/Addadshashanammu/Almurbalarammi/Ashalmimilkala/Assurnabitashpi/Maelkashishi/Onnissiralis/Ularradallaku$ ls -la
total 12
drwxr-xr-x 2 adalh4ck1ng-picoctf adalh4ck1ng-picoctf   35 Mar  5 18:45 .
drwxr-xr-x 3 adalh4ck1ng-picoctf adalh4ck1ng-picoctf   27 Mar 16  2021 ..
-rwxr-xr-x 1 adalh4ck1ng-picoctf adalh4ck1ng-picoctf 8320 Mar 16  2021 fang-of-haynekhtnamet
adalh4ck1ng-picoctf@webshell:~/Addadshashanammu/Almurbalarammi/Ashalmimilkala/Assurnabitashpi/Maelkashishi/Onnissiralis/Ularradallaku$ ./fang-of-haynekhtnamet 
*ZAP!* picoCTF{l3v3l_up!_t4k3_4_r35t!_6f332f10}
```

# Bandera
picoCTF{l3v3l_up!_t4k3_4_r35t!_6f332f10}
