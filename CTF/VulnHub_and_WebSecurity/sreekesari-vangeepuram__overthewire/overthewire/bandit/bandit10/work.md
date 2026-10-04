It seems this is gonna be something interesting!
![Bandit10](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit10/level10-%3Elevel11.png)

Let's see.
```
bandit10@bandit:~$ ls
data.txt
bandit10@bandit:~$ cat data.txt 
VGhlIHBhc3N3b3JkIGlzIElGdWt3S0dzRlc4TU9xM0lSRnFyeEUxaHhUTkViVVBSCg==
bandit10@bandit:~$ base64 -d data.txt 
The password is IFukwKGsFW8MOq3IRFqrxE1hxTNEbUPR
bandit10@bandit:~$
```

Wait. What that's it?
What's `base64` and what's that `-d`?
Let's see, what's that:
```
Usage: base64 [OPTION]... [FILE]
Base64 encode or decode FILE, or standard input, to standard output.

With no FILE, or when FILE is -, read standard input.

Mandatory arguments to long options are mandatory for short options too.
  -d, --decode          decode data
  -i, --ignore-garbage  when decoding, ignore non-alphabet characters
  -w, --wrap=COLS       wrap encoded lines after COLS character (default 76).
                          Use 0 to disable line wrapping

      --help     display this help and exit
      --version  output version information and exit

The data are encoded as described for the base64 alphabet in RFC 4648.
When decoding, the input may contain newlines in addition to the bytes of
the formal base64 alphabet.  Use --ignore-garbage to attempt to recover
from any other non-alphabet bytes in the encoded stream.

GNU coreutils online help: <https://www.gnu.org/software/coreutils/>
Full documentation <https://www.gnu.org/software/coreutils/base64>
or available locally via: info '(coreutils) base64 invocation'
```
So `base64` is a format of data just like `ASCII` or `Unicode`...
So to decode this we use the <tag -d>.

So, hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `IFukwKGsFW8MOq3IRFqrxE1hxTNEbUPR` to log into the remote-machine as `bandit11`.

**Warning: Please, first try Level 11 -> Level 12! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
