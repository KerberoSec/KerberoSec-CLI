# Desafio EY
A Ernst & Young (EY) é uma empresa que presta serviços em diversas áreas e está entre as quatro maiores empresas de serviços profissionais do mundo. Recentemente ela abriu um processo seletivo para preencher vagas de trainee. A seleção era um CTF com 9 desafios de várias áreas como reverse, forense, web, programação, etc e aqui segue minha resolução dos desafios.

## Tools usadas
* Dirb
* Python
* Fcrackzip
* Ltrace
* Aircrack-ng
* Wireshark

## Lista de Desafios
* **[Misc](#misc)**  
* **[Criptografia](#criptografia)**  
* **[NET](#net)**  
* **[Reverse](#reverse)**  
* **[Coding](#coding)**  
* **[Web](#web)**  

## Misc
### Misc30
O primeiro desafio de misc era um arquivo zip com senha, eu fiz um ataque de força bruta usando fcrackzip e a rockyou como wordlist

```bash
$ fcrackzip -v -u -D -p rockyou.txt misc30.zip
found file 'flag.txt', (size cp/uc     45/    33, flags 9, chk 60c8)

PASSWORD FOUND!!!!: pw == sakura10
```
Depois era só descompactar o arquivo e ver a flag que estava encriptada em base64
```bash
$ base64 -d flag.txt
EY{BRUT3_F0RC3_R0CK_Y0U}
```

### Misc50
Esse era o desafio mais complicadinho, uma pasta com várias imagens que juntas formam algo que leva à flag, pra juntar essas imagens eu fiz um código em python usando a biblioteca pillow e executei ele no diretório onde estavam as imagens
```python
from PIL import Image

new_image = Image.new("RGB", (250, 250))

w, h = 0, 0

for i in range(1, 26):
    for j in range(1, 26):
        im = Image.open(str(i)+"-"+str(j)+".png")
        new_image.paste(im,(w,h))
        w += (im.size)[0]
    h += (im.size)[1]
    w = 0

new_image.save("out.jpg", "JPEG")
```

Uma outra alternativa era usar o programa montage
```bash
$ montage -mode concatenate -title 25x25 $(ls -v *) out.jpg
```

A imagem de saída era um QRcode, era só colocar no leitor qualquer e capturar a flag, eu usei o zbarimg por questões de praticidade
```bash
$ zbarimg out.jpg
QR-Code:EY{1M_G0NN4_N33D_M0R3_GLU3}
scanned 1 barcode symbols from 1 images in 0.06 seconds
```

## Criptografia
O desafio de cripto era um simples texto em base32, só decodificar e pegar a flag

```bash
$ echo "IVMXWVCIGE2V6MJVL43TAMC7GM2DKWL5BI======" | base32 -d
EY{TH15_15_700_345Y}
```

## NET
### NET30
Nesse desafio era dado um arquivo .pcap com um tráfego telnet, eram poucos pacotes então era usar alguma ferramenta como wireshark e ir procurando
<p align="center">*[Image: Foto do pacote com a flag]*</p>

### NET50
O NET50 era um trafego de wifi com um handshake, todo mundo que já tentou hackear o wifi do vizinho sabe o que é um handshake, então é só fazer um bruteforce e ter paciência. Eu usei o aircrack e a rockyou como wordlist, passei meia hora esperando essa senha ser quebrada

```bash
$ aircrack-ng -w rockyou.txt -e "iPhone" HANDSHAKE.cap
Opening HANDSHAKE.cap
Opening HANDSHAKE.capse wait...
Reading packets, please wait...

                                 Aircrack-ng 1.2 rc4

                   [00:00:00] 1 keys tested (40.65 k/s)

                           KEY FOUND! [ giah0409 ]

      Master Key     : 26 DC 60 AB B5 18 BF 3D 68 BD 73 C9 2E E6 AE C5
                       3D 01 0D 84 B8 59 A5 53 93 4A 2D 17 78 3E DC 06

      Transient Key  : 34 D8 BA A0 B8 48 85 96 32 E4 F8 E5 37 6C 29 D5
                       3E 81 12 9E 6D E3 6C EC 86 76 93 57 6E 71 D8 51
                       0A 50 40 52 6F EA EB D8 38 29 33 C9 6F 05 3E 76
                       FB 9B 5F 97 EB D4 6C 19 DA 20 2C D8 94 43 6A 9D

      EAPOL HMAC     : 09 69 C4 99 B6 49 F6 AF 4A 33 78 50 34 CC 58 53
```
Depois era só colocar no padrão que eles pediam
EY{giah0409}

## Reverse
O desafio de reverse era relativamente simples, eles davam um binário ELF
```bash
$ file crackme
crackme: ELF 64-bit LSB shared object, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=faa60b06285e03242e7f957dfe084662eb5f39ad, not stripped
```
e quando executado ele retornava a seguinte mensagem
```bash
$ ./crackme
Found the hidden treasure
```
Usando o comando strings vejo que o programa usa a função strcat, que concatena duas strings, então eu usei o ltrace, que monitora as chamadas de funções das bibliotecas importadas e vi quais eram essas strings
```bash
$ ltrace ./crackme
puts("Found the hidden treasure"Found the hidden treasure
)            = 26
strcat("EY{VjBDM19NNE5K", "NF9EM19SM1Y=}")   = "EY{VjBDM19NNE5KNF9EM19SM1Y=}"
+++ exited (status 0) +++
```
E aí está a flag, porém ela está em base64
```bash
$ echo "VjBDM19NNE5KNF9EM19SM1Y=" | base64 -d
V0C3_M4NJ4_D3_R3V
```
EY{V0C3_M4NJ4_D3_R3V}

## Coding
O desafio de coding necessitava de um pouco de conhecimento sobre socket, era uma espécie de jogo onde você tinha 2 segundos para dizer qual o maior número em uma sequência

```bash
$ nc 158.69.192.239 1337

Ola, seja bem vindo e nao repare na bagunca.
O jogo consiste em responder os desafios corretamente dentro de 3 segundos.
Voce recebera uma sequencia de numeros gerada aleatoriamente e devera retornar o numero mais alto.

Ex.
Defina o maior numero:
5 18 3 84 61
Nesse caso, a resposta correta seria 84.
```

É praticamente impossível pra um humano fazer isso, então eu fiz um script em python que fizesse por mim
```python
import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('158.69.192.239', 1337))

rec = s.recv(1024)
print(rec)

s.send(b'start')
rec = s.recv(1024)

while True:
    rec = s.recv(1024)
    print(rec)
    if b"EY" in rec:
        break;
    resposta = eval(rec)
    maior = str(max(resposta))
    s.send(bytes(maior, 'utf-8'))
```
Depois de fazer isso diversas vezes, ele me retorna a flag:
<p align="center">*[Image: GIF da resolução]*</p>

EY{G0774_G0_F457_M47H}

## Web
### Web15
Os desafios de web não podem ser mostrados com muita clareza porque o ambiente deles não está mais online, mas o web 15 era uma página de login e no código-fonte tinha um javascript que era usado para validar login e senha, era só pegar esses valores, fazer o login e pegar a flag: EY{G0D_BL355_B4D_D3V5}

### Web50
Nesse desafio eles davam uma página de login e pediam pra encontrar o arquivo/diretório de backup, que seria onde as credenciais de login estariam, eu usei o dirb e encontrei o seguinte:
```bash
$ dirb http://158.69.192.239
```
e ele encontrou o diretório _backup, que tinha um arquivo docx contendo as informações, então eu fiz o login e peguei a flag

Obs.: eu não terminei os desafios a tempo, então provavelmente fiquei de fora da seleção, mas é isso aí, que venham mais seleções desse jeito kk

