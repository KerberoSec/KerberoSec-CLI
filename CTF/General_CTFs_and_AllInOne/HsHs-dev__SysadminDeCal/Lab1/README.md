# OverTheWire Challenges

First 15 Bandit Wargames from OverTheWire can be a good way to learn linux basics along with dealing with SSH especially if you don't have an access to a remote machine.

## Bandit Level 0

just connect to the game using SSH via command-line as following:

```bash
ssh bandit0@bandit.labs.overthewire.org -p 2220
```

note that the flag `-p` is for specifying the port

with every level you just change the user name (`bandit0`, `bandit1`, `bandit2`.. etc)

## Bandit Level 0 → Level 1

When you login, list the files in the current directory using ls command, you will find readme file, display it using

```bash
cat
```

command and you will see the password for next level.

> password is: ZjLjTmM6FvvyRnrb2rfNWOZOTa6ip5If

## Bandit Level 1 → Level 2

It's quite tricky here because the file name is a dash `-`, and dashes has a special meaning for the shell, so if you want to open the file you just write the full path of it; `/home/banidt1/-` with `cat`.
> password is: 263JGJPfgU6LtdEvgfWU1XP5yac29mFx

## Bandit Level 2 → Level 3

this is an easy one, spaces are special characters, so you just need to tell the shell to skip thim by putting a backslash before each space;

```bash
cat spaces\ in\ this\ filename
```

> password is: MNk8KNH3Usiio41PRUEoDFPqfxLPlSmx

## Bandit Level 3 → Level 4

We can't keep our secrets just out there, so we gonna keep them in hidden files, just `cd` to inhere directory and list the files with the flag `-a` which will list all files including hidden ones
`ls -a`
The file that we looking for is `...Hiding-From-You`

```bash
cat ...Hiding-From-You
```

> password is: 2WmrDFRmJIq3IPxneAaMGhap0pFhF3NJ

## Bandit Level 4 → Level 5

The `file` command is a useful tool to let you know the type of the file, there is 8 files in inhere directory so we not going to search for them individually, instead we will use the `file` command with all the files in the directory using the `*` operator, which means 'all'. However the files starts with a dash, so we will do `--` before the `*` operator which means 'don't consider the follwing as a flag' because all the file names starts with a dash

```bash
file -- *
```

file number 7 is ASCII text, so human readable

> password is: 4oQYVPkxZOOEOO5pTW81FB8j8lxXGUQw

## Bandit Level 5 → Level 6

In this level we just need to match a specific properties of a file using the magic command find, the file that we are looking for:

- human-readable
- 1033 bytes in size
- not executable

when we apply those properties using their flags we get `./maybehere07/.file2`

```bash
find . -type f -size 1033c ! -executable
```

> password is: HWasnPhtq9AVKe0dmk45nxy20cvUa6EG

## Bandit Level 6 → Level 7

Same as previous level, we are searching for a file with certain properies, but their is a ton of `'permission denied'` that clutter the screen, so we will redirect them to garbage by `2>/dev/null` which is like a black hole, and 2 is the code for `stderr` or standard error.

```bash
find / -user bandit7 -group bandit6 -size 33c 2>/dev/null
```

and we will get `/var/lib/dpkg/info/bandit7.password`

> password is: morbNTDkSW6jIlUc0ymOdMaLnOlFVAaj

## Bandit Level 7 → Level 8

This is a typical "searching" operation, the info we have that the password is stored next to the word `millionth` in `data.txt` file, so

```bash
grep "milionth" data.txt
```

> password is: dfwvzFQi4mU0wfNbFOe9RoWskMLg7eEc

## Bandit Level 8 → Level 9

Again searching for a needle in a hay stack, but this time we have a unique line, so we will use `uniq` command! pretty straight forward huh?

Actually no, `uniq` command works better when things are sorted, so we will ask `sort` for help, and pipe its output to uniq. This will not give us the correct answer yet, because the lines are well mixed (and uniq is case-sensitive, so apple != Apple != apPle), so we will ask `uniq` to give the truly unique line with `-u` flag:

```bash
sort data.txt | uniq -u
```

> password is: 4CKMh1JI91bUIZZPXDqGanal4xvAg0JM

## Bandit Level 9 → Level 10

Searching again, but this time in a swamp of a binary file, not human-readable, the info we have is:

in one of the few human-readable strings, preceded by several ‘=’ characters.

I used `grep` but it didn't work well with this binary file, so i used `strings` which *For each file given, GNU strings prints the printable character sequences that are at least 4 characters long*, combine it with grep to filter only the data that has several '=' characters

```bash
strings data.txt | grep "=="
```

> password is: FGUW5ilLVJrxX9kMYMmlN4MgbpfMiqey

## Bandit Level 10 → Level 11

Quite simple soultion, the data.txt contains [base64 encoded data](https://www.freecodecamp.org/news/what-is-base64-encoding/#heading-what-is-base64) so just decode it with base64 decoder

```bash
base64 -d data.txt
```

> password is: dtR173fZKb0RRsDFSGsg2RWnpNVj3qRr

## Bandit Level 11 → Level 12

This puzzel depends on an old encryption method called [ROT13](https://en.wikipedia.org/wiki/ROT13) shifting every letter by 13 positions, so we will reverse everyletter by 13 positions. We will use the `tr` command which takes a range, and the substitution range for it

a b c d e f g h i j k l m n o p q r s t u v w x y z

↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

n o p q r s t u v w x y z a b c d e f g h i j k l m

```bash
cat data.txt | tr 'a-zA-Z' 'n-za-mN-ZA-M'
```

> password is: 7x16WNeHIi5YkIhWsfFIqoognUTyj9Q4

## Bandit Level 12 → Level 13

That was an exhausting one, just start with

```bash
xxd -r data.txt >> data.bin
```

and then it's just a train of decompressing files.

> password is: FO5dwFsc0cbaIiH0h8J2eUks2vdTDwAn

## Bandit Level 13 → Level 14

This level was pure ssh sorcery that I followed [this guide](https://mayadevbe.me/posts/overthewire/bandit/level14/) to understand how to get the password

## Bandit Level 14 → Level 15

This was relatively easy, we will use `netcat` to send the password of current level to the specified machine with the given port:

```bash
nc localhost 30000
```

then give it the password by *catting* `/etc/bandit/bandit14`

> password is: 8xCjnmgoKbGLhHFAZlGE5Tmu4M2tKJQo
