<p align="center">
  <h1 align="center"><b>Bandit Level 0 → Level 1</b></h1>
</p>

## Level Goal

### The password for the next level is stored in a file called readme located in the home directory. Use this password to log into bandit1 using SSH. Whenever you find a password for a level, use SSH (on port 2220) to log into that level and continue the game.

## Solution

```shell
ls
```
ls command going to list content in this directory, now you will see a readme file.

to show the content in the readme file you can run the cat command.

```shell
cat readme
```
Now you have the password, It's the password to access the next level.
