# Shark on wire 1

# Descripción
We found this [packet capture](https://jupiter.challenges.picoctf.org/static/483e50268fe7e015c49caf51a69063d0/capture.pcap). Recover the flag.
# Pistas
Try using a tool like Wireshark

What are streams?
# Solución

```bash
Una vez tenemos descargado WireShark en el equipo, debemos comenzar a filtrar los
Stream del archivo "capture.pcap"

Debemos ir a analizar -> Seguir -> UDP Stream para mirar los detalles

En este caso comencé a filtrar desde el stream 0, y cuando se llega al stream 6 con la siguiente linea en el filtro de busqueda: udp.stream eq 6

Obtenemos la siguiente bandera: picoCTF{StaT31355_636f6e6e}
```

# Bandera
picoCTF{StaT31355_636f6e6e}
# Referencias
Descargar WireShark: 
https://www.wireshark.org/download.html