This level is also quite easy!
![Bandit1](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit1/level1-%3Elevel2.png)

By following the `Level Goal` of Bandit Level 1 → Level 2;
we got the password of user[bandit2] as shown below.

```
bandit1@bandit:~$ ls
-
bandit1@bandit:~$ cat -
^C
bandit1@bandit:~$ cat ./-
CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9
bandit1@bandit:~$
```
The only tricky part is that the command `cat -` takes the standard-input[stdin] from the user (in this case YOU) and returns the stdin as standard-output[stdout].
Also our filename is `-`.

Using the notations of relative-path where `.` or `./` is the current-working-directory and `..` or `../` is the parent-directory of the current-working directory, we can complete this challenge using the command `cat` as `cat ./-`.

COOL, right! 

Now, let's use the password `CV1DtqXWVFXTvM2F0k09SHz0YwRINYA9` to log into the remote-machine as `bandit2`.

**Warning: Please, first try Level 2 -> Level 3! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
