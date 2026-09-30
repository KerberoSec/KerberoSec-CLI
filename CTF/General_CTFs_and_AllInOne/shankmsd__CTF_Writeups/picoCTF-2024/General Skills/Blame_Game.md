## Challenge 🧩

Someone's commits seems to be preventing the program from working. Who is it?

Author: JEFFERY JOHN</br>
Points: 75

Hints:

1. In collaborative projects, many users can make many changes. How can you see the changes within one file?
2. Read the chapter on Git from the picoPrimer [here](https://primer.picoctf.org/#_git_version_control).
3. You can use python3 <file>.py to try running the code, though you won't need to for this challenge.

## Solution 🕵️‍♂️

```shell
┌──(user㉿shell)-[~]
└─$ ./extractor.sh drop-in blameGame
```

```shell
┌──(user㉿shell)-[~]
└─$ grep -r "picoCTF{"
commit-meta.txt:author picoCTF{@sk_th3_1nt3rn_xxxxxxxx} <ops@picoctf.com> 1710018565 +0000
commit-meta.txt:committer picoCTF{@sk_th3_1nt3rn_xxxxxxxx} <ops@picoctf.com> 1710018565 +0000
```

Tool Used: </br>
[GitTools Extractor](https://github.com/internetwache/GitTools/tree/master/Extractor)

## Flag 🚩

`picoCTF{@sk_th3_1nt3rn_xxxxxxxx}`
