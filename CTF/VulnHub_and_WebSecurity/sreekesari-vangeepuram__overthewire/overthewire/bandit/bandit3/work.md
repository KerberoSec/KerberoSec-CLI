Another simple challenge!
![Bandit3](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit3/level3-%3Elevel4.png)

By following the `Level Goal` of Bandit Level 3 → Level 4;
we got the password of user[bandit4] as shown below.

```
bandit3@bandit:~$ ls
inhere
bandit3@bandit:~$ cd inhere/
bandit3@bandit:~/inhere$ ls
bandit3@bandit:~/inhere$ ls -al
total 12
drwxr-xr-x 2 root    root    4096 May  7 20:14 .
drwxr-xr-x 3 root    root    4096 May  7 20:14 ..
-rw-r----- 1 bandit4 bandit3   33 May  7 20:14 .hidden
bandit3@bandit:~/inhere$ cat .hidden 
pIwrPrtPN36QITSp3EQaw936yaFoFgAB
bandit3@bandit:~/inhere$
```

The challenge statement says that:
`The password for the next level is stored in a hidden file in the inhere directory.`, right!

So, in Unix and Unix-like [generally Linux] systems, in a directory we can hide files by specifying a dot `.` infront of its name.

During the days of Unix, all have used this notation to hide files.

In these days, this notation is generally used for configuration (config.) files in your project-directories, to make them look clean!

COOL!

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `pIwrPrtPN36QITSp3EQaw936yaFoFgAB` to log into the remote-machine as `bandit4`.

**Warning: Please, first try Level 4 -> Level 5! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
