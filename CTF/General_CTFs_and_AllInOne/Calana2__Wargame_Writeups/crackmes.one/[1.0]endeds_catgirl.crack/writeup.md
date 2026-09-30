```
 $ file *
CatgirlCrack:                    ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=2acb7e9cb01285f0997df2b8e3f696a981b7314a, for GNU/Linux 4.4.0, stripped
CatgirlCrack.deps.json:          JSON text data
CatgirlCrack.dll:                PE32 executable for MS Windows 4.00 (console), Intel i386 Mono/.Net assembly, 3 sections
CatgirlCrack.pdb:                Microsoft Roslyn C# debugging symbols version 1.0
CatgirlCrack.runtimeconfig.json: JSON text data
```

Es la primera vez que veo un assembly .NET en formato ELF. En cualquier caso, revisando `CatgirlCrack` con Ghidra me doy cuenta de que no es más que un cargador para `CatgirlCrack.dll` que es el ensamblado .NET que de verdad importa `_CorExeMain` de `mscoree.dll`.

<img width="1305" height="686" alt="2026-09-04-165642_1305x686_scrot" src="https://github.com/user-attachments/assets/f453df02-0d32-4469-8783-59ef50e40df1" />

```C
ulong FUN_00106ac0(undefined8 param_1,undefined 8 *param_2)

{
  ulong uVar1;
  
  uVar1 = FUN_0010d590("libhostfxr.so","hostfxr_main ",param_1,param_2);
  if ((char)uVar1 != '\0') {
    uVar1 = uVar1 & 0xffffffff;
    FUN_001078d0("Found previously loaded library %s  [%s].","libhostfxr.so",*param_2);
  }
  return uVar1;
}
```
Aunque no aparecen en la sección .dynamic del ELF, `libhostfxr.so` (biblioteca de resolución) y `libcoreclr.so` (runtime de .NET) son cargadas dinámicamente usando `dlopen` y `dlsym`.

Si usamos un decompilador .NET como ILSpy observamos una lógica muy simple, acorde a la dificultad del reto:
<img width="1365" height="710" alt="2026-09-04-173503_1365x710_scrot" src="https://github.com/user-attachments/assets/f947a1f9-a52b-4554-9d64-a7a4a9c48c6f" />

<img width="394" height="383" alt="2026-09-05-180603_394x383_scrot" src="https://github.com/user-attachments/assets/f520d12b-7fab-4974-80e9-04f14a2874da" />

*dotnet CatgirlCrack.dll*
