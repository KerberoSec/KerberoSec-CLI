# bandit10

link-> https://overthewire.org/wargames/bandit/bandit10.html

## LEVEL GOAL

The password for the next level is stored in the file data.txt, which contains base64 encoded data

Commands you may need to solve this level
grep, sort, uniq, strings, base64, tr, tar, gzip, bzip2, xxd

## SOLUTION

```
antu@root:~/overthewire-bandit/bandit10$ ssh bandit10@bandit.labs.overthewire.org -p 2220
bandit10@bandit.labs.overthewire.org's password: truKLdjsbJ5g7yyJ2X2R0o3a5HQJFuLk
bandit10@bandit:~$ ls
data.txt
bandit10@bandit:~$ cat data.txt
VGhlIHBhc3N3b3JkIGlzIElGdWt3S0dzRlc4TU9xM0lSRnFyeEUxaHhUTkViVVBSCg==
```
The password is base64 encoded so we need to decode it.
```
bandit10@bandit:~$ strings data.txt | base64 -d
The password is IFukwKGsFW8MOq3IRFqrxE1hxTNEbUPR
````

So `IFukwKGsFW8MOq3IRFqrxE1hxTNEbUPR` is our password to get access into next level

## Note
you also can use those to pass these challenges.

| Command  | Explanation  
| :------------ |:---------------:|
| grep     | Print lines matching a pattern |
| sort      | Sort lines of text files  |
| uniq | Report or omit repeated lines  |
| strings | Print the strings of printable characters in files |
| base64 | base64 encode/decode data and print to standard output |
| tr | Translate or delete characters  |
| tar | The GNU version of the tar archiving utility |
| gzip |  Compress or expand files  |
| bzip2 | A block-sorting file compressor, v1.0.6 |
| xxd | Make a hexdump or do the reverse |