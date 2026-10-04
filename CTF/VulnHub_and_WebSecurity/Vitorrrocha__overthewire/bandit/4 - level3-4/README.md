<p align="center">
  <h1 align="center"><b>Bandit Level 3 → Level 4</b></h1>
</p>

## Level Goal

### The password for the next level is stored in a hidden file in the inhere directory.

## Solution

```shell
ls
```

You will see a folder called inhere, to enter in it run the cd command.

```shell
cd inhere
```
To view hidden files, run the ls command with the -a flag which enables viewing of all files in a directory or -al flag for long listing, now you will see a file called .hidden.

```shell
ls -a
```

to show the content in the .hidden file you can run the cat command.

```shell
cat .hidden
```
Now you have the password, It's the password to access the next level.
