# Safe-Opener 2

# Descripción
What can you do with this file?
I forgot the key to my safe but this file is supposed to help me with retrieving the lost key. Can you help me unlock my safe?
# Pistas
Download and try to decompile the file.
# Solución

```bash
Se utilizo un decompilador de java online dado a la siguiente informacion:

picoplayer@challenge:~$ file SafeOpener.class
SafeOpener.class: compiled Java class data, version 52.0 (Java 1.8)

Al decompilar el archivo e inspeccionarlo, en una de las lineas se encuentra la bandera:

picoCTF{SAf3_0p3n3rr_y0u_solv3d_it_5bfbd6f1}

```

# Bandera
picoCTF{SAf3_0p3n3rr_y0u_solv3d_it_5bfbd6f1}

# Enlace de la herramienta

http://www.javadecompilers.com/