# Bandit5

link-> https://overthewire.org/wargames/bandit/bandit5.html

## LEVEL GOAL

The password for the next level is stored in a file somewhere under the inhere directory and has all of the following properties:

    human-readable
    1033 bytes in size
    not executable

Commands you may need to solve this level
ls, cd, cat, file, du, find

## SOLUTION

```
antu@root:~/overthewire-bandit/bandit5$ ssh bandit5@bandit.labs.overthewire.org -p 2220
bandit5@bandit.labs.overthewire.org's password: koReBOKuIDDepwhWk7jZC0RTdopnAYKh
bandit5@bandit:~$ ls
inhere
bandit5@bandit:~$ cd inhere
bandit5@bandit:/inhere$ ls
bandit5@bandit:/inhere$ maybehere00  maybehere03  maybehere06  maybehere09  maybehere12  maybehere15  maybehere18
maybehere01  maybehere04  maybehere07  maybehere10  maybehere13  maybehere16  maybehere19
maybehere02  maybehere05  maybehere08  maybehere11  maybehere14  maybehere17
bandit5@bandit:/inhere$ cd maybehere00
bandit5@bandit:/inhere/maybehere00$ -file1  -file2  -file3  spaces file1  spaces file2  spaces file3
bandit5@bandit:/inhere/maybehere00$ file ./-file*
./-file1: ASCII text, with very long lines
./-file2: ASCII text, with very long lines
./-file3: PGP\011Secret Key -
bandit5@bandit:/inhere/maybehere00$ cat ./-file1
WRswI03L5YXDJ3oVnNL9akOOZciJTjH8ZzqniOAqdfDHUQnxtwk6QOfrFacgVEvhzlY9d0VI0mo05vQYDCWjVMkR9ZVuXVxOVmeizUr4BQyYKaFjcxYoB5BryUBvd45xN2aPOkErEbKHWNnaYOtnbsHkRCiDeQvKm39mU3RUS1dqU4BaNwNmnNQxVqGFDc40UukmwXiuZkzADnNk5YpEYuheTBuIXRefSalkLQkXs7kyxiD0Q24SqEYwZuZ9RVNEuXM64YrIJa8ZPcLDJtdIymipP1clhFLzTtV1Eh7ZjdC17o7bDZKEiD2iQKkp73UmNypnYgxMhbUOLmDpit2dJHbEsiQNNN7kDe2DSBhiBRW3jxCzqJmkPM8bkxIOl4vrjuuZOsD51JgTL9njPrp6EhSciYh0oA9flulzuo2GC3HM0DDK4GoKlpkvmVsDCtJwGCN8Q7aSVdtEWc2JbF5YuhGouWqKdvH6RTMlpO7ETqj5MJAyMZEtfr4jmXEtM5qzQjQuPdbAdoTVb3asp8bONM7yTLq13DRWhxnQYiJXDHcCqxUTbw8AJ4MvUbMJnIahkswv6NJsuWtaoQGuyHzPGAabmrRQNvKtZbwNBfojltOVNjvGDc1IPDE5OsFsR8uCXNQ5SUqmUhtLZgVftqtDD6Mppcj5gaeRXFrqIblkM5W710qcPlQkDKKHeWBpYcpFGr4kQTt0OIrEyPTV49qEhJuE0H8Hip5B8ALvY40O4RqvJyQvvA4eRIkudoLmqh4DGH3JZHIbsLqgWhUbKthMAjpvFnwaXkoMigDzIOJf5BTCJu7gCJRnA6t4mDUFNVSlMbHqGF2t3GrzpqjY4JHhdTvVQcJc898wZSJiCbUvahWtRQkMB21SdFPSQqe7KKAD31TRWt510ncw81yJHtIZaIVIrsIEmc0DLURkLM6NXYp65aVdSJhlPuLHxqzVpEThHutC7h4Ivq6DV2vJz4GCJxP7JYOGMgBDJRydHrI0B93fPZA8JKQlEkHtAsO61c969JEtDdXvgutTg9
```
Ok getting darker. There is too much file and we don't know where is 1033 bytes human-readable file. We don't have all day to solve this to get access to every  folder & file. So `find` command will help us.
```
bandit5@bandit:/inhere/maybehere00$ cd ..
bandit5@bandit:/inhere$ find -size 1033c
./maybehere07/.file2
bandit5@bandit:/inhere$ cat ./maybehere07/.file2
DXjZPULLxYr17uwoI01bNLQbtFemEgo7
```

So `DXjZPULLxYr17uwoI01bNLQbtFemEgo7` is our password to get access into next level

## Note
you also can use those to pass these challenges.

1) more
2) less 
3) head
4) grep .
5) nano
6) vim