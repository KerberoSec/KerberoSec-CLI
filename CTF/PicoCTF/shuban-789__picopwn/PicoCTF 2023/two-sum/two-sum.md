# PicoCTF 2023 Binary Exploitation: two-sum: 10️0️ points

## two-sum Intro 🚀

```
📁Category: Binary Exploitation
📄Files: flag.c (source)
💻Server Connections: Yes
🏷️Tags: C, make

📃Description: What two positive numbers can make this possible: n1 > n1 + n2 OR n2 > n1 + n2

1️⃣Hint 1: Integer overflow
2️⃣Hint 2: Not necessarily a math problem
```

### Takeaways from hints, description, and tags: 
* We must perform integer overflow in order to obtain the flag
* The condition above with n1 and n2 must be satisfied
* This has less to do with math, and more to do with vulnerabilities
* We must gain control of n1 and n2
* Both n1 and n2 must be positive

## Playing with the Givens 🕹️
We are given source code and an address to a server which is running the source code as a compiled executable. Let's see if there is anything interesting about the source code or the connection. Maybe even give some imputs just to see its reaction.

`flag.c`
```c
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
```

`server`
![image](https://github.com/shuban-789/PicoPwnbooks-BinaryExploitation/assets/67974101/ce64f9e6-bd6d-42ef-a2ad-8b9f31c9d5e7)

### What do we notice? 
* The code in `addIntOvf` must return 0
* Two postive numbers with the negative result and two negative numbers with the positive result will not work

### Diving into Integer Overflow
> An integer overflow occurs when you attempt to store inside an integer variable a value that is larger than the maximum value the variable can hold

What is meant by this is that when two nubers are summed and their sum is larger than the maximum limit placed, an integer overflow occurs.

## Phase 2: Constructing a Plan 🛠️
For this problem, we must create a set of two numbers which satisfy the logic in the code by causing overflow when summed together. However, to do this we must assemble an input which exceeds the integer size limit put on by the system which is `2,147,483,647`. 

### The Plan 
We must make an input which can cause overflow.

So to create this string, the two nubers we can use can be:

```
n1 --> 1073741824
n2 --> 1073741824
```

The sum of `n1` and `n2` exceeds `2,147,483,647` as it is `2,147,483,648`

### The Theory
Now you might be asking right now, where did I get the n1 and n2 from? Well really, its quite simple. I know that the max limit is `2,147,483,647`, so I can just get two numbers whose sums add up to `2,147,483,648`, which is 1 more than `2,147,483,647`. This will cause overflow and return the flag correctly.

## Phase 3: Execution 🧀
First, let's connect to our instance using the format: 
`nc <server>.picoctf.net xxxxx`

Let's enter our input and see what happens.

![image](https://github.com/shuban-789/PicoPwnbooks-BinaryExploitation/assets/67974101/1ad21cc3-7c64-4536-9b36-6fdecdae2446)

