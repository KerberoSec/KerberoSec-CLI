```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __   __  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   |__`./  | 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   |_ |`7 | 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |__.' |_|
```
There is a git repository at 
`ssh://bandit30-git@bandit.labs.overthewire.org/home/bandit30-git/repo` via the port
*2220*. The password for the user *bandit30-git* is the same as for the user *bandit30*.
From our local machine, not the *OverTheWire* machine, we should clone the repository
and find the password for the next level. [^1]

Solution
----------------------------------------------------------------------------------------
Having solved the three previous levels, we already know how to clone this repository
and proceed as follows.

```bash
GIT_SSH_COMMAND='ssh -o IdentitiesOnly=yes -o PreferredAuthentications=password \
  -o PubkeyAuthentication=no -p 2220' \
git clone ssh://bandit30-git@bandit.labs.overthewire.org:2220/home/bandit30-git/repo
```
Again, we find an empty *README* inside the repository and thus check out the `git log`
and `git branch -a` but can not immediately find anything suspicious. So, we try the
`git tag` command and discover a *secret* tag. Finally, we can use the command `git
show secret` to obtain the password for the next level.

[^1]: https://overthewire.org/wargames/bandit/bandit31.html
