# fsb

![img](https://github.com/Calana2/Wargame_Writeups/blob/main/pwnable.kr/Legacy_Challenges/fsb/fsb.png)
```
    Arch:       i386-32-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        No PIE (0x8048000)
    Stripped:   No
```

```C
#include <stdio.h>
#include <alloca.h>
#include <fcntl.h>

unsigned long long key;
char buf[100];
char buf2[100];

int fsb(char** argv, char** envp){
	char* args[]={"/bin/sh", 0};
	int i;

	// clear both argv and envp
	char*** pargv = &argv;
	char*** penvp = &envp;
        char** arg;
        char* c;
/prin        for(arg=argv;*arg;arg++) for(c=*arg; *c;c++) *c='\0';
        for(arg=envp;*arg;arg++) for(c=*arg; *c;c++) *c='\0';
	*pargv=0;
	*penvp=0;

	for(i=0; i<4; i++){
		printf("Give me some format strings(%d)\n", i+1);
		read(0, buf, 100);
		printf(buf);
	}

	printf("Wait a sec...\n");
        sleep(3);

        printf("key : \n");
        read(0, buf2, 100);
        unsigned long long pw = strtoull(buf2, 0, 10);
        if(pw == key){
                printf("Congratz!\n");
                execve(args[0], args, 0);
                return 0;
        }

        printf("Incorrect key \n");
	return 0;
}

int main(int argc, char* argv[], char** envp){

	int fd = open("/dev/urandom", O_RDONLY);
	if( fd==-1 || read(fd, &key, 8) != 8 ){
		printf("Error, tell admin\n");
		return 0;
	}
	close(fd);

	alloca(0x12345 & key);

	fsb(argv, envp); // exploit this format string bug!
	return 0;
}
```

Claro su nombre viene de una vulnerabilidad de cadena formateada que podemos usar en cuatro ocasiones. Necesitamos sobreescribir la variable global `key` para poder ejecutar una shell. 

`alloca(0x12345 & key)` reserva espacio en el stack y desplaza el puntero a key usado en `read` a una posición aleatoria no mayor a la anterior + 0x12345 bytes. Para ganar hay que ejecutar el programa hasta que el puntero a `key` esté lo suficientemente cerca para obtener el índice con respecto al tope dela pila y luego usar la escritura de cadena formateada para sobreescribir `key`.

`Have you ever saw an example of utilizing [n] format character?? :(`
