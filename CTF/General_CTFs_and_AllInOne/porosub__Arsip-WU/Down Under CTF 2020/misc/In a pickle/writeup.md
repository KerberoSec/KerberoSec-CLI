# In a pickle (100 pts)

### Soal :  
<p align="center">
  <img src="https://i.imgur.com/Hhi2ooA.png" alt="In a pickle"></img>
</p>

File : [data](https://github.com/rifqihz/Arsip-WU/blob/master/Down%20Under%20CTF%202020/misc/In%20a%20pickle/data)

### Pembahasan : 
Isi file data : 
```
(dp0
I1
S'D'
p1
sI2
S'UCTF'
p2
sI3
S'{'
p3
sI4
I112
sI5
I49
sI6
I99
sI7
I107
sI8
I108
sI9
I51
sI10
I95
sI11
I121
sI12
I48
sI13
I117
sI14
I82
sI15
I95
sI16
I109
sI17
I51
sI18
I53
sI19
I53
sI20
I52
sI21
I103
sI22
I51
sI23
S'}'
p4
sI24
S"I know that the intelligence agency's are onto me so now i'm using ways to evade them: I am just glad that you know how to use pickle. Anyway the flag is "
p5
s.
```

Setelah dianalisis, kemungkinan besar angka setelah huruf I mulai dari **I112** sampai **I51** merupakan kode desimal. Jika dirangkum akan menjadi seperti ini : 
```
112 49 99 107 108 51 95 121 48 117 82 95 109 51 53 53 52 103 51
```
Setelah itu tinggal di decode dengan desimal 

<details>
<summary>Tekan untuk melihat flag</summary>
DUCTF{p1ckl3_y0uR_m3554g3}
</details>
