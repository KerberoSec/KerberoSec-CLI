# Packets Primer

# Descripción
Download the packet capture file and use packet analysis software to find the flag.

-   [Download packet capture](https://artifacts.picoctf.net/c/194/network-dump.flag.pcap)
# Pistas
Wireshark, if you can install and use it, is probably the most beginner friendly packet analysis software product.
# Solución

```bash
La solucion de este reto es muy sencilla, solo basta con abrir la captura de paquetes en wireshark, y realizar un seguimiento de el stream 0 del protocolo TCP, entonces ahi encontramos la siguiente bandera:

flag: p i c o C T F { p 4 c k 3 7 _ 5 h 4 r k _ c e c c a a 7 f }

lo unico que debemos hacer es eliminar los espacios sobrantes en la bandera

picoCTF{p4ck37_5h4rk_ceccaa7f}
```

# Bandera
picoCTF{p4ck37_5h4rk_ceccaa7f}