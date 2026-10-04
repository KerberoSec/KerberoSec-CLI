### Problem Statement
```txt
Do you know how to move between directories and read files in the shell?
Start the container, `ssh` to it, and then `ls` once connected to begin.
Login via `ssh` as `ctf-player` with the password, `6d448c9c`
```

---

First, we ssh into the given container, with password `6d448c9c`:
```zsh
$ ssh ctf-player@venus.picoctf.net -p 57944
```

When we check the files present in the home directory, we find `1of3.flag.txt` and `instructions-to-2of3.txt`:

```zsh
ctf-player@pico-chall$ ls
1of3.flag.txt  instructions-to-2of3.txt

# First part of the flag:
ctf-player@pico-chall$ cat 1of3.flag.txt
picoCTF{xxsh_
```

<br><br>

To get the second part, we can refer to `instructions-to-2of3.txt`:
```zsh
ctf-player@pico-chall$ cat instructions-to-2of3.txt
Next, go to the root of all things, more succinctly `/`
```

Following the instructions in `instructions-to-2of3.txt`:
```zsh
ctf-player@pico-chall$ cd /
ctf-player@pico-chall$ ls
2of3.flag.txt  bin  boot  dev  etc  home  instructions-to-3of3.txt  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var

# Second part of the flag:
ctf-player@pico-chall$ cat 2of3.flag.txt
0ut_0f_\/\/4t3r_
```

<br><br>

To get the third part, we can refer to `instructions-to-3of3.txt`:
```zsh
ctf-player@pico-chall$ cat instructions-to-3of3.txt
Lastly, ctf-player, go home... more succinctly `~`
```

Following the instructions:
```zsh
ctf-player@pico-chall$ ls
3of3.flag.txt  drop-in

# Third Part of the flag:
ctf-player@pico-chall$ cat 3of3.flag.txt
5190b070}
```

---

#### The Flag
    picoCTF{xxsh_0ut_0f_\/\/4t3r_5190b070}

Link to the challenge: [Magikarp Ground Mission](https://play.picoctf.org/practice/challenge/189)
