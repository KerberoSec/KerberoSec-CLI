<p align="center">
  <h1 align="center"><b>Bandit Level 4 → Level 5</b></h1>
</p>

## Level Goal

### The password for the next level is stored in the only human-readable file in the inhere directory. Tip: if your terminal is messed up, try the “reset” command.

## Solution

```shell
ls
```

You will see a folder called inhere, to enter in it run the cd command.

```shell
cd inhere
```
after that you can run ls command.

```shell
ls
```
you can see files with file name from 0 to 9.

to show the file type, you need to run the file command, do this with all files.

```shell
file ./-file07
```
when you arrive in the file07, you going to see it is a diferent type of file(ASCII text).

now you can run the cat command in this file and get the password.
 
```shell
cat ./-file07
```
 
Now you have the password, It's the password to access the next level.
