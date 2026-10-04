# memcpy 

![memcpy](https://github.com/user-attachments/assets/2aed7399-67c4-4824-89f0-47e075d2dcc4)

El codigo falla en el quinto caso, especificamente la funcion `fast_memcpy`:
```
memcpy@ubuntu:/tmp$ echo -ne "8\n16\n32\n64\n128\n256\n512\n1024\n2048\n4096\n" | nc 0.0.0.0 9022
Hey, I have a boring assignment for CS class.. :(
The assignment is simple.
-----------------------------------------------------
- What is the best implementation of memcpy?        -
- 1. implement your own slow/fast version of memcpy -
- 2. compare them with various size of data         -
- 3. conclude your experiment and submit report     -
-----------------------------------------------------
This time, just help me out with my experiment and get flag
No fancy hacking, I promise :D
specify the memcpy amount between 8 ~ 16 : specify the memcpy amount between 16 ~ 32 : specify the memcpy amount between 32 ~ 64 : specify the memcpy amount between 64 ~ 128 : specify the memcpy amount between 128 ~ 256 : specify the memcpy amount between 256 ~ 512 : specify the memcpy amount between 512 ~ 1024 : specify the memcpy amount between 1024 ~ 2048 : specify the memcpy amount between 2048 ~ 4096 : specify the memcpy amount between 4096 ~ 8192 : ok, lets run the experiment with your configuration
experiment 1 : memcpy with buffer size 8
ellapsed CPU cycles for slow_memcpy : 3928
ellapsed CPU cycles for fast_memcpy : 572

experiment 2 : memcpy with buffer size 16
ellapsed CPU cycles for slow_memcpy : 668
ellapsed CPU cycles for fast_memcpy : 808

experiment 3 : memcpy with buffer size 32
ellapsed CPU cycles for slow_memcpy : 1124
ellapsed CPU cycles for fast_memcpy : 1304

experiment 4 : memcpy with buffer size 64
ellapsed CPU cycles for slow_memcpy : 2024
ellapsed CPU cycles for fast_memcpy : 308

experiment 5 : memcpy with buffer size 128
ellapsed CPU cycles for slow_memcpy : 3900
```

La funcion `fast_memcpy` usa las instrucciones `movdqa` y `movntps` para cargar 128 bits (16 bytes) desde/hacia un registro XMM y copiar datos desde uno de estos registros en memoria respectivamente.

Pero ambas instrucciones requieren que la pila este alineada a 16 bytes sino causan un "General Protection Fault":

https://mudongliang.github.io/x86/html/file_module_x86_id_183.html

https://mudongliang.github.io/x86/html/file_module_x86_id_197.html

Normalmente `malloc` garantiza una alineacion a 8 bytes, es decir, `esp % 16 == 8`, entonces necesitamos sumar 8 a la cantidad de bytes reservados para que `esp % 16 == 0` y la pila este alineada a 16 bytes.

```
memcpy@ubuntu:~$  echo -ne "8\n16\n32\n72\n136\n264\n520\n1032\n2056\n4096\n" | nc 0.0.0.0 9022
Hey, I have a boring assignment for CS class.. :(
The assignment is simple.
-----------------------------------------------------
- What is the best implementation of memcpy?        -
- 1. implement your own slow/fast version of memcpy -
- 2. compare them with various size of data         -
- 3. conclude your experiment and submit report     -
-----------------------------------------------------
This time, just help me out with my experiment and get flag
No fancy hacking, I promise :D
specify the memcpy amount between 8 ~ 16 : specify the memcpy amount between 16 ~ 32 : specify the memcpy amount between 32 ~ 64 : specify the memcpy amount between 64 ~ 128 : specify the memcpy amount between 128 ~ 256 : specify the memcpy amount between 256 ~ 512 : specify the memcpy amount between 512 ~ 1024 : specify the memcpy amount between 1024 ~ 2048 : specify the memcpy amount between 2048 ~ 4096 : specify the memcpy amount between 4096 ~ 8192 : ok, lets run the experiment with your configuration
experiment 1 : memcpy with buffer size 8
ellapsed CPU cycles for slow_memcpy : 5532
ellapsed CPU cycles for fast_memcpy : 696

experiment 2 : memcpy with buffer size 16
ellapsed CPU cycles for slow_memcpy : 1000
ellapsed CPU cycles for fast_memcpy : 1084

experiment 3 : memcpy with buffer size 32
ellapsed CPU cycles for slow_memcpy : 1112
ellapsed CPU cycles for fast_memcpy : 1248

experiment 4 : memcpy with buffer size 72
ellapsed CPU cycles for slow_memcpy : 2228
ellapsed CPU cycles for fast_memcpy : 544

experiment 5 : memcpy with buffer size 136
ellapsed CPU cycles for slow_memcpy : 4172
ellapsed CPU cycles for fast_memcpy : 580

experiment 6 : memcpy with buffer size 264
ellapsed CPU cycles for slow_memcpy : 7628
ellapsed CPU cycles for fast_memcpy : 424

experiment 7 : memcpy with buffer size 520
ellapsed CPU cycles for slow_memcpy : 14786
ellapsed CPU cycles for fast_memcpy : 568

experiment 8 : memcpy with buffer size 1032
ellapsed CPU cycles for slow_memcpy : 29028
ellapsed CPU cycles for fast_memcpy : 708

experiment 9 : memcpy with buffer size 2056
ellapsed CPU cycles for slow_memcpy : 57764
ellapsed CPU cycles for fast_memcpy : 1344

experiment 10 : memcpy with buffer size 4096
ellapsed CPU cycles for slow_memcpy : 114880
ellapsed CPU cycles for fast_memcpy : 2176

thanks for helping my experiment!
flag : b0thers0m3_m3m0ry_4lignment
```

`b0thers0m3_m3m0ry_4lignment`
