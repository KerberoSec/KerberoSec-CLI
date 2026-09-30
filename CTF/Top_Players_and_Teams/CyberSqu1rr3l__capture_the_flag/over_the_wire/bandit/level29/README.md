```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     ___ ___  
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   (_  / _ \ 
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   / /\__ / 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |___|/_/
```
There is a git repository at 
`ssh://bandit28-git@bandit.labs.overthewire.org/home/bandit28-git/repo` via the port
*2220*. The password for the user *bandit28-git* is the same as for the user *bandit28*.
From our local machine, not the *OverTheWire* machine, we need to clone the repository
and find the password for the next level. [^1]

Solution
----------------------------------------------------------------------------------------
Having solved the previous level, we already know how to clone this repository and
proceed as follows.
```bash
GIT_SSH_COMMAND='ssh -o IdentitiesOnly=yes -o PreferredAuthentications=password \
  -o PubkeyAuthentication=no -p 2220' \
git clone ssh://bandit28-git@bandit.labs.overthewire.org:2220/home/bandit28-git/repo
```
In this new repository, we can now discover a *README* file that tells us the redacted
credentials for the user *bandit29*. This brings us to the idea, if there exists a
previous commit, in which the password was not redacted, leading us to investigate the
`git log` command history. And indeed, there are two old commits that are worth to check
out. In the first, initital commit the password was to be added, but in the second
commit, we can show the file difference with the new password in the command
`git show a3437bddd447f2d496731658e86b98cbea9d3c98`.

[^1]: https://overthewire.org/wargames/bandit/bandit29.html
