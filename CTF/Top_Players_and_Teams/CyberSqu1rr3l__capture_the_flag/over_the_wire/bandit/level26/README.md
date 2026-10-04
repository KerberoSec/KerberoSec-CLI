```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___ ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   (_  / __| 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   / / ,_ \ 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |___\___/
```
Logging in to *bandit26* from *bandit25* should be fairly easy. The shell for user
*bandit26* is not `/bin/bash`, but something else. Find out what it is, how it works
and how to break out of it. Note, that if on a Windows system, we should use the
command prompt instead of Powershell to log in via SSH to *bandit25* and *bandit26*.
[^1]

Solution
----------------------------------------------------------------------------------------
In order to find out the shell for the user *bandit26*, we print the contents of the
`/etc/passwd` file and spot the line
`bandit26:x:11026:11026:bandit level 26:/home/bandit26:/usr/bin/showtext` that tells us
that the user *bandit26* uses the login shell `/usr/bin/showtext`. Since this shell is
not known to us, we print it's contents to see what it does.
```bash
#!/bin/sh

export TERM=linux

exec more ~/text.txt
exit 0
```
This tells us, that when we want to login to *bandit26*, the shell sets the environment
variable to *linux* and executes the `more` command displaying `/home/bandit26/text.txt`
after which it quits. Upon logging in to *bandit25*, we have found a SSH key for
*bandit26* in our home directory which we can copy to our computer since connections to
localhost are not allowed on the OTW Bandit server. With this, we can attempt to log in
to the next level with `ssh -i bandit26.sshkey -o IdentitiesOnly=yes -p 2220
bandit26@bandit.labs.overthewire.org` but before we can even react, the connection to
*bandit26* is closed, just after printing the banner. Having the *showtext* login shell
in mind, we assume that more terminated it's printing with the end of the welcome text,
which must be very short, and only consist of the banner. Our approach to get more
information is as follows.

1. **Decrease the terminal** window size to a minimum and start the SSH connection once
   again to avoid `more` being done
   - `stty rows 10 cols 40`
   - `ssh -i bandit26.sshkey -o IdentitiesOnly=yes -p 2220 bandit26@bandit.labs.overthewire.org`
2. **Retrieve vim surface** after getting into the *pager* mode of `more` where it shows
   scroll bars, we press `v` for *visual* mode
3. **Show the password** for the next level with the vim command
   `:e /etc/bandit_pass/bandit26` to show the password file

The resizing of the terminal size before and after the interaction with `more` can also
be automated with the script `spawn_small_shell.sh` for which we want to 
`sudo apt install expect`.

[^1]: https://overthewire.org/wargames/bandit/bandit26.html
