# How to Defeat a Dragon

Category: Reversing
> Dragonairre,the dragon with the hexadecimal head has attacked the village to take revenge on his last defeat,we need to get the ultimate weapon. Flag Format : SHELLCTF{}.

---

We got an executable asking for a code.

`strings` came up with something interesting but I was not really sure, so I opened the file again in **Ghidra**.

There it was again, splitted up in all those `local_xx` variables. So I tried `SHELLCTF{5348454c4c4354467b31355f523376337235316e675f333473793f7d}` as flag but it would'nt accept. After some thinking and looking at the challenge description again, I figured out how to reveal the flag: 

```
┌──(kali㉿kali)-[~/shellctf/rev-dragon]
└─$ echo 5348454c4c4354467b31355f523376337235316e675f333473793f7d | xxd -r -p
SHELLCTF{15_R3v3r51ng_34sy?} 
```
