## Challenge 🧩

What was I last working on? I remember writing a note to help me remember...

Author: JEFFERY JOHN</br>
Points: 50

Hints:

1. The cat command will let you read a file, but that won't help you here!
2. Read the chapter on Git from the picoPrimer [here](https://primer.picoctf.org/#_git_version_control).
3. When committing a file with git, a message can (and should) be included.

## Solution 🕵️‍♂️

```bash
┌──(user㉿shell)-[~]
└─$ ./extractor.sh drop-in timeMachine
```

Flag is in `commit-meta.txt`

```text
author picoCTF <ops@picoctf.com> 1710018636 +0000
committer picoCTF <ops@picoctf.com> 1710018636 +0000

picoCTF{t1m3m@ch1n3_xxxxxxxx}
```

Tool Used: </br>
[GitTools Extractor](https://github.com/internetwache/GitTools/tree/master/Extractor)

## Flag 🚩

`picoCTF{t1m3m@ch1n3_xxxxxxxx}`
