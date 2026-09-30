# Blame Game

## Description

Someone's commits seems to be preventing the program from working. Who is it?
You can download the challenge files here:
[challenge.zip](https://artifacts.picoctf.net/c_titan/157/challenge.zip)

## Solution

unzip the file and go to the drop-in directory in your terminal. now, run ```git log``` command to view the commits.

As you see, there are too many commits to look manually. we just wanna check the authors. so let's try this:

```shell
git log | grep Author
```

```shell
Author: picoCTF{@sk_th3_1nt3rn_cfca95b2} <ops@picoctf.com>
```

Congrats! you found the flag!
