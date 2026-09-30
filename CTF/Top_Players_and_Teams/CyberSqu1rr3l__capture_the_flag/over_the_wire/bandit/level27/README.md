```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___ ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   (_  |_  | 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   / / / /  
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |___|_/
```
Good job getting a shell. Now hurry and grab the password for *bandit27*. [^1]

Solution
----------------------------------------------------------------------------------------
Upon logging in to user *bandt26* with the password, we are immediately logged out, 
probably due to the terminal size. So, we modify our terminal window size with
`stty rows 10 cols 40` again and then log in with the password again.

```bash
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no bandit26@bandit.labs.overthewire.org -p 2220
```

After landing in the interactive `more` view of the *bandit26* level, we then press `v`
to enter the visual `vim` mode which allows us to enter commands. In here, we can for
example find out the current shell with `:set shell?`, which is `/usr/bin/showtext` and
then set it to a more useful one with `:set shell=/bin/bash`. Having done, this we can
now enter any known command from the bash shell in vim, e.g. `:!ls -la`. This way, we
can discover a binary `bandit27-do` which runs any command as the *bandit27* user. It is
thus rewarding to print the contents of the password file with
`:!./bandit27-do cat /etc/bandit_pass/bandit27`.

[^1]: https://overthewire.org/wargames/bandit/bandit27.html
