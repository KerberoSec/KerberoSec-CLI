# Bandit0

link-> https://overthewire.org/wargames/bandit/bandit0.html

## LEVEL GOAL

The password for the next level is stored in a file called readme located in the home directory. Use this password to log into bandit1 using SSH. Whenever you find a password for a level, use SSH (on port 2220) to log into that level and continue the game.

Helpful Reading Material
Secure Shell (SSH) on Wikipedia
How to use SSH on wikiHow

## SOLUTION

```
antu@root:~/overthewire-bandit/bandit0$ ssh bandit0@bandit.labs.overthewire.org -p 2220
bandit0@bandit.labs.overthewire.org's password: bandit0
```
bandit0@bandit:~$ ls
readme
bandit0@bandit:~$ cat readme
boJ9jbbUNNfktd78OOpsqOltutMc3MY1
```  

So `boJ9jbbUNNfktd78OOpsqOltutMc3MY1` is our password to get access into next level

## Note
you also can use those to pass these challenges.

1) more 
2) less 
3) head
4) grep .
5) nano
6) vim