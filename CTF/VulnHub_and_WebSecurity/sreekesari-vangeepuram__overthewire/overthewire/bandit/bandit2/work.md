Another simple challenge!
![Bandit2](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit2/level2-%3Elevel3.png)

Let's see what we can do:
```
bandit2@bandit:~$ ls
spaces in this filename
bandit2@bandit:~$ ls -al
total 24
drwxr-xr-x  2 root    root    4096 May  7 20:14 .
drwxr-xr-x 41 root    root    4096 May  7 20:14 ..
-rw-r--r--  1 root    root     220 May 15  2017 .bash_logout
-rw-r--r--  1 root    root    3526 May 15  2017 .bashrc
-rw-r--r--  1 root    root     675 May 15  2017 .profile
-rw-r-----  1 bandit3 bandit2   33 May  7 20:14 spaces in this filename
bandit2@bandit:~$ cat spaces\ in\ this\ filename 
UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK
bandit2@bandit:~$ 
```

It's about the raw-strings!

Whenever we use `cat` or some-other-command to work with files & directories,
we simply submit a raw-string. For example;

```
mkdir <path-to-new-directory>
```

or to display the content in a file;
```
cat <path-to-file>
```
where the argument supplied to the command is a string[to be specific it's a raw-string]!

To make our command understand that the given <filename> consists of spaces, we supply a `\` backslash.
For example: `touch test\ file.txt`

Also, to understand this clear, let's read the usage of a command from our shell;
```
$ cat --help
Usage: cat [OPTION]... [FILE]...
Concatenate FILE(s) to standard output.

With no FILE, or when FILE is -, read standard input.

  -A, --show-all           equivalent to -vET
  -b, --number-nonblank    number nonempty output lines, overrides -n
  -e                       equivalent to -vE
  -E, --show-ends          display $ at end of each line
  -n, --number             number all output lines
  -s, --squeeze-blank      suppress repeated empty output lines
  -t                       equivalent to -vT
  -T, --show-tabs          display TAB characters as ^I
  -u                       (ignored)
  -v, --show-nonprinting   use ^ and M- notation, except for LFD and TAB
      --help     display this help and exit
      --version  output version information and exit

Examples:
  cat f - g  Output f's contents, then standard input, then g's contents.
  cat        Copy standard input to standard output.

GNU coreutils online help: <https://www.gnu.org/software/coreutils/>
Full documentation <https://www.gnu.org/software/coreutils/cat>
or available locally via: info '(coreutils) cat invocation'
```
from the above result :`Usage: cat [OPTION]... [FILE]...` we see it says [FILE]...
it means that if we use it as `cat <file-1> <file-2> .. <file-n>`, it gives the output as the contents in the files
supplied as command-line arguments...

or let's see this for another command;
```
$ mkdir --help
Usage: mkdir [OPTION]... DIRECTORY...
Create the DIRECTORY(ies), if they do not already exist.

Mandatory arguments to long options are mandatory for short options too.
  -m, --mode=MODE   set file mode (as in chmod), not a=rwx - umask
  -p, --parents     no error if existing, make parent directories as needed
  -v, --verbose     print a message for each created directory
  -Z                   set SELinux security context of each created directory
                         to the default type
      --context[=CTX]  like -Z, or if CTX is specified then set the SELinux
                         or SMACK security context to CTX
      --help     display this help and exit
      --version  output version information and exit

GNU coreutils online help: <https://www.gnu.org/software/coreutils/>
Full documentation <https://www.gnu.org/software/coreutils/mkdir>
or available locally via: info '(coreutils) mkdir invocation'
```
Here, it's pretty clear that the command understands the space between arguments as seperate entities!

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `UmHadQclWmgdLOKQ3YNgjWxGoRMb5luK` to log into the remote-machine as `bandit3`.

**Warning: Please, first try Level 3 -> Level 4! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
