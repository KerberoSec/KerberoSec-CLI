```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___ ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   (_  / _ \ 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   / /) _ ( 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |___\___/
```
There is a git repository at
`ssh://bandit27-git@bandit.labs.overthewire.org/home/bandit27-git/repo` via the port
*2220*. The password for the user *bandit27-git* is the same as for the user *bandit27*.
From the local machine, not the *OverTheWire* machine, clone the repository and find
the password for the next level with `git`. [^1]

Solution
----------------------------------------------------------------------------------------
At first, we try to clone the repository as it was provided with the SSH url, but then
we realize that we have to provide the port *2220* as well and since our system defaults
to using stored public keys for other `git` accounts, we have to circumvent this
behaviour to get asked for a password again. This can be done with the `GIT_SSH_COMMAND`
a wrapper script to adapt the SSH command with some further options, i.e. the port
specification and password enforcement, when using git. [^2]
```bash
GIT_SSH_COMMAND='ssh -o IdentitiesOnly=yes -o PreferredAuthentications=password \
  -o PubkeyAuthentication=no -p 2220' \
git clone ssh://bandit27-git@bandit.labs.overthewire.org:2220/home/bandit27-git/repo
```
Having cloned the repository is already the whole deal for the next level since it, we
can find a *README* file with the password for the next level.

[^1]: https://overthewire.org/wargames/bandit/bandit28.html
[^2]: https://git-scm.com/book/en/v2/Git-Internals-Environment-Variables
