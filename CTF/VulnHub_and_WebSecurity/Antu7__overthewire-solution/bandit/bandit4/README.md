# Bandit4

link-> https://overthewire.org/wargames/bandit/bandit4.html

## LEVEL GOAL

The password for the next level is stored in the only human-readable file in the inhere directory. Tip: if your terminal is messed up, try the “reset” command.

Commands you may need to solve this level
ls, cd, cat, file, du, find

## SOLUTION

```
antu@root:~/overthewire-bandit/bandit4$ ssh bandit4@bandit.labs.overthewire.org -p 2220
bandit4@bandit.labs.overthewire.org's password: pIwrPrtPN36QITSp3EQaw936yaFoFgAB
bandit4@bandit:~$ ls
bandit4@bandit:~$ cd inhere
bandit4@bandit:~$ ls
bandit4@bandit:~$ -file00  -file01  -file02  -file03  -file04  -file05  -file06  -file07  -file08  -file09
bandit4@bandit:~$ cat ./-file00
�/`2ғ�%��rL~5�g��� �����
````
Ok, so there is 10 file one of them is human readable.
```
bandit4@bandit:~$ file ./-file*
./-file00: data
./-file01: data
./-file02: data
./-file03: data
./-file04: data
./-file05: data
./-file06: data
./-file07: ASCII text
./-file08: data
./-file09: data
bandit4@bandit:~$ cat ./-file07
koReBOKuIDDepwhWk7jZC0RTdopnAYKh
```

So `koReBOKuIDDepwhWk7jZC0RTdopnAYKh` is our password to get access into next level

## Note
you also can use those to pass these challenges.

1) more
2) less 
3) head
4) grep .
5) nano
6) vim