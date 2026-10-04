# picoCTF

<!-- vim-markdown-toc GFM -->

* [resources](#resources)
* [primer.picoctf](#primerpicoctf)
* [challenges](#challenges)
  * [104](#104)
  * [179](#179)

<!-- vim-markdown-toc -->

# resources

* https://explainshell.com/
* https://gchq.github.io/CyberChef/
* https://play.picoctf.org/practice
* http://docs.pwntools.com/en/stable/
* https://primer.picoctf.com/

# primer.picoctf

```sh
less README.md
vim `which usage` # nice python script.
```

* [Git Tower CLI cheatsheet](https://www.git-tower.com/blog/command-line-cheat-sheet/)
  * `ctrl-u` delete left of cursor
  * `ctrl-k` delete  right  of cursor

```sh
gdb ./a.out
break main
run
disas /r
# or:
gdb -batch -ex 'file ./a.out ' -ex 'disassemble win'
```

# challenges

## 104

```sh
#!/usr/bin/env python3

flag = "灩捯䍔䙻ㄶ形楴獟楮獴㌴摟潦弸彤㔲挶戹㍽"
flag = list(flag)

dec = ""

for i in range(len(flag)):
    a = ord(flag[i]) >> 8
    b = ord(flag[i]) % 128
    print(chr(a), a)
    print(chr(b), b)
    dec += chr(a)
    dec += chr(b)

print(dec)
```

## 179
