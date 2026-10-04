# WebNet1

# Descripción
We found this [packet capture](https://jupiter.challenges.picoctf.org/static/0c84d3636dd088d9fe4efd5d0d869a06/capture.pcap) and [key](https://jupiter.challenges.picoctf.org/static/0c84d3636dd088d9fe4efd5d0d869a06/picopico.key). Recover the flag.
# Pistas
Try using a tool like Wireshark.

How can you decrypt the TLS stream?
# Solución

```bash
Los pasos a seguir para encontrar la bandera de este reto es bastante similar a las del reto WebNet0, con la diferencia que la bandera viene oculta entre mucho texto dentro de los streams.

Debemos realizar la misma configuracion del archivo con la llave en wireshark desde 

preferencias -> protocolos -> TLS -> Editar lista de llaves

al agregar la llave, podremos ver el contenido de los streams TLS

para encontrar facilmente la llave, utilicé una herramienta en linea para filtrar palabras, buscando la palabra "picoCTF", obtuve el siguiente resultado:

Pico-Flag: picoCTF{this.is.not.your.flag.anymore}
Pico-Flag: picoCTF{this.is.not.your.flag.anymore}
......JFIF..............Exif..MM.*.................J...........R.(...........;.........Z................................picoCTF{honey.roasted.peanuts}......ICC_PROFILE.......lcms....mntrRGB XYZ .........).9acspAPPL...................................-lcms...............................................

Flag : picoCTF{honey.roasted.peanuts}
```

# Bandera
"picoCTF{honey.roasted.peanuts}"

# Referencias

herramienta para filtrar lineas online: https://pinetools.com/es/filtrar-lineas