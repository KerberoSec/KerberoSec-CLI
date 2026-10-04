# blukat

![img](https://github.com/Calana2/Wargame_Writeups/blob/main/pwnable.kr/Legacy_Challenges/blukat/blukat.jpeg)

```C
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <fcntl.h>
char flag[100];
char password[100];
char* key = "3\rG[S/%\x1c\x1d#0?\rIS\x0f\x1c\x1d\x18;,4\x1b\x00\x1bp;5\x0b\x1b\x08\x45+";
void calc_flag(char* s){
    int i;
    for(i=0; i<strlen(s); i++){
        flag[i] = s[i] ^ key[i];
    }
    printf("%s\n", flag);
}
int main(){
    FILE* fp = fopen("/home/blukat/password", "r");
    fgets(password, 100, fp);
    char buf[100];
    printf("guess the password!\n");
    fgets(buf, 128, stdin);
    if(!strcmp(password, buf)){
        printf("congrats! here is your flag: ");
        calc_flag(password);
    }
    else{
        printf("wrong guess!\n");
        exit(0);
    }
    return 0;
}
```

Este fue un reto de broma en su momento:
```
blukat@pwnable:~$ cat password
cat: password: Permission denied
blukat@pwnable:~$ whoami
blukat
blukat@pwnable:~$ groups blukat
blukat : blukat blukat_pwn
blukat@pwnable:~$ ls -l
total 20
-r-xr-sr-x 1 root blukat_pwn 9144 Aug  8  2018 blukat
-rw-r--r-- 1 root root        645 Aug  8  2018 blukat.c
-rw-r----- 1 root blukat_pwn   33 Jan  6  2017 password
```

La contraseña era efectivamente "cat: password: Permission denied". El usuario `blukat` es parte del grupo `blukat_pwn` y puede abrir password, el contenido es engañoso y hace ver como si fuese un error de lectura. El reto ya no se encuentra disponible pero podemos recuperar la flag recompilando el programa.

`Pl3as_DonT_Miss_youR_GrouP_Perm!!`
