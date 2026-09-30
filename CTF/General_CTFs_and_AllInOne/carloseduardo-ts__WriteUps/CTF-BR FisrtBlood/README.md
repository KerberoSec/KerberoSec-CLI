# Tópicos
* [Reversing](#reversing)  
   * [EasyPeasy](#easypeasy)  
   * [Pie is my favorite](#pie-is-my-favorite)  
   * [WhiteRabbit](#whiterabbit)  
* [Misc](#misc)  
   * [Cat-me](#cat-me)  
   * [Secreto](#secreto)  
   * [Br@1n_Fuck](#br1n_fuck)  
* [#cr4ckth3c0k3](#cr4ckth3c0k3)  
   * [Crypt0_1](#crypt0_1)  
* [Forensics](#forensics)  
   * [Bad Commit](#badcommit)  
* [Programming](#programming)  
   * [Automation](#automation)  
* [Pwn](#pwn)  
   * [Just in time](#just-in-time)  

# Reversing

## EasyPeasy

O desafio nos dava um binário ELF que quando executado pedia uma senha

```bash
$ ./crack1 

Input the password: asdfa
Wrong password, try another

```
Usando o gdb, vemos que ele chama a função strcmp dentro da main
```
$ gdb -q crack1
(...)
   0x00000000000011a5 <+64>:	call   0x1060 <__isoc99_scanf@plt>
   0x00000000000011aa <+69>:	lea    rdx,[rbp-0x14]
   0x00000000000011ae <+73>:	lea    rax,[rbp-0xa]
   0x00000000000011b2 <+77>:	mov    rsi,rdx
   0x00000000000011b5 <+80>:	mov    rdi,rax
   0x00000000000011b8 <+83>:	call   0x1050 <strcmp@plt>
   0x00000000000011bd <+88>:	test   eax,eax
   0x00000000000011bf <+90>:	jne    0x11d4 <main+111>
   0x00000000000011c1 <+92>:	lea    rdi,[rip+0xe55]        # 0x201d
   0x00000000000011c8 <+99>:	mov    eax,0x0
   0x00000000000011cd <+104>:	call   0x1040 <printf@plt>

(...)
```

Saindo do gdb, podemos usar o ltrace, que monitora as chamadas às funções das bibliotecas carregadas e passamos uma senha qualquer
```
$ ltrace ./crack1
printf("\nInput the password: "
)                                                                        = 21
__isoc99_scanf(0x55b7b7e5001a, 0x7ffd01481ff6, 0x7fdacfda2720, 0Input the password: qwerty
)                                       = 1
strcmp("qwerty", "easycrack")                                                                           = 12
printf("Wrong password, try another")                                                                   = 27
putchar(10, 0x55b7b7e5002e, 0x7fdacfda2720, 0Wrong password, try another
)                                                          = 10
+++ exited (status 0) +++

```
Vemos que ele compara a nossa entrada com a string "easycrack", que é a senha correta e a flag ;)

## Pie is my favorite

Aqui temos um binário ELF que quando executado pede um "número mágico", como o enunciado dizia "Who doesn't love pi?", coloquei o valor 3.14
```
$ ./simple
Welcome to the wonderful world of assembly!
Qual o numero magico? 3.14
Essa eh a sua flag!
```
Esse é o valor da flag: 3.14

## WhiteRabbit
Quando executamos o programa, ele nos dá:
```
$ ./hidden_flag
The only way out is inward

...Voce consegue achar a funcao escondida?

```

Como sabemos que temos uma função escondida, o mais lógico é direcionar o fluxo do programa para ela, usando o gdb, podemos ver qual a função escondida e onde ela se encontra

```
gdb-peda$ i functions 
All defined functions:

0x0000000000001000  _init  
0x0000000000001030  puts@plt  
0x0000000000001040  printf@plt  
0x0000000000001050  __cxa_finalize@plt 
0x0000000000001060  _start  
0x0000000000001090  deregister_tm_clones  
0x00000000000010c0  register_tm_clones  
0x0000000000001100  __do_global_dtors_aux  
0x0000000000001140  frame_dummy  
0x0000000000001145  secret  
0x00000000000011d5  main  
0x0000000000001210  __libc_csu_init  
0x0000000000001270  __libc_csu_fini  
0x0000000000001274  _fini  

```
A função escondida é a secret, agora só precisamos encontrar um jeito de chamá-la.  
Colocando um breakpoint na main e executando o programa
```
gdb-peda$ break main
gdb-peda$ r
(...)
Breakpoint 1, 0x00005555555551d9 in main ()

```
Agora pegamos o endereço da função secret com:
```
gdb-peda$ i functions secret
All functions matching regular expression "secret":

Non-debugging symbols:
0x0000555555555145  secret
0x00007ffff7efa6e0  __EI_getsecretkey
0x00007ffff7efa6e0  __GI_getsecretkey
0x00007ffff7efa6e0  getsecretkey@GLIBC_2.2.5
0x00007ffff7f017f0  __EI_key_setsecret
0x00007ffff7f017f0  __GI_key_setsecret
0x00007ffff7f017f0  key_setsecret@GLIBC_2.2.5
0x00007ffff7f01860  __EI_key_secretkey_is_set
0x00007ffff7f01860  __GI_key_secretkey_is_set
0x00007ffff7f01860  key_secretkey_is_set@GLIBC_2.2.5

```
como temos o programa parado e o endereço da função, podemos redirecionar o fluxo do programa setando o valor do registrador ["pc"](https://en.wikipedia.org/wiki/Program_counter) para o endereço em que está secret

```
gdb-peda$ set $pc=0x0000555555555145
gdb-peda$ continue
Continuing.
3sc0nd1d0_3h_M41s_G0st0S0
[Inferior 1 (process 6328) exited normally]
Warning: not running or target is remote

```
E aí está a flag ;)

# Misc

## Cat-me
Esse desafio nos dava um arquivo .tar.gz e quando descompactado ficamos com um arquivo zip com senha
```
$ tar -xzvf cat.me.tar.gz 
$ unzip cat.me.zip 
Archive:  cat.me.zip
[cat.me.zip] cat.me password:
```
Para quebrar a senha desse arquivo, rodamos fcrackzip usando a wordlist rockyou.txt
```
$ fcrackzip -u -D -p rockyou.txt cat.me.zip
PASSWORD FOUND!!!!: pw == rasp~berry12

```

Usando esse password para descompactar o .zip conseguimos um arquivo chamado cat.me e seu conteúdo está codificado em ROT13
Decodificando ela temos:
<p align="center">*[Image: Texto decriptado]*</p>

E a flag é essa hash md5: d6ccd7af26b2841046ff53cd45c5f0bd

## Secreto
Esse desafio nos dava um pdf protegido por senha, para quebrá-la usei o john com wordlist rockyou.txt
```
$ pdf2john secreto.pdf >> hash_secreto.txt
$ john --format=PDF --wordlist=rockyou.txt hash_secreto.txt
Loaded 1 password hash (PDF [MD5 SHA2 RC4/AES 32/64])
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
the01reason08++  (secreto.pdf)
1g 0:00:00:23 DONE (2019-02-16 15:16) 0.04315g/s 140882p/s 140882c/s 140882C/s the12man..the-finest
Use the "--show" option to display all of the cracked passwords reliably
```
Tendo a senha "the01reason08++", podemos abri o pdf e pegar a flag
```
$ pdftotext secreto.pdf -opw the01reason08++
$ cat secreto.txt
GS2W{4716b435ce8ddd6ede25a2926d0c8d42}
```

## Br@1n\_Fuck
Nesse desafio temos um link que leva a um arquivo chamado "coke cam.jpg", dando um file, vemos que não é uma imagem jpeg, mas sim um projeto do GIMP
```
$ file coke\ cam.jpg 
coke cam.jpg: GIMP XCF image data, version 011, 554 x 443, RGB Color
```
Dando um strings nesse arquivo podemos ver um [brainfuck](https://pt.wikipedia.org/wiki/Brainfuck)
```
$ strings coke\ cam.jpg | head -n40
(...)
(text "++++++++++[>+>+++>+++++++>++++++++++<<<<-]>>>>++++.++++++++++++..----.+++.<------------.-----------..>---------------.++++++++++++++.---------.+++++++++++++.-----------------.<-.>++.++++++++..--------.+++++.-------.<.>--.++++++++++++.--.<+.>++.+.-----------.+++++++++.<++++++++++++++++.>-----.-----.<--.------------.>---------------------.++++++++++++++++++.++++++++++++++.<++++++++++++++++.>------.---.+.<++++++++++++++++++.---.-------.>+++++++++++++++++.-.+.-------.<+++.>+.---------------.--.+++++.<---------.>-----------------.<<+++++++++++++++.>>++++++++++++++++++++++++++++++++++.----.<+++++++++++++++++++++++.>---------.++++.<<++++++++++++++++++++++.+++++++.>>++++++++++..<<++++++++.")
(...)
```
Jogando isso em algum decode, temos outro link que leva a um diretório com vários arquivos, olhando esses arquivos percebemos que apenas um é diferente
```
$ cat */*
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
**https://drive.google.com/open?id=1bmItf1Z1IZvHyCcLFSShOZglZVk8peV2**

https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2
https://drive.google.com/open?id=1bmItf1ZI1ZvHyCcLFSShOZglZVk8peV2

```
Esse link leva pra outro arquivo .zip, dessa vez protegido por senha, então usamos o john para encontrar a senha
```
$ file Lol_Whitethecool.zip
Lol_Whitethecool.zip: Zip archive data, at least v?[0x333] to extract

$ zip2john Lol_Whitethecool.zip >> hash
$ john --format=ZIP --wordlist=rockyou.txt hash
Loaded 1 password hash (ZIP, WinZip [PBKDF2-SHA1 8x SSE2])
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
sexylady1        (Lol_Whitethecool.zip)
1g 0:00:00:01 DONE (2019-02-16 15:52) 0.6329g/s 7777p/s 7777c/s 7777C/s 123456..havana
Use the "--show" option to display all of the cracked passwords reliably
Session completed

```
Tendo a senha podemos descompactar o arquivo e ver o seu conteúdo, como eram arquivos .odt eu aproveitei e converti para texto, pois era mais prático e me permitia ver algum conteúdo que eles tivessem mudado de cor  
```
$ odt2text Arte\ de\ Enganar.odt   
$ odt2text Mr. Robot.odt 
```
como conteúdo útil tem algumas hashes e uma mensagem: "envite menssage for this user https://t.me/X41x41", quando eu enviei a mensagem recebi mais algumas hashes, então as separei e encontrei o valor de cada uma  
Hashes de "Arte de enganar.odt":  
c4ca4238a0b923820dcc509a6f75849b  
7b8b965ad4bca0e41ab51de7b31363a1  
b14a7b8059d9c055954c92674ce60032  
800618943025315f869e4e1f09471012  
5058f1af8388633f609cadb75a75dc9d  
4a8a08f09d37b73795649038408b5f33  

Hashes que consegui enviando mensagem:  
8ce4b16b22b58894aa86c421e8759df3  
b14a7b8059d9c055954c92674ce60032  
9dd4e461268c8034f5c8564e155c67a6  
a87ff679a2f3e71d9181a67b7542122c  
c4ca4238a0b923820dcc509a6f75849b  
cbb184dd8e05c9709e5dcaedaa0495cf  

Hashes de "Mr. Robot.odt"  
dfcf28d0734569a6a693bc8194de62bf  
5dbc98dcc983a70728bd082d1a47546e  
61e9c06ea9a85a5088a499df6458d276  
f95b70fdc3088560732a5ac135644506  
9d5ed678fe57bcca610140957afab571  
4b43b0aee35624cd95b910189b3dc231  
518ed29525738cebdac49c49e60ea9d3  

"Decriptando" essas hashes temos a flag   
GS2W{Br@1n_F.ck_x41}  

# #cr4ckth3c0k3

## Crypt0_1
O texto está encodado em ROT47

2w#_4w|e{Jh;4?=H5vh:2(cF*agG~s5@|wx\`2%*z}%}F2s"E3%|a}r_\`|K+\`4;"  -> aHR0cHM6Ly9jcnlwdG9iaW4uY28vODdoMHI1aTYKNTNuaDQtbTM2NC01MzZ1cjQ
Ele nos dá um base64, fazendo o decode:
```
$ echo "aHR0cHM6Ly9jcnlwdG9iaW4uY28vODdoMHI1aTYKNTNuaDQtbTM2NC01MzZ1cjQ=" | base64 -d
https://cryptobin.co/87h0r5i6
53nh4-m364-536ur4
```
Com esse link e essa senha podemos entrar e decriptar e paramos em mensagem com base64
```
$ echo <MENSAGEM> | base64 -d >> output
$ file output
output: PNG image data, 343 x 348, 8-bit/color RGBA, non-interlaced
```
O conteúdo da imagem é um qrcode, usei o zbarimg para pegar a mensagem:
```
$ zbarimg output
QR-Code:qrcode#3321
scanned 1 barcode symbols from 1 images in 0.08 seconds

```
E aí está a flag: qrcode#3321

# Forensics

## Bad Commit
Esse desafio nos dava um arquivo .zip que quando descompactado tinha um arquivo projeto feito em python, esse projeto era versionado com o git, e como o nome do desafio sugeria, eu olhei o histórico de commits
```
$ git log -p
(...)
GS2W{4ch0u-mizeravi!}
(...)
```

# Programming
## Automation
O enunciado nos dava uma operação:  
w + w + w = 30, logo w = 10  
g + g + g = 24, logo g = 8  
w*g/2 = s, logo s = 40  

Dentro do arquivo flag.txt tinha um base64 enorme, provavelmente porque foi codificado várias vezes, reunindo as informações presumo que tenha sido codificado 40 vezes por conta do valor de s encontrado anteriormente, então fiz:
```
$ for i in {1..40}; do b=$(cat flag.txt); echo -n $b | base64 -d > flag.txt ; done
$ cat flag.txt
```

# Pwn
## Just in time
Esse desafio pedia que a gente fizesse conexão com um server: "nc imesec.ime.usp.br 9999", depois de conectado ele pedia um password, percebi que se colocasse
a letra certa ele incrementava o valor que aparecia na resposta
```
$ nc imesec.ime.usp.br 9999
Please input the password: q
false 0.0
$ nc imesec.ime.usp.br 9999
Please input the password: G
false 0.05
```
Então fui tentando uma por uma e quando achava concatenava ao que eu já tinha
```
$ for i in {0..~}; do echo -n "$i "; echo "G$i" | nc imesec.ime.usp.br 9999 ; done
(...)
R Please input the password: false 0.05
S Please input the password: false 0.1
T Please input the password: false 0.05

$ for i in {0..~}; do echo -n "$i "; echo "GS$i" | nc imesec.ime.usp.br 9999 ; done
0 Please input the password: false 0.1
1 Please input the password: false 0.1
2 Please input the password: false 0.15
3 Please input the password: false 0.1

$ for i in {0..~}; do echo -n "$i "; echo "GS2$i" | nc imesec.ime.usp.br 9999 ; done
(...)
U Please input the password: false 0.15
V Please input the password: false 0.15
W Please input the password: false 0.2
```

E fiz isso até encontrar a flag inteira 
GS2W_{P4ssw0RD_T1MinG_4TT4Ck!}

