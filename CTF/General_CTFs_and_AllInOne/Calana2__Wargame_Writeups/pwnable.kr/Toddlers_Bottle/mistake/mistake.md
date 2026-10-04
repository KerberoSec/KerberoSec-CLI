# mistake

![mistake](https://github.com/user-attachments/assets/0d8be812-4e41-454b-ad43-54053298d8eb)

Normalmente `fd=open("/home/mistake/password",O_RDONLY,0400)` deberia terminar con fd conteniendo un numero que seria el descriptor de archivo, sin embargo aqui:
``` C
	int fd;
	if(fd=open("/home/mistake/password",O_RDONLY,0400) < 0){
		printf("can't open password %d\n", fd);
		return 0;
	}
```

El operador `<` tiene mayor precedencia que el operador `=` y como `open(...)` devuelve un numero positivo si tuvo exito termina siendo `fd = n<0; n es positivo = 0`. Entonces fd acaba apuntando a `stdin`, y `password` se leera de la entrada de usuario:
``` c
	if(!(len=read(fd,pw_buf,PW_LEN) > 0)){
```

Entonces esperamos 20 segundos (`sleep(time(0)%20);`) y enviamos un valor de 10 caracteres, digamos `1111111111` y ese valor XOR 1, en este caso `0000000000`:
```
python3
Python 3.13.3 (main, Apr 10 2025, 21:38:51) [GCC 14.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> ord('1') ^ 1
48
>>>
```

```
mistake@ubuntu:~$ ./mistake
do not bruteforce...
1111111111
input password : 0000000000
Password OK
Mommy_the_0perator_priority_confuses_me
```

`Mommy_the_0perator_priority_confuses_me`
