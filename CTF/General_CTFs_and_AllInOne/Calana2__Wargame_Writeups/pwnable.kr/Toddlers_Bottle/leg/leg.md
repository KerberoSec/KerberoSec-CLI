# leg

![leg](https://github.com/user-attachments/assets/d56b7e18-4381-434c-98a0-ab0c44989cd9)

Me gustó mucho este reto, fue mi introducción a ARM

Primero, en esta arquitectura el registro `r0` se utiliza como el valor de retorno de las funciones, asi que debemos rastrear su valor.

#### Key1
``` 
(gdb) disass key1
Dump of assembler code for function key1:
   0x00008cd4 <+0>:	push	{r11}		; (str r11, [sp, #-4]!)
   0x00008cd8 <+4>:	add	r11, sp, #0
   0x00008cdc <+8>:	mov	r3, pc                                  <--- r3 = sp =  0x00008cdc + 8 = 0x00008ce4 
   0x00008ce0 <+12>:	mov	r0, r3                                <--- r0 = r3 =  0x00008ce4 
   0x00008ce4 <+16>:	sub	sp, r11, #0
   0x00008ce8 <+20>:	pop	{r11}		; (ldr r11, [sp], #4)
   0x00008cec <+24>:	bx	lr
```

ARM tiene una "tuberia" de ejecucion con tres etapas para mejorar el rendimiento:
1. Fetch (F): Carga la instruccion actual desde memoria
2. Decode (D): Decodifica la instruccion
3. Execute (E): Ejecuta la instruccion

Por eso cuando se usa `pc` en alguna instruccion en Fetch (F), el procesador esta ejecutando dos instrucciones mas adelante y `pc`
realmente vale `instruccion_en_fetch + 8` en modo ARM O `instruccion_en_fetch + 4` en modo Thumb.

Entonces `key1` retorna `0x00008ce4`

#### Key2
```
(gdb) disass key2
Dump of assembler code for function key2:
   0x00008cf0 <+0>:	push	{r11}		; (str r11, [sp, #-4]!)
   0x00008cf4 <+4>:	add	r11, sp, #0
   0x00008cf8 <+8>:	push	{r6}		; (str r6, [sp, #-4]!)
   0x00008cfc <+12>:	add	r6, pc, #1                      <-- Byte menos significativo de r6 es 1
   0x00008d00 <+16>:	bx	r6                              <-- Cambiando a modo Thumb
   0x00008d04 <+20>:	mov	r3, pc                          <-- r3 = pc + 4 = 0x00008d08
   0x00008d06 <+22>:	adds	r3, #4                        <-- r3 = r3 + 4 = 0x00008d0c
   0x00008d08 <+24>:	push	{r3}
   0x00008d0a <+26>:	pop	{pc}
   0x00008d0c <+28>:	pop	{r6}		; (ldr r6, [sp], #4)
   0x00008d10 <+32>:	mov	r0, r3                           <-- r0 = r3 = 0x00008d0c
   0x00008d14 <+36>:	sub	sp, r11, #0
   0x00008d18 <+40>:	pop	{r11}		; (ldr r11, [sp], #4)
   0x00008d1c <+44>:	bx	lr
```

El procesador ARM cambia a modo Thumb cuando el bit menos significativo (LSB) de un registro usado en una instruccion de bifurcacion (`bx`,`blx`) es 1

Entonces `key2` retorna `0x00008d0c`

#### Key3
```
(gdb) disass key3
Dump of assembler code for function key3:
   0x00008d20 <+0>:	push	{r11}		; (str r11, [sp, #-4]!)
   0x00008d24 <+4>:	add	r11, sp, #0
   0x00008d28 <+8>:	mov	r3, lr                            <-- r3 = lr = 0x00008d80
   0x00008d2c <+12>:	mov	r0, r3                          <-- r0 = r3 = 0x00008d80
   0x00008d30 <+16>:	sub	sp, r11, #0
   0x00008d34 <+20>:	pop	{r11}		; (ldr r11, [sp], #4)
   0x00008d38 <+24>:	bx	lr         
```

El registro `lr` apunta a la direccion de retorno cuando se hace una llamada a una funcion con `bl` por ejemplo:
```
   0x00008d70 <+52>:  bl  0x8cf0 <key2>
   0x00008d74 <+56>:  mov r3, r0         <-- lr
   0x00008d78 <+60>:  add r4, r4, r3
```

Entonces `key3` retorna `0x00008d80`

#### Final
```
 python3
Python 3.13.3 (main, Apr 10 2025, 21:38:51) [GCC 14.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> 0x00008ce4 + 0x00008d0c + 0x00008d80
108400
>>>
```

```
/ $ ./leg
Daddy has very strong arm! : 108400
Congratz!
daddy_has_lot_of_ARM_muscl3
/ $
```

`daddy_has_lot_of_ARM_muscl3`

