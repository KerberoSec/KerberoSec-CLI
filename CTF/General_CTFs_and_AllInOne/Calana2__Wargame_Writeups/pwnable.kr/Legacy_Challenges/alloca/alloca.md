# alloca

![img](https://github.com/Calana2/Wargame_Writeups/blob/main/pwnable.kr/Legacy_Challenges/alloca/alloca.png)

```C
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

void callme(){
	system("/bin/sh");
}

void clear_newlines(){
	int c;
	do{
		c = getchar();
	}while (c != '\n' && c != EOF);
}

int g_canary;
int check_canary(int canary){
	int result = canary ^ g_canary;
	int canary_after = canary;
	int canary_before = g_canary;
	printf("canary before using buffer : %d\n", canary_before);
	printf("canary after using buffer : %d\n\n", canary_after);
	if(result != 0){
		printf("what the ....??? how did you messed this buffer????\n");
	}
	else{
		printf("I told you so. its trivially easy to prevent BOF :)\n");
		printf("therefore as you can see, it is easy to make secure software\n");
	}
	return result;
}

int size;
char* buffer;
int main(){

	printf("- BOF(buffer overflow) is very easy to prevent. here is how to.\n\n");
	sleep(1);
	printf("   1. allocate the buffer size only as you need it\n");
	printf("   2. know your buffer size and limit the input length\n\n");

	printf("- simple right?. let me show you.\n\n");
	sleep(1);

	printf("- whats the maximum length of your buffer?(byte) : ");
	scanf("%d", &size);
	clear_newlines();

        printf("- give me your random canary number to prove there is no BOF : ");
        scanf("%d", &g_canary);
        clear_newlines();

	printf("- ok lets allocate a buffer of length %d\n\n", size);
	sleep(1);

	buffer = alloca( size + 4 );	// 4 is for canary

	printf("- now, lets put canary at the end of the buffer and get your data\n");
	printf("- don't worry! fgets() securely limits your input after %d bytes :)\n", size);
	printf("- if canary is not changed, we can prove there is no BOF :)\n");
	printf("$ ");

	memcpy(buffer+size, &g_canary, 4);	// canary will detect overflow.
	fgets(buffer, size, stdin);		// there is no way you can exploit this.

	printf("\n");
	printf("- now lets check canary to see if there was overflow\n\n");

	check_canary( *((int*)(buffer+size)) );
	return 0;
}
```

Solo había visto esta función, alloca una vez antes. La vulnerabilidad se basa en que size es un entero con signo.
```
   0x08048745 <+226>:   mov    eax,ds:0x804a048
   0x0804874a <+231>:   add    eax,0x4
   0x0804874d <+234>:   lea    edx,[eax+0xf]
   0x08048750 <+237>:   mov    eax,0x10
   0x08048755 <+242>:   sub    eax,0x1
   0x08048758 <+245>:   add    eax,edx
   0x0804875a <+247>:   mov    ecx,0x10
   0x0804875f <+252>:   mov    edx,0x0
   0x08048764 <+257>:   div    ecx
   0x08048766 <+259>:   imul   eax,eax,0x10
   0x08048769 <+262>:   sub    esp,eax
   0x0804876b <+264>:   mov    eax,esp
   0x0804876d <+266>:   add    eax,0xf
   0x08048770 <+269>:   shr    eax,0x4
   0x08048773 <+272>:   shl    eax,0x4
   0x08048776 <+275>:   mov    ds:0x804a050,eax
```

Donde 0x804a048 es size y 0x804a050 es buffer, esto es:
```
$esp -= (size + 34) / 16 + 16
buffer = $(esp + 15) / 16 * 16;
```

Si `esp` < -34 entonces el stack crece y la dirección de retorno luego del alloca es modificada. De manera empirica se puede hallar que `esp` se puede controlar con el valor de `canary` cuando `size` es -67. Por ejemplo, sea `canary` 0x77777777:
```
pwndbg> pd 1
 ► 0x8048838 <main+469>    ret

   0x8048839               nop
   0x804883b               nop
pwndbg> regs
 EAX  0
 EBX  0xf7f90e14 (_GLOBAL_OFFSET_TABLE_) ◂:  0x233d0c /* '\x0c=#' */
 ECX  0x77777777 ('wwww')
 EDX  0xf7f928e0 (_IO_stdfile_1_lock) ◂:  0
 EDI  0xf7ffcc60 (_rtld_global_ro) ◂:  0
 ESI  0
 EBP  0x77777777 ('wwww')
 ESP  0x77777773 ('swww')
 EIP  0x8048838 (main+469) ◂:  ret
pwndbg>
```

El reto originalmente daba acceso a un entorno. La idea para resolverlo era por medio de un "stack spray", apuntando `esp` a los argumentos, que contienen la dirección de `callme`.

`sorry... I stand corrected.. it is H4RD to make secure software`
