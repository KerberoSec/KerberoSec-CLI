Interesting level, right!
![Bandit18](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit18/level18-%3Elevel19.png)

If you didn't read the documentation of the SSH protocal cli-tool, read it once again!
We have an option `<tag -t>`, which works as:
```
    -t      Force pseudo-terminal allocation.  This can be used to execute arbitrary screen-based programs on a remote machine,
             which can be very useful, e.g. when implementing menu services.  Multiple -t options force tty allocation, even if ssh
             If the Tunnel directive is unset, it will be set to the default tunnel mode, which is “point-to-point”.  If a different
     changes, ssh warns about this and disables password authentication to prevent server spoofing or man-in-the-middle attacks,
     If an interactive session is requested ssh by default will only request a pseudo-terminal (pty) for interactive sessions when
     the client has one.  The flags -T and -t can be used to override this behaviour.
     If a pseudo-terminal has been allocated the user may use the escape characters noted below.
     If no pseudo-terminal has been allocated, the session is transparent and can be used to reliably transfer binary data.  On most
     When a pseudo-terminal has been requested, ssh supports a number of functions through the use of an escape character.
```

Since we've understood what this options makes, which potentially add functionality to connect the remote-machine...
Now let's modify our script `connect.sh` as:
```
#!/bin/bash

# `connect.sh` connect to the remote machine to complete a certain level of overthewire/bandit
ssh bandit${1}@bandit.labs.overthewire.org -p 2220 ${2}
```

So let's get the password of `bandit19`!
```
$ ./connect.sh 18 "-t cat ~/readme"
This is a OverTheWire game server. More information on http://www.overthewire.org/wargames

bandit18@bandit.labs.overthewire.org's password: 
IueksS7Ubh8G3DCwVzrTd8rAVOwq3M5x
Connection to bandit.labs.overthewire.org closed.
```
Here it is: `IueksS7Ubh8G3DCwVzrTd8rAVOwq3M5x`!

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `IueksS7Ubh8G3DCwVzrTd8rAVOwq3M5x` to log into the remote-machine as `bandit19`.

**Warning: Please, first try Level 19 -> Level 20! Otherwise it's useless to simply cpy-pst the command[s]/password[s].

