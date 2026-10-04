# m00nwalk

# Descripción
Decode this [message](https://jupiter.challenges.picoctf.org/static/d6fcea5e3c6433680ea4f914e24fab61/message.wav) from the moon.
# Pistas
How did pictures from the moon landing get sent back to Earth?

What is the CMU mascot?, that might help select a RX option
# Solución

```bash
Necesitamos instalar la herramientas qsstv y pavucontrol

Creamos una conexion entre ambas aplicaciones con la siguiente linea:

┌──(kali㉿kali)-[~]
└─$ pactl load-module module-null-sink sink_name=virtual-cable
24

Realizamos las siguientes configuraciones:

Desde pavucontrol: verificamos que tengamos seleccionado el dispositivo de salida nula
Desde qsstv: Seleccionamos la interfaz de PulseAudio

Abrimos el mensaje:
┌──(kali㉿kali)-[~]
└─$ paplay -d virtual-cable Descargas/message.wav

Desde qsstv se nos muestra una imagen con la siguiente bandera:

picoCTF{beep_boop_im_in_space}

```

# Bandera
picoCTF{beep_boop_im_in_space}