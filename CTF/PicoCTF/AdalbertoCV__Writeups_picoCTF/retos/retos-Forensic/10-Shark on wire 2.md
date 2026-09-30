# Shark on wire 2

# Descripción
We found this [packet capture](https://jupiter.challenges.picoctf.org/static/b506393b6f9d53b94011df000c534759/capture.pcap). Recover the flag that was pilfered from the network.
# Pistas
None
# Solución

```bash
┌──(kali㉿kali)-[~/Descargas]
└─$ ls
capture.pcap
                                                                                                                 
┌──(kali㉿kali)-[~/Descargas]
└─$ tcpdump -nr capture.pcap "udp and port 22" |awk {'print $3'} |cut -d . -f 5 |sed 's/^5//g' |sed 's/^0//g' |tr '\n' ' '
reading from file capture.pcap, link-type EN10MB (Ethernet), snapshot length 262144
00 112 105 99 111 67 84 70 123 112 49 76 76 102 51 114 51 100 95 100 97 116 97 95 118 49 97 95 115 116 51 103 48 125 00     

usando CyberChef para la conversion a ASCII obtenemos la siguiente bandera:

NOTA: No consideramos los 00 antes y despues de la cadena, ya que representan los
streams marcados como start y end del puerto 22

picoCTF{p1LLf3r3d_data_v1a_st3g0}

```

# Bandera
picoCTF{p1LLf3r3d_data_v1a_st3g0}