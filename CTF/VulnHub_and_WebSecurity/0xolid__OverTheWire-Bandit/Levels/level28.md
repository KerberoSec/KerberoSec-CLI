# Bandit Level 28

> There is a git repository at `ssh://bandit28-git@bandit.labs.overthewire.org/home/bandit28-git/repo` via the port `2220`. The password for the user `bandit28-git` is the same as for the user `bandit28`.

## Login

```shell
ssh bandit28@bandit.labs.overthewire.org -p 2220

Yz9IpL0sBcCeuG7m9uQFt8ZNpS4HZRcN
```

## Solution

In your machine you have to clone the repo on port 2220 and the password is the same.

```shell
git clone ssh://bandit28-git@bandit.labs.overthewire.org:2220/home/bandit28-git/repo
```

```shell
cd repo
```

```shell
cat README.md
```

```text
# Bandit Notes
Some notes for level29 of bandit.

## credentials

- username: bandit29
- password: xxxxxxxxxx
```

The password is hidden so let's check the logs.

```shell
git log
```

```text
commit 00daa614aac60bd2981c381484191eb7bc4dcfd9 (HEAD -> master, origin/master, origin/HEAD)
Author: Morla Porla <morla@overthewire.org>
Date:   Fri Apr 3 15:17:37 2026 +0000

    fix info leak

commit a1487fd098591dfa210ede70ba60f7093f47d20d
Author: Morla Porla <morla@overthewire.org>
Date:   Fri Apr 3 15:17:37 2026 +0000

    add missing data

commit eaef76e40b22863d8085130677ae53e13ae1a9c6
Author: Ben Dover <noone@overthewire.org>
Date:   Fri Apr 3 15:17:37 2026 +0000

    initial commit of README.md
```

Let's check `fix info leak` log.

```shell
git show a1487fd098591dfa210ede70ba60f7093f47d20d
```

```text
4pT1t5DENaYuqnqvadYs1oE4QLCdjmJ7
```

