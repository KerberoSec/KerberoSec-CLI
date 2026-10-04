El programa usa `isDebuggerPresent` de `kernel32.dll` para detectar si se esta usando un debugger.

<img width="597" height="269" alt="2025-08-07-164541_597x269_scrot" src="https://github.com/user-attachments/assets/e1a322eb-22ae-4013-bf9e-2fcbb1b0ee7f" />

La entrada de usuario se compara con *_Z6passwdB5cxx11* que no esta inicializado.

Podemos encontrar el valor en base64 que se usa para inicializarlo en *__static_initialization_and_destruction_0*.

<img width="569" height="309" alt="2025-08-07-171252_569x309_scrot" src="https://github.com/user-attachments/assets/60453274-b248-4064-8b60-bff187a2f0b7" />

Desafortunadamente no pude ejecutar el binario en mi VM. Pero esa es la contraseña.

```
$ echo "VmFsaWRQYXNzd29yZA==" | base64 -d
ValidPassword
```
