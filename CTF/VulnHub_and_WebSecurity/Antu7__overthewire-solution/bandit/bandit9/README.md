# bandit9

link-> https://overthewire.org/wargames/bandit/bandit9.html

## LEVEL GOAL

The password for the next level is stored in the file data.txt in one of the few human-readable strings, preceded by several ‘=’ characters.

Commands you may need to solve this level
grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

## SOLUTION

```
antu@root:~/overthewire-bandit/bandit9$ ssh bandit9@bandit.labs.overthewire.org -p 2220
bandit9@bandit.labs.overthewire.org's password: UsvVyFSfZZWbi6wgC7dAFyFuR6jQQUhR
bandit9@bandit:~$ ls
data.txt
```
The password is hidden in data.txt in one of the few human-readable strings, preceded by several ‘=’ characters. So we can do
```
bandit9@bandit:~$ strings data.txt | grep =
========== the*2i"4
=:G e
========== password
<I=zsGi
Z)========== is
A=|t&E
Zdb=
c^ LAh=3G
*SF=s
&========== truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk
S=A.H&^
````

So `truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk` is our password to get access into next level

## Note
you also can use those to pass these challenges.

| Command  | Explanation  
| :------------ |:---------------:|
| grep     | Print lines matching a pattern |
| sort      | Sort lines of text files  |
| uniq | Report or omit repeated lines  |
| strings | Print the strings of printable characters in files |
| base64 | base64 encode/decode data and print to standard output |
| tr | Translate or delete characters  |
| tar | The GNU version of the tar archiving utility |
| gzip |  Compress or expand files  |
| bzip2 | A block-sorting file compressor, v1.0.6 |
| xxd | Make a hexdump or do the reverse |