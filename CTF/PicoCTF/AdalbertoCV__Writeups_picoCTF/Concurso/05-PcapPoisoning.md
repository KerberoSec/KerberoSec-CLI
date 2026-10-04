## Objetivo

How about some hide and seek heh?Download this [file](https://artifacts.picoctf.net/c/374/trace.pcap) and find the flag.

## Solución

```
┌──(kali㉿Brayan)-[~/Documents/PicoCTF]
└─$ wget https://artifacts.picoctf.net/c/374/trace.pcap
--2023-03-18 16:34:42--  https://artifacts.picoctf.net/c/374/trace.pcap
Resolving artifacts.picoctf.net (artifacts.picoctf.net)... 18.160.124.108, 18.160.124.38, 18.160.124.34, ...
Connecting to artifacts.picoctf.net (artifacts.picoctf.net)|18.160.124.108|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 106715 (104K) [application/octet-stream]
Saving to: ‘trace.pcap’

trace.pcap                                                 100%[=======================================================================================================================================>] 104.21K  --.-KB/s    in 0.1s    

2023-03-18 16:34:47 (707 KB/s) - ‘trace.pcap’ saved [106715/106715]

                                                                                                                                                                                                                                           
┌──(kali㉿Brayan)-[~/Documents/PicoCTF]
└─$ tcpdump -r trace.pcap   
...
22:26:04.715668 IP 10.253.0.55.ftp-data > 192.168.5.5.987: Flags [S], seq 0:22, win 8192, length 22
22:26:04.715668 IP 10.253.0.55.ftp-data > 192.168.5.5.988: Flags [S], seq 0:22, win 8192, length 22
22:26:04.715668 IP 10.253.0.55.ftp-data > 192.168.5.5.1000: Flags [S], seq 0:22, win 8192, length 22
22:26:04.814300 IP 172.16.0.2.ftp-data > 10.253.0.6.ftp: Flags [S], seq 0:42, win 8192, length 42: FTP: picoCTF{P64P_4N4L7S1S_SU55355FUL_4624a8b6} [|ftp]
22:26:04.713485 IP 10.253.0.55.1337 > 10.253.0.6.ssh: Flags [.], ack 13, win 8192, length 0
22:26:04.715668 IP 10.253.0.55.ftp-data > 192.168.5.5.500: Flags [S], seq 0:22, win 8192, length 22
22:26:04.715668 IP 10.253.0.55.ftp-data > 192.168.5.5.501: Flags [S], seq 0:22, win 8192, length 22
22:26:04.715668 IP 10.253.0.55.ftp-data > 192.168.5.5.502: Flags [S], seq 0:22, win 8192, length 22
22:26:04.715668 IP 10.253.0.55.ftp-data > 192.168.5.5.503: Flags [S], seq 0:22, win 8192, length 22
22:26:04.715668 IP 10.253.0.55.ftp-data > 192.168.5.5.504: Flags [S], seq 0:22, win 8192, length 22
22:26:04.715668 IP 10.253.0.55.ftp-data > 192.168.5.5.505: Flags [S], seq 0:22, win 8192, length 22
22:26:04.715668 IP 10.253.0.55.ftp-data > 192.168.5.5.506: Flags [S], seq 0:22, win 8192, length 22
22:26:04.715668 IP 10.253.0.55.ftp-data > 192.168.5.5.507: Flags [S], seq 0:22, win 8192, length 22
22:26:04.715668 IP 10.253.0.55.ftp-data > 192.168.5.5.508: Flags [S], seq 0:22, win 8192, length 22
22:26:04.715668 IP 10.253.0.55.ftp-data > 192.168.5.5.509: Flags [S], seq 0:22, win 8192, length 22
....

┌──(kali㉿Brayan)-[~/Documents/PicoCTF]
└─$ 

```

### `picoCTF{P64P_4N4L7S1S_SU55355FUL_4624a8b6}`
 
## Notas adicionales

#### Definiciones que entender

El proposito de este reto era buscar la bandera, es decir, estaba muy escondido y el trabajo de uno, era buscarla, asi que una de las manera que hice fue que en Linux, una de las herramientas más populares para trabajar con archivos .pcap es Tcpdump, que es una utilidad de línea de comandos que nos permite capturar y analizar el tráfico de red en tiempo real o desde un archivo de captura, en este caso nos dio varias lineas, lo que se hizo fue analizar cada una de ellas y salio la sorpresa de que una de ella estaba la bandera y fue todo lo que se hizo, asi me lo mostro:
```
22:26:04.814300 IP 172.16.0.2.ftp-data > 10.253.0.6.ftp: Flags [S], seq 0:42, win 8192, length 42: FTP: picoCTF{P64P_4N4L7S1S_SU55355FUL_4624a8b6} [|ftp]
```

#### Comandos linux

- **tcpdump -r**: Comando en el cual nos permitirá leer el archivo y ver los paquetes de red capturados en el archivo

## Referencias

- https://geekflare.com/es/tcpdump-examples/
- https://www.reviversoft.com/es/file-extensions/pcap