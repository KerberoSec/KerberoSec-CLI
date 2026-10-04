# Bandit Level 1

> The password for the next level is stored in a file called **-** located in the home directory

## Login

```shell
ssh bandit1@bandit.labs.overthewire.org -p 2220

ZjLjTmM6FvvyRnrb2rfNWOZOTa6ip5If
```

## Solution

The terminal think the `-` as parameter, so you need to specify it.

```sehll
cat ./-
```

```text
263JGJPfgU6LtdEvgfWU1XP5yac29mFx
```

