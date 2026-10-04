```
 __  __  __  _ __  _ _____   _   ___ _   _  ___ _     __   __   
|  \/  \|  \| | _\| |_   _| | | | __| \ / || __| |   |__`./  \  
| -< /\ | | ' | v | | | |   | |_| _|`\ V /'| _|| |_   |_ | // | 
|__/_||_|_|\__|__/|_| |_|   |___|___| \_/  |___|___| |__.'\__/
```
There is a git repository at
`ssh://bandit29-git@bandit.labs.overthewire.org/home/bandit29-git/repo` via the port
*2220*. The password for the user *bandit29-git* is the same as for the user *bandit29*.
From our local machine, not the *OverTheWire* machine, we are instructed to clone the
repository and find the password for the next level. [^1]

Solution
----------------------------------------------------------------------------------------
Having solved the two previous levels, we already know how to clone this repository and
proceed as follows.

```bash
GIT_SSH_COMMAND='ssh -o IdentitiesOnly=yes -o PreferredAuthentications=password \
  -o PubkeyAuthentication=no -p 2220' \
git clone ssh://bandit29-git@bandit.labs.overthewire.org:2220/home/bandit29-git/repo
```
Inside, we discover a *README* file, that tells us that there are no passwords in
*production*. However, we suspect the password to be visible in another branch, so we
check the branches with `git branch -a` and discover four suspectible branches to our
interest. We start with the *remotes/origin/dev* branch and move to it
`git checkout remotes/origin/dev`. In it, we can once again read the *README* file,
which contains the password for *bandit30*.

[^1]: https://overthewire.org/wargames/bandit/bandit30.html
